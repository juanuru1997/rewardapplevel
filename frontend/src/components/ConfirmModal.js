import React from "react";
import "./ConfirmModal.css";

const ConfirmModal = ({ reward, onConfirm, onCancel }) => {
  if (!reward) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>¿Canjear "{reward.title}"?</h3>
        <p>¿Estás seguro de gastar tus puntos en esta recompensa?</p>
        <div className="modal-buttons">
          <button className="cancel-btn" onClick={onCancel}>Cancelar</button>
          <button className="confirm-btn" onClick={() => onConfirm(reward)}>Confirmar</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
