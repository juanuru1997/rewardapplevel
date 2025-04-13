import React, { useState } from "react";
import axios from "axios";
import "./ImageUploader.css";

const ImageUploader = ({ onUpload }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState("");

  const handleChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token no encontrado en localStorage");

      const res = await axios.post("http://localhost:5000/api/uploads", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.data?.url) {
        throw new Error("Respuesta inválida del servidor");
      }

      // ✅ Usamos directamente la URL pública que devuelve el backend
      onUpload(res.data.url);
    } catch (err) {
      console.error("❌ Error subiendo imagen:", err.message || err);
      alert("❌ Error subiendo imagen: " + (err.message || err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="uploader">
      <input type="file" accept="image/*" onChange={handleChange} />
      {preview && <img src={preview} alt="preview" className="preview" />}
      <button onClick={handleUpload} disabled={!file || uploading}>
        {uploading ? "Subiendo..." : "Subir Imagen"}
      </button>
    </div>
  );
};

export default ImageUploader;
