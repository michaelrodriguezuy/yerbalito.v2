import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import { API_ENDPOINTS } from "../../../config/api";
import { toast } from "sonner";

const NoticiaForm = ({ noticia, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    titulo: "",
    contenido: "",
    autor: "",
    imagen: "",
    visible: 1,
  });

  useEffect(() => {
    if (noticia) {
      setFormData({
        titulo: noticia.titulo || "",
        contenido: noticia.contenido || "",
        autor: noticia.autor || "",
        imagen: noticia.imagen || "",
        visible: noticia.visible !== undefined ? noticia.visible : 1,
      });
    }
  }, [noticia]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.titulo || !formData.contenido || !formData.autor) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    try {
      if (noticia) {
        // Actualizar noticia existente
        await axios.put(API_ENDPOINTS.NOTICIAS_UPDATE(noticia.idnoticia), formData);
        toast.success("Noticia actualizada correctamente");
      } else {
        // Crear nueva noticia
        await axios.post(API_ENDPOINTS.NOTICIAS_CREATE, formData);
        toast.success("Noticia creada correctamente");
      }
      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving noticia:", error);
      toast.error("Error al guardar la noticia");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        {noticia ? "Editar Noticia" : "Nueva Noticia"}
      </Typography>

      <TextField
        label="Título *"
        value={formData.titulo}
        onChange={(e) => handleChange("titulo", e.target.value)}
        fullWidth
        required
        margin="normal"
        sx={{
          "& .MuiOutlinedInput-root": {
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            "& input": { color: "#000000 !important" },
          },
          "& .MuiInputLabel-root": {
            color: "rgba(0, 0, 0, 0.7) !important",
          },
        }}
      />

      <TextField
        label="Contenido *"
        value={formData.contenido}
        onChange={(e) => handleChange("contenido", e.target.value)}
        fullWidth
        required
        multiline
        rows={8}
        margin="normal"
        sx={{
          "& .MuiOutlinedInput-root": {
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            "& textarea": { color: "#000000 !important" },
          },
          "& .MuiInputLabel-root": {
            color: "rgba(0, 0, 0, 0.7) !important",
          },
        }}
      />

      <TextField
        label="Autor *"
        value={formData.autor}
        onChange={(e) => handleChange("autor", e.target.value)}
        fullWidth
        required
        margin="normal"
        sx={{
          "& .MuiOutlinedInput-root": {
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            "& input": { color: "#000000 !important" },
          },
          "& .MuiInputLabel-root": {
            color: "rgba(0, 0, 0, 0.7) !important",
          },
        }}
      />

      <TextField
        label="URL de Imagen"
        value={formData.imagen}
        onChange={(e) => handleChange("imagen", e.target.value)}
        fullWidth
        margin="normal"
        placeholder="https://ejemplo.com/imagen.jpg"
        sx={{
          "& .MuiOutlinedInput-root": {
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            "& input": { color: "#000000 !important" },
          },
          "& .MuiInputLabel-root": {
            color: "rgba(0, 0, 0, 0.7) !important",
          },
        }}
      />

      <FormControl fullWidth margin="normal">
        <InputLabel sx={{ color: "rgba(0, 0, 0, 0.7) !important" }}>
          Visibilidad
        </InputLabel>
        <Select
          value={formData.visible}
          onChange={(e) => handleChange("visible", e.target.value)}
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            color: "#000000",
          }}
        >
          <MenuItem value={1}>Visible</MenuItem>
          <MenuItem value={0}>Oculto</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 3 }}>
        <Button variant="outlined" onClick={onClose}>
          Cancelar
        </Button>
        <Button 
          type="submit" 
          variant="contained"
          sx={{
            backgroundColor: "#4CAF50",
            "&:hover": { backgroundColor: "#45a049" }
          }}
        >
          {noticia ? "Actualizar" : "Crear"}
        </Button>
      </Box>
    </Box>
  );
};

export default NoticiaForm;

