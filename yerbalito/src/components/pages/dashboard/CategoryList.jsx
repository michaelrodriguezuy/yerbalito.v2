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

import CategoryForm from "./CategoryForm";

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

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [isChange, setIsChange] = useState(false);
  const [open, setOpen] = useState(false);
  const [categorySelected, setCategorySelected] = useState(null);

  useEffect(() => {
    setIsChange(false);
    const fetchAllCategory = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/categories/all"
        );

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
        // console.log("Formatted Response:", formattedResponse);
        setCategories(formattedResponse);
      } catch (error) {
        console.error("Error fetching categories: ", error);
      }
    };

    fetchAllCategory();
  }, [isChange]);

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

  const handleOpen = (category) => {
    setCategorySelected(category);
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
          Agregar categoría
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
                  <span>Tecnico</span>
                </Tooltip>
              </StyledTableCell>
              <StyledTableCell align="left">
                <Tooltip title="Clic para ordenar">
                  <span>Contacto</span>
                </Tooltip>
              </StyledTableCell>

              <StyledTableCell align="center">
                <Tooltip title="Clic para ordenar">
                  <span>Estado</span>
                </Tooltip>
              </StyledTableCell>

              <StyledTableCell align="center">
                <span>Edad </span>
              </StyledTableCell>

              <StyledTableCell align="center">Acciones</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <StyledTableRow key={category.idcategoria}>
                <StyledTableCell align="left">
                  {category.nombre_categoria}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {category.tecnico}
                </StyledTableCell>
                <StyledTableCell component="th" scope="row" align="left">
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
          <CategoryForm
            handleClose={handleClose}
            setIsChange={setIsChange}
            categorySelected={categorySelected}
            setCategorySelected={setCategorySelected}
            // categories={categories}
          />
        </Box>
      </Modal>
    </div>
  );
};

export default CategoryList;
