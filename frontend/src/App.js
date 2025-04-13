import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Provider } from "react-redux";
import store from "./store/store";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import Profile from "./pages/Profile";
import Inicio from "./pages/Inicio";
import History from "./pages/History";
import AdminPoints from "./pages/AdminPoints";

import Header from "./components/Header"; // Sidebar
import NotificationBell from "./components/NotificationBell"; // 🔔 Notificaciones
import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
  console.error("❌ ERROR: REACT_APP_GOOGLE_CLIENT_ID no está definido en .env. Verifica tu configuración.");
}

function Layout({ isAuthenticated, setIsAuthenticated }) {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <>
      <Header isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
      <div className="main-content">
        {!isLoginPage && (
          <div className="topbar">
            <NotificationBell />
          </div>
        )}
        <Routes>
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
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/historial"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/points"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isAdminRequired={true}>
                <AdminPoints />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem("token"));

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  return (
    <Provider store={store}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <Router>
          <Layout
            isAuthenticated={isAuthenticated}
            setIsAuthenticated={setIsAuthenticated}
          />
        </Router>
      </GoogleOAuthProvider>
    </Provider>
  );
}

export default App;
