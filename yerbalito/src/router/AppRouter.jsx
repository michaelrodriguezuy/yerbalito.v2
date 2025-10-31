import { Route, Routes } from "react-router-dom";

import ProtectedUsers from "./ProtectedUsers";
import { routes2 } from "./routes2";
import { routes, protectedRoutes, dynamicRoutes } from "./routes";
import Dashboard from "../components/pages/dashboard/Dashboard";
import Register from "../components/pages/register/Register";
import ForgotPassword from "../components/pages/forgotPassword/ForgotPassword";
import NotFound from "../components/pages/notFound/NotFound";
import Login from "../components/pages/login/Login";
import ProtectedAdmin from "./ProtectedAdmin";
import Home from "../components/pages/home/Home";

const AppRouter = () => {
  return (
    <Routes>
      {/* Usuario no logueado */}
      <Route index element={<Home />} />
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="*" element={<NotFound />} />

      {routes.map(({ id, path, Element }) => (
          <Route key={id} path={path} element={<Element />} />
        ))}

      {/* Rutas dinámicas (no aparecen en navbar) */}
      {dynamicRoutes.map(({ id, path, Element }) => (
        <Route key={id} path={path} element={<Element />} />
      ))}

      {/* Usuario logueado */}
      <Route element={<ProtectedUsers />}>
        {routes2.map(({ id, path, Element }) => (
          <Route key={id} path={path} element={<Element />} />
        ))}
      </Route>

      {/* Admin */}
      <Route element={<ProtectedAdmin />}>
        <Route path="/dashboard" element={<Dashboard />} />
        {protectedRoutes.map(({ id, path, Element }) => (
          <Route key={id} path={path} element={<Element />} />
        ))}
      </Route>
    </Routes>
  );
};

export default AppRouter;
