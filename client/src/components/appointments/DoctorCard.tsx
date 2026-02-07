import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Globe, Clock, Award, Phone, Mail, Heart, ExternalLink } from 'lucide-react';
import { Doctor, TimeSlot } from '@/types/appointment';
import { appointmentService } from '@/services/appointmentService';
import { toast } from 'sonner';

interface DoctorCardProps {
  doctor: Doctor;
  onBookNow: (doctor: Doctor) => void;
  initialSaved?: boolean;
  onSavedChanged?: (doctorId: string, saved: boolean) => void;
  onViewProfile?: (doctor: Doctor) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onBookNow, initialSaved = false, onSavedChanged, onViewProfile }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState<boolean>(initialSaved);

  const toggleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (!isSaved) {
        await appointmentService.addSavedDoctor(doctor._id);
        setIsSaved(true);
        toast.success('Doctor saved');
        window.dispatchEvent(new CustomEvent('doctor-saved-changed', { detail: { doctorId: doctor._id, saved: true } }));
        onSavedChanged?.(doctor._id, true);
      } else {
        await appointmentService.removeSavedDoctor(doctor._id);
        setIsSaved(false);
        toast.success('Removed from saved');
        window.dispatchEvent(new CustomEvent('doctor-saved-changed', { detail: { doctorId: doctor._id, saved: false } }));
        onSavedChanged?.(doctor._id, false);
      }
    } catch (error) {
      toast.error('Failed to update saved doctors');
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-health-teal/10 hover:border-health-teal/30">
      <CardContent className="p-6">
        <div className="flex gap-6">
          {/* Profile Photo */}
          <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 border-4 border-health-teal/20">
            <img 
              src={doctor.profilePhoto} 
              alt={doctor.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Doctor Info */}
          <div className="flex-grow">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-health-teal mb-1">{doctor.name}</h3>
                <p className="text-health-aqua font-medium mb-1">{doctor.specialization}</p>
                {doctor.hospital && (
                  <p className="text-sm text-health-charcoal/70 mb-1">{doctor.hospital}</p>
                )}
                {doctor.department && (
                  <p className="text-sm text-health-charcoal/60 mb-2">{doctor.department}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-health-charcoal/70">
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4 text-health-aqua" />
                    <span>{doctor.experience} years experience</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-semibold">{doctor.ratings.average}</span>
                    <span className="text-health-charcoal/60">({doctor.ratings.count} reviews)</span>
                  </div>
                  {/* Distance Display */}
                  {(doctor as Doctor & { distance?: number }).distance !== undefined && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-health-teal" />
                      <span className="font-medium text-health-teal">
                        {(doctor as Doctor & { distance?: number }).distance!.toFixed(2)}km away
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Emergency Badge */}
              {doctor.emergencyAvailable && (
                <Badge className="bg-health-warning text-white border-health-warning">
                  <Clock className="w-3 h-3 mr-1" />
                  24/7
                </Badge>
              )}
            </div>

            {/* Languages & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div className="flex items-center text-sm text-health-charcoal/70">
                <Globe className="w-4 h-4 mr-2 text-health-aqua" />
                <span className="font-medium">Languages:</span>
                <span className="ml-1">{doctor.languages.join(', ')}</span>
              </div>
              <div className="flex items-center text-sm text-health-charcoal/70">
                <MapPin className="w-4 h-4 mr-2 text-health-aqua" />
                <span className="font-medium">Location:</span>
                <span className="ml-1">
                  {doctor.location.address}
                  {doctor.location.pincode && `, ${doctor.location.pincode}`}
                </span>
              </div>
            </div>

            {/* Specialties */}
            {doctor.specialties && doctor.specialties.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium text-health-charcoal/70 mb-2">Specialties:</p>
                <div className="flex flex-wrap gap-2">
                  {doctor.specialties.slice(0, 3).map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                  {doctor.specialties.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{doctor.specialties.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Bio Preview */}
            {doctor.bio && (
              <div className="mb-3">
                <p className="text-sm text-health-charcoal/70 line-clamp-2">
                  {doctor.bio.length > 120 ? `${doctor.bio.substring(0, 120)}...` : doctor.bio}
                </p>
              </div>
            )}

            {/* Fees */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-health-light-gray/30 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-health-charcoal/70">Online Consultation</p>
                    <p className="text-lg font-bold text-health-teal">₹{doctor.fees.online}</p>
                  </div>
                  <div className="text-xs text-health-charcoal/50">15-20 min</div>
                </div>
              </div>
              <div className="bg-health-light-gray/30 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-health-charcoal/70">In-Person Visit</p>
                    <p className="text-lg font-bold text-health-teal">₹{doctor.fees.inPerson}</p>
                  </div>
                  <div className="text-xs text-health-charcoal/50">20-30 min</div>
                </div>
              </div>
            </div>

            {/* Real Availability Information */}
            {doctor.availability && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center text-sm text-health-charcoal/70">
                    <Clock className="w-4 h-4 mr-2 text-health-aqua" />
                    <span className="font-medium">Working Hours</span>
                  </div>
                  <Badge 
                    variant={doctor.availability.isWorkingToday ? "default" : "secondary"}
                    className={doctor.availability.isWorkingToday 
                      ? "bg-green-100 text-green-800 border-green-200" 
                      : "bg-gray-100 text-gray-800 border-gray-200"
                    }
                  >
                    {doctor.availability.isWorkingToday ? "Available Today" : "Not Working Today"}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-health-charcoal/50">Start:</span>
                    <span className="ml-1 font-medium">{doctor.availability.startTime}</span>
                  </div>
                  <div>
                    <span className="text-health-charcoal/50">End:</span>
                    <span className="ml-1 font-medium">{doctor.availability.endTime}</span>
                  </div>
                  <div>
                    <span className="text-health-charcoal/50">Duration:</span>
                    <span className="ml-1 font-medium">{doctor.availability.appointmentDuration} min</span>
                  </div>
                  <div>
                    <span className="text-health-charcoal/50">Status:</span>
                    <span className={`ml-1 font-medium ${
                      doctor.availability.status === 'available' ? 'text-green-600' : 
                      doctor.availability.status === 'away' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {doctor.availability.status}
                    </span>
                  </div>
                </div>
                
                {/* Working Days */}
                {doctor.availability.workingDays && doctor.availability.workingDays.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs text-health-charcoal/50">Working Days: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {doctor.availability.workingDays.map((day: string) => (
                        <Badge 
                          key={day} 
                          variant="outline" 
                          className="text-xs px-2 py-1 border-health-teal/30 text-health-teal"
                        >
                          {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Next Available Slots */}
            {doctor.availableSlots && doctor.availableSlots.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center text-sm text-health-charcoal/70 mb-2">
                  <Clock className="w-4 h-4 mr-2 text-health-aqua" />
                  <span className="font-medium">Next Available:</span>
                </div>
                <div className="flex gap-2">
                  {doctor.availableSlots.slice(0, 3).map((slot) => (
                    <Badge 
                      key={slot._id} 
                      variant="outline"
                      className="text-xs border-health-teal/30 text-health-teal"
                    >
                      {new Date(slot.startTime).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Badge>
                  ))}
                  {doctor.availableSlots.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{doctor.availableSlots.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-health-light-gray/50">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={toggleSave} disabled={isSaving}
                  className={isSaved ? 'border-health-teal text-health-teal' : undefined}
                >
                  <Heart className={`w-4 h-4 mr-1 ${isSaved ? 'fill-current' : ''}`} />
                  {isSaved ? 'Saved' : 'Save'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => onViewProfile ? onViewProfile(doctor) : onBookNow(doctor)}>
                  <ExternalLink className="w-4 h-4 mr-1" />
                  View Profile
                </Button>
              </div>
              <Button 
                onClick={() => onBookNow(doctor)}
                className="bg-health-teal hover:bg-health-teal/90 text-white px-6"
              >
                Book Now
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 