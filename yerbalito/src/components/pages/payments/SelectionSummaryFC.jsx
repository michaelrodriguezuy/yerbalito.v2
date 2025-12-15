import React from 'react';
import { Box, Typography } from '@mui/material';

const SelectionSummaryFC = React.memo(({ selectedQuotas, selectedPlayer, valores, currentYear, pagarAmbasCuotas, valoresByYear }) => {
  const hasSelectedQuotas = selectedQuotas.length > 0 || pagarAmbasCuotas;

  const getQuotasText = () => {
    if (pagarAmbasCuotas) {
      return "Todas las cuotas pendientes";
    }
    return selectedQuotas.map(q => `Cuota ${q}/2`).join(', ');
  };

  const calculateTotal = () => {
    // Obtener el valor del fondo de campeonato para el año seleccionado
    const yearValores = valoresByYear[currentYear] || valores;
    const fondoTotal = yearValores?.fondo_campeonato || 0;
    const montoPorCuota = fondoTotal / 2;
    
    if (pagarAmbasCuotas) {
      return fondoTotal;
    }
    return selectedQuotas.length * montoPorCuota;
  };

  return (
    <>
      {hasSelectedQuotas && (
        <Box sx={{ 
          p: 1,
          backgroundColor: 'rgba(30, 135, 50, 0.08)', 
          borderRadius: '8px',
          border: '1px solid rgba(30, 135, 50, 0.2)'
        }}>
          <Typography variant="body2" sx={{ color: '#1E8732', fontWeight: 500 }}>
            💡 {getQuotasText()} del año {currentYear}: ${calculateTotal()}
          </Typography>
        </Box>
      )}
      
      {selectedPlayer && !hasSelectedQuotas && (
        <Box sx={{ 
          p: 1,
          backgroundColor: 'rgba(255, 152, 0, 0.08)', 
          borderRadius: '8px',
          border: '1px solid rgba(255, 152, 0, 0.2)'
        }}>
          <Typography variant="body2" sx={{ color: '#f57c00', fontWeight: 500 }}>
            ⚠️ Selecciona al menos una cuota para continuar
          </Typography>
        </Box>
      )}
    </>
  );
});

export default SelectionSummaryFC;

