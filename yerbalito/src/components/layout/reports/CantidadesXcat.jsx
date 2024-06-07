import { BarList, Card } from "@tremor/react";

const data = [
  {
    name: "Abejas",
    value: 32
    
  },
  {
    name: "Grillos",
    value: 351,
    
  },
  {
    name: "Chatas",
    value: 271,
    
  },
  {
    name: "Churrinches",
    value: 16,
    
  },
  {
    name: "Gorriones",
    value: 17,
    
  },
  {
    name: "Semillas",
    value: 14,
    
  },
  {
    name: "Cebollas",
    value: 15,    
  },
  {
    name: "Babys",
    value: 15,
    
  },
  {
    name: "Sub 9",
    value: 13,
    
  },
  {
    name: "Sub 11",
    value: 9,
    
  },
  {
    name: "Sub 13",
    value: 11,
    
  },
];

export function BarListCantxCategoria() {
  return (
    <Card className="mx-auto max-w-lg">
      <h3 className="text-tremor-title text-tremor-content-strong dark:text-dark-tremor-content-strong font-medium">
        Cantidad de jugador@s por categoría
      </h3>
      <p className="mt-4 text-tremor-default flex items-center justify-between text-tremor-content dark:text-dark-tremor-content">
        <span>Categoria</span>
        <span>Cantidad</span>
      </p>
      <BarList data={data} className="mt-4" />
    </Card>
  );
}
