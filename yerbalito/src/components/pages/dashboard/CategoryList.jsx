import { API_ENDPOINTS } from "../../../config/api";
import { useEffect, useState, useContext } from "react";
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
  CircularProgress,
  Typography,
} from "@mui/material";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";

// import { withStyles } from "@mui/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

import CategoryForm from "./CategoryForm";
import Swal from "sweetalert2";
import { AuthContext } from "../../../context/AuthContext";

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

const CategoryList = () => {
  const { user } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [isChange, setIsChange] = useState(false);
  const [open, setOpen] = useState(false);
  const [categorySelected, setCategorySelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsChange(false);
    fetchAllCategory();
  }, [isChange]);

  const fetchEstado = async (idestado) => {
    try {
      const response = await axios.get(
        `${API_ENDPOINTS.ESTADOS}/${idestado}`
      );
      // console.log("fetchEstado response:", response.data.estado.tipo_estado);
      return response.data.estado;
    } catch (error) {
      console.error("Error fetching estado: ", error);
      throw error;
    }
  };

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

  const handleOpen = (category) => {
    setCategorySelected(category);
    setOpen(true);
  };

  const handleDelete = async (categoryId) => {
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
        await axios.delete(`${API_ENDPOINTS.CATEGORIES}/${categoryId}`);
        setCategories(categories.filter((category) => category.idcategoria !== categoryId));
        Swal.fire("¡Eliminado!", "La categoría ha sido eliminada.", "success");
      } catch (error) {
        console.error("Error deleting category:", error);
        Swal.fire("Error!", "No se pudo eliminar la categoría.", "error");
      }
    }
  };

  const fetchAllCategory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.CATEGORIES_ALL, {
        headers: { 'x-role': user?.rol || 'usuario' },
        params: user?.rol === 'admin' ? { role: 'admin' } : {}
      });
      const formattedResponse = await Promise.all(
        response.data.categorias.map(async (category) => {
          const estadoData = await fetchEstado(category.idestado);
          const estado = estadoData ? estadoData.tipo_estado : null;
          return {
            ...category,
            estado,
          };
        })
      );
      setCategories(formattedResponse);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching categories: ", error);
      setLoading(false);
    }
  };

  const handleSave = () => {
    setIsChange(true);
    // Refrescar la lista de categorías
    fetchAllCategory();
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
          Agregar categoría
        </Button>
      </Box>
      <TableContainer
        component={Paper}
        style={{ marginTop: "5px", maxHeight: "500px" }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <StyledTableCell align="center">
                <Tooltip title="Clic para ordenar">
                  <span>Nombre</span>
                </Tooltip>
              </StyledTableCell>

              <StyledTableCell align="center">
                <Tooltip title="Clic para ordenar">
                  <span>Tecnico</span>
                </Tooltip>
              </StyledTableCell>
              <StyledTableCell align="center">
                <span>Contacto</span>
              </StyledTableCell>

              <StyledTableCell align="center">
                <span>Estado</span>
              </StyledTableCell>

              <StyledTableCell align="center">
                <span>Edad </span>
              </StyledTableCell>

              <StyledTableCell align="center">Acciones</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <StyledTableRow>
                <StyledTableCell colSpan={6} align="center" style={{ padding: "40px" }}>
                  <CircularProgress style={{ color: "#4CAF50" }} />
                  <Typography variant="body1" style={{ marginTop: "20px" }}>
                    Cargando categorías...
                  </Typography>
                </StyledTableCell>
              </StyledTableRow>
            ) : categories.length === 0 ? (
              <StyledTableRow>
                <StyledTableCell colSpan={6} align="center" style={{ padding: "40px" }}>
                  <Typography variant="body1">
                    No se encontraron categorías
                  </Typography>
                </StyledTableCell>
              </StyledTableRow>
            ) : (
              categories.map((category) => (
              <StyledTableRow key={category.idcategoria}>
                <StyledTableCell align="center">
                  {category.nombre_categoria}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {category.tecnico}
                </StyledTableCell>
                <StyledTableCell component="th" scope="row" align="center">
                  {category.telefono}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {category.estado}
                </StyledTableCell>

                <StyledTableCell align="center">
                  {category.edad}
                </StyledTableCell>

                <StyledTableCell align="center">
                  <IconButton onClick={() => handleOpen(category)}>
                    <EditIcon color="primary" />
                  </IconButton>
                  {/* tengo que consultar si realmente desea eliminar */}

                  <IconButton
                    onClick={() => handleDelete(category.idcategoria)}
                  >
                    <DeleteForeverIcon color="error" />
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
          <CategoryForm
            category={categorySelected}
            onClose={handleClose}
            onSave={handleSave}
          />
        </Box>
      </Modal>
    </div>
  );
};

export default CategoryList;
