import { AreaChartCuotas } from "../../layout/reports/Cuotas";
import { BarChartFC } from "../../layout/reports/FC";
import { BarListCantxCategoria } from "../../layout/reports/CantidadesXcat";
import { BarChartCuotasYfcXcategoria } from "../../layout/reports/CyFCxCat";
import { Card } from "@tremor/react";
import { Paper } from "@mui/material";

const Reports = () => {
  return (
    <div
      className="page-container"
      style={{
        textAlign: "center",
        overflow: "hidden",
        paddingBottom: "80px"
      }}
    >
      <Paper
        elevation={3}
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          padding: "15px",
          maxWidth: "95%",
          width: "1300px",
          margin: "0 auto",
          marginTop: "-30px",
          color: "white"
        }}
      >
        <h1 style={{ 
          fontSize: "1.7rem", 
          margin: "5px 0 5px 0",
          color: "white",
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)"
        }}>
          ESTADÍSTICAS Y REPORTES
        </h1>
        
        <p style={{ 
          color: "rgba(255, 255, 255, 0.8)", 
          fontSize: "0.9rem",
          maxWidth: "800px",
          margin: "0 auto 15px auto"
        }}>
          Panel de visualización de datos del club con información financiera y estadística actualizada
        </p>
        
        <div className="grid grid-cols-1 gap-4 max-w-5xl mx-auto px-4" style={{ 
          overflow: "auto", 
          maxHeight: "600px", 
          paddingBottom: "10px",
          maskImage: "linear-gradient(to bottom, black 90%, transparent 100%)"
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
  );
};

export default Reports;
