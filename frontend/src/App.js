import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google"; 

import Login from "./pages/Login";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import Profile from "./pages/Profile"; 
import Inicio from "./pages/Inicio";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar autenticación al cargar la app
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token); // Si hay un token, el usuario está autenticado
  }, []);

  return (
    // Envolver la aplicación completa dentro de GoogleOAuthProvider
    <GoogleOAuthProvider clientId="899704440373-gao7r5re7dau2n1gf5nduia0of1328s3.apps.googleusercontent.com">
      <Router>
        {/* Pasamos `isAuthenticated` y `setIsAuthenticated` al Header */}
        <Header isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />

        <Routes>
          {/* Ruta pública para login */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/" />
              ) : (
                <Login setIsAuthenticated={setIsAuthenticated} />
              )
            }
          />

          {/* Rutas protegidas */}
          <Route
            path="/"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Inicio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/catalog"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Catalog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Profile /> {/* Renderizar el perfil con datos cargados dinámicamente */}
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
