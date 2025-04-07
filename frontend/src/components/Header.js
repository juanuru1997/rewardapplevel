import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ isAuthenticated, setIsAuthenticated }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  const handleScroll = () => {
    setIsScrolled(window.scrollY > 50);
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("¿Estás seguro de que deseas cerrar sesión?");
    if (confirmLogout) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      navigate('/login');
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className={`page-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-content">
        <div className="logo">
          <img src="/assets/logo.png" alt="Logo" className="logo-img" />
          <h1 className="title">APPLEVEL REWARDS</h1>
        </div>

        <nav className="nav-menu">
          <ul>
            <li>
              <Link to="/" className="nav-item">Inicio</Link>
            </li>

            {isAuthenticated && (
              <>
                <li>
                  <Link to="/catalog" className="nav-item">Catálogo</Link>
                </li>
                <li>
                  <Link to="/profile" className="nav-item">Perfil</Link>
                </li>
                <li>
                  <Link to="/historial" className="nav-item">Historial</Link>
                </li>
                <li>
                  <Link to="/admin/points" className="nav-item">Admin</Link>
                </li>
              </>
            )}

            <li>
              {isAuthenticated ? (
                <span onClick={handleLogout} className="nav-item logout-link">Cerrar Sesión</span>
              ) : (
                <Link to="/login" className="nav-item">Login</Link>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
