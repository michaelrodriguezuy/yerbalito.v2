import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Toaster, toast } from "sonner";
import { Paper, Box } from "@mui/material";
import axios from "axios";
import { API_ENDPOINTS } from "../../../config/api";

const Contact = () => {
  console.log("Contact component is rendering");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    // Prevenir envíos duplicados
    if (isSubmitting) {
      console.log("Formulario ya se está enviando, ignorando envío duplicado");
      return;
    }
    
    console.log("Iniciando envío del formulario");
    setIsSubmitting(true);
    try {
      // Mostrar mensaje de carga con animación
      const loadingToast = toast.loading("Enviando tu mensaje...", {
        description: "Por favor espera un momento",
        duration: Infinity,
      });

      // Timeout para la petición (30 segundos)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 30000)
      );

      // Enviar el formulario al backend real con timeout
      const response = await Promise.race([
        axios.post(API_ENDPOINTS.CONTACT, values, {
          timeout: 30000,
        }),
        timeoutPromise,
      ]);

      // Ocultar mensaje de carga
      toast.dismiss(loadingToast);

      // Verificar respuesta del backend
      if (response?.data?.success) {
        console.log("Mostrando toast de éxito");
        // Mostrar mensaje de éxito con animación
        toast.success("¡Mensaje enviado con éxito!", {
          description: `Gracias ${values.name}, te responderemos pronto a ${values.email}`,
          duration: 5000,
        });
        // Restablecer el formulario
        resetForm();
      } else {
        throw new Error(
          response?.data?.error || "Respuesta inválida del servidor"
        );
      }
    } catch (error) {
      console.error("Error al enviar el correo:", error);

      // Manejar diferentes tipos de error
      let errorMessage = "Error al enviar el mensaje";
      let errorDescription = "Por favor, intenta de nuevo";

      if (error.message === "timeout") {
        errorMessage = "Tiempo de espera agotado";
        errorDescription =
          "El servidor tardó demasiado en responder. Verifica tu conexión.";
      } else if (error.response) {
        // Error del servidor con respuesta
        errorMessage = "Error del servidor";
        errorDescription =
          error.response.data?.error ||
          `Código de error: ${error.response.status}`;
      } else if (error.request) {
        // Error de red - no hay respuesta
        errorMessage = "Error de conexión";
        errorDescription =
          "No se pudo conectar con el servidor. Verifica tu conexión a internet.";
      } else if (error.message) {
        errorDescription = error.message;
      }

      toast.error(errorMessage, {
        description: errorDescription,
        duration: 6000,
      });
    } finally {
      setSubmitting(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container-scroll">
      <div className="content-container">
        {/* Header inspirado en alexandergarcia.me */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h1"
            component="h1"
            sx={{ 
              fontSize: { xs: '2.5rem', md: '4rem' },
              fontWeight: 800,
              background: 'linear-gradient(45deg, #4CAF50, #ffffff)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            Contacto
          </Typography>
          <Typography
            variant="h5"
            sx={{ 
              color: 'rgba(255,255,255,0.8)',
              fontWeight: 300,
              maxWidth: '600px',
              mx: 'auto',
              mb: 3
            }}
          >
            ¿Tienes alguna pregunta? ¡Nos encantaría escucharte!
          </Typography>
        </Box>
        
        <Paper 
          elevation={3}
          className="content-paper slide-up"
          sx={{
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            padding: "40px",
            maxWidth: "95%",
            margin: "0 auto",
            color: "white",
            borderRadius: "20px",
            backdropFilter: "blur(10px)"
          }}
        >
          <div className="flex flex-col lg:flex-row gap-8 p-6">
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
              {({ isSubmitting }) => (
                <Form>
                  <div style={{ backgroundColor: 'transparent', padding: 0 }}>
                    <Field name="name">
                      {({ field, meta }) => (
                        <div className="contact-field">
                          <TextField
                            {...field}
                            label="Nombre"
                            variant="outlined"
                            fullWidth
                            error={meta.touched && meta.error}
                            helperText={
                              meta.touched && meta.error ? meta.error : ""
                            }
                            className="consistency-input"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                '& input': {
                                  color: '#000000 !important',
                                  fontWeight: '500'
                                },
                                '& textarea': {
                                  color: '#000000 !important',
                                  fontWeight: '500'
                                }
                              },
                              '& .MuiInputLabel-root': {
                                color: 'rgba(0, 0, 0, 0.6) !important',
                                fontWeight: '500'
                              },
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(0, 0, 0, 0.23) !important',
                                borderWidth: '1px'
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(0, 0, 0, 0.4) !important',
                                borderWidth: '1px'
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(0, 0, 0, 0.6) !important',
                                borderWidth: '1px'
                              },
                              '& .MuiFormHelperText-root': {
                                color: '#ff6b6b !important',
                                fontWeight: 'bold'
                              }
                            }}
                          />
                        </div>
                      )}
                    </Field>

                    <Field name="email">
                      {({ field, meta }) => (
                        <div className="contact-field">
                          <TextField
                            {...field}
                            label="Email"
                            variant="outlined"
                            fullWidth
                            error={meta.touched && meta.error}
                            helperText={
                              meta.touched && meta.error ? meta.error : ""
                            }
                            className="consistency-input"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                '& input': {
                                  color: '#000000 !important',
                                  fontWeight: '500'
                                },
                                '& textarea': {
                                  color: '#000000 !important',
                                  fontWeight: '500'
                                }
                              },
                              '& .MuiInputLabel-root': {
                                color: 'rgba(0, 0, 0, 0.6) !important',
                                fontWeight: '500'
                              },
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(0, 0, 0, 0.23) !important',
                                borderWidth: '1px'
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(0, 0, 0, 0.4) !important',
                                borderWidth: '1px'
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(0, 0, 0, 0.6) !important',
                                borderWidth: '1px'
                              },
                              '& .MuiFormHelperText-root': {
                                color: '#ff6b6b !important',
                                fontWeight: 'bold'
                              }
                            }}
                          />
                        </div>
                      )}
                    </Field>

                    <Field name="message">
                      {({ field, meta }) => (
                        <div className="contact-field">
                          <TextField
                            {...field}
                            label="Mensaje"
                            variant="outlined"
                            multiline
                            rows={4}
                            fullWidth
                            error={meta.touched && meta.error}
                            helperText={
                              meta.touched && meta.error ? meta.error : ""
                            }
                            className="consistency-input"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                '& input': {
                                  color: '#000000 !important',
                                  fontWeight: '500'
                                },
                                '& textarea': {
                                  color: '#000000 !important',
                                  fontWeight: '500'
                                }
                              },
                              '& .MuiInputLabel-root': {
                                color: 'rgba(0, 0, 0, 0.6) !important',
                                fontWeight: '500'
                              },
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(0, 0, 0, 0.23) !important',
                                borderWidth: '1px'
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(0, 0, 0, 0.4) !important',
                                borderWidth: '1px'
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(0, 0, 0, 0.6) !important',
                                borderWidth: '1px'
                              },
                              '& .MuiFormHelperText-root': {
                                color: '#ff6b6b !important',
                                fontWeight: 'bold'
                              }
                            }}
                          />
                        </div>
                      )}
                    </Field>

                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isSubmitting}
                      className="consistency-button-primary w-full mt-4"
                    >
                      {isSubmitting ? "Enviando..." : "ENVIAR"}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>

            <div className="w-full lg:w-96 h-80 mx-auto rounded-lg overflow-hidden shadow-xl border-2 border-white border-opacity-20">
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
            </div>
          </div>
        </Paper>
      </div>
    </div>
  );
};

export default Contact;
