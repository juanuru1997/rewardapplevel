import React, { useEffect, useState } from "react";

const AdminPoints = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [points, setPoints] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/user/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        console.log("📦 Users API response:", data);

        if (!res.ok) throw new Error(data.message || "Error al obtener usuarios");
        setUsers(data);
      } catch (err) {
        console.error("❌ Error cargando usuarios:", err);
        setMessage("❌ Error cargando usuarios.");
        setUsers([]); // aseguramos que no quede en estado inválido
      }
    };

    fetchUsers();
  }, [token]);

  const handleGrant = async () => {
    if (!selectedUser || !points || !reason) {
      return setMessage("⚠️ Todos los campos son obligatorios.");
    }

    try {
      const res = await fetch("http://localhost:5000/api/user/grant-points", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: selectedUser,
          points: parseInt(points),
          reason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage(`🎉 ${data.message}`);
      setPoints("");
      setReason("");
    } catch (err) {
      console.error("❌ Error asignando puntos:", err);
      setMessage(`❌ ${err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "auto", padding: 20 }}>
      <h2>🎯 Asignar Puntos (Admin)</h2>

      {message && <div style={{ marginBottom: 15 }}>{message}</div>}

      <label>👤 Usuario:</label>
      <select
        value={selectedUser}
        onChange={(e) => setSelectedUser(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 15 }}
      >
        <option value="">Seleccionar usuario</option>
        {Array.isArray(users) &&
          users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name || u.email} - ({u.email})
            </option>
          ))}
      </select>

      <label>🏆 Puntos a otorgar:</label>
      <input
        type="number"
        value={points}
        onChange={(e) => setPoints(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 15 }}
      />

      <label>📝 Motivo:</label>
      <input
        type="text"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Ej: Participación en desafío semanal"
        style={{ width: "100%", padding: 10, marginBottom: 15 }}
      />

      <button
        onClick={handleGrant}
        style={{
          padding: 10,
          width: "100%",
          backgroundColor: "#25d366",
          color: "white",
          border: "none",
          borderRadius: 8,
        }}
      >
        Asignar Puntos
      </button>
    </div>
  );
};

export default AdminPoints;
