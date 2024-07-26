import { BarChart } from "@tremor/react";
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

  // const fetchCategories = async () => {
  //   try {
  //     const response = await axios.get("http://localhost:3001/categories");
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
      const response = await axios.get("http://localhost:3001/fcXcuotas");
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
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    // fetchCategories();
    fetchPaymentsByQuota();
  }, []);

  const valueFormatter = function (number) {
    return "$ " + new Intl.NumberFormat("us").format(number).toString();
  };

  return (
    <>
      <h3 className="text-lg font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
        Fondo de campeonato
      </h3>
      <BarChart
        className="mt-6"
        data={chartdata}
        index="date"
        categories={["Cuota1", "Cuota2"]}
        colors={["gray", "blue"]}
        yAxisWidth={70}
        valueFormatter={valueFormatter}
        onValueChange={(v) => setValue(v)}
      />
      {/* {value && (
        <pre className="mt-8 bg-gray-800 text-white p-4 rounded">
          {JSON.stringify(value, null, 2)}
        </pre>
      )} */}
    </>
  );
}
