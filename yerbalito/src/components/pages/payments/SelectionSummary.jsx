import { memo } from "react";
import { Box, Typography } from "@mui/material";

const SelectionSummary = memo(({ selectedMonthsByYear, selectedPlayer, valoresByYear, valores }) => {
  const hasSelection = Object.keys(selectedMonthsByYear).some(
    year => selectedMonthsByYear[year]?.length > 0
  );

  if (hasSelection) {
    return (
      <Box sx={{ 
        p: 1, 
        backgroundColor: 'rgba(30, 135, 50, 0.08)', 
        borderRadius: '6px',
        border: '1px solid rgba(30, 135, 50, 0.2)'
      }}>
        <Typography variant="body2" sx={{ color: '#1E8732', fontWeight: 500, fontSize: '0.8rem' }}>
          💡 Meses seleccionados:{' '}
          {Object.entries(selectedMonthsByYear)
            .filter(([year, months]) => months && months.length > 0)
            .sort(([yearA], [yearB]) => parseInt(yearA) - parseInt(yearB))
            .map(([year, months]) => {
              const monthsStr = months
                .sort((a, b) => a - b)
                .map((m) => {
                  const names = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
                  return names[m - 1];
                })
                .join(', ');
              
              // Calcular monto para este año
              const yearValores = valoresByYear[year] || valores;
              const unit = yearValores?.cuota_club ?? 0;
              const yearTotal = months.length * unit;
              
              return `${year}: ${monthsStr} $${yearTotal}`;
            })
            .join(' | ')}
        </Typography>
      </Box>
    );
  }

  if (selectedPlayer) {
    return (
      <Box sx={{ 
        p: 1, 
        backgroundColor: 'rgba(255, 152, 0, 0.08)', 
        borderRadius: '6px',
        border: '1px solid rgba(255, 152, 0, 0.2)'
      }}>
        <Typography variant="body2" sx={{ color: '#f57c00', fontWeight: 500, fontSize: '0.8rem' }}>
          ⚠️ Selecciona al menos un mes para continuar
        </Typography>
      </Box>
    );
  }

  return null;
});

SelectionSummary.displayName = 'SelectionSummary';

export default SelectionSummary;

