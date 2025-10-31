import PlayerList from "./PlayerList";
import CategoryList from "./CategoryList";
import UserList from "./UserList";
import ValoresManager from "./ValoresManager";
import FixtureManager from "./FixtureManager";
import { Box, Button, Typography, Paper } from "@mui/material";
import { useState } from "react";

const Dashboard = () => {
  const [currentView, setCurrentView] = useState("players");

  const renderCurrentView = () => {
    switch (currentView) {
      case "categories":
        return <CategoryList />;
      case "users":
        return <UserList />;
      case "valores":
        return <ValoresManager />;
      case "fixture":
        return <FixtureManager />;
      case "players":
      default:
        return <PlayerList />;
    }
  };

  return (
    <div className="page-container-scroll">
      <div className="content-container">
        {/* Header inspirado en alexandergarcia.me */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h1"
            component="h1"
            sx={{ 
              fontSize: { xs: '2.5rem', md: '4rem' },
              fontWeight: 800,
              background: 'linear-gradient(45deg, #4CAF50, #ffffff)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            Dashboard
          </Typography>
          <Typography
            variant="h5"
            sx={{ 
              color: 'rgba(255,255,255,0.8)',
              fontWeight: 300,
              maxWidth: '600px',
              mx: 'auto',
              mb: 3
            }}
          >
            Panel de administración del Club Yerbalito
          </Typography>
        </Box>
        
        <Paper 
          elevation={3}
          className="content-paper slide-up"
          sx={{
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            padding: "40px",
            maxWidth: "95%",
            margin: "0 auto",
            color: "white",
            borderRadius: "20px",
            backdropFilter: "blur(10px)"
          }}
        >
              <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 4, flexWrap: "wrap" }}>
                <Button 
                  variant="contained" 
                  onClick={() => setCurrentView("players")}
                  sx={{
                    backgroundColor: currentView === "players" ? "#4CAF50" : "rgba(255,255,255,0.1)",
                    color: "white",
                    fontWeight: "bold",
                    borderRadius: "20px",
                    px: 3,
                    "&:hover": {
                      backgroundColor: currentView === "players" ? "#388E3C" : "rgba(255,255,255,0.2)"
                    }
                  }}
                >
                  Jugadores
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setCurrentView("categories")}
                  sx={{
                    backgroundColor: currentView === "categories" ? "#4CAF50" : "rgba(255,255,255,0.1)",
                    color: "white",
                    fontWeight: "bold",
                    borderRadius: "20px",
                    px: 3,
                    "&:hover": {
                      backgroundColor: currentView === "categories" ? "#388E3C" : "rgba(255,255,255,0.2)"
                    }
                  }}
                >
                  Categorías
                </Button>
                <Button 
                  variant="contained" 
                  onClick={() => setCurrentView("users")}
                  sx={{
                    backgroundColor: currentView === "users" ? "#4CAF50" : "rgba(255,255,255,0.1)",
                    color: "white",
                    fontWeight: "bold",
                    borderRadius: "20px",
                    px: 3,
                    "&:hover": {
                      backgroundColor: currentView === "users" ? "#388E3C" : "rgba(255,255,255,0.2)"
                    }
                  }}
                >
                  Usuarios
                </Button>
                <Button 
                  variant="contained" 
                  onClick={() => setCurrentView("valores")}
                  sx={{
                    backgroundColor: currentView === "valores" ? "#4CAF50" : "rgba(255,255,255,0.1)",
                    color: "white",
                    fontWeight: "bold",
                    borderRadius: "20px",
                    px: 3,
                    "&:hover": {
                      backgroundColor: currentView === "valores" ? "#388E3C" : "rgba(255,255,255,0.2)"
                    }
                  }}
                >
                  Valores
                </Button>
                <Button 
                  variant="contained" 
                  onClick={() => setCurrentView("fixture")}
                  sx={{
                    backgroundColor: currentView === "fixture" ? "#4CAF50" : "rgba(255,255,255,0.1)",
                    color: "white",
                    fontWeight: "bold",
                    borderRadius: "20px",
                    px: 3,
                    "&:hover": {
                      backgroundColor: currentView === "fixture" ? "#388E3C" : "rgba(255,255,255,0.2)"
                    }
                  }}
                >
                  Fixture
                </Button>
              </Box>

          <div className="animate-slide-up-delayed">
            {renderCurrentView()}
          </div>
        </Paper>
      </div>
    </div>
  );
};

export default Dashboard;
