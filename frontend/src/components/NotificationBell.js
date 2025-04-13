import React, { useEffect, useState } from "react";
import "./NotificationBell.css";
import { FaBell, FaTrashAlt } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  markNotificationsAsSeen,
  deleteNotification,
  deleteMultipleNotifications,
} from "../store/notificationsSlice";

const NotificationBell = () => {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.notifications);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    dispatch(fetchNotifications());

    const interval = setInterval(() => {
      if (!open) dispatch(fetchNotifications()); // ✅ Solo si el panel está cerrado
    }, 10000);

    return () => clearInterval(interval);
  }, [dispatch, open]); // 👈 escuchamos el estado de `open` también

  const toggleDropdown = () => {
    setOpen((prev) => {
      const next = !prev;
      if (next) dispatch(markNotificationsAsSeen());
      return next;
    });
  };

  const unreadCount = items.filter((n) => !n.seen).length;

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const deleteSelected = () => {
    dispatch(deleteMultipleNotifications(selected));
    setSelected([]);
  };

  return (
    <div className="notification-wrapper">
      <div className="bell-icon" onClick={toggleDropdown}>
        <FaBell className="icon" />
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </div>

      {open && (
        <div className="dropdown">
          <div className="dropdown-header">
            <strong>Notificaciones</strong>
          </div>

          {status === "loading" && items.length === 0 && (
            <p className="empty">Cargando...</p>
          )}

          {items.length === 0 && status !== "loading" && (
            <p className="empty">No hay notificaciones</p>
          )}

          {items.map((notif) => (
            <div
              className={`notif-item ${!notif.seen ? "unread" : ""}`}
              key={notif._id}
            >
              <div className="notif-left">
                <input
                  type="checkbox"
                  checked={selected.includes(notif._id)}
                  onChange={() => toggleSelect(notif._id)}
                />
                <div className="notif-text">
                  {notif.message.replace(/\n/g, " ")}
                </div>
              </div>
              <button
                className="delete-btn"
                onClick={() => dispatch(deleteNotification(notif._id))}
              >
                <FaTrashAlt />
              </button>
            </div>
          ))}

          {selected.length > 0 && (
            <div className="notif-actions">
              <button onClick={deleteSelected}>🗑 Eliminar seleccionadas</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
