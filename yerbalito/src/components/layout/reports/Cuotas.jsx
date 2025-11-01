import { API_ENDPOINTS } from "../../../config/api";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@tremor/react";

const COLORES_CATEGORIAS = [
  "#4F46E5", // indigo
  "#06B6D4", // cyan
  "#F59E0B", // amber
  "#10B981", // emerald
  "#EF4444", // red
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#F97316", // orange
  "#14B8A6", // teal
  "#6366F1", // indigo-500
  "#0EA5E9", // sky
];

const MESES_NOMBRES = {
  "Enero": 1,
  "Febrero": 2,
  "Marzo": 3,
  "Abril": 4,
  "Mayo": 5,
  "Junio": 6,
  "Julio": 7,
  "Agosto": 8,
  "Septiembre": 9,
  "Octubre": 10,
  "Noviembre": 11,
  "Diciembre": 12,
};

export function AreaChartCuotas() {
  const [chartdata, setChartdata] = useState([]);
  const [categoryNames, setCategoryNames] = useState([]);
  // Estados para los contadores animados
  const [totalMes, setTotalMes] = useState(0);
  const [totalAnio, setTotalAnio] = useState(0);
  const [contadorMes, setContadorMes] = useState(0);
  const [contadorAnio, setContadorAnio] = useState(0);
  const [isAnimatingMes, setIsAnimatingMes] = useState(false);
  const [isAnimatingAnio, setIsAnimatingAnio] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  // Animación contador mes
  useEffect(() => {
    if (isAnimatingMes && contadorMes < totalMes) {
      const timer = setTimeout(() => {
        const incremento = Math.ceil((totalMes - contadorMes) / 10);
        setContadorMes(Math.min(contadorMes + incremento, totalMes));
      }, 30);
      return () => clearTimeout(timer);
    } else if (contadorMes >= totalMes) {
      setIsAnimatingMes(false);
    }
  }, [contadorMes, totalMes, isAnimatingMes]);

  // Animación contador año
  useEffect(() => {
    if (isAnimatingAnio && contadorAnio < totalAnio) {
      const timer = setTimeout(() => {
        const incremento = Math.ceil((totalAnio - contadorAnio) / 10);
        setContadorAnio(Math.min(contadorAnio + incremento, totalAnio));
      }, 30);
      return () => clearTimeout(timer);
    } else if (contadorAnio >= totalAnio) {
      setIsAnimatingAnio(false);
    }
  }, [contadorAnio, totalAnio, isAnimatingAnio]);

  const fetchPayments = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.CUOTAS_X_CAT);
      const payments = response.data.payments;

      if (!payments || payments.length === 0) {
        return;
      }

      // Obtener nombres únicos de categorías
      const categoriesSet = new Set();
      payments.forEach((payment) => {
        if (payment.categoria) {
          categoriesSet.add(payment.categoria);
        }
      });
      const categories = Array.from(categoriesSet);
      setCategoryNames(categories);

      // Agrupar datos por mes (el endpoint devuelve "mes" como texto: "Enero", "Febrero", etc.)
      const monthlyData = {};
      payments.forEach((payment) => {
        const mesNombre = payment.mes;
        if (!mesNombre) return; // Ignorar si no tiene mes
        
        const mesNumero = MESES_NOMBRES[mesNombre];
        if (!mesNumero) return;
        
        if (!monthlyData[mesNumero]) {
          monthlyData[mesNumero] = { date: mesNombre.substring(0, 3), mes: mesNumero };
        }
        monthlyData[mesNumero][payment.categoria] = parseInt(payment.total) || 0;
      });

      // Convertir a array y ordenar por mes
      const chartArray = Object.values(monthlyData).sort(
        (a, b) => a.mes - b.mes
      );
      setChartdata(chartArray);

      // Calcular total del mes actual
      const mesActual = new Date().getMonth() + 1;
      const mesActualNombre = Object.keys(MESES_NOMBRES).find(
        (key) => MESES_NOMBRES[key] === mesActual
      );
      const totalMesActual = payments
        .filter((p) => p.mes === mesActualNombre)
        .reduce((acc, p) => acc + (parseInt(p.total) || 0), 0);
      setTotalMes(totalMesActual);
      setContadorMes(0);
      setIsAnimatingMes(true);

      // Calcular total del año
      const totalYear = payments
        .filter((p) => p.mes) // Solo los que tienen mes (excluir los null)
        .reduce((acc, p) => acc + (parseInt(p.total) || 0), 0);
      setTotalAnio(totalYear);
      setContadorAnio(0);
      setIsAnimatingAnio(true);
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };

  const valueFormatter = (value) =>
    `$ ${new Intl.NumberFormat("es-UY").format(value)}`;

  return (
    <>
      {/* Contadores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Contador Mes Actual */}
        <Card
          className="p-4"
          style={{
            backgroundColor: "#F8FAFC",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <div className="flex flex-col">
            <div className="text-sm font-medium text-gray-600 mb-2">
              Recaudado este mes
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              $ {contadorMes.toLocaleString("es-UY")}
            </div>
            <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: totalAnio
                    ? `${Math.min((contadorMes / totalAnio) * 100, 100)}%`
                    : "0%",
                }}
              ></div>
            </div>
          </div>
        </Card>

        {/* Contador Anual */}
        <Card
          className="p-4"
          style={{
            backgroundColor: "#F8FAFC",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <div className="flex flex-col">
            <div className="text-sm font-medium text-gray-600 mb-2">
              Total del año {new Date().getFullYear()}
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              $ {contadorAnio.toLocaleString("es-UY")}
            </div>
            <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-green-600 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: isAnimatingAnio ? "100%" : "0%",
                }}
              ></div>
            </div>
          </div>
        </Card>
      </div>

      {/* Gráfico */}
      <div style={{ width: "100%", height: "400px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartdata}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="date"
              stroke="#666"
              style={{ fontSize: "12px" }}
            />
            <YAxis
              stroke="#666"
              style={{ fontSize: "12px" }}
              tickFormatter={valueFormatter}
            />
            <Tooltip
              formatter={valueFormatter}
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: "10px" }}
              iconType="line"
            />
            {categoryNames.map((categoria, index) => (
              <Line
                key={categoria}
                type="monotone"
                dataKey={categoria}
                stroke={COLORES_CATEGORIAS[index % COLORES_CATEGORIAS.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
