import React, { useEffect, useState } from "react";
import "./AdminPoints.css";

const AdminPoints = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [points, setPoints] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/user/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setUsers(data);
    } catch (err) {
      console.error("❌ Error cargando usuarios:", err);
      setMessage("❌ Error cargando usuarios.");
    }
  };

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

      setMessage(`✅ ${data.message}`);
      setPoints("");
      setReason("");
    } catch (err) {
      console.error("❌ Error asignando puntos:", err);
      setMessage(`❌ ${err.message}`);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="admin-points">
      <h2>🎯 Panel de Administración</h2>

      {message && <div className="message">{message}</div>}

      <div className="form-group">
        <label>👤 Usuario:</label>
        <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
          <option value="">Seleccionar usuario</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name || u.email} - ({u.email})
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>🏆 Puntos a otorgar:</label>
        <input
          type="number"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          placeholder="Cantidad de puntos"
        />
      </div>

      <div className="form-group">
        <label>📝 Motivo:</label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ej: Participación en actividad"
        />
      </div>

      <button className="btn-green" onClick={handleGrant}>
        Asignar Puntos
      </button>
    </div>
  );
};

export default AdminPoints;
