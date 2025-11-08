import { useState, useEffect, useContext } from "react";
import {
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
  Button,
  Modal,
  Box,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  FormControl,
} from "@mui/material";
import axios from "axios";
import { Link } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "sonner";

import { AuthContext } from "../../../context/AuthContext";
import { API_ENDPOINTS } from "../../../config/api";

const Payments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [payments, setPayments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showComprobanteModal, setShowComprobanteModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [reciboIdComprobante, setReciboIdComprobante] = useState(null);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(true);

  // Estilos comunes para TextField
  const textFieldStyles = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      "& input": {
        color: "#000000 !important",
      },
    },
    "& .MuiInputLabel-root": {
      color: "rgba(0, 0, 0, 0.6) !important",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(0, 0, 0, 0.23) !important",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(0, 0, 0, 0.4) !important",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(0, 0, 0, 0.6) !important",
    },
  };

  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [playerPayments, setPlayerPayments] = useState([]);
  const [paidMonths, setPaidMonths] = useState([]); // meses ya pagados del jugador seleccionado
  const [availableYears, setAvailableYears] = useState([]); // años con deudas disponibles
  const [fechaIngreso, setFechaIngreso] = useState(null); // fecha de ingreso del jugador seleccionado
  const [formData, setFormData] = useState({
    idjugador: "",
    monto: "",
    cuota_paga: "",
    anio: new Date().getFullYear(),
    observaciones: "",
  });
  const [selectedMonths, setSelectedMonths] = useState([]); // meses a pagar del año actual seleccionado
  const [selectedMonthsByYear, setSelectedMonthsByYear] = useState({}); // meses a pagar organizados por año: { 2024: [8,9,10], 2025: [3,4,5] }
  const [valores, setValores] = useState(null); // valores del año actual
  const [valoresByYear, setValoresByYear] = useState({}); // valores históricos por año: { 2024: {cuota_club: 300}, 2025: {cuota_club: 400} }

  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchPayments();
    fetchValores();
  }, [searchTerm]);

  // Recalcular monto total cuando cambien los meses seleccionados o los valores históricos
  useEffect(() => {
    if (Object.keys(selectedMonthsByYear).length === 0) return;
    
    // Asegurar que tenemos todos los valores necesarios
    const yearsNeedingValues = Object.keys(selectedMonthsByYear)
      .map(year => parseInt(year, 10))
      .filter(year => !isNaN(year) && year >= 2000 && year <= 2100)
      .filter(year => 
        selectedMonthsByYear[year]?.length > 0 && !valoresByYear[year]
      );
    
    if (yearsNeedingValues.length > 0) {
      // Obtener valores faltantes
      yearsNeedingValues.forEach(year => fetchValoresByYear(year));
      return; // Esperar a que se carguen los valores
    }
    
    // Calcular directamente si tenemos todos los valores
    let total = 0;
    Object.entries(selectedMonthsByYear).forEach(([year, yearMonths]) => {
      if (yearMonths && yearMonths.length > 0) {
        const yearValores = valoresByYear[year] || valores;
        const unit = yearValores?.cuota_club || 0;
        total += yearMonths.length * unit;
      }
    });
    
    if (total > 0 || Object.values(selectedMonthsByYear).some(months => months?.length > 0)) {
      setFormData((prev) => ({
        ...prev,
        monto: total.toString()
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonthsByYear, valoresByYear]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3001/payments/${id}`);
        const response = await axios.get(API_ENDPOINTS.PAYMENTS);
        setPayments(response.data.payments);
        // Mostrar un mensaje de éxito
        Swal.fire("¡Eliminado!", "El recibo ha sido eliminado.", "success");
      } catch (error) {
        console.error("Error deleting payment: ", error);
        // Mostrar un mensaje de error
        Swal.fire("Error", "Hubo un problema al eliminar el recibo.", "error");
      }
    }
  };

  const handleCreate = () => {
    setShowModal(true);
    fetchPlayers();
    console.log(playerPayments);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPlayer("");
    setPaidMonths([]);
    setAvailableYears([]);
    setFechaIngreso(null);
    setFormData({
      idjugador: "",
      monto: "",
      cuota_paga: "",
      anio: new Date().getFullYear(),
      observaciones: "",
    });
    setSelectedMonths([]);
    setSelectedMonthsByYear({});
    setValoresByYear({});
  };

  const handlePlayerSelectChange = async (event) => {
    const playerId = event.target.value;
    setSelectedPlayer(playerId);

    // Buscar los meses no pagados para este jugador
    if (playerId) {
      try {
        // Obtener el jugador completo para acceder a su fecha de ingreso
        const selectedPlayerData = playerPayments.find(p => p.idjugador === parseInt(playerId));
        const playerFechaIngreso = selectedPlayerData?.fecha_ingreso;
        setFechaIngreso(playerFechaIngreso);
        let ingresoYear = null;
        let ingresoMonth = null;
        
        if (playerFechaIngreso) {
          const ingresoDate = new Date(playerFechaIngreso);
          ingresoYear = ingresoDate.getFullYear();
          ingresoMonth = ingresoDate.getMonth() + 1; // getMonth() devuelve 0-11
        }
        
        // Obtener todos los pagos del jugador (sin filtrar por año inicialmente)
        const response = await axios.get(
          `${API_ENDPOINTS.PAYMENTS}?playerId=${playerId}`
        );
        // Filtrar solo recibos con visible = 1 (incluye monto > 0 y monto = 0 de pagos por hermano)
        const allPlayerPayments = (response.data.payments || []).filter(
          payment => {
            // Aceptar visible = 1 (número) o visible = '1' (string) o visible = true
            const isVisible = payment.visible === 1 || payment.visible === '1' || payment.visible === true;
            return isVisible;
          }
        );
        
        console.log(`[Payments] Jugador ${playerId}: Total recibos del backend: ${response.data.payments?.length || 0}, Recibos visibles: ${allPlayerPayments.length}`);
        console.log(`[Payments] Recibos visibles por mes:`, allPlayerPayments.map(p => ({ mes: p.mes_pago, anio: p.anio, monto: p.monto, visible: p.visible })));
        
        // Agrupar recibos por año para debugging
        const recibosPorAnio = {};
        allPlayerPayments.forEach(p => {
          const anio = parseInt(p.anio);
          if (!recibosPorAnio[anio]) {
            recibosPorAnio[anio] = [];
          }
          recibosPorAnio[anio].push(parseInt(p.mes_pago));
        });
        console.log(`[Payments] Recibos agrupados por año:`, recibosPorAnio);

        // Determinar el año a sugerir:
        // 1. Si tiene meses sin pagar del año actual, sugerir año actual
        // 2. Si no, revisar años anteriores (desde el más reciente)
        const currentYear = new Date().getFullYear();
        const enabledMonths = valores?.meses_cuotas || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        
        let suggestedYear = currentYear;
        let unpaidMonths = [];
        const yearsWithDebt = [];
        
        // Revisar desde el año de ingreso (o el año más antiguo con pagos) hasta el año actual
        const yearsWithPayments = [...new Set(allPlayerPayments.map(p => parseInt(p.anio)))].sort();
        let startYear = yearsWithPayments.length > 0 ? Math.min(...yearsWithPayments) : currentYear;
        
        // Si hay fecha de ingreso, usar el año de ingreso como punto de partida mínimo
        // Esto asegura que siempre revisemos desde el año de ingreso hacia adelante
        if (ingresoYear && ingresoYear <= currentYear) {
          // Si el año de ingreso es menor que el startYear calculado, usarlo como inicio
          // O si no hay pagos, usar el año de ingreso
          if (ingresoYear < startYear || yearsWithPayments.length === 0) {
            startYear = ingresoYear;
          }
        }
        
        // IMPORTANTE: Solo revisar años que realmente tienen meses sin pagar
        // No revisar todos los años desde startYear, solo los que tienen deuda
        for (let year = startYear; year <= currentYear; year++) {
          // Filtrar meses según fecha de ingreso
          let availableMonthsForYear = enabledMonths;
          
          // Si es el año de ingreso, solo habilitar meses desde el mes de ingreso en adelante
          if (ingresoYear && year === ingresoYear && ingresoMonth) {
            availableMonthsForYear = enabledMonths.filter(month => month >= ingresoMonth);
          }
          // Si el año es anterior al año de ingreso, no hay meses disponibles
          else if (ingresoYear && year < ingresoYear) {
            availableMonthsForYear = [];
          }
          
          // Filtrar pagos del año actual que sean visibles (ya están filtrados en allPlayerPayments)
          const paidMonthsForYear = allPlayerPayments
            .filter(payment => {
              const paymentYear = parseInt(payment.anio);
              const paymentMonth = parseInt(payment.mes_pago);
              // Solo considerar pagos del año actual que sean visibles
              return paymentYear === year && !isNaN(paymentMonth);
            })
            .map((payment) => parseInt(payment.mes_pago))
            .filter(month => !isNaN(month));
          
          // Eliminar duplicados de meses pagados
          const uniquePaidMonths = [...new Set(paidMonthsForYear)];
          
          const unpaidForYear = availableMonthsForYear
            .filter(month => !uniquePaidMonths.includes(month))
            .sort((a, b) => a - b);
          
          // Solo agregar el año a yearsWithDebt si realmente tiene meses sin pagar
          if (unpaidForYear.length > 0) {
            yearsWithDebt.push(year);
            if (!suggestedYear || year < suggestedYear) {
              suggestedYear = year;
              unpaidMonths = unpaidForYear;
              setPaidMonths(uniquePaidMonths);
            }
          }
          
          // Debug logging para cada año
          console.log(`[Payments] Año ${year}: Meses disponibles: ${availableMonthsForYear.length}, Meses pagados: ${uniquePaidMonths.length} (${uniquePaidMonths.join(',')}), Meses sin pagar: ${unpaidForYear.length} (${unpaidForYear.join(',')})`);
          if (unpaidForYear.length === 0 && availableMonthsForYear.length > 0) {
            console.log(`[Payments] ✅ Año ${year}: Todos los meses están pagados, NO se agregará a yearsWithDebt`);
          } else if (unpaidForYear.length > 0) {
            console.log(`[Payments] ⚠️ Año ${year}: Tiene ${unpaidForYear.length} meses sin pagar, se agregará a yearsWithDebt`);
          }
        }
        
        // Siempre incluir el año actual en la lista
        if (!yearsWithDebt.includes(currentYear)) {
          yearsWithDebt.push(currentYear);
          console.log(`[Payments] Año actual ${currentYear} agregado a yearsWithDebt (siempre se incluye)`);
        }
        
        console.log(`[Payments] Años con deuda finales:`, yearsWithDebt.sort((a, b) => a - b));
        console.log(`[Payments] Año sugerido: ${suggestedYear}, Meses sin pagar sugeridos: ${unpaidMonths.join(',')}`);
        
        setAvailableYears(yearsWithDebt.sort((a, b) => a - b));
        
        // Si no hay meses sin pagar en ningún año, revisar el año actual
        if (unpaidMonths.length === 0) {
          suggestedYear = currentYear;
          // Usar allPlayerPayments que ya está filtrado por visible = 1
          const paidMonthsThisYear = allPlayerPayments
            .filter(payment => {
              const paymentYear = parseInt(payment.anio);
              const paymentMonth = parseInt(payment.mes_pago);
              return paymentYear === currentYear && !isNaN(paymentMonth);
            })
            .map((payment) => parseInt(payment.mes_pago))
            .filter(month => !isNaN(month));
          
          // Eliminar duplicados
          const uniquePaidMonthsThisYear = [...new Set(paidMonthsThisYear)];
          
          unpaidMonths = enabledMonths
            .filter(month => !uniquePaidMonthsThisYear.includes(month))
            .sort((a, b) => a - b);
          
          setPaidMonths(uniquePaidMonthsThisYear);
          
          if (unpaidMonths.length === 0) {
            setSelectedMonths([]);
            setFormData((prev) => ({
              ...prev,
              idjugador: playerId,
              cuota_paga: "",
              anio: currentYear,
              monto: "0",
            }));
            // Cerrar el modal primero y luego mostrar el toast
            handleCloseModal();
            setTimeout(() => {
              toast.info("Este jugador ya tiene todos los meses habilitados pagos para este año");
            }, 100);
            return;
          }
        }

        // Sugerir el primer mes no pagado del año determinado
        const initialSelected = [unpaidMonths[0]];
        setSelectedMonths(initialSelected);
        setSelectedMonthsByYear({ [suggestedYear]: initialSelected });
        setFormData((prev) => ({
          ...prev,
          idjugador: playerId,
          cuota_paga: unpaidMonths[0].toString(),
          anio: suggestedYear,
          monto: valores ? (valores.cuota_club || 0).toString() : "",
        }));
      } catch (error) {
        console.error("Error fetching player payments:", error);
        // Si hay error, resetear y usar año actual
        setPaidMonths([]);
        setAvailableYears([new Date().getFullYear()]);
        
        // Obtener el jugador para considerar su fecha de ingreso incluso en caso de error
        const selectedPlayerData = playerPayments.find(p => p.idjugador === parseInt(playerId));
        const fechaIngreso = selectedPlayerData?.fecha_ingreso;
        const currentYear = new Date().getFullYear();
        let enabledMonths = valores?.meses_cuotas || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        
        // Si hay fecha de ingreso y es el año actual
        if (fechaIngreso) {
          const ingresoDate = new Date(fechaIngreso);
          const ingresoYear = ingresoDate.getFullYear();
          const ingresoMonth = ingresoDate.getMonth() + 1;
          
          if (currentYear === ingresoYear) {
            // Filtrar meses desde el mes de ingreso
            enabledMonths = enabledMonths.filter(month => month >= ingresoMonth);
          }
        }
        
        const firstMonth = enabledMonths[0] || 1;
        setSelectedMonths([firstMonth]);
        setFormData((prev) => ({
          ...prev,
          idjugador: playerId,
          cuota_paga: firstMonth.toString(),
          anio: new Date().getFullYear(),
          monto: valores ? (valores.cuota_club || 0).toString() : "",
        }));
      }
    } else {
      // Si no hay jugador seleccionado, resetear meses pagados
      setPaidMonths([]);
      setAvailableYears([]);
    }
  };

  // Calcular monto total usando valores históricos por año
  const calculateTotalAmount = (selectedByYear, callback) => {
    // Función auxiliar para calcular cuando tengamos todos los valores
    const calculate = () => {
      let total = 0;
      Object.entries(selectedByYear).forEach(([year, yearMonths]) => {
        if (yearMonths.length > 0) {
          const yearValores = valoresByYear[year] || valores; // usar valores del año o los actuales como fallback
          const unit = yearValores?.cuota_club || 0;
          total += yearMonths.length * unit;
        }
      });
      setFormData((prev) => ({
        ...prev,
        monto: total.toString()
      }));
      if (callback) callback(total);
    };
    
    // Si hay años sin valores, obtenerlos primero
    const yearsNeedingValues = Object.keys(selectedByYear)
      .map(year => parseInt(year, 10))
      .filter(year => !isNaN(year) && year >= 2000 && year <= 2100)
      .filter(year => 
        selectedByYear[year].length > 0 && !valoresByYear[year]
      );
    
    if (yearsNeedingValues.length > 0) {
      // Obtener valores para todos los años necesarios
      Promise.all(yearsNeedingValues.map(year => fetchValoresByYear(year))).then(() => {
        // Esperar un poco para que los estados se actualicen
        setTimeout(calculate, 200);
      });
    } else {
      calculate();
    }
  };

  // Calcular meses disponibles para el año seleccionado
  const getAvailableMonthsForYear = (year) => {
    if (!selectedPlayer || !fechaIngreso) {
      return valores?.meses_cuotas || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    }
    
    const ingresoDate = new Date(fechaIngreso);
    const ingresoYear = ingresoDate.getFullYear();
    const ingresoMonth = ingresoDate.getMonth() + 1;
    const enabledMonths = valores?.meses_cuotas || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    
    // Si el año seleccionado es el año de ingreso, solo meses desde el mes de ingreso
    if (year === ingresoYear) {
      return enabledMonths.filter(month => month >= ingresoMonth);
    }
    
    // Si el año seleccionado es anterior al año de ingreso, no hay meses disponibles
    if (year < ingresoYear) {
      return [];
    }
    
    // Para años posteriores al ingreso, todos los meses habilitados
    return enabledMonths;
  };

  const handleFormChange = async (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Si cambia el año manualmente, guardar meses del año anterior y cargar meses del nuevo año
    if (field === "anio" && formData.idjugador) {
      try {
        const oldYear = formData.anio;
        const newYear = parseInt(value);
        
        // Guardar los meses seleccionados del año anterior
        if (selectedMonths.length > 0) {
          setSelectedMonthsByYear((prev) => ({
            ...prev,
            [oldYear]: selectedMonths
          }));
        }
        
        // Cargar los meses seleccionados del nuevo año (si ya había seleccionado algo antes)
        const monthsForNewYear = selectedMonthsByYear[newYear] || [];
        setSelectedMonths(monthsForNewYear);
        
        // Obtener valores para el año nuevo si no los tenemos
        if (!valoresByYear[newYear]) {
          fetchValoresByYear(newYear);
        }
        
        const response = await axios.get(
          `${API_ENDPOINTS.PAYMENTS}?playerId=${formData.idjugador}&year=${newYear}`
        );
        // Filtrar solo recibos con visible = 1 (incluye monto > 0 y monto = 0 de pagos por hermano)
        const playerPaymentsData = (response.data.payments || []).filter(
          payment => {
            // Aceptar visible = 1 (número) o visible = '1' (string) o visible = true
            const isVisible = payment.visible === 1 || payment.visible === '1' || payment.visible === true;
            return isVisible;
          }
        );
        const paidMonthsList = playerPaymentsData
          .map((payment) => parseInt(payment.mes_pago))
          .filter(month => !isNaN(month));
        setPaidMonths(paidMonthsList);
        
        // Obtener meses disponibles para el nuevo año
        const availableMonths = getAvailableMonthsForYear(newYear);
        
        // Filtrar meses seleccionados que ya no están disponibles o están pagados
        const validSelectedMonths = monthsForNewYear.filter(
          month => availableMonths.includes(month) && !paidMonthsList.includes(month)
        );
        setSelectedMonths(validSelectedMonths);
        
        // Actualizar selectedMonthsByYear con los meses válidos
        const updatedSelectedByYear = { ...selectedMonthsByYear, [newYear]: validSelectedMonths };
        setSelectedMonthsByYear(updatedSelectedByYear);
        
        // Si no hay meses válidos seleccionados, sugerir el primero disponible
        if (validSelectedMonths.length === 0) {
          const unpaidMonths = availableMonths.filter(month => !paidMonthsList.includes(month));
          if (unpaidMonths.length > 0) {
            const newSelected = [unpaidMonths[0]];
            setSelectedMonths(newSelected);
            const updatedSelectedByYear2 = { ...updatedSelectedByYear, [newYear]: newSelected };
            setSelectedMonthsByYear(updatedSelectedByYear2);
            
            // Calcular monto usando valores históricos
            calculateTotalAmount(updatedSelectedByYear2);
            
            setFormData((prev) => ({
              ...prev,
              cuota_paga: unpaidMonths[0].toString()
            }));
          } else {
            setSelectedMonths([]);
            setFormData((prev) => ({
              ...prev,
              cuota_paga: "",
              monto: "0"
            }));
          }
        } else {
          // Recalcular monto basado en TODOS los meses seleccionados de todos los años
          calculateTotalAmount(updatedSelectedByYear);
          setFormData((prev) => ({
            ...prev,
            cuota_paga: validSelectedMonths[0] ? validSelectedMonths[0].toString() : ""
          }));
        }
      } catch (error) {
        console.error("Error fetching payments for year:", error);
        setPaidMonths([]);
      }
    }
  };

  const handleSubmitPayment = async () => {
    try {
      // Crear recibos para TODOS los meses seleccionados de TODOS los años
      const allSelectedMonths = selectedMonthsByYear;
      const allMonthsToPay = Object.entries(allSelectedMonths).flatMap(([year, months]) => 
        months.map(month => ({ year: parseInt(year), month }))
      );
      
      if (!formData.idjugador || allMonthsToPay.length === 0) {
        toast.error("Selecciona un jugador y al menos un mes a pagar");
        return;
      }

      let totalRecibos = 0;
      const recibosIds = []; // Guardar TODOS los IDs de recibos creados (principales + hermanos)
      const hermanosRechazadosAcumulados = []; // Acumular información de hermanos rechazados
      
      for (const { year, month } of allMonthsToPay) {
        // Obtener el valor de cuota para el año específico
        const yearValores = valoresByYear[year] || valores;
        const monto = yearValores?.cuota_club ?? 0;
        
        if (!monto || monto === 0) {
          toast.error(`No se encontró el valor de cuota para el año ${year}`);
          continue;
        }
        
        const payment = {
          idjugador: parseInt(formData.idjugador),
          monto: parseFloat(monto),
          cuota_paga: month.toString(),
          anio: parseInt(year),
          observaciones: formData.observaciones || '',
          idusuario: parseInt(user.id),
        };
        
        try {
          const response = await axios.post(API_ENDPOINTS.PAYMENTS, payment);
          // Usar totalRecibosCreados del backend si está disponible, sino calcular
          const recibosCreados = response.data.totalRecibosCreados || (1 + (response.data.hermanosAfectados || 0));
          totalRecibos += recibosCreados;
          
          // Guardar el ID del recibo principal
          if (response.data.idrecibo) {
            recibosIds.push(response.data.idrecibo);
          }
          
          // Acumular información de hermanos rechazados
          if (response.data.hermanosRechazados && response.data.hermanosRechazados.length > 0) {
            hermanosRechazadosAcumulados.push({
              mes: month,
              anio: year,
              hermanos: response.data.hermanosRechazados
            });
          }
        } catch (error) {
          console.error(`Error creating payment for year ${year}, month ${month}:`, error);
          toast.error(`Error al crear recibo para ${month}/${year}: ${error.response?.data?.error || error.message}`);
          throw error; // Detener el proceso si hay un error
        }
      }

      // Mostrar mensaje de éxito con información sobre hermanos rechazados si los hay
      let mensajeExito = `¡Éxito! Se crearon ${totalRecibos} recibos correctamente.`;
      if (hermanosRechazadosAcumulados.length > 0) {
        const totalRechazados = hermanosRechazadosAcumulados.reduce((sum, item) => sum + item.hermanos.length, 0);
        mensajeExito += `\n⚠️ ${totalRechazados} hermano(s) no recibieron recibos automáticos.`;
        // Mostrar detalles en consola para debugging
        console.warn('Hermanos rechazados:', hermanosRechazadosAcumulados);
      }
      
      toast.success(mensajeExito);
      handleCloseModal();
      fetchPayments();
      
      // Abrir modal de comprobante si se creó al menos un recibo
      if (recibosIds.length > 0) {
        // Enviar todos los IDs separados por coma al endpoint
        setReciboIdComprobante(recibosIds.join(','));
        setShowComprobanteModal(true);
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      toast.error("No se pudo crear el recibo.");
    }
  };

  const fetchPlayers = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.SQUAD_ALL);
      // Filtrar jugadores exonerados (estado=3) - estos no deben pagar cuotas
      // El backend ya trae los datos ordenados alfabéticamente por apellido y nombre
      // El .filter() mantiene el orden del array original, así que no necesitamos reordenar
      const playersWithoutExonerated = (response.data.squads || []).filter(
        (player) => player.idestado !== 3
      );
      // Asegurar que el orden se mantiene (el filter preserva el orden, pero por si acaso)
      setPlayerPayments(playersWithoutExonerated);
    } catch (error) {
      console.error("Error fetching players: ", error);
    }
  };

  const fetchValores = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.VALORES);
      const valoresData = response.data.valores;
      setValores(valoresData);
      // Guardar valores del año actual en valoresByYear
      if (valoresData?.ano) {
        setValoresByYear((prev) => ({
          ...prev,
          [valoresData.ano]: valoresData
        }));
      }
    } catch (error) {
      console.error("Error fetching valores:", error);
    }
  };

  const fetchValoresByYear = async (ano) => {
    try {
      // Validar que el año sea válido
      const anoNum = parseInt(ano, 10);
      if (isNaN(anoNum) || anoNum < 2000 || anoNum > 2100) {
        console.warn(`⚠️ Año inválido para fetchValoresByYear:`, ano);
        return;
      }
      
      // Si ya tenemos los valores de este año, no hacer la petición
      if (valoresByYear[anoNum]) {
        return;
      }
      
      const response = await axios.get(API_ENDPOINTS.VALORES_BY_YEAR(anoNum));
      const valoresData = response.data.valores;
      if (valoresData) {
        setValoresByYear((prev) => ({
          ...prev,
          [anoNum]: valoresData
        }));
        // El useEffect recalculará el monto automáticamente
      }
    } catch (error) {
      console.error(`Error fetching valores for year ${ano}:`, error);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.PAYMENTS);

      if (searchTerm) {
        const filtered = response.data.payments.filter(
          (payment) =>
            payment.nombre_jugador
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            payment.apellido_jugador
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
        );
        setPayments(filtered);
      } else {
        setPayments(response.data.payments);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container-scroll">
      <div className="content-container">
        {/* Header inspirado en alexandergarcia.me */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: "2.5rem", md: "4rem" },
              fontWeight: 800,
              background: "linear-gradient(45deg, #4CAF50, #ffffff)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 2,
              textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            Pagos
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: "rgba(255,255,255,0.8)",
              fontWeight: 300,
              maxWidth: "600px",
              mx: "auto",
              mb: 3,
            }}
          >
            Gestión de pagos de cuotas del club
          </Typography>
        </Box>

        <Paper
          elevation={3}
          className="content-paper slide-up"
          sx={{
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            padding: "40px",
            maxWidth: "95%",
            margin: "0 auto",
            color: "white",
            borderRadius: "20px",
            backdropFilter: "blur(10px)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "center",
              alignItems: { xs: "stretch", sm: "center" },
              gap: { xs: 2, sm: 2 },
              marginBottom: "20px",
            }}
          >
            {/* Título fijo del buscador */}
            <Box sx={{ width: { xs: "100%", sm: "50%" }, flex: 1 }}>
              <TextField
                variant="outlined"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Buscar recibos de cuotas del club de..."
                fullWidth
                inputProps={{
                  style: { color: "#000" },
                }}
                sx={{
                  ...textFieldStyles,
                  "& input::placeholder": {
                    color: "#666",
                    opacity: 1,
                  },
                }}
              />
            </Box>
            <Button
              variant="contained"
              onClick={handleCreate}
              sx={{
                height: { xs: "48px", sm: "56px" },
                width: { xs: "100%", sm: "auto" },
                minWidth: { xs: "100%", sm: "150px" },
              }}
            >
              Crear Recibo
            </Button>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              overflowX: "auto",
              width: "100%",
              "&::-webkit-scrollbar": {
                height: "8px",
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(76, 175, 80, 0.5)",
                borderRadius: "4px",
                "&:hover": {
                  backgroundColor: "rgba(76, 175, 80, 0.7)",
                },
              },
            }}
          >
            <Box
              sx={{
                width: "100%",
                maxHeight: { xs: "400px", md: 350 },
                minWidth: { xs: "600px", sm: "800px" },
                overflowY: "auto",
              }}
            >
              <TableContainer
                component={Paper}
                sx={{
                  backgroundColor: "transparent",
                  minWidth: { xs: "600px", sm: "800px" },
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow
                      sx={{
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        borderBottom: "2px solid rgba(255, 255, 255, 0.2)",
                      }}
                    >
                      <TableCell
                        style={{
                          color: "white",
                          textAlign: "center",
                          fontWeight: "bold",
                          fontSize: "1rem",
                          paddingTop: "12px",
                          paddingBottom: "12px",
                        }}
                      >
                        RECIBO
                      </TableCell>
                      <TableCell
                        style={{
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "1rem",
                          paddingTop: "12px",
                          paddingBottom: "12px",
                        }}
                      >
                        NOMBRE
                      </TableCell>
                      <TableCell
                        style={{
                          color: "white",
                          textAlign: "center",
                          fontWeight: "bold",
                          fontSize: "1rem",
                          paddingTop: "12px",
                          paddingBottom: "12px",
                        }}
                      >
                        FECHA RECIBO
                      </TableCell>
                      <TableCell
                        style={{
                          color: "white",
                          textAlign: "center",
                          fontWeight: "bold",
                          fontSize: "1rem",
                          paddingTop: "12px",
                          paddingBottom: "12px",
                        }}
                      >
                        MES
                      </TableCell>
                      <TableCell
                        style={{
                          color: "white",
                          textAlign: "center",
                          fontWeight: "bold",
                          fontSize: "1rem",
                          paddingTop: "12px",
                          paddingBottom: "12px",
                        }}
                      >
                        AÑO
                      </TableCell>
                      <TableCell
                        style={{
                          color: "white",
                          textAlign: "center",
                          fontWeight: "bold",
                          fontSize: "1rem",
                          paddingTop: "12px",
                          paddingBottom: "12px",
                        }}
                      >
                        MONTO
                      </TableCell>
                      <TableCell
                        style={{
                          color: "white",
                          textAlign: "center",
                          fontWeight: "bold",
                          fontSize: "1rem",
                          paddingTop: "12px",
                          paddingBottom: "12px",
                        }}
                      >
                        USUARIO
                      </TableCell>
                      {user.rol === import.meta.env.VITE_ROLPRO && (
                        <TableCell
                          style={{
                            color: "white",
                            textAlign: "center",
                            fontWeight: "bold",
                            fontSize: "1rem",
                            paddingTop: "12px",
                            paddingBottom: "12px",
                          }}
                        >
                          ACCIONES
                        </TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          style={{ textAlign: "center", padding: "40px" }}
                        >
                          <CircularProgress style={{ color: "white" }} />
                          <Typography
                            variant="body1"
                            style={{ color: "white", marginTop: "20px" }}
                          >
                            Cargando recibos...
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : payments.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          style={{ textAlign: "center", padding: "40px" }}
                        >
                          <Typography
                            variant="body1"
                            style={{ color: "white" }}
                          >
                            No se encontraron recibos con los filtros
                            seleccionados
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      payments.map((payment, index) => (
                        <TableRow
                          key={payment.idrecibo}
                          sx={{
                            backgroundColor:
                              index % 2 === 0
                                ? "rgba(255, 255, 255, 0.03)"
                                : "rgba(255, 255, 255, 0.07)",
                            "&:hover": {
                              backgroundColor: "rgba(255, 255, 255, 0.1)",
                            },
                          }}
                        >
                          <TableCell
                            style={{
                              color: "white",
                              textAlign: "center",
                              borderBottom:
                                "1px solid rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            <Link
                              title="Ver recibo"
                              to={`/payments/${payment.idrecibo}`}
                              style={{
                                textDecoration: "none",
                                color: "#4dabf5",
                              }}
                            >
                              {payment.numero}
                            </Link>
                          </TableCell>
                          <TableCell
                            style={{
                              color: "white",
                              borderBottom:
                                "1px solid rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            {payment.nombre_jugador} {payment.apellido_jugador}
                          </TableCell>
                          <TableCell
                            style={{
                              color: "white",
                              textAlign: "center",
                              borderBottom:
                                "1px solid rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            {payment.fecha_recibo
                              .split("T")[0]
                              .split("-")
                              .reverse()
                              .join("/")}
                          </TableCell>
                          <TableCell
                            style={{
                              color: "white",
                              textAlign: "center",
                              borderBottom:
                                "1px solid rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            {(() => {
                              switch (payment.mes_pago) {
                                case 1:
                                  return "Enero";
                                case 2:
                                  return "Febrero";
                                case 3:
                                  return "Marzo";
                                case 4:
                                  return "Abril";
                                case 5:
                                  return "Mayo";
                                case 6:
                                  return "Junio";
                                case 7:
                                  return "Julio";
                                case 8:
                                  return "Agosto";
                                case 9:
                                  return "Septiembre";
                                case 10:
                                  return "Octubre";
                                case 11:
                                  return "Noviembre";
                                case 12:
                                  return "Diciembre";
                                default:
                                  return payment.mes_pago;
                              }
                            })()}
                          </TableCell>
                          <TableCell
                            style={{
                              color: "white",
                              textAlign: "center",
                              borderBottom:
                                "1px solid rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            {payment.anio}
                          </TableCell>
                          <TableCell
                            style={{
                              color: "#4dabf5",
                              textAlign: "center",
                              borderBottom:
                                "1px solid rgba(255, 255, 255, 0.1)",
                              fontWeight: "bold",
                            }}
                          >
                            $ {payment.monto}
                          </TableCell>
                          <TableCell
                            style={{
                              color: "white",
                              textAlign: "center",
                              borderBottom:
                                "1px solid rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            {payment.nombre_usuario}
                          </TableCell>

                          {user.rol === import.meta.env.VITE_ROLPRO && (
                            <TableCell
                              style={{
                                color: "white",
                                textAlign: "center",
                                borderBottom:
                                  "1px solid rgba(255, 255, 255, 0.1)",
                              }}
                            >
                              <IconButton
                                color="error"
                                title="Eliminar recibo"
                                onClick={() => handleDelete(payment.idrecibo)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        </Paper>

        <Modal
          open={showModal}
          onClose={handleCloseModal}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "95%", sm: "90%", md: 400 },
              maxWidth: 500,
              maxHeight: "90vh",
              bgcolor: "white",
              border: "2px solid #000",
              boxShadow: 24,
              p: { xs: 2, md: 4 },
              borderRadius: 2,
              overflow: "auto",
            }}
          >
            <Paper elevation={3} sx={{ p: 3, maxWidth: 500, margin: '0 auto' }}>
              <Typography variant="h6" gutterBottom>
                Crear Recibo de Cuota
              </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Selección de jugador */}
              <FormControl fullWidth>
                <Typography variant="subtitle2" gutterBottom>
                  Seleccionar Jugador
                </Typography>
                <Select
                  value={selectedPlayer}
                  onChange={handlePlayerSelectChange}
                  displayEmpty
                  variant="outlined"
                  sx={{
                    backgroundColor: "#ffffff",
                    color: "#000000",
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: "#ffffff",
                        "& .MuiMenuItem-root": {
                          color: "#000000",
                          // Forzar que los items se muestren en orden sin agrupación visual
                          '&::before': { display: 'none' },
                          '&::after': { display: 'none' }
                        },
                        // Eliminar cualquier lógica de agrupación
                        '& .MuiList-root': {
                          padding: 0
                        }
                      },
                    },
                    // Asegurar que no se agrupe por categoría
                    disableAutoFocusItem: true,
                    // Deshabilitar cualquier agrupación automática
                    variant: "menu",
                  }}
                >
                  <MenuItem value="" disabled>
                    Seleccione un jugador
                  </MenuItem>
                  {playerPayments &&
                    playerPayments.map((player) => (
                      <MenuItem 
                        key={player.idjugador} 
                        value={player.idjugador}
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          // Evitar que Material-UI agrupe visualmente por categoría
                          '&::before': { display: 'none' }
                        }}
                      >
                        {player.apellido}, {player.nombre} - {player.nombre_categoria}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>

              {/* Año - MOVIDO ARRIBA */}
              <FormControl fullWidth>
                <Typography variant="subtitle2" gutterBottom>
                  Año
                </Typography>
                <Select
                  value={formData.anio}
                  onChange={(e) => handleFormChange("anio", parseInt(e.target.value))}
                  displayEmpty
                  variant="outlined"
                  disabled={!selectedPlayer}
                  sx={{
                    backgroundColor: "#ffffff",
                    color: "#000000",
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: "#ffffff",
                        "& .MuiMenuItem-root": { color: "#000000" },
                      },
                    },
                  }}
                >
                  {availableYears.length > 0 ? (
                    availableYears.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value={new Date().getFullYear()}>
                      {new Date().getFullYear()}
                    </MenuItem>
                  )}
                </Select>
              </FormControl>

              {/* Selección de meses a pagar - FILTRADOS SEGÚN AÑO */}
              <FormControl fullWidth>
                <Typography variant="subtitle2" gutterBottom>
                  Meses a pagar
                </Typography>
                <Select
                  multiple
                  value={selectedMonths}
                  onChange={(e) => {
                    const months = e.target.value;
                    const currentYear = formData.anio;
                    
                    // Actualizar meses seleccionados del año actual
                    setSelectedMonths(months);
                    setSelectedMonthsByYear((prev) => ({
                      ...prev,
                      [currentYear]: months
                    }));
                    
                    // Actualizar meses seleccionados del año actual
                    // El useEffect se encargará de recalcular el monto
                    setFormData((prev) => ({
                      ...prev,
                      cuota_paga: months[0] ? months[0].toString() : "",
                    }));
                  }}
                  renderValue={(selected) =>
                    selected
                      .sort((a, b) => a - b)
                      .map((m) => {
                        const names = [
                          "Enero",
                          "Febrero",
                          "Marzo",
                          "Abril",
                          "Mayo",
                          "Junio",
                          "Julio",
                          "Agosto",
                          "Septiembre",
                          "Octubre",
                          "Noviembre",
                          "Diciembre",
                        ];
                        return names[m - 1];
                      })
                      .join(", ")
                  }
                  disabled={!selectedPlayer}
                  sx={{ backgroundColor: "#ffffff", color: "#000000" }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: "#ffffff",
                        "& .MuiMenuItem-root": { color: "#000000" },
                      },
                    },
                  }}
                >
                  {/* Mostrar SOLO los meses disponibles para el año seleccionado */}
                  {getAvailableMonthsForYear(formData.anio)
                    .sort((a, b) => a - b)
                    .map((month) => {
                      const names = [
                        "Enero",
                        "Febrero",
                        "Marzo",
                        "Abril",
                        "Mayo",
                        "Junio",
                        "Julio",
                        "Agosto",
                        "Septiembre",
                        "Octubre",
                        "Noviembre",
                        "Diciembre",
                      ];
                      const isPaid = paidMonths.includes(month);
                      return (
                        <MenuItem key={month} value={month} disabled={isPaid}>
                          {names[month - 1]} {isPaid && "✓ (Pago)"}
                        </MenuItem>
                      );
                    })}
                </Select>
              </FormControl>

              {/* Monto total calculado - COMPACTO */}
              <Box sx={{ 
                p: 1.5, 
                backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                borderRadius: 1,
                maxHeight: '120px',
                overflow: 'auto'
              }}>
                {(() => {
                  let total = 0;
                  let detail = [];
                  Object.entries(selectedMonthsByYear).forEach(([year, yearMonths]) => {
                    if (yearMonths && yearMonths.length > 0) {
                      const yearValores = valoresByYear[year] || valores;
                      const unit = yearValores?.cuota_club ?? 0;
                      const yearTotal = yearMonths.length * unit;
                      total += yearTotal;
                      detail.push(`${yearMonths.length} mes(es) ${year}: $${yearTotal}`);
                    }
                  });
                  return (
                    <>
                      <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 'bold', mb: 0.5 }}>
                        Total: ${total > 0 ? total.toLocaleString('es-UY') : '0'}
                      </Typography>
                      {detail.length > 0 && (
                        <Typography variant="caption" sx={{ color: '#cccccc', display: 'block', fontSize: '0.75rem' }}>
                          {detail.join(' | ')}
                        </Typography>
                      )}
                    </>
                  );
                })()}
              </Box>

              <TextField
                label="Observaciones"
                variant="outlined"
                multiline
                rows={3}
                value={formData.observaciones}
                onChange={(e) =>
                  handleFormChange("observaciones", e.target.value)
                }
                fullWidth
                InputProps={{
                  sx: {
                    color: '#000',
                    '& .MuiInputBase-inputMultiline': { color: '#000' }
                  }
                }}
                sx={{
                  ...textFieldStyles,
                  '& .MuiInputBase-inputMultiline': { color: '#000' }
                }}
              />

              {/* Botones */}
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "flex-end",
                  mt: 2,
                }}
              >
                <Button variant="outlined" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmitPayment}
                  disabled={!formData.idjugador || selectedMonths.length === 0}
                >
                  Crear Recibo{selectedMonths.length > 1 ? "s" : ""}
                </Button>
              </Box>
            </Box>
            </Paper>
          </Box>
        </Modal>

        {/* Modal de Comprobante */}
        <Modal
          open={showComprobanteModal}
          onClose={() => {
            setShowComprobanteModal(false);
            setReciboIdComprobante(null);
          }}
          aria-labelledby="comprobante-modal-title"
          aria-describedby="comprobante-modal-description"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "95%", sm: "90%", md: "85%", lg: "80%" },
              maxWidth: 1000,
              maxHeight: "95vh",
              bgcolor: "white",
              border: "2px solid #000",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <Typography variant="h6" gutterBottom>
              Comprobante de Pago
            </Typography>
            
            {/* Preview del PDF */}
            <Box
              sx={{
                flex: 1,
                minHeight: { xs: "300px", sm: "400px", md: "500px" },
                maxHeight: { xs: "calc(95vh - 200px)", sm: "calc(95vh - 200px)", md: "calc(95vh - 200px)" },
                border: "1px solid #ccc",
                borderRadius: 1,
                mb: 2,
                overflow: "auto",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {reciboIdComprobante && (
                <iframe
                  src={API_ENDPOINTS.COMPROBANTE_RECIBO(reciboIdComprobante)}
                  style={{
                    width: "100%",
                    height: "100%",
                    minHeight: "600px",
                    border: "none",
                  }}
                  title="Comprobante PDF"
                />
              )}
            </Box>

            {/* Botones de acción */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                mt: 2,
                flexShrink: 0, // Evitar que se compriman
                position: "sticky", // Fijar en la parte inferior
                bottom: 0,
                bgcolor: "white",
                pb: 1,
                pt: 1,
                zIndex: 10,
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={async () => {
                  try {
                    // Actualizar método en BD
                    await axios.put(
                      API_ENDPOINTS.UPDATE_COMPROBANTE_RECIBO(reciboIdComprobante),
                      { metodo_comprobante: "impresion" }
                    );
                    
                    // Imprimir PDF
                    const printWindow = window.open(
                      API_ENDPOINTS.COMPROBANTE_RECIBO(reciboIdComprobante),
                      "_blank"
                    );
                    if (printWindow) {
                      printWindow.onload = () => {
                        printWindow.print();
                      };
                    }
                    
                    toast.success("Comprobante listo para imprimir");
                    setShowComprobanteModal(false);
                    setReciboIdComprobante(null);
                  } catch (error) {
                    console.error("Error al imprimir:", error);
                    toast.error("Error al procesar la impresión");
                  }
                }}
              >
                Imprimir
              </Button>
              
              <Button
                variant="contained"
                sx={{
                  bgcolor: "#25D366",
                  "&:hover": {
                    bgcolor: "#20BA5A",
                  },
                }}
                onClick={async () => {
                  try {
                    // Actualizar método en BD
                    await axios.put(
                      API_ENDPOINTS.UPDATE_COMPROBANTE_RECIBO(reciboIdComprobante),
                      { metodo_comprobante: "whatsapp" }
                    );
                    
                    // Mostrar modal para ingresar número de WhatsApp
                    setShowWhatsAppModal(true);
                  } catch (error) {
                    console.error("Error al compartir por WhatsApp:", error);
                    toast.error("Error al compartir por WhatsApp");
                  }
                }}
              >
                Compartir por WhatsApp
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => {
                  setShowComprobanteModal(false);
                  setReciboIdComprobante(null);
                }}
              >
                Cerrar
              </Button>
            </Box>
          </Box>
        </Modal>

        {/* Modal para ingresar número de WhatsApp */}
        <Modal
          open={showWhatsAppModal}
          onClose={() => {
            setShowWhatsAppModal(false);
            setWhatsappNumber("");
          }}
          aria-labelledby="whatsapp-modal-title"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "90%", sm: "400px" },
              bgcolor: "white",
              border: "2px solid #25D366",
              boxShadow: 24,
              p: 3,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Ingresar número de WhatsApp
            </Typography>
            
            <Typography variant="body2" sx={{ mb: 2, color: "#666" }}>
              Ingresa el número de celular con código de país (ejemplo: 59899123456)
            </Typography>
            
            <TextField
              fullWidth
              label="Número de WhatsApp"
              placeholder="59899123456"
              value={whatsappNumber}
              onChange={(e) => {
                // Solo permitir números
                const value = e.target.value.replace(/\D/g, "");
                setWhatsappNumber(value);
              }}
              sx={{ 
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  "& input": {
                    color: "#000000 !important",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "#666666 !important",
                },
              }}
              autoFocus
            />
            
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setShowWhatsAppModal(false);
                  setWhatsappNumber("");
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                sx={{
                  bgcolor: "#25D366",
                  "&:hover": {
                    bgcolor: "#20BA5A",
                  },
                }}
                disabled={!whatsappNumber || whatsappNumber.length < 8}
                onClick={async () => {
                  try {
                    // Obtener URL del PDF
                    const comprobantePath = API_ENDPOINTS.COMPROBANTE_RECIBO(reciboIdComprobante);
                    const origin = window.location.origin.replace('https://', 'http://');
                    const pdfUrl = comprobantePath.startsWith('http') 
                      ? comprobantePath 
                      : `${origin}${comprobantePath}`;
                    
                    // Crear mensaje para WhatsApp
                    const mensaje = encodeURIComponent(
                      `Aquí tienes tu comprobante de pago del Club Yerbalito:\n\n${pdfUrl}`
                    );
                    
                    // Construir URL de WhatsApp con el número
                    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${mensaje}`;
                    
                    // Abrir WhatsApp
                    window.open(whatsappUrl, "_blank");
                    
                    toast.success("Abriendo WhatsApp...");
                    setShowWhatsAppModal(false);
                    setShowComprobanteModal(false);
                    setWhatsappNumber("");
                    setReciboIdComprobante(null);
                  } catch (error) {
                    console.error("Error al abrir WhatsApp:", error);
                    toast.error("Error al abrir WhatsApp");
                  }
                }}
              >
                Enviar
              </Button>
            </Box>
          </Box>
        </Modal>
      </div>
    </div>
  );
};

export default Payments;
