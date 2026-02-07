import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Calendar as CalendarIcon, Lock } from 'lucide-react';

const getSocket = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  return io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
    query: { token },
    transports: ['websocket'],
  });
};

interface Slot {
  time: string;
  available: boolean;
}

interface CalendarProps {
  doctorId: string;
  date: Date;
  slots: Slot[];
  patientId: string;
  onSlotSelect: (slot: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({ doctorId, date, slots, patientId, onSlotSelect }) => {
  const [lockedSlots, setLockedSlots] = useState<Record<string, boolean>>({});
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on('slot-locked', ({ doctorId: dId, date: d, time }) => {
      if (dId === doctorId && d === date.toISOString().split('T')[0]) {
        setLockedSlots((prev) => ({ ...prev, [time]: true }));
      }
    });
    socket.on('slot-unlocked', ({ doctorId: dId, date: d, time }) => {
      if (dId === doctorId && d === date.toISOString().split('T')[0]) {
        setLockedSlots((prev) => {
          const newLocks = { ...prev };
          delete newLocks[time];
          return newLocks;
        });
      }
    });
    return () => {
      socket.off('slot-locked');
      socket.off('slot-unlocked');
    };
  }, [doctorId, date]);

  const handleSlotClick = (slot: string) => {
    if (!lockedSlots[slot]) {
      const socket = getSocket();
      if (!socket) return;

      socket.emit('lock-slot', {
        doctorId,
        date: date.toISOString().split('T')[0],
        time: slot,
        patientId,
      });
      setSelectedSlot(slot);
      onSlotSelect(slot);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center mb-4">
        <CalendarIcon className="w-6 h-6 text-health-teal mr-2" />
        <h3 className="text-lg font-semibold text-health-teal">Select a Time Slot</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {slots.map((slot) => (
          <button
            key={slot.time}
            disabled={!slot.available || lockedSlots[slot.time]}
            onClick={() => handleSlotClick(slot.time)}
            className={`flex items-center justify-center px-4 py-3 rounded-lg border transition-all h-16
              ${selectedSlot === slot.time ? 'bg-health-teal text-white border-health-teal' :
                !slot.available ? 'bg-red-50 text-red-700 border-red-200 cursor-not-allowed' :
                lockedSlots[slot.time] ? 'bg-gray-200 text-gray-400 border-gray-200' :
                slot.available ? 'bg-white text-health-teal border-health-teal hover:bg-health-teal/10' :
                'bg-gray-100 text-gray-400 border-gray-100'}
            `}
          >
            <div className="text-center">
              <div className="font-medium">{slot.time}</div>
              {!slot.available && (
                <div className="text-xs mt-1">
                  <div className="text-red-600 font-medium">Booked</div>
                  <div className="text-red-500">by another patient</div>
                </div>
              )}
              {lockedSlots[slot.time] && (
                <div className="text-xs mt-1">
                  <div className="text-yellow-600 font-medium">Locked</div>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Calendar; 