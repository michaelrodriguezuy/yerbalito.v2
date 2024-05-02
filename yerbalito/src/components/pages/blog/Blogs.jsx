import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import "./Blog.css";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import CardActionArea from "@mui/material/CardActionArea";
import CardActions from "@mui/material/CardActions";

import Pagination from "@mui/material/Pagination";

import Box from "@mui/material/Box";
import { Avatar } from "@mui/material";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Blogs = () => {
  const random = Math.floor(Math.random() * 100);
  const [avatarRandom, setAvatarRandom] = useState(random);

  const [posts, setPosts] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = currentPage * itemsPerPage;


  const MAX_DESCRIPTION_LENGTH = 100;

  const fetchPost = async () => {
    try {
      const response = await axios.get("http://localhost:3001/posts");
      const data = response.data;

      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts: ", error);
    }
  };

  useEffect(() => {
    setAvatarRandom(Math.floor(Math.random() * 100));
    fetchPost();
  }, []);

  return (
    <div className="container" style={{ textAlign: "center", maxHeight: "100vh", overflowY: "auto" }}>

      <Typography
        variant="h2"
        component="h2"
        gutterBottom
        style={{ margin: "20px 0" }}
      >
        Blog
      </Typography>

      <Container maxWidth="lg" className="blogContainer">
        <Grid container spacing={3}>
          {/* consumo de posts */}
          {posts.posts && posts.posts.length > 0 ? (
            posts.posts.slice(startIndex, endIndex).map((post) => (
              <Grid item xs={12} sm={6} md={4} key={post.idblog}>
                <Card className="card" sx={{ display: 'flex', flexDirection: 'column', minHeight: 400 }}>
                  <CardActionArea style={{ flex: 1 }}>
                    <Link to={`/itemBlog/${post.idblog}`}>
                      <CardMedia
                        className="cardMedia"
                        sx={{ height: post.description.length > MAX_DESCRIPTION_LENGTH ? 180 : 240 }}
                        image={post.urlImg}
                        title={post.title}
                      />
                    </Link>

                        </CardActionArea>
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="div">
                        {post.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {post.description.length > MAX_DESCRIPTION_LENGTH
                          ? `${post.description.substring(
                              0,
                              MAX_DESCRIPTION_LENGTH
                            )}...`
                          : post.description}
                      </Typography>
                    </CardContent>

                  <CardActions className="cardActions">
                    <Box className="author">
                      <Avatar
                        src={`https://randomuser.me/api/portraits/men/${avatarRandom}.jpg`}
                      />
                      <Box ml={2}>
                        <Typography variant="subtitle2" component="p">
                          {post.author}
                        </Typography>
                        <Typography
                          variant="subtitle2"
                          color="textSecondary"
                          component="p"
                        >
                          {post.date}
                        </Typography>
                      </Box>
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <p>Cargando posts...</p>
          )}

          {/* Soccer player training in soccer field by Jacob Lund Photography from <a href="https://thenounproject.com/photo/soccer-player-training-in-soccer-field-0WGQr0/" target="_blank" title="Soccer player training in soccer field Photo">Noun Project</a> (CC BY-NC-ND 2.0) */}
          {/* Young soccer team having fun during practice on soccer field by Jacob Lund Photography from <a href="https://thenounproject.com/photo/young-soccer-team-having-fun-during-practice-on-soccer-field-0VrAY0/" target="_blank" title="Young soccer team having fun during practice on soccer field Photo">Noun Project</a> (CC BY-NC-ND 2.0) */}
          {/* Cropped shot of soccer player’s foot on top of soccer ball by Jacob Lund Photography from <a href="https://thenounproject.com/photo/cropped-shot-of-soccer-players-foot-on-top-of-soccer-ball-43qMP0/" target="_blank" title="Cropped shot of soccer player’s foot on top of soccer ball Photo">Noun Project</a> (CC BY-NC-ND 2.0) */}
          {/* boys playing soccer in street by Scopio from <a href="https://thenounproject.com/photo/boys-playing-soccer-in-street-4jder0/" target="_blank" title="boys playing soccer in street Photo">Noun Project</a> (CC BY-NC-ND 2.0) */}
          {/* Skilled soccer player kicking ball by Jacob Lund Photography from <a href="https://thenounproject.com/photo/skilled-soccer-player-kicking-ball-bDnqK5/" target="_blank" title="Skilled soccer player kicking ball Photo">Noun Project</a> (CC BY-NC-ND 2.0) */}
          {/* One vibrant pink soccer ball by raulince from <a href="https://thenounproject.com/photo/one-vibrant-pink-soccer-ball-0PDEe0/" target="_blank" title="One vibrant pink soccer ball Photo">Noun Project</a> (CC BY-NC-ND 2.0) */}
          {/* Boy playing with soccer ball in the park grass by Jacob Lund Photography from <a href="https://thenounproject.com/photo/boy-playing-with-soccer-ball-in-the-park-grass-4ZexxA/" target="_blank" title="Boy playing with soccer ball in the park grass Photo">Noun Project</a> (CC BY-NC-ND 2.0) */}
          {/* <a href="https://www.freepik.es/foto-gratis/herramientas-deportivas_18415697.htm#fromView=search&page=1&position=22&uuid=3f5d8f04-e6ae-4712-b3fa-fbcd4724885d?log-in=google">Imagen de rawpixel.com en Freepik</a> */}
          {/* <a href="https://www.freepik.es/foto-gratis/grupo-atletas-diversos-sentados-juntos_19068755.htm#fromView=search&page=1&position=40&uuid=3f5d8f04-e6ae-4712-b3fa-fbcd4724885d">Imagen de rawpixel.com en Freepik</a> */}
        </Grid>
        <Box my={4} className="paginationContainer">
          <Pagination
            count={
              posts.posts ? Math.ceil(posts.posts.length / itemsPerPage) : 0
            }
            page={currentPage}
            onChange={(event, page) => setCurrentPage(page)}
          />
        </Box>
      </Container>
    </div>
  );
};

export default Blogs;

