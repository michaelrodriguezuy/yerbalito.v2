import CategoriesCard from "../../layout/categories/CategoriesCard";
import Typography from "@mui/material/Typography";
import { Paper } from "@mui/material";

const Categories = () => {
  return (
    <div className="page-container" style={{ textAlign: "center", overflowY: "auto" }}>
        <Typography
          variant="h2"
          component="h2"
          gutterBottom
          style={{ 
            margin: "20px 0",
            color: "white",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)" 
          }}
        >
          CATEGORÍAS
        </Typography>
            <Paper 
              elevation={3}
              className="content-paper"
              style={{ 
                backgroundColor: "rgba(0, 0, 0, 0.7)", 
                padding: "20px", 
                width: "100%", 
                maxWidth: "1200px", 
                margin: "0 auto",
                color: "white" 
              }}
            >
        <CategoriesCard />
      </Paper>
    </div>
  );
};

export default Categories;
