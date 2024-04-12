import Categories from "../components/pages/category/Categories";
import Category from "../components/pages/category/Category";
import Blog from "../components/pages/blog/Blog";
import Contact from "../components/pages/contact/Contact";
import About from "../components/pages/about/About";

export const routes = [

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
    id: "blog",
    path: "/blog",
    title: "Blog",
    Element: Blog,
  },
  {
    id: "contact",
    path: "/contact",
    title: "Contacto",
    Element: Contact,
  },
  {
    id: "about",
    path: "/about",
    title: "Nuestro club",
    Element: About,
  },
];
