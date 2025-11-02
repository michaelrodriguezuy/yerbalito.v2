import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedAdmin = () => {
  const { user, isLogged } = useContext(AuthContext);
  const rolPro = import.meta.env.VITE_ROLPRO || 'admin';
  // Permitir acceso a usuarios logueados (admin o usuario)
  const hasAccess = isLogged && (user?.rol === 'admin' || user?.rol === 'usuario' || rolPro === 'admin');
  return <>{hasAccess ? <Outlet /> : <Navigate to="/" />}</>;
};

export default ProtectedAdmin;
