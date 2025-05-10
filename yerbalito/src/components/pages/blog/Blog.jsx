import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography, Paper, Divider } from "@mui/material";

const Blog = () => {
  const { id } = useParams();

  const [blog, setBlog] = useState(null);

  // Función para formatear el texto en párrafos
  const formatTextToParagraphs = (text) => {
    // Si no hay texto, devuelve un array vacío
    if (!text) return [];
    
    // Dividir por doble salto de línea o por punto seguido de espacio
    const paragraphs = text.split(/\n\n|\.\s+/);
    
    // Filtrar párrafos vacíos y agregar punto final si no lo tienen
    return paragraphs
      .filter(paragraph => paragraph.trim().length > 0)
      .map(paragraph => {
        // Asegurarse de que cada párrafo termine con un punto si no termina con signo de puntuación
        if (!/[.!?]$/.test(paragraph.trim())) {
          return paragraph.trim() + '.';
        }
        return paragraph.trim();
      });
  };

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/posts/${id}`);

        if (!response.data.post) {
          console.error("Blog no encontrado");
          return;
        } else {
          setBlog(response.data.post);
        }
      } catch (error) {
        console.error("Error fetching blog: ", error);
      }
    };
    fetchBlog();
  }, [id]);

  return (
    <div className="page-container" style={{ textAlign: "center", overflowY: "auto" }}>
      {blog ? (
        <Paper 
          elevation={3} 
          className="content-paper"
          style={{ 
            backgroundColor: "rgba(0, 0, 0, 0.7)", 
            padding: "30px", 
            maxWidth: "90%", 
            margin: "0 auto",
            color: "white" 
          }}
        >
          <Typography 
            variant="h2" 
            gutterBottom
            style={{ 
              color: "white",
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)"
            }}
          >
            {blog.title}
          </Typography>
          
          <Typography 
            variant="subtitle2" 
            gutterBottom
            style={{ 
              color: "rgba(255, 255, 255, 0.8)"
            }}
          >
            Autor: {blog.author}, el {new Date(blog.date).toLocaleDateString()}
          </Typography>

          <Box 
            sx={{ 
              margin: "30px auto", 
              width: "80%", 
              maxWidth: "600px",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)"
            }}
          >
            <img 
              src={blog.urlImg} 
              alt={blog.title} 
              style={{ 
                width: "100%", 
                display: "block",
                borderRadius: "8px" 
              }} 
            />
          </Box>

          <Box 
            sx={{ 
              maxWidth: "800px", 
              margin: "30px auto", 
              textAlign: "justify",
            }}
          >
            {formatTextToParagraphs(blog.description).map((paragraph, index) => (
              <Typography 
                key={index}
                variant="body1" 
                paragraph
                style={{ 
                  marginBottom: "20px",
                  lineHeight: "1.8",
                  color: "white",
                  fontSize: "1.1rem",
                  textIndent: "2em"
                }}
              >
                {paragraph}
              </Typography>
            ))}
          </Box>
        </Paper>
      ) : (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="300px"
        >
          <Typography variant="h5" color="white">Cargando artículo...</Typography>
        </Box>
      )}
    </div>
  );
};

export default Blog;
