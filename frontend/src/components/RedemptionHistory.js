import React, { useEffect, useState } from "react";
import "./RedemptionHistory.css";

const RedemptionHistory = () => {
  const [history, setHistory] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("all");
  const [isAdmin, setIsAdmin] = useState(false);

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
      console.error("❌ Error al cargar usuarios:", err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const userParam = selectedUser ? `&userId=${selectedUser}` : "";
      const [redeemRes, grantsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/user/redemptions?page=${page}&limit=5${userParam}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`http://localhost:5000/api/user/grants?page=${page}&limit=5${userParam}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const redeemData = await redeemRes.json();
      const grantsData = await grantsRes.json();

      const redemptions = redeemData.data.map((item) => ({
        ...item,
        type: "redeem",
      }));

      const grants = grantsData.data.map((item) => ({
        ...item,
        type: "grant",
      }));

      const allHistory = [...redemptions, ...grants].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setHistory(allHistory);
      setTotalPages(Math.max(redeemData.totalPages, grantsData.totalPages));
      setPage(Math.max(redeemData.currentPage, grantsData.currentPage));
    } catch (error) {
      console.error("❌ Error al traer historial:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setIsAdmin(user?.isAdmin || false);
    if (user?.isAdmin) {
      fetchUsers();
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [page, selectedUser]);

  const filteredHistory =
    filter === "all" ? history : history.filter((item) => item.type === filter);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  const selectedUserData = users.find((u) => u._id === selectedUser);

  return (
    <div className="redemption-history">
      {isAdmin && (
        <div className="user-select">
          {!selectedUser ? (
            <>
              <label htmlFor="user-select">Usuario:</label>
              <select
                id="user-select"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">-- Mi actividad --</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name || u.email} ({u.email})
                  </option>
                ))}
              </select>
            </>
          ) : (
            selectedUserData && (
              <div className="user-selected-card">
                {selectedUserData.name || selectedUserData.email}
                <button onClick={() => setSelectedUser("")}>Cambiar usuario</button>
              </div>
            )
          )}
        </div>
      )}

      <div className="filter-buttons">
        <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>
          Todos
        </button>
        <button className={filter === "redeem" ? "active" : ""} onClick={() => setFilter("redeem")}>
          🎁 Canjes
        </button>
        <button className={filter === "grant" ? "active" : ""} onClick={() => setFilter("grant")}>
          ✨ Asignaciones
        </button>
      </div>

      {loading ? (
        <p>Cargando historial...</p>
      ) : filteredHistory.length === 0 ? (
        <p>No hay historial para mostrar.</p>
      ) : (
        filteredHistory.map((item) => (
          <div className="redemption-card" key={item._id} data-type={item.type}>
            {item.type === "redeem" ? (
              <img
                src={item.reward?.imageUrl || "https://via.placeholder.com/100"}
                alt={item.reward?.title}
              />
            ) : (
              <img src="/assets/points.png" alt="Puntos" />
            )}
            <div>
              <h4>
                {item.type === "redeem"
                  ? item.reward?.title || "Recompensa"
                  : "Asignación de puntos"}
              </h4>
              <p><strong>Puntos:</strong> {item.type === "redeem" ? `-${item.pointsUsed}` : `+${item.points}`}</p>
              <p><strong>Fecha:</strong> {new Date(item.createdAt).toLocaleDateString()}</p>
              <p><strong>Tipo:</strong> {item.type === "redeem" ? "🎁 Canje" : "✨ Asignación"}</p>
              {item.type === "redeem" ? (
                <p><strong>Estado:</strong> {item.status}</p>
              ) : (
                <p><strong>Motivo:</strong> {item.reason}</p>
              )}
            </div>
          </div>
        ))
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
            ◀ Anterior
          </button>
          <span>Página {page} de {totalPages}</span>
          <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>
            Siguiente ▶
          </button>
        </div>
      )}
    </div>
  );
};

export default RedemptionHistory;
