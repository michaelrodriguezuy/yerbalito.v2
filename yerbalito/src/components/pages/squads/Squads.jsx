import PlayersCard from "../../layout/player/PlayersCards";
import { Paper, Box, Typography } from "@mui/material";

const Squads = () => {
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
            Planteles
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
            Conoce a todos nuestros jugadores organizados por categorías
          </Typography>
        </Box>
        
        <div 
          className="content-paper slide-up"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            padding: "40px",
            maxWidth: "95%",
            margin: "0 auto",
            color: "white",
            borderRadius: "20px",
            backdropFilter: "blur(10px)"
          }}
        >
          <PlayersCard />
        </div>
      </div>
    </div>
  );
};

export default Squads;
