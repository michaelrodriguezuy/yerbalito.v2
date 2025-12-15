import { API_ENDPOINTS } from "../../../config/api";
import React, { useEffect, useState, useContext, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
  Modal,
  Box,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  FormControl,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { Link } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { toast } from "sonner";

import { AuthContext } from "../../../context/AuthContext";
import QuotaSelector from "./QuotaSelector";
import SelectionSummaryFC from "./SelectionSummaryFC";
// Gráficos removidos - se muestran en Reports

const FondoCamp = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [payments, setPayments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showComprobanteModal, setShowComprobanteModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [fcIdComprobante, setFcIdComprobante] = useState(null);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(true);

  // Estilos comunes para TextField
  const textFieldStyles = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      "& input": {
        color: "#000000 !important",
      },
    },
    "& .MuiInputLabel-root": {
      color: "rgba(0, 0, 0, 0.6) !important",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(0, 0, 0, 0.23) !important",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(0, 0, 0, 0.4) !important",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(0, 0, 0, 0.6) !important",
    },
  };

  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [playerPayments, setPlayerPayments] = useState([]);
  const [paidQuotas, setPaidQuotas] = useState([]); // Cuotas ya pagadas del jugador seleccionado
  const [availableYears, setAvailableYears] = useState([]); // años con deudas disponibles
  const [pagarAmbasCuotas, setPagarAmbasCuotas] = useState(false); // Checkbox para pagar ambas cuotas
  const [formData, setFormData] = useState({
    idjugador: "",
    monto: "",
    cuota_paga: "",
    anio: new Date().getFullYear(),
    observaciones: "",
  });
  const [valores, setValores] = useState(null);
  const [valoresByYear, setValoresByYear] = useState({});
  const [selectedQuotas, setSelectedQuotas] = useState([]);

  const { user } = useContext(AuthContext);

  // Refs para evitar re-renders innecesarios
  const observacionesRef = useRef('');
  const montoRef = useRef('');

  useEffect(() => {
    fetchPayments();
    fetchValores();
  }, [searchTerm]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.FC);

      if (searchTerm) {
        const filtered = response.data.payments.filter(
          (payment) =>
            payment.nombre_jugador
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            payment.apellido_jugador
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
        );
        setPayments(filtered);
      } else {
        setPayments(response.data.payments);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching payments: ", error);
      setLoading(false);
    }
  };

  const fetchValores = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.VALORES);
      setValores(response.data.valores);
    } catch (error) {
      console.error("Error fetching valores:", error);
    }
  };

  // Cargar valores por año
  useEffect(() => {
    const fetchValoresHistory = async () => {
      try {
        const response = await axios.get(`${API_ENDPOINTS.VALORES}/history`);
        const valoresData = response.data.valores || [];
        
        const valoresByYearMap = {};
        valoresData.forEach(val => {
          const year = new Date(val.fecha_vigencia).getFullYear();
          if (!valoresByYearMap[year] || new Date(val.fecha_vigencia) > new Date(valoresByYearMap[year].fecha_vigencia)) {
            valoresByYearMap[year] = val;
          }
        });
        
        setValoresByYear(valoresByYearMap);
      } catch (error) {
        console.error("Error fetching valores history:", error);
      }
    };
    
    if (valores) {
      fetchValoresHistory();
    }
  }, [valores]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este recibo?")) {
      try {
        await axios.delete(`${API_ENDPOINTS.FC}/${id}`);
        const response = await axios.get(API_ENDPOINTS.FC);
        setPayments(response.data.payments);
        toast.success("Recibo eliminado correctamente");
      } catch (error) {
        console.error("Error deleting payment: ", error);
        toast.error("Error al eliminar el recibo");
      }
    }
  };

  const handleEdit = (payment) => {
    // TODO: Implementar edición de recibo
    toast.info("La funcionalidad de edición estará disponible pronto");
  };

  const handleCreate = () => {
    setShowModal(true);
    fetchPlayers();
    console.log(playerPayments);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPlayer("");
    setPaidQuotas([]);
    setAvailableYears([]);
    setPagarAmbasCuotas(false);
    setSelectedQuotas([]);
    observacionesRef.current = '';
    montoRef.current = '';
    setFormData({
      idjugador: "",
      monto: "",
      cuota_paga: "",
      anio: new Date().getFullYear(),
      observaciones: "",
    });
  };

  const handlePlayerSelectChange = async (event) => {
    const playerId = event.target.value;
    setSelectedPlayer(playerId);
    
    // Verificar qué cuotas ya tiene pagadas el jugador (revisar todos los años)
    if (playerId) {
      try {
        // Obtener todos los pagos del jugador (sin filtrar por año inicialmente)
        const response = await axios.get(`${API_ENDPOINTS.FC}?playerId=${playerId}`);
        const allPlayerFCPayments = response.data.payments || [];
        
        // Determinar el año a sugerir:
        // 1. Revisar desde el año más antiguo con pagos hasta el año actual
        const currentYear = new Date().getFullYear();
        const yearsWithPayments = [...new Set(allPlayerFCPayments.map(p => parseInt(p.anio)))].sort();
        const startYear = yearsWithPayments.length > 0 ? Math.min(...yearsWithPayments) : currentYear;
        
        let suggestedYear = currentYear;
        let availableQuotas = [1, 2];
        let paidQuotasForYear = [];
        const yearsWithDebt = [];
        
        // Revisar desde el año más antiguo hasta el actual
        for (let year = startYear; year <= currentYear; year++) {
          const paidQuotasThisYear = allPlayerFCPayments
            .filter(payment => parseInt(payment.anio) === year)
            .map((payment) => parseInt(payment.cuota_paga))
            .filter(cuota => !isNaN(cuota) && (cuota === 1 || cuota === 2))
            .sort((a, b) => a - b);
          
          const availableForYear = [1, 2].filter(cuota => !paidQuotasThisYear.includes(cuota));
          
          if (availableForYear.length > 0) {
            yearsWithDebt.push(year);
            if (!suggestedYear || year < suggestedYear) {
              suggestedYear = year;
              availableQuotas = availableForYear;
              paidQuotasForYear = paidQuotasThisYear;
            }
          }
        }
        
        // Siempre incluir el año actual en la lista
        if (!yearsWithDebt.includes(currentYear)) {
          yearsWithDebt.push(currentYear);
        }
        
        setAvailableYears(yearsWithDebt.sort((a, b) => a - b));
        
        // Si no hay cuotas sin pagar en ningún año, revisar el año actual
        if (availableQuotas.length === 0) {
          suggestedYear = currentYear;
          const paidQuotasThisYear = allPlayerFCPayments
            .filter(payment => parseInt(payment.anio) === currentYear)
            .map((payment) => parseInt(payment.cuota_paga))
            .filter(cuota => !isNaN(cuota) && (cuota === 1 || cuota === 2));
          
          paidQuotasForYear = paidQuotasThisYear;
          availableQuotas = [1, 2].filter(cuota => !paidQuotasThisYear.includes(cuota));
          
          if (availableQuotas.length === 0) {
            setPaidQuotas(paidQuotasThisYear);
            setFormData((prev) => ({
              ...prev,
              idjugador: playerId,
              monto: "0",
              cuota_paga: "",
              anio: currentYear,
            }));
            // Cerrar el modal primero y luego mostrar el toast
            handleCloseModal();
            setTimeout(() => {
              toast.info("Este jugador ya tiene las 2 cuotas del Fondo de Campeonato pagadas para este año");
            }, 100);
            return;
          }
        }
        
        setPaidQuotas(paidQuotasForYear);
        setSelectedQuotas([]); // No preseleccionar cuotas
        
        setFormData((prev) => ({
          ...prev,
          idjugador: playerId,
          monto: "",
          cuota_paga: "",
          anio: suggestedYear,
        }));
      } catch (error) {
        console.error("Error checking FC payments:", error);
        // Si hay error, no preseleccionar nada
        setPaidQuotas([]);
        setAvailableYears([new Date().getFullYear()]);
        setSelectedQuotas([]);
        
        setFormData((prev) => ({
          ...prev,
          idjugador: playerId,
          monto: "",
          cuota_paga: "",
          anio: new Date().getFullYear(),
        }));
      }
    } else {
      setPaidQuotas([]);
      setAvailableYears([]);
      setSelectedQuotas([]);
    }
  };

  const handleFormChange = async (field, value) => {
    if (field === "observaciones") {
      observacionesRef.current = value;
      return;
    }

    if (field === "monto") {
      montoRef.current = value;
      setFormData((prev) => ({ ...prev, monto: value }));
      return;
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Si cambia el año manualmente, actualizar las cuotas pagadas de ese año
    if (field === "anio" && formData.idjugador) {
      try {
        const response = await axios.get(
          `${API_ENDPOINTS.FC}?playerId=${formData.idjugador}&year=${value}`
        );
        const playerFCPayments = response.data.payments || [];
        const paidQuotasList = playerFCPayments
          .map((payment) => parseInt(payment.cuota_paga))
          .filter(cuota => !isNaN(cuota) && (cuota === 1 || cuota === 2));
        setPaidQuotas(paidQuotasList);
        setSelectedQuotas([]); // Limpiar selección al cambiar año
      } catch (error) {
        console.error("Error fetching FC payments for year:", error);
        setPaidQuotas([]);
      }
    }
  };

  // Handler para toggle de cuotas (con useCallback para performance)
  const handleQuotaToggle = useCallback((quota) => {
    setSelectedQuotas(prev => {
      const newSelection = prev.includes(quota)
        ? prev.filter(q => q !== quota)
        : [...prev, quota].sort();
      
      // Recalcular monto según cuotas seleccionadas
      const yearValores = valoresByYear[formData.anio] || valores;
      const fondoTotal = yearValores?.fondo_campeonato || 0;
      const montoPorCuota = fondoTotal / 2;
      const montoTotal = newSelection.length * montoPorCuota;
      
      setFormData(prev => ({
        ...prev,
        monto: montoTotal.toString()
      }));
      
      return newSelection;
    });
  }, [formData.anio, valores, valoresByYear]);

  const handleObservacionesChange = useCallback((value) => {
    observacionesRef.current = value;
  }, []);

  const handleMontoChange = useCallback((value) => {
    montoRef.current = value;
    setFormData(prev => ({ ...prev, monto: value }));
  }, []);

  const handleSubmitPayment = async () => {
    try {
      if (!formData.idjugador) {
        toast.error("Selecciona un jugador");
        return;
      }

      if (selectedQuotas.length === 0 && !pagarAmbasCuotas) {
        toast.error("Selecciona al menos una cuota a pagar");
        return;
      }

      // Determinar cuotas a pagar
      let cuotasAPagar = pagarAmbasCuotas 
        ? [1, 2].filter(cuota => !paidQuotas.includes(cuota))
        : selectedQuotas;

      if (cuotasAPagar.length === 0) {
        toast.error("Todas las cuotas ya están pagadas");
        return;
      }

      // Calcular monto según valores del año seleccionado
      const yearValores = valoresByYear[formData.anio] || valores;
      const fondoTotal = yearValores?.fondo_campeonato || 0;
      const montoPorCuota = fondoTotal / 2;
      
      // Verificar si el usuario modificó el monto manualmente
      const montoCalculado = cuotasAPagar.length * montoPorCuota;
      const montoUsuario = parseFloat(formData.monto) || 0;
      const esMontoModificado = Math.abs(montoUsuario - montoCalculado) > 0.01;

      if (!montoUsuario || montoUsuario === 0) {
        toast.error("El monto total debe ser mayor a 0");
        return;
      }

      let ultimoFcId = null;
      
      if (cuotasAPagar.length > 1) {
        // Pagar múltiples cuotas
        const montoPorCuotaFinal = esMontoModificado 
          ? montoUsuario / cuotasAPagar.length 
          : montoPorCuota;

        const payment = {
          idjugador: formData.idjugador,
          monto: parseFloat(montoPorCuotaFinal.toFixed(2)),
          cuotas: cuotasAPagar,
          anio: formData.anio,
          observaciones: observacionesRef.current || '',
          idusuario: user.id,
        };

        const response = await axios.post(API_ENDPOINTS.FC_MULTIPLE, payment);
        toast.success(`¡Recibos de fondo de campeonato creados correctamente! (${cuotasAPagar.length} cuotas)`);
        
        if (response.data.recibos && response.data.recibos.length > 0) {
          ultimoFcId = response.data.recibos[0].id_fondo;
        }
      } else {
        // Pagar una sola cuota
        const cuotaPagar = cuotasAPagar[0];

        if (paidQuotas.includes(cuotaPagar)) {
          toast.error(`La cuota ${cuotaPagar}/2 ya está pagada para este jugador en el año ${formData.anio}`);
          return;
        }

        const montoFinal = esMontoModificado ? montoUsuario : montoPorCuota;

        const payment = {
          idjugador: formData.idjugador,
          monto: parseFloat(montoFinal.toFixed(2)),
          cuota_paga: cuotaPagar,
          anio: formData.anio,
          observaciones: observacionesRef.current || '',
          idusuario: user.id,
        };

        const response = await axios.post(API_ENDPOINTS.FC, payment);
        toast.success(`¡Recibo de fondo de campeonato (Cuota ${cuotaPagar}/2) creado correctamente!`);
        
        if (response.data.id_fondo) {
          ultimoFcId = response.data.id_fondo;
        }
      }
      
      handleCloseModal();
      fetchPayments();
      
      if (ultimoFcId) {
        setFcIdComprobante(ultimoFcId);
        setShowComprobanteModal(true);
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      const errorMsg = error.response?.data?.error || "No se pudo crear el recibo.";
      toast.error(errorMsg);
    }
  };

  const fetchPlayers = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.SQUAD_ALL);
      // NOTA: Todos los jugadores deben pagar fondo de campeonato, incluso los exonerados
      // La exoneración (estado=3) solo aplica a la cuota del club, no al fondo de campeonato
      // El backend ya trae los datos ordenados alfabéticamente por apellido y nombre
      const players = response.data.squads || [];
      setPlayerPayments(players);
    } catch (error) {
      console.error("Error fetching players: ", error);
    }
  };

  // Componente memoizado para el campo de Monto
  const MontoFieldFC = React.memo(({ initialValue, onValueChange }) => {
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
      setValue(initialValue);
    }, [initialValue]);

    const handleChange = useCallback((e) => {
      const newValue = e.target.value;
      setValue(newValue);
      onValueChange(newValue);
    }, [onValueChange]);

    return (
      <TextField
        label="Monto Total"
        variant="outlined"
        type="number"
        value={value}
        onChange={handleChange}
        fullWidth
        InputProps={{
          sx: {
            color: '#000',
          }
        }}
        sx={textFieldStyles}
      />
    );
  });

  MontoFieldFC.displayName = 'MontoFieldFC';

  // Componente memoizado para el campo de Observaciones
  const ObservacionesFieldFC = React.memo(({ onValueChange }) => {
    const [value, setValue] = useState('');

    const handleChange = useCallback((e) => {
      const newValue = e.target.value;
      setValue(newValue);
      onValueChange(newValue);
    }, [onValueChange]);

    return (
      <TextField
        label="Observaciones"
        variant="outlined"
        multiline
        rows={2}
        value={value}
        onChange={handleChange}
        fullWidth
        InputProps={{
          sx: {
            color: '#000',
            '& .MuiInputBase-inputMultiline': { color: '#000' }
          }
        }}
        sx={{
          ...textFieldStyles,
          '& .MuiInputBase-inputMultiline': { color: '#000' }
        }}
      />
    );
  });

  ObservacionesFieldFC.displayName = 'ObservacionesFieldFC';

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
            Fondo de campeonato
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
            Gestión de pagos del fondo de campeonato
          </Typography>
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
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "center",
              alignItems: { xs: "stretch", sm: "center" },
              gap: { xs: 2, sm: 2 },
              marginBottom: "20px",
            }}
          >
            {/* Título fijo del buscador */}
            <Box sx={{ width: { xs: "100%", sm: "50%" }, flex: 1 }}>
              <TextField
                variant="outlined"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Buscar recibos de fondo de campeonato de..."
                fullWidth
                inputProps={{
                  style: { color: "#000" },
                }}
                sx={{
                  ...textFieldStyles,
                  "& input::placeholder": {
                    color: "#666",
                    opacity: 1,
                  },
                }}
              />
            </Box>
            <Button
              variant="contained"
              onClick={handleCreate}
              sx={{
                height: { xs: "48px", sm: "56px" },
                width: { xs: "100%", sm: "auto" },
                minWidth: { xs: "100%", sm: "150px" },
              }}
            >
              Crear Recibo
            </Button>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              overflowX: "auto",
              width: "100%",
              "&::-webkit-scrollbar": {
                height: "8px",
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(76, 175, 80, 0.5)",
                borderRadius: "4px",
                "&:hover": {
                  backgroundColor: "rgba(76, 175, 80, 0.7)",
                },
              },
            }}
          >
            <Box
              sx={{
                width: "100%",
                maxHeight: { xs: "400px", md: 350 },
                minWidth: { xs: "600px", sm: "800px" },
                overflowY: "auto",
              }}
            >
              <TableContainer
                component={Paper}
                sx={{
                  backgroundColor: "transparent",
                  minWidth: { xs: "600px", sm: "800px" },
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow
                      sx={{
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        borderBottom: "2px solid rgba(255, 255, 255, 0.2)",
                      }}
                    >
                      <TableCell
                        style={{
                          color: "white",
                          textAlign: "center",
                          fontWeight: "bold",
                          fontSize: "1rem",
                          paddingTop: "12px",
                          paddingBottom: "12px",
                        }}
                      >
                        RECIBO
                      </TableCell>
                      <TableCell
                        style={{
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "1rem",
                          paddingTop: "12px",
                          paddingBottom: "12px",
                        }}
                      >
                        NOMBRE
                      </TableCell>
                      <TableCell
                        style={{
                          color: "white",
                          textAlign: "center",
                          fontWeight: "bold",
                          fontSize: "1rem",
                          paddingTop: "12px",
                          paddingBottom: "12px",
                        }}
                      >
                        FECHA RECIBO
                      </TableCell>
                      <TableCell
                        style={{
                          color: "white",
                          textAlign: "center",
                          fontWeight: "bold",
                          fontSize: "1rem",
                          paddingTop: "12px",
                          paddingBottom: "12px",
                        }}
                      >
                        CUOTA
                      </TableCell>
                      <TableCell
                        style={{
                          color: "white",
                          textAlign: "center",
                          fontWeight: "bold",
                          fontSize: "1rem",
                          paddingTop: "12px",
                          paddingBottom: "12px",
                        }}
                      >
                        MONTO
                      </TableCell>
                      <TableCell
                        style={{
                          color: "white",
                          textAlign: "center",
                          fontWeight: "bold",
                          fontSize: "1rem",
                          paddingTop: "12px",
                          paddingBottom: "12px",
                        }}
                      >
                        USUARIO
                      </TableCell>

                      {/* esto lo muestro solo si es usuario admin */}
                      {user.rol === import.meta.env.VITE_ROLPRO && (
                        <TableCell
                          style={{
                            color: "white",
                            textAlign: "center",
                            fontWeight: "bold",
                            fontSize: "1rem",
                            paddingTop: "12px",
                            paddingBottom: "12px",
                          }}
                        >
                          ACCIONES
                        </TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          style={{ textAlign: "center", padding: "40px" }}
                        >
                          <CircularProgress style={{ color: "white" }} />
                          <Typography
                            variant="body1"
                            style={{ color: "white", marginTop: "20px" }}
                          >
                            Cargando recibos...
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : payments.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          style={{ textAlign: "center", padding: "40px" }}
                        >
                          <Typography
                            variant="body1"
                            style={{ color: "white" }}
                          >
                            No se encontraron recibos con los filtros
                            seleccionados
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      payments.map((payment, index) => (
                        <TableRow
                          key={payment.id_fondo}
                          sx={{
                            backgroundColor:
                              index % 2 === 0
                                ? "rgba(255, 255, 255, 0.03)"
                                : "rgba(255, 255, 255, 0.07)",
                            "&:hover": {
                              backgroundColor: "rgba(255, 255, 255, 0.1)",
                            },
                          }}
                        >
                          <TableCell
                            style={{
                              color: "white",
                              textAlign: "center",
                              borderBottom:
                                "1px solid rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            <Link
                              title="Ver recibo"
                              to={`/fc/${payment.id_fondo}`}
                              style={{
                                textDecoration: "none",
                                color: "#4dabf5",
                              }}
                            >
                              {payment.numero}
                            </Link>
                          </TableCell>
                          <TableCell
                            style={{
                              color: "white",
                              borderBottom:
                                "1px solid rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            {payment.nombre_jugador} {payment.apellido_jugador}
                          </TableCell>
                          <TableCell
                            style={{
                              color: "white",
                              textAlign: "center",
                              borderBottom:
                                "1px solid rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            {payment.fecha
                              .split("T")[0]
                              .split("-")
                              .reverse()
                              .join("/")}
                          </TableCell>
                          <TableCell
                            style={{
                              color: "white",
                              textAlign: "center",
                              borderBottom:
                                "1px solid rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            {payment.cuota_paga}
                          </TableCell>
                          <TableCell
                            style={{
                              color: "#4dabf5",
                              textAlign: "center",
                              borderBottom:
                                "1px solid rgba(255, 255, 255, 0.1)",
                              fontWeight: "bold",
                            }}
                          >
                            $ {payment.monto}
                          </TableCell>
                          <TableCell
                            style={{
                              color: "white",
                              textAlign: "center",
                              borderBottom:
                                "1px solid rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            {payment.nombre_usuario}
                          </TableCell>

                          {/* esto lo muestro solo si es usuario admin */}
                          {user.rol === import.meta.env.VITE_ROLPRO && (
                            <TableCell
                              style={{
                                color: "white",
                                textAlign: "center",
                                borderBottom:
                                  "1px solid rgba(255, 255, 255, 0.1)",
                              }}
                            >
                              <IconButton
                                color="primary"
                                title="Editar recibo"
                                onClick={() => handleEdit(payment)}
                                style={{ marginRight: "8px" }}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                color="error"
                                title="Eliminar recibo"
                                onClick={() => handleDelete(payment.id_fondo)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        </Paper>

        <Modal
          open={showModal}
          onClose={handleCloseModal}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "95%", sm: "90%", md: "75%", lg: 650 },
              maxWidth: 700,
              maxHeight: "90vh",
              overflow: "auto",
              bgcolor: "white",
              border: "2px solid #000",
              boxShadow: 24,
              p: { xs: 1.5, md: 2 },
              borderRadius: 2,
            }}
          >
            <Paper elevation={3} sx={{ p: 2, maxWidth: 700, margin: '0 auto' }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 1.5 }}>
                Crear Recibo de Fondo de Campeonato
              </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {/* Selección de jugador */}
              <FormControl fullWidth>
                <Typography variant="subtitle2" gutterBottom>
                  Seleccionar Jugador
                </Typography>
                <Select
                  value={selectedPlayer}
                  onChange={handlePlayerSelectChange}
                  displayEmpty
                  variant="outlined"
                  sx={{
                    backgroundColor: "#ffffff",
                    color: "#000000",
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: "#ffffff",
                        "& .MuiMenuItem-root": {
                          color: "#000000",
                          // Forzar que los items se muestren en orden sin agrupación visual
                          '&::before': { display: 'none' },
                          '&::after': { display: 'none' }
                        },
                        // Eliminar cualquier lógica de agrupación
                        '& .MuiList-root': {
                          padding: 0
                        }
                      },
                    },
                    // Asegurar que no se agrupe por categoría
                    disableAutoFocusItem: true,
                    // Deshabilitar cualquier agrupación automática
                    variant: "menu",
                  }}
                >
                  <MenuItem value="" disabled>
                    Seleccione un jugador
                  </MenuItem>
                  {playerPayments &&
                    playerPayments.map((player) => (
                      <MenuItem 
                        key={player.idjugador} 
                        value={player.idjugador}
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          // Evitar que Material-UI agrupe visualmente por categoría
                          '&::before': { display: 'none' }
                        }}
                      >
                        {player.apellido}, {player.nombre} - {player.nombre_categoria}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>

              {/* Año y Monto en la misma fila */}
              <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
                {/* Año */}
                <FormControl sx={{ minWidth: 140 }}>
                  <Typography variant="subtitle2" sx={{ mb: 0.5, color: "rgba(0, 0, 0, 0.6)" }}>
                    Año
                  </Typography>
                  <Select
                    value={formData.anio}
                    onChange={(e) => handleFormChange("anio", parseInt(e.target.value))}
                    displayEmpty
                    variant="outlined"
                    disabled={!selectedPlayer}
                    sx={{
                      backgroundColor: "#ffffff",
                      color: "#000000",
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          backgroundColor: "#ffffff",
                          "& .MuiMenuItem-root": { color: "#000000" },
                        },
                      },
                    }}
                  >
                    {availableYears.length > 0 ? (
                      availableYears.map((year) => (
                        <MenuItem key={year} value={year}>
                          {year}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value={new Date().getFullYear()}>
                        {new Date().getFullYear()}
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>

                {/* Monto total */}
                <Box sx={{ flex: 1 }}>
                  <MontoFieldFC
                    key={selectedPlayer}
                    initialValue={formData.monto}
                    onValueChange={handleMontoChange}
                  />
                </Box>
              </Box>

              {/* Checkbox para pagar ambas cuotas */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={pagarAmbasCuotas}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setPagarAmbasCuotas(checked);
                      
                      if (checked) {
                        const cuotasPendientes = [1, 2].filter(c => !paidQuotas.includes(c));
                        const yearValores = valoresByYear[formData.anio] || valores;
                        const fondoTotal = yearValores?.fondo_campeonato || 0;
                        const montoPorCuota = fondoTotal / 2;
                        const montoFinal = montoPorCuota * cuotasPendientes.length;
                        
                        setSelectedQuotas([]);
                        setFormData((prev) => ({
                          ...prev,
                          monto: montoFinal.toString(),
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          monto: "",
                        }));
                      }
                    }}
                    disabled={!selectedPlayer || paidQuotas.length === 2}
                    sx={{
                      color: '#000',
                      '&.Mui-checked': { color: '#1E8732' },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: '#000', fontWeight: 500 }}>
                    Pagar todas las cuotas pendientes juntas
                  </Typography>
                }
                sx={{ mb: 1.5 }}
              />

              {/* Selector de cuotas con chips */}
              <QuotaSelector
                paidQuotas={paidQuotas}
                selectedQuotas={selectedQuotas}
                onQuotaToggle={handleQuotaToggle}
                currentYear={formData.anio}
                selectedPlayer={selectedPlayer}
                pagarAmbasCuotas={pagarAmbasCuotas}
              />

              {/* Resumen de selección */}
              <SelectionSummaryFC
                selectedQuotas={selectedQuotas}
                selectedPlayer={selectedPlayer}
                valores={valores}
                currentYear={formData.anio}
                pagarAmbasCuotas={pagarAmbasCuotas}
                valoresByYear={valoresByYear}
              />

              {/* Observaciones */}
              <ObservacionesFieldFC
                key={selectedPlayer}
                onValueChange={handleObservacionesChange}
              />

              {/* Botones */}
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "flex-end",
                  mt: 1,
                }}
              >
                <Button variant="outlined" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmitPayment}
                  disabled={!formData.idjugador || !formData.monto || (!pagarAmbasCuotas && selectedQuotas.length === 0)}
                  sx={{
                    backgroundColor: '#1E8732',
                    '&:hover': { backgroundColor: '#166025' },
                  }}
                >
                  {pagarAmbasCuotas || selectedQuotas.length > 1 ? 'Crear Recibos' : 'Crear Recibo'}
                </Button>
              </Box>
            </Box>
            </Paper>
          </Box>
        </Modal>

        {/* Modal de Comprobante */}
        <Modal
          open={showComprobanteModal}
          onClose={() => {
            setShowComprobanteModal(false);
            setFcIdComprobante(null);
          }}
          aria-labelledby="comprobante-modal-title"
          aria-describedby="comprobante-modal-description"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "95%", sm: "90%", md: "85%", lg: "80%" },
              maxWidth: 1000,
              maxHeight: "95vh",
              bgcolor: "white",
              border: "2px solid #000",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <Typography variant="h6" gutterBottom>
              Comprobante de Pago - Fondo de Campeonato
            </Typography>
            
            {/* Preview del PDF */}
            <Box
              sx={{
                flex: 1,
                minHeight: { xs: "300px", sm: "400px", md: "500px" },
                maxHeight: { xs: "calc(95vh - 200px)", sm: "calc(95vh - 200px)", md: "calc(95vh - 200px)" },
                border: "1px solid #ccc",
                borderRadius: 1,
                mb: 2,
                overflow: "auto",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {fcIdComprobante && (
                <iframe
                  src={API_ENDPOINTS.COMPROBANTE_FC(fcIdComprobante)}
                  style={{
                    width: "100%",
                    height: "100%",
                    minHeight: "600px",
                    border: "none",
                  }}
                  title="Comprobante PDF"
                />
              )}
            </Box>

            {/* Botones de acción */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                mt: 2,
                flexShrink: 0, // Evitar que se compriman
                position: "sticky", // Fijar en la parte inferior
                bottom: 0,
                bgcolor: "white",
                pb: 1,
                pt: 1,
                zIndex: 10,
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={async () => {
                  try {
                    // Actualizar método en BD
                    await axios.put(
                      API_ENDPOINTS.UPDATE_COMPROBANTE_FC(fcIdComprobante),
                      { metodo_comprobante: "impresion" }
                    );
                    
                    // Imprimir PDF
                    const printWindow = window.open(
                      API_ENDPOINTS.COMPROBANTE_FC(fcIdComprobante),
                      "_blank"
                    );
                    if (printWindow) {
                      printWindow.onload = () => {
                        printWindow.print();
                      };
                    }
                    
                    toast.success("Comprobante listo para imprimir");
                    setShowComprobanteModal(false);
                    setFcIdComprobante(null);
                  } catch (error) {
                    console.error("Error al imprimir:", error);
                    toast.error("Error al procesar la impresión");
                  }
                }}
              >
                Imprimir
              </Button>
              
              <Button
                variant="contained"
                sx={{
                  bgcolor: "#25D366",
                  "&:hover": {
                    bgcolor: "#20BA5A",
                  },
                }}
                onClick={async () => {
                  try {
                    // Actualizar método en BD
                    await axios.put(
                      API_ENDPOINTS.UPDATE_COMPROBANTE_FC(fcIdComprobante),
                      { metodo_comprobante: "whatsapp" }
                    );
                    
                    // Mostrar modal para ingresar número de WhatsApp
                    setShowWhatsAppModal(true);
                  } catch (error) {
                    console.error("Error al compartir por WhatsApp:", error);
                    toast.error("Error al compartir por WhatsApp");
                  }
                }}
              >
                Compartir por WhatsApp
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => {
                  setShowComprobanteModal(false);
                  setFcIdComprobante(null);
                }}
              >
                Cerrar
              </Button>
            </Box>
          </Box>
        </Modal>
        {/* Modal para ingresar número de WhatsApp */}
        <Modal
          open={showWhatsAppModal}
          onClose={() => {
            setShowWhatsAppModal(false);
            setWhatsappNumber("");
          }}
          aria-labelledby="whatsapp-modal-title"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "90%", sm: "400px" },
              bgcolor: "white",
              border: "2px solid #25D366",
              boxShadow: 24,
              p: 3,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Ingresar número de WhatsApp
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 2, color: "#666" }}>
              Ingresa el número de celular con código de país (ejemplo: 59899123456)
            </Typography>
            
            <TextField
              fullWidth
              label="Número de WhatsApp"
              placeholder="59899123456"
              value={whatsappNumber}
              onChange={(e) => {
                // Solo permitir números
                const value = e.target.value.replace(/\D/g, "");
                setWhatsappNumber(value);
              }}
              sx={{ 
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  "& input": {
                    color: "#000000 !important",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "#666666 !important",
                },
              }}
              autoFocus
            />
            
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setShowWhatsAppModal(false);
                  setWhatsappNumber("");
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                sx={{
                  bgcolor: "#25D366",
                  "&:hover": {
                    bgcolor: "#20BA5A",
                  },
                }}
                disabled={!whatsappNumber || whatsappNumber.length < 8}
                onClick={async () => {
                  try {
                    // Obtener URL del PDF
                    const comprobantePath = API_ENDPOINTS.COMPROBANTE_FC(fcIdComprobante);
                    const origin = window.location.origin.replace('https://', 'http://');
                    const pdfUrl = comprobantePath.startsWith('http') 
                      ? comprobantePath 
                      : `${origin}${comprobantePath}`;
                    
                    // Crear mensaje para WhatsApp
                    const mensaje = encodeURIComponent(
                      `Aquí tienes tu comprobante de pago de Fondo de Campeonato del Club Yerbalito:\n\n${pdfUrl}`
                    );
                    
                    // Construir URL de WhatsApp con el número
                    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${mensaje}`;
                    
                    // Abrir WhatsApp
                    window.open(whatsappUrl, "_blank");
                    
                    toast.success("Abriendo WhatsApp...");
                    setShowWhatsAppModal(false);
                    setShowComprobanteModal(false);
                    setWhatsappNumber("");
                    setFcIdComprobante(null);
                  } catch (error) {
                    console.error("Error al abrir WhatsApp:", error);
                    toast.error("Error al abrir WhatsApp");
                  }
                }}
              >
                Enviar
              </Button>
            </Box>
          </Box>
        </Modal>
      </div>
    </div>
  );
};

export default FondoCamp;
