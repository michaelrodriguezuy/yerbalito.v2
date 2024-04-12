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

      const res = await axios.post("http://localhost:3001/login", {
        usuario: values.email,
        password: values.password,
      });

      if (res && res.data.user) {

        //busco ese usuario y saco mas datos para almacenar en el context
        const userId = res.data.user.id_usuario;

        const userDetailsResponse = await axios.get(
          `http://localhost:3001/user?id=${userId}`
        );
        

        if (userDetailsResponse.data && userDetailsResponse.data.user) {
          let finalyUser = {
            id: userDetailsResponse.data.user.id_usuario,
            name: userDetailsResponse.data.user.nombre,
            email: userDetailsResponse.data.user.usuario,
            rol: userDetailsResponse.data.user.admin,
          };
          handleLogin(finalyUser);
          navigate("/");
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "El usuario no existe, por favor registrate",
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: handleSubmit,
  });

  return (
    <div
      className="login-container"
      style={{        
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "30em",
          // height: "50vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderRadius: "10px",
          padding: "20px",
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
              />
            </Grid>
            <Grid item xs={10} md={12}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel htmlFor="outlined-adornment-password">
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
                />
              </FormControl>
            </Grid>
            <Link
              to="/forgot-password"
              style={{ color: "steelblue", marginTop: "10px" }}
            >
              ¿Olvidaste tu contraseña?
            </Link>
            <Grid container justifyContent="center" spacing={3} mt={2}>
              <Grid item xs={10} md={5}>
                <Button
                  variant="contained"
                  fullWidth
                  type="submit"
                  sx={{
                    color: "white",
                    textTransform: "none",
                    textShadow: "2px 2px 2px grey",
                  }}
                >
                  Ingresar
                </Button>
              </Grid>

              <Grid item xs={10} md={8}>
                <Typography
                  color={"secondary.primary"}
                  variant={"h6"}
                  mt={1}
                  align="center"
                >
                  ¿Aun no tienes cuenta?
                </Typography>
              </Grid>
              <Grid item xs={10} md={5}>
                <Tooltip title="Solo te tomará 1 minuto">
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate("/register")}
                    type="button"
                    sx={{
                      color: "white",
                      textTransform: "none",
                      textShadow: "2px 2px 2px grey",
                    }}
                  >
                    Registrate
                  </Button>
                </Tooltip>
              </Grid>
            </Grid>
          </Grid>
        </form>
      </Box>
    </div>
  );
};
export default Login;
