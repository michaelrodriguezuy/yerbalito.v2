import { API_ENDPOINTS } from "../../../config/api";
import { BarChart, Card } from "@tremor/react";
import { useEffect, useState } from "react";
import axios from "axios";

// const chartdata = [
//   {
//     name: "2018",
//     Cuota1: 17,
//     Cuota2: 5,
//   },

//   {
//     name: "2017",
//     Cuota1: 12,
//     Cuota2: 11,
//   },

//   {
//     name: "2016",
//     Cuota1: 8,
//     Cuota2: 3,
//   },

//   {
//     date: "2015",
//     Cuota1: 13,
//     Cuota2: 10,
//   },

//   {
//     date: "2014",
//     Cuota1: 8,
//     Cuota2: 3,
//   },

//   {
//     date: "2013",
//     Cuota1: 16,
//     Cuota2: 12,
//   },

//   {
//     date: 'Dec 23',
//     Cuota1: 20,
//     Cuota2: 13,
//   },

//   {
//     date: 'Dec 23',
//     Cuota1: 8,
//     Cuota2: 2,
//   },

//   {
//     date: "Sub 9",
//     Cuota1: 10,
//     Cuota2: 8,
//   },

//   {
//     date: "Sub 11",
//     Cuota1: 19,
//     Cuota2: 12,
//   },

//   {
//     name: "Sub 13",
//     Cuota1: 24,
//     Cuota2: 9,
//   },
// ];

export function BarChartFC() {
  const [value, setValue] = useState(null);
  const [chartdata, setChartdata] = useState([]);
  // Estados para los contadores animados
  const [totalCuota1, setTotalCuota1] = useState(0);
  const [totalCuota2, setTotalCuota2] = useState(0);
  const [contadorCuota1, setContadorCuota1] = useState(0);
  const [contadorCuota2, setContadorCuota2] = useState(0);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todos");
  const [isAnimatingCuota1, setIsAnimatingCuota1] = useState(false);
  const [isAnimatingCuota2, setIsAnimatingCuota2] = useState(false);

  // const fetchCategories = async () => {
  //   try {
  //     const response = await axios.get("API_ENDPOINTS.CATEGORIES");
  //     const formattedCategories = response.data.categorias.map((categoria) => {
  //       const match = categoria.nombre_categoria.match(/\((\d{4})\)$/);
  //       return match ? match[1] : categoria.nombre_categoria;
  //     });
  //     setCategories(formattedCategories);
  //   } catch (error) {
  //     console.error("Error fetching categories: ", error);
  //   }
  // };

  // const categoryNames = categories

  const fetchPaymentsByQuota = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.FC_X_CUOTAS);
      const chartDataArray = response.data.payments.map((payment) => {
        const {
          categoria,
          "Total Cuota 1": Cuota1,
          "Total Cuota 2": Cuota2,
        } = payment;

        const match = categoria.match(/^(.*?)\s?\((\d{4}(?:-\d{4})*)\)?$/);
        let categoryText = categoria;

        if (match) {
          const [, text, years] = match;
          if (years) {
            if (years.includes("-")) {
              categoryText = text.trim();
            } else {
              categoryText = years;
            }
          } else {
            categoryText = text.trim();
          }
        }

        return {
          date: categoryText,
          Cuota1: parseInt(Cuota1, 10),
          Cuota2: parseInt(Cuota2, 10),
        };
      });

      // console.log("chartDataArray: ", chartDataArray);

      setChartdata(chartDataArray);
      
      // Calcular totales de ambas cuotas
      let sumaCuota1 = 0;
      let sumaCuota2 = 0;
      
      chartDataArray.forEach(item => {
        sumaCuota1 += item.Cuota1 || 0;
        sumaCuota2 += item.Cuota2 || 0;
      });
      
      setTotalCuota1(sumaCuota1);
      setTotalCuota2(sumaCuota2);
      
      // Resetear contadores para animación
      setContadorCuota1(0);
      setContadorCuota2(0);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    // fetchCategories();
    fetchPaymentsByQuota();
  }, []);
  
  // Efecto para animar el contador de cuota 1
  useEffect(() => {
    if (totalCuota1 > 0 && contadorCuota1 < totalCuota1) {
      setIsAnimatingCuota1(true);
      const intervalo = Math.max(5, Math.floor(1000 / totalCuota1));
      
      const timer = setTimeout(() => {
        setContadorCuota1(prev => 
          prev < totalCuota1 ? prev + Math.max(1, Math.floor(totalCuota1 / 50)) : totalCuota1
        );
      }, intervalo);
      
      return () => clearTimeout(timer);
    } else if (contadorCuota1 >= totalCuota1 && totalCuota1 > 0) {
      setContadorCuota1(totalCuota1);
      setIsAnimatingCuota1(false);
    }
  }, [contadorCuota1, totalCuota1]);
  
  // Efecto para animar el contador de cuota 2
  useEffect(() => {
    if (totalCuota2 > 0 && contadorCuota2 < totalCuota2) {
      setIsAnimatingCuota2(true);
      const intervalo = Math.max(5, Math.floor(1000 / totalCuota2));
      
      const timer = setTimeout(() => {
        setContadorCuota2(prev => 
          prev < totalCuota2 ? prev + Math.max(1, Math.floor(totalCuota2 / 50)) : totalCuota2
        );
      }, intervalo);
      
      return () => clearTimeout(timer);
    } else if (contadorCuota2 >= totalCuota2 && totalCuota2 > 0) {
      setContadorCuota2(totalCuota2);
      setIsAnimatingCuota2(false);
    }
  }, [contadorCuota2, totalCuota2]);

  const valueFormatter = function (number) {
    return "$ " + new Intl.NumberFormat("us").format(number).toString();
  };
  
  // Manejar cuando se selecciona una barra en el gráfico
  const handleValueChange = (v) => {
    setValue(v);
    
    if (v) {
      setCategoriaSeleccionada(v.date);
      setContadorCuota1(0);
      setContadorCuota2(0);
      
      setTotalCuota1(v.Cuota1 || 0);
      setTotalCuota2(v.Cuota2 || 0);
    } else {
      // Si se deselecciona, volver a mostrar los totales
      let sumaCuota1 = 0;
      let sumaCuota2 = 0;
      
      chartdata.forEach(item => {
        sumaCuota1 += item.Cuota1 || 0;
        sumaCuota2 += item.Cuota2 || 0;
      });
      
      setCategoriaSeleccionada("Todos");
      setContadorCuota1(0);
      setContadorCuota2(0);
      
      setTotalCuota1(sumaCuota1);
      setTotalCuota2(sumaCuota2);
    }
  };

  return (
    <>
      {/* Contadores animados */}
      <div className="grid grid-cols-2 gap-4 mb-4 mt-2">
        <Card className="p-4 shadow-sm">
          <div className="flex flex-col items-center justify-center">
            <div className="text-center mb-2">
              <span className="text-gray-500 text-sm">Cuota 1 ({categoriaSeleccionada})</span>
            </div>
            <div 
              className={`text-2xl font-bold ${isAnimatingCuota1 ? 'text-gray-600' : 'text-gray-700'}`}
              style={{ 
                transition: 'color 0.5s, transform 0.3s',
                transform: isAnimatingCuota1 ? 'scale(1.1)' : 'scale(1)'
              }}
            >
              {valueFormatter(contadorCuota1)}
            </div>
            <div 
              className="w-full h-1 bg-gray-200 mt-2 rounded overflow-hidden"
              style={{ maxWidth: '100px' }}
            >
              <div 
                className="h-full bg-gray-600 rounded" 
                style={{ 
                  width: `${totalCuota1 > 0 ? (contadorCuota1 / totalCuota1) * 100 : 0}%`,
                  transition: 'width 0.3s ease-out'
                }}
              ></div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 shadow-sm">
          <div className="flex flex-col items-center justify-center">
            <div className="text-center mb-2">
              <span className="text-gray-500 text-sm">Cuota 2 ({categoriaSeleccionada})</span>
            </div>
            <div 
              className={`text-2xl font-bold ${isAnimatingCuota2 ? 'text-blue-500' : 'text-gray-700'}`}
              style={{ 
                transition: 'color 0.5s, transform 0.3s',
                transform: isAnimatingCuota2 ? 'scale(1.1)' : 'scale(1)'
              }}
            >
              {valueFormatter(contadorCuota2)}
            </div>
            <div 
              className="w-full h-1 bg-gray-200 mt-2 rounded overflow-hidden"
              style={{ maxWidth: '100px' }}
            >
              <div 
                className="h-full bg-blue-500 rounded" 
                style={{ 
                  width: `${totalCuota2 > 0 ? (contadorCuota2 / totalCuota2) * 100 : 0}%`,
                  transition: 'width 0.3s ease-out'
                }}
              ></div>
            </div>
          </div>
        </Card>
      </div>
      
      <BarChart
        className="mt-6"
        data={chartdata}
        index="date"
        categories={["Cuota1", "Cuota2"]}
        colors={["gray", "blue"]}
        yAxisWidth={70}
        valueFormatter={valueFormatter}
        onValueChange={handleValueChange}
      />
      {/* {value && (
        <pre className="mt-8 bg-gray-800 text-white p-4 rounded">
          {JSON.stringify(value, null, 2)}
        </pre>
      )} */}
    </>
  );
}
