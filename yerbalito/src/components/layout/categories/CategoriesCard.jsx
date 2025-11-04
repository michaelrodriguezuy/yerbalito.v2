import { API_ENDPOINTS } from "../../../config/api";
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
          API_ENDPOINTS.CATEGORIES
        );

        const responseEstados = await axios.get(
          API_ENDPOINTS.ESTADOS
        );

        const estados = responseEstados.data.estados.reduce((acc, estado) => {
          acc[estado.idestado] = estado.tipo_estado;
          return acc;
        }, {});

        const categoriesWhithEstado = response.data.categorias
          .filter((categoria) => {
            // Si está logueado (admin), mostrar todas las categorías excepto SIN FICHAR
            if (isLogged) {
              return categoria.nombre_categoria !== "SIN FICHAR";
            }
            // Si no está logueado, solo mostrar las visibles
            return categoria.visible === 1 && categoria.nombre_categoria !== "SIN FICHAR";
          })
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
      minWidth: 150,
    },
    { 
      field: "tecnico", 
      headerName: "TECNICO", 
      flex: 1, 
      headerAlign: "center",
      align: "center",
      minWidth: 120,
    },
    {
      field: "telefono",
      headerName: "CONTACTO",
      flex: 1,
      headerAlign: "center",
      align: "center",
      minWidth: 100,
    },
    { 
      field: "edad", 
      headerName: "EDAD", 
      flex: 0.5, 
      headerAlign: "center",
      align: "center",
      minWidth: 60,
    },
    // Agregar columna Estado solo para usuarios logueados
    ...(isLogged ? [{
      field: "idestado",
      headerName: "ESTADO",
      flex: 1,
      headerAlign: "center",
      align: "center",
      minWidth: 90,
    }] : []),
  ];

  const getRowId = (category) => category.idcategoria;

  return (
    <Box sx={{ width: "100%", mt: { xs: 2, md: 3 }, mb: { xs: 2, md: 3 }, px: { xs: 1, sm: 0 } }}>
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
        <Box className="loading-container">
          <CircularProgress className="loading-spinner" />
          <Typography className="consistency-caption">
            Cargando categorías...
          </Typography>
        </Box>
      ) : categories.length > 0 ? (
        <Box 
          sx={{ 
            width: "100%", 
            backgroundColor: "rgba(40, 40, 40, 0.95)",
            borderRadius: { xs: "12px", md: "16px" },
            padding: { xs: "12px", sm: "16px", md: "24px" },
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), 0 4px 16px rgba(0, 0, 0, 0.2)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: "linear-gradient(90deg, #4CAF50, #66BB6A, #4CAF50)",
              borderRadius: { xs: "12px 12px 0 0", md: "16px 16px 0 0" }
            }
          }}
        >
         
          {/* Tabla con estilo mejorado */}
          <Box sx={{
            backgroundColor: "rgba(30, 30, 30, 0.8)",
            borderRadius: { xs: "8px", md: "12px" },
            overflow: "auto",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            // Custom scrollbar para móviles
            "&::-webkit-scrollbar": {
              height: "8px",
              width: "8px",
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
          }}>
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
                border: "none",
                // Responsive row height handled via CSS
                '@media (max-width: 600px)': {
                  '& .MuiDataGrid-row': {
                    minHeight: '50px !important',
                  },
                },
                '@media (min-width: 600px) and (max-width: 960px)': {
                  '& .MuiDataGrid-row': {
                    minHeight: '55px !important',
                  },
                },
                '& .MuiDataGrid-cell': {
                  color: "#f0f0f0 !important",
                  display: "flex !important",
                  justifyContent: "center !important",
                  alignItems: "center !important",
                  padding: { xs: "8px 12px !important", sm: "10px 14px !important", md: "12px 16px !important" },
                  fontSize: { xs: "0.8rem !important", sm: "0.9rem !important", md: "1rem !important" },
                  borderColor: "rgba(255, 255, 255, 0.05) !important"
                },
                '& .MuiDataGrid-columnHeader': {
                  backgroundColor: "rgba(50, 50, 50, 0.9) !important",
                  padding: { xs: "12px !important", sm: "14px !important", md: "16px !important" },
                  borderColor: "rgba(255, 255, 255, 0.1) !important"
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  color: "white !important",
                  fontWeight: "bold !important",
                  fontSize: { xs: "0.85rem !important", sm: "0.95rem !important", md: "1.1rem !important" }
                },
                '& .MuiDataGrid-virtualScroller': {
                  backgroundColor: "transparent !important"
                },
                '& .MuiDataGrid-row': {
                  backgroundColor: "transparent !important",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.05) !important"
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: "rgba(76, 175, 80, 0.1) !important"
                },
                '& .MuiDataGrid-columnSeparator': {
                  display: "none !important"
                },
                '& .MuiDataGrid-iconSeparator': {
                  display: "none !important"
                },
                '& .MuiDataGrid-main': {
                  borderRadius: "12px",
                  overflow: "hidden"
                },
                width: "100%"
              }}
            />
          </Box>
        </Box>
      ) : (
        <Box 
          sx={{ 
            padding: "40px", 
            textAlign: "center",
            backgroundColor: "rgba(40, 40, 40, 0.95)",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), 0 4px 16px rgba(0, 0, 0, 0.2)",
            backdropFilter: "blur(10px)"
          }}
        >
          <Typography sx={{ color: "white", fontSize: "1.1rem" }}>
            No se encontraron categorías
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default CategoriesCard;
