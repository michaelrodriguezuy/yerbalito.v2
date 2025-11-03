import { API_ENDPOINTS } from "../../../config/api";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card } from "@tremor/react";

const COLORES = [
  "#3B82F6", // blue-500
  "#10B981", // green-500
  "#F59E0B", // amber-500
  "#EF4444", // red-500
  "#8B5CF6", // purple-500
  "#EC4899", // pink-500
  "#14B8A6", // teal-500
  "#F97316", // orange-500
  "#6366F1", // indigo-500
  "#06B6D4", // cyan-500
  "#84CC16", // lime-500
];

export function CantidadesXcat() {
  const [chartdata, setChartdata] = useState([]);
  const [totalJugadores, setTotalJugadores] = useState(0);
  const [contadorTotal, setContadorTotal] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    fetchCantidades();
  }, []);
      
  // Animación contador total
  useEffect(() => {
    if (isAnimating && contadorTotal < totalJugadores) {
      const timer = setTimeout(() => {
        const incremento = Math.ceil((totalJugadores - contadorTotal) / 10);
        setContadorTotal(Math.min(contadorTotal + incremento, totalJugadores));
      }, 30);
      return () => clearTimeout(timer);
    } else if (contadorTotal >= totalJugadores) {
      setIsAnimating(false);
    }
  }, [contadorTotal, totalJugadores, isAnimating]);

  const fetchCantidades = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.CATEGORIES_ALL);
      const categorias = response.data.categorias || []; // El endpoint devuelve "categorias" no "categories"

      if (categorias.length === 0) {
        return;
      }

      // Contar jugadores por categoría usando el endpoint de jugadores
      const jugadoresResponse = await axios.get(API_ENDPOINTS.SQUAD_ALL);
      const jugadores = jugadoresResponse.data.squads || [];

      // Filtrar solo categorías visibles
      const categoriasActivas = categorias.filter((cat) => cat.visible === 1);

      // Contar jugadores por categoría
      const chartArray = categoriasActivas.map((cat) => {
        const cantidadJugadores = jugadores.filter(
          (j) => j.idcategoria === cat.idcategoria
        ).length;
        
        return {
          name: cat.nombre_categoria,
          value: cantidadJugadores,
        };
      }).filter(item => item.value > 0); // Solo mostrar categorías con jugadores

      setChartdata(chartArray);

      // Calcular total
      const total = chartArray.reduce((acc, item) => acc + item.value, 0);
      setTotalJugadores(total);
      setContadorTotal(0);
      setIsAnimating(true);
    } catch (error) {
      console.error("Error fetching cantidades:", error);
    }
  };

  return (
    <>
      {/* Contador Total */}
      <Card
        className="p-6 mb-6"
        style={{
          backgroundColor: "#F8FAFC",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <div className="flex flex-col items-center">
          <div className="text-sm font-medium text-gray-600 mb-2">
            Total de jugador@s en el club
          </div>
          <div className="text-5xl font-bold text-blue-600">
            {contadorTotal}
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden mt-4 max-w-xs">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
              style={{
                width: isAnimating ? "100%" : "0%",
              }}
            ></div>
          </div>
        </div>
      </Card>

      {/* Gráfico de barras por categoría */}
      <Card
        className="p-4"
          style={{ 
          backgroundColor: "#F8FAFC",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
        <div className="text-sm font-medium text-gray-700 mb-4">
          Jugadores por categoría
        </div>
        <div style={{ width: "100%", height: "400px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartdata}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis type="number" stroke="#666" style={{ fontSize: "12px" }} />
              <YAxis
                dataKey="name"
                type="category"
                stroke="#666"
                style={{ fontSize: "12px" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
                formatter={(value) => [`${value} jugadores`, "Cantidad"]}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartdata.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORES[index % COLORES.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
    </Card>
    </>
  );
}
