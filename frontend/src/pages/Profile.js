import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Profile.css";

function Profile() {
  const storedUser = sessionStorage.getItem("user") || localStorage.getItem("user");
  const [user, setUser] = useState(storedUser ? JSON.parse(storedUser) : null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    nickname: "",
    email: "",
    points: 0,
    picture: "",
  });

  const getToken = () => sessionStorage.getItem("token") || localStorage.getItem("token");

  const fetchUserData = async () => {
    try {
      const token = getToken();
      if (!token) {
        setError("⚠️ Debes iniciar sesión nuevamente.");
        return;
      }

      const response = await axios.get("http://localhost:5000/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        setUser(response.data);
        sessionStorage.setItem("user", JSON.stringify(response.data));
        setFormData({
          name: response.data.name || "",
          nickname: response.data.nickname || "",
          email: response.data.email || "",
          points: response.data.points || 0,
          picture: response.data.picture || "",
        });
      }
    } catch (err) {
      setError("⚠️ Error al cargar los datos del usuario.");
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleUpdateProfile = async () => {
    try {
      const token = getToken();
      if (!token) {
        setError("⚠️ No estás autenticado. Inicia sesión nuevamente.");
        return;
      }

      if (!formData.email) {
        setError("⚠️ Error: El correo electrónico es obligatorio.");
        return;
      }

      const response = await axios.put(
        "http://localhost:5000/api/user/update-profile",
        {
          email: formData.email,
          nickname: formData.nickname,
          points: formData.points,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMessage(response.data.message);
      fetchUserData();
    } catch (err) {
      setError("⚠️ No se pudo actualizar el perfil.");
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
      {/* Nombre del usuario */}
      <h2>{formData.nickname || "Tu Perfil"}</h2>

      {/* Contenedor de Imagen + Puntos */}
      <div className="profile-header">
        {/* Imagen de perfil */}
        <div className="photo-container">
          {formData.picture ? (
            <img src={formData.picture} alt="Foto de perfil" className="profile-photo" />
          ) : (
            <span className="placeholder">Sin Foto</span>
          )}
        </div>

        {/* Puntos */}
        <div className="points-display">{formData.points} Pts</div>
      </div>

      {/* Formulario de usuario */}
      <div className="input-group">
        <label>Nickname</label>
        <input
          type="text"
          name="nickname"
          value={formData.nickname}
          onChange={handleInputChange}
          placeholder="Escribe tu nickname"
        />
      </div>

      <div className="input-group">
        <label>Email</label>
        <input type="email" name="email" value={formData.email} readOnly />
      </div>

      <div className="input-group">
        <label>Puntos</label>
        <input
          type="number"
          name="points"
          value={formData.points}
          onChange={handleInputChange}
        />
      </div>

      <button onClick={handleUpdateProfile}>Guardar Cambios</button>

      {successMessage && <p className="success-message">{successMessage}</p>}
    </div>
  );
}

export default Profile;
