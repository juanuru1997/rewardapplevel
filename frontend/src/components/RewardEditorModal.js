import React, { useState, useEffect } from "react";
import axios from "axios";
import "./RewardEditorModal.css";

// 👇 URL del backend directamente (SIN usar .env)
const API_URL = "http://localhost:5000";

const RewardEditorModal = ({ reward, onClose, onSave, categories = [] }) => {
  const [formData, setFormData] = useState({
    title: reward?.title || "",
    description: reward?.description || "",
    category: reward?.category || "",
    points: reward?.points || 0,
    stock: reward?.stock || 1,
    imageUrl: reward?.imageUrl || "",
  });

  const [uploading, setUploading] = useState(false);
  const [customCategory, setCustomCategory] = useState("");

  useEffect(() => {
    console.log("🧩 RewardEditorModal montado");
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "category" && value === "__new__") {
      setFormData((prev) => ({ ...prev, category: "" }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "points" || name === "stock" ? Number(value) : value,
      }));
    }
  };

  const handleCustomCategory = (e) => {
    const value = e.target.value;
    setCustomCategory(value);
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);
    setUploading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token no disponible");

      const res = await axios.post(`${API_URL}/api/uploads`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const data = res.data;
      if (!data.filename) throw new Error("Respuesta inválida del backend");

      console.log("✅ Imagen subida correctamente:", data);

      setFormData((prev) => ({
        ...prev,
        imageUrl: data.filename,
      }));
    } catch (err) {
      console.error("❌ Error al subir imagen:", err.message);
      alert("❌ Error al subir imagen: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await onSave(formData);
      onClose(); // solo cerrar si `onSave` terminó bien
    } catch (err) {
      console.error("❌ Error al guardar recompensa:", err);
      alert("Error al guardar recompensa");
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>{reward ? "Editar Recompensa" : "Nueva Recompensa"}</h2>
        <form onSubmit={handleSubmit} className="reward-form">
          <label>Título</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <label>Descripción</label>
          <textarea
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            required
          />

          <label>Categoría</label>
          <select
            name="category"
            value={formData.category || "__new__"}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
            <option value="__new__">Otra (escribir nueva)</option>
          </select>

          {formData.category === "" && (
            <input
              type="text"
              name="customCategory"
              placeholder="Escribe nueva categoría"
              value={customCategory}
              onChange={handleCustomCategory}
              required
            />
          )}

          <label>Puntos</label>
          <input
            type="number"
            name="points"
            value={formData.points}
            onChange={handleChange}
            required
          />

          <label>Stock</label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            required
          />

          <label>Imagen</label>
          {formData.imageUrl && (
            <img
              src={`${API_URL}/api/uploads/${formData.imageUrl}`}
              alt="Preview"
              className="preview-img"
              onError={(e) => {
                console.warn("⚠️ Imagen no cargó:", formData.imageUrl);
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/150?text=Sin+imagen";
              }}
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
          />

          <div className="modal-actions">
            <button type="submit" disabled={uploading}>
              {reward ? "Guardar Cambios" : "Crear"}
            </button>
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RewardEditorModal;
