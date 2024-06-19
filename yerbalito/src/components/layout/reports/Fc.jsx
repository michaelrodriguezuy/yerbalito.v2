import { BarChart } from "@tremor/react";
import { useState } from "react";

const chartdata = [
  {
    name: "2018",
    Cuota1: 17,
    Cuota2: 5,
  },

  {
    name: "2017",
    Cuota1: 12,
    Cuota2: 11,
  },

  {
    name: "2016",
    Cuota1: 8,
    Cuota2: 3,
  },

  {
    name: "2015",
    Cuota1: 13,
    Cuota2: 10,
  },

  {
    name: "2014",
    Cuota1: 8,
    Cuota2: 3,
  },

  {
    name: "2013",
    Cuota1: 16,
    Cuota2: 12,
  },

  {
    name: "2012",
    Cuota1: 20,
    Cuota2: 13,
  },

  {
    name: "2011",
    Cuota1: 8,
    Cuota2: 2,
  },

  {
    name: "Sub 9",
    Cuota1: 10,
    Cuota2: 8,
  },

  {
    name: "Sub 11",
    Cuota1: 19,
    Cuota2: 12,
  },

  {
    name: "Sub 13",
    Cuota1: 24,
    Cuota2: 9,
  },
];

export function BarChartFC() {
  const [value, setValue] = useState(null);
  return (
    <>
      <h3 className="text-lg font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
        Fondo de campeonato
      </h3>
      <BarChart
        className="mt-6"
        data={chartdata}
        index="name"
        categories={["Cuota1", "Cuota2"]}
        colors={["gray", "blue"]}
        yAxisWidth={30}
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
