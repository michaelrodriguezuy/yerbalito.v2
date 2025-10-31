import React, { useState, useEffect } from 'react';
import { Typography, Box } from '@mui/material';

const TypingWelcome = () => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const fullText = "¡Hola, bienvenido al club de baby fútbol Yerbalito!!!";
  
  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + fullText[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 100); // Velocidad de escritura
      
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, fullText]);

  return (
    <Box 
      sx={{ 
        textAlign: 'center',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1rem',
        background: 'transparent'
      }}
    >
      <Typography
        variant="h2"
        component="h1"
        sx={{
          color: 'white',
          fontSize: { xs: '2rem', md: '3rem', lg: '4rem' },
          fontWeight: 'bold',
          textShadow: '3px 3px 6px rgba(0, 0, 0, 0.8)',
          marginBottom: '2rem',
          lineHeight: 1.2,
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          maxWidth: '800px',
          width: '100%',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}
      >
        {displayedText}
        <span 
          style={{ 
            animation: 'blink 1s infinite',
            color: '#4CAF50'
          }}
        >
          |
        </span>
      </Typography>
      
      {/* <Typography
        variant="h5"
        sx={{
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: { xs: '1.2rem', md: '1.5rem' },
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)',
          maxWidth: '800px',
          lineHeight: 1.4
        }}
      >
        Un lugar donde los sueños deportivos de nuestros niños cobran vida
      </Typography> */}
      
      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </Box>
  );
};

export default TypingWelcome;
