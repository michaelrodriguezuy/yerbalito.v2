import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { TextField, MenuItem } from "@mui/material";

const PlayerForm = ({ handleClose, setIsChange, playerSelected }) => {
  const [codeExistsWarning, setCodeExistsWarning] = useState(false);

  const validationSchema = Yup.object().shape({
    code: Yup.string()
      .transform((value) => value.replace(/\s+/g, ""))
      .required("La cedula es obligatoria"),
  });

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

  const handleSubmit = async (values) => {
    try {
      if (playerSelected) {
        await axios.put(
          `http://localhost:3001/squad/${playerSelected.id}`,
          values
        );
      } else {
        await axios.post("http://localhost:3001/squad", values);
      }
      setIsChange(true);
      handleClose();
    } catch (error) {
      console.error("Error saving player: ", error);
    }
  };

  return (
    <div>
      <Formik
        initialValues={{
          nombre: playerSelected?.nombre || "",
          apellido: playerSelected?.apellido || "",
          cedula: playerSelected?.cedula || "",
          fechaNacimiento: playerSelected?.fecha_nacimiento || "", //fecha
          sexo: playerSelected?.sexo || "", //select
          numJugador: playerSelected?.numeroClub || "",
          foto: playerSelected?.imagen || "",
          fechaIngreso: playerSelected?.fecha_ingreso || "", //fecha
          categoria: playerSelected?.idcategoria || "", //select..
          ciudadania: playerSelected?.ciudadania || "",
          padre: playerSelected?.padre || "",
          madre: playerSelected?.madre || "",
          contacto: playerSelected?.contacto || "",
          hermano: playerSelected?.hermano || "", //checkbox
          hermanos: playerSelected?.hermanos || "", //select
          observaciones: playerSelected?.observacionesJugador || "",
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, setFieldValue, values }) => (
          <Form
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
            onChange={async (e) => {
              if (e.target.name === "code") {
                const ciExists = await checkCiExists(e.target.value);
                setCodeExistsWarning(ciExists);
              }
            }}
          >
            <Field
              as={TextField}
              variant="outlined"
              label="Nombre"
              name="nombre"
              value={values.nombre}
              onChange={(e) => setFieldValue("nombre", e.target.value)}
            />
            <ErrorMessage name="nombre" component="div" />

            <Field
              as={TextField}
              variant="outlined"
              label="Apellido"
              name="apellido"
              value={values.apellido}
              onChange={(e) => setFieldValue("apellido", e.target.value)}
            />
            <ErrorMessage name="apellido" component="div" />

            <Field
              as={TextField}
              variant="outlined"
              label="Cedula"
              name="cedula"
              onChange={(e) => {
                const value = e.target.value.replace(/\s+/g, "");
                setFieldValue("cedula", value);
              }}
              value={values.code}
              helperText={
                codeExistsWarning ? (
                  "El numero de CI ya existe"
                ) : (
                  <ErrorMessage name="cedula" />
                )
              }
              error={!!(<ErrorMessage name="cedula" />) || codeExistsWarning}
            />
            <ErrorMessage name="cedula" component="div" />

            <Field name="fechaNacimiento" placeholder="Fecha de nacimiento" />
            <ErrorMessage name="fechaNacimiento" component="div" />

            <Field
              as={TextField}
              variant="outlined"
              label="Sexo"
              name="sexo"
              select
              value={values.sexo}
              onChange={(e) => setFieldValue("sexo", e.target.value)}
            >
              <MenuItem value="M">Masculino</MenuItem>
              <MenuItem value="F">Femenino</MenuItem>
            </Field>
            <ErrorMessage name="sexo" component="div" />

            <Field name="numJugador" placeholder="Numero de jugador" />
            <ErrorMessage name="numJugador" component="div" />

            <Field name="foto" placeholder="Foto" />
            <ErrorMessage name="foto" component="div" />

            <Field name="fechaIngreso" placeholder="Fecha de ingreso" />
            <ErrorMessage name="fechaIngreso" component="div" />

            <Field
              as={TextField}
              variant="outlined"
              label="Categoría"
              name="categoria"
              select
              value={values.categoria}
              onChange={(e) => setFieldValue("categoria", e.target.value)}
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.name}>
                  {category.name}
                </MenuItem>
              ))}
            </Field>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default PlayerForm;
