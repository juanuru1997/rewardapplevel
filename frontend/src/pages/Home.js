import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css"; 

const Home = () => {
  const navigate = useNavigate();

  
  useEffect(() => {
    if (!localStorage.getItem("authenticated")) {
      
      navigate("/login");  
    }
  }, [navigate]);

  return (
    <div className="home-container">
      <div className="navbar">
        <ul>
          <li><a href="/home">Home</a></li>
          <li><a href="/catalog">Catalogo</a></li>
          <li><a href="/profile">Perfil</a></li>
        </ul>
      </div>

      <div className="home-content">
        <h1>Bienvenido al Home</h1>
        <p>Esta es la página de inicio. Aquí puede acceder a todo lo que ofrece la aplicación.</p>
        <div className="reward-system-info">
          <h2>Sistema de Canje de Recompensas</h2>
          <ul>
            <li>Gana puntos por cada compra realizada.</li>
            <li>Intercambia puntos por productos exclusivos.</li>
            <li>Recompensas y descuentos especiales.</li>
          </ul>
        </div>
        <button
          className="logout-button"
          onClick={() => {
            
            localStorage.removeItem("authenticated");
            navigate("/login"); 
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default Home;
