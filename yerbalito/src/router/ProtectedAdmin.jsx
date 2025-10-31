import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedAdmin = () => {
  const { user } = useContext(AuthContext);
  const rolPro = import.meta.env.VITE_ROLPRO || 'admin';
  const isAdmin = user?.rol === 'admin' || rolPro === 'admin';
  return <>{isAdmin ? <Outlet /> : <Navigate to="/" />}</>;
};

export default ProtectedAdmin;
