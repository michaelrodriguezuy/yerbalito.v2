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
  CircularProgress,
  Typography,
  Chip,
} from "@mui/material";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import NoticiaForm from "./NoticiaForm";
import Swal from "sweetalert2";
import { format } from "date-fns";
import es from "date-fns/locale/es";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 800,
  maxWidth: '95%',
  maxHeight: '90vh',
  bgcolor: "white",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  overflowY: 'auto',
};

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const NoticiaList = () => {
  const [noticias, setNoticias] = useState([]);
  const [isChange, setIsChange] = useState(false);
  const [open, setOpen] = useState(false);
  const [noticiaSelected, setNoticiaSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsChange(false);
    fetchAllNoticias();
  }, [isChange]);

  const fetchAllNoticias = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.NOTICIAS_ALL);
      setNoticias(response.data.noticias || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching noticias: ", error);
      setLoading(false);
      Swal.fire("Error", "No se pudieron cargar las noticias", "error");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setNoticiaSelected(null);
  };

  const handleOpen = (noticia) => {
    setNoticiaSelected(noticia);
    setOpen(true);
  };

  const handleDelete = async (noticiaId, titulo) => {
    const result = await Swal.fire({
      title: `¿Eliminar la noticia "${titulo}"?`,
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
        await axios.delete(API_ENDPOINTS.NOTICIAS_DELETE(noticiaId));
        setNoticias(noticias.filter((noticia) => noticia.idnoticia !== noticiaId));
        Swal.fire("¡Eliminado!", "La noticia ha sido eliminada.", "success");
      } catch (error) {
        console.error("Error deleting noticia:", error);
        Swal.fire("Error!", "No se pudo eliminar la noticia.", "error");
      }
    }
  };

  const handleSave = () => {
    setIsChange(true);
    fetchAllNoticias();
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
          Agregar Noticia
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
                <Tooltip title="Título de la noticia">
                  <span>Título</span>
                </Tooltip>
              </StyledTableCell>
              <StyledTableCell align="center">
                <span>Autor</span>
              </StyledTableCell>
              <StyledTableCell align="center">
                <span>Fecha</span>
              </StyledTableCell>
              <StyledTableCell align="center">
                <span>Visible</span>
              </StyledTableCell>
              <StyledTableCell align="center">Acciones</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <StyledTableRow>
                <StyledTableCell colSpan={5} align="center" style={{ padding: "40px" }}>
                  <CircularProgress style={{ color: "#4CAF50" }} />
                  <Typography variant="body1" style={{ marginTop: "20px" }}>
                    Cargando noticias...
                  </Typography>
                </StyledTableCell>
              </StyledTableRow>
            ) : noticias.length === 0 ? (
              <StyledTableRow>
                <StyledTableCell colSpan={5} align="center" style={{ padding: "40px" }}>
                  <Typography variant="body1">
                    No se encontraron noticias
                  </Typography>
                </StyledTableCell>
              </StyledTableRow>
            ) : (
              noticias.map((noticia) => (
                <StyledTableRow key={noticia.idnoticia}>
                  <StyledTableCell align="left">
                    {noticia.titulo}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {noticia.autor}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {format(new Date(noticia.fecha_creacion), "dd-MM-yyyy", { locale: es })}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Chip 
                      label={noticia.visible ? "Visible" : "Oculto"} 
                      color={noticia.visible ? "success" : "default"}
                      size="small"
                    />
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <IconButton onClick={() => handleOpen(noticia)}>
                      <EditIcon color="primary" />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(noticia.idnoticia, noticia.titulo)}
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
          <NoticiaForm
            noticia={noticiaSelected}
            onClose={handleClose}
            onSave={handleSave}
          />
        </Box>
      </Modal>
    </div>
  );
};

export default NoticiaList;

