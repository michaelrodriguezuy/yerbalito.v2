import PlayerList from "./PlayerList";
import CategoryList from "./CategoryList";
import UserList from "./UserList";
import { Box, Button } from "@mui/material";
import { useState } from "react";

const Dashboard = () => {
  const [currentView, setCurrentView] = useState("players");

  const renderCurrentView = () => {
    switch (currentView) {
      case "categories":
        return <CategoryList />;
      case "users":
        return <UserList />;
      case "players":
      default:
        return <PlayerList />;
    }
  };

  return (
    <div
      className="page-container"
      style={{
        textAlign: "center",
        overflow: "auto",
        overflowY: "auto",
      }}
    >
      <Box style={{ display: "flex", justifyContent: "flex-end", gap: "5px" }}>
        <Button variant="contained" onClick={() => setCurrentView("players")}>
          Jugadores
        </Button>
        <Button
          variant="contained"
          onClick={() => setCurrentView("categories")}
        >
          Categorías
        </Button>
        <Button variant="contained" onClick={() => setCurrentView("users")}>
          Usuarios
        </Button>
      </Box>

      {renderCurrentView()}
    </div>
  );
};

export default Dashboard;
