import React, { useState, useEffect, useContext } from 'react';
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
  Paper
} from '@mui/material';
import { API_ENDPOINTS } from '../../../config/api';
import axios from 'axios';
import Swal from 'sweetalert2';
import { AuthContext } from '../../../context/AuthContext';

const UserForm = ({ user, onClose, onSave }) => {
  const { user: currentUser } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    nombre: '',
    email: '', // mostrado como Email pero mapea a columna 'usuario'
    celular: '',
    password: '',
    rol: 'usuario',
    activo: true
  });

  const [loading, setLoading] = useState(false);

  // Estilos comunes para TextField
  const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      '& input': {
        color: '#000000 !important',
      }
    },
    '& .MuiInputLabel-root': {
      color: 'rgba(0, 0, 0, 0.6) !important',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(0, 0, 0, 0.23) !important',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(0, 0, 0, 0.4) !important',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(0, 0, 0, 0.6) !important',
    }
  };

  useEffect(() => {
    if (user) {
      // Mapear desde la base: email se almacena en columna 'usuario'
      setFormData({
        nombre: user.nombre || '',
        email: user.usuario || '',
        celular: user.celular || '',
        password: '',
        rol: user.rol || 'usuario',
        activo: user.estado === 1
      });
    }
  }, [user]);

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
      // Mapear los datos correctamente para el backend
      const userData = {
        nombre: formData.nombre,
        usuario: formData.email, // columna real en la base
        celular: formData.celular || '',
        password: formData.password,
        rol: formData.rol,
        estado: formData.activo ? 1 : 0
      };

      if (user) {
        // Actualizar usuario existente
        await axios.put(`${API_ENDPOINTS.USER}/${user.id_usuario}`, userData);
        Swal.fire('¡Actualizado!', 'Usuario actualizado correctamente.', 'success');
      } else {
        // Crear nuevo usuario
        await axios.post(API_ENDPOINTS.USER, userData);
        Swal.fire('¡Creado!', 'Usuario creado correctamente.', 'success');
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
      Swal.fire('Error', 'No se pudo guardar el usuario.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 500, margin: '0 auto' }}>
      <Typography variant="h6" gutterBottom>
        {user ? 'Editar Usuario' : 'Nuevo Usuario'}
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              sx={textFieldStyles}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              sx={textFieldStyles}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Celular"
              name="celular"
              type="text"
              value={formData.celular}
              onChange={handleChange}
              sx={textFieldStyles}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Contraseña"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required={!user}
              helperText={user ? "Dejar vacío para mantener la contraseña actual" : ""}
              sx={textFieldStyles}
            />
          </Grid>
          
          {currentUser?.rol === 1 && (
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Rol</InputLabel>
                <Select
                  name="rol"
                  value={formData.rol}
                  onChange={handleChange}
                  label="Rol"
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    color: '#000000',
                    '& .MuiInputLabel-root': {
                      color: 'rgba(0, 0, 0, 0.6)',
                    }
                  }}
                >
                  <MenuItem value="usuario">Usuario</MenuItem>
                  <MenuItem value="admin">Administrador</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}
          
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
                {loading ? 'Guardando...' : (user ? 'Actualizar' : 'Crear')}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default UserForm;