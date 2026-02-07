import { io } from 'socket.io-client';

export const connectSocket = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  const serverUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
  
  return io(serverUrl, {
    path: '/socket.io/',
    query: { token },
    auth: { token },
    transports: ['websocket'],
  });
}; 