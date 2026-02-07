import { Server } from 'socket.io';


const slotLocks: Record<string, string> = {}; // { 'doctorId:YYYY-MM-DD:HH:mm': 'patientId' }

export function initSlotSocket(io: Server) {
  io.on('connection', (socket) => {
    socket.on('lock-slot', ({ doctorId, date, time, patientId }) => {
      const key = `${doctorId}:${date}:${time}`;
      if (!slotLocks[key]) {
        slotLocks[key] = patientId;
        io.emit('slot-locked', { doctorId, date, time, patientId });
      }
    });


    socket.on('unlock-slot', ({ doctorId, date, time, patientId }) => {
      const key = `${doctorId}:${date}:${time}`;
      if (slotLocks[key] === patientId) {
        delete slotLocks[key];
        io.emit('slot-unlocked', { doctorId, date, time });
      }
    });

    socket.on('disconnect', () => {
      // Optionally clean up locks for this socket/patient
    });
  });
} 
