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

  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [playerPayments, setPlayerPayments] = useState([]);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get("http://localhost:3001/payments");
        setPayments(response.data.payments);

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
        console.error("Error fetching payments: ", error);
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
      className="container"
      style={{
        textAlign: "center",
        maxHeight: "100vh",
        overflowY: "auto",
      }}
    >
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
      />
      <Button
        variant="contained"
        onClick={handleCreate}
        style={{ marginLeft: "2rem" }}
      >
        Crear Recibo
      </Button>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ width: "90%", maxHeight: 500, overflow: "auto" }}>
          <TableContainer
            component={Paper}
            style={{ backgroundColor: "transparent" }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell style={{ color: "white", textAlign: "center" }}>
                    RECIBO
                  </TableCell>
                  <TableCell style={{ color: "white" }}>NOMBRE</TableCell>
                  <TableCell style={{ color: "white", textAlign: "center" }}>
                    FECHA RECIBO
                  </TableCell>
                  <TableCell style={{ color: "white", textAlign: "center" }}>
                    MES
                  </TableCell>
                  <TableCell style={{ color: "white", textAlign: "center" }}>
                    AÑO
                  </TableCell>
                  <TableCell style={{ color: "white", textAlign: "center" }}>
                    MONTO
                  </TableCell>
                  <TableCell style={{ color: "white", textAlign: "center" }}>
                    USUARIO
                  </TableCell>
                  {user.rol === import.meta.env.VITE_ROLPRO && (
                    <TableCell style={{ color: "white", textAlign: "center" }}>
                      ACCIONES
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell style={{ color: "white", textAlign: "center" }}>
                      <Link
                        title="Ver recibo"
                        to={`/payments/${payment.id}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        {payment.numero}
                      </Link>
                    </TableCell>
                    <TableCell style={{ color: "white" }}>
                      {payment.nombre_jugador} {payment.apellido_jugador}
                    </TableCell>
                    <TableCell style={{ color: "white", textAlign: "center" }}>
                      {payment.fecha_recibo
                        .split("T")[0]
                        .split("-")
                        .reverse()
                        .join("/")}
                    </TableCell>
                    <TableCell style={{ color: "white", textAlign: "center" }}>
                      {payment.mes_pago}
                    </TableCell>
                    <TableCell style={{ color: "white", textAlign: "center" }}>
                      {payment.anio}
                    </TableCell>
                    <TableCell style={{ color: "white", textAlign: "center" }}>
                      $ {payment.monto}
                    </TableCell>
                    <TableCell style={{ color: "white", textAlign: "center" }}>
                      {payment.nombre_usuario}
                    </TableCell>

                    {user.rol === import.meta.env.VITE_ROLPRO && (
                      <TableCell
                        style={{ color: "white", textAlign: "center" }}
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
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
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
