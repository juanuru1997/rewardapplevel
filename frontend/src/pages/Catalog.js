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
    } catch (err) {
      showNotification(`❌ ${err.message}`);
    }
  };

  const grouped = groupByCategory(rewards);

  return (
    <div className="catalog-container">
      {notification && (
        <Notification message={notification} onClose={() => setNotification(null)} />
      )}

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
                {visible.map((reward) => (
                  <div className="reward-card" key={reward._id}>
                    <img
                      src={reward.imageUrl}
                      alt={reward.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <h3>{reward.title}</h3>
                    <p>{reward.description}</p>
                    <button
                      className="redeem-button"
                      onClick={() => setSelectedReward(reward)}
                    >
                      Canjear Recompensa
                    </button>
                  </div>
                ))}
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
