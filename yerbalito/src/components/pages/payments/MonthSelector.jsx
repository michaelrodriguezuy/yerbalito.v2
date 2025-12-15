import { memo } from "react";
import { Grid, Chip, Box, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const MonthSelector = memo(({ 
  availableMonths,
  paidMonths,
  selectedMonths,
  onMonthToggle,
  currentYear,
  selectedPlayer 
}) => {
  const monthNamesShort = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="subtitle2" gutterBottom sx={{ color: '#000', mb: 1, fontSize: '0.875rem' }}>
        Selecciona los meses a pagar ({currentYear})
      </Typography>
      
      <Grid container spacing={1} sx={{ mb: 1.5 }}>
        {availableMonths
          .sort((a, b) => a - b)
          .map((month) => {
            const isPaid = paidMonths.includes(month);
            const isSelected = selectedMonths.includes(month);
            
            return (
              <Grid item xs={3} sm={2.4} md={2} lg={1.5} key={month}>
                <Chip
                  label={monthNamesShort[month - 1]}
                  disabled={isPaid || !selectedPlayer}
                  icon={
                    isPaid ? (
                      <CheckCircleIcon sx={{ fontSize: '16px !important' }} />
                    ) : isSelected ? (
                      <CheckCircleIcon sx={{ fontSize: '16px !important' }} />
                    ) : undefined
                  }
                  onClick={() => !isPaid && selectedPlayer && onMonthToggle(month)}
                  sx={{
                    width: '100%',
                    height: '36px',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: isPaid || !selectedPlayer ? 'not-allowed' : 'pointer',
                    border: '2px solid',
                    transition: 'all 0.2s ease-in-out',
                    
                    ...(isPaid && {
                      backgroundColor: '#f5f5f5',
                      borderColor: '#e0e0e0',
                      color: '#9e9e9e',
                      '& .MuiChip-icon': {
                        color: '#66bb6a',
                      },
                    }),
                    
                    ...(!isPaid && isSelected && {
                      backgroundColor: '#1E8732',
                      borderColor: '#1E8732',
                      color: '#ffffff',
                      fontWeight: 600,
                      boxShadow: '0 2px 4px rgba(30, 135, 50, 0.3)',
                      '& .MuiChip-icon': {
                        color: '#ffffff',
                      },
                      '&:hover': {
                        backgroundColor: '#176a28',
                        borderColor: '#176a28',
                        boxShadow: '0 4px 8px rgba(30, 135, 50, 0.4)',
                      },
                    }),
                    
                    ...(!isPaid && !isSelected && selectedPlayer && {
                      backgroundColor: '#ffffff',
                      borderColor: '#d0d0d0',
                      color: '#333333',
                      '&:hover': {
                        backgroundColor: '#f9f9f9',
                        borderColor: '#1E8732',
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                      },
                    }),
                    
                    ...(!selectedPlayer && {
                      backgroundColor: '#fafafa',
                      borderColor: '#e0e0e0',
                      color: '#bdbdbd',
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

MonthSelector.displayName = 'MonthSelector';

export default MonthSelector;

