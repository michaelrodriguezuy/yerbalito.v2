import React from 'react';
import { Box, Typography, Grid, Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const QuotaSelector = React.memo(({ paidQuotas, selectedQuotas, onQuotaToggle, currentYear, selectedPlayer, pagarAmbasCuotas }) => {
  const quotas = [1, 2];

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="subtitle2" gutterBottom sx={{ color: '#000', mb: 1 }}>
        Selecciona las cuotas a pagar ({currentYear})
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 1.5 }}>
        {quotas.map((quota) => {
          const isPaid = paidQuotas.includes(quota);
          const isSelected = selectedQuotas.includes(quota);
          
          return (
            <Grid item xs={6} key={quota}>
              <Chip
                label={`Cuota ${quota}/2`}
                disabled={isPaid || !selectedPlayer || pagarAmbasCuotas}
                icon={
                  isPaid ? (
                    <CheckCircleIcon sx={{ fontSize: '18px !important' }} />
                  ) : isSelected ? (
                    <CheckCircleIcon sx={{ fontSize: '18px !important' }} />
                  ) : undefined
                }
                onClick={() => onQuotaToggle(quota)}
                sx={{
                  width: '100%',
                  height: '42px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: isPaid || !selectedPlayer || pagarAmbasCuotas ? 'not-allowed' : 'pointer',
                  border: '2px solid',
                  transition: 'all 0.2s ease-in-out',
                  
                  // Cuotas ya pagadas (verde con check)
                  ...(isPaid && {
                    backgroundColor: 'rgba(30, 135, 50, 0.15)',
                    borderColor: '#1E8732',
                    color: '#1E8732',
                    '&:hover': {
                      backgroundColor: 'rgba(30, 135, 50, 0.15)',
                    },
                  }),
                  
                  // Cuotas seleccionadas (verde sólido)
                  ...(isSelected && !isPaid && {
                    backgroundColor: '#1E8732',
                    borderColor: '#1E8732',
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: '#176a28',
                      transform: 'scale(1.02)',
                    },
                  }),
                  
                  // Cuotas disponibles (gris claro)
                  ...(!isSelected && !isPaid && selectedPlayer && !pagarAmbasCuotas && {
                    backgroundColor: '#f5f5f5',
                    borderColor: '#cccccc',
                    color: '#000000',
                    '&:hover': {
                      backgroundColor: '#e8e8e8',
                      borderColor: '#1E8732',
                      transform: 'scale(1.02)',
                    },
                  }),
                  
                  // Sin jugador seleccionado o modo "pagar ambas"
                  ...((!selectedPlayer || pagarAmbasCuotas) && !isPaid && {
                    backgroundColor: '#f0f0f0',
                    borderColor: '#d0d0d0',
                    color: '#a0a0a0',
                    opacity: 0.6,
                  }),
                }}
              />
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
});

export default QuotaSelector;

