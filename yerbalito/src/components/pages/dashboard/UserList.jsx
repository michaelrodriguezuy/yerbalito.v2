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

import UserForm from "./UserForm";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
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

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [isChange, setIsChange] = useState(false);
  const [open, setOpen] = useState(false);
  const [userSelected, setUserSelected] = useState(null);

  useEffect(() => {
    setIsChange(false);
    const fetchAllUser = async () => {
      try {
        const response = await axios.get("http://localhost:3001/user/all");

        const formattedResponse = await Promise.all(
          response.data.users.map(async (user) => {
            const estadoFormatted =
              user.estado === 1 ? "habilitado" : "deshabilitado";
            let rolFormatted;
            switch (user.admin) {
              case 1:
                rolFormatted = "administrador";
                break;
              case 2:
                rolFormatted = "club";
                break;
              case 3:
                rolFormatted = "estudio";
                break;
              default:
                rolFormatted = "desconocido";
            }

            return {
              ...user,
              estado: estadoFormatted,
              rol: rolFormatted,
            };
          })
        );
        // console.log("Formatted Response:", formattedResponse);
        setUsers(formattedResponse);
      } catch (error) {
        console.error("Error fetching users: ", error);
      }
    };

    fetchAllUser();
  }, [isChange]);

  // const deletePlayer = async (id) => {
  //   try {
  //     await axios.delete(`http://localhost:3001/squad/${id}`);
  //     setIsChange(true);
  //   } catch (error) {
  //     console.error("Error deleting player: ", error);
  //   }
  // };

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

  const handleOpen = (user) => {
    setUserSelected(user);
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
          Agregar usuario
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

              <StyledTableCell align="center">
                <Tooltip title="Clic para ordenar">
                  <span>Usuario</span>
                </Tooltip>
              </StyledTableCell>
              <StyledTableCell align="center">
                <span>Contacto</span>
              </StyledTableCell>

              <StyledTableCell align="center">
                <span>Estado</span>
              </StyledTableCell>

              <StyledTableCell align="center">
                <Tooltip title="Clic para ordenar">
                  <span>Rol </span>
                </Tooltip>
              </StyledTableCell>

              <StyledTableCell align="center">Acciones</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <StyledTableRow key={user.id_usuario}>
                <StyledTableCell align="left">{user.nombre}</StyledTableCell>
                <StyledTableCell align="center">{user.usuario}</StyledTableCell>
                <StyledTableCell component="th" scope="row" align="center">
                  {user.celular}
                </StyledTableCell>
                <StyledTableCell align="center">{user.estado}</StyledTableCell>

                <StyledTableCell align="center">{user.rol}</StyledTableCell>

                <StyledTableCell align="center">
                  <IconButton onClick={() => handleOpen(user)}>
                    <EditIcon color="primary" />
                  </IconButton>
                  {/* tengo que consultar si realmente desea eliminar */}

                  <IconButton
                  /* onClick={() => deleteProduct(player.id, player.code)} */
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
          <UserForm
            handleClose={handleClose}
            setIsChange={setIsChange}
            userSelected={userSelected}
            setUserSelected={setUserSelected}
            // categories={categories}
          />
        </Box>
      </Modal>
    </div>
  );
};

export default UserList;
