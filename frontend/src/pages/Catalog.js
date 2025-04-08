import React, { useEffect, useState } from "react";
import "./Catalog.css";
import Notification from "../components/Notification";
import ConfirmModal from "../components/ConfirmModal";

const Catalog = () => {
  const [rewards, setRewards] = useState([]);
  const [notification, setNotification] = useState(null);
  const [selectedReward, setSelectedReward] = useState(null);
  const [pages, setPages] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [minPoints, setMinPoints] = useState(0);
  const [userPoints, setUserPoints] = useState(0);

  const token = localStorage.getItem("token");

  const groupByCategory = (items) =>
    items.reduce((acc, reward) => {
      acc[reward.category] = acc[reward.category] || [];
      acc[reward.category].push(reward);
      return acc;
    }, {});

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/rewards");
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Error al cargar recompensas");
        setRewards(data);
        setPages(Object.fromEntries(data.map((r) => [r.category, 0])));
      } catch (err) {
        setNotification(`❌ ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUserPoints(storedUser?.points || 0);

    fetchRewards();
  }, []);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handlePageChange = (category, index) => {
    setPages((prev) => ({ ...prev, [category]: index }));
  };

  const handleRedeem = async (reward) => {
    if (!token) return showNotification("⚠️ No estás autenticado");

    try {
      const res = await fetch("http://localhost:5000/api/rewards/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rewardId: reward._id }),
      });

      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Respuesta inválida del servidor");
      }

      if (!res.ok) throw new Error(data.message || "Error al canjear");

      showNotification(`🎉 Canjeaste: ${reward.title}`);

      // Actualizar puntos del usuario localmente
      setUserPoints((prev) => prev - reward.points);
    } catch (err) {
      showNotification(`❌ ${err.message}`);
    }
  };

  const filteredRewards = rewards.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) &&
      r.points >= minPoints
  );

  const grouped = groupByCategory(filteredRewards);

  return (
    <div className="catalog-container">
      {notification && (
        <Notification message={notification} onClose={() => setNotification(null)} />
      )}

      <div className="filters">
        <input
          type="text"
          placeholder="🔍 Buscar recompensa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={minPoints}
          onChange={(e) => setMinPoints(Number(e.target.value))}
        >
          <option value={0}>Todos los puntos</option>
          <option value={100}>+100 pts</option>
          <option value={300}>+300 pts</option>
          <option value={500}>+500 pts</option>
        </select>
      </div>

      {loading ? (
        <p>Cargando recompensas...</p>
      ) : (
        Object.entries(grouped).map(([category, rewardsInCategory]) => {
          const page = pages[category] || 0;
          const pageSize = 4;
          const totalPages = Math.ceil(rewardsInCategory.length / pageSize);
          const visible = rewardsInCategory.slice(page * pageSize, (page + 1) * pageSize);

          return (
            <div key={category} className="category-section">
              <h2>{category.toUpperCase()}</h2>
              <div className="carousel">
                {visible.map((reward) => {
                  const canRedeem = reward.stock > 0 && userPoints >= reward.points;

                  return (
                    <div className="reward-card" key={reward._id}>
                      <img
                        src={reward.imageUrl}
                        alt={reward.title}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <h3>{reward.title}</h3>
                      <p>{reward.description}</p>
                      <p>💰 <strong>{reward.points} pts</strong></p>
                      <p>🎫 Stock: {reward.stock}</p>

                      {canRedeem ? (
                        <button
                          className="redeem-button"
                          onClick={() => setSelectedReward(reward)}
                        >
                          Canjear Recompensa
                        </button>
                      ) : (
                        <button className="redeem-button disabled" disabled>
                          Sin puntos suficientes
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="dots">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <span
                    key={i}
                    className={i === page ? "active" : ""}
                    onClick={() => handlePageChange(category, i)}
                  />
                ))}
              </div>
            </div>
          );
        })
      )}

      <ConfirmModal
        reward={selectedReward}
        onConfirm={(reward) => {
          handleRedeem(reward);
          setSelectedReward(null);
        }}
        onCancel={() => setSelectedReward(null)}
      />
    </div>
  );
};

export default Catalog;
