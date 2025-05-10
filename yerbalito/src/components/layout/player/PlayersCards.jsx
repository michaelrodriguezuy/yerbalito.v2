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
  Typography
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
      const response = await axios.get(
        "http://localhost:3001/squad"
      );

      // console.log("response: ", response.data.squads);

      const data = response.data.squads;
      const updatedSquads = await Promise.all(
        data.map(async (squad) => {
          try {
            // console.log("squad: ", squad);
            const categoria = await fetchCategory(squad.idcategoria);
            const estadoData = await fetchEstado(squad.idestado);
            const estado = estadoData ? estadoData.tipo_estado : null;
            const ultimoPago = await fetchUltimoPago(squad.idjugador);
            return { ...squad, categoria, estado, ...ultimoPago };
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

  const fetchCategory = async (idcategoria) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/categories/${idcategoria}`
      );

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
      return response.data.estado;
    } catch (error) {
      console.error("Error fetching estado: ", error);
      throw error;
    }
  };

  const fetchUltimoPago = async (idjugador) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/ultimoPago/${idjugador}`
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
      const response = await axios.get(
        "http://localhost:3001/categories"
      );
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
    <Paper
      elevation={3}
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        padding: "20px",
        maxWidth: "95%",
        width: "1300px",
        margin: "0 auto",
        color: "white"
      }}
    >
      {/* Título de la sección */}
      <h1 style={{ 
        fontSize: "2rem", 
        margin: "20px 0 30px 0",
        color: "white",
        textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)"
      }}>
        LISTA DE JUGADOR@S
      </h1>
    
      {/* Contenedor para los filtros con mejor alineación */}
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        gap: "20px", 
        marginBottom: "30px", 
        marginTop: "10px"
      }}>
        <FormControl 
          variant="outlined" 
          style={{ 
            minWidth: "200px",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            borderRadius: "8px"
          }}
        >
          <InputLabel id="status-filter-label" style={{ color: "white", fontWeight: "bold" }}>
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
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.6)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.8)',
              }
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
            borderRadius: "8px"
          }}
        >
          <InputLabel id="category-filter-label" style={{ color: "white", fontWeight: "bold" }}>
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
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.6)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.8)',
              }
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

      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxHeight: 350, overflow: "auto" }}>
          <TableContainer
            component={Paper}
            style={{ backgroundColor: "transparent" }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ 
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  borderBottom: "2px solid rgba(255, 255, 255, 0.2)"
                }}>
                  <TableCell style={{ 
                    color: "white", 
                    fontWeight: "bold",
                    fontSize: "1rem",
                    paddingTop: "12px",
                    paddingBottom: "12px"
                  }}>NOMBRE</TableCell>
                  <TableCell style={{ 
                    color: "white", 
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    paddingTop: "12px",
                    paddingBottom: "12px"
                  }}>
                    CATEGORÍA
                  </TableCell>
                  <TableCell style={{ 
                    color: "white", 
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    paddingTop: "12px",
                    paddingBottom: "12px"
                  }}>
                    ESTADO
                  </TableCell>
                  <TableCell style={{ 
                    color: "white", 
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    paddingTop: "12px",
                    paddingBottom: "12px"
                  }}>
                    ÚLTIMO MES PAGO
                  </TableCell>
                  <TableCell style={{ 
                    color: "white", 
                    textAlign: "center",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    paddingTop: "12px",
                    paddingBottom: "12px"
                  }}>
                    AÑO
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} style={{ textAlign: "center", padding: "40px" }}>
                      <CircularProgress style={{ color: "white" }} />
                      <Typography variant="body1" style={{ color: "white", marginTop: "20px" }}>
                        Cargando jugadores...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredSquads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} style={{ textAlign: "center", padding: "40px" }}>
                      <Typography variant="body1" style={{ color: "white" }}>
                        No se encontraron jugadores con los filtros seleccionados
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSquads.map((row, index) => (
                    <TableRow 
                      key={row.idjugador}
                      sx={{ 
                        backgroundColor: index % 2 === 0 ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 255, 255, 0.07)",
                        '&:hover': {
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                        }
                      }}
                    >
                      <TableCell style={{ 
                        color: "white",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
                      }}>
                        {row.nombre} {row.apellido}
                      </TableCell>
                      <TableCell style={{ 
                        color: "white", 
                        textAlign: "center",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
                      }}>
                        <Tooltip
                          title={handleCategoryTooltip(row.idcategoria)}
                          arrow
                        >
                          <span style={{ color: "white" }}>{row.categoria}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell style={{ 
                        textAlign: "center",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                        color: row.estado === "Habilitado" ? "#4caf50" : 
                               row.estado === "Deshabilitado" ? "#f44336" : 
                               "#ff9800"
                      }}>
                        {row.estado}
                      </TableCell>
                      <TableCell style={{ 
                        color: "white", 
                        textAlign: "center",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
                      }}>
                        {row.ultimoMesPago}
                      </TableCell>
                      <TableCell style={{ 
                        color: "white", 
                        textAlign: "center",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
                      }}>
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
    </Paper>
  );
};

export default PlayersCard;
