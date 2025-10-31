import { AreaChartCuotas } from "../../layout/reports/Cuotas";
import { BarChartFC } from "../../layout/reports/FC";
import { BarListCantxCategoria } from "../../layout/reports/CantidadesXcat";
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
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            padding: "40px",
            maxWidth: "95%",
            margin: "0 auto",
            color: "white",
            borderRadius: "20px",
            backdropFilter: "blur(10px)"
          }}
        >
        
        <div className="grid grid-cols-1 gap-4 max-w-5xl mx-auto px-4" style={{ 
          paddingBottom: "10px"
        }}>
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300" decoration="top" decorationColor="blue">
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-3 text-white-800 border-b pb-1">Cuotas del club por mes, por categoría</h2>
              <AreaChartCuotas />
            </div>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300" decoration="top" decorationColor="green">
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-3 text-white-800 border-b pb-1">Fondo de campeonato</h2>
              <BarChartFC />
            </div>
          </Card>
          
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300" decoration="top" decorationColor="orange">
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-3 text-white-800 border-b pb-1">Cantidad de jugador@s por categoría</h2>
              <BarListCantxCategoria />
            </div>
          </Card>
          
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300" decoration="top" decorationColor="purple">
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-3 text-white-800 border-b pb-1">Cuotas y Fondo de campeonato porcentual, por categoría</h2>
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
