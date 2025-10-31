import Categories from "../components/pages/category/Categories";
import Blogs from "../components/pages/blog/Blogs";
import BlogItem from "../components/pages/blog/BlogItem";
import NoticiaItem from "../components/pages/blog/NoticiaItem";
import Contact from "../components/pages/contact/Contact";
import About from "../components/pages/about/About";
import ValoresManager from "../components/pages/dashboard/ValoresManager";
import FixtureManager from "../components/pages/dashboard/FixtureManager";

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
  {
    id: "blogs",
    path: "/blogs",
    title: "Noticias & Blogs",
    Element: Blogs,
  },
  {
    id: "contact",
    path: "/contact",
    title: "Contacto",
    Element: Contact,
  }
];

// Rutas protegidas (solo para usuarios logueados)
export const protectedRoutes = [
  {
    id: "valores",
    path: "/valores",
    title: "Gestión de Valores",
    Element: ValoresManager,
  },
  {
    id: "fixture",
    path: "/fixture",
    title: "Gestión de Fixture",
    Element: FixtureManager,
  }
];

// Rutas dinámicas (no aparecen en navbar)
export const dynamicRoutes = [
  {
    id: "blog",
    path: "/blog/:id",
    title: "Blog",
    Element: BlogItem,
  },
  {
    id: "noticia",
    path: "/noticia/:id",
    title: "Noticia",
    Element: NoticiaItem,
  }
];
