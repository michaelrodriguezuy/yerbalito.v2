import { useState, useEffect, useContext } from "react";
import {
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
  Button,
  Modal,
  Box,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  FormControl,
} from "@mui/material";
import axios from "axios";
import { Link } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "sonner";

import { AuthContext } from "../../../context/AuthContext";
import { API_ENDPOINTS } from "../../../config/api";

const Payments = () => {
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
    cuota_paga: "",
    observaciones: "",
  });
  const [selectedMonths, setSelectedMonths] = useState([]); // meses a pagar
  const [valores, setValores] = useState(null);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchPayments();
    fetchValores();
  }, [searchTerm]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3001/payments/${id}`);
        const response = await axios.get(API_ENDPOINTS.PAYMENTS);
        setPayments(response.data.payments);
        // Mostrar un mensaje de éxito
        Swal.fire("¡Eliminado!", "El recibo ha sido eliminado.", "success");
      } catch (error) {
        console.error("Error deleting payment: ", error);
        // Mostrar un mensaje de error
        Swal.fire("Error", "Hubo un problema al eliminar el recibo.", "error");
      }
    }
  };

  const handleCreate = () => {
    setShowModal(true);
    fetchPlayers();
    console.log(playerPayments);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPlayer("");
    setFormData({
      idjugador: "",
      monto: "",
      cuota_paga: "",
      observaciones: "",
    });
    setSelectedMonths([]);
  };

  const handlePlayerSelectChange = async (event) => {
    const playerId = event.target.value;
    setSelectedPlayer(playerId);
    setFormData((prev) => ({ ...prev, idjugador: playerId }));

    // Buscar el próximo mes a pagar para este jugador
    if (playerId) {
      try {
        const response = await axios.get(
          `${API_ENDPOINTS.PAYMENTS}?playerId=${playerId}`
        );
        const playerPayments = response.data.payments || [];

        // Obtener los meses ya pagados
        const paidMonths = playerPayments
          .map((payment) => parseInt(payment.cuota_paga))
          .sort((a, b) => a - b);

        // Sugerir el próximo mes (empezando desde 1)
        let nextMonth = 1;
        for (const month of paidMonths) {
          if (month === nextMonth) {
            nextMonth++;
          } else {
            break;
          }
        }

        // Sugerimos como seleccionado el próximo mes disponible
        setSelectedMonths([nextMonth]);
        setFormData((prev) => ({
          ...prev,
          idjugador: playerId,
          cuota_paga: nextMonth.toString(),
          monto: valores ? (valores.cuota_club || 0).toString() : "",
        }));
      } catch (error) {
        console.error("Error fetching player payments:", error);
        // Si hay error, sugerir mes 1
        setSelectedMonths([1]);
        setFormData((prev) => ({
          ...prev,
          idjugador: playerId,
          cuota_paga: "1",
          monto: valores ? (valores.cuota_club || 0).toString() : "",
        }));
      }
    }
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitPayment = async () => {
    try {
      // Crear uno o varios recibos (uno por mes seleccionado)
      const monthsToPay = Array.isArray(selectedMonths) ? selectedMonths : [];
      if (!formData.idjugador || monthsToPay.length === 0) {
        toast.error("Selecciona un jugador y al menos un mes a pagar");
        return;
      }

      let totalRecibos = 0;
      for (const mes of monthsToPay) {
        const payment = {
          idjugador: formData.idjugador,
          monto: valores?.cuota_club ?? 0,
          cuota_paga: mes.toString(),
          observaciones: formData.observaciones,
          idusuario: user.id,
        };
        const response = await axios.post(API_ENDPOINTS.PAYMENTS, payment);
        const hermanosAfectados = response.data.hermanosAfectados || 0;
        totalRecibos += 1 + hermanosAfectados;
      }

      toast.success(
        `¡Éxito! Se crearon ${totalRecibos} recibos correctamente.`
      );
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

  const fetchValores = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.VALORES);
      setValores(response.data.valores);
    } catch (error) {
      console.error("Error fetching valores:", error);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.PAYMENTS);

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
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
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
            Pagos
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
            Gestión de pagos de cuotas del club
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
                placeholder="Buscar recibos de cuotas del club de..."
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
            <div
              style={{
                width: "100%",
                maxHeight: 350,
                minWidth: "800px",
                overflowY: "auto",
              }}
            >
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
                        MES
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
                        AÑO
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
                          colSpan={8}
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
                          colSpan={8}
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
                          key={payment.idrecibo}
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
                              to={`/payments/${payment.idrecibo}`}
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
                            {payment.fecha_recibo
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
                            {(() => {
                              switch (payment.mes_pago) {
                                case 1:
                                  return "Enero";
                                case 2:
                                  return "Febrero";
                                case 3:
                                  return "Marzo";
                                case 4:
                                  return "Abril";
                                case 5:
                                  return "Mayo";
                                case 6:
                                  return "Junio";
                                case 7:
                                  return "Julio";
                                case 8:
                                  return "Agosto";
                                case 9:
                                  return "Septiembre";
                                case 10:
                                  return "Octubre";
                                case 11:
                                  return "Noviembre";
                                case 12:
                                  return "Diciembre";
                                default:
                                  return payment.mes_pago;
                              }
                            })()}
                          </TableCell>
                          <TableCell
                            style={{
                              color: "white",
                              textAlign: "center",
                              borderBottom:
                                "1px solid rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            {payment.anio}
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
                                color="error"
                                title="Eliminar recibo"
                                onClick={() => handleDelete(payment.idrecibo)}
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
                Crear Recibo de Cuota
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

              {/* Selección de meses a pagar */}
              <FormControl fullWidth>
                <Typography variant="subtitle2" gutterBottom>
                  Meses a pagar
                </Typography>
                <Select
                  multiple
                  value={selectedMonths}
                  onChange={(e) => {
                    const months = e.target.value;
                    setSelectedMonths(months);
                    const unit = valores?.cuota_club || 0;
                    setFormData((prev) => ({
                      ...prev,
                      monto: (months.length * unit).toString(),
                      cuota_paga: months[0] ? months[0].toString() : "",
                    }));
                  }}
                  renderValue={(selected) =>
                    selected
                      .sort((a, b) => a - b)
                      .map((m) => {
                        const names = [
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
                        return names[m - 1];
                      })
                      .join(", ")
                  }
                  sx={{ backgroundColor: "#ffffff", color: "#000000" }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: "#ffffff",
                        "& .MuiMenuItem-root": { color: "#000000" },
                      },
                    },
                  }}
                >
                  {(
                    valores?.meses_cuotas || [
                      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
                    ]
                  ).map((month) => (
                    <MenuItem key={month} value={month}>
                      {(() => {
                        const names = [
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
                        return names[month - 1];
                      })()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Monto total calculado */}
              <Typography variant="body2">
                Monto por mes: ${valores?.cuota_club ?? 0} — Meses
                seleccionados: {selectedMonths.length} — Total: $
                {selectedMonths.length * (valores?.cuota_club ?? 0)}
              </Typography>

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
                  disabled={!formData.idjugador || selectedMonths.length === 0}
                >
                  Crear Recibo{selectedMonths.length > 1 ? "s" : ""}
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

export default Payments;
