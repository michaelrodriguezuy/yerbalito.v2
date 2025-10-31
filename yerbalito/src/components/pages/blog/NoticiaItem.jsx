import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../../config/api";
import {
  Typography,
  Paper,
  Box,
  CircularProgress,
  Avatar,
  Chip,
  IconButton,
  Divider,
  Snackbar,
  Alert
} from "@mui/material";
import {
  ArrowBack,
  Person,
  CalendarToday,
  Share
} from "@mui/icons-material";

const NoticiaItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [noticia, setNoticia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    const fetchNoticia = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_ENDPOINTS.NOTICIAS_BY_ID(id));
        setNoticia(response.data.noticia);
      } catch (err) {
        setError("Error al cargar la noticia.");
        console.error("Error fetching noticia:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNoticia();
  }, [id]);

  const handleShare = async () => {
    const shareData = {
      title: noticia.titulo,
      text: noticia.contenido.substring(0, 100) + "...",
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setSnackbar({ open: true, message: "Compartido exitosamente", severity: "success" });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setSnackbar({ open: true, message: "Enlace copiado al portapapeles", severity: "success" });
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setSnackbar({ open: true, message: "Error al compartir", severity: "error" });
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <CircularProgress color="primary" />
      </div>
    );
  }

  if (error || !noticia) {
    return (
      <div className="page-container flex items-center justify-center">
        <Typography variant="h5" color="error">
          {error || "Noticia no encontrada"}
        </Typography>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-container">
        <Box sx={{ mb: 3 }}>
          <IconButton
            onClick={() => navigate("/blogs")}
            sx={{ color: "white", mb: 2 }}
          >
            <ArrowBack />
          </IconButton>
        </Box>

        <Paper
          elevation={3}
          className="content-paper slide-up"
          sx={{
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            padding: { xs: "20px", md: "40px" },
            maxWidth: "95%",
            margin: "0 auto",
            color: "white",
            borderRadius: "20px",
            backdropFilter: "blur(10px)",
            overflow: "visible"
          }}
        >
          {/* Chip de categoría */}
          <Box sx={{ mb: 3 }}>
            <Chip
              label="Noticia"
              sx={{
                backgroundColor: "#4CAF50",
                color: "white",
                fontWeight: "bold",
                fontSize: "0.9rem"
              }}
            />
          </Box>

          {/* Título */}
          <Typography
            variant="h3"
            component="h1"
            sx={{
              color: "white",
              fontWeight: "bold",
              mb: 3,
              lineHeight: 1.2,
              fontSize: { xs: "2rem", md: "3rem" }
            }}
          >
            {noticia.titulo}
          </Typography>

          {/* Información del autor y fecha */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 3, flexWrap: "wrap" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar sx={{ bgcolor: "#4CAF50", width: 40, height: 40 }}>
                <Person />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ color: "white", fontWeight: "bold" }}>
                  {noticia.autor}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarToday sx={{ color: "rgba(255,255,255,0.6)", fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                {new Date(noticia.fecha_creacion).toLocaleDateString("es-UY", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}
              </Typography>
            </Box>

            <Box sx={{ ml: "auto" }}>
              <IconButton
                onClick={handleShare}
                sx={{
                  color: "white",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.2)"
                  }
                }}
              >
                <Share />
              </IconButton>
            </Box>
          </Box>

          <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.1)" }} />

          {/* Imagen */}
          {noticia.imagen && (
            <Box
              component="img"
              src={`${API_ENDPOINTS.UPLOADS}/${noticia.imagen}`}
              alt={noticia.titulo}
              sx={{
                width: "100%",
                maxHeight: "500px",
                objectFit: "cover",
                borderRadius: "10px",
                mb: 4
              }}
            />
          )}

          {/* Contenido */}
          <Typography
            variant="body1"
            sx={{
              color: "rgba(255, 255, 255, 0.9)",
              lineHeight: 1.8,
              fontSize: "1.1rem",
              whiteSpace: "pre-wrap"
            }}
          >
            {noticia.contenido}
          </Typography>

          <Divider sx={{ my: 4, borderColor: "rgba(255,255,255,0.1)" }} />

          {/* Footer */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
              Última actualización: {new Date(noticia.fecha_actualizacion).toLocaleDateString("es-UY")}
            </Typography>
            <IconButton
              onClick={handleShare}
              size="small"
              sx={{ color: "rgba(255,255,255,0.8)" }}
            >
              <Share />
            </IconButton>
          </Box>
        </Paper>
      </div>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default NoticiaItem;
