import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  FaHome,
  FaGift,
  FaUser,
  FaHistory,
  FaTools,
  FaSignOutAlt,
  FaSignInAlt,
} from "react-icons/fa";
import "./Header.css";

const Header = ({ isAuthenticated, setIsAuthenticated }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsAuthenticated(false);
      setIsAdmin(false);
      setUserPoints(0);
      navigate("/login");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAdmin(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userData = res.data;
        setIsAdmin(userData?.isAdmin || false);
        setUserPoints(userData?.points || 0);
      } catch (err) {
        console.error("Error al obtener puntos:", err);
      }
    };

    fetchUser();
  }, [isAuthenticated]);

  const navLinks = [
    { to: "/", label: "Inicio", icon: <FaHome /> },
    { to: "/catalog", label: "Catálogo", icon: <FaGift />, auth: true },
    { to: "/profile", label: "Perfil", icon: <FaUser />, auth: true },
    { to: "/historial", label: "Historial", icon: <FaHistory />, auth: true },
    { to: "/admin/points", label: "Admin", icon: <FaTools />, auth: true, admin: true },
  ];

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="logo-section">
        {!collapsed && (
          <>
            <img src="/assets/logo.png" alt="Logo" className="logo-img" />
            <div className="logo-text">
              <h1 className="sidebar-title">APPLEVEL</h1>
              <span className="sidebar-subtitle">REWARDS</span>
            </div>
          </>
        )}
      </div>

      {!collapsed && (
        <div className="user-points-container">
          <span className="user-points">⭐ {userPoints} pts</span>
        </div>
      )}

      <nav className="sidebar-nav">
        <ul>
          {navLinks.map(({ to, label, icon, auth, admin }) => {
            if (auth && !isAuthenticated) return null;
            if (admin && !isAdmin) return null;

            return (
              <li key={label}>
                <Link
                  to={to}
                  className={`sidebar-link ${location.pathname === to ? "active" : ""}`}
                >
                  {icon}
                  {!collapsed && <span>{label}</span>}
                </Link>
              </li>
            );
          })}
          {isAuthenticated ? (
            <li>
              <span onClick={handleLogout} className="sidebar-link logout">
                <FaSignOutAlt />
                {!collapsed && <span>Cerrar Sesión</span>}
              </span>
            </li>
          ) : (
            <li>
              <Link to="/login" className="sidebar-link">
                <FaSignInAlt />
                {!collapsed && <span>Login</span>}
              </Link>
            </li>
          )}
        </ul>
      </nav>

      <div className="sidebar-toggle-hover-zone" onClick={() => setCollapsed(!collapsed)}>
        <span className="sidebar-toggle-arrow">{collapsed ? "→" : "←"}</span>
      </div>
    </aside>
  );
};

export default Header;
