// backend/lib/seedData.js

const imageUrl = "https://i.ibb.co/jkyfqnbM/cook.png";

const rewards = [
  {
    title: "Clase de Cocina Gourmet",
    description: "Aprendé a cocinar como un profesional.",
    points: 500,
    stock: 5,
    category: "Ocio",
    imageUrl,
  },
  {
    title: "Maratón de Películas",
    description: "Un paquete de películas ilimitadas para un finde épico.",
    points: 300,
    stock: 10,
    category: "Ocio",
    imageUrl,
  },
  {
    title: "Noche de Spa en Pareja",
    description: "Relax y bienestar para dos.",
    points: 700,
    stock: 3,
    category: "Disfrutar en Pareja",
    imageUrl,
  },
  {
    title: "Acceso al Gimnasio Premium",
    description: "Entrená como un pro durante un mes.",
    points: 400,
    stock: 8,
    category: "Deporte",
    imageUrl,
  },
];

module.exports = rewards;
