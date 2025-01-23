import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Profile.css";

function Profile() {
  debugger;
  const [user, setUser] = useState(JSON.parse(sessionStorage.getItem("user")));
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    points: 0,
    profilePic: null,
  });

  const [successMessage, setSuccessMessage] = useState("");

  // Cargar datos del usuario
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token no encontrado.");

      const response = await axios.get("http://localhost:5000/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(response.data);
      setFormData({
        name: response.data.name || "",
        email: response.data.email || "",
        points: response.data.points || 0,
        profilePic: response.data.profilePic || null,
      });
    } catch (err) {
      console.error("Error al cargar los datos del usuario:", err);
      setError("Error al cargar los datos del usuario.");
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Manejar cambios en la foto de perfil
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prevData) => ({ ...prevData, profilePic: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Actualizar datos del usuario
  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:5000/api/user/profile",
        {
          name: formData.name,
          email: formData.email,
          points: formData.points,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMessage(response.data.message);
      fetchUserData(); // Recargar datos del usuario
    } catch (err) {
      console.error("Error al actualizar el perfil:", err);
      setError("No se pudo actualizar el perfil.");
    }
  };

  // Actualizar foto de perfil
  const handleUpdatePhoto = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:5000/api/user/profile-pic",
        { profilePic: formData.profilePic },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMessage(response.data.message);
      fetchUserData(); // Recargar datos del usuario
    } catch (err) {
      console.error("Error al actualizar la foto de perfil:", err);
      setError("No se pudo actualizar la foto de perfil.");
    }
  };

  if (error) {
    return <div className="profile-container">{error}</div>;
  }

  if (!user) {
    return <div className="profile-container">Cargando datos del usuario...</div>;
  }

  return (
    <div className="profile-container">
      <h1>Perfil de Usuario</h1>

      <div className="profile-info">
        <div className="photo-container">
          {user.picture ? (
            <img src={user.picture} alt="Foto de perfil" className="profile-photo" />
          ) : (
            <span className="placeholder">Sin Foto</span>
          )}
          <input type="file" onChange={handlePhotoChange} />
          <button onClick={handleUpdatePhoto}>Actualizar Foto</button>
        </div>

        <div className="profile-details">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Nombre"
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email"
            disabled // No permitimos que cambie el email
          />
          <input
            type="number"
            name="points"
            value={formData.points}
            onChange={handleInputChange}
            placeholder="Puntos"
          />
          <button onClick={handleUpdateProfile}>Guardar Cambios</button>
        </div>
      </div>

      {successMessage && <p className="success-message">{successMessage}</p>}
    </div>
  );
}

export default Profile;
