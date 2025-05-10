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
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(5px)",
        color: "whitesmoke",
        boxShadow: "0px -2px 10px rgba(0, 0, 0, 0.2)",
        height: "40px",
        marginTop: "auto"
      }}
    >
      <p>© 2023 Yerbalito.</p>

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
          }}
        >
          <Link
            href="https://api.whatsapp.com/send?phone=59899163200&text=Hola%20Yerbalito"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "whitesmoke", textDecoration: "none" }}
          >
            <Tooltip title="Envia un whatsapp">
              <WhatsAppIcon sx={{ color: "whitesmoke" }} />
            </Tooltip>
          </Link>

          <Link
            href="https://www.facebook.com/Clubyerbalitodebabyfutbol/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "whitesmoke", textDecoration: "none" }}
          >
            <Tooltip title="Contactanos por facebook">
              <FacebookIcon sx={{ color: "whitesmoke" }} />
            </Tooltip>
          </Link>

          <Link
            href="https://www.instagram.com/clubyerbalitobabyfutbol/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "whitesmoke", textDecoration: "none" }}
          >
            <Tooltip title="Contactanos por instagram">
              <InstagramIcon sx={{ color: "whitesmoke" }} />
            </Tooltip>
          </Link>

          <Link
            href="https://www.instagram.com/yerbalito.fem/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "whitesmoke", textDecoration: "none" }}
          >
            <Tooltip title="Contactanos por instagram">
              <InstagramIcon sx={{ color: "whitesmoke" }} />
            </Tooltip>
          </Link>
        </Box>
      </Toolbar>
    </Box>
  );
};

export default Footer;
