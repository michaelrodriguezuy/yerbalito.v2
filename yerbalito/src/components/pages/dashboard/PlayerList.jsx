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
  width: '50%',
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
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
  const [isChange, setIsChange] = useState(false);
  const [open, setOpen] = useState(false);
  const [playerSelected, setPlayerSelected] = useState(null);

  useEffect(() => {
    setIsChange(false);
    const fetchAllPlayer = async () => {
      try {
        const response = await axios.get("http://localhost:3001/squad/all");

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
        // console.log("Formatted Response:", formattedResponse);
        setPlayers(formattedResponse);
      } catch (error) {
        console.error("Error fetching players: ", error);
      }
    };

    fetchAllPlayer();
  }, [isChange]);

  const fetchCategory = async (idcategoria) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/categories/${idcategoria}`
      );
      // console.log("fetchCategory response:", response.data.categoria.nombre_categoria);
      return response.data.categoria.nombre_categoria;
    } catch (error) {
      console.error("Error fetching category: ", error);
      throw error;
    }
  };
  const fetchEstado = async (idestado) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/estados/${idestado}`
      );
      // console.log("fetchEstado response:", response.data.estado.tipo_estado);
      return response.data.estado;
    } catch (error) {
      console.error("Error fetching estado: ", error);
      throw error;
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
          await axios.delete(`http://localhost:3001/squad/${id}`);
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
  //       `http://localhost:3001/squad/search/${searchTerm}`
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
    <div>
      <Box
        style={{
          display: "flex",
          justifyContent: "flex-start",
          marginBottom: "10px",
        }}
      >
        <Button variant="contained" onClick={() => handleOpen(null)}>
          Agregar jugador
        </Button>
      </Box>
      <TableContainer
        component={Paper}
        style={{ marginTop: "5px", maxHeight: "500px", overflowY: "auto" }}
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
            {players.map((player) => (
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
            ))}
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
