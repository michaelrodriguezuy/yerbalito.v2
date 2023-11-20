import { Route, Routes } from "react-router-dom";
import ProtectedUsers from "./ProtectedUsers";
import { routes } from "./routes";

import Navbar from "../components/layout/navbar/Navbar";
import Footer from "../components/layout/footer/Footer";
import Dashboard from "../components/pages/dashboard/Dashboard";
import Register from "../components/pages/register/Register";
import ForgotPassword from "../components/pages/forgotPassword/ForgotPassword";
import NotFound from "../components/pages/notFound/NotFound";
import Login from "../components/pages/login/Login";
import ProtectedAdmin from "./ProtectedAdmin";

const AppRouter = () => {
  return (
    <Routes>
      {/* {Usuario logueados} */}
      <Route element={ProtectedUsers}>
        <Route element={<Navbar />}>
          <Route element={<Footer />}>
            {routes.map(({ id, path, Element }) => (
              <Route key={id} path={path} element={<Element />} />
            ))}
          </Route>
        </Route>
      </Route>

      {/* {Admin} */}
      <Route element={<ProtectedAdmin />}>
        <Route element={<Navbar />}>
          <Route element={<Footer />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Route>
      </Route>

      {/* {Usuario no logueados} */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
