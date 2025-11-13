import { Box, Toolbar, Tooltip } from "@mui/material";
import { Link } from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import "./Footer.css";

const Footer = () => {
  return (
    <Box
      component="footer"
      className="footer"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 15px",
        width: "100%",
        backgroundColor: "transparent",
        backdropFilter: "none",
        color: "whitesmoke",
        boxShadow: "none",
        height: "40px",
        marginTop: "auto"
      }}
    >
      <p>© 2023 Yerbalito | Desarrollado por <a href="https://olimarteam.uy" target="_blank" rel="noopener noreferrer" style={{ color: "whitesmoke", textDecoration: "none" }}>Michael Rodríguez</a></p>
      <Toolbar
        sx={{
          gap: "20px",
          display: "flex",
          flexDirection: "row",
          alignContent: "flex-end",
          justifyContent: "space-between",
          minHeight: "unset",
          padding: "0"
        }}
      >
                <Box
                  sx={{
                    display: "flex",
                    gap: "40px",
                    justifyContent: "space-between",
                    "& > *": {
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.2) rotate(10deg)",
                        animation: "bounce 0.6s ease-in-out",
                      }
                    }
                  }}
                >
          <Link
            href="https://api.whatsapp.com/send?phone=59895524038&text=Hola%20Yerbalito"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "whitesmoke", textDecoration: "none" }}
          >
                    <Tooltip title="Envia un whatsapp">
                      <WhatsAppIcon sx={{ color: "whitesmoke" }} className="social-icon" />
                    </Tooltip>
          </Link>

          <Link
            href="https://www.facebook.com/Clubyerbalitodebabyfutbol/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "whitesmoke", textDecoration: "none" }}
          >
                    <Tooltip title="Contactanos por facebook">
                      <FacebookIcon sx={{ color: "whitesmoke" }} className="social-icon" />
                    </Tooltip>
          </Link>

          <Link
            href="https://www.instagram.com/clubyerbalitobabyfutbol/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "whitesmoke", textDecoration: "none" }}
          >
                    <Tooltip title="Instagram del Club Yerbalito">
                      <InstagramIcon sx={{ color: "whitesmoke" }} className="social-icon" />
                    </Tooltip>
          </Link>

          <Link
            href="https://www.instagram.com/yerbalito.fem/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "whitesmoke", textDecoration: "none" }}
          >
                    <Tooltip title="Instagram Yerbalito Femenino">
                      <InstagramIcon sx={{ color: "whitesmoke" }} className="social-icon" />
                    </Tooltip>
          </Link>
        </Box>
      </Toolbar>
    </Box>
  );
};

export default Footer;
