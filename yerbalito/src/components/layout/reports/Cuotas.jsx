import { LineChart, Card } from "@tremor/react";
import { useEffect, useState } from "react";
import axios from "axios";

// const chartdata = [
//   {
//     date: "Mar",
//     Abejas: 3322,
//     Grillos: 2194,
//     Chatas: 2397,
//     Churrinches: 3346,
//     Gorriones: 1656,
//     Semillas: 3444,
//     Cebollas: 2333,
//     Babys: 2777,
//     "Sub 9": 1334,
//     "Sub 11": 2956,
//     "Sub 13": 1989,
//   },
//   {
//     date: "Apr",
//     Abejas: 3470,
//     Grillos: 2108,
//     Chatas: 1987,
//     Churrinches: 3456,
//     Gorriones: 2345,
//     Semillas: 3456,
//     Cebollas: 1421,
//     Babys: 988,
//     "Sub 9": 1124,
//     "Sub 11": 2412,
//     "Sub 13": 990,
//   },
//   {
//     date: "May",
//     Abejas: 3475,
//     Grillos: 1812,
//     Chatas: 1892,
//     Churrinches: 2345,
//     Gorriones: 1644,
//     Semillas: 1545,
//     Cebollas: 1333,
//     Babys: 986,
//     "Sub 9": 860,
//     "Sub 11": 1050,
//     "Sub 13": 1130,
//   },
//   {
//     date: "Jun",
//     Abejas: 3129,
//     Grillos: 1726,
//     Chatas: 4565,
//     Churrinches: 650,
//     Gorriones: 6232,
//     Semillas: 680,
//     Cebollas: 1460,
//     Babys: 2001,
//     "Sub 9": 2160,
//     "Sub 11": 2250,
//     "Sub 13": 2360,
//   },
//   {
//     date: "Jul",
//     Abejas: 3490,
//     Grillos: 1982,
//     Chatas: 996,
//     Churrinches: 890,
//     Gorriones: 1068,
//     Semillas: 2068,
//     Cebollas: 3068,
//     Babys: 3454,
//     "Sub 9": 3420,
//     "Sub 11": 2290,
//     "Sub 13": 2305,
//   },
//   {
//     date: "Aug",
//     Abejas: 2903,
//     Grillos: 2012,
//     Chatas: 2345,
//     Churrinches: 2345,
//     Gorriones: 2345,
//     Semillas: 2345,
//     Cebollas: 2345,
//     Babys: 2345,
//     "Sub 9": 2345,
//     "Sub 11": 2345,
//     "Sub 13": 2345,
//   },
//   {
//     date: "Sep",
//     Abejas: 2643,
//     Grillos: 2342,
//     Chatas: 2345,
//     Churrinches: 2345,
//     Gorriones: 2345,
//     Semillas: 2345,
//     Cebollas: 2345,
//     Babys: 2345,
//     "Sub 9": 2345,
//     "Sub 11": 2345,
//     "Sub 13": 2345,
//   },
//   {
//     date: "Oct",
//     Abejas: 2837,
//     Grillos: 2473,
//     Chatas: 2345,
//     Churrinches: 2345,
//     Gorriones: 2345,
//     Semillas: 2345,
//     Cebollas: 1122,
//     Babys: 2345,
//     "Sub 9": 2343,
//     "Sub 11": 2345,
//     "Sub 13": 2345,
//   },
//   {
//     date: "Nov",
//     Abejas: 2954,
//     Grillos: 3848,
//     Chatas: 2345,
//     Churrinches: 2345,
//     Gorriones: 2345,
//     Semillas: 2345,
//     Cebollas: 2345,
//     Babys: 2332,
//     "Sub 9": 1122,
//     "Sub 11": 653,
//     "Sub 13": 2345,
//   },
// ];

export function AreaChartCuotas() {
  const [categories, setCategories] = useState([]);
  const [chartdata, setChartdata] = useState([]);
  // Estados para los contadores animados
  const [totalMes, setTotalMes] = useState(0);
  const [totalAnio, setTotalAnio] = useState(0);
  const [contadorMes, setContadorMes] = useState(0);
  const [contadorAnio, setContadorAnio] = useState(0);
  const [mesSeleccionado, setMesSeleccionado] = useState("Actual");
  const [isAnimatingMes, setIsAnimatingMes] = useState(false);
  const [isAnimatingAnio, setIsAnimatingAnio] = useState(false);

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
  
  const fetchCuotasXCat = async () => {
    try {
      const response = await axios.get("http://localhost:3001/cuotasXcat");
      const payments = response.data.payments;

      // Obtener todas las categorías disponibles
      const categories = [
        ...new Set(payments.map((payment) => payment.categoria)),
      ];

      // Usar nombres de meses abreviados para mejor visualización
      const mesesDelAnio = [
        "Ene", "Feb", "Mar", "Abr", "May", "Jun",
        "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
      ];

      // Transformar los datos para el formato esperado por el gráfico
      const chartDataFormatted = {};

      // Pre-inicializar el objeto para todos los meses
      mesesDelAnio.forEach(mes => {
        chartDataFormatted[mes] = {};
      });

      // Mapeo para convertir nombres de meses completos a abreviados
      const mesMapping = {
        "Enero": "Ene",
        "Febrero": "Feb", 
        "Marzo": "Mar", 
        "Abril": "Abr", 
        "Mayo": "May", 
        "Junio": "Jun",
        "Julio": "Jul", 
        "Agosto": "Ago", 
        "Septiembre": "Sep", 
        "Octubre": "Oct", 
        "Noviembre": "Nov", 
        "Diciembre": "Dic"
      };

      payments.forEach((payment) => {
        const { categoria, mes, total } = payment;
        // Convertir el nombre del mes a su versión abreviada
        const mesAbreviado = mesMapping[mes] || mes;
        chartDataFormatted[mesAbreviado][categoria] = parseInt(total);
      });

      // Crear un arreglo ordenado para el gráfico
      const chartDataArray = mesesDelAnio.map((mes) => {
        const dataObj = { date: mes };
        categories.forEach((categoria) => {
          const categoryName = categoria;
          dataObj[categoryName] = chartDataFormatted[mes][categoryName] || 0;
        });
        return dataObj;
      });

      setChartdata(chartDataArray);
      
      // Calcular el total por año
      let totalAnual = 0;
      chartDataArray.forEach(mes => {
        categories.forEach(categoria => {
          totalAnual += mes[categoria] || 0;
        });
      });
      
      // Obtener el mes actual (para mostrar por defecto)
      const fechaActual = new Date();
      const mesActualAbreviado = mesesDelAnio[fechaActual.getMonth()];
      const mesActualData = chartDataArray.find(item => item.date === mesActualAbreviado);
      
      // Calcular total del mes actual
      let totalMesActual = 0;
      if (mesActualData) {
        categories.forEach(categoria => {
          totalMesActual += mesActualData[categoria] || 0;
        });
      }
      
      setTotalMes(totalMesActual);
      setTotalAnio(totalAnual);
      setMesSeleccionado(mesActualAbreviado);
      
      // Resetear contadores para iniciar animación
      setContadorMes(0);
      setContadorAnio(0);
    } catch (error) {
      console.error("Error fetching cuotas x cat: ", error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchCuotasXCat();
  }, []);

  // Efecto para animar el contador del mes
  useEffect(() => {
    if (totalMes > 0 && contadorMes < totalMes) {
      setIsAnimatingMes(true);
      const intervalo = Math.max(5, Math.floor(1000 / totalMes));
      
      const timer = setTimeout(() => {
        setContadorMes(prev => 
          prev < totalMes ? prev + Math.max(1, Math.floor(totalMes / 50)) : totalMes
        );
      }, intervalo);
      
      return () => clearTimeout(timer);
    } else if (contadorMes >= totalMes && totalMes > 0) {
      setContadorMes(totalMes);
      setIsAnimatingMes(false);
    }
  }, [contadorMes, totalMes]);

  // Efecto para animar el contador del año
  useEffect(() => {
    if (totalAnio > 0 && contadorAnio < totalAnio) {
      setIsAnimatingAnio(true);
      const intervalo = Math.max(5, Math.floor(1000 / totalAnio));
      
      const timer = setTimeout(() => {
        setContadorAnio(prev => 
          prev < totalAnio ? prev + Math.max(1, Math.floor(totalAnio / 50)) : totalAnio
        );
      }, intervalo);
      
      return () => clearTimeout(timer);
    } else if (contadorAnio >= totalAnio && totalAnio > 0) {
      setContadorAnio(totalAnio);
      setIsAnimatingAnio(false);
    }
  }, [contadorAnio, totalAnio]);

  const categoryNames = categories.map(
    (categoria) => categoria.nombre_categoria
  );

  const valueFormatter = function (number) {
    return "$ " + new Intl.NumberFormat("us").format(number).toString();
  };

  // Actualizar el total del mes cuando se selecciona un mes en el gráfico
  const handleValueChange = (v) => {
    if (v && v.date) {
      const mesData = chartdata.find(item => item.date === v.date);
      if (mesData) {
        let nuevoTotal = 0;
        categoryNames.forEach(categoria => {
          nuevoTotal += mesData[categoria] || 0;
        });
        setTotalMes(nuevoTotal);
        setContadorMes(0); // Resetear contador para nueva animación
        setMesSeleccionado(v.date);
      }
    }
  };

  return (
    <>
      {/* Contadores animados */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card className="p-4 shadow-sm">
          <div className="flex flex-col items-center justify-center">
            <div className="text-center mb-2">
              <span className="text-gray-500 text-sm">Total cuotas {mesSeleccionado}</span>
            </div>
            <div 
              className={`text-2xl font-bold ${isAnimatingMes ? 'text-blue-500' : 'text-gray-700'}`}
              style={{ 
                transition: 'color 0.5s, transform 0.3s',
                transform: isAnimatingMes ? 'scale(1.1)' : 'scale(1)'
              }}
            >
              {valueFormatter(contadorMes)}
            </div>
            <div 
              className="w-full h-1 bg-gray-200 mt-2 rounded overflow-hidden"
              style={{ maxWidth: '100px' }}
            >
              <div 
                className="h-full bg-blue-500 rounded" 
                style={{ 
                  width: `${totalMes > 0 ? (contadorMes / totalMes) * 100 : 0}%`,
                  transition: 'width 0.3s ease-out'
                }}
              ></div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 shadow-sm">
          <div className="flex flex-col items-center justify-center">
            <div className="text-center mb-2">
              <span className="text-gray-500 text-sm">Total año</span>
            </div>
            <div 
              className={`text-2xl font-bold ${isAnimatingAnio ? 'text-green-500' : 'text-gray-700'}`}
              style={{ 
                transition: 'color 0.5s, transform 0.3s',
                transform: isAnimatingAnio ? 'scale(1.1)' : 'scale(1)'
              }}
            >
              {valueFormatter(contadorAnio)}
            </div>
            <div 
              className="w-full h-1 bg-gray-200 mt-2 rounded overflow-hidden"
              style={{ maxWidth: '100px' }}
            >
              <div 
                className="h-full bg-green-500 rounded" 
                style={{ 
                  width: `${totalAnio > 0 ? (contadorAnio / totalAnio) * 100 : 0}%`,
                  transition: 'width 0.3s ease-out'
                }}
              ></div>
            </div>
          </div>
        </Card>
      </div>

      <LineChart
        className="h-80 w-full"
        data={chartdata}
        index="date"
        yAxisWidth={70}
        categories={categoryNames}
        colors={colors.slice(0, categoryNames.length)}
        valueFormatter={valueFormatter}
        xAxisLabel="Cuotas del club"
        showAnimation={true}
        showLegend={true}
        onValueChange={handleValueChange}
        showGridLines={true}
      />
    </>
  );
}
