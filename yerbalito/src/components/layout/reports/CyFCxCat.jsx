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
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORES_CATEGORIAS = [
  "#4F46E5", // indigo
  "#06B6D4", // cyan
  "#F59E0B", // amber
  "#EF4444", // red
  "#3B82F6", // blue
  "#EC4899", // pink
  "#10B981", // green
  "#8B5CF6", // purple
  "#14B8A6", // teal
  "#F97316", // orange
  "#6366F1", // indigo-500
];

const percentFormatter = (number) => `${number.toFixed(0)}%`;

export function BarChartCuotasYfcXcategoria() {
  const [chartdata, setChartdata] = useState([]);
  const [categoryNames, setCategoryNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Obtener todas las categorías activas
      const categoriasResponse = await axios.get(API_ENDPOINTS.CATEGORIES_ALL);
      const categorias = categoriasResponse.data.categorias || [];
      const categoriasActivas = categorias.filter((cat) => cat.visible === 1);

      // Obtener todos los jugadores
      const jugadoresResponse = await axios.get(API_ENDPOINTS.SQUAD_ALL);
      const jugadores = jugadoresResponse.data.squads || [];

      // Obtener jugadores únicos que pagaron cuotas del club en el año actual
      const cuotasResponse = await axios.get(API_ENDPOINTS.CUOTAS_ANUALES_X_CAT);
      const cuotasAnuales = cuotasResponse.data.payments || [];

      // Obtener jugadores únicos que pagaron fondo de campeonato en el año actual
      const fcResponse = await axios.get(API_ENDPOINTS.FC_ANUALES_X_CAT);
      const fc = fcResponse.data.payments || [];

      // Construir datos del gráfico: 2 filas (Cuotas del club, Fondo de campeonato)
      const cuotasRow = { name: "Cuotas del club" };
      const fcRow = { name: "Fondo de campeonato" };

      const nombresCateg = [];

      categoriasActivas.forEach((cat) => {
        const nombre = cat.nombre_categoria;
        nombresCateg.push(nombre);

        // Contar jugadores totales en esta categoría
        const totalJugadores = jugadores.filter(
          (j) => j.idcategoria === cat.idcategoria
        ).length;

        if (totalJugadores === 0) {
          cuotasRow[nombre] = 0;
          fcRow[nombre] = 0;
          return;
        }

        // Obtener cuántos jugadores únicos pagaron cuotas del club en el año actual
        const pagoCuotasCategoria = cuotasAnuales.find((c) => c.categoria === nombre);
        const jugadoresPagaronCuotas = pagoCuotasCategoria 
          ? parseInt(pagoCuotasCategoria.jugadores_pagaron) || 0
          : 0;

        const porcentajeCuotas = totalJugadores > 0
          ? (jugadoresPagaronCuotas / totalJugadores) * 100
          : 0;

        // Contar cuántos jugadores únicos pagaron fondo de campeonato en el año actual
        const pagoFCCategoria = fc.find((f) => f.categoria === nombre);
        const jugadoresPagaronFC = pagoFCCategoria 
          ? parseInt(pagoFCCategoria.jugadores_pagaron) || 0
          : 0;

        const porcentajeFC = totalJugadores > 0
          ? (jugadoresPagaronFC / totalJugadores) * 100
          : 0;

        // Asegurar que los valores sean números (no NaN o undefined)
        cuotasRow[nombre] = isNaN(porcentajeCuotas) ? 0 : Math.min(Math.max(porcentajeCuotas, 0), 100);
        fcRow[nombre] = isNaN(porcentajeFC) ? 0 : Math.min(Math.max(porcentajeFC, 0), 100);
      });

      // Filtrar solo categorías que tienen jugadores (para evitar mostrar categorías vacías)
      const categoriasConDatos = nombresCateg.filter(nombre => {
        const totalJugadores = jugadores.filter(
          (j) => j.idcategoria === categoriasActivas.find(c => c.nombre_categoria === nombre)?.idcategoria
        ).length;
        return totalJugadores > 0;
      });

      setCategoryNames(categoriasConDatos);
      
      // Crear datos finales solo con categorías que tienen jugadores
      const cuotasRowFinal = { name: "Cuotas del club" };
      const fcRowFinal = { name: "Fondo de campeonato" };
      categoriasConDatos.forEach(nombre => {
        cuotasRowFinal[nombre] = cuotasRow[nombre] || 0;
        fcRowFinal[nombre] = fcRow[nombre] || 0;
      });
      
      setChartdata([cuotasRowFinal, fcRowFinal]);
      
      // Debug: Verificar qué datos se están enviando
      console.log("CyFCxCat - Datos del gráfico (ANUALES):", {
        categoryNames: categoriasConDatos,
        chartdata: [cuotasRowFinal, fcRowFinal],
        cuotasAnuales: cuotasAnuales,
        fcAnual: fc,
        jugadoresTotal: jugadores.length,
        categoriasActivas: categoriasActivas.length
      });
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleBarClick = (data, index) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const categoryName = data.activePayload[0].name;
      const categoryValue = data.activePayload[0].value;
      const rowName = data.activeLabel;

      setSelectedCategory({
        categoryName,
        value: categoryValue,
        type: rowName,
      });
    }
  };

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <p className="text-gray-600">Cargando datos de porcentajes...</p>
          </div>
        </div>
      ) : (
        <div style={{ width: "100%", height: "400px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartdata}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              onClick={handleBarClick}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="name"
                stroke="#666"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="#666"
                style={{ fontSize: "12px" }}
                tickFormatter={percentFormatter}
                domain={[0, 100]}
              />
              <Tooltip
                formatter={(value, name) => {
                  const val = typeof value === 'number' ? value : parseFloat(value) || 0;
                  return [`${val.toFixed(1)}%`, name];
                }}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: "10px" }}
                iconType="rect"
              />
              {categoryNames.length > 0 && categoryNames.map((categoria, index) => (
                <Bar
                  key={categoria}
                  dataKey={categoria}
                  fill={COLORES_CATEGORIAS[index % COLORES_CATEGORIAS.length]}
                  radius={[4, 4, 0, 0]}
                  minPointSize={1}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Información adicional cuando se selecciona una categoría */}
      {selectedCategory && (
        <div className="mt-4 p-3 rounded-lg bg-slate-100 border border-slate-300 text-gray-800 text-sm shadow-sm">
          <div className="font-semibold mb-2 text-gray-900">
            {selectedCategory.categoryName}
          </div>
          <div className="space-y-1">
            <div className="text-gray-600">
              <span className="font-medium">Tipo:</span> {selectedCategory.type}
            </div>
            <div className="text-gray-600">
              <span className="font-medium">Porcentaje que pagó:</span>{" "}
              {selectedCategory.value.toFixed(1)}%
            </div>
          </div>
        </div>
      )}
    </>
  );
}
