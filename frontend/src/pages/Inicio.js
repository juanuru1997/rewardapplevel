import React, { useState, useEffect } from "react";
import "./Inicio.css";

const Inicio = () => {
  const slides = [
    {
      id: 1,
      image: "/assets/trofeo.png",  
      title: "Premia tu Esfuerzo",
      description: "Como Applevero, acumula puntos por tus logros y compras, canjeándolos por actividades, cursos y experiencias que te ayudarán a mejorar tu vida y crecimiento personal.",
    },
    {
      id: 2,
      image: "/assets/crecimiento.png",  
      title: "Un Camino de Crecimiento",
      description: "Regístrate y empieza a ganar puntos por cada actividad y logro alcanzado. Estos puntos se pueden canjear por experiencias exclusivas que transformarán tu vida.",
    },
    {
      id: 3,
      image: "/assets/meta.png",  
      title: "Recompensas a Tu Medida",
      description: "Disfruta de recompensas personalizadas, diseñadas especialmente para ti. Canjea tus puntos por experiencias que contribuirán a tu desarrollo y bienestar.",
    },
    {
      id: 4,
      image: "/assets/star.png",  
      title: "Alcanza Nuevas Metas",
      description: "Supera desafíos y gana trofeos únicos. Cada trofeo desbloquea nuevas recompensas que te permitirán avanzar en tu camino hacia el éxito y la mejora personal.",
    },
  ];
  

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === slides.length - 1 ? 0 : prevIndex + 1
      );
    }, 7000); 
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="inicio-container">
      <div className="carousel-wrapper">
        <div
          className="slide"
          key={slides[currentIndex].id}
          style={{
            animation: "fadeIn 1s ease",
          }}
        >
          <div className="slide-card">
            <img
              src={slides[currentIndex].image}
              alt={slides[currentIndex].title}
              className="slide-image"
            />
            <div className="slide-content">
              <h2>{slides[currentIndex].title}</h2>
              <p>{slides[currentIndex].description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="dots">
        {slides.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === currentIndex ? "active" : ""}`}
            onClick={() => setCurrentIndex(index)}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default Inicio;
