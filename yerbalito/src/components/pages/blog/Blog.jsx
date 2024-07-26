import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography } from "@mui/material";

const Blog = () => {
  const { id } = useParams();

  const [blog, setBlog] = useState(null);

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
    <div className="container" style={{ textAlign: "center",maxHeight: "100vh", overflowY: "auto"  }}>
      <>
        {blog ? (
          <>
          <Box sx={{ maxWidth: 600, margin: "0 auto", padding: 2 }}>
            <Typography variant="h2" gutterBottom>
              {blog.title}
            </Typography>
            <Typography variant="subtitle2" gutterBottom>
              Autor: {blog.author}, el {new Date(blog.date).toLocaleDateString()}
            </Typography>

            <img src={blog.urlImg} alt="Blog" style={{ width: "80%", borderRadius: 8, marginTop: 16 }} />

          </Box>
            <Typography variant="body1" gutterBottom style={{ maxWidth: 800, margin: "0 auto", textAlign:"justify" }}>
              {blog.description}
            </Typography>
          </>
        ) : (
          <p>Cargando...</p>
        )}
      </>
    </div>
  );
};

export default Blog;
