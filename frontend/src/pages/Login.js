import React from "react";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import "./Login.css";

// 🔹 Cargar GOOGLE_CLIENT_ID desde el backend
const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID; // Asegúrate de definirlo en .env del frontend

const Login = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      console.log("🔹 Usuario autenticado con Google:", decoded);

      // Guardamos el token y la info en sessionStorage
      localStorage.setItem("token", credentialResponse.credential); // ✅ persistente
      localStorage.setItem("user", JSON.stringify(decoded));
      setIsAuthenticated(true);

      // Enviar datos al backend para guardarlos en la base de datos
      const userData = {
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
      };

      const response = await axios.get("http://localhost:5000/api/user/profile", {
        headers: { Authorization: `Bearer ${credentialResponse.credential}` },
    });
    

      console.log("✅ Usuario guardado en la base de datos:", response.data);
      navigate("/"); // Redirige al inicio
    } catch (err) {
      console.error("❌ Error al manejar Google Login:", err);
    }
  };

  const handleGoogleLoginError = () => {
    console.error("❌ Error durante el inicio de sesión con Google.");
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="login-container">
        <div className="login-box">
          <h2>Bienvenido a AppLevero</h2>
          <p>Inicia sesión con tu cuenta de Google para continuar</p>
          <GoogleLogin onSuccess={handleGoogleLoginSuccess} onError={handleGoogleLoginError} />
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
