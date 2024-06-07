import { AreaChart } from "@tremor/react";

const chartdata = [
  {
    date: "Jan 22",
    Abejas: 2890,
    Grillos: 2338,
    Chatas: 2389,
    Churrinches: 2784,
    Gorriones: 2393,
    Semillas: 3492,
    Cebollas: 2389,
    Babys: 1120,
    "Sub 9": 1300,
    "Sub 11": 2455,
    "Sub 13": 1756,
  },
  {
    date: "Feb 22",
    Abejas: 2756,
    Grillos: 2103,
    Chatas: 1898,
    Churrinches: 4545,
    Gorriones: 1644,
    Semillas: 3215,
    Cebollas: 2345,
    Babys: 1564,
    "Sub 9": 1986,
    "Sub 11": 1344,
    "Sub 13": 1150,
  },
  {
    date: "Mar 22",
    Abejas: 3322,
    Grillos: 2194,
    Chatas: 2397,
    Churrinches: 3346,
    Gorriones: 1656,
    Semillas: 3444,
    Cebollas: 2333,
    Babys: 2777,
    "Sub 9": 1334,
    "Sub 11": 2956,
    "Sub 13": 1989,
  },
  {
    date: "Apr 22",
    Abejas: 3470,
    Grillos: 2108,
    Chatas: 1987,
    Churrinches: 3456,
    Gorriones: 2345,
    Semillas: 3456,
    Cebollas: 1421,
    Babys: 988,
    "Sub 9": 1124,
    "Sub 11": 2412,
    "Sub 13": 990,    
  },
  {
    date: "May 22",
    Abejas: 3475,
    Grillos: 1812,
    Chatas: 1892,
    Churrinches: 2345,
    Gorriones: 1644,
    Semillas: 1545,
    Cebollas: 1333,
    Babys: 986,
    "Sub 9": 860,
    "Sub 11": 1050,
    "Sub 13": 1130,
  },
  {
    date: "Jun 22",
    Abejas: 3129,
    Grillos: 1726,
    Chatas: 4565,
    Churrinches: 650,
    Gorriones: 6232,
    Semillas: 680,
    Cebollas: 1460,
    Babys: 2001,
    "Sub 9": 2160,
    "Sub 11": 2250,
    "Sub 13": 2360,
  },
  {
    date: "Jul 22",
    Abejas: 3490,
    Grillos: 1982,
    Chatas: 996,
    Churrinches: 890,
    Gorriones: 1068,
    Semillas: 2068,
    Cebollas: 3068,
    Babys: 3454,
    "Sub 9": 3420,
    "Sub 11": 2290,
    "Sub 13": 2305,    
  },
  {
    date: "Aug 22",
    Abejas: 2903,
    Grillos: 2012,
    Chatas: 2345,
    Churrinches: 2345,
    Gorriones: 2345,
    Semillas: 2345,
    Cebollas: 2345,
    Babys: 2345,
    "Sub 9": 2345,
    "Sub 11": 2345,
    "Sub 13": 2345,
  },
  {
    date: "Sep 22",
    Abejas: 2643,
    Grillos: 2342,
    Chatas: 2345,
    Churrinches: 2345,
    Gorriones: 2345,
    Semillas: 2345,
    Cebollas: 2345,
    Babys: 2345,
    "Sub 9": 2345,
    "Sub 11": 2345,
    "Sub 13": 2345,
  },
  {
    date: "Oct 22",
    Abejas: 2837,
    Grillos: 2473,
    Chatas: 2345,
    Churrinches: 2345,
    Gorriones: 2345,
    Semillas: 2345,
    Cebollas: 1122,
    Babys: 2345,
    "Sub 9": 2343,
    "Sub 11": 2345,
    "Sub 13": 2345,
  },
  {
    date: "Nov 22",
    Abejas: 2954,
    Grillos: 3848,
    Chatas: 2345,
    Churrinches: 2345,
    Gorriones: 2345,
    Semillas: 2345,
    Cebollas: 2345,
    Babys: 2332,
    "Sub 9": 1122,
    "Sub 11": 653,
    "Sub 13": 2345,    
  },
  {
    date: "Dec 22",
    Abejas: 3239,
    Grillos: 3736,
    Chatas: 2345,
    Churrinches: 2345,
    Gorriones: 2345,
    Semillas: 2345,
    Cebollas: 655,
    Babys: 3433,
    "Sub 9": 2233,
    "Sub 11": 2345,
    "Sub 13": 2345,
  },
];

const valueFormatter = function (number) {
  return "$ " + new Intl.NumberFormat("us").format(number).toString();
};

export function AreaChartFC() {
  return (
    <>
      <AreaChart
        className="mt-4 h-72"
        data={chartdata}
        index="date"
        yAxisWidth={65}
        categories={[
          "Abejas",
          "Grillos",
          "Chatas",
          "Churrinches",
          "Gorriones",
          "Semillas",
          "Cebollas",
          "Babys",
          "Sub 9",
          "Sub 11",
          "Sub 13",
        ]}
        colors={[
          "indigo",
          "cyan",
          "amber",
          "rose",
          "teal",
          "emerald",
          "blue",
          "fuchsia",
          "lime",
          "orange",
          "sky",
        ]}
        valueFormatter={valueFormatter}
        xAxisLabel="Month of Year"
        yAxisLabel="Revenue (USD)"
      />
    </>
  );
}
