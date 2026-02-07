import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Clock, CheckCircle, XCircle, AlertCircle, Lock, Unlock } from 'lucide-react';
import { format } from 'date-fns';
import realTimeSlotService, { TimeSlot, SlotLockData } from '@/services/realTimeSlotService';

interface RealTimeSlotBookingProps {
  doctorId: string;
  selectedDate: Date;
  consultationType: 'online' | 'in-person' | 'both';
  onSlotSelect: (slot: TimeSlot) => void;
  onSlotLock: (lockData: SlotLockData) => void;
}

const RealTimeSlotBooking: React.FC<RealTimeSlotBookingProps> = ({
  doctorId,
  selectedDate,
  consultationType,
  onSlotSelect,
  onSlotLock
}) => {
  const { toast } = useToast();
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [lockedSlot, setLockedSlot] = useState<SlotLockData | null>(null);
  const [lockProgress, setLockProgress] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSlots = useCallback(async () => {
    try {
      setLoading(true);
      const availableSlots = await realTimeSlotService.getAvailableSlots(
        doctorId,
        selectedDate.toISOString().split('T')[0],
        consultationType
      );
      setSlots(availableSlots);
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast({
        title: 'Error',
        description: 'Failed to load available slots',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [doctorId, selectedDate, consultationType, toast]);

  const handleSlotClick = async (slot: TimeSlot) => {
    if (!slot.isAvailable) {
      toast({
        title: 'Slot Unavailable',
        description: 'This slot is no longer available',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSelectedSlot(slot);
      
      // Lock the slot
      const lockData = await realTimeSlotService.lockSlot(
        doctorId,
        selectedDate.toISOString().split('T')[0],
        format(new Date(slot.startTime), 'HH:mm'),
        30
      );

      if (lockData) {
        setLockedSlot(lockData);
        onSlotLock(lockData);
        
        // Start countdown timer
        const startTime = new Date().getTime();
        const endTime = new Date(lockData.expiresAt).getTime();
        const duration = endTime - startTime;

        const timer = setInterval(() => {
          const now = new Date().getTime();
          const remaining = endTime - now;
          const progress = Math.max(0, Math.min(100, ((duration - remaining) / duration) * 100));
          
          setLockProgress(progress);
          
          if (remaining <= 0) {
            clearInterval(timer);
            setLockedSlot(null);
            setSelectedSlot(null);
            toast({
              title: 'Slot Lock Expired',
              description: 'The slot lock has expired. Please select another slot.',
              variant: 'destructive'
            });
          }
        }, 1000);

        toast({
          title: 'Slot Locked',
          description: 'You have 5 minutes to complete your booking',
        });

        onSlotSelect(slot);
      }
    } catch (error) {
      console.error('Error locking slot:', error);
      setSelectedSlot(null);
      toast({
        title: 'Lock Failed',
        description: error instanceof Error ? error.message : 'Failed to lock slot',
        variant: 'destructive'
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSlots();
    setRefreshing(false);
  };

  // Set up real-time listeners
  useEffect(() => {
    // Join doctor's calendar for real-time updates
    realTimeSlotService.joinDoctorCalendar(doctorId);

    // Listen for slot updates
    const handleSlotLocked = (data: SlotLockData) => {
      if (data.doctorId === doctorId) {
        // Update slots to reflect the locked slot
        setSlots(prevSlots => 
          prevSlots.map(slot => {
            const slotTime = format(new Date(slot.startTime), 'HH:mm');
            if (slotTime === data.time && data.date === selectedDate.toISOString().split('T')[0]) {
              return { ...slot, isAvailable: false, realTimeStatus: 'locked' };
            }
            return slot;
          })
        );
      }
    };

    const handleSlotUnlocked = (data: { doctorId: string; date: string; time: string }) => {
      if (data.doctorId === doctorId && data.date === selectedDate.toISOString().split('T')[0]) {
        // Update slots to reflect the unlocked slot
        setSlots(prevSlots => 
          prevSlots.map(slot => {
            const slotTime = format(new Date(slot.startTime), 'HH:mm');
            if (slotTime === data.time) {
              return { ...slot, isAvailable: true, realTimeStatus: 'available' };
            }
            return slot;
          })
        );
      }
    };

    const handleDoctorAvailabilityUpdated = (data: { doctorId: string; availability: any }) => {
      if (data.doctorId === doctorId) {
        // Refresh slots when doctor availability changes
        fetchSlots();
      }
    };

    realTimeSlotService.on('slot:locked', handleSlotLocked);
    realTimeSlotService.on('slot:unlocked', handleSlotUnlocked);
    realTimeSlotService.on('doctor:availability:updated', handleDoctorAvailabilityUpdated);

    // Initial fetch
    fetchSlots();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSlots, 30000);

    return () => {
      realTimeSlotService.off('slot:locked', handleSlotLocked);
      realTimeSlotService.off('slot:unlocked', handleSlotUnlocked);
      realTimeSlotService.off('doctor:availability:updated', handleDoctorAvailabilityUpdated);
      realTimeSlotService.leaveDoctorCalendar(doctorId);
      clearInterval(interval);
    };
  }, [doctorId, selectedDate, consultationType, fetchSlots]);

  const getSlotStatusIcon = (slot: TimeSlot) => {
    if (!slot.isAvailable) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    if (slot.realTimeStatus === 'locked') {
      return <Lock className="w-4 h-4 text-yellow-500" />;
    }
    if (slot.realTimeStatus === 'offline') {
      return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getSlotStatusText = (slot: TimeSlot) => {
    if (!slot.isAvailable) {
      return 'Booked';
    }
    if (slot.realTimeStatus === 'locked') {
      return 'Locked';
    }
    if (slot.realTimeStatus === 'offline') {
      return 'Offline';
    }
    return 'Available';
  };

  const getSlotStatusColor = (slot: TimeSlot) => {
    if (!slot.isAvailable) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    if (slot.realTimeStatus === 'locked') {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
    if (slot.realTimeStatus === 'offline') {
      return 'bg-gray-100 text-gray-800 border-gray-200';
    }
    return 'bg-green-100 text-green-800 border-green-200';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-health-teal" />
            <span>Available Time Slots</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-teal"></div>
            <span className="ml-2">Loading slots...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-health-teal" />
            <span>Available Time Slots</span>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </p>
      </CardHeader>
      <CardContent>
        {lockedSlot && (
          <Alert className="mb-4 border-yellow-200 bg-yellow-50">
            <Lock className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>Slot locked! Complete your booking within 5 minutes.</span>
                <div className="flex items-center space-x-2">
                  <Progress value={lockProgress} className="w-20" />
                  <span className="text-xs text-yellow-700">
                    {Math.max(0, Math.ceil((new Date(lockedSlot.expiresAt).getTime() - new Date().getTime()) / 1000))}s
                  </span>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {slots.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No available slots for this date</p>
            <p className="text-sm text-gray-500 mt-2">
              Try selecting a different date or contact the doctor for availability
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {slots.map((slot) => (
              <Button
                key={slot._id}
                variant={selectedSlot?._id === slot._id ? "default" : (!slot.isAvailable ? "destructive" : "outline")}
                className={`h-16 flex flex-col items-center justify-center space-y-1 ${
                  selectedSlot?._id === slot._id 
                    ? 'bg-health-teal hover:bg-health-teal/90' 
                    : !slot.isAvailable 
                      ? 'cursor-not-allowed bg-red-50 border-red-200 text-red-700 hover:bg-red-50' 
                      : slot.isAvailable 
                        ? 'hover:bg-health-teal/10 hover:border-health-teal' 
                        : 'cursor-not-allowed opacity-50'
                }`}
                disabled={!slot.isAvailable}
                onClick={() => handleSlotClick(slot)}
              >
                <div className="flex items-center space-x-1">
                  {getSlotStatusIcon(slot)}
                  <span className="text-sm font-medium">
                    {format(new Date(slot.startTime), 'HH:mm')}
                  </span>
                </div>
                {!slot.isAvailable ? (
                  <div className="text-center">
                    <div className="text-red-600 font-medium text-xs">Booked</div>
                    <div className="text-red-500 text-xs">by another patient</div>
                  </div>
                ) : (
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getSlotStatusColor(slot)}`}
                  >
                    {getSlotStatusText(slot)}
                  </Badge>
                )}
                {slot.lastUpdated && (
                  <div className="text-xs text-gray-500">
                    Updated: {format(new Date(slot.lastUpdated), 'HH:mm:ss')}
                  </div>
                )}
              </Button>
            ))}
          </div>
        )}

        <div className="mt-4 text-xs text-gray-500 text-center">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-1">
              <Lock className="w-3 h-3 text-yellow-500" />
              <span>Locked</span>
            </div>
            <div className="flex items-center space-x-1">
              <XCircle className="w-3 h-3 text-red-500" />
              <span>Booked</span>
            </div>
            <div className="flex items-center space-x-1">
              <AlertCircle className="w-3 h-3 text-gray-500" />
              <span>Offline</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RealTimeSlotBooking;








