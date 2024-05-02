import Categories from "../components/pages/category/Categories";

import Blog from "../components/pages/blog/Blog";
import Blogs from "../components/pages/blog/Blogs";
import Contact from "../components/pages/contact/Contact";
import About from "../components/pages/about/About";

export const routes = [

  {
    id: "about",
    path: "/about",
    title: "Nuestro club",
    Element: About,
  },
  {
    id: "categories",
    path: "/categories",
    title: "Categorías",
    Element: Categories,
  },
  // {
  //   id: "category",
  //   path: "/category/:id",
  //   title: "Categoría",
  //   Element: Category,
  // },
  {
    id: "blogs",
    path: "/blogs",
    title: "Blogs",
    Element: Blogs,
  },
  {
    id: "contact",
    path: "/contact",
    title: "Contacto",
    Element: Contact,
  },
  {
    id: "blog",
    path: "/itemBlog/:id",
    Element: Blog,
  }

];
