import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import GitHubIcon from "@mui/icons-material/GitHub";
import FacebookIcon from "@mui/icons-material/Facebook";
import XIcon from "@mui/icons-material/X";
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

// import MainFeaturedPost from "./MainFeaturedPost";
// import FeaturedPost from "./FeaturedPost";
// import Main from "./Main";
// import Sidebar from "./Sidebar";

// import post1 from "./blog-post.1.md";
// import post2 from "./blog-post.2.md";
// import post3 from "./blog-post.3.md";
// import post4 from "./blog-post.4.md";

// const sections = [
//   { title: "Technology", url: "#" },
//   { title: "Design", url: "#" },
//   { title: "Culture", url: "#" },
//   { title: "Business", url: "#" },
//   { title: "Politics", url: "#" },
//   { title: "Opinion", url: "#" },
//   { title: "Science", url: "#" },
//   { title: "Health", url: "#" },
//   { title: "Style", url: "#" },
//   { title: "Travel", url: "#" },
// ];

/* const mainFeaturedPost = {
  title: "Title of a longer featured blog post",
  description:
    "Multiple lines of text that form the lede, informing new readers quickly and efficiently about what's most interesting in this post's contents.",
  image: "https://source.unsplash.com/random?wallpapers",
  imageText: "main image description",
  linkText: "Continue reading…",
}; */

/* const featuredPosts = [
  {
    title: "Featured post",
    date: "Nov 12",
    description:
      "This is a wider card with supporting text below as a natural lead-in to additional content.",
    image: "https://source.unsplash.com/random?wallpapers",
    imageLabel: "Image Text",
  },
  {
    title: "Post title",
    date: "Nov 11",
    description:
      "This is a wider card with supporting text below as a natural lead-in to additional content.",
    image: "https://source.unsplash.com/random?wallpapers",
    imageLabel: "Image Text",
  },
]; */

// const posts = [post1, post2, post3];

/* const sidebar = {
  title: "About",
  description:
    "Etiam porta sem malesuada magna mollis euismod. Cras mattis consectetur purus sit amet fermentum. Aenean lacinia bibendum nulla sed consectetur.",
  archives: [
    { title: "March 2020", url: "#" },
    { title: "February 2020", url: "#" },
    { title: "January 2020", url: "#" },
    { title: "November 1999", url: "#" },
    { title: "October 1999", url: "#" },
    { title: "September 1999", url: "#" },
    { title: "August 1999", url: "#" },
    { title: "July 1999", url: "#" },
    { title: "June 1999", url: "#" },
    { title: "May 1999", url: "#" },
    { title: "April 1999", url: "#" },
  ],
  social: [
    { name: "GitHub", icon: GitHubIcon },
    { name: "X", icon: XIcon },
    { name: "Facebook", icon: FacebookIcon },
  ],
}; */

const Blogs = () => {
  const random = Math.floor(Math.random() * 100);
  const [avatarRandom, setAvatarRandom] = useState(random);

  const [posts, setPosts] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = currentPage * itemsPerPage;

  // const [paginas, setPaginas] = useState(0);
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

          {/* 
          <Grid item xs={12} sm={6} md={4}>
            <Card className="card">
              <CardActionArea>
                <CardMedia
                  className="cardMedia"
                  sx={{ height: 180 }}
                  image="https://thumbnails.production.thenounproject.com/B1svY3YJKszMm4QXg5qaEAn5tME=/fit-in/250x250/photos.production.thenounproject.com/free/photos/free-0VrAY0_1y4ADF4.jpg"
                  title="green iguana"
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    Articulo 1
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Lizards are a widespread group of squamate reptiles, with
                    over 6,000 species, ranging across all continents except
                    Antarctica
                  </Typography>
                </CardContent>
              </CardActionArea>

              <CardActions className="cardActions">
                <Box className="author">
                  <Avatar
                    src={`https://randomuser.me/api/portraits/men/${avatarRandom}.jpg`}
                  />
                  <Box ml={2}>
                    <Typography variant="subtitle2" component="p">
                      Juan Carlos Elgarte
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      color="textSecondary"
                      component="p"
                    >
                      27/04/2024
                    </Typography>
                  </Box>
                </Box>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card className="card">
              <CardActionArea>
                <CardMedia
                  className="cardMedia"
                  sx={{ height: 180 }}
                  image="https://thumbnails.production.thenounproject.com/BmhhH2aqIQ0YUq3ceDYl73KA9Rw=/fit-in/250x250/photos.production.thenounproject.com/free/photos/free-43qMP0_1xaOmDl.jpg"
                  title="green iguana"
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    Articulo 1
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Lizards are a widespread group of squamate reptiles, with
                    over 6,000 species, ranging across all continents except
                    Antarctica
                  </Typography>
                </CardContent>
              </CardActionArea>

              <CardActions className="cardActions">
                <Box className="author">
                  <Avatar
                    src={`https://randomuser.me/api/portraits/men/${avatarRandom}.jpg`}
                  />
                  <Box ml={2}>
                    <Typography variant="subtitle2" component="p">
                      Juan Carlos Elgarte
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      color="textSecondary"
                      component="p"
                    >
                      27/04/2024
                    </Typography>
                  </Box>
                </Box>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card className="card">
              <CardActionArea>
                <CardMedia
                  className="cardMedia"
                  sx={{ height: 180 }}
                  image="https://thumbnails.production.thenounproject.com/4188Gh04ZtyVkd4KaZmyr1mLPgE=/fit-in/250x250/photos.production.thenounproject.com/free/photos/free-bDnqK5_l21gDak.jpg"
                  title="green iguana"
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    Articulo 1
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Lizards are a widespread group of squamate reptiles, with
                    over 6,000 species, ranging across all continents except
                    Antarctica
                  </Typography>
                </CardContent>
              </CardActionArea>

              <CardActions className="cardActions">
                <Box className="author">
                  <Avatar
                    src={`https://randomuser.me/api/portraits/men/${avatarRandom}.jpg`}
                  />
                  <Box ml={2}>
                    <Typography variant="subtitle2" component="p">
                      Juan Carlos Elgarte
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      color="textSecondary"
                      component="p"
                    >
                      27/04/2024
                    </Typography>
                  </Box>
                </Box>
              </CardActions>
            </Card>
          </Grid> */}

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
{
  /* <Container maxWidth="lg">
    <CssBaseline />
     < title="Blog" sections={sections} /> 

    <main>
      <MainFeaturedPost post={mainFeaturedPost} /> 
      <Grid container spacing={4}>
        {featuredPosts.map((post) => (
          <FeaturedPost key={post.title} post={post} />
        ))} 
      </Grid>
      <Grid container spacing={5} sx={{ mt: 3 }}>
        {/* <Main title="From the firehose" posts={posts} />
        <Sidebar
          title={sidebar.title}
          description={sidebar.description}
          archives={sidebar.archives}
          social={sidebar.social}
        /> 
      </Grid>
    </main>
  </Container> */
}
