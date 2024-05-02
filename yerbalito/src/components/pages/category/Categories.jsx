import CategoriesCard from "../../layout/categories/CategoriesCard";
import Typography from "@mui/material/Typography";

const Categories = () => {
  return (
    <div className="container" style={{ textAlign: "center",maxHeight: "100vh", overflowY: "auto"  }}>



      <Typography
        variant="h2"
        component="h2"
        gutterBottom
        style={{ margin: "20px 0" }}
      >
        Categorías
      </Typography>
      <CategoriesCard />
    </div>
  );
};

export default Categories;
