import { API_ENDPOINTS } from "../../../config/api";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../../context/AuthContext";
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
import Swal from "sweetalert2";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  maxHeight: '90vh',
  bgcolor: "white",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
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
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [isChange, setIsChange] = useState(false);
  const [open, setOpen] = useState(false);
  const [userSelected, setUserSelected] = useState(null);

  // Verificar si el usuario tiene permisos para ver esta sección (solo admin)
  if (!user || user.rol !== 'admin') {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <h2>Acceso Denegado</h2>
        <p>No tienes permisos para acceder a esta sección.</p>
      </Box>
    );
  }

  useEffect(() => {
    setIsChange(false);
    fetchAllUser();
  }, [isChange]);

  // const deletePlayer = async (id) => {
  //   try {
  //     await axios.delete(`API_ENDPOINTS.SQUAD/${id}`);
  //     setIsChange(true);
  //   } catch (error) {
  //     console.error("Error deleting player: ", error);
  //   }
  // };

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

  const handleOpen = (user) => {
    setUserSelected(user);
    setOpen(true);
  };

  const handleDelete = async (userId) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

        if (result.isConfirmed) {
          try {
            await axios.delete(`${API_ENDPOINTS.USER}/${userId}`);
            setUsers(users.filter((user) => user.id_usuario !== userId));
            Swal.fire("¡Eliminado!", "El usuario ha sido eliminado.", "success");
          } catch (error) {
            console.error("Error deleting user:", error);
            Swal.fire("Error!", "No se pudo eliminar el usuario.", "error");
          }
        }
  };

  const fetchAllUser = async () => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.USER}/all`);
      const formattedResponse = await Promise.all(
        response.data.users.map(async (user) => {
          const estadoFormatted = user.estado === 1 ? 'habilitado' : 'deshabilitado';
          const rolFormatted = user.rol || 'usuario';
          return { ...user, estadoFormatted, rolFormatted };
        })
      );
      setUsers(formattedResponse);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleSave = () => {
    setIsChange(true);
    // Refrescar la lista de usuarios
    fetchAllUser();
  };

  return (
    <div className="slide-up">
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
        style={{ marginTop: "5px", maxHeight: "500px" }}
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
                    onClick={() => handleDelete(user.id_usuario)}
                  >
                    <DeleteForeverIcon color="error" />
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
            user={userSelected}
            onClose={handleClose}
            onSave={handleSave}
          />
        </Box>
      </Modal>
    </div>
  );
};

export default UserList;
