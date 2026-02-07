import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Bell } from 'lucide-react';

const getSocket = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  return io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
    query: { token },
    transports: ['websocket'],
  });
};

interface Notification {
  id: string;
  message: string;
  timestamp: string;
  read?: boolean;
}

const NotificationCenter: React.FC<{ userId: string }> = ({ userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('join', { userId });
    socket.on('notification', (notif: { message: string }) => {
      setNotifications((prev) => [
        { id: Date.now().toString(), message: notif.message, timestamp: new Date().toISOString() },
        ...prev,
      ]);
    });
    return () => {
      socket.off('notification');
      socket.disconnect();
    };
  }, [userId]);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-full bg-white shadow hover:bg-health-teal/10 transition"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6 text-health-teal" />
        {notifications.some(n => !n.read) && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-health-danger"></span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 animate-fade-in">
          <div className="p-4 border-b border-gray-100 font-semibold text-health-teal">Notifications</div>
          <ul className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 && (
              <li className="p-4 text-gray-400 text-center">No notifications</li>
            )}
            {notifications.map((n) => (
              <li key={n.id} className="p-4 hover:bg-health-teal/5 transition">
                <div className="text-gray-800">{n.message}</div>
                <div className="text-xs text-gray-400 mt-1">{new Date(n.timestamp).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter; 