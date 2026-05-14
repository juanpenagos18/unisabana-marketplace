import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useNotifications from '../hooks/useNotifications';

const TYPE_ICON = {
  new_message: '💬',
  new_order:   '🛒',
  order_status:'📦',
  new_review:  '⭐',
};

// T47 — Campanita de notificaciones con sonido y dropdown
const NotificationBell = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Cierra al hacer clic fuera
  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleClick = async (notif) => {
    if (!notif.isRead) await markAsRead(notif._id);
    if (notif.link) navigate(notif.link);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      {/* Botón campanita */}
      <button onClick={() => setOpen(o => !o)}
        className="relative w-9 h-9 flex items-center justify-center rounded-full transition-colors"
        style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
        title="Notificaciones">
        <span className="text-lg">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold
            text-white flex items-center justify-center"
            style={{ backgroundColor: '#EF4444' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-11 w-80 max-h-96 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col"
          style={{ backgroundColor: 'white', border: '1px solid var(--color-border)' }}>

          {/* Header dropdown */}
          <div className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: 'var(--color-border)' }}>
            <h3 className="font-bold text-sm" style={{ color: 'var(--color-primary)' }}>
              Notificaciones {unreadCount > 0 && <span className="text-red-500">({unreadCount})</span>}
            </h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                Marcar todas
              </button>
            )}
          </div>

          {/* Lista */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                <p className="text-3xl mb-2">🔕</p>
                <p>Sin notificaciones</p>
              </div>
            ) : (
              notifications.map(notif => (
                <button key={notif._id} onClick={() => handleClick(notif)}
                  className={`w-full text-left px-4 py-3 border-b flex gap-3 items-start
                    transition-colors hover:bg-gray-50
                    ${!notif.isRead ? 'bg-blue-50' : 'bg-white'}`}
                  style={{ borderColor: 'var(--color-border)' }}>
                  <span className="text-xl flex-shrink-0 mt-0.5">
                    {TYPE_ICON[notif.type] || '📋'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${!notif.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{notif.body}</p>
                    <p className="text-[10px] text-gray-300 mt-1">
                      {new Date(notif.createdAt).toLocaleString('es-CO', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <div className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                      style={{ backgroundColor: 'var(--color-primary)' }} />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
