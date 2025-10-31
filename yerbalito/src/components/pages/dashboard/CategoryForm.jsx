import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Grid,
  Paper,
  Switch,
  FormControlLabel
} from '@mui/material';
import { API_ENDPOINTS } from '../../../config/api';
import axios from 'axios';
import Swal from 'sweetalert2';

const CategoryForm = ({ category, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nombre_categoria: '',
    tecnico: '',
    telefono: '',
    edad: '',
    visible: true
  });

  const [loading, setLoading] = useState(false);

  // Estilos comunes para TextField
  const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      '& input': {
        color: '#000000 !important',
      }
    },
    '& .MuiInputLabel-root': {
      color: 'rgba(0, 0, 0, 0.6) !important',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#4CAF50 !important',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#4CAF50 !important',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#4CAF50 !important',
    }
  };

  useEffect(() => {
    if (category) {
      setFormData({
        nombre_categoria: category.nombre_categoria || '',
        tecnico: category.tecnico || '',
        telefono: category.telefono || '',
        edad: category.edad || '',
        visible: category.visible !== undefined ? category.visible === 1 : true
      });
    }
  }, [category]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSend = {
        ...formData,
        visible: formData.visible ? 1 : 0
      };

      if (category) {
        // Actualizar categoría existente
        await axios.put(`${API_ENDPOINTS.CATEGORIES}/${category.idcategoria}`, dataToSend);
        Swal.fire('¡Actualizado!', 'Categoría actualizada correctamente.', 'success');
      } else {
        // Crear nueva categoría
        await axios.post(API_ENDPOINTS.CATEGORIES, dataToSend);
        Swal.fire('¡Creado!', 'Categoría creada correctamente.', 'success');
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving category:', error);
      Swal.fire('Error', 'No se pudo guardar la categoría.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 500, margin: '0 auto' }}>
      <Typography variant="h6" gutterBottom>
        {category ? 'Editar Categoría' : 'Nueva Categoría'}
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nombre de la categoría"
              name="nombre_categoria"
              value={formData.nombre_categoria}
              onChange={handleChange}
              required
              sx={textFieldStyles}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Técnico"
              name="tecnico"
              value={formData.tecnico}
              onChange={handleChange}
              sx={textFieldStyles}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Teléfono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              sx={textFieldStyles}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Edad"
              name="edad"
              value={formData.edad}
              onChange={handleChange}
              sx={textFieldStyles}
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.visible}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    visible: e.target.checked
                  }))}
                  name="visible"
                />
              }
              label="Visible al público"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? 'Guardando...' : (category ? 'Actualizar' : 'Crear')}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default CategoryForm;