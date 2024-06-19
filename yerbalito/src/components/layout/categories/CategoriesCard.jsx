import { DataGrid } from "@mui/x-data-grid";

import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";

import axios from "axios";

const CategoriesCard = () => {
  /* const { data } = useDemoData({
    dataSet: 'Commodity',
    rowLength: 5,
    maxColumns: 6,
  }); */

  //quiero traerme las categorias que tengo en localhost:3001/categories
  const [categories, setCategories] = useState([]);

  const [estados, setEstados] = useState({});
  const { isLogged } = useContext(AuthContext);

  useEffect(() => {
    const fetchCategoriesEstados = async () => {
      try {
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
      } catch (error) {
        console.error("Error fetching categories: ", error);
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
    },
    { field: "tecnico", headerName: "TECNICO", flex: 1, headerAlign: "center" },
    {
      field: "telefono",
      headerName: "CONTACTO",
      flex: 1,
      headerAlign: "center",
    },
    { field: "edad", headerName: "EDAD", flex: 1, headerAlign: "center" },
    isLogged && {
      field: "idestado",
      headerName: "ESTADO",
      flex: 1,
      headerAlign: "center",
    },
  ].filter(Boolean);

  const getRowId = (category) => category.idcategoria;

  return (
    <>
      <style>
        {`
          .custom-data-grid .MuiDataGrid-cell {
            color: #f0f0f0 !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
          }
        `}
      </style>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ height: 500, width: "60%" }}>
          {categories.length > 0 ? (
            <DataGrid
              rows={categories}
              columns={columns}
              autoHeight
              autoPageSize
              disableColumnMenu
              getRowId={getRowId}
              disableSelectionOnClick
              disableColumnFilter
              disableColumnSelector
              disableDensitySelector
              disableExtendRowFullWidth
              disableMultipleColumnsFiltering
              disableColumnReorder
              disableColumnResize
              hideFooter={true}
              // hideFooterPagination
              // hideFooterSelectedRowCount
              // hideFooterRowCount
              rowsPerPageOptions={[]}
              className="custom-data-grid"
            />
          ) : (
            <p>Cargando categorias...</p>
          )}
        </div>
      </div>
    </>
  );
};

export default CategoriesCard;
