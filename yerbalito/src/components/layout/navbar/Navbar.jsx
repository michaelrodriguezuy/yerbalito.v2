import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import { menuItems } from "../../../router/navigation";
import { routes } from "../../../router/routes";
// import { Link, useNavigate } from "react-router";
import logo from "../../../assets/logo.png";

import { AuthContext } from "../../../context/AuthContext";
import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

function Navbar() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const rolPro = import.meta.env.VITE_ROLPRO;
  const rolUser = import.meta.env.VITE_ROLUSER;
  const rolAdmin = import.meta.env.VITE_ROLADMIN;
  const navigate = useNavigate();

  const { logoutContext, user, isLogged } = useContext(AuthContext);

  const handleLogout = () => {
    try {
      // logout(); aqui lo correcto seria cerrar la conexion con el
      logoutContext();
      navigate("/");
      // setAnchorElUser(null);
    } catch (error) {
      console.log(error);
    }
  };

  // quiero generar un numero random para el avatar
  const random = Math.floor(Math.random() * 100);
  const [avatarRandom, setAvatarRandom] = React.useState(random);
  //actualizo el avatar si cierro sesion

  useEffect(() => {
    // Verifica si hay un usuario autenticado
    if (isLogged) {
      // Si hay un usuario autenticado, actualiza el avatar generando un nuevo número aleatorio
      setAvatarRandom(Math.floor(Math.random() * 100));
      console.log("hay usuario autenticado");
    } else {
      console.log("No hay usuario autenticado");
    }
  }, [user]);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <>
      <AppBar
        position="static"
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 1,
          backgroundColor: "transparent",
        }}
      >
        <Container maxWidth="xl" disableGutters>
          <Toolbar>
            <Link to={"/"}>
              {/* <AdbIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} /> */}
              {/* escudo de yerbalito desde mi carpeta assets */}

              <img
                src={logo}
                alt="Yerbalito"
                style={{ height: 120, marginRight: 12, marginTop: 8 }}
              />
            </Link>

            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: "block", md: "none" },
                }}
              >
                {routes.map((page) => (
                  <Link
                    key={page.id}
                    to={page.path}
                    style={{ textDecoration: "none", color: "black" }}
                  >
                    <MenuItem onClick={handleCloseNavMenu}>
                      <Typography textAlign={"center"}>{page.title}</Typography>
                    </MenuItem>
                  </Link>
                ))}
              </Menu>
            </Box>
            {/* <AdbIcon sx={{ display: { xs: "flex", md: "none" }, mr: 1 }} /> */}
            {/* <Typography
              variant="h5"
              noWrap
              component="a"
              href="#app-bar-with-responsive-menu"
              sx={{
                mr: 2,
                display: { xs: "flex", md: "none" },
                flexGrow: 1,
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              
            </Typography> */}
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              {routes.map(
                (element) => (
                  // console.log(element),
                  (
                    <Link
                      key={element.id}
                      to={element.path}
                      style={{ textDecoration: "none" }}
                    >
                      <Button
                        onClick={handleCloseNavMenu}
                        sx={{ my: 2, color: "white", display: "block" }}
                      >
                        {element.title}
                      </Button>
                    </Link>
                  )
                )
              )}
            </Box>
            {/* si no hay user, muestro la opcion Iniciar Sesion */}

            {isLogged ? (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    marginRight: "10px",
                  }}
                >
                  <Typography >BIENVENIDO</Typography>
                  <Typography>{user.name}</Typography>
                </div>

                <Tooltip title="Despliega mas opciones">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar
                      src={`https://randomuser.me/api/portraits/men/${avatarRandom}.jpg`}
                    />
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: "45px" }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  {menuItems.map((item) => (
                    <MenuItem key={item.id} onClick={handleCloseUserMenu}>
                      <Link
                        to={item.path}
                        style={{ textDecoration: "none", color: "black" }}
                      >
                        <Typography textAlign="center">{item.title}</Typography>
                      </Link>
                    </MenuItem>
                  ))}
                  {user.rol == rolPro && (
                    <MenuItem onClick={handleCloseUserMenu}>
                      <Link
                        to="/dashboard"
                        style={{ textDecoration: "none", color: "black" }}
                      >
                        <Typography textAlign="center">Dashboard</Typography>
                      </Link>
                    </MenuItem>
                  )}

                  <MenuItem onClick={handleCloseUserMenu}>
                    <Typography onClick={handleLogout} textAlign="center">
                      Cerrar Sesion
                    </Typography>
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Link
                to={"/login"}
                style={{ textDecoration: "none", color: "black" }}
              >
                <Button sx={{ my: 2, color: "white", display: "block" }}>
                  Iniciar Sesion
                </Button>
              </Link>
            )}
          </Toolbar>
        </Container>
      </AppBar>
    </>
  );
}
export default Navbar;
