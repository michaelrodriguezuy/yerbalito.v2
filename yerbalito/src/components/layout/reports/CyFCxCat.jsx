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

export function BarChartCuotasYfcXcategoria() {
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

  const categoryNames = categories.map(
    (categoria) => categoria.nombre_categoria
  );

  // paymentsAnual
  // fcAnual
  const fetchCyFCxCat = async () => {
    try {
      const responseCuotas = await axios.get(
        "http://localhost:3001/paymentsAnual"
      );
      const responseFondo = await axios.get("http://localhost:3001/fcAnual");

      const chartDataCuotas = { name: "Cuotas del club" };
      responseCuotas.data.payments.forEach((payment) => {
        const { categoria, total } = payment;
        chartDataCuotas[categoria] = parseInt(total);
      });

      const chartDataFondo = { name: "Fondo de campeonato" };
      responseFondo.data.payments.forEach((payment) => {
        const { categoria, total } = payment;
        chartDataFondo[categoria] = parseInt(total);
      });

      setChartdata([chartDataCuotas, chartDataFondo]);
    } catch (error) {
      console.error("Error fetching categories: ", error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchCyFCxCat();
  }, []);

  return (
    <>
      <h3 className="text-lg font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
        Cuotas y Fondo de campeonato por categoría porcentual anual
      </h3>
      <BarChart
        className="mt-16"
        data={chartdata}
        index="name"
        categories={categoryNames}
        colors={colors.slice(0, categoryNames.length)}
        valueFormatter={valueFormatter}
        yAxisWidth={70}
      />
    </>
  );
}
