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
import { Card } from "@tremor/react";

export function BarChartFC() {
  const [chartdata, setChartdata] = useState([]);
  const [totalCuota1, setTotalCuota1] = useState(0);
  const [totalCuota2, setTotalCuota2] = useState(0);
  const [contadorCuota1, setContadorCuota1] = useState(0);
  const [contadorCuota2, setContadorCuota2] = useState(0);
  const [isAnimating1, setIsAnimating1] = useState(false);
  const [isAnimating2, setIsAnimating2] = useState(false);

  useEffect(() => {
    fetchFC();
  }, []);

  // Animación contador cuota 1
  useEffect(() => {
    if (isAnimating1 && contadorCuota1 < totalCuota1) {
      const timer = setTimeout(() => {
        const incremento = Math.ceil((totalCuota1 - contadorCuota1) / 10);
        setContadorCuota1(Math.min(contadorCuota1 + incremento, totalCuota1));
      }, 30);
      return () => clearTimeout(timer);
    } else if (contadorCuota1 >= totalCuota1) {
      setIsAnimating1(false);
    }
  }, [contadorCuota1, totalCuota1, isAnimating1]);

  // Animación contador cuota 2
  useEffect(() => {
    if (isAnimating2 && contadorCuota2 < totalCuota2) {
      const timer = setTimeout(() => {
        const incremento = Math.ceil((totalCuota2 - contadorCuota2) / 10);
        setContadorCuota2(Math.min(contadorCuota2 + incremento, totalCuota2));
      }, 30);
      return () => clearTimeout(timer);
    } else if (contadorCuota2 >= totalCuota2) {
      setIsAnimating2(false);
    }
  }, [contadorCuota2, totalCuota2, isAnimating2]);

  const fetchFC = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.FC_X_CUOTAS);
      const payments = response.data.payments;

      if (!payments || payments.length === 0) {
        return;
      }

      // Transformar datos para el gráfico
      const chartArray = payments.map((item) => ({
        categoria: item.categoria,
        "Cuota 1": parseInt(item["Total Cuota 1"]) || 0,
        "Cuota 2": parseInt(item["Total Cuota 2"]) || 0,
      }));

      setChartdata(chartArray);

      // Calcular totales
      const total1 = payments.reduce((acc, p) => acc + (parseInt(p["Total Cuota 1"]) || 0), 0);
      const total2 = payments.reduce((acc, p) => acc + (parseInt(p["Total Cuota 2"]) || 0), 0);

      setTotalCuota1(total1);
      setTotalCuota2(total2);
      setContadorCuota1(0);
      setContadorCuota2(0);
      setIsAnimating1(true);
      setIsAnimating2(true);
    } catch (error) {
      console.error("Error fetching FC:", error);
    }
  };

  const valueFormatter = (value) =>
    `$ ${new Intl.NumberFormat("es-UY").format(value)}`;

  return (
    <>
      {/* Contadores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Contador Cuota 1 */}
        <Card
          className="p-4"
          style={{
            backgroundColor: "#F8FAFC",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <div className="flex flex-col">
            <div className="text-sm font-medium text-gray-600 mb-2">
              Total Cuota 1/2
            </div>
            <div className="text-3xl font-bold text-gray-700 mb-2">
              $ {contadorCuota1.toLocaleString("es-UY")}
            </div>
            <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gray-700 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: totalCuota1 + totalCuota2
                    ? `${Math.min(
                        (contadorCuota1 / (totalCuota1 + totalCuota2)) * 100,
                        100
                      )}%`
                    : "0%",
                }}
              ></div>
            </div>
          </div>
        </Card>

        {/* Contador Cuota 2 */}
        <Card
          className="p-4"
          style={{
            backgroundColor: "#F8FAFC",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <div className="flex flex-col">
            <div className="text-sm font-medium text-gray-600 mb-2">
              Total Cuota 2/2
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              $ {contadorCuota2.toLocaleString("es-UY")}
            </div>
            <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
                style={{
                  width: totalCuota1 + totalCuota2
                    ? `${Math.min(
                        (contadorCuota2 / (totalCuota1 + totalCuota2)) * 100,
                        100
                      )}%`
                    : "0%",
                }}
              ></div>
            </div>
          </div>
        </Card>
      </div>

      {/* Gráfico */}
      <div style={{ width: "100%", height: "400px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartdata}
            margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="categoria"
              angle={-45}
              textAnchor="end"
              height={100}
              stroke="#666"
              style={{ fontSize: "11px" }}
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
            <Legend wrapperStyle={{ paddingTop: "10px" }} />
            <Bar dataKey="Cuota 1" fill="#374151" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Cuota 2" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
