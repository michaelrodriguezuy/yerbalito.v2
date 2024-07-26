import { LineChart } from "@tremor/react";
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

      // Transformar los datos para el formato esperado por el gráfico
      const chartDataFormatted = {};

      payments.forEach((payment) => {
        const { categoria, mes, total } = payment;
        if (!chartDataFormatted[mes]) {
          chartDataFormatted[mes] = {};
        }
        chartDataFormatted[mes][categoria] = parseInt(total);
      });

      // Crear un arreglo ordenado para el gráfico
      const chartDataArray = Object.keys(chartDataFormatted).map((mes) => {
        const dataObj = { date: mes };
        categories.forEach((categoria) => {
          const categoryName = categoria;
          dataObj[categoryName] = chartDataFormatted[mes][categoryName] || 0;
        });
        return dataObj;
      });

      setChartdata(chartDataArray);
    } catch (error) {
      console.error("Error fetching cuotas x cat: ", error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchCuotasXCat();
  }, []);

  const categoryNames = categories.map(
    (categoria) => categoria.nombre_categoria
  );

  const valueFormatter = function (number) {
    return "$ " + new Intl.NumberFormat("us").format(number).toString();
  };

  return (
    <>
      <LineChart
        className="h-80"
        data={chartdata}
        index="date"
        yAxisWidth={70}
        categories={categoryNames}
        colors={colors.slice(0, categoryNames.length)}
        valueFormatter={valueFormatter}
        xAxisLabel="Cuotas del club"
        onValueChange={(v) => console.log(v)}
      />
    </>
  );
}
