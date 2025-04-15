import React, { useEffect, useState } from "react";
import "./AdminPoints.css";

const AdminPoints = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [points, setPoints] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [roleFilter, setRoleFilter] = useState("Todos");

  const token = localStorage.getItem("token");

  useEffect(() => {
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

    fetchUsers();
  }, []);

  const toggleUser = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((u) => u._id));
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());

    const roles = Array.isArray(u.role) ? u.role : [u.role]; // asegurarse que sea array
    const matchesRole = roleFilter === "Todos" || roles.includes(roleFilter);

    return matchesSearch && matchesRole;
  });

  const handleGrant = async () => {
    if (selectedUsers.length === 0 || !points || !reason) {
      return setMessage("⚠️ Todos los campos son obligatorios.");
    }

    try {
      const responses = await Promise.all(
        selectedUsers.map((userId) =>
          fetch("http://localhost:5000/api/user/grant-points", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ userId, points: parseInt(points), reason }),
          })
        )
      );

      const allOk = responses.every((res) => res.ok);
      if (!allOk) throw new Error("Error al asignar a uno o más usuarios.");

      setMessage(`✅ Puntos asignados a ${selectedUsers.length} usuarios`);
      setPoints("");
      setReason("");
      setSelectedUsers([]);
    } catch (err) {
      console.error("❌ Error asignando puntos:", err);
      setMessage(`❌ ${err.message}`);
    }
  };

  return (
    <div className="admin-panel-layout">
      <h2>🎯 Panel de Administración</h2>
      {message && <div className="message">{message}</div>}

      <div className="admin-columns">
        <div className="user-list-column">
          <input
            type="text"
            placeholder="🔍 Buscar usuario por nombre o email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />

          <div className="role-filter">
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="Todos">Todos los roles</option>
              <option value="Development">Development</option>
              <option value="Marketing">Marketing</option>
              <option value="Support">Support</option>
              <option value="Manager">Manager</option>
            </select>
          </div>

          <div className="select-all-container">
            <button onClick={toggleSelectAll} className="select-all-button">
              {selectedUsers.length === filteredUsers.length
                ? "Deseleccionar todos"
                : "Seleccionar todos"}
            </button>
          </div>

          <div className="scrollable-user-list">
            {filteredUsers.map((u) => (
              <div
                key={u._id}
                className={`user-row ${selectedUsers.includes(u._id) ? "selected" : ""}`}
                onClick={() => toggleUser(u._id)}
              >
                <div className="user-info">
                  {u.picture ? (
                    <img
                      src={u.picture}
                      alt={u.name}
                      className="avatar-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/default-avatar.png";
                      }}
                    />
                  ) : (
                    <div className="avatar-large">
                      {u.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}

                  <div className="user-text">
                    <strong>{u.name}</strong>
                    <p>{u.email}</p>
                    <span className="user-points">{u.points} pts</span>
                  </div>
                </div>
                <div className="user-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(u._id)}
                    readOnly
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-column">
          <h4>Usuarios seleccionados: {selectedUsers.length}</h4>

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
            Asignar Puntos a {selectedUsers.length} usuario(s)
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPoints;
