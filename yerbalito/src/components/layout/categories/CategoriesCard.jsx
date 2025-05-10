import { DataGrid } from "@mui/x-data-grid";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import axios from "axios";
import { CircularProgress, Box, Typography } from "@mui/material";

const CategoriesCard = () => {
  /* const { data } = useDemoData({
    dataSet: 'Commodity',
    rowLength: 5,
    maxColumns: 6,
  }); */

  //quiero traerme las categorias que tengo en localhost:3001/categories
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isLogged } = useContext(AuthContext);
  const [estados, setEstados] = useState({});

  useEffect(() => {
    const fetchCategoriesEstados = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:3001/categories"
        );

        const responseEstados = await axios.get(
          "http://localhost:3001/estados"
        );

        const estados = responseEstados.data.estados.reduce((acc, estado) => {
          acc[estado.idestado] = estado.tipo_estado;
          return acc;
        }, {});

        const categoriesWhithEstado = response.data.categorias
          .filter((categoria) => categoria.visible === 1)
          .map((categoria) => ({
            ...categoria,
            idestado: estados[categoria.idestado] || categoria.idestado,
          }));

        setCategories(categoriesWhithEstado);
        setEstados(estados);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching categories: ", error);
        setLoading(false);
      }
    };
    fetchCategoriesEstados();
  }, []);

  const columns = [
    {
      field: "nombre_categoria",
      headerName: "NOMBRE",
      flex: 1,
      headerAlign: "center",
      align: "center",
      minWidth: 200,
    },
    { 
      field: "tecnico", 
      headerName: "TECNICO", 
      flex: 1, 
      headerAlign: "center",
      align: "center",
      minWidth: 200,
    },
    {
      field: "telefono",
      headerName: "CONTACTO",
      flex: 1,
      headerAlign: "center",
      align: "center",
      minWidth: 150,
    },
    { 
      field: "edad", 
      headerName: "EDAD", 
      flex: 0.5, 
      headerAlign: "center",
      align: "center",
      minWidth: 100,
    },
    isLogged && {
      field: "idestado",
      headerName: "ESTADO",
      flex: 1,
      headerAlign: "center",
      align: "center",
      minWidth: 120,
    },
  ].filter(Boolean);

  const getRowId = (category) => category.idcategoria;

  return (
    <Box sx={{ width: "100%", mt: 3, mb: 3 }}>
      <style>
        {`
          .custom-data-grid .MuiDataGrid-cell {
            color: #f0f0f0 !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            padding: 10px 16px !important;
            font-size: 1rem !important;
          }
          .custom-data-grid .MuiDataGrid-columnHeader {
            background-color: rgba(40, 40, 40, 0.9) !important;
            padding: 16px !important;
          }
          .custom-data-grid .MuiDataGrid-columnHeaderTitle {
            color: white !important;
            font-weight: bold !important;
            font-size: 1.1rem !important;
          }
          .custom-data-grid .MuiDataGrid-virtualScroller {
            background-color: rgba(30, 30, 30, 0.8) !important;
          }
          .custom-data-grid .MuiDataGrid-row {
            background-color: rgba(40, 40, 40, 0.7) !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
          }
          .custom-data-grid .MuiDataGrid-row:hover {
            background-color: rgba(60, 60, 60, 0.9) !important;
          }
          .custom-data-grid .MuiDataGrid-columnSeparator {
            display: none !important;
          }
          .custom-data-grid .MuiDataGrid-iconSeparator {
            display: none !important;
          }
        `}
      </style>
      
      {loading ? (
        <Box 
          sx={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            height: "200px",
            backgroundColor: "rgba(20, 20, 20, 0.7)",
            borderRadius: "8px"
          }}
        >
          <CircularProgress style={{ color: "white" }} />
        </Box>
      ) : categories.length > 0 ? (
        <Box 
          sx={{ 
            width: "100%", 
            height: "auto",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)"
          }}
        >
          <DataGrid
            rows={categories}
            columns={columns}
            autoHeight
            getRowId={getRowId}
            disableColumnMenu
            disableSelectionOnClick
            disableColumnFilter
            disableColumnSelector
            disableDensitySelector
            disableExtendRowFullWidth
            disableMultipleColumnsFiltering
            disableColumnReorder
            disableColumnResize
            hideFooter={true}
            className="custom-data-grid"
            rowHeight={60}
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.2)',
              '& .MuiDataGrid-cell': {
                borderColor: 'rgba(255, 255, 255, 0.1)'
              },
              '& .MuiDataGrid-main': {
                borderRadius: '8px',
                overflow: 'hidden'
              },
              width: '100%'
            }}
          />
        </Box>
      ) : (
        <Box 
          sx={{ 
            padding: "30px", 
            backgroundColor: "rgba(20, 20, 20, 0.7)",
            textAlign: "center",
            borderRadius: "8px"
          }}
        >
          <Typography sx={{ color: "white", fontSize: "1.2rem" }}>
            No se encontraron categorías
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default CategoriesCard;
