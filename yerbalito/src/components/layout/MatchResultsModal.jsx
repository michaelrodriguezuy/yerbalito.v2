import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  IconButton, 
  Chip,
  Divider,
  CircularProgress
} from '@mui/material';
import { 
  Close as CloseIcon, 
  DragIndicator as DragIcon,
  SportsSoccer as SoccerIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import './MatchResultsModal.css';

const MatchResultsModal = () => {
  const { user } = useContext(AuthContext);
  const [isVisible, setIsVisible] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 80 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFixtures();
  }, []);

  const fetchFixtures = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.FIXTURE);
      const fixturesData = response.data.fixture || [];
      
      // Procesar datos de fixture
      const processedFixtures = fixturesData.map(fixture => ({
        ...fixture,
        proximo_partido: fixture.proximo_partido ? JSON.parse(fixture.proximo_partido) : {},
        ultimo_resultado: fixture.ultimo_resultado ? JSON.parse(fixture.ultimo_resultado) : {}
      }));
      
      setFixtures(processedFixtures);
    } catch (error) {
      console.error('Error fetching fixtures:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseDown = (e) => {
    if (e.target.closest('.drag-handle')) {
      setIsDragging(true);
      const rect = e.currentTarget.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  if (!isVisible) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: position.y,
        left: position.x,
        zIndex: 1000,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none'
      }}
      onMouseDown={handleMouseDown}
    >
      <Paper
        elevation={8}
        sx={{
          width: 400,
          maxHeight: '80vh',
          overflow: 'auto',
          borderRadius: 2,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          border: '2px solid #4CAF50'
        }}
      >
        {/* Header */}
        <Box
          className="drag-handle"
          sx={{
            p: 2,
            backgroundColor: '#4CAF50',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'grab'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SoccerIcon />
            <Typography variant="h6" fontWeight="bold">
              Fixture del Club
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => setIsVisible(false)}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ p: 1.5, maxHeight: '80vh', overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress color="primary" />
            </Box>
          ) : (
            <>
              {/* Resultados Anteriores */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ color: '#ffffff', fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
                  ⚽ Resultados Anteriores
                </Typography>
                <Box sx={{ maxHeight: '200px', overflow: 'auto' }}>
                  {fixtures
                    .filter(f => f.ultimo_resultado && f.ultimo_resultado.resultado)
                    .map((fixture, index) => (
                    <Box key={index} sx={{ mb: 1, p: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Chip 
                          label={fixture.categoria_nombre} 
                          size="small" 
                          sx={{ backgroundColor: '#4CAF50', color: 'white', fontSize: '0.7rem' }}
                        />
                        <Typography variant="caption" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                          {fixture.ultimo_resultado.fecha ? new Date(fixture.ultimo_resultado.fecha).toLocaleDateString() : ''}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: 'white', fontSize: '0.8rem' }}>
                        {fixture.ultimo_resultado.resultado}
                      </Typography>
                    </Box>
                  ))}
                  {fixtures.filter(f => f.ultimo_resultado && f.ultimo_resultado.resultado).length === 0 && (
                    <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ p: 2 }}>
                      No hay resultados disponibles
                    </Typography>
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 2, backgroundColor: '#4CAF50' }} />

              {/* Próximos Partidos */}
              <Box>
                <Typography variant="subtitle1" sx={{ color: '#ffffff', fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
                  📅 Próximos Partidos
                </Typography>
                <Box sx={{ maxHeight: '300px', overflow: 'auto' }}>
                  {fixtures
                    .filter(f => f.proximo_partido && f.proximo_partido.equipos)
                    .map((fixture, index) => (
                    <Box key={index} sx={{ mb: 2, p: 2, backgroundColor: 'rgba(76, 175, 80, 0.1)', borderRadius: 1, border: '1px solid #4CAF50' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Chip 
                          label={fixture.categoria_nombre} 
                          size="small" 
                          sx={{ backgroundColor: '#4CAF50', color: 'white', fontSize: '0.7rem' }}
                        />
                        {fixture.horario && (
                          <Chip 
                            label={fixture.horario} 
                            size="small" 
                            variant="outlined"
                            sx={{ color: '#4CAF50', borderColor: '#4CAF50', fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                      
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                        {fixture.proximo_partido.equipos}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <ScheduleIcon sx={{ fontSize: '0.8rem', color: '#4CAF50' }} />
                        <Typography variant="caption" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
                          {fixture.proximo_partido.fecha ? new Date(fixture.proximo_partido.fecha).toLocaleDateString() : ''}
                          {fixture.proximo_partido.hora && ` - ${fixture.proximo_partido.hora}`}
                        </Typography>
                      </Box>
                      
                      {fixture.proximo_partido.lugar && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationIcon sx={{ fontSize: '0.8rem', color: '#4CAF50' }} />
                          <Typography variant="caption" sx={{ color: 'white', fontSize: '0.7rem' }}>
                            {fixture.proximo_partido.lugar}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  ))}
                  {fixtures.filter(f => f.proximo_partido && f.proximo_partido.equipos).length === 0 && (
                    <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ p: 2 }}>
                      No hay próximos partidos programados
                    </Typography>
                  )}
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default MatchResultsModal;