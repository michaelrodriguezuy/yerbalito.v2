import { act, useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";

import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import * as Yup from "yup";
import axios from "axios";
import {
  TextField,
  MenuItem,
  Button,
  InputLabel,
  Grid,
  Checkbox,
  FormControlLabel,
  Select,
  FormControl,
  Chip,
} from "@mui/material";

import dayjs from 'dayjs';


const PlayerForm = ({ handleClose, setIsChange, playerSelected }) => {
  const [codeExistsWarning, setCodeExistsWarning] = useState(false);
  const [categories, setCategories] = useState([]);
  const [jugadores, setJugadores] = useState([]);
  

  const validationSchema = Yup.object().shape({
    nombre: Yup.string().required("El nombre es obligatorio"),
    apellido: Yup.string().required("El apellido es obligatorio"),
    cedula: Yup.string()
      .transform((value) => value.replace(/\s+/g, ""))
      .required("La cedula es obligatoria"),
    sexo: Yup.string().required("El sexo es obligatorio"),
    fechaNacimiento: Yup.date()
      .required("La fecha de nacimiento es obligatoria")
      .nullable(),
    contacto: Yup.string().required("El contacto es obligatorio"),
  });

  const DatePickerField = ({ field, form, label, ...other }) => {
    const { name } = field;
    const currentError = form.errors[name];
    const isTouched = form.touched[name];

    const handleChange = (date) => {
      form.setFieldValue(name, date);
      form.setFieldTouched(name, true); 
    };

    return (
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label={label}
          value={field.value || null}
          onChange={handleChange}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              error={Boolean(isTouched && currentError)}
              helperText={isTouched && currentError ? currentError : ""}
            />
          )}
          
          {...other}
        />
      </LocalizationProvider>
    );
  };

  useEffect(() => {
    fetchCategory();
    fetchJugadores();
  }, []);

  const checkCiExists = async (ci) => {
    try {
      const response = await fetch(`http://localhost:3001/squad/search/${ci}`);
      const data = await response.json();

      if (response.ok) {
        // data.exists será true si el jugador existe, false si no
        return data.exists;
      } else {
        console.error(
          "Error al verificar la existencia del jugador:",
          data.error
        );
        return false;
      }
    } catch (error) {
      console.error("Error al realizar la solicitud:", error);
      return false;
    }
  };

  const fetchCategory = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/categories`);
      // console.log("fetchCategory response:", response.data.categoria.nombre_categoria);
      //  response.data.categoria.nombre_categoria;
      setCategories(response.data.categorias);
    } catch (error) {
      console.error("Error fetching category: ", error);
      throw error;
    }
  };

  const fetchJugadores = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/squad`);
      setJugadores(response.data.squads);
    } catch (error) {
      console.error("Error fetching players: ", error);
      throw error;
    }
  };

  const handleSubmit = async (values, actions) => {
    // console.log("values", values);

    if (!values.fechaNacimiento) {
      actions.setFieldError('fechaNacimiento', 'La fecha de nacimiento es obligatoria');
      actions.setSubmitting(false);
      return;
    }

    const formattedFechaNacimiento = dayjs(values.fechaNacimiento).format('YYYY-MM-DD');
    const formattedFechaIngreso = dayjs(values.fechaIngreso).format('YYYY-MM-DD');

    const selectedCategory = categories.find(
      (category) => category.nombre_categoria === values.categoria
    );
    const categoriaId = selectedCategory ? selectedCategory.idcategoria : "";

    const formData = new FormData();

    formData.append("nombre", values.nombre);

    formData.append("apellido", values.apellido);
    formData.append("cedula", values.cedula);
    formData.append("fecha_nacimiento", formattedFechaNacimiento);
    formData.append("sexo", values.sexo);
    formData.append("numeroClub", values.numJugador);

    formData.append("fecha_ingreso", formattedFechaIngreso);
    formData.append("idcategoria", categoriaId);
    formData.append("ciudadania", values.ciudadania);
    formData.append("padre", values.padre);
    formData.append("madre", values.madre);
    formData.append("contacto", values.contacto);
    // formData.append("hermano", values.hermano);
    // formData.append("hermanos", values.hermanos);
    formData.append("observacionesJugador", values.observaciones);

    if (values.hasSiblings && values.selectedSiblings.length > 0) {
      formData.append("hermanos", values.selectedSiblings.join(","));
    }

    if (values.imagen && values.imagen instanceof File) {
      formData.append("imagen", values.imagen);
    }

    try {
      if (playerSelected) {
        await axios.put(
          `http://localhost:3001/squad/${playerSelected.id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        
        for (let [key, value] of formData.entries()) {
          console.log(`${key}: ${value}`);
        }

        await axios.post("http://localhost:3001/squad", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        // console.log("values", formData);
      }
      setIsChange(true);
      handleClose();
    } catch (error) {
      console.error("Error saving player: ", error);
    } finally {
      actions.setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!categories.length || !playerSelected) return;

    const fechaNacimiento = playerSelected.fechaNacimiento
      ? new Date(playerSelected.fechaNacimiento)
      : null;

    const yearOfBirth = fechaNacimiento ? fechaNacimiento.getFullYear() : null;
    const selectedSex = playerSelected.sexo;

    if (yearOfBirth && selectedSex) {
      const matchedCategory = categories.find(
        (category) =>
          category.nombre_categoria.includes(yearOfBirth.toString()) &&
          category.nombre_categoria.includes(selectedSex)
      );

      if (matchedCategory) {
        playerSelected.categoria = matchedCategory.nombre_categoria;
      }
    }
  }, [categories, playerSelected]);

  return (
    <div>
      <Formik
        initialValues={{
          nombre: playerSelected?.nombre || "",
          apellido: playerSelected?.apellido || "",
          cedula: playerSelected?.cedula || "",
          fechaNacimiento: playerSelected?.fecha_nacimiento || "",
          sexo: playerSelected?.sexo || "",
          numJugador: playerSelected?.numeroClub || "",
          imagen: playerSelected?.imagen || "",
          fechaIngreso: playerSelected?.fecha_ingreso || "",
          categoria: playerSelected?.idcategoria || "",
          ciudadania: playerSelected?.ciudadania || "",
          padre: playerSelected?.padre || "",
          madre: playerSelected?.madre || "",
          contacto: playerSelected?.contacto || "",

          hermanos: playerSelected?.hermanos || "",

          observaciones: playerSelected?.observacionesJugador || "",

          hasSiblings: playerSelected?.hermanos ? true : false,
          selectedSiblings: playerSelected?.selectedSiblings || [],
          selectedSiblingCategory:
            playerSelected?.selectedSiblingCategory || "",
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue, values, touched, errors }) => {
          // console.log('Formik touched:', touched);
          // console.log('Formik errors:', errors);

          useEffect(() => {
            if (categories.length === 0) return;

            const determineCategory = () => {
              const fechaNacimiento = values.fechaNacimiento
                ? new Date(values.fechaNacimiento)
                : null;

              const yearOfBirth = fechaNacimiento
                ? fechaNacimiento.getFullYear()
                : null;

              const selectedSex = values.sexo;

              if (yearOfBirth && selectedSex) {
                const matchedCategory = categories.find(
                  (category) =>
                    category.nombre_categoria.includes(
                      yearOfBirth.toString()
                    ) && category.sexo === selectedSex
                );

                if (matchedCategory) {
                  setFieldValue("categoria", matchedCategory.nombre_categoria);
                }
              }
            };

            determineCategory();
          }, [values.fechaNacimiento, values.sexo, categories, setFieldValue]);

          return (
            <Form
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "5px",
              }}
              // onChange={async (e) => {
              //   if (e.target.name === "cedula") {
              //     const ciExists = await checkCiExists(e.target.value);
              //     setCodeExistsWarning(ciExists);
              //   }
              // }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    variant="outlined"
                    label="Nombre"
                    name="nombre"
                    fullWidth
                    value={values.nombre}
                    onChange={(e) => setFieldValue("nombre", e.target.value)}
                    error={<ErrorMessage name="nombre" />}
                    helperText={<ErrorMessage name="nombre" />}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    variant="outlined"
                    label="Apellido"
                    name="apellido"
                    fullWidth
                    value={values.apellido}
                    onChange={(e) => setFieldValue("apellido", e.target.value)}
                    error={<ErrorMessage name="apellido" />}
                    helperText={<ErrorMessage name="apellido" />}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    variant="outlined"
                    label="Cedula"
                    name="cedula"
                    onChange={async (e) => {
                      const value = e.target.value.replace(/\s+/g, "");
                      setFieldValue("cedula", value);
                      const ciExists = await checkCiExists(value);
                      setCodeExistsWarning(ciExists);
                    }}
                    value={values.cedula}
                    error={Boolean(
                      codeExistsWarning || <ErrorMessage name="cedula" />
                    )}
                    helperText={
                      codeExistsWarning ? (
                        "El numero de CI ya existe"
                      ) : (
                        <ErrorMessage name="cedula" />
                      )
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    variant="outlined"
                    label="Sexo"
                    name="sexo"
                    select
                    value={values.sexo}
                    onChange={(e) => setFieldValue("sexo", e.target.value)}
                    fullWidth
                    error={<ErrorMessage name="sexo" />}
                    helperText={<ErrorMessage name="sexo" />}
                  >
                    <MenuItem value="M">Masculino</MenuItem>
                    <MenuItem value="F">Femenino</MenuItem>
                  </Field>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    name="fechaNacimiento"
                    component={DatePickerField}
                    placeholder="Fecha de nacimiento"
                    label="Fecha de nacimiento"
                    fullWidth
                  />
  <ErrorMessage name="fechaNacimiento" component="div" />
  </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    name="numJugador"
                    as={TextField}
                    variant="outlined"
                    label="Número de jugador fichado"
                    value={values.numJugador}
                    onChange={(e) =>
                      setFieldValue("numJugador", e.target.value)
                    }
                    fullWidth
                  />
                  <ErrorMessage name="numJugador" component="div" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    variant="outlined"
                    label="Ciudadania"
                    name="ciudadania"
                    value={values.ciudadania}
                    onChange={(e) =>
                      setFieldValue("ciudadania", e.target.value)
                    }
                    fullWidth
                  />
                  <ErrorMessage name="ciudadania" component="div" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    variant="outlined"
                    label="Categoría"
                    name="categoria"
                    select
                    value={values.categoria}
                    onChange={(e) => setFieldValue("categoria", e.target.value)}
                    fullWidth
                  >
                    {categories &&
                      categories.map((category) => (
                        <MenuItem
                          key={category.idcategoria}
                          value={category.nombre_categoria}
                        >
                          {category.nombre_categoria}
                        </MenuItem>
                      ))}
                  </Field>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    name="fechaIngreso"
                    component={DatePickerField}
                    placeholder="Fecha de ingreso al club"
                    label="Fecha de ingreso al club"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InputLabel shrink htmlFor="foto-upload">
                    Foto
                  </InputLabel>
                  <Field
                    name="imagen"
                    render={({ field }) => (
                      <TextField
                        id="foto-upload"
                        variant="outlined"
                        type="file"
                        inputProps={{ accept: "image/*" }}
                        onChange={(e) =>
                          setFieldValue(field.name, e.target.files[0])
                        }
                        fullWidth
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    variant="outlined"
                    label="Padre"
                    name="padre"
                    value={values.padre}
                    onChange={(e) => setFieldValue("padre", e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    variant="outlined"
                    label="Madre"
                    name="madre"
                    value={values.madre}
                    onChange={(e) => setFieldValue("madre", e.target.value)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    variant="outlined"
                    label="Contacto"
                    name="contacto"
                    value={values.contacto}
                    onChange={(e) => setFieldValue("contacto", e.target.value)}
                    fullWidth
                    error={<ErrorMessage name="contacto" />}
                    helperText={<ErrorMessage name="contacto" />}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    variant="outlined"
                    label="Observaciones"
                    name="observaciones"
                    multiline
                    rows={4}
                    fullWidth
                    value={values.observaciones}
                    onChange={(e) =>
                      setFieldValue("observaciones", e.target.value)
                    }
                  />
                </Grid>
              </Grid>

              <Grid
                container
                spacing={1}
                style={{
                  marginTop: "10px",
                  borderTop: "1px solid #ccc",
                  paddingTop: "10px",
                }}
              >
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Field
                        name="hasSiblings"
                        type="checkbox"
                        as={Checkbox}
                        color="primary"
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          setFieldValue("hasSiblings", isChecked);
                          if (!isChecked) {
                            setFieldValue("selectedSiblingCategory", "");
                            setFieldValue("selectedSiblings", []);
                          }
                        }}
                      />
                    }
                    label="¿Tiene hermanos en el club?"
                  />
                </Grid>

                {values.hasSiblings && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel id="category-label">
                          Categoría del Hermano
                        </InputLabel>
                        <Field
                          name="selectedSiblingCategory"
                          as={Select}
                          labelId="category-label"
                          value={values.selectedSiblingCategory}
                          onChange={(e) => {
                            setFieldValue(
                              "selectedSiblingCategory",
                              e.target.value
                            );
                            // setFieldValue("selectedSiblings", []);
                          }}
                          error={
                            values.selectedSiblings.length === 0 &&
                            values.hasSiblings
                          }
                        >
                          {categories.map((category) => (
                            <MenuItem
                              key={category.idcategoria}
                              value={category.idcategoria}
                            >
                              {category.nombre_categoria}
                            </MenuItem>
                          ))}
                        </Field>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel id="siblings-label">Hermanos</InputLabel>
                        <Field
                          name="selectedSiblings"
                          as={Select}
                          labelId="siblings-label"
                          multiple
                          value={values.selectedSiblings}
                          onChange={(e) =>
                            setFieldValue("selectedSiblings", e.target.value)
                          }
                          renderValue={(selected) => (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                maxHeight: "80px",
                                overflowY: "auto",
                              }}
                            >
                              {selected.map((id) => {
                                const sibling = jugadores.find(
                                  (jugador) => jugador.idjugador === id
                                );
                                return (
                                  <Chip
                                    key={id}
                                    label={`${sibling.apellido}, ${sibling.nombre}`}
                                    onDelete={() => {
                                      const newSelected = selected.filter(
                                        (s) => s !== id
                                      );
                                      setFieldValue(
                                        "selectedSiblings",
                                        newSelected
                                      );
                                    }}
                                    style={{ marginBottom: "5px" }}
                                  />
                                );
                              })}
                            </div>
                          )}
                          error={
                            values.selectedSiblings.length === 0 &&
                            values.hasSiblings
                          }
                        >
                          {jugadores
                            .filter(
                              (jugador) =>
                                jugador.idcategoria ===
                                values.selectedSiblingCategory
                            )
                            .sort((a, b) =>
                              a.apellido.localeCompare(b.apellido)
                            )
                            .map((jugador) => (
                              <MenuItem
                                key={jugador.idjugador}
                                value={jugador.idjugador}
                              >
                                {jugador.apellido}, {jugador.nombre}
                              </MenuItem>
                            ))}
                        </Field>
                      </FormControl>
                    </Grid>
                  </>
                )}
              </Grid>

              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={isSubmitting}
                style={{ alignSelf: "flex-end" }}
              >
                {playerSelected ? "Actualizar" : "Agregar"}
              </Button>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
};

export default PlayerForm;
