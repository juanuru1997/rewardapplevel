import React, { useEffect, useState } from "react";
import "./RedemptionHistory.css";

console.log("✅ RedemptionHistory cargado correctamente");

const RedemptionHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("all");

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [redeemRes, grantsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/user/redemptions?page=${page}&limit=5`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`http://localhost:5000/api/user/grants?page=${page}&limit=5`, {
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
    fetchData();
  }, [page]);

  const filteredHistory =
    filter === "all" ? history : history.filter((item) => item.type === filter);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  return (
    <div className="redemption-history">
      <h2>🎁 Historial de Canjes</h2>
      <h3>📜 Historial de Actividad</h3>

      <div className="filter-buttons">
        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          Todos
        </button>
        <button
          className={filter === "redeem" ? "active" : ""}
          onClick={() => setFilter("redeem")}
        >
          🎁 Canjes
        </button>
        <button
          className={filter === "grant" ? "active" : ""}
          onClick={() => setFilter("grant")}
        >
          ✨ Asignaciones
        </button>
      </div>

      {loading ? (
        <p>Cargando historial...</p>
      ) : filteredHistory.length === 0 ? (
        <p>No hay historial para mostrar.</p>
      ) : (
        filteredHistory.map((item) => (
          <div
            className="redemption-card"
            key={item._id}
            data-type={item.type}
          >
            {item.type === "redeem" ? (
              <img
                src={item.reward?.imageUrl || "https://via.placeholder.com/100"}
                alt={item.reward?.title}
              />
            ) : (
              <img
                src="/assets/points.png"
                alt="Puntos"
              />
            )}
            <div>
              <h4>
                {item.type === "redeem"
                  ? item.reward?.title || "Recompensa"
                  : "Asignación de puntos"}
              </h4>
              <p>
                <strong>Puntos:</strong>{" "}
                {item.type === "redeem" ? `-${item.pointsUsed}` : `+${item.points}`}
              </p>
              <p>
                <strong>Fecha:</strong>{" "}
                {new Date(item.createdAt).toLocaleDateString()}
              </p>
              <p>
                <strong>Tipo:</strong>{" "}
                {item.type === "redeem" ? "🎁 Canje" : "✨ Asignación"}
              </p>
              {item.type === "redeem" ? (
                <p>
                  <strong>Estado:</strong> {item.status}
                </p>
              ) : (
                <p>
                  <strong>Motivo:</strong> {item.reason}
                </p>
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
