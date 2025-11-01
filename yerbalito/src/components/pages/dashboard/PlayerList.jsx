import { API_ENDPOINTS } from "../../../config/api";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Box,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Modal,
  IconButton,
  Tooltip,
  styled,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";

// import { withStyles } from "@mui/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

import PlayerForm from "./PlayerForm";
import { format } from "date-fns";
import es from "date-fns/locale/es";
import Swal from "sweetalert2";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 1200,
  maxWidth: '95%',
  maxHeight: 'none',
  bgcolor: "white",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  overflowY: 'visible',
  // Responsive: en móviles permitir scroll vertical
  ['@media (max-width:900px)']: {
    width: '95%',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
};

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const PlayerList = () => {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isChange, setIsChange] = useState(false);
  const [open, setOpen] = useState(false);
  const [playerSelected, setPlayerSelected] = useState(null);
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

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  useEffect(() => {
    setIsChange(false);
    const fetchAllPlayer = async () => {
      try {
        setLoading(true);
        console.log("Fetching players from:", API_ENDPOINTS.SQUAD_ALL);
        const response = await axios.get(API_ENDPOINTS.SQUAD_ALL);
        console.log("Raw response:", response.data);

        if (!response.data.squads || !Array.isArray(response.data.squads)) {
          console.error("Invalid response format:", response.data);
          setLoading(false);
          return;
        }

        const formattedResponse = await Promise.all(
          response.data.squads.map(async (player) => {
            const categoria = await fetchCategory(player.idcategoria);
            const estadoData = await fetchEstado(player.idestado);
            const estado = estadoData ? estadoData.tipo_estado : null;

            return {
              ...player,
              fecha_nacimiento: format(
                new Date(player.fecha_nacimiento),
                "dd-MM-yyyy",
                { locale: es }
              ),
              fecha_ingreso: format(
                new Date(player.fecha_ingreso),
                "dd-MM-yyyy",
                { locale: es }
              ),
              categoria,
              estado,
            };
          })
        );
        console.log("Formatted Response:", formattedResponse);
        setPlayers(formattedResponse);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching players: ", error);
        setLoading(false);
        // Mostrar mensaje de error al usuario
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar los jugadores. Verifica que el backend esté ejecutándose.",
        });
      }
    };

    fetchAllPlayer();
  }, [isChange]);

  // Efecto para filtrar jugadores cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm) {
      const filtered = players.filter(
        (player) =>
          (player.nombre &&
            player.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (player.apellido &&
            player.apellido.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredPlayers(filtered);
    } else {
      setFilteredPlayers(players);
    }
  }, [searchTerm, players]);

  const fetchCategory = async (idcategoria) => {
    try {
      if (!idcategoria) return 'Sin categoría';
      const response = await axios.get(
        `${API_ENDPOINTS.CATEGORIES}/${idcategoria}`
      );
      return response.data?.categoria?.nombre_categoria || 'Sin categoría';
    } catch (error) {
      console.error("Error fetching category: ", error);
      return 'Sin categoría';
    }
  };
  const fetchEstado = async (idestado) => {
    try {
      // Si idestado es 0 o null, retornar un estado por defecto
      if (!idestado || idestado === 0) {
        return { tipo_estado: "Sin estado" };
      }
      
      const response = await axios.get(
        `${API_ENDPOINTS.ESTADOS}/${idestado}`
      );
      // console.log("fetchEstado response:", response.data.estado.tipo_estado);
      return response.data.estado;
    } catch (error) {
      console.error("Error fetching estado: ", error);
      // Retornar un estado por defecto en caso de error
      return { tipo_estado: "Sin estado" };
    }
  };

  const deletePlayer = (id, nombre) => {
    Swal.fire({
      title: `Estas queriendo eliminar al jugador '${nombre}'`,
      text: "¿Estás seguro? ¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminarlo",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_ENDPOINTS.SQUAD}/${id}`);
          setIsChange(true);
          Swal.fire("Eliminado!", "El jugador ha sido eliminado.", "success");
        } catch (error) {
          console.error("Error deleting player: ", error);
        }
      }
    });
  };

  // const searchPlayer = async (searchTerm) => {
  //   try {
  //     const response = await axios.get(
  //       `API_ENDPOINTS.SQUAD/search/${searchTerm}`
  //     );
  //     setPlayers(response.data.squads);
  //   } catch (error) {
  //     console.error("Error searching player: ", error);
  //   }
  // };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = (player) => {
    setPlayerSelected(player);
    setOpen(true);
  };

  return (
    <div className="slide-up" style={{ maxWidth: "100%", overflowX: "auto" }}>
      <Box
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <Box sx={{ width: { xs: "100%", sm: "50%" }, minWidth: "200px" }}>
          
          <TextField
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Buscar por nombre o apellido..."
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
        <Button variant="contained" onClick={() => handleOpen(null)}>
          Agregar jugador
        </Button>
      </Box>
      <TableContainer
        component={Paper}
        style={{ 
          marginTop: "5px", 
          maxHeight: "500px", 
          maxWidth: "100%"
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell align="left">
                <Tooltip title="Clic para ordenar">
                  <span>Nombre</span>
                </Tooltip>
              </StyledTableCell>

              <StyledTableCell align="left">
                <Tooltip title="Clic para ordenar">
                  <span>Apellido</span>
                </Tooltip>
              </StyledTableCell>
              <StyledTableCell align="center">
                <Tooltip title="Clic para ordenar">
                  <span>Fecha de nacimiento</span>
                </Tooltip>
              </StyledTableCell>

              <StyledTableCell align="center">
                <span>Cedula</span>
              </StyledTableCell>

              <StyledTableCell align="left">
                <span>Padre </span>
              </StyledTableCell>
              <StyledTableCell align="left">
                <span>Madre </span>
              </StyledTableCell>
              <StyledTableCell align="center">
                <span>Contacto </span>
              </StyledTableCell>
              <StyledTableCell align="center">
                <span>Fecha de ingreso </span>
              </StyledTableCell>

              <StyledTableCell align="center">
                <Tooltip title="Clic para ordenar">
                  <span>Categoría</span>
                </Tooltip>
              </StyledTableCell>
              <StyledTableCell align="center">
                <Tooltip title="Clic para ordenar">
                  <span>Estado </span>
                </Tooltip>
              </StyledTableCell>
              <StyledTableCell align="left">
                <span>Observaciones </span>
              </StyledTableCell>
              <StyledTableCell align="center">
                <span>Jugador fichado </span>
              </StyledTableCell>
              <StyledTableCell align="center">
                <span>Sexo </span>
              </StyledTableCell>
              <StyledTableCell align="center">
                <span>Ciudadania </span>
              </StyledTableCell>

              <StyledTableCell align="center">Imágen</StyledTableCell>

              <StyledTableCell align="center">Acciones</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <StyledTableRow>
                <StyledTableCell colSpan={16} align="center" style={{ padding: "40px" }}>
                  <CircularProgress style={{ color: "#4CAF50" }} />
                  <Typography variant="body1" style={{ marginTop: "20px" }}>
                    Cargando jugadores...
                  </Typography>
                </StyledTableCell>
              </StyledTableRow>
            ) : filteredPlayers.length === 0 ? (
              <StyledTableRow>
                <StyledTableCell colSpan={16} align="center" style={{ padding: "40px" }}>
                  <Typography variant="body1">
                    No se encontraron jugadores
                  </Typography>
                </StyledTableCell>
              </StyledTableRow>
            ) : (
              filteredPlayers.map((player) => (
              <StyledTableRow key={player.idjugador}>
                <StyledTableCell align="left">{player.nombre}</StyledTableCell>
                <StyledTableCell align="left">
                  {player.apellido}
                </StyledTableCell>
                <StyledTableCell component="th" scope="row" align="center">
                  {player.fecha_nacimiento}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {player.cedula}
                </StyledTableCell>

                <StyledTableCell align="left">{player.padre}</StyledTableCell>
                <StyledTableCell align="left">{player.madre}</StyledTableCell>

                <StyledTableCell align="center">
                  {player.contacto}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {player.fecha_ingreso}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {player.categoria}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {player.estado}
                </StyledTableCell>
                <StyledTableCell align="left">
                  {player.obveservacionesJugador}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {player.numeroClub}
                </StyledTableCell>
                <StyledTableCell align="center">{player.sexo}</StyledTableCell>
                <StyledTableCell align="center">
                  {player.ciudadania}
                </StyledTableCell>

                <StyledTableCell align="center">
                  <img src={player.imagen} alt="" style={{ height: "80px" }} />
                </StyledTableCell>

                <StyledTableCell align="center">
                  <IconButton onClick={() => handleOpen(player)}>
                    <EditIcon color="primary" />
                  </IconButton>
                  {/* tengo que consultar si realmente desea eliminar */}

                  <IconButton
                    onClick={() =>
                      deletePlayer(player.idjugador, player.nombre)
                    }
                  >
                    <DeleteForeverIcon color="primary" />
                  </IconButton>
                </StyledTableCell>
              </StyledTableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <PlayerForm
            handleClose={handleClose}
            setIsChange={setIsChange}
            playerSelected={playerSelected}
            // setPlayerSelected={setPlayerSelected}
            // categories={categories}
          />
        </Box>
      </Modal>
    </div>
  );
};

export default PlayerList;
