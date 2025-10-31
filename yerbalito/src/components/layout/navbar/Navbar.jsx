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

  // Avatar fijo usando el logo del club

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
          zIndex: 1000,
          backgroundColor: "transparent !important",
          backdropFilter: "none",
          boxShadow: "none",
          // Efecto de desvanecimiento para tapar contenido que pase por debajo
          background: "linear-gradient(to bottom, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.4) 70%, transparent 100%)",
          transition: "background-color 0.3s ease",
          height: "120px",
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
                style={{ height: 100, marginRight: 12 }}
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
                      <Typography 
                        textAlign={"center"}
                        sx={{
                          textTransform: "uppercase",
                          fontWeight: "bold",
                          fontSize: "0.9rem",
                          letterSpacing: "0.5px",
                          color: "#4CAF50"
                        }}
                      >
                        {page.title}
                      </Typography>
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
              {routes.map((element) => (
                // console.log(element),
                <Link
                  key={element.id}
                  to={element.path}
                  style={{ textDecoration: "none" }}
                >
                  <Button
                    onClick={handleCloseNavMenu}
                    sx={{ 
                      my: 2, 
                      color: "white", 
                      display: "block",
                      textTransform: "uppercase",
                      fontWeight: "bold",
                      fontSize: "0.9rem",
                      letterSpacing: "0.5px",
                      textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
                      "&:hover": {
                        color: "#4CAF50",
                        textShadow: "2px 2px 4px rgba(76, 175, 80, 0.8)",
                        transform: "translateY(-1px)",
                        transition: "all 0.3s ease"
                      }
                    }}
                  >
                    {element.title}
                  </Button>
                </Link>
              ))}
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
                  <Typography 
                    sx={{ 
                      fontSize: "0.8rem", 
                      fontWeight: "bold",
                      textShadow: "1px 1px 2px rgba(0,0,0,0.7)",
                      color: "#4CAF50"
                    }}
                  >
                    BIENVENIDO
                  </Typography>
                  <Typography 
                    sx={{ 
                      fontSize: "0.9rem", 
                      fontWeight: "bold",
                      textShadow: "1px 1px 2px rgba(0,0,0,0.7)",
                      color: "white"
                    }}
                  >
                    {user.name}
                  </Typography>
                </div>

                <Tooltip title="Despliega mas opciones">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar src="/src/assets/logo_chico.png" />
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
                        <Typography 
                          textAlign="center"
                          sx={{
                            textTransform: "uppercase",
                            fontWeight: "bold",
                            fontSize: "0.9rem",
                            letterSpacing: "0.5px",
                            color: "#4CAF50"
                          }}
                        >
                          {item.title}
                        </Typography>
                      </Link>
                    </MenuItem>
                  ))}

                  <MenuItem onClick={handleCloseUserMenu}>
                    <Typography 
                      onClick={handleLogout} 
                      textAlign="center"
                      sx={{
                        textTransform: "uppercase",
                        fontWeight: "bold",
                        fontSize: "0.9rem",
                        letterSpacing: "0.5px",
                        color: "#f44336"
                      }}
                    >
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
                <Button 
                  sx={{ 
                    my: 2, 
                    color: "white", 
                    display: "block",
                    textTransform: "uppercase",
                    fontWeight: "bold",
                    fontSize: "0.9rem",
                    letterSpacing: "0.5px",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
                    "&:hover": {
                      color: "#4CAF50",
                      textShadow: "2px 2px 4px rgba(76, 175, 80, 0.8)",
                      transform: "translateY(-1px)",
                      transition: "all 0.3s ease"
                    }
                  }}
                >
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
