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

// 🔹 Obtener el CLIENT_ID desde .env
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
  console.error("❌ ERROR: REACT_APP_GOOGLE_CLIENT_ID no está definido en .env. Verifica tu configuración.");
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar autenticación al cargar la app
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token); // Si hay un token, el usuario está autenticado
  }, []);

  return (
    // 🔹 Usar GOOGLE_CLIENT_ID desde .env
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
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
