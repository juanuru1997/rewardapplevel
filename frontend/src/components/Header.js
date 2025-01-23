import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ isAuthenticated, setIsAuthenticated }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  // Manejar el desplazamiento del header
  const handleScroll = () => {
    setIsScrolled(window.scrollY > 50);
  };

  // Manejar cierre de sesión
  const handleLogout = () => {
    const confirmLogout = window.confirm("¿Estás seguro de que deseas cerrar sesión?");
    if (confirmLogout) {
      localStorage.removeItem('token'); // Elimina el token de autenticación
      localStorage.removeItem('user'); // Elimina datos del usuario si están almacenados
      setIsAuthenticated(false); // Actualiza el estado de autenticación
      navigate('/login'); // Redirige a la página de login
    }
  };

  // Verificar si el usuario está autenticado al cargar
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className={`page-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-content">
        {/* Logo y título */}
        <div className="logo">
          <img src="/assets/logo.png" alt="Logo" className="logo-img" />
          <h1 className="title">APPLEVEL REWARDS</h1>
        </div>

        {/* Menú de navegación */}
        <nav className="nav-menu">
          <ul>
            <li>
              <Link to="/" className="nav-item">
                Inicio
              </Link>
            </li>
            {isAuthenticated && (
              <>
                <li>
                  <Link to="/catalog" className="nav-item">
                    Catálogo
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className="nav-item">
                    Perfil
                  </Link>
                </li>
              </>
            )}
            <li>
              {isAuthenticated ? (
                <span onClick={handleLogout} className="nav-item logout-link">
                  Cerrar Sesión
                </span>
              ) : (
                <Link to="/login" className="nav-item">
                  Login
                </Link>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
