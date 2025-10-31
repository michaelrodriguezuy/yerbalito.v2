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
  Chip,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { toast } from "sonner";
import axios from "axios";
import { API_ENDPOINTS } from "../../../config/api";

const ValoresManager = () => {
  const [valores, setValores] = useState({
    cuota_club: "",
    fondo_campeonato: "",
    ano: new Date().getFullYear(),
    meses_cuotas: [3, 4, 5, 6, 7, 8, 9, 10, 11], // Marzo a Noviembre por defecto
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchValores();
  }, []);

  const fetchValores = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.VALORES);
      if (response.data.valores) {
        const valoresData = response.data.valores;
        setValores({
          cuota_club: valoresData.cuota_club ?? "",
          fondo_campeonato: valoresData.fondo_campeonato ?? "",
          ano: valoresData.ao ?? new Date().getFullYear(),
          meses_cuotas: valoresData.meses_cuotas || [
            3, 4, 5, 6, 7, 8, 9, 10, 11,
          ],
        });
      }
    } catch (error) {
      console.error("Error fetching valores:", error);
      toast.error("Error al cargar valores");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setValores((prev) => ({ ...prev, [field]: value }));
  };

  const handleMonthToggle = (month) => {
    setValores((prev) => {
      const currentMonths = prev.meses_cuotas || [];
      if (currentMonths.includes(month)) {
        return {
          ...prev,
          meses_cuotas: currentMonths.filter((m) => m !== month),
        };
      } else {
        return { ...prev, meses_cuotas: [...currentMonths, month].sort() };
      }
    });
  };

  const getMonthName = (month) => {
    const months = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    return months[month - 1];
  };

  const handleSave = async () => {
    if (!valores.cuota_club || !valores.fondo_campeonato || !valores.ano) {
      toast.error("Todos los campos son obligatorios");
      return;
    }

    try {
      setSaving(true);
      await axios.post(API_ENDPOINTS.VALORES, valores);
      toast.success("Valores actualizados correctamente");
      fetchValores();
    } catch (error) {
      console.error("Error saving valores:", error);
      toast.error("Error al guardar valores");
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
        Gestión de Valores Anuales
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Configura los valores de cuota del club y fondo de campeonato para el
        año seleccionado. Estos valores se utilizarán al crear recibos de pago.
      </Alert>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Valores para {valores.ano}
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ color: '#ffffff', mb: 0.5 }}>Año</Typography>
              <TextField
                type="number"
                value={valores.ano}
                onChange={(e) => handleChange("ano", parseInt(e.target.value))}
                fullWidth
                required
                placeholder="Año"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    "& input": {
                      color: "#000000 !important",
                    },
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(0, 0, 0, 0.6) !important",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(0, 0, 0, 0.6) !important",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(0, 0, 0, 0.6) !important",
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ color: '#ffffff', mb: 0.5 }}>Cuota del Club ($)</Typography>
              <TextField
                type="number"
                value={valores.cuota_club}
                onChange={(e) =>
                  handleChange("cuota_club", parseFloat(e.target.value))
                }
                fullWidth
                required
                placeholder="Cuota del Club ($)"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    "& input": {
                      color: "#000000 !important",
                    },
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(0, 0, 0, 0.6) !important",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(0, 0, 0, 0.6) !important",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(0, 0, 0, 0.6) !important",
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ color: '#ffffff', mb: 0.5 }}>Fondo de Campeonato ($)</Typography>
              <TextField
                type="number"
                value={valores.fondo_campeonato}
                onChange={(e) =>
                  handleChange("fondo_campeonato", parseFloat(e.target.value))
                }
                fullWidth
                required
                placeholder="Fondo de Campeonato ($)"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    "& input": {
                      color: "#000000 !important",
                    },
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(0, 0, 0, 0.6) !important",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(0, 0, 0, 0.6) !important",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(0, 0, 0, 0.6) !important",
                  },
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Meses de Cuotas del Club
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Selecciona los meses en los que se cobrarán las cuotas del club:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => {
                  const isSelected = valores.meses_cuotas?.includes(month);
                  return (
                    <Chip
                      key={month}
                      label={getMonthName(month)}
                      onClick={() => handleMonthToggle(month)}
                      sx={{
                        mb: 1,
                        backgroundColor: isSelected
                          ? "#4CAF50"
                          : "rgba(0,0,0,0.85)",
                        color: "white",
                        border: "none",
                        fontWeight: isSelected ? "bold" : "normal",
                        "&:hover": {
                          backgroundColor: isSelected
                            ? "#388E3C"
                            : "rgba(0,0,0,0.95)",
                          transform: "scale(1.05)",
                        },
                        transition: "all 0.2s ease",
                      }}
                    />
                  );
                })}
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              size="large"
            >
              {saving ? "Guardando..." : "Guardar Valores"}
            </Button>

            <Button
              variant="outlined"
              onClick={fetchValores}
              disabled={saving}
              size="large"
            >
              Recargar
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Alert
        severity="warning"
        sx={{
          backgroundColor: "rgba(255, 152, 0, 0.1)",
          border: "1px solid #FF9800",
          "& .MuiAlert-message": {
            color: "#E65100",
            fontWeight: "500",
          },
        }}
      >
        <Typography
          variant="body2"
          sx={{ color: "#E65100", fontWeight: "500" }}
        >
          <strong>Importante:</strong> Los valores configurados aquí se
          aplicarán automáticamente al crear nuevos recibos de pago. Asegúrate
          de actualizar estos valores al inicio de cada año.
        </Typography>
      </Alert>
    </Box>
  );
};

export default ValoresManager;
