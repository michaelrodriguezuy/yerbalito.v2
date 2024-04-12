import { DataGrid } from "@mui/x-data-grid";
import { useDemoData } from "@mui/x-data-grid-generator";

import { useContext, useState, useEffect } from "react";
import axios from "axios";

const CategoriesCard = () => {
  /* const { data } = useDemoData({
    dataSet: 'Commodity',
    rowLength: 5,
    maxColumns: 6,
  }); */

  //quiero traerme las categorias que tengo en localhost:3001/categories
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://localhost:3001/categories");
        setCategories(response.data.categorias);
      } catch (error) {
        console.error("Error fetching categories: ", error);
      }
    };
    fetchCategories();
  }, []);

  const columns = [
    // { field: "idcategoria", headerName: "ID", width: 90 },

    { field: "nombre_categoria", headerName: "Nombre", width: 150 },
    { field: "tecnico", headerName: "Tecnico", width: 150 },
    { field: "telefono", headerName: "Contacto", width: 150 },
    { field: "edad", headerName: "Edad", width: 150 },
    { field: "idestado", headerName: "Estado", width: 150 },
  ];

  const getRowId = (category) => category.idcategoria;

  return (
    <>
      <div style={{ width: "100%" }}>
        <div
          style={{
            height: 500,
            width: "60%",
            backgroundColor: "white" }}
        >
          {categories.length > 0 ? (
            <DataGrid
              rows={categories}
              columns={columns}
              // pageSize={5}
              // rowsPerPageOptions={[5]}
              // checkboxSelection

              pagination={false}
              pageSize={categories.length}
              getRowId={getRowId}
              disableRowCount={true}
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
