import { API_ENDPOINTS } from "../../../config/api";
import { BarList, Card } from "@tremor/react";
import { useEffect, useState } from "react";
import axios from "axios";

export function BarListCantxCategoria() {
  const [categories, setCategories] = useState([]);
  const [cantJugadores, setCantJugadores] = useState([]);
  const [contador, setContador] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Calcular el total de jugadores
  const totalJugadores = cantJugadores.length;

  const data = categories.map((categoria) => ({
    name: categoria.nombre_categoria,
    value: cantJugadores.filter(jugador => jugador.idcategoria === categoria.idcategoria).length,
  }));

  // Efecto para animar el contador
  useEffect(() => {
    if (totalJugadores > 0 && contador < totalJugadores) {
      setIsAnimating(true);
      const intervalo = Math.max(5, Math.floor(1000 / totalJugadores)); // Asegura que la animación dure al menos 1 segundo
      
      const timer = setTimeout(() => {
        setContador(prev => 
          prev < totalJugadores ? prev + 1 : totalJugadores
        );
      }, intervalo);
      
      return () => clearTimeout(timer);
    } else if (contador >= totalJugadores && totalJugadores > 0) {
      setIsAnimating(false);
    }
  }, [contador, totalJugadores]);

  // Resetear el contador cuando cambian los datos
  useEffect(() => {
    if (totalJugadores > 0) {
      setContador(0);
    }
  }, [cantJugadores]);

  const fetchCategoriesEstados = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.CATEGORIES);
      setCategories(response.data.categorias);
    } catch (error) {
      console.error("Error fetching categories: ", error);
    }
  };

  const fetchJugadores = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.SQUAD_ALL);
      setCantJugadores(response.data.squads);
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
      <div className="flex flex-col items-center justify-center mb-4">
        <div className="text-center mb-2">
          <span className="text-gray-500 text-sm">Total de jugador@s en el club</span>
        </div>
        <div 
          className={`text-4xl font-bold ${isAnimating ? 'text-blue-500' : 'text-gray-700'}`}
          style={{ 
            transition: 'color 0.5s, transform 0.3s',
            transform: isAnimating ? 'scale(1.1)' : 'scale(1)'
          }}
        >
          {contador}
        </div>
        <div 
          className="w-full h-1 bg-gray-200 mt-2 rounded overflow-hidden"
          style={{ maxWidth: '100px' }}
        >
          <div 
            className="h-full bg-blue-500 rounded" 
            style={{ 
              width: `${totalJugadores > 0 ? (contador / totalJugadores) * 100 : 0}%`,
              transition: 'width 0.3s ease-out'
            }}
          ></div>
        </div>
      </div>

      <BarList data={data} className="mt-4" />
    </Card>
  );
}
