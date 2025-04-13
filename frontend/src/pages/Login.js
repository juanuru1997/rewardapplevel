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
      const googleToken = credentialResponse.credential;

      // ✅ Intercambiamos token de Google por nuestro JWT en el backend
      const res = await axios.post("http://localhost:5000/auth/google-auth", {
        credential: googleToken,
      });

      const { token, user } = res.data;

      // ✅ Guardamos token JWT del backend y datos del usuario
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setIsAuthenticated(true);
      navigate("/");
    } catch (err) {
      console.error("❌ Error al manejar Google Login:", err);
      alert("Error al iniciar sesión con Google. Intenta nuevamente.");
    }
  };

  const handleGoogleLoginError = () => {
    console.error("❌ Error durante el inicio de sesión con Google.");
    alert("Error con Google Login. Reintenta.");
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="login-container">
        <div className="login-box">
          <h2>Bienvenido a AppLevero</h2>
          <p>Inicia sesión con tu cuenta de Google para continuar</p>
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginError}
          />
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
