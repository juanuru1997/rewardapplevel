import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();

        // Validar campos en el frontend
        if (!name || !email || !password) {
            setError("Todos los campos son obligatorios.");
            setSuccess("");
            return;
        }

        try {
            // Enviar solicitud al backend
            const response = await axios.post("http://localhost:5000/api/signup", {
                email,
                password,
                name,
            });

            // Mostrar mensaje de éxito
            setSuccess("Usuario registrado exitosamente.");
            setError("");

            // Redirigir al login después de unos segundos
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (error) {
            // Manejar errores específicos del backend
            if (error.response?.status === 409) {
                setError("El correo ya está registrado.");
            } else {
                setError(error.response?.data?.data?.error || "Error en el servidor.");
            }
            setSuccess("");
        }
    };

    return (
        <div className="signup-container">
            <h2>Crear Cuenta</h2>
            <form onSubmit={handleSignup}>
                <input
                    type="text"
                    placeholder="Nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Registrarse</button>
            </form>

            {/* Mostrar mensajes */}
            {success && <p className="success-message">{success}</p>}
            {error && <p className="error-message">{error}</p>}
        </div>
    );
};

export default Signup;
