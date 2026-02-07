import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar as CalendarIcon, MapPin, Video, Download } from 'lucide-react';
import { Doctor, TimeSlot, ConsultationType } from '@/types/appointment';
import { toast } from 'sonner';

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  doctor: Doctor;
  slot: TimeSlot;
  type: ConsultationType;
  onAddToCalendar: () => void;
  onDownloadDetails?: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  open,
  onClose,
  doctor,
  slot,
  type,
  onAddToCalendar,
  onDownloadDetails
}) => {
  const appointmentTime = new Date(slot.startTime);
  const formattedDate = appointmentTime.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = appointmentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleDownload = () => {
    if (onDownloadDetails) {
      onDownloadDetails();
    } else {
      // Default download handler
      const appointmentDetails = {
        doctor: {
          name: doctor.name,
          specialization: doctor.specialization,
          location: doctor.location.address
        },
        appointment: {
          date: formattedDate,
          time: formattedTime,
          type: type,
          fee: type === 'online' ? doctor.fees.online : doctor.fees.inPerson
        }
      };

      const blob = new Blob([JSON.stringify(appointmentDetails, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `appointment-${appointmentTime.toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Appointment details downloaded');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-health-success">
            <CheckCircle className="w-6 h-6 mr-2" />
            Appointment Confirmed!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Doctor Info */}
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
              <img 
                src={doctor.profilePhoto} 
                alt={doctor.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{doctor.name}</h3>
              <p className="text-gray-600">{doctor.specialization}</p>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="space-y-3">
            <div className="flex items-center text-gray-700">
              <CalendarIcon className="w-5 h-5 mr-2" />
              <div>
                <div>{formattedDate}</div>
                <div className="text-sm text-gray-500">{formattedTime}</div>
              </div>
            </div>

            <div className="flex items-center text-gray-700">
              {type === 'online' ? (
                <Video className="w-5 h-5 mr-2" />
              ) : (
                <MapPin className="w-5 h-5 mr-2" />
              )}
              <div>
                {type === 'online' ? (
                  <>
                    <div>Video Consultation</div>
                    <div className="text-sm text-gray-500">
                      Join link will be sent before appointment
                    </div>
                  </>
                ) : (
                  <>
                    <div>In-Person Visit</div>
                    <div className="text-sm text-gray-500">{doctor.location.address}</div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Fee Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span>Consultation Fee</span>
              <span className="font-semibold">
                ₹{type === 'online' ? doctor.fees.online : doctor.fees.inPerson}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={onAddToCalendar}
              variant="outline"
              className="w-full"
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Add to Calendar
            </Button>
            <Button
              onClick={handleDownload}
              variant="outline"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Details
            </Button>
          </div>

          {/* Note */}
          <p className="text-sm text-gray-500 text-center">
            You will receive a confirmation email with these details
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 