import { BarChart } from '@tremor/react';

const chartdata = [
  {
    name: 'Cuotas del club del mes actual',
    'Abejas': 890,
    'Grillos': 338,
    'Chatas': 538,
    'Churrinches': 396,
    'Gorriones': 138,
    'Semillas': 436,
    'Cebollas': 380,
    'Babys': 535,
    'Sub 9': 352,
    'Sub 11': 718,
    'Sub 13': 539,
  },
  {
    name: 'Fondo de campeonato anual',
    'Abejas': 289,
    'Grillos': 233,
    'Chatas': 253,
    'Churrinches': 333,
    'Gorriones': 133,
    'Semillas': 533,
    'Cebollas': 28,
    'Babys': 33,
    'Sub 9': 61,
    'Sub 11': 53,
    'Sub 13': 39,
  },    
];

// const dataFormatter = (number: number) =>
//   Intl.NumberFormat('us').format(number).toString();

const dataFormatter = (number) =>
    Intl.NumberFormat('us').format(number).toString();


export function BarChartCuotasYfcXcategoria() {
  return (
    <>
      <h3 className="text-lg font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
        Cuotas y Fondo de campeonato por categoría
      </h3>
      <BarChart
        className="mt-16"
        data={chartdata}
        index="name"
        categories={[
          'Abejas',
          'Grillos',
          'Chatas',
          'Churrinches',
          'Gorriones',
          'Semillas',
          'Cebollas',
          'Babys',
          'Sub 9',
          'Sub 11',
          'Sub 13',
        ]}
        colors={['blue', 'teal', 'amber', 'rose', 'indigo', 'emerald']}
        valueFormatter={dataFormatter}
        yAxisWidth={48}
      />
    </>
  );
}