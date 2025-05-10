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
  CircularProgress
} from "@mui/material";
import axios from "axios";
import { Link } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import Swal from "sweetalert2";

import { AuthContext } from "../../../context/AuthContext";

const Payments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [payments, setPayments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [playerPayments, setPlayerPayments] = useState([]);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:3001/payments");
        
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

    fetchPayments();
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
        const response = await axios.get("http://localhost:3001/payments");
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
  };

  const handlePlayerSelectChange = (event) => {
    setSelectedPlayer(event.target.value);
  };

  const fetchPlayers = async () => {
    try {
      const response = await axios.get("http://localhost:3001/squad");
      setPlayerPayments(response.data.players);
    } catch (error) {
      console.error("Error fetching players: ", error);
    }
  };

  return (
    <div
      className="page-container"
      style={{
        textAlign: "center",
        height: "100%",
        paddingBottom: "20px"
      }}
    >
      <Paper
        elevation={3}
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          padding: "20px",
          maxWidth: "95%",
          width: "1300px",
          margin: "0 auto",
          color: "white"
        }}
      >
        {/* Título de la sección */}
        <h1 style={{ 
          fontSize: "2rem", 
          margin: "20px 0 30px 0",
          color: "white",
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)"
        }}>
          RECIBOS DE CUOTAS DEL CLUB
        </h1>
        
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <TextField
            label="Buscar recibos de cuotas del club de..."
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ marginBottom: "1rem", width: "50%" }}
            InputProps={{
              style: { color: "white" },
            }}
            InputLabelProps={{
              style: { color: "white" },
            }}
            sx={{
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.6)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.8)',
              }
            }}
          />
          <Button
            variant="contained"
            onClick={handleCreate}
            style={{ 
              marginLeft: "2rem",
              height: "56px",
              backgroundColor: "rgba(63, 81, 181, 0.8)"
            }}
          >
            Crear Recibo
          </Button>
        </div>
        
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ width: "100%", maxHeight: 350, overflow: "auto" }}>
            <TableContainer
              component={Paper}
              style={{ backgroundColor: "transparent" }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ 
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    borderBottom: "2px solid rgba(255, 255, 255, 0.2)"
                  }}>
                    <TableCell style={{ 
                      color: "white", 
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      paddingTop: "12px",
                      paddingBottom: "12px"
                    }}>
                      RECIBO
                    </TableCell>
                    <TableCell style={{ 
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      paddingTop: "12px",
                      paddingBottom: "12px"
                    }}>
                      NOMBRE
                    </TableCell>
                    <TableCell style={{ 
                      color: "white", 
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      paddingTop: "12px",
                      paddingBottom: "12px"
                    }}>
                      FECHA RECIBO
                    </TableCell>
                    <TableCell style={{ 
                      color: "white", 
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      paddingTop: "12px",
                      paddingBottom: "12px"
                    }}>
                      MES
                    </TableCell>
                    <TableCell style={{ 
                      color: "white", 
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      paddingTop: "12px",
                      paddingBottom: "12px"
                    }}>
                      AÑO
                    </TableCell>
                    <TableCell style={{ 
                      color: "white", 
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      paddingTop: "12px",
                      paddingBottom: "12px"
                    }}>
                      MONTO
                    </TableCell>
                    <TableCell style={{ 
                      color: "white", 
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      paddingTop: "12px",
                      paddingBottom: "12px"
                    }}>
                      USUARIO
                    </TableCell>
                    {user.rol === import.meta.env.VITE_ROLPRO && (
                      <TableCell style={{ 
                        color: "white", 
                        textAlign: "center",
                        fontWeight: "bold",
                        fontSize: "1rem",
                        paddingTop: "12px",
                        paddingBottom: "12px"
                      }}>
                        ACCIONES
                      </TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} style={{ textAlign: "center", padding: "40px" }}>
                        <CircularProgress style={{ color: "white" }} />
                        <Typography variant="body1" style={{ color: "white", marginTop: "20px" }}>
                          Cargando recibos...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} style={{ textAlign: "center", padding: "40px" }}>
                        <Typography variant="body1" style={{ color: "white" }}>
                          No se encontraron recibos con los filtros seleccionados
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((payment, index) => (
                      <TableRow 
                        key={payment.idrecibo}
                        sx={{ 
                          backgroundColor: index % 2 === 0 ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 255, 255, 0.07)",
                          '&:hover': {
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                          }
                        }}
                      >
                        <TableCell style={{ 
                          color: "white", 
                          textAlign: "center",
                          borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
                        }}>
                          <Link
                            title="Ver recibo"
                            to={`/payments/${payment.idrecibo}`}
                            style={{ textDecoration: "none", color: "#4dabf5" }}
                          >
                            {payment.numero}
                          </Link>
                        </TableCell>
                        <TableCell style={{ 
                          color: "white",
                          borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
                        }}>
                          {payment.nombre_jugador} {payment.apellido_jugador}
                        </TableCell>
                        <TableCell style={{ 
                          color: "white", 
                          textAlign: "center",
                          borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
                        }}>
                          {payment.fecha_recibo
                            .split("T")[0]
                            .split("-")
                            .reverse()
                            .join("/")}
                        </TableCell>
                        <TableCell style={{ 
                          color: "white", 
                          textAlign: "center",
                          borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
                        }}>
                          {(() => {
                            switch (payment.mes_pago) {
                              case 1: return "Enero";
                              case 2: return "Febrero";
                              case 3: return "Marzo";
                              case 4: return "Abril";
                              case 5: return "Mayo";
                              case 6: return "Junio";
                              case 7: return "Julio";
                              case 8: return "Agosto";
                              case 9: return "Septiembre";
                              case 10: return "Octubre";
                              case 11: return "Noviembre";
                              case 12: return "Diciembre";
                              default: return payment.mes_pago;
                            }
                          })()}
                        </TableCell>
                        <TableCell style={{ 
                          color: "white", 
                          textAlign: "center",
                          borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
                        }}>
                          {payment.anio}
                        </TableCell>
                        <TableCell style={{ 
                          color: "#4dabf5", 
                          textAlign: "center",
                          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                          fontWeight: "bold"
                        }}>
                          $ {payment.monto}
                        </TableCell>
                        <TableCell style={{ 
                          color: "white", 
                          textAlign: "center",
                          borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
                        }}>
                          {payment.nombre_usuario}
                        </TableCell>

                        {user.rol === import.meta.env.VITE_ROLPRO && (
                          <TableCell
                            style={{ 
                              color: "white", 
                              textAlign: "center",
                              borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
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
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <h2 id="modal-title">Crear Recibo</h2>

          <Select
            value={selectedPlayer}
            onChange={handlePlayerSelectChange}
            displayEmpty
            variant="outlined"
            style={{ marginBottom: "1rem", width: "50%" }}
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

          {/* <TextField
            label="Fecha"
            variant="outlined"
            type="date"
            fullWidth
            style={{ marginBottom: "1rem" }}
          />

          <TextField
            label="Nombre"
            variant="outlined"
            fullWidth
            style={{ marginBottom: "1rem" }}
          />
          <Button variant="contained" color="primary">
            Guardar
          </Button> */}
        </Box>
      </Modal>
    </div>
  );
};

export default Payments;
