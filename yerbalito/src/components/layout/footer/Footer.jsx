import { Box, Toolbar, Tooltip } from "@mui/material";
import { Link } from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";

const Footer = () => {
  return (
    <>
      <Box
        component="footer"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "5px",
          bottom: 0,
          left: 0,
          width: "100%",
          zIndex: 1,
          backgroundColor: "transparent",
          color: "whitesmoke",
          position: "fixed",
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

            {/*  */}
          </Box>
        </Toolbar>
      </Box>
    </>
  );
};

export default Footer;
