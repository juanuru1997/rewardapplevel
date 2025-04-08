import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, isAuthenticated, isAdminRequired = false }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.isAdmin === true;

  if (isAdminRequired && !isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
