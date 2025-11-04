import { AreaChartCuotas } from "../../layout/reports/Cuotas";
import { BarChartFC } from "../../layout/reports/Fc";
import { CantidadesXcat } from "../../layout/reports/CantidadesXcat";
import { BarChartCuotasYfcXcategoria } from "../../layout/reports/CyFCxCat";
import { Card } from "@tremor/react";
import { Paper, Box, Typography } from "@mui/material";

const Reports = () => {
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
            Reportes
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
            Panel de visualización de datos del club con información financiera y estadística actualizada
          </Typography>
        </Box>
        
        <Paper
          elevation={3}
          className="content-paper slide-up"
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            padding: "40px",
            maxWidth: "95%",
            margin: "0 auto",
            color: "white",
            borderRadius: "20px",
            backdropFilter: "blur(10px)"
          }}
        >
        
        {/* Grid de 2x2 en pantallas grandes, 1 columna en móviles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto px-4" style={{ 
          paddingBottom: "10px"
        }}>
          <Card 
            className="shadow-lg hover:shadow-xl transition-shadow duration-300" 
            decoration="top" 
            decorationColor="blue"
            style={{ 
              backgroundColor: '#FFFFFF',
              minHeight: '500px'
            }}
          >
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-3 text-gray-800 border-b border-gray-300 pb-2">Cuotas del club por mes, por categoría</h2>
              <AreaChartCuotas />
            </div>
          </Card>

          <Card 
            className="shadow-lg hover:shadow-xl transition-shadow duration-300" 
            decoration="top" 
            decorationColor="green"
            style={{ 
              backgroundColor: '#FFFFFF',
              minHeight: '500px'
            }}
          >
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-3 text-gray-800 border-b border-gray-300 pb-2">Fondo de campeonato</h2>
              <BarChartFC />
            </div>
          </Card>
          
          <Card 
            className="shadow-lg hover:shadow-xl transition-shadow duration-300" 
            decoration="top" 
            decorationColor="orange"
            style={{ 
              backgroundColor: '#FFFFFF',
              minHeight: '500px'
            }}
          >
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-3 text-gray-800 border-b border-gray-300 pb-2">Cantidad de jugador@s por categoría</h2>
              <CantidadesXcat />
            </div>
          </Card>
          
          <Card 
            className="shadow-lg hover:shadow-xl transition-shadow duration-300" 
            decoration="top" 
            decorationColor="purple"
            style={{ 
              backgroundColor: '#FFFFFF',
              minHeight: '500px'
            }}
          >
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-3 text-gray-800 border-b border-gray-300 pb-2">Cuotas y Fondo de campeonato porcentual, por categoría</h2>
              <BarChartCuotasYfcXcategoria />
            </div>
          </Card>
        </div>
        </Paper>
      </div>
    </div>
  );
};

export default Reports;
