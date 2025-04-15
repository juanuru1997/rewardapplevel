import React, { useEffect, useState, useMemo } from "react";
import "./Catalog.css";
import Notification from "../components/Notification";
import ConfirmModal from "../components/ConfirmModal";
import RewardEditorModal from "../components/RewardEditorModal";

const API_URL = "http://localhost:5000"; // 🧩 BACKEND FIJO

const Catalog = () => {
  const [rewards, setRewards] = useState([]);
  const [notification, setNotification] = useState(null);
  const [selectedReward, setSelectedReward] = useState(null);
  const [pages, setPages] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [minPoints, setMinPoints] = useState(0);
  const [userPoints, setUserPoints] = useState(0);

  const [showEditor, setShowEditor] = useState(false);
  const [editingReward, setEditingReward] = useState(null);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.isAdmin;

  const groupByCategory = (items) =>
    items.reduce((acc, reward) => {
      const category = reward.category || "Sin categoría";
      acc[category] = acc[category] || [];
      acc[category].push(reward);
      return acc;
    }, {});

  const getImageSrc = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/assets") || url.startsWith("assets")) return url;
    return `${API_URL}/api/uploads/${url}`;
  };

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const res = await fetch(`${API_URL}/api/rewards`);
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
  const handleDelete = async (reward) => {
    const confirm = window.confirm(`¿Eliminar la recompensa "${reward.title}"?`);
    if (!confirm) return;
  
    try {
      const res = await fetch(`${API_URL}/api/rewards/${reward._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
  
      setRewards((prev) => prev.filter((r) => r._id !== reward._id));
      showNotification("🗑 Recompensa eliminada");
    } catch (err) {
      console.error("❌ Error al eliminar recompensa:", err);
      showNotification("❌ Error al eliminar recompensa");
    }
  };
  
  const handleRedeem = async (reward) => {
    if (!token) return showNotification("⚠️ No estás autenticado");

    try {
      const res = await fetch(`${API_URL}/api/rewards/redeem`, {
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
      setUserPoints((prev) => prev - reward.points);
    } catch (err) {
      showNotification(`❌ ${err.message}`);
    }
  };

  const openEditor = (reward) => {
    setEditingReward(reward || null);
    setShowEditor(true);
  };

  const saveReward = async (data) => {
    try {
      const method = editingReward ? "PUT" : "POST";
      const url = editingReward
        ? `${API_URL}/api/rewards/${editingReward._id}`
        : `${API_URL}/api/rewards`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Error al guardar");

      showNotification("✅ Recompensa guardada");

      setRewards((prev) => {
        const updated = editingReward
          ? prev.map((r) => (r._id === editingReward._id ? result : r))
          : [...prev, result];

        const updatedPages = { ...pages };
        const category = result.category || "Sin categoría";
        if (!(category in updatedPages)) {
          updatedPages[category] = 0;
          setPages(updatedPages);
        }

        return updated;
      });
    } catch (err) {
      showNotification(`❌ ${err.message}`);
    }
  };

  const filteredRewards = rewards.filter(
    (r) =>
      (r.title?.toLowerCase() || "").includes(search.toLowerCase()) &&
      r.points >= minPoints
  );

  const grouped = groupByCategory(filteredRewards);

  return (
    <div className="catalog-container">
      {notification && (
        <Notification
          message={notification}
          onClose={() => setNotification(null)}
        />
      )}

      {isAdmin && (
        <button
          onClick={() => openEditor(null)}
          className="floating-add-button"
          aria-label="Agregar nueva recompensa"
          title="Nueva recompensa"
        >
          +
        </button>
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
          const visible = rewardsInCategory.slice(
            page * pageSize,
            (page + 1) * pageSize
          );

          return (
            <div key={category} className="category-section">
              <h2>{category.toUpperCase()}</h2>
              <div className="carousel">
                {visible.map((reward) => {
                  const canRedeem =
                    reward.stock > 0 && userPoints >= reward.points;

                  return (
                    <div className="reward-card" key={reward._id}>
                      <img
                        src={getImageSrc(reward.imageUrl)}
                        alt={reward.title || "Recompensa"}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          console.warn("⚠️ Imagen no cargó:", reward.imageUrl);
                          if (!e.target.src.includes("placeholder.com")) {
                            e.target.src =
                              "https://via.placeholder.com/150?text=Sin+imagen";
                          }
                        }}
                      />

                      <h3>{reward.title}</h3>
                      <p>{reward.description}</p>
                      <p>
                        💰 <strong>{reward.points} pts</strong>
                      </p>
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
                      {isAdmin && (
                        <button
                          className="delete-button"
                          onClick={() => handleDelete(reward)}
                        >
                          🗑 Eliminar
                        </button>
                      )}

                      {isAdmin && (
                        <button
                          className="edit-button"
                          onClick={() => openEditor(reward)}
                        >
                          ✏️ Editar
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

      {showEditor && (
        <RewardEditorModal
          reward={editingReward}
          onClose={() => setShowEditor(false)}
          onSave={saveReward}
          categories={[
            ...new Set(rewards.map((r) => r.category).filter(Boolean)),
          ]}
        />
      )}
    </div>
  );
};

export default Catalog;
