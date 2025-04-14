import React, { useState, useEffect } from "react";
import "./RewardEditorModal.css";

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
    console.log("🧩 Modal montado. Recompensa:", reward);
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
    if (!file) {
      console.warn("⚠️ No se seleccionó archivo.");
      return;
    }

    const form = new FormData();
    form.append("file", file);
    console.log("📤 Archivo a subir:", file.name);
    setUploading(true);

    try {
      const token = localStorage.getItem("token");
      console.log("🔐 Token localStorage:", token);
      if (!token) throw new Error("Token no disponible");

      console.log("📡 Enviando imagen a:", `${API_URL}/api/uploads`);

      const res = await fetch(`${API_URL}/api/uploads`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (jsonErr) {
        console.error("❌ Respuesta no es JSON:", text);
        throw new Error(`Respuesta del servidor no es JSON:\n${text}`);
      }

      if (!res.ok) {
        console.error("❌ Error HTTP:", res.status, data.message);
        throw new Error(data.message || "Error al subir imagen");
      }

      console.log("✅ Imagen subida correctamente:", data);

      setFormData((prev) => ({
        ...prev,
        imageUrl: data.filename,
      }));
    } catch (err) {
      console.error("🔥 EXCEPCIÓN UPLOAD:", err);
      alert("❌ Error al subir imagen:\n" + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("📤 Enviando recompensa:", formData);
      await onSave(formData);
      onClose();
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
                console.warn("⚠️ Imagen no cargó:", e.target.src);
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
