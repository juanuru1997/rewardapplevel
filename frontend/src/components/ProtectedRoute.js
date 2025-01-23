import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, isAuthenticated }) => {
  // Redirige al login si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Si está autenticado, renderiza el contenido
  return children;
};

export default ProtectedRoute;
