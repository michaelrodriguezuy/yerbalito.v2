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
  const [formData, setFormData] = useState({
    idjugador: "",
    monto: "",
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
  };

  const handlePlayerSelectChange = (event) => {
    const playerId = event.target.value;
    setSelectedPlayer(playerId);
    setFormData((prev) => ({
      ...prev,
      idjugador: playerId,
      monto: valores ? valores.fondo_campeonato.toString() : "",
    }));
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitPayment = async () => {
    try {
      const payment = {
        idjugador: formData.idjugador,
        monto: formData.monto,
        observaciones: formData.observaciones,
        idusuario: user.id,
      };

      await axios.post(API_ENDPOINTS.FC, payment);
      toast.success("¡Recibo de fondo de campeonato creado correctamente!");
      handleCloseModal();
      fetchPayments();
    } catch (error) {
      console.error("Error creating payment:", error);
      toast.error("No se pudo crear el recibo.");
    }
  };

  const fetchPlayers = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.SQUAD_ALL);
      setPlayerPayments(response.data.squads);
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
                        backgroundColor: "#ffffff", // ← Fondo blanco del dropdown
                        "& .MuiMenuItem-root": {
                          color: "#000000", // ← Texto negro de las opciones
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    Seleccione un jugador
                  </MenuItem>
                  {playerPayments &&
                    playerPayments.map((player) => (
                      <MenuItem key={player.idjugador} value={player.idjugador}>
                        {player.nombre} {player.apellido}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>

              {/* Campo de monto (solo lectura) */}
              <TextField
                label="Monto"
                variant="outlined"
                type="number"
                value={formData.monto}
                fullWidth
                required
                disabled
                helperText="Monto fijo establecido por administración"
                sx={textFieldStyles}
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
                  disabled={!formData.idjugador || !formData.monto}
                >
                  Crear Recibo
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
