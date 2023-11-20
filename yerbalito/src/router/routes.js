import About from "../components/pages/about/About";
import Blog from "../components/pages/blog/Blog";
import Categories from "../components/pages/category/Categories";
import Category from "../components/pages/category/Category";
import Home from "../components/pages/home/Home";
import Player from "../components/pages/squads/Player";
import Squads from "../components/pages/squads/Squads";

export const routes = [
    {
      id: "home",
      path: "/",
      Element: Home,
    },
    {
      id: "about",
      path: "/about",
      Element: About,
    },
    {
        id: "categories",
        path: "/categories",
        Element: Categories,
      }
    {
      id: "category",
      path: "/category/:id",
      Element: Category,
    },
    {
      id: "squads",
      path: "/squads",
      Element: Squads,
    },
    {
        id: "player",
        path: "/player/:id",
        Element: Player,
      },
    {
      id: "blog",
      path: "/blog",
      Element: Blog,
    },
  ];