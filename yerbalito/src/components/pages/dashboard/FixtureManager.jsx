import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
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
      const response = await axios.get(API_ENDPOINTS.FIXTURE_CATEGORIAS);
      setCategorias(response.data.categorias);
    } catch (error) {
      console.error("Error fetching categorias:", error);
      toast.error("Error al cargar categorías");
    }
  };

  const fetchFixtures = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.FIXTURE);
      const fixturesData = response.data.fixture || [];

      // Crear un mapa de fixtures por categoría
      const fixturesMap = {};
      fixturesData.forEach((fixture) => {
        fixturesMap[fixture.categoria_id] = {
          ...fixture,
          proximo_partido: fixture.proximo_partido
            ? JSON.parse(fixture.proximo_partido)
            : {},
          ultimo_resultado: fixture.ultimo_resultado
            ? JSON.parse(fixture.ultimo_resultado)
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

  const handleFixtureChange = (categoriaId, field, value) => {
    setFixtures((prev) => ({
      ...prev,
      [categoriaId]: {
        ...prev[categoriaId],
        [field]: value,
      },
    }));
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

      // Preparar datos para envío
      const fixturesToSave = categorias.map((categoria) => {
        const fixture = fixtures[categoria.idcategoria] || {
          categoria_id: categoria.idcategoria,
          categoria_nombre: categoria.nombre_categoria,
          proximo_partido: {},
          ultimo_resultado: {},
          horario: "",
        };

        return {
          categoria_id: fixture.categoria_id,
          categoria_nombre: fixture.categoria_nombre,
          proximo_partido: fixture.proximo_partido || {},
          ultimo_resultado: fixture.ultimo_resultado || {},
          horario: fixture.horario || "",
        };
      });

      await axios.post(API_ENDPOINTS.FIXTURE_BULK, {
        fixtures: fixturesToSave,
      });
      toast.success("Fixture actualizado correctamente");
      fetchFixtures();
    } catch (error) {
      console.error("Error saving fixtures:", error);
      toast.error("Error al guardar fixtures");
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
          {saving ? "Guardando..." : "Guardar el Fixture"}
        </Button>
      </Box>

      {categorias.map((categoria) => {
        const fixture = fixtures[categoria.idcategoria] || {
          categoria_id: categoria.idcategoria,
          categoria_nombre: categoria.nombre_categoria,
          proximo_partido: {},
          ultimo_resultado: {},
          horario: "",
        };

        return (
          <Accordion key={categoria.idcategoria} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="h6">
                  {categoria.nombre_categoria}
                </Typography>
                {fixture.horario && (
                  <Chip
                    label={`Horario: ${fixture.horario}`}
                    size="small"
                    sx={{ backgroundColor: "#4CAF50", color: "white" }}
                  />
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                {/* Horario */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Horario de Juego"
                    value={fixture.horario || ""}
                    onChange={(e) =>
                      handleFixtureChange(
                        categoria.idcategoria,
                        "horario",
                        e.target.value
                      )
                    }
                    fullWidth
                    placeholder="Ej: Sábados 10:00"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        "& input": { color: "#000000 !important" },
                      },
                      "& .MuiInputLabel-root": {
                        color: "rgba(0, 0, 0, 0.7) !important",
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(0, 0, 0, 0.6) !important",
                      },
                    }}
                  />
                </Grid>

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
                            label="Resultado"
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
                            placeholder="Ej: Yerbalito 2-1 Central"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                backgroundColor: "rgba(255, 255, 255, 0.95)",
                                "& input": { color: "#000000 !important" },
                              },
                              "& .MuiInputLabel-root": {
                                color: "rgba(0, 0, 0, 0.7) !important",
                              },
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "rgba(0, 0, 0, 0.6) !important",
                              },
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Fecha"
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
                            InputLabelProps={{ shrink: true }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                backgroundColor: "rgba(255, 255, 255, 0.95)",
                                "& input": { color: "#000000 !important" },
                              },
                              "& .MuiInputLabel-root": {
                                color: "rgba(0, 0, 0, 0.7) !important",
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
                            label="Equipos"
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
                            placeholder="Ej: Yerbalito vs Deportivo"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                backgroundColor: "rgba(255, 255, 255, 0.95)",
                                "& input": { color: "#000000 !important" },
                              },
                              "& .MuiInputLabel-root": {
                                color: "rgba(0, 0, 0, 0.7) !important",
                              },
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "rgba(0, 0, 0, 0.6) !important",
                              },
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Fecha"
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
                            InputLabelProps={{ shrink: true }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                backgroundColor: "rgba(255, 255, 255, 0.95)",
                                "& input": { color: "#000000 !important" },
                              },
                              "& .MuiInputLabel-root": {
                                color: "rgba(0, 0, 0, 0.7) !important",
                              },
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "rgba(0, 0, 0, 0.6) !important",
                              },
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Hora"
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
                            InputLabelProps={{ shrink: true }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                backgroundColor: "rgba(255, 255, 255, 0.95)",
                                "& input": { color: "#000000 !important" },
                              },
                              "& .MuiInputLabel-root": {
                                color: "rgba(0, 0, 0, 0.7) !important",
                              },
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: "rgba(0, 0, 0, 0.6) !important",
                              },
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Lugar"
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
                            placeholder="Ej: Cancha Principal - Club Yerbalito"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                backgroundColor: "rgba(255, 255, 255, 0.95)",
                                "& input": { color: "#000000 !important" },
                              },
                              "& .MuiInputLabel-root": {
                                color: "rgba(0, 0, 0, 0.7) !important",
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
