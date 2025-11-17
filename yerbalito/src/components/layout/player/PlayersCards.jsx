import { API_ENDPOINTS } from "../../../config/api";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Box,
  Typography,
  Button,
} from "@mui/material";
import { Print as PrintIcon } from "@mui/icons-material";
import PrintSquadsModal from "./PrintSquadsModal";

const PlayersCard = () => {
  const [squads, setSquads] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [printModalOpen, setPrintModalOpen] = useState(false);

  useEffect(() => {
    fetchSquads();
    fetchCategories();
  }, []);

  const fetchSquads = async () => {
    try {
      setLoading(true);
      
      // Fetch jugadores y estados en paralelo (una sola llamada para todos los estados)
      const [squadsResponse, estadosResponse] = await Promise.all([
        axios.get(API_ENDPOINTS.SQUAD),
        axios.get(API_ENDPOINTS.ESTADOS)
      ]);

      const data = squadsResponse.data.squads;

      // Crear un mapa de estados { idestado: tipo_estado } para acceso rápido O(1)
      const estadosMap = {};
      if (estadosResponse.data.estados && Array.isArray(estadosResponse.data.estados)) {
        estadosResponse.data.estados.forEach(estado => {
          estadosMap[estado.idestado] = estado.tipo_estado;
        });
      }

      // Para cada jugador, obtener el último pago y usar datos que ya vienen del backend
      const updatedSquads = await Promise.all(
        data.map(async (squad) => {
          try {
            const ultimoPago = await fetchUltimoPago(squad.idjugador);
            
            return { 
              ...squad, 
              // Usar nombre_categoria que ya viene del backend (JOIN en la query SQL)
              categoria: squad.nombre_categoria || 'Sin categoría',
              // Usar el mapa de estados (acceso O(1) en memoria, no llamada HTTP)
              estado: estadosMap[squad.idestado] || 'Sin estado',
              ...ultimoPago 
            };
          } catch (error) {
            console.error("Error en Promise.all:", error);
            return null;
          }
        })
      );
      setSquads(updatedSquads.filter((squad) => squad !== null));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching squads: ", error);
      setLoading(false);
    }
  };

  const fetchUltimoPago = async (idjugador) => {
    try {
      const response = await axios.get(
        `${API_ENDPOINTS.ULTIMO_PAGO(idjugador)}`
      );

      const ultimoMesPago = response.data.ultimoMesPago;
      const anioPago = response.data.anioPago;
      const tieneMesesAnterioresVencidos = response.data.tieneMesesAnterioresVencidos || false;

      return { ultimoMesPago, anioPago, tieneMesesAnterioresVencidos };
    } catch (error) {
      console.error("Error fetching ultimo pago: ", error);
      throw error;
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.CATEGORIES);
      setCategories(response.data.categorias);
      // console.log("response.data.categorias: ", response.data.categorias);
    } catch (error) {
      console.error("Error fetching categories: ", error);
    }
  };

  const handleCategoryTooltip = (categoryId) => {
    const category = categories.find(
      (category) => category.idcategoria === categoryId
    );
    if (category) {
      const numberOfPlayers = squads.filter(
        (squad) => squad.idcategoria === categoryId
      ).length;
      return `${numberOfPlayers} jugadores`;
    } else {
      return "0 jugadores";
    }
  };

  const handleStatusChange = (event) => {
    setFilterStatus(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setFilterCategory(event.target.value);
  };

  const filteredSquads = squads.filter((squad) => {
    if (filterStatus !== "all" && squad.estado !== filterStatus) {
      return false;
    }
    if (
      filterCategory !== "all" &&
      squad.idcategoria !== parseInt(filterCategory)
    ) {
      return false;
    }
    return true;
  });

  const getCategoryName = () => {
    if (filterCategory === "all") return null;
    const category = categories.find(c => c.idcategoria === parseInt(filterCategory));
    return category ? category.nombre_categoria : null;
  };

  return (
    <>
      {/* Contenedor para los filtros con mejor alineación */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "center",
          alignItems: { xs: "stretch", sm: "center" },
          gap: { xs: 2, sm: 3, md: "20px" },
          marginBottom: { xs: "20px", md: "30px" },
          marginTop: { xs: "10px", md: "10px" },
          px: { xs: 2, sm: 0 }
        }}
      >
        {filteredSquads.length > 0 && (
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={() => setPrintModalOpen(true)}
            sx={{
              backgroundColor: "#1E8732",
              "&:hover": { backgroundColor: "#156525" },
              minWidth: { xs: "100%", sm: "auto" },
            }}
          >
            Vista de Impresión
          </Button>
        )}
        <FormControl
          variant="outlined"
          sx={{
            minWidth: { xs: "100%", sm: "200px" },
            maxWidth: { xs: "100%", sm: "200px" },
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            borderRadius: "8px",
          }}
        >
          <InputLabel
            id="status-filter-label"
            style={{ color: "white", fontWeight: "bold" }}
          >
            Estado
          </InputLabel>
          <Select
            labelId="status-filter-label"
            id="status-filter"
            value={filterStatus}
            onChange={handleStatusChange}
            label="Estado"
            style={{ color: "white" }}
            sx={{
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255, 255, 255, 0.3)",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255, 255, 255, 0.6)",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255, 255, 255, 0.8)",
              },
            }}
          >
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value="Habilitado">Habilitados</MenuItem>
            <MenuItem value="Deshabilitado">Deshabilitados</MenuItem>
            <MenuItem value="Exonerado">Exonerados</MenuItem>
          </Select>
        </FormControl>

        <FormControl
          variant="outlined"
          sx={{
            minWidth: { xs: "100%", sm: "200px" },
            maxWidth: { xs: "100%", sm: "200px" },
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            borderRadius: "8px",
          }}
        >
          <InputLabel
            id="category-filter-label"
            sx={{ color: "white", fontWeight: "bold" }}
          >
            Categoría
          </InputLabel>
          <Select
            labelId="category-filter-label"
            id="category-filter"
            value={filterCategory}
            onChange={handleCategoryChange}
            label="Categoría"
            style={{ color: "white" }}
            sx={{
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255, 255, 255, 0.3)",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255, 255, 255, 0.6)",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255, 255, 255, 0.8)",
              },
            }}
          >
            <MenuItem key="all" value="all">
              Todas
            </MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.idcategoria} value={category.idcategoria}>
                {category.nombre_categoria}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          overflowX: "auto",
          px: { xs: 1, sm: 0 },
          // Custom scrollbar para móviles
          "&::-webkit-scrollbar": {
            height: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(76, 175, 80, 0.6)",
            borderRadius: "4px",
            "&:hover": {
              background: "rgba(76, 175, 80, 0.8)",
            },
          },
        }}
      >
        <Box 
          sx={{ 
            width: "100%", 
            maxHeight: { xs: 400, md: 350 }, 
            minWidth: { xs: "600px", sm: "700px", md: "800px" }, 
            overflowY: "auto" 
          }}
        >
          <TableContainer
            component={Paper}
            className="consistency-table"
            sx={{ 
              backgroundColor: "transparent", 
              minWidth: { xs: "600px", sm: "700px", md: "800px" } 
            }}
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
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" },
                      paddingTop: { xs: "8px", md: "12px" },
                      paddingBottom: { xs: "8px", md: "12px" },
                      paddingLeft: { xs: "8px", md: "16px" },
                      paddingRight: { xs: "8px", md: "16px" },
                    }}
                  >
                    NOMBRE
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "white",
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" },
                      paddingTop: { xs: "8px", md: "12px" },
                      paddingBottom: { xs: "8px", md: "12px" },
                      paddingLeft: { xs: "8px", md: "16px" },
                      paddingRight: { xs: "8px", md: "16px" },
                    }}
                  >
                    CATEGORÍA
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "white",
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" },
                      paddingTop: { xs: "8px", md: "12px" },
                      paddingBottom: { xs: "8px", md: "12px" },
                      paddingLeft: { xs: "8px", md: "16px" },
                      paddingRight: { xs: "8px", md: "16px" },
                    }}
                  >
                    ÚLTIMO MES PAGO
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "white",
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" },
                      paddingTop: { xs: "8px", md: "12px" },
                      paddingBottom: { xs: "8px", md: "12px" },
                      paddingLeft: { xs: "8px", md: "16px" },
                      paddingRight: { xs: "8px", md: "16px" },
                    }}
                  >
                    AÑO
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="loading-container">
                      <CircularProgress className="loading-spinner" />
                      <Typography className="consistency-caption">
                        Cargando jugadores...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredSquads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="empty-state">
                      <Typography className="consistency-caption">
                        No se encontraron jugadores con los filtros
                        seleccionados
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSquads.map((row, index) => (
                    <TableRow
                      key={row.idjugador}
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
                        sx={{
                          color: "white",
                          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                          fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
                          paddingLeft: { xs: "8px", md: "16px" },
                          paddingRight: { xs: "8px", md: "16px" },
                        }}
                      >
                        {row.nombre} {row.apellido}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          textAlign: "center",
                          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                          fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
                          paddingLeft: { xs: "8px", md: "16px" },
                          paddingRight: { xs: "8px", md: "16px" },
                        }}
                      >
                        <Tooltip
                          title={handleCategoryTooltip(row.idcategoria)}
                          arrow
                        >
                          <span style={{ color: "white" }}>
                            {row.categoria}
                          </span>
                        </Tooltip>
                      </TableCell>
                      <TableCell
                        sx={{
                          textAlign: "center",
                          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                          fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
                          paddingLeft: { xs: "8px", md: "16px" },
                          paddingRight: { xs: "8px", md: "16px" },
                          color: 
                            row.estado === "Exonerado"
                              ? "#2196f3" // Azul para exonerado
                              : row.estado === "Habilitado"
                              ? "#4caf50"
                              : row.estado === "Deshabilitado" && row.tieneMesesAnterioresVencidos
                              ? "#f44336" // Rojo para más de 1 mes vencido
                              : row.estado === "Deshabilitado"
                              ? "#ffc107" // Amarillo para solo 1 mes vencido
                              : "white",
                          fontWeight: "bold",
                        }}
                      >
                        {row.ultimoMesPago}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          textAlign: "center",
                          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                          fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
                          paddingLeft: { xs: "8px", md: "16px" },
                          paddingRight: { xs: "8px", md: "16px" },
                        }}
                      >
                        {row.anioPago}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      <PrintSquadsModal
        open={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        players={filteredSquads}
        categoryName={getCategoryName()}
      />
    </>
  );
};

export default PlayersCard;
