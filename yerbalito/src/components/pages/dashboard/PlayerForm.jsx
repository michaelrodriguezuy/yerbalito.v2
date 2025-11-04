import { API_ENDPOINTS } from "../../../config/api";
import { act, useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import "./PlayerForm.css";

import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { es } from "date-fns/locale";

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
  Box,
  Typography,
  IconButton,
  Paper,
} from "@mui/material";

import dayjs from "dayjs";
import { calculateCedulaVerifier } from "../../../utils/utils";
import Swal from "sweetalert2";

const PlayerForm = ({ handleClose, setIsChange, playerSelected }) => {
  const [codeExistsWarning, setCodeExistsWarning] = useState(false);
  const [categories, setCategories] = useState([]);
  const [jugadores, setJugadores] = useState([]);

  // Estilos comunes para TextField (alineados con CategoryForm)
  const textFieldStyles = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#ffffff",
      "& input": {
        color: "#000000 !important",
        fontSize: "0.80rem",
        padding: "4px 8px",
      },
      "& textarea": {
        color: "#000000 !important",
        fontSize: "0.80rem",
        padding: "4px 8px",
      },
    },
    "& .MuiSelect-select": {
      color: "#000000 !important",
      backgroundColor: "#ffffff",
      fontSize: "0.80rem",
      padding: "4px 8px",
    },
    "& .MuiInputLabel-root, & .MuiFormLabel-root": {
      color: "#222222 !important",
      fontSize: "0.85rem",
      fontWeight: 600,
    },
    "& .MuiInputLabel-root.Mui-focused, & .MuiFormLabel-root.Mui-focused": {
      color: "#222222 !important",
    },
    "& .MuiInputLabel-root.MuiInputLabel-shrink": {
      color: "#222222 !important",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(0,0,0,0.23) !important",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(0,0,0,0.40) !important",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(0,0,0,0.60) !important",
    },
  };

  const validationSchema = Yup.object().shape({
    nombre: Yup.string().required("El nombre es obligatorio"),
    apellido: Yup.string().required("El apellido es obligatorio"),
    cedula: Yup.string()
      .transform((value) => (value ? value.toString().replace(/\s+/g, "") : ""))
      .required("La cedula es obligatoria")
      .matches(/^\d+$/, "La cédula solo puede contener números")
      .max(8, "La cédula no puede tener más de 8 dígitos")
      .test(
        "valid-cedula",
        "El número de cédula no es válido",
        function (value) {
          if (!value) return true; // La validación de required ya se encarga de esto

          // Remover espacios y guiones
          const cleanCedula = value.replace(/[\s-]/g, "");

          // Debe tener exactamente 7 u 8 dígitos (ya validado por max(8), pero verificamos)
          if (cleanCedula.length < 7 || cleanCedula.length > 8) {
            return false;
          }

          if (!/^\d{7,8}$/.test(cleanCedula)) {
            return false;
          }

          // Si tiene 7 dígitos, considerar válida (el verificador se puede agregar después)
          if (cleanCedula.length === 7) {
            return true;
          }

          // Si tiene 8 dígitos, verificar que el último dígito sea correcto
          if (cleanCedula.length === 8) {
            const first7Digits = cleanCedula.substring(0, 7);
            const lastDigit = parseInt(cleanCedula.substring(7, 8));
            const calculatedVerifier = calculateCedulaVerifier(first7Digits);
            return lastDigit === calculatedVerifier;
          }

          return false;
        }
      ),
    sexo: Yup.string().required("El sexo es obligatorio"),
    fechaNacimiento: Yup.date()
      .required("La fecha de nacimiento es obligatoria")
      .nullable(),
    contacto: Yup.string()
      .nullable()
      .matches(/^\d*$/, "El contacto solo puede contener números"),
    numJugador: Yup.string()
      .matches(/^\d*$/, "El número de jugador solo puede contener números")
      .nullable(),
    hasSiblings: Yup.boolean(),
    selectedSiblings: Yup.array().when("hasSiblings", {
      is: true,
      then: (schema) => schema.min(1, "Debe seleccionar al menos un hermano"),
      otherwise: (schema) => schema,
    }),
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
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        <DatePicker
          label={label}
          value={field.value || null}
          onChange={handleChange}
          inputFormat="dd/MM/yyyy"
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              size="small"
              error={Boolean(isTouched && currentError)}
              helperText={isTouched && currentError ? currentError : ""}
              sx={{
                ...textFieldStyles,
                "& .MuiInputBase-input": {
                  fontSize: "0.80rem",
                  padding: "4px 8px",
                },
              }}
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
      const response = await fetch(`${API_ENDPOINTS.SQUAD_SEARCH}/${ci}`);
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
      const response = await axios.get(API_ENDPOINTS.CATEGORIES);
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
      // Usar SQUAD_ALL para obtener TODOS los jugadores (incluyendo categorías inactivas)
      // Esto es necesario porque los hermanos pueden estar en cualquier categoría
      const response = await axios.get(API_ENDPOINTS.SQUAD_ALL);
      setJugadores(response.data.squads);
    } catch (error) {
      console.error("Error fetching players: ", error);
      throw error;
    }
  };

  const handleSubmit = async (values, actions) => {
    // console.log("values", values);

    if (!values.fechaNacimiento) {
      actions.setFieldError(
        "fechaNacimiento",
        "La fecha de nacimiento es obligatoria"
      );
      actions.setSubmitting(false);
      return;
    }

    const formattedFechaNacimiento = dayjs(values.fechaNacimiento).format(
      "YYYY-MM-DD"
    );
    const formattedFechaIngreso = dayjs(values.fechaIngreso).format(
      "YYYY-MM-DD"
    );

    const selectedCategory = categories.find(
      (category) => category.nombre_categoria === values.categoria
    );
    const idcategoria = selectedCategory
      ? selectedCategory.idcategoria
      : null;

    if (!idcategoria) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Debe seleccionar una categoría válida",
      });
      actions.setSubmitting(false);
      return;
    }

    const formData = new FormData();

    formData.append("nombre", values.nombre);
    formData.append("apellido", values.apellido);
    formData.append("cedula", values.cedula);
    formData.append("fecha_nacimiento", formattedFechaNacimiento);
    formData.append("sexo", values.sexo);
    formData.append("numeroClub", values.numJugador || "");
    formData.append("fecha_ingreso", formattedFechaIngreso);
    formData.append("idcategoria", idcategoria);
    
    // Lógica de estado:
    // - Si el checkbox está MARCADO → estado=3 (Exonerado)
    // - Si el checkbox está DESMARCADO y el jugador ERA exonerado (estado=3) → estado=2 (Habilitado)
    // - En CUALQUIER otro caso → NO enviar idestado (mantener estado actual: 1, 2, etc.)
    const checkboxEstaMarcado = values.esExonerado;
    const jugadorEraExonerado = playerSelected?.idestado === 3;
    const checkboxCambio = checkboxEstaMarcado !== jugadorEraExonerado;
    
    if (checkboxCambio) {
      if (checkboxEstaMarcado) {
        // Usuario MARCÓ el checkbox → convertir a Exonerado
        formData.append("idestado", 3);
      } else {
        // Usuario DESMARCÓ el checkbox (era exonerado) → convertir a Habilitado
        formData.append("idestado", 2);
      }
    }
    // Si no cambió el checkbox, NO enviar idestado (mantener estado actual)
    
    formData.append("ciudadania", values.ciudadania || "");
    formData.append("padre", values.padre || "");
    formData.append("madre", values.madre || "");
    formData.append("contacto", values.contacto || "");
    // formData.append("hermano", values.hermano);
    formData.append("observaciones", values.observaciones || "");

    if (values.hasSiblings && values.selectedSiblings.length > 0) {
      formData.append("hermanos", values.selectedSiblings.join(","));
    } else {
      formData.append("hermanos", "");
    }

    if (values.imagen && values.imagen instanceof File) {
      formData.append("imagen", values.imagen);
    }

    try {
      if (playerSelected) {
        await axios.put(
          `${API_ENDPOINTS.SQUAD}/${
            playerSelected.idjugador || playerSelected.id
          }`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        for (let [key, value] of formData.entries()) {
          console.log(`${key}: ${value}`);
        }

        await axios.post(API_ENDPOINTS.SQUAD, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        // console.log("values", formData);
      }
      setIsChange(true);
      handleClose();
    } catch (error) {
      console.error("Error saving player: ", error);
      if (error.response && error.response.data && error.response.data.error) {
        Swal.fire({
          icon: "error",
          title: "Error al guardar",
          text: error.response.data.error,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error al guardar",
          text: "Ocurrió un error al intentar guardar el jugador",
        });
      }
    } finally {
      actions.setSubmitting(false);
    }
  };

  // REMOVED: Este useEffect estaba intentando "adivinar" la categoría basándose en año y sexo,
  // pero esto puede sobrescribir incorrectamente la categoría que viene del backend.
  // La categoría debe venir directamente del backend en playerSelected.nombre_categoria

  return (
    <Paper
      elevation={3}
      sx={{ p: 1.5, maxWidth: 1180, width: "100%", margin: "0 auto" }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">Agregar jugador</Typography>
        <IconButton onClick={handleClose}>×</IconButton>
      </Box>
      <Formik
        initialValues={{
          nombre: playerSelected?.nombre || "",
          apellido: playerSelected?.apellido || "",
          cedula: playerSelected?.cedula || "",
          fechaNacimiento: playerSelected?.fecha_nacimiento
            ? typeof playerSelected.fecha_nacimiento === "string" &&
              playerSelected.fecha_nacimiento.includes("-")
              ? playerSelected.fecha_nacimiento.includes("T") ||
                playerSelected.fecha_nacimiento.includes("Z")
                ? new Date(playerSelected.fecha_nacimiento)
                : dayjs(
                    playerSelected.fecha_nacimiento
                      .split("-")
                      .reverse()
                      .join("-"),
                    "DD-MM-YYYY"
                  ).toDate()
              : new Date(playerSelected.fecha_nacimiento)
            : "",
          sexo:
            playerSelected?.sexo === "M" || playerSelected?.sexo === "Masculino"
              ? "M"
              : playerSelected?.sexo === "F" ||
                playerSelected?.sexo === "Femenino"
              ? "F"
              : playerSelected?.sexo || "",
          numJugador:
            playerSelected?.numeroClub || playerSelected?.numJugador || "",
          imagen: playerSelected?.imagen || "",
          fechaIngreso: playerSelected?.fecha_ingreso
            ? typeof playerSelected.fecha_ingreso === "string" &&
              playerSelected.fecha_ingreso.includes("-")
              ? playerSelected.fecha_ingreso.includes("T") ||
                playerSelected.fecha_ingreso.includes("Z")
                ? new Date(playerSelected.fecha_ingreso)
                : dayjs(
                    playerSelected.fecha_ingreso.split("-").reverse().join("-"),
                    "DD-MM-YYYY"
                  ).toDate()
              : new Date(playerSelected.fecha_ingreso)
            : "",
          categoria:
            playerSelected?.nombre_categoria ||
            playerSelected?.categoria?.nombre_categoria ||
            playerSelected?.categoria ||
            "",
          esExonerado: playerSelected?.idestado === 3, // Checkbox marcado si estado=3
          ciudadania: playerSelected?.ciudadania || "",
          padre: playerSelected?.padre || "",
          madre: playerSelected?.madre || "",
          contacto: playerSelected?.contacto || "",

          observaciones:
            playerSelected?.observacionesJugador ||
            playerSelected?.observaciones ||
            "",

          hasSiblings: (playerSelected?.selectedSiblings && playerSelected.selectedSiblings.length > 0) ? true : false,
          selectedSiblings: playerSelected?.selectedSiblings || [],
          selectedSiblingCategory:
            playerSelected?.selectedSiblingCategory || "",
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({
          isSubmitting,
          setFieldValue,
          setFieldTouched,
          validateField,
          values,
          touched,
          errors,
        }) => {
          // console.log('Formik touched:', touched);
          // console.log('Formik errors:', errors);

          useEffect(() => {
            // Solo determinar categoría automáticamente si:
            // 1. No hay jugador seleccionado (creando uno nuevo)
            // 2. O si el campo categoría está vacío (nuevo jugador sin categoría asignada)
            // NO sobrescribir si ya hay una categoría del backend (jugador existente)
            if (categories.length === 0) return;
            
            // Si estamos editando un jugador existente y ya tiene categoría, no sobrescribir
            if (playerSelected && values.categoria) {
              // Verificar que la categoría actual es válida (existe en la lista de categorías)
              const categoriaValida = categories.find(
                (c) => c.nombre_categoria === values.categoria
              );
              if (categoriaValida) {
                // La categoría es válida, no sobrescribir
                return;
              }
            }

            const determineCategory = () => {
              const fechaNacimiento = values.fechaNacimiento
                ? new Date(values.fechaNacimiento)
                : null;

              const yearOfBirth = fechaNacimiento
                ? fechaNacimiento.getFullYear()
                : null;

              if (!yearOfBirth || !values.sexo) return;

              // Calcular edad actual
              const currentYear = new Date().getFullYear();
              const age = currentYear - yearOfBirth;

              // Lógica de categorías según edad y sexo
              let categoryId = null;

              if (values.sexo.toLowerCase() === "femenino") {
                // Categorías femeninas
                if (age >= 6 && age <= 7)
                  categoryId = 11; // SUB9 (2016-2017-2018)
                else if (age >= 8 && age <= 9)
                  categoryId = 12; // SUB11 (2014-2015)
                else if (age >= 10 && age <= 11) categoryId = 13; // SUB13 (2012-2013)
              } else {
                // Categorías masculinas
                if (age >= 6 && age <= 7) categoryId = 1; // ABEJAS(2019)
                else if (age >= 7 && age <= 8) categoryId = 2; // GRILLOS(2018)
                else if (age >= 8 && age <= 9) categoryId = 3; // CHATAS(2017)
                else if (age >= 9 && age <= 10)
                  categoryId = 4; // CHURRINCHES(2016)
                else if (age >= 10 && age <= 11)
                  categoryId = 5; // GORRIONES(2015)
                else if (age >= 11 && age <= 12)
                  categoryId = 6; // SEMILLAS(2014)
                else if (age >= 12 && age <= 13)
                  categoryId = 7; // CEBOLLAS(2013)
                else if (age >= 13 && age <= 14) categoryId = 8; // BABYS(2012)
              }

              if (yearOfBirth) {
                const yearStr = String(yearOfBirth);
                if (values.sexo && values.sexo.toUpperCase().startsWith("F")) {
                  // Map femenino: SUB9 (2016-2018), SUB11 (2014-2015), SUB13 (2012-2013)
                  let targetPrefix = null;
                  if (["2016", "2017", "2018"].includes(yearStr))
                    targetPrefix = "SUB9";
                  else if (["2014", "2015"].includes(yearStr))
                    targetPrefix = "SUB11";
                  else if (["2012", "2013"].includes(yearStr))
                    targetPrefix = "SUB13";
                  if (targetPrefix) {
                    const foundFem = categories.find((c) =>
                      (c?.nombre_categoria || "")
                        .toUpperCase()
                        .startsWith(targetPrefix)
                    );
                    if (foundFem) {
                      setFieldValue("categoria", foundFem.nombre_categoria);
                      return;
                    }
                  }
                }
                // Masculino: buscar categoría cuyo nombre contenga el año y no sea SUBx
                const foundByYear = categories.find((c) => {
                  const n = (c?.nombre_categoria || "").toUpperCase();
                  return n.includes(`(${yearStr})`) && !n.startsWith("SUB");
                });
                if (foundByYear) {
                  setFieldValue("categoria", foundByYear.nombre_categoria);
                  return;
                }
              }
              if (categoryId) {
                const found = categories.find(
                  (c) => c.idcategoria === categoryId
                );
                if (found) {
                  setFieldValue("categoria", found.nombre_categoria);
                }
              }
            };

            determineCategory();
          }, [values.fechaNacimiento, values.sexo, values.categoria, categories, setFieldValue, playerSelected]);

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
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography
                    sx={{
                      mb: 0.5,
                      color: "#222222",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                    }}
                  >
                    Nombre
                  </Typography>
                  <Field
                    as={TextField}
                    variant="outlined"
                    label=""
                    name="nombre"
                    fullWidth
                    size="small"
                    value={values.nombre}
                    onChange={(e) => setFieldValue("nombre", e.target.value)}
                    error={<ErrorMessage name="nombre" />}
                    helperText={<ErrorMessage name="nombre" />}
                    sx={textFieldStyles}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography
                    sx={{
                      mb: 0.5,
                      color: "#222222",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                    }}
                  >
                    Apellido
                  </Typography>
                  <Field
                    as={TextField}
                    variant="outlined"
                    label=""
                    name="apellido"
                    fullWidth
                    size="small"
                    value={values.apellido}
                    onChange={(e) => setFieldValue("apellido", e.target.value)}
                    error={<ErrorMessage name="apellido" />}
                    helperText={<ErrorMessage name="apellido" />}
                    sx={textFieldStyles}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography
                    sx={{
                      mb: 0.5,
                      color: "#222222",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                    }}
                  >
                    Cedula
                  </Typography>
                  <Field
                    as={TextField}
                    variant="outlined"
                    label=""
                    name="cedula"
                    type="text"
                    inputMode="numeric"
                    size="small"
                    onChange={async (e) => {
                      // Solo permitir números y limitar a máximo 8 dígitos
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .substring(0, 8);
                      setFieldValue("cedula", value, false);
                      if (value) {
                        const ciExists = await checkCiExists(value);
                        setCodeExistsWarning(ciExists);
                      }
                    }}
                    onBlur={async (e) => {
                      setFieldTouched("cedula", true);
                      // Forzar validación de Formik cuando se sale del campo
                      await validateField("cedula");
                    }}
                    value={values.cedula}
                    error={Boolean(
                      codeExistsWarning || (touched.cedula && errors.cedula)
                    )}
                    helperText={
                      codeExistsWarning
                        ? "El numero de CI ya existe"
                        : touched.cedula && errors.cedula
                        ? errors.cedula
                        : ""
                    }
                    sx={textFieldStyles}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography
                    sx={{
                      mb: 0.5,
                      color: "#222222",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                    }}
                  >
                    Sexo
                  </Typography>
                  <Field
                    as={TextField}
                    variant="outlined"
                    label=""
                    name="sexo"
                    select
                    size="small"
                    value={values.sexo}
                    onChange={(e) => setFieldValue("sexo", e.target.value)}
                    fullWidth
                    error={<ErrorMessage name="sexo" />}
                    helperText={<ErrorMessage name="sexo" />}
                    sx={textFieldStyles}
                    SelectProps={{
                      MenuProps: {
                        PaperProps: {
                          sx: {
                            backgroundColor: "#ffffff",
                            "& .MuiMenuItem-root": { color: "#000000" },
                          },
                        },
                      },
                    }}
                  >
                    <MenuItem value="M">Masculino</MenuItem>
                    <MenuItem value="F">Femenino</MenuItem>
                  </Field>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography
                    sx={{
                      mb: 0.5,
                      color: "#222222",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                    }}
                  >
                    Fecha de nacimiento
                  </Typography>
                  <Field
                    name="fechaNacimiento"
                    component={DatePickerField}
                    placeholder="Fecha de nacimiento"
                    label=""
                    fullWidth
                    sx={textFieldStyles}
                  />
                  <ErrorMessage name="fechaNacimiento" component="div" />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography
                    sx={{
                      mb: 0.5,
                      color: "#222222",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                    }}
                  >
                    Número de jugador fichado
                  </Typography>
                  <Field
                    name="numJugador"
                    as={TextField}
                    variant="outlined"
                    inputMode="numeric"
                    label=""
                    size="small"
                    value={values.numJugador || ""}
                    onChange={(e) => {
                      // Solo permitir números o vacío
                      const value = e.target.value.replace(/\D/g, "");
                      setFieldValue("numJugador", value);
                    }}
                    onBlur={() => setFieldTouched("numJugador", true)}
                    error={Boolean(touched.numJugador && errors.numJugador)}
                    helperText={
                      touched.numJugador && errors.numJugador
                        ? errors.numJugador
                        : ""
                    }
                    fullWidth
                    sx={textFieldStyles}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography
                    sx={{
                      mb: 0.5,
                      color: "#222222",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                    }}
                  >
                    Ciudadania
                  </Typography>
                  <Field
                    as={TextField}
                    variant="outlined"
                    label=""
                    name="ciudadania"
                    size="small"
                    value={values.ciudadania}
                    onChange={(e) =>
                      setFieldValue("ciudadania", e.target.value)
                    }
                    fullWidth
                    sx={textFieldStyles}
                  />
                  <ErrorMessage name="ciudadania" component="div" />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography
                    sx={{
                      mb: 0.5,
                      color: "#222222",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                    }}
                  >
                    Categoría
                  </Typography>
                  <Field
                    as={TextField}
                    variant="outlined"
                    label=""
                    name="categoria"
                    select
                    size="small"
                    value={values.categoria}
                    onChange={(e) => setFieldValue("categoria", e.target.value)}
                    fullWidth
                    sx={textFieldStyles}
                    SelectProps={{
                      MenuProps: {
                        PaperProps: {
                          sx: {
                            backgroundColor: "#ffffff",
                            "& .MuiMenuItem-root": { color: "#000000" },
                          },
                        },
                      },
                    }}
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
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', pt: 2 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={values.esExonerado}
                          onChange={(e) => setFieldValue("esExonerado", e.target.checked)}
                          sx={{
                            color: "#1E8732",
                            '&.Mui-checked': {
                              color: "#1E8732",
                            },
                          }}
                        />
                      }
                      label={
                        <Typography
                          sx={{
                            color: "#222222",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                          }}
                        >
                          Exonerado de cuota del club
                        </Typography>
                      }
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography
                    sx={{
                      mb: 0.5,
                      color: "#222222",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                    }}
                  >
                    Fecha de ingreso al club
                  </Typography>
                  <Field
                    name="fechaIngreso"
                    component={DatePickerField}
                    placeholder="Fecha de ingreso al club"
                    label=""
                    fullWidth
                    sx={textFieldStyles}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3} sx={{ order: 50 }}>
                  <Typography
                    sx={{
                      mb: 0.5,
                      color: "#222222",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                    }}
                  >
                    Imagen
                  </Typography>
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
                        size="small"
                        sx={textFieldStyles}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography
                    sx={{
                      mb: 0.5,
                      color: "#222222",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                    }}
                  >
                    Padre
                  </Typography>
                  <Field
                    as={TextField}
                    variant="outlined"
                    label=""
                    name="padre"
                    size="small"
                    value={values.padre}
                    onChange={(e) => setFieldValue("padre", e.target.value)}
                    fullWidth
                    sx={textFieldStyles}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography
                    sx={{
                      mb: 0.5,
                      color: "#222222",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                    }}
                  >
                    Madre
                  </Typography>
                  <Field
                    as={TextField}
                    variant="outlined"
                    label=""
                    name="madre"
                    size="small"
                    value={values.madre}
                    onChange={(e) => setFieldValue("madre", e.target.value)}
                    fullWidth
                    sx={textFieldStyles}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography
                    sx={{
                      mb: 0.5,
                      color: "#222222",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                    }}
                  >
                    Contacto
                  </Typography>
                  <Field
                    as={TextField}
                    variant="outlined"
                    label=""
                    name="contacto"
                    type="text"
                    inputMode="numeric"
                    size="small"
                    value={values.contacto}
                    onChange={(e) => {
                      // Solo permitir números
                      const value = e.target.value.replace(/\D/g, "");
                      setFieldValue("contacto", value);
                    }}
                    fullWidth
                    error={<ErrorMessage name="contacto" />}
                    helperText={<ErrorMessage name="contacto" />}
                    sx={textFieldStyles}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={9} sx={{ order: 49 }}>
                  <Typography
                    sx={{
                      mb: 0.5,
                      color: "#222222",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                    }}
                  >
                    Observaciones
                  </Typography>
                  <Field
                    as={TextField}
                    variant="outlined"
                    label=""
                    name="observaciones"
                    multiline
                    rows={2}
                    fullWidth
                    size="small"
                    value={values.observaciones}
                    onChange={(e) =>
                      setFieldValue("observaciones", e.target.value)
                    }
                    sx={textFieldStyles}
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
                    sx={{
                      color: "#222222 !important",
                      "& .MuiTypography-root": {
                        color: "#222222 !important",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                      },
                    }}
                    control={
                      <Field
                        name="hasSiblings"
                        type="checkbox"
                        as={Checkbox}
                        sx={{
                          color: "#ffffff !important",
                          "& .MuiSvgIcon-root": {
                            fontSize: "1.25rem",
                            color: "#ffffff !important",
                            border: "2px solid #ffffff",
                            borderRadius: "4px",
                            backgroundColor: "transparent",
                          },
                          "&.Mui-checked": {
                            color: "#1E8732 !important",
                            "& .MuiSvgIcon-root": {
                              color: "#1E8732 !important",
                              border: "2px solid #1E8732",
                              backgroundColor: "transparent",
                            },
                          },
                          "&:hover .MuiSvgIcon-root": {
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                          },
                          "&.Mui-checked:hover .MuiSvgIcon-root": {
                            backgroundColor: "rgba(30, 135, 50, 0.1)",
                          },
                        }}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          setFieldValue("hasSiblings", isChecked);
                          setFieldTouched("hasSiblings", true);
                          if (!isChecked) {
                            setFieldValue("selectedSiblingCategory", "");
                            setFieldValue("selectedSiblings", []);
                            setFieldTouched("selectedSiblings", false);
                          } else {
                            setFieldTouched("selectedSiblings", true);
                          }
                        }}
                      />
                    }
                    label="¿Tiene hermanos en el club?"
                  />
                </Grid>

                {values.hasSiblings && (
                  <>
                    <Grid item xs={12} sm={12} md={6} sx={{ mt: 1 }}>
                      <Typography
                        sx={{
                          mb: 0.5,
                          color: "#222222",
                          fontWeight: 600,
                          fontSize: "0.85rem",
                        }}
                      >
                        Categoría del Hermano
                      </Typography>
                      <FormControl fullWidth sx={textFieldStyles} size="small">
                        <Field
                          name="selectedSiblingCategory"
                          as={Select}
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
                          sx={textFieldStyles}
                          MenuProps={{
                            PaperProps: {
                              sx: {
                                backgroundColor: "#ffffff",
                                "& .MuiMenuItem-root": { color: "#000000" },
                              },
                            },
                          }}
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

                    <Grid item xs={12} sm={12} md={6} sx={{ mt: 1 }}>
                      <Typography
                        sx={{
                          mb: 0.5,
                          color: "#222222",
                          fontWeight: 600,
                          fontSize: "0.85rem",
                        }}
                      >
                        Hermanos
                      </Typography>
                      <FormControl fullWidth sx={textFieldStyles} size="small">
                        <Field
                          name="selectedSiblings"
                          as={Select}
                          multiple
                          value={values.selectedSiblings}
                          onChange={(e) =>
                            setFieldValue("selectedSiblings", e.target.value)
                          }
                          sx={textFieldStyles}
                          MenuProps={{
                            PaperProps: {
                              sx: {
                                backgroundColor: "#ffffff",
                                "& .MuiMenuItem-root": { color: "#000000" },
                              },
                            },
                          }}
                          renderValue={(selected) => (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                flexWrap: "wrap",
                                gap: "6px",
                                maxHeight: "72px",
                                overflowY: "auto",
                              }}
                            >
                              {selected.map((id) => {
                                const sibling = jugadores.find(
                                  (jugador) => jugador.idjugador === id
                                );
                                // Si el hermano no se encuentra en jugadores, mostrar solo el ID
                                if (!sibling) {
                                  return (
                                    <Chip
                                      key={id}
                                      label={`ID: ${id}`}
                                      onDelete={() => {
                                        const newSelected = selected.filter(
                                          (s) => s !== id
                                        );
                                        setFieldValue(
                                          "selectedSiblings",
                                          newSelected
                                        );
                                      }}
                                      style={{ marginBottom: 0 }}
                                    />
                                  );
                                }
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
                                    style={{ marginBottom: 0 }}
                                  />
                                );
                              })}
                            </div>
                          )}
                          error={Boolean(
                            values.hasSiblings &&
                            values.selectedSiblings.length === 0 &&
                            touched.selectedSiblings
                          )}
                          helperText={
                            values.hasSiblings &&
                            values.selectedSiblings.length === 0 &&
                            touched.selectedSiblings
                              ? errors.selectedSiblings || "Debe seleccionar al menos un hermano"
                              : ""
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
                className="submit-button"
                style={{
                  alignSelf: "flex-end",
                  marginTop: "20px",
                  padding: "12px 30px",
                  fontSize: "1rem",
                  fontWeight: "600",
                }}
              >
                {isSubmitting
                  ? "Procesando..."
                  : playerSelected
                  ? "Actualizar"
                  : "Agregar"}
              </Button>
            </Form>
          );
        }}
      </Formik>
    </Paper>
  );
};

export default PlayerForm;
