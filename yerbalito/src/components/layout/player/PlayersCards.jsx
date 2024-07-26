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
} from "@mui/material";

const PlayersCard = () => {
  const [squads, setSquads] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    fetchSquads();
    fetchCategories();
  }, []);

  const fetchSquads = async () => {
    try {
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
    } catch (error) {
      console.error("Error fetching squads: ", error);
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
    <>
      <FormControl variant="outlined" style={{ margin: "20px" }}>
        <InputLabel id="status-filter-label" style={{ color: "white" }}>
          Estado
        </InputLabel>
        <Select
          labelId="status-filter-label"
          id="status-filter"
          value={filterStatus}
          onChange={handleStatusChange}
          label="Estado"
          style={{ color: "white" }}
        >
          <MenuItem value="all">Todos</MenuItem>
          <MenuItem value="Habilitado">Habilitados</MenuItem>
          <MenuItem value="Deshabilitado">Deshabilitados</MenuItem>
          <MenuItem value="Exonerado">Exonerados</MenuItem>
        </Select>
      </FormControl>

      <FormControl variant="outlined" style={{ margin: "20px" }}>
        <InputLabel id="category-filter-label" style={{ color: "white" }}>
          Categoría
        </InputLabel>
        <Select
          labelId="category-filter-label"
          id="category-filter"
          value={filterCategory}
          onChange={handleCategoryChange}
          label="Categoría"
          style={{ color: "white" }}
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

      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ width: "90%", maxHeight: 500, overflow: "auto" }}>
          <TableContainer
            component={Paper}
            style={{ backgroundColor: "transparent" }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell style={{ color: "white" }}>NOMBRE</TableCell>
                  <TableCell style={{ color: "white", textAlign: "center" }}>
                    CATEGORÍA
                  </TableCell>
                  <TableCell style={{ color: "white", textAlign: "center" }}>
                    ESTADO
                  </TableCell>
                  <TableCell style={{ color: "white", textAlign: "center" }}>
                    ÚLTIMO MES PAGO
                  </TableCell>
                  <TableCell style={{ color: "white", textAlign: "center" }}>
                    AÑO
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSquads.map((row) => (
                  <TableRow key={row.idjugador}>
                    <TableCell style={{ color: "white" }}>
                      {row.nombre} {row.apellido}
                    </TableCell>
                    <TableCell style={{ color: "white", textAlign: "center" }}>
                      <Tooltip
                        title={handleCategoryTooltip(row.idcategoria)}
                        arrow
                      >
                        <span style={{ color: "white" }}>{row.categoria}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell style={{ color: "white", textAlign: "center" }}>
                      {row.estado}
                    </TableCell>
                    <TableCell style={{ color: "white", textAlign: "center" }}>
                      {row.ultimoMesPago}
                    </TableCell>
                    <TableCell style={{ color: "white", textAlign: "center" }}>
                      {row.anioPago}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
    </>
  );
};

export default PlayersCard;
