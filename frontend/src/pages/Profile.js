import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Profile.css";

function Profile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    nickname: "",
    email: "",
    points: 0,
    picture: "",
  });

  const getToken = () => localStorage.getItem("token");

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

      const userData = response.data;

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      setFormData({
        name: userData.name || "",
        nickname: userData.nickname || "",
        email: userData.email || "",
        points: userData.points || 0,
        picture: userData.picture || "",
      });
    } catch {
      setError("⚠️ Error al cargar los datos del usuario.");
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleInputChange = ({ target: { name, value } }) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async () => {
    try {
      const token = getToken();
      if (!token) {
        setError("⚠️ No estás autenticado. Inicia sesión nuevamente.");
        return;
      }

      if (!formData.email) {
        setError("⚠️ El correo electrónico es obligatorio.");
        return;
      }

      const response = await axios.put(
        "http://localhost:5000/api/user/update-profile",
        {
          email: formData.email,
          nickname: formData.nickname,
          points: formData.points,
          picture: formData.picture,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccessMessage(response.data.message);
      fetchUserData();
    } catch {
      setError("⚠️ No se pudo actualizar el perfil.");
    }
  };

  if (error) return <div className="profile-container">{error}</div>;
  if (!user) return <div className="profile-container">Cargando datos del usuario...</div>;

  return (
    <div className="profile-container">
      <h2>{formData.nickname || "Tu Perfil"}</h2>

      <div className="profile-header">
        <div className="photo-container">
          <img
            src={formData.picture || "/default-avatar.png"}
            alt="Foto de perfil"
            className="profile-photo"
            onError={(e) => {
              console.warn("⚠️ Error al cargar imagen, usando fallback.");
              e.target.onerror = null;
              e.target.src = "/default-avatar.png";
            }}
          />
        </div>

        <div className="points-display">{formData.points} Pts</div>
      </div>

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

      {/* <div className="input-group">
        <label>Puntos</label>
        <input type="number" name="points" value={formData.points} disabled />
      </div> */}

      <button onClick={handleUpdateProfile}>Guardar Cambios</button>

      {successMessage && <p className="success-message">{successMessage}</p>}
    </div>
  );
}

export default Profile;
