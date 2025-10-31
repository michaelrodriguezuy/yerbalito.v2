import { useEffect, useState } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../../config/api";
import {
  Typography,
  Paper,
  Box,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Grid,
  Avatar,
  Divider,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import { Link } from "react-router-dom";
import { Person, Share } from "@mui/icons-material";
import "./Blog.css";

const Blogs = () => {
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [blogsResponse, noticiasResponse] = await Promise.all([
          axios.get(API_ENDPOINTS.POSTS),
          axios.get(API_ENDPOINTS.NOTICIAS),
        ]);

        const blogs = (blogsResponse.data.posts || []).map((item) => ({
          ...item,
          id: item.idblog,
          tipo: "Blog",
          linkBase: "/blog",
        }));

        const noticias = (noticiasResponse.data.noticias || []).map((item) => ({
          ...item,
          id: item.idnoticia,
          tipo: "Noticias",
          linkBase: "/noticia",
        }));

        const combined = [...blogs, ...noticias].sort(
          (a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion)
        );

        setAllItems(combined);
      } catch (err) {
        setError("Error al cargar las entradas.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const categories = ["all", "Noticias", "Blog"];

  const filteredItems =
    selectedCategory === "all"
      ? allItems
      : allItems.filter((item) => item.tipo === selectedCategory);

  const handleShare = async (item) => {
    const shareData = {
      title: item.titulo,
      text: item.contenido.substring(0, 100) + "...",
      url: `${window.location.origin}${item.linkBase}/${item.id}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setSnackbar({
          open: true,
          message: "Compartido exitosamente",
          severity: "success",
        });
      } else {
        await navigator.clipboard.writeText(shareData.url);
        setSnackbar({
          open: true,
          message: "Enlace copiado al portapapeles",
          severity: "success",
        });
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setSnackbar({
          open: true,
          message: "Error al compartir",
          severity: "error",
        });
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

  if (error) {
    return (
      <div className="page-container flex items-center justify-center">
        <Typography variant="h5" color="error">
          {error}
        </Typography>
      </div>
    );
  }

  return (
    <div className="page-container-scroll">
      <div className="content-container">
        {/* Header inspirado en alexandergarcia.me */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: "2.5rem", md: "4rem" },
              fontWeight: 800,
              background: "linear-gradient(45deg, #4CAF50, #ffffff)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 2,
              textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            Noticias & Blogs
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: "rgba(255,255,255,0.8)",
              fontWeight: 300,
              maxWidth: "600px",
              mx: "auto",
              mb: 3,
            }}
          >
            Mantente al día con las últimas novedades del Club Yerbalito
          </Typography>
        </Box>

        {/* Filtros de categoría */}
        <Box
          sx={{
            mb: 4,
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          {categories.map((category) => (
            <Chip
              key={category}
              label={category === "all" ? "Todas" : category}
              onClick={() => setSelectedCategory(category)}
              sx={{
                backgroundColor:
                  selectedCategory === category
                    ? "#4CAF50"
                    : "rgba(255,255,255,0.1)",
                color: "white",
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor:
                    selectedCategory === category
                      ? "#388E3C"
                      : "rgba(255,255,255,0.2)",
                },
              }}
            />
          ))}
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
            backdropFilter: "blur(10px)",
          }}
        >
          {filteredItems.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography
                variant="h4"
                sx={{ color: "rgba(255,255,255,0.6)", mb: 2 }}
              >
                📝
              </Typography>
              <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.8)" }}>
                No hay entradas disponibles en esta categoría.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={4}>
              {filteredItems.map((item, index) => (
                <Grid
                  item
                  xs={12}
                  md={index === 0 ? 12 : 6}
                  lg={index === 0 ? 8 : 4}
                  key={`${item.tipo}-${item.id}`}
                >
                  <Card
                    sx={{
                      height: "100%",
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
                        border: "1px solid rgba(76, 175, 80, 0.5)",
                      },
                    }}
                  >
                    {item.imagen && (
                      <CardMedia
                        component="img"
                        height={index === 0 ? 300 : 200}
                        image={`${API_ENDPOINTS.UPLOADS}/${item.imagen}`}
                        alt={item.titulo}
                        sx={{
                          objectFit: "cover",
                          position: "relative",
                          "&::after": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background:
                              "linear-gradient(to bottom, transparent, rgba(0,0,0,0.7))",
                          },
                        }}
                      />
                    )}
                    <CardContent sx={{ p: 3 }}>
                      {/* Header del post */}
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: "#4CAF50",
                            mr: 2,
                            width: 40,
                            height: 40,
                          }}
                        >
                          <Person />
                        </Avatar>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{ color: "white", fontWeight: "bold" }}
                          >
                            {item.autor}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "rgba(255,255,255,0.6)" }}
                          >
                            {new Date(item.fecha_creacion).toLocaleDateString(
                              "es-UY",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </Typography>
                        </Box>
                        <Box sx={{ ml: "auto" }}>
                          <Chip
                            label={item.tipo}
                            size="small"
                            sx={{
                              backgroundColor:
                                item.tipo === "Blog" ? "#FFC107" : "#4CAF50",
                              color: "white",
                              fontWeight: "bold",
                            }}
                          />
                        </Box>
                      </Box>

                      <Typography
                        variant={index === 0 ? "h4" : "h6"}
                        component="h2"
                        gutterBottom
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          mb: 2,
                          lineHeight: 1.2,
                        }}
                      >
                        {item.titulo}
                      </Typography>

                      <Typography
                        variant="body1"
                        sx={{
                          color: "rgba(255, 255, 255, 0.8)",
                          mb: 3,
                          display: "-webkit-box",
                          WebkitLineClamp: index === 0 ? 4 : 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          lineHeight: 1.6,
                        }}
                      >
                        {item.contenido}
                      </Typography>

                      <Divider
                        sx={{ my: 2, borderColor: "rgba(255,255,255,0.1)" }}
                      />

                      {/* Footer del post */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => handleShare(item)}
                          sx={{
                            color: "white",
                            backgroundColor: "rgba(255,255,255,0.1)",
                            "&:hover": {
                              backgroundColor: "rgba(255,255,255,0.2)",
                            },
                          }}
                        >
                          <Share />
                        </IconButton>
                        <Button
                          component={Link}
                          to={`${item.linkBase}/${item.id}`}
                          variant="contained"
                          size="small"
                          sx={{
                            backgroundColor:
                              item.tipo === "Blog" ? "#FFC107" : "#4CAF50",
                            borderRadius: "20px",
                            px: 3,
                            "&:hover": {
                              backgroundColor:
                                item.tipo === "Blog" ? "#FFA000" : "#388E3C",
                              transform: "scale(1.05)",
                            },
                          }}
                        >
                          Leer más
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </div>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Blogs;
