import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Toaster, toast } from "sonner";
import { Paper } from "@mui/material";

const Contact = () => {
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      // Mostrar mensaje de carga
      const loadingToast = toast.loading("Enviando correo...");

      // Simular el envío del formulario a través de una API (reemplaza esto con tu lógica real)
      setTimeout(() => {
        // Ocultar mensaje de carga
        toast.dismiss(loadingToast);
        // Mostrar mensaje de éxito
        toast.success("Correo enviado correctamente", {
          description: "¡Gracias por contactarte con nosotros!",
        });
        // Restablecer el formulario
        resetForm();
        setSubmitting(false);
      }, 1000); // Simulamos un tiempo de carga de 1 segundo
    } catch (error) {
      console.error("Error al enviar el correo:", error);
      toast.error(error.message || "Error al enviar el correo");
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container" style={{ textAlign: "center", overflowY: "auto" }}>
        <Typography
          variant="h2"
          component="h2"
          gutterBottom
          style={{ 
            margin: "20px 0",
            color: "white",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)" 
          }}
        >
          CONTACTO
        </Typography>
            <Paper 
              elevation={3} 
              style={{ 
                backgroundColor: "rgba(0, 0, 0, 0.7)", 
                padding: "20px", 
                maxWidth: "90%", 
                margin: "0 auto",
                color: "white" 
              }}
            >

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "flex-start",
            justifyContent: "space-around",
            minHeight: "60vh",
            gap: '40px',
            padding: "20px"
          }}
        >
          <Formik
            initialValues={{ name: "", email: "", message: "" }}
            validationSchema={Yup.object({
              name: Yup.string()
                .required("El nombre es requerido")
                .min(1, "El nombre debe tener al menos 1 caracter"),
              email: Yup.string()
                .email("Email inválido")
                .required("El email es requerido"),
              message: Yup.string()
                .required("El mensaje es requerido")
                .min(10, "El mensaje debe tener al menos 10 caracteres"),
            })}
            onSubmit={handleSubmit}
          >
            <Form>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  maxWidth: 400,
                  margin: "auto",
                }}
              >
                <Field name="name">
                  {({ field, meta }) => (
                    <div>
                      <TextField
                        {...field}
                        label="Nombre"
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        InputLabelProps={{ 
                          style: { color: "white" } 
                        }}
                        InputProps={{ 
                          style: { 
                            color: "white", 
                            backgroundColor: "rgba(60, 60, 60, 0.5)",
                            borderRadius: "4px"
                          } 
                        }}
                        sx={{
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(255, 255, 255, 0.5)"
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(255, 255, 255, 0.8)"
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "white"
                          }
                        }}
                        error={meta.touched && meta.error}
                      />
                      {meta.touched && meta.error && (
                        <div style={{ color: "#ff6b6b", fontSize: "0.8rem", marginTop: "4px" }}>{meta.error}</div>
                      )}
                    </div>
                  )}
                </Field>

                <Field name="email">
                  {({ field, meta }) => (
                    <div>
                      <TextField
                        {...field}
                        label="Email"
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        InputLabelProps={{ 
                          style: { color: "white" } 
                        }}
                        InputProps={{ 
                          style: { 
                            color: "white", 
                            backgroundColor: "rgba(60, 60, 60, 0.5)",
                            borderRadius: "4px"
                          } 
                        }}
                        sx={{
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(255, 255, 255, 0.5)"
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(255, 255, 255, 0.8)"
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "white"
                          }
                        }}
                        error={meta.touched && meta.error}
                      />
                      {meta.touched && meta.error && (
                        <div style={{ color: "#ff6b6b", fontSize: "0.8rem", marginTop: "4px" }}>{meta.error}</div>
                      )}
                    </div>
                  )}
                </Field>

                <Field name="message">
                  {({ field, meta }) => (
                    <div>
                      <TextField
                        {...field}
                        label="Mensaje"
                        variant="outlined"
                        multiline
                        rows={4}
                        margin="normal"
                        fullWidth
                        InputLabelProps={{ 
                          style: { color: "white" } 
                        }}
                        InputProps={{ 
                          style: { 
                            color: "white", 
                            backgroundColor: "rgba(60, 60, 60, 0.5)",
                            borderRadius: "4px"
                          } 
                        }}
                        sx={{
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(255, 255, 255, 0.5)"
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(255, 255, 255, 0.8)"
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "white"
                          }
                        }}
                        error={meta.touched && meta.error}
                      />
                      {meta.touched && meta.error && (
                        <div style={{ color: "#ff6b6b", fontSize: "0.8rem", marginTop: "4px" }}>{meta.error}</div>
                      )}
                    </div>
                  )}
                </Field>

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ 
                    marginTop: 2,
                    backgroundColor: "#2a5298",
                    "&:hover": {
                      backgroundColor: "#1c3b6f"
                    }
                  }}
                >
                  ENVIAR
                </Button>
              </Box>
            </Form>
          </Formik>

          <Box sx={{ 
            width: "400px", 
            height: "300px", 
            border: "4px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "8px",
            overflow: "hidden"
          }}>
            <iframe
              title="Google Maps"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d29791.66727565066!2d-54.414093465234394!3d-33.23446239999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x950be9c130a58849%3A0x9dd9261a64098372!2sCancha%20Club%20Yerbalito%20de%20Baby%20F%C3%BAtbol!5e1!3m2!1ses-419!2suy!4v1714333252443!5m2!1ses-419!2suy"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </Box>
        </div>
      </Paper>

      <Toaster />
    </div>
  );
};

export default Contact;
