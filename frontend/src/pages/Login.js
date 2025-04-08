import React from "react";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import "./Login.css";

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const Login = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse.credential;
      localStorage.setItem("token", token);

      const response = await axios.get("http://localhost:5000/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = response.data;
      localStorage.setItem("user", JSON.stringify(userData));
      setIsAuthenticated(true);
      navigate("/");
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
