import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { toast } from "sonner";
import axios from "axios";
import { API_ENDPOINTS } from "../../../config/api";

const FixtureManager = () => {
  const [categorias, setCategorias] = useState([]);
  const [fixtures, setFixtures] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategorias();
    fetchFixtures();
  }, []);

  const fetchCategorias = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.FIXTURE_CATEGORIAS, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      setCategorias(response.data.categorias);
    } catch (error) {
      console.error("Error fetching categorias:", error);
      toast.error("Error al cargar categorías");
    }
  };

  const fetchFixtures = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.FIXTURE, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      const fixturesData = response.data.fixture || [];

      // Crear un mapa de fixtures por categoría
      const fixturesMap = {};
      fixturesData.forEach((fixture) => {
        fixturesMap[fixture.categoria_id] = {
          ...fixture,
          proximo_partido: fixture.proximo_partido
            ? (typeof fixture.proximo_partido === 'string' ? JSON.parse(fixture.proximo_partido) : fixture.proximo_partido)
            : {},
          ultimo_resultado: fixture.ultimo_resultado
            ? (typeof fixture.ultimo_resultado === 'string' ? JSON.parse(fixture.ultimo_resultado) : fixture.ultimo_resultado)
            : {},
        };
      });

      setFixtures(fixturesMap);
    } catch (error) {
      console.error("Error fetching fixtures:", error);
      toast.error("Error al cargar fixtures");
    } finally {
      setLoading(false);
    }
  };

  const handlePartidoChange = (categoriaId, tipo, field, value) => {
    setFixtures((prev) => ({
      ...prev,
      [categoriaId]: {
        ...prev[categoriaId],
        [tipo]: {
          ...prev[categoriaId]?.[tipo],
          [field]: value,
        },
      },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Preparar datos para envío - SOLO categorías con datos reales
      const fixturesToSave = categorias
        .map((categoria) => {
          const fixture = fixtures[categoria.idcategoria];
          
          // Si no existe fixture para esta categoría, saltar
          if (!fixture) return null;
          
          const hasProximoPartido = fixture.proximo_partido?.equipos || 
                                    fixture.proximo_partido?.fecha || 
                                    fixture.proximo_partido?.hora || 
                                    fixture.proximo_partido?.lugar;
          
          const hasUltimoResultado = fixture.ultimo_resultado?.resultado || 
                                     fixture.ultimo_resultado?.fecha;
          
          // Solo incluir si tiene al menos un dato
          if (!hasProximoPartido && !hasUltimoResultado) {
            return null;
          }

          return {
            categoria_id: categoria.idcategoria,
            categoria_nombre: categoria.nombre_categoria,
            proximo_partido: fixture.proximo_partido || {},
            ultimo_resultado: fixture.ultimo_resultado || {},
          };
        })
        .filter(Boolean); // Eliminar nulls

      if (fixturesToSave.length === 0) {
        toast.warning("No hay datos para guardar");
        return;
      }

      console.log("Enviando fixtures:", fixturesToSave);

      await axios.post(API_ENDPOINTS.FIXTURE_BULK, {
        fixtures: fixturesToSave,
      });
      toast.success(`${fixturesToSave.length} fixture(s) actualizado(s) correctamente`);
      fetchFixtures();
    } catch (error) {
      console.error("Error saving fixtures:", error);
      const errorMsg = error.response?.data?.details || error.response?.data?.error || "Error al guardar fixtures";
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box
        className="page-container-scroll"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="page-container-scroll slide-up">
      <Typography variant="h4" gutterBottom>
        Gestión del Fixture
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Configura los resultados pasados y próximos partidos para cada
        categoría. Esta información se mostrará en el modal del fixture del
        sitio.
      </Alert>

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          sx={{
            backgroundColor: "#4CAF50",
            "&:hover": { backgroundColor: "#45a049" },
          }}
        >
          {saving ? "Guardando..." : "Actualizar el Fixture"}
        </Button>
      </Box>

      {categorias.map((categoria) => {
        const fixture = fixtures[categoria.idcategoria] || {
          categoria_id: categoria.idcategoria,
          categoria_nombre: categoria.nombre_categoria,
          proximo_partido: {},
          ultimo_resultado: {},
        };

        return (
          <Accordion key={categoria.idcategoria} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                {categoria.nombre_categoria}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                {/* Último Resultado */}
                <Grid item xs={12}>
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary">
                        ⚽ Último Resultado
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            value={fixture.ultimo_resultado?.resultado || ""}
                            onChange={(e) =>
                              handlePartidoChange(
                                categoria.idcategoria,
                                "ultimo_resultado",
                                "resultado",
                                e.target.value
                              )
                            }
                            fullWidth
                            placeholder="Resultado (Ej: Yerbalito 2-1 Central)"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                backgroundColor: "rgba(255, 255, 255, 0.95)",
                                "& input": { color: "#000000 !important" },
                              },
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "rgba(0, 0, 0, 0.6) !important",
                              },
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" sx={{ color: '#ffffff', mb: 0.5 }}>Fecha</Typography>
                          <TextField
                            type="date"
                            value={fixture.ultimo_resultado?.fecha || ""}
                            onChange={(e) =>
                              handlePartidoChange(
                                categoria.idcategoria,
                                "ultimo_resultado",
                                "fecha",
                                e.target.value
                              )
                            }
                            fullWidth
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                backgroundColor: "rgba(255, 255, 255, 0.95)",
                                "& input": { color: "#000000 !important" },
                              },
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "rgba(0, 0, 0, 0.6) !important",
                              },
                            }}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Próximo Partido */}
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary">
                        📅 Próximo Partido
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            value={fixture.proximo_partido?.equipos || ""}
                            onChange={(e) =>
                              handlePartidoChange(
                                categoria.idcategoria,
                                "proximo_partido",
                                "equipos",
                                e.target.value
                              )
                            }
                            fullWidth
                            placeholder="Equipos (Ej: Yerbalito vs Deportivo)"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                backgroundColor: "rgba(255, 255, 255, 0.95)",
                                "& input": { color: "#000000 !important" },
                              },
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "rgba(0, 0, 0, 0.6) !important",
                              },
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" sx={{ color: '#ffffff', mb: 0.5 }}>Fecha</Typography>
                          <TextField
                            type="date"
                            value={fixture.proximo_partido?.fecha || ""}
                            onChange={(e) =>
                              handlePartidoChange(
                                categoria.idcategoria,
                                "proximo_partido",
                                "fecha",
                                e.target.value
                              )
                            }
                            fullWidth
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                backgroundColor: "rgba(255, 255, 255, 0.95)",
                                "& input": { color: "#000000 !important" },
                              },
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "rgba(0, 0, 0, 0.6) !important",
                              },
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" sx={{ color: '#ffffff', mb: 0.5 }}>Hora</Typography>
                          <TextField
                            type="time"
                            value={fixture.proximo_partido?.hora || ""}
                            onChange={(e) =>
                              handlePartidoChange(
                                categoria.idcategoria,
                                "proximo_partido",
                                "hora",
                                e.target.value
                              )
                            }
                            fullWidth
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                backgroundColor: "rgba(255, 255, 255, 0.95)",
                                "& input": { color: "#000000 !important" },
                              },
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "rgba(0, 0, 0, 0.6) !important",
                              },
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            value={fixture.proximo_partido?.lugar || ""}
                            onChange={(e) =>
                              handlePartidoChange(
                                categoria.idcategoria,
                                "proximo_partido",
                                "lugar",
                                e.target.value
                              )
                            }
                            fullWidth
                            placeholder="Lugar (Ej: Cancha de Yerbalito)"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                backgroundColor: "rgba(255, 255, 255, 0.95)",
                                "& input": { color: "#000000 !important" },
                              },
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "rgba(0, 0, 0, 0.6) !important",
                              },
                            }}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};

export default FixtureManager;
