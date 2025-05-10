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
      const response = await axios.get("http://localhost:3001/categories");
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
      const response = await axios.get("http://localhost:3001/squad");
      const jugadores = response.data.squads;
      
      // Obtener nombres de categorías e IDs
      const categoriasResponse = await axios.get("http://localhost:3001/categories");
      const categorias = categoriasResponse.data.categorias;
      
      // Crear mapa de ID a nombre para categorías
      const categoriaMap = {};
      categorias.forEach(cat => {
        categoriaMap[cat.idcategoria] = cat.nombre_categoria;
      });
      
      // Contar jugadores por categoría (usando el nombre)
      const contadorPorNombre = {};
      jugadores.forEach(jugador => {
        const nombreCategoria = categoriaMap[jugador.idcategoria];
        if (nombreCategoria) {
          contadorPorNombre[nombreCategoria] = (contadorPorNombre[nombreCategoria] || 0) + 1;
        }
      });
      
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
      const responseCuotas = await axios.get("http://localhost:3001/paymentsAnual");
      
      // Obtener pagos de fondo de campeonato
      const responseFondo = await axios.get("http://localhost:3001/fcAnual");
      
      // Crear objetos para los datos del gráfico
      const chartDataCuotas = { name: "Cuotas del club" };
      const chartDataFondo = { name: "Fondo de campeonato" };
      
      // Procesar cuotas del club
      for (const payment of responseCuotas.data.payments) {
        const { categoria, total } = payment;
        if (cantidadJugadores[categoria] && cantidadJugadores[categoria] > 0) {
          // Estimamos que haya un pago por jugador
          const jugadoresCategoria = cantidadJugadores[categoria];
          const totalPagado = parseInt(total);
          
          // Obtener cuántos pagos se han realizado
          const estimacionPagosRealizados = await obtenerCantidadPagosCuotas(categoria);
          
          // Calcular porcentaje de jugadores que pagaron
          const porcentajePago = (estimacionPagosRealizados / jugadoresCategoria) * 100;
          chartDataCuotas[categoria] = Math.min(Math.round(porcentajePago), 100);
        } else {
          chartDataCuotas[categoria] = 0;
        }
      }
      
      // Procesar fondo de campeonato
      for (const payment of responseFondo.data.payments) {
        const { categoria, total } = payment;
        if (cantidadJugadores[categoria] && cantidadJugadores[categoria] > 0) {
          // Estimamos que haya un pago por jugador
          const jugadoresCategoria = cantidadJugadores[categoria];
          const totalPagado = parseInt(total);
          
          // Obtener cuántos pagos se han realizado
          const estimacionPagosRealizados = await obtenerCantidadPagosFC(categoria);
          
          // Calcular porcentaje de jugadores que pagaron
          const porcentajePago = (estimacionPagosRealizados / jugadoresCategoria) * 100;
          chartDataFondo[categoria] = Math.min(Math.round(porcentajePago), 100);
        } else {
          chartDataFondo[categoria] = 0;
        }
      }
      
      setChartdata([chartDataCuotas, chartDataFondo]);
    } catch (error) {
      console.error("Error generando datos de porcentajes:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Función auxiliar: estimar cantidad de pagos de cuotas por categoría
  const obtenerCantidadPagosCuotas = async (nombreCategoria) => {
    try {
      // Obtener ID de categoría
      const categoriaResponse = await axios.get("http://localhost:3001/categories");
      const categorias = categoriaResponse.data.categorias;
      const categoriaInfo = categorias.find(cat => cat.nombre_categoria === nombreCategoria);
      
      if (!categoriaInfo) return 0;
      
      // Obtener jugadores de esa categoría
      const jugadoresResponse = await axios.get("http://localhost:3001/squad");
      const jugadores = jugadoresResponse.data.squads.filter(
        j => j.idcategoria === categoriaInfo.idcategoria
      );
      
      // Obtener todos los pagos
      const pagosResponse = await axios.get("http://localhost:3001/payments");
      const pagos = pagosResponse.data.payments;
      
      // Año actual
      const anioActual = new Date().getFullYear();
      
      // Contar jugadores únicos que han pagado al menos una cuota en el año actual
      const jugadoresConPago = new Set();
      
      jugadores.forEach(jugador => {
        // Filtrar pagos por jugador y año
        const pagoJugador = pagos.find(pago => 
          pago.idjugador === jugador.idjugador && 
          pago.anio === anioActual
        );
        
        if (pagoJugador) {
          jugadoresConPago.add(jugador.idjugador);
        }
      });
      
      return jugadoresConPago.size;
    } catch (error) {
      console.error("Error estimando pagos de cuotas:", error);
      return 0;
    }
  };
  
  // Función auxiliar: estimar cantidad de pagos de FC por categoría
  const obtenerCantidadPagosFC = async (nombreCategoria) => {
    try {
      // Obtener ID de categoría
      const categoriaResponse = await axios.get("http://localhost:3001/categories");
      const categorias = categoriaResponse.data.categorias;
      const categoriaInfo = categorias.find(cat => cat.nombre_categoria === nombreCategoria);
      
      if (!categoriaInfo) return 0;
      
      // Obtener jugadores de esa categoría
      const jugadoresResponse = await axios.get("http://localhost:3001/squad");
      const jugadores = jugadoresResponse.data.squads.filter(
        j => j.idcategoria === categoriaInfo.idcategoria
      );
      
      // Obtener todos los pagos de FC
      const fcResponse = await axios.get("http://localhost:3001/fc");
      const pagosFC = fcResponse.data.payments;
      
      // Año actual
      const anioActual = new Date().getFullYear();
      
      // Contar jugadores únicos que han pagado al menos una cuota de FC en el año actual
      const jugadoresConPagoFC = new Set();
      
      jugadores.forEach(jugador => {
        // Filtrar pagos por jugador y año
        const pagoJugador = pagosFC.find(pago => 
          pago.idjugador === jugador.idjugador && 
          pago.anio === anioActual
        );
        
        if (pagoJugador) {
          jugadoresConPagoFC.add(jugador.idjugador);
        }
      });
      
      return jugadoresConPagoFC.size;
    } catch (error) {
      console.error("Error estimando pagos de FC:", error);
      return 0;
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
