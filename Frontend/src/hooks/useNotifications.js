import { useState, useEffect, useRef, useCallback } from 'react';
import API from './useApi';

const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    [0, 0.15].forEach((delay, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(i === 0 ? 880 : 1100, now + delay);
      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(0.3, now + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.3);
      osc.start(now + delay);
      osc.stop(now + delay + 0.35);
    });
  } catch {}
};

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const prevCountRef = useRef(null);
  const pollRef      = useRef(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await API.get('/notifications');
      const { notifications: notifs, unreadCount: count } = res.data;
      setNotifications(notifs);
      setUnreadCount(count);

      // Suena si hay notificaciones nuevas
      if (prevCountRef.current !== null && count > prevCountRef.current) {
        playNotificationSound();
      }
      prevCountRef.current = count;
    } catch {}
  }, []);

  useEffect(() => {
    // Primera carga inmediata
    fetchNotifications();

    // Polling cada 5 segundos (antes era 8s)
    pollRef.current = setInterval(fetchNotifications, 5000);

    // Refresca instantáneamente al volver a la pestaña
    // (sin recargar la página — solo llama al endpoint)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchNotifications();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(pollRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await API.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const markAllAsRead = async () => {
    try {
      await API.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  return { notifications, unreadCount, markAsRead, markAllAsRead };
};

export default useNotifications;
