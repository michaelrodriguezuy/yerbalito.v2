import {
  Grid,
  FormControl,
  Button,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import "./Login.css";

import Box from "@mui/material/Box";

import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import { useContext, useState } from "react";
import axios from "axios";
// import bcrypt from 'bcryptjs';

const Login = () => {
  const { handleLogin } = useContext(AuthContext);

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const handleClickShowPassword = () => setShowPassword(!showPassword);

  let initialValues = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .required("El email es obligatorio")
      .email("Ingresa un email válido"),
    password: Yup.string()
      .required("La contraseña es obligatoria")
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
  });

  const handleSubmit = async (values) => {

    try {

      const res = await axios.post("http://localhost:5001/login", {
        usuario: values.email,
        password: values.password,
      });

      if (res && res.data.user) {

        //busco ese usuario y saco mas datos para almacenar en el context
        const userId = res.data.user.id_usuario;

        const userDetailsResponse = await axios.get(
          `http://localhost:5001/user?id=${userId}`
        );
        

        if (userDetailsResponse.data && userDetailsResponse.data.user) {
          let finalyUser = {
            id: userDetailsResponse.data.user.id_usuario,
            name: userDetailsResponse.data.user.nombre,
            email: userDetailsResponse.data.user.usuario,
            rol: userDetailsResponse.data.user.rol || 'usuario',
          };
          handleLogin(finalyUser);
          navigate("/dashboard");
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "El usuario no existe, por favor registrate",
        });
      }
    } catch (error) {
      console.error("Error en login:", error);
      
      // Determinar el tipo de error
      let errorTitle = "Error de conexión";
      let errorText = "No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.";
      
      if (error.response) {
        // Error del servidor
        if (error.response.status === 401) {
          errorTitle = "Credenciales incorrectas";
          errorText = "El email o la contraseña son incorrectos. Verifica tus datos e intenta nuevamente.";
        } else if (error.response.status === 404) {
          errorTitle = "Usuario no encontrado";
          errorText = "No existe una cuenta con este email. Verifica el email o regístrate.";
        } else if (error.response.status >= 500) {
          errorTitle = "Error del servidor";
          errorText = "Hubo un problema en el servidor. Intenta más tarde.";
        }
      } else if (error.code === 'ERR_NETWORK') {
        errorTitle = "Sin conexión";
        errorText = "No se pudo conectar con el servidor. Verifica tu conexión a internet.";
      }
      
      Swal.fire({
        icon: "error",
        title: errorTitle,
        text: errorText,
      });
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: handleSubmit,
  });

  return (
    <div className="page-container">
      <Box
        sx={{
          width: "100%",
          maxWidth: "30em",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderRadius: "10px",
          padding: "30px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <form onSubmit={formik.handleSubmit}>
          <Grid
            container
            rowSpacing={2}
            // alignItems="center"
            justifyContent={"center"}
          >
            <Grid item xs={10} md={12}>
              <TextField
                name="email"
                label="Correo electrónico"
                fullWidth
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                className="consistency-input"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    '& input': {
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
            </Grid>
            <Grid item xs={10} md={12}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel 
                  htmlFor="outlined-adornment-password"
                  sx={{
                    color: 'rgba(0, 0, 0, 0.6) !important',
                    fontWeight: '500'
                  }}
                >
                  Contraseña
                </InputLabel>
                <OutlinedInput
                  name="password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                  error={
                    formik.touched.password && Boolean(formik.errors.password)
                  }
                  id="outlined-adornment-password"
                  type={showPassword ? "text" : "password"}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOff color="primary" />
                        ) : (
                          <Visibility color="primary" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Contraseña"
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    '& input': {
                      color: '#000000 !important',
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
                    }
                  }}
                />
                <InputLabel 
                  htmlFor="outlined-adornment-password"
                  sx={{
                    color: "rgba(0, 0, 0, 0.6)",
                    "&.Mui-focused": {
                      color: "#1976d2",
                    },
                  }}
                >
                  Contraseña
                </InputLabel>
              </FormControl>
            </Grid>
            {/* <Typography
              variant="body2"
              sx={{ 
                color: "rgba(0, 0, 0, 0.5)", 
                marginTop: "10px",
                textDecoration: "line-through",
                cursor: "not-allowed"
              }}
            >
              ¿Olvidaste tu contraseña? (Deshabilitado)
            </Typography> */}
            <Grid container justifyContent="center" spacing={3} mt={2}>
              <Grid item xs={10} md={5}>
                <Button
                  variant="contained"
                  fullWidth
                  type="submit"
                  className="consistency-button-primary"
                >
                  Ingresar
                </Button>
              </Grid>

              {/* <Grid item xs={10} md={8}>
                <Typography
                  color={"text.secondary"}
                  variant={"h6"}
                  mt={1}
                  align="center"
                  sx={{ textDecoration: "line-through", opacity: 0.5 }}
                >
                  ¿Aun no tienes cuenta? (Registro deshabilitado)
                </Typography>
              </Grid>
              <Grid item xs={10} md={5}>
                <Tooltip title="Registro temporalmente deshabilitado">
                  <span>
                    <Button
                      variant="contained"
                      fullWidth
                      disabled
                      type="button"
                      sx={{
                        color: "white",
                        textTransform: "none",
                        textShadow: "2px 2px 2px grey",
                        opacity: 0.5,
                        cursor: "not-allowed"
                      }}
                    >
                      Registrate
                    </Button>
                  </span>
                </Tooltip>
              </Grid> */}
            </Grid>
          </Grid>
        </form>
      </Box>
    </div>
  );
};
export default Login;
