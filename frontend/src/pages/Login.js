import React from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import "./Login.css";

const Login = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const handleGoogleLoginSuccess = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      console.log("Información del usuario decodificada:", decoded);

      sessionStorage.setItem("token", credentialResponse.credential);
      sessionStorage.setItem("user", JSON.stringify(decoded));
      setIsAuthenticated(true); // Actualiza el estado global de autenticación
      navigate("/"); // Redirige al inicio
    } catch (err) {
      console.error("Error al manejar Google Login:", err);
    }
  };

  const handleGoogleLoginError = () => {
    console.error("Error durante el inicio de sesión con Google.");
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Bienvenido a AppLevero</h2>
        <p>Inicia sesión con tu cuenta de Google para continuar</p>

        <GoogleLogin onSuccess={handleGoogleLoginSuccess} onError={handleGoogleLoginError} />
      </div>
    </div>
  );
};

export default Login;
