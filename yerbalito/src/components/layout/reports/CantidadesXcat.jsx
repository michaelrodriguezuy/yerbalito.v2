import { BarList, Card } from "@tremor/react";
import { useEffect, useState } from "react";
import axios from "axios";

export function BarListCantxCategoria() {

  
  const [categories, setCategories] = useState([]);
  const [cantJugadores, setCantJugadores] = useState([]);

  const data = categories.map((categoria) => ({
    name: categoria.nombre_categoria,
    value: cantJugadores.filter(jugador => jugador.idcategoria === categoria.idcategoria).length ,
    //     value: jugadores.filter(jugador => jugador.categoria_id === categoria.id).length,

  }));

    // const data = [
    //   {
    //     name: "Abejas",
    //     value: 32,
    //   },
    //   {
    //     name: "Grillos",
    //     value: 351,
    //   },
    //   {
    //     name: "Chatas",
    //     value: 271,
    //   },
    //   {
    //     name: "Churrinches",
    //     value: 16,
    //   },
    //   {
    //     name: "Gorriones",
    //     value: 17,
    //   },
    //   {
    //     name: "Semillas",
    //     value: 14,
    //   },
    //   {
    //     name: "Cebollas",
    //     value: 15,
    //   },
    //   {
    //     name: "Babys",
    //     value: 15,
    //   },
    //   {
    //     name: "Sub 9",
    //     value: 13,
    //   },
    //   {
    //     name: "Sub 11",
    //     value: 9,
    //   },
    //   {
    //     name: "Sub 13",
    //     value: 11,
    //   },
    // ];

    const fetchCategoriesEstados = async () => {
      try {
        const response = await axios.get("http://localhost:3001/categories");
        setCategories(response.data.categorias);
      } catch (error) {
        console.error("Error fetching categories: ", error);
      }
    };

    const fetchJugadores = async () => {
      try {
        const response = await axios.get("http://localhost:3001/squad");

        setCantJugadores(response.data.squads);
        // console.log("response.data.squad: ", response.data);
      } catch (error) {
        console.error("Error fetching jugadores: ", error);
      }
    }

  useEffect(() => {
    fetchCategoriesEstados();
    fetchJugadores();
  }, []);

  return (
    <Card className="mx-auto max-w-lg">
      <h3 className="text-tremor-title text-tremor-content-strong dark:text-dark-tremor-content-strong font-medium">
        Cantidad de jugador@s por categoría
      </h3>

      <BarList data={data} className="mt-4" />
    </Card>
  );
}
