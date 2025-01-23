import React, { useState } from "react";
import "./Catalog.css";
import Notification from "../components/Notification"; 


const rewards = [
  {
    id: 1,
    title: "Maratón de Películas",
    category: "Ocio",
    image: "/assets/cine.png",
    description: "Un paquete de suscripción para ver películas ilimitadas."
  },
  {
    id: 2,
    title: "Ticket de avion",
    category: "Ocio",
    image: "/assets/avion.png",
    description: "Disfruta de un  pasaje para un viaje en avión a destinos increibles.",
  },
  {
    id: 3,
    title: "Clase de Cocina Gourmet",
    category: "Ocio",
    image: "/assets/cook.png",
    description: "Aprende a preparar platos gourmet  en esta clase de cocina en línea.",
  },
  {
    id: 4,
    title: "Parque Temático",
    category: "Ocio",
    image: "/assets/park.png",
    description: "Vive un día lleno de emociones y diversión en un parque temático.",
  },
  { 
    id: 5, 
    title: "Cena Romántica", 
    category: "Ocio", 
    image: "/assets/cena.png", 
    description: "Una cena gourmet para dos personas." 
  },
  { 
    id: 6, 
    title: "Noche de Spa", 
    category: "Ocio", 
    image: "https://via.placeholder.com/200x150?text=Spa", 
    description: "Disfruta un día de spa en pareja." 
  },
  { 
    id: 7, 
    title: "Fin de Semana en la Playa", 
    category: "Ocio", 
    image: "https://via.placeholder.com/200x150?text=Playa", 
    description: "Escapada romántica a la playa." 
  },
  { 
    id: 8, 
    title: "Cata de Vinos", 
    category: "Ocio", 
    image: "https://via.placeholder.com/200x150?text=Vino", 
    description: "Participa en una cata de vinos exclusivos." 
  },
  { 
    id: 9, 
    title: "Entrenamiento Personalizado", 
    category: "Ocio", 
    image: "https://via.placeholder.com/200x150?text=Entrenamiento", 
    description: "Clase personalizada con un experto en fitness." 
  },
  { 
    id: 10, 
    title: "Acceso a Gimnasio Premium", 
    category: "Ocio", 
    image: "https://via.placeholder.com/200x150?text=Gimnasio", 
    description: "Accede a un gimnasio premium durante un mes." 
  },
  { 
    id: 11, 
    title: "Maratón Virtual", 
    category: "Ocio", 
    image: "https://via.placeholder.com/200x150?text=Maraton", 
    description: "Participa en un maratón virtual." 
  },
  { 
    id: 12, 
    title: "Clase de Yoga al Aire Libre", 
    category: "Ocio", 
    image: "https://via.placeholder.com/200x150?text=Yoga", 
    description: "Clase de yoga al aire libre." 
  },
  { 
    id: 13, 
    title: "Maratón de Películas", 
    category: "Disfrutar en Pareja", 
    image: "https://via.placeholder.com/200x150?text=Cine1", 
    description: "Un paquete de suscripción para ver películas ilimitadas." 
  },
  { 
    id: 14, 
    title: "Noche de Juegos", 
    category: "Disfrutar en Pareja", 
    image: "https://via.placeholder.com/200x150?text=Juegos", 
    description: "Disfruta una noche de juegos con amigos y familiares." 
  },
  { 
    id: 15, 
    title: "Concierto Virtual", 
    category: "Disfrutar en Pareja", 
    image: "https://via.placeholder.com/200x150?text=Concierto", 
    description: "Accede a un concierto en línea de tu artista favorito." 
  },
  { 
    id: 16, 
    title: "Paseo Cinematográfico", 
    category: "Disfrutar en Pareja", 
    image: "https://via.placeholder.com/200x150?text=Paseo", 
    description: "Obtén entradas para un cine de lujo en tu ciudad." 
  },
  { 
    id: 17, 
    title: "Cena Romántica", 
    category: "Disfrutar en Pareja", 
    image: "https://via.placeholder.com/200x150?text=Cena", 
    description: "Una cena gourmet para dos personas." 
  },
  { 
    id: 18, 
    title: "Noche de Spa", 
    category: "Disfrutar en Pareja", 
    image: "https://via.placeholder.com/200x150?text=Spa", 
    description: "Disfruta un día de spa en pareja." 
  },
  { 
    id: 19, 
    title: "Fin de Semana en la Playa", 
    category: "Disfrutar en Pareja", 
    image: "https://via.placeholder.com/200x150?text=Playa", 
    description: "Escapada romántica a la playa." 
  },
  { 
    id: 20, 
    title: "Cata de Vinos", 
    category: "Disfrutar en Pareja", 
    image: "https://via.placeholder.com/200x150?text=Vino", 
    description: "Participa en una cata de vinos exclusivos." 
  },
  { 
    id: 21, 
    title: "Entrenamiento Personalizado", 
    category: "Disfrutar en Pareja", 
    image: "https://via.placeholder.com/200x150?text=Entrenamiento", 
    description: "Clase personalizada con un experto en fitness." 
  },
  { 
    id: 22, 
    title: "Acceso a Gimnasio Premium", 
    category: "Disfrutar en Pareja", 
    image: "https://via.placeholder.com/200x150?text=Gimnasio", 
    description: "Accede a un gimnasio premium durante un mes." 
  },
  { 
    id: 23, 
    title: "Maratón Virtual", 
    category: "Disfrutar en Pareja", 
    image: "https://via.placeholder.com/200x150?text=Maraton", 
    description: "Participa en un maratón virtual." 
  },
  { 
    id: 24, 
    title: "Clase de Yoga al Aire Libre", 
    category: "Disfrutar en Pareja", 
    image: "https://via.placeholder.com/200x150?text=Yoga", 
    description: "Clase de yoga al aire libre." 
  },
  { 
    id: 25, 
    title: "Maratón de Películas", 
    category: "Deporte", 
    image: "https://via.placeholder.com/200x150?text=Cine1", 
    description: "Un paquete de suscripción para ver películas ilimitadas." 
  },
  { 
    id: 26, 
    title: "Noche de Juegos", 
    category: "Deporte", 
    image: "https://via.placeholder.com/200x150?text=Juegos", 
    description: "Disfruta una noche de juegos con amigos y familiares." 
  },
  { 
    id: 27, 
    title: "Concierto Virtual", 
    category: "Deporte", 
    image: "https://via.placeholder.com/200x150?text=Concierto", 
    description: "Accede a un concierto en línea de tu artista favorito." 
  },
  { 
    id: 28, 
    title: "Paseo Cinematográfico", 
    category: "Deporte", 
    image: "https://via.placeholder.com/200x150?text=Paseo", 
    description: "Obtén entradas para un cine de lujo en tu ciudad." 
  },
  { 
    id: 29, 
    title: "Cena Romántica", 
    category: "Deporte", 
    image: "https://via.placeholder.com/200x150?text=Cena", 
    description: "Una cena gourmet para dos personas." 
  },
  { 
    id: 30, 
    title: "Noche de Spa", 
    category: "Deporte", 
    image: "https://via.placeholder.com/200x150?text=Spa", 
    description: "Disfruta un día de spa en pareja." 
  },
  { 
    id: 31, 
    title: "Fin de Semana en la Playa", 
    category: "Deporte", 
    image: "https://via.placeholder.com/200x150?text=Playa", 
    description: "Escapada romántica a la playa." 
  },
  { 
    id: 32, 
    title: "Cata de Vinos", 
    category: "Deporte", 
    image: "https://via.placeholder.com/200x150?text=Vino", 
    description: "Participa en una cata de vinos exclusivos." 
  },
  { 
    id: 33, 
    title: "Entrenamiento Personalizado", 
    category: "Deporte", 
    image: "https://via.placeholder.com/200x150?text=Entrenamiento", 
    description: "Clase personalizada con un experto en fitness." 
  },
  { 
    id: 34, 
    title: "Acceso a Gimnasio Premium", 
    category: "Deporte", 
    image: "https://via.placeholder.com/200x150?text=Gimnasio", 
    description: "Accede a un gimnasio premium durante un mes." 
  },
  { 
    id: 35, 
    title: "Maratón Virtual", 
    category: "Deporte", 
    image: "https://via.placeholder.com/200x150?text=Maraton", 
    description: "Participa en un maratón virtual." 
  },
  { 
    id: 36, 
    title: "Clase de Yoga al Aire Libre", 
    category: "Deporte", 
    image: "https://via.placeholder.com/200x150?text=Yoga", 
    description: "Clase de yoga al aire libre." 
  },
];

const Catalog = () => {
  const categories = ["Ocio", "Disfrutar en Pareja", "Deporte"];
  
  
  const [pages, setPages] = useState({
    Ocio: 0,
    "Disfrutar en Pareja": 0,
    Deporte: 0,
  });

  
  const [notification, setNotification] = useState(null);

 
  const handlePageChange = (category, pageIndex) => {
    setPages(prevPages => ({
      ...prevPages,
      [category]: pageIndex,
    }));
  };

  
  const showNotification = (message) => {
    setNotification(message); 
    setTimeout(() => setNotification(null), 3000); 
  };

  return (
    <div className="catalog-container">
      
      {notification && <Notification message={notification} onClose={() => setNotification(null)} />}

      {categories.map((category) => {
        const filteredRewards = rewards.filter((reward) => reward.category === category);
        const pagesCount = Math.ceil(filteredRewards.length / 4); 
        return (
          <div className="category-section" key={category}>
            <h2>{category}</h2>
            <div className="carousel-container">
              <div className="carousel">
                {filteredRewards
                  .slice(pages[category] * 4, (pages[category] + 1) * 4) 
                  .map((reward) => (
                    <div className="reward-card" key={reward.id}>
                      <img src={reward.image} alt={reward.title} />
                      <h3>{reward.title}</h3>
                      <p>{reward.description}</p>
                      <button 
                        className="redeem-button"
                        onClick={() => showNotification(`¡Recompensa canjeada: ${reward.title}!`)} 
                      >
                        Canjear Recompensa
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Puntos de navegación */}
            <div className="dots">
              {Array.from({ length: pagesCount }).map((_, index) => (
                <span
                  key={index}
                  className={pages[category] === index ? "active" : ""}
                  onClick={() => handlePageChange(category, index)} 
                ></span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Catalog;
