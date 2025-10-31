import { API_ENDPOINTS } from "../../../config/api";
import { BarChart } from "@tremor/react";
import { useEffect, useState } from "react";
import axios from "axios";

// const chartdata = [
//   {
//     name: 'Cuotas del club del mes actual',
//     'Abejas': 890,
//     'Grillos': 338,
//     'Chatas': 538,
//     'Churrinches': 396,
//     'Gorriones': 138,
//     'Semillas': 436,
//     'Cebollas': 380,
//     'Babys': 535,
//     'Sub 9': 352,
//     'Sub 11': 718,
//     'Sub 13': 539,
//   },
//   {
//     name: 'Fondo de campeonato anual',
//     'Abejas': 289,
//     'Grillos': 233,
//     'Chatas': 253,
//     'Churrinches': 333,
//     'Gorriones': 133,
//     'Semillas': 533,
//     'Cebollas': 28,
//     'Babys': 33,
//     'Sub 9': 61,
//     'Sub 11': 53,
//     'Sub 13': 39,
//   },
// ];

// const dataFormatter = (number: number) =>
//   Intl.NumberFormat('us').format(number).toString();

const valueFormatter = function (number) {
  return "$ " + new Intl.NumberFormat("us").format(number).toString();
};

const percentFormatter = function (number) {
  return number.toFixed(0) + "%";
};

export function BarChartCuotasYfcXcategoria() {
  const [categories, setCategories] = useState([]);
  const [chartdata, setChartdata] = useState([]);
  const [cantidadJugadores, setCantidadJugadores] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedValue, setSelectedValue] = useState(null);

  const colors = [
    "indigo",
    "cyan",
    "amber",
    "rose",
    "blue",
    "fuchsia",
    "red",
    "lime",
    "violet",
    "green",
    "pink",
  ];

  const fetchCategories = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.CATEGORIES);
      setCategories(response.data.categorias);
    } catch (error) {
      console.error("Error fetching categories: ", error);
    }
  };

  const categoryNames = categories.map(
    (categoria) => categoria.nombre_categoria
  );

  // Obtener la cantidad de jugadores por categoría
  const fetchCantidadJugadores = async () => {
    try {
      setLoading(true);
      // Obtener todos los jugadores
      const response = await axios.get(API_ENDPOINTS.SQUAD_ALL);
      const jugadores = response.data.squads;
      
      // Obtener nombres de categorías e IDs
      const categoriasResponse = await axios.get(API_ENDPOINTS.CATEGORIES);
      const categorias = categoriasResponse.data.categorias;
      
      // Crear mapa de ID a nombre para categorías
      const categoriaMap = {};
      if (categorias && Array.isArray(categorias)) {
        categorias.forEach(cat => {
          categoriaMap[cat.idcategoria] = cat.nombre_categoria;
        });
      }
      
      // Contar jugadores por categoría (usando el nombre)
      const contadorPorNombre = {};
      if (jugadores && Array.isArray(jugadores)) {
        jugadores.forEach(jugador => {
          const nombreCategoria = categoriaMap[jugador.idcategoria];
          if (nombreCategoria) {
            contadorPorNombre[nombreCategoria] = (contadorPorNombre[nombreCategoria] || 0) + 1;
          }
        });
      }
      
      setCantidadJugadores(contadorPorNombre);
    } catch (error) {
      console.error("Error obteniendo cantidad de jugadores: ", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCyFCxCat = async () => {
    try {
      setLoading(true);
      // Obtener pagos de cuotas del club
      const responseCuotas = await axios.get(API_ENDPOINTS.PAYMENTS_ANUAL);
      
      // Obtener pagos de fondo de campeonato
      const responseFondo = await axios.get(API_ENDPOINTS.FC_ANUAL);
      
      // Crear objetos para los datos del gráfico
      const chartDataCuotas = { name: "Cuotas del club" };
      const chartDataFondo = { name: "Fondo de campeonato" };
      
      // Procesar cuotas del club
      if (responseCuotas.data.payments && Array.isArray(responseCuotas.data.payments)) {
        for (const payment of responseCuotas.data.payments) {
          const { categoria, total } = payment;
          if (cantidadJugadores[categoria] && cantidadJugadores[categoria] > 0) {
            // Calcular porcentaje basado en el total pagado vs jugadores
            const jugadoresCategoria = cantidadJugadores[categoria];
            const totalPagado = parseInt(total) || 0;
            const montoPorJugador = 5000; // Monto estimado por jugador
            const pagosEstimados = Math.floor(totalPagado / montoPorJugador);
            const porcentajePago = Math.min((pagosEstimados / jugadoresCategoria) * 100, 100);
            chartDataCuotas[categoria] = Math.round(porcentajePago);
          } else {
            chartDataCuotas[categoria] = 0;
          }
        }
      }
      
      // Procesar fondo de campeonato
      if (responseFondo.data.payments && Array.isArray(responseFondo.data.payments)) {
        for (const payment of responseFondo.data.payments) {
          const { categoria, total } = payment;
          if (cantidadJugadores[categoria] && cantidadJugadores[categoria] > 0) {
            // Calcular porcentaje basado en el total pagado vs jugadores
            const jugadoresCategoria = cantidadJugadores[categoria];
            const totalPagado = parseInt(total) || 0;
            const montoPorJugador = 2000; // Monto estimado por jugador para FC
            const pagosEstimados = Math.floor(totalPagado / montoPorJugador);
            const porcentajePago = Math.min((pagosEstimados / jugadoresCategoria) * 100, 100);
            chartDataFondo[categoria] = Math.round(porcentajePago);
          } else {
            chartDataFondo[categoria] = 0;
          }
        }
      }
      
      setChartdata([chartDataCuotas, chartDataFondo]);
    } catch (error) {
      console.error("Error generando datos de porcentajes:", error);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    const loadData = async () => {
      await fetchCategories();
      await fetchCantidadJugadores();
    };
    loadData();
  }, []);
  
  useEffect(() => {
    if (Object.keys(cantidadJugadores).length > 0) {
      fetchCyFCxCat();
    }
  }, [cantidadJugadores]);

  const handleValueChange = (v) => {
    setSelectedValue(v);
  };

  return (
    <>
      
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="text-center">
            <p className="text-gray-300">Cargando datos de porcentajes...</p>
          </div>
        </div>
      ) : (
        <BarChart
          className="mt-6 h-80"
          data={chartdata}
          index="name"
          categories={categoryNames}
          colors={colors.slice(0, categoryNames.length)}
          valueFormatter={percentFormatter}
          yAxisWidth={60}
          stack={false}
          onValueChange={handleValueChange}
          showLegend={true}
          showAnimation={true}
          showTooltip={true}
          showGridLines={true}
        />
      )}

      {/* Información adicional cuando se selecciona una categoría */}
      {selectedValue && selectedValue.categoryName && (
        <div className="mt-2 p-2 rounded-lg bg-gray-800 text-white text-sm">
          <div className="font-semibold mb-1">{selectedValue.categoryName}</div>
          {cantidadJugadores[selectedValue.categoryName] && (
            <div className="flex flex-col">
              <div>Total: {cantidadJugadores[selectedValue.categoryName]} jugadores</div>
              <div>Pagaron cuotas: {chartdata[0][selectedValue.categoryName]}%</div>
              <div>Pagaron fondo: {chartdata[1][selectedValue.categoryName]}%</div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
