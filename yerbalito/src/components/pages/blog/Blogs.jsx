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
import { Avatar, Paper, CircularProgress } from "@mui/material";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Blogs = () => {
  const random = Math.floor(Math.random() * 100);
  const [avatarRandom, setAvatarRandom] = useState(random);
  const [posts, setPosts] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = currentPage * itemsPerPage;

  const MAX_DESCRIPTION_LENGTH = 100;

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3001/posts");
      const data = response.data;
      setPosts(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching posts: ", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    setAvatarRandom(Math.floor(Math.random() * 100));
    fetchPost();
  }, []);

  return (
    <div className="page-container" style={{ textAlign: "center", overflowY: "auto" }}>
      
      <Typography
          variant="h2"
          component="h2"
          gutterBottom
          style={{ 
            margin: "20px 0",
            color: "white",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)" 
          }}
        >
          NUESTRO BLOG
        </Typography>

        
          <Container maxWidth="lg" className="blogContainer">
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                <CircularProgress style={{ color: "white" }} />
              </Box>
            ) : (
              <>
                <Grid container spacing={3}>
                  {posts.posts && posts.posts.length > 0 ? (
                    posts.posts.slice(startIndex, endIndex).map((post) => (
                      <Grid item xs={12} sm={6} md={4} key={post.idblog}>
                        <Card 
                          className="card" 
                          sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            minHeight: 400,
                            backgroundColor: 'rgba(40, 40, 40, 0.85)',
                            color: 'white',
                            borderRadius: '8px',
                            transition: '0.3s',
                            '&:hover': {
                              transform: 'translateY(-5px)',
                              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)'
                            }
                          }}
                        >
                          <CardActionArea style={{ flex: 1 }}>
                            <Link to={`/itemBlog/${post.idblog}`}>
                              <CardMedia
                                className="cardMedia"
                                sx={{ 
                                  height: post.description.length > MAX_DESCRIPTION_LENGTH ? 180 : 240,
                                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                                }}
                                image={post.urlImg}
                                title={post.title}
                              />
                            </Link>
                          </CardActionArea>
                          <CardContent sx={{ backgroundColor: 'transparent', color: 'white' }}>
                            <Typography gutterBottom variant="h5" component="div" sx={{ color: 'white' }}>
                              {post.title}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                              {post.description.length > MAX_DESCRIPTION_LENGTH
                                ? `${post.description.substring(0, MAX_DESCRIPTION_LENGTH)}...`
                                : post.description}
                            </Typography>
                          </CardContent>

                          <CardActions className="cardActions" sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                            <Box className="author">
                              <Avatar
                                src={`https://randomuser.me/api/portraits/men/${avatarRandom}.jpg`}
                              />
                              <Box ml={2}>
                                <Typography variant="subtitle2" component="p" sx={{ color: 'white' }}>
                                  {post.author}
                                </Typography>
                                <Typography
                                  variant="subtitle2"
                                  component="p"
                                  sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
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
                    <Box width="100%" textAlign="center" py={5}>
                      <Typography variant="h6" color="white">No se encontraron artículos</Typography>
                    </Box>
                  )}
                </Grid>
                <Box my={4} className="paginationContainer">
                  <Pagination
                    count={posts.posts ? Math.ceil(posts.posts.length / itemsPerPage) : 0}
                    page={currentPage}
                    onChange={(event, page) => setCurrentPage(page)}
                    sx={{
                      '& .MuiPaginationItem-root': {
                        color: 'white',
                        '&.Mui-selected': {
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        }
                      }
                    }}
                  />
                </Box>
              </>
            )}
          </Container>
        
      
    </div>
  );
};

export default Blogs;

