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
} from "@mui/material";

const PlayersCard = () => {
  const [squads, setSquads] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [loading, setLoading] = useState(true);

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

      return { ultimoMesPago, anioPago };
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

  return (
    <>
      {/* Contenedor para los filtros con mejor alineación */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginBottom: "30px",
          marginTop: "10px",
        }}
      >
        <FormControl
          variant="outlined"
          style={{
            minWidth: "200px",
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
          style={{
            minWidth: "200px",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            borderRadius: "8px",
          }}
        >
          <InputLabel
            id="category-filter-label"
            style={{ color: "white", fontWeight: "bold" }}
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
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          overflowX: "auto",
        }}
      >
        <div style={{ width: "100%", maxHeight: 350, minWidth: "800px", overflowY: 'auto' }}>
          <TableContainer
            component={Paper}
            className="consistency-table"
            style={{ backgroundColor: "transparent", minWidth: "800px" }}
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
                    style={{
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      paddingTop: "12px",
                      paddingBottom: "12px",
                    }}
                  >
                    NOMBRE
                  </TableCell>
                  <TableCell
                    style={{
                      color: "white",
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      paddingTop: "12px",
                      paddingBottom: "12px",
                    }}
                  >
                    CATEGORÍA
                  </TableCell>
                  <TableCell
                    style={{
                      color: "white",
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      paddingTop: "12px",
                      paddingBottom: "12px",
                    }}
                  >
                    ESTADO
                  </TableCell>
                  <TableCell
                    style={{
                      color: "white",
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      paddingTop: "12px",
                      paddingBottom: "12px",
                    }}
                  >
                    ÚLTIMO MES PAGO
                  </TableCell>
                  <TableCell
                    style={{
                      color: "white",
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      paddingTop: "12px",
                      paddingBottom: "12px",
                    }}
                  >
                    AÑO
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="loading-container">
                      <CircularProgress className="loading-spinner" />
                      <Typography className="consistency-caption">
                        Cargando jugadores...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredSquads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="empty-state">
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
                        style={{
                          color: "white",
                          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                        }}
                      >
                        {row.nombre} {row.apellido}
                      </TableCell>
                      <TableCell
                        style={{
                          color: "white",
                          textAlign: "center",
                          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
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
                        style={{
                          textAlign: "center",
                          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                          color:
                            row.estado === "Habilitado"
                              ? "#4caf50"
                              : row.estado === "Deshabilitado"
                              ? "#f44336"
                              : "#ff9800",
                        }}
                      >
                        {row.estado}
                      </TableCell>
                      <TableCell
                        style={{
                          color: "white",
                          textAlign: "center",
                          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                        }}
                      >
                        {row.ultimoMesPago}
                      </TableCell>
                      <TableCell
                        style={{
                          color: "white",
                          textAlign: "center",
                          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
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
        </div>
      </div>
    </>
  );
};

export default PlayersCard;
