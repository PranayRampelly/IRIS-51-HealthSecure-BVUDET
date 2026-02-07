import { useEffect } from 'react';
import { connectSocket } from '@/services/socket';

export const useSocketProofRequests = (onEvent) => {
  useEffect(() => {
    const jwt = localStorage.getItem('token');
    if (!jwt) return;
    const socket = connectSocket(jwt);

    const events = [
      'proof-request:new',
      'proof-request:approved',
      'proof-request:denied',
      'proof-request:cancelled',
      'proof-request:created',
      'proof-request:status'
    ];
    events.forEach(event => {
      socket.on(event, (data) => onEvent && onEvent(event, data));
    });

    return () => {
      events.forEach(event => socket.off(event));
      socket.disconnect();
    };
  }, [onEvent]);
}; 