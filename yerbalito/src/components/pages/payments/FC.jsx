import { API_ENDPOINTS } from "../../../config/api";
import { useEffect, useState, useContext } from "react";
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
// Gráficos removidos - se muestran en Reports

const FondoCamp = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [payments, setPayments] = useState([]);
  const [showModal, setShowModal] = useState(false);
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

  const { user } = useContext(AuthContext);

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
        const suggestedQuota = availableQuotas[0] || 1;
        
        // Calcular el monto: el fondo de campeonato se paga en 2 cuotas iguales (mitad cada una)
        const montoTotal = valores?.fondo_campeonato || 0;
        const montoPorCuota = montoTotal / 2;
        
        setFormData((prev) => ({
          ...prev,
          idjugador: playerId,
          monto: montoPorCuota.toString(),
          cuota_paga: suggestedQuota.toString(),
          anio: suggestedYear,
        }));
      } catch (error) {
        console.error("Error checking FC payments:", error);
        // Si hay error, sugerir cuota 1 del año actual
        setPaidQuotas([]);
        setAvailableYears([new Date().getFullYear()]);
        
        // Calcular el monto: el fondo de campeonato se paga en 2 cuotas iguales (mitad cada una)
        const montoTotal = valores?.fondo_campeonato || 0;
        const montoPorCuota = montoTotal / 2;
        
        setFormData((prev) => ({
          ...prev,
          idjugador: playerId,
          monto: montoPorCuota.toString(),
          cuota_paga: "1",
          anio: new Date().getFullYear(),
        }));
      }
    } else {
      setPaidQuotas([]);
      setAvailableYears([]);
    }
  };

  const handleFormChange = async (field, value) => {
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
        
        // Ajustar selección según cuotas pagadas del nuevo año
        if (paidQuotasList.length === 0) {
          // Si no hay cuotas pagadas, sugerir cuota 1
          setFormData((prev) => ({
            ...prev,
            cuota_paga: "1",
            monto: valores ? ((valores.fondo_campeonato || 0) / 2).toString() : ""
          }));
          setPagarAmbasCuotas(false);
        } else if (paidQuotasList.length === 1) {
          // Si solo falta una cuota, sugerir la pendiente
          const cuotaPendiente = [1, 2].find(c => !paidQuotasList.includes(c));
          setFormData((prev) => ({
            ...prev,
            cuota_paga: cuotaPendiente ? cuotaPendiente.toString() : "",
            monto: valores ? ((valores.fondo_campeonato || 0) / 2).toString() : ""
          }));
          setPagarAmbasCuotas(false);
        } else {
          // Si ambas cuotas están pagadas, limpiar todo
          setFormData((prev) => ({
            ...prev,
            cuota_paga: "",
            monto: "0"
          }));
          setPagarAmbasCuotas(false);
        }
      } catch (error) {
        console.error("Error fetching FC payments for year:", error);
        setPaidQuotas([]);
      }
    }
    
    // Si cambia la cuota, NO cambiar el monto (ya está calculado como mitad del total)
    // El usuario puede editarlo manualmente si es necesario
  };

  const handleSubmitPayment = async () => {
    try {
      if (!formData.idjugador || !formData.monto) {
        toast.error("Completa todos los campos obligatorios");
        return;
      }

      if (pagarAmbasCuotas) {
        // Pagar ambas cuotas: enviar array con ambas cuotas no pagadas
        const cuotasAPagar = [1, 2].filter(cuota => !paidQuotas.includes(cuota));
        
        if (cuotasAPagar.length === 0) {
          toast.error("Todas las cuotas ya están pagadas.");
          return;
        }

        const payment = {
          idjugador: formData.idjugador,
          monto: parseFloat(formData.monto),
          cuotas: cuotasAPagar, // Array de cuotas a pagar
          anio: formData.anio,
          observaciones: formData.observaciones,
          idusuario: user.id,
        };

        await axios.post(API_ENDPOINTS.FC_MULTIPLE, payment);
        toast.success(`¡Recibos de fondo de campeonato creados correctamente! (${cuotasAPagar.length} cuota${cuotasAPagar.length > 1 ? 's' : ''})`);
      } else {
        // Pagar una sola cuota
        if (!formData.cuota_paga) {
          toast.error("Por favor, seleccione una cuota.");
          return;
        }

        // Verificar que no esté intentando pagar una cuota ya pagada
        if (paidQuotas.includes(parseInt(formData.cuota_paga))) {
          toast.error(`La cuota ${formData.cuota_paga}/2 ya está pagada para este jugador en el año ${formData.anio}`);
          return;
        }

        const payment = {
          idjugador: formData.idjugador,
          monto: formData.monto,
          cuota_paga: parseInt(formData.cuota_paga),
          anio: formData.anio,
          observaciones: formData.observaciones,
          idusuario: user.id,
        };

        await axios.post(API_ENDPOINTS.FC, payment);
        toast.success(`¡Recibo de fondo de campeonato (Cuota ${formData.cuota_paga}/2) creado correctamente!`);
      }
      
      handleCloseModal();
      fetchPayments();
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
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "20px",
            }}
          >
            {/* Título fijo del buscador */}
            <Box sx={{ width: "50%", mr: 2 }}>
              <TextField
                variant="outlined"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Buscar recibos de fondo de campeonato de..."
                style={{ marginBottom: "1rem", width: "100%" }}
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
              style={{
                marginLeft: "2rem",
                height: "56px",
              }}
            >
              Crear Recibo
            </Button>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              overflowX: "auto",
            }}
          >
            <div style={{ width: "100%", maxHeight: 350, minWidth: "800px" }}>
              <TableContainer
                component={Paper}
                style={{ backgroundColor: "transparent", minWidth: "800px" }}
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
            </div>
          </div>
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
              width: 400,
              maxHeight: "90vh",
              overflow: "auto",
              bgcolor: "white",
              border: "2px solid #000",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
          >
            <Paper elevation={3} sx={{ p: 3, maxWidth: 500, margin: '0 auto' }}>
              <Typography variant="h6" gutterBottom>
                Crear Recibo de Fondo de Campeonato
              </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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

              {/* Año - MOVIDO ARRIBA */}
              <FormControl fullWidth>
                <Typography variant="subtitle2" gutterBottom>
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

              {/* Selección de cuota (1/2 o 2/2) - FILTRADO SEGÚN AÑO */}
              <FormControl fullWidth>
                <Typography variant="subtitle2" gutterBottom>
                  Cuota
                </Typography>
                {selectedPlayer && paidQuotas.length > 0 && paidQuotas.length < 2 && (
                  <Typography variant="caption" sx={{ color: '#666', mb: 0.5 }}>
                    Cuotas ya pagadas en {formData.anio}: {paidQuotas.join(', ')}/2
                  </Typography>
                )}
                
                {/* Checkbox para pagar ambas cuotas */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={pagarAmbasCuotas}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setPagarAmbasCuotas(checked);
                        
                        if (checked) {
                          // Si marca "Pagar ambas cuotas", calcular el monto total
                          const cuotasPendientes = [1, 2].filter(c => !paidQuotas.includes(c));
                          const montoTotal = valores?.fondo_campeonato || 0;
                          const montoPorCuota = montoTotal / 2;
                          const montoFinal = montoPorCuota * cuotasPendientes.length;
                          
                          setFormData((prev) => ({
                            ...prev,
                            monto: montoFinal.toString(),
                            cuota_paga: "", // Limpiar cuota individual
                          }));
                        } else {
                          // Si desmarca, volver al monto por cuota
                          const montoTotal = valores?.fondo_campeonato || 0;
                          const montoPorCuota = montoTotal / 2;
                          
                          setFormData((prev) => ({
                            ...prev,
                            monto: montoPorCuota.toString(),
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
                  sx={{ mb: 1 }}
                />
                
                <Select
                  value={formData.cuota_paga}
                  onChange={(e) => handleFormChange("cuota_paga", e.target.value)}
                  displayEmpty
                  variant="outlined"
                  disabled={!selectedPlayer || pagarAmbasCuotas}
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
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    Seleccione una cuota
                  </MenuItem>
                  {[1, 2].map((cuota) => {
                    const isPaid = paidQuotas.includes(cuota);
                    return (
                      <MenuItem key={cuota} value={cuota.toString()} disabled={isPaid}>
                        Cuota {cuota}/2 {isPaid && "✓ (Paga)"}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>

              {/* Campo de monto (editable) */}
              <TextField
                label={pagarAmbasCuotas ? "Monto total (ambas cuotas)" : "Monto por cuota"}
                variant="outlined"
                type="number"
                value={formData.monto}
                onChange={(e) => handleFormChange("monto", e.target.value)}
                fullWidth
                required
                helperText={
                  pagarAmbasCuotas
                    ? `Monto sugerido: ${[1, 2].filter(c => !paidQuotas.includes(c)).length} cuota(s) × $${(valores?.fondo_campeonato || 0) / 2} = $${(valores?.fondo_campeonato || 0) / 2 * [1, 2].filter(c => !paidQuotas.includes(c)).length}. Editable si es necesario.`
                    : `Monto sugerido: $${valores?.fondo_campeonato || 0} total ÷ 2 cuotas = $${(valores?.fondo_campeonato || 0) / 2} por cuota. Editable si es necesario.`
                }
                InputProps={{
                  sx: {
                    color: '#000',
                    '& .MuiInputBase-input': { color: '#000' }
                  }
                }}
                sx={{
                  ...textFieldStyles,
                  '& .MuiInputBase-input': { color: '#000' },
                  '& .MuiFormHelperText-root': { color: '#666' }
                }}
              />

              {/* Campo de observaciones */}
              <TextField
                label="Observaciones"
                variant="outlined"
                multiline
                rows={3}
                value={formData.observaciones}
                onChange={(e) =>
                  handleFormChange("observaciones", e.target.value)
                }
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

              {/* Botones */}
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "flex-end",
                  mt: 2,
                }}
              >
                <Button variant="outlined" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmitPayment}
                  disabled={!formData.idjugador || !formData.monto || (!pagarAmbasCuotas && !formData.cuota_paga)}
                  sx={{
                    backgroundColor: '#1E8732',
                    '&:hover': { backgroundColor: '#166025' },
                  }}
                >
                  {pagarAmbasCuotas ? 'Crear Recibos' : 'Crear Recibo'}
                </Button>
              </Box>
            </Box>
            </Paper>
          </Box>
        </Modal>
      </div>
    </div>
  );
};

export default FondoCamp;
