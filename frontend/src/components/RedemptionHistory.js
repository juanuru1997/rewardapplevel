import React, { useEffect, useState } from "react";
import "./RedemptionHistory.css";
console.log("✅ RedemptionHistory cargado correctamente");


const RedemptionHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/user/redemptions", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();
        if (res.ok) setHistory(data);
        else console.error("❌ Error:", data.message);
      } catch (err) {
        console.error("❌ Error al traer historial:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [token]);

  if (loading) return <p>Cargando historial...</p>;

  if (history.length === 0) return <p>No hay canjes todavía.</p>;

  return (
    <div className="redemption-history">
      <h2>🧾 Historial de Canjes</h2>
      {history.map((item) => (
        <div className="redemption-card" key={item._id}>
          <img src={item.reward?.imageUrl || "https://via.placeholder.com/100"} alt={item.reward?.title} />
          <div>
            <h4>{item.reward?.title || "Recompensa"}</h4>
            <p><strong>Puntos usados:</strong> {item.pointsUsed}</p>
            <p><strong>Fecha:</strong> {new Date(item.createdAt).toLocaleDateString()}</p>
            <p><strong>Estado:</strong> {item.status}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RedemptionHistory;
