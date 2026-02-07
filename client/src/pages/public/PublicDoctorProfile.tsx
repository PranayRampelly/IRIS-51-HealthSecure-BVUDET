import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Globe, Award, MapPin, Star, Heart } from 'lucide-react';
import { appointmentService } from '@/services/appointmentService';
import api from '@/lib/api';
import { toast } from 'sonner';
import { DoctorProfileModal } from '@/components/appointments/DoctorProfileModal';
import { Doctor, TimeSlot, ConsultationType } from '@/types/appointment';

interface DoctorLite {
  _id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  profileImage?: string;
  profilePhoto?: string;
  specialization?: string;
  experience?: number;
  yearsOfExperience?: number;
  languages?: string[];
  ratings?: { average: number; count: number };
  hospital?: string;
  department?: string;
  bio?: string;
  consultationFees?: { online?: number; inPerson?: number };
  fees?: { online?: number; inPerson?: number };
  location?: { address?: string; pincode?: string; lat?: number; lng?: number };
  availability?: any;
  specialties?: string[];
}

const PublicDoctorProfile: React.FC = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<DoctorLite | null>(null);
  const [loading, setLoading] = useState(true);
  const [weekly, setWeekly] = useState<Record<string, any>>({});
  const [reviews, setReviews] = useState<any[]>([]);
  const [totalAppointments, setTotalAppointments] = useState<number | null>(null);
  const [practiceLocations, setPracticeLocations] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Prefer complete profile endpoint (includes reviews, appointments, locations)
        let fullProfile: any | null = null;
        try {
          const resp = await api.get(`/doctors/${doctorId}/profile`);
          fullProfile = resp.data?.data || resp.data || null;
        } catch {
          fullProfile = null;
        }

        if (fullProfile) {
          // Map server profile to our shape
          const mapped: DoctorLite = {
            _id: fullProfile._id,
            name: fullProfile.name,
            firstName: fullProfile.firstName,
            lastName: fullProfile.lastName,
            specialization: fullProfile.specialization,
            experience: fullProfile.experience,
            languages: fullProfile.languages || [],
            bio: fullProfile.about,
            profileImage: fullProfile.profilePicture,
            location: { address: fullProfile.practiceLocations?.[0]?.address?.full || '' },
            hospital: fullProfile.practiceLocations?.[0]?.name,
          };
          setDoctor(mapped);
          setReviews(fullProfile.reviews || []);
          setTotalAppointments(fullProfile.totalAppointments || null);
          setPracticeLocations(fullProfile.practiceLocations || []);
        } else {
          // Fallback to generic transformation
          const d = await appointmentService.getDoctorById(doctorId as string);
          setDoctor(d as any);
        }

        // Weekly availability
        const start = new Date();
        const ws = await appointmentService.getWeeklySlots(doctorId as string, start, 7);
        setWeekly(ws);
      } catch (e) {
        // noop
      } finally {
        setLoading(false);
      }
    };
    if (doctorId) load();
  }, [doctorId]);

  const toggleSave = async () => {
    if (!doctor) return;
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (!isSaved) {
        await appointmentService.addSavedDoctor(doctor._id);
        setIsSaved(true);
        toast.success('Doctor saved');
      } else {
        await appointmentService.removeSavedDoctor(doctor._id);
        setIsSaved(false);
        toast.success('Removed from saved');
      }
    } catch {
      toast.error('Failed to update saved doctors');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">Loading doctor profile...</div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">Doctor not found</div>
      </div>
    );
  }

  const displayName = doctor.name || `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() || 'Doctor';
  const photo = doctor.profilePhoto || doctor.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doctor._id}`;
  const fees = doctor.fees || doctor.consultationFees || {};
  const formatDate = (iso: string) => {
    try {
      const dt = new Date(iso);
      return dt.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    } catch {
      return iso;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-6">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-health-teal/20">
          <img src={photo} alt={displayName} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-health-teal">{displayName}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            {doctor.specialization && (
              <Badge className="bg-health-aqua text-white">{doctor.specialization}</Badge>
            )}
            {doctor.experience || doctor.yearsOfExperience ? (
              <div className="flex items-center gap-1 text-health-charcoal/70">
                <Award className="w-4 h-4 text-health-aqua" />
                <span>{doctor.experience || doctor.yearsOfExperience} yrs</span>
              </div>
            ) : null}
            {doctor.ratings?.average ? (
              <div className="flex items-center gap-1 text-health-charcoal/70">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="font-semibold">{doctor.ratings.average}</span>
                <span className="text-health-charcoal/60">({doctor.ratings.count || 0})</span>
              </div>
            ) : null}
          </div>
          {doctor.hospital && (
            <div className="flex items-center gap-2 text-sm text-health-charcoal/70 mt-1">
              <MapPin className="w-4 h-4 text-health-aqua" />
              <span>{doctor.hospital}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button variant="outline" onClick={() => setShowBooking(true)} className="border-health-teal text-health-teal hover:bg-health-teal hover:text-white">Book Appointment</Button>
          <Button variant="outline" onClick={toggleSave} disabled={isSaving} className={`border-health-teal text-health-teal ${isSaved ? 'bg-health-teal/5' : ''}`}>
            <Heart className={`w-4 h-4 mr-1 ${isSaved ? 'fill-current' : ''}`} />{isSaved ? 'Saved' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Bio */}
      {doctor.bio && (
        <Card>
          <CardHeader>
            <CardTitle className="text-health-teal">About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-health-charcoal/80 leading-relaxed">{doctor.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Fees & Languages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-health-teal flex items-center gap-2"><Calendar className="w-5 h-5" /> Consultation Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-health-charcoal/70">Online</span>
                <span className="text-health-teal font-semibold">₹{fees.online || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-health-charcoal/70">In-Person</span>
                <span className="text-health-teal font-semibold">₹{fees.inPerson || 0}</span>
              </div>
              {typeof totalAppointments === 'number' && (
                <div className="flex items-center justify-between">
                  <span className="text-health-charcoal/70">Total Appointments</span>
                  <span className="text-health-teal font-semibold">{totalAppointments}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-health-teal flex items-center gap-2"><Globe className="w-5 h-5" /> Languages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(doctor.languages || ['English']).map((lang) => (
                <Badge key={lang} variant="secondary">{lang}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-health-teal flex items-center gap-2"><Clock className="w-5 h-5" /> Availability</CardTitle>
          </CardHeader>
          <CardContent>
            {weekly && Object.keys(weekly).length > 0 ? (
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.values(weekly as any).slice(0,7).map((d: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-health-charcoal/70">{formatDate(d.date)}</span>
                    <span className="text-health-teal font-medium">{d.availableSlots} slots</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-health-blue-gray">Schedule information not available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Practice Locations */}
      {practiceLocations && practiceLocations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-health-teal">Practice Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {practiceLocations.map((loc: any, i: number) => (
                <div key={i} className="p-3 border rounded">
                  <div className="font-medium text-health-charcoal">{loc.name || 'Clinic/Hospital'}</div>
                  <div className="text-sm text-health-charcoal/70">{loc.address?.full || loc.address || 'Address not available'}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews */}
      {reviews && reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-health-teal">Recent Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reviews.map((r: any, idx: number) => (
                <div key={idx} className="p-3 border rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{r.rating || r.stars || 5}</span>
                    <span className="text-xs text-health-charcoal/60">{r.date ? new Date(r.date).toLocaleDateString() : ''}</span>
                  </div>
                  <div className="text-sm text-health-charcoal/80">{r.comment || r.text}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Specialties */}
      {doctor.specialties && doctor.specialties.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-health-teal">Specialties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {doctor.specialties.map((s) => (
                <Badge key={s} variant="outline" className="border-health-teal/30 text-health-teal">{s}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booking Stepper Modal */}
      <DoctorProfileModal
        doctor={buildModalDoctor(doctor) as unknown as Doctor}
        open={showBooking}
        onClose={() => setShowBooking(false)}
        onBookAppointment={async (doc: Doctor, slot: any, type: ConsultationType) => {
          try {
            await appointmentService.bookAppointment(doc._id, slot._id, type);
            toast.success('Appointment booked successfully');
            setShowBooking(false);
          } catch (e: any) {
            toast.error(e?.message || 'Failed to book appointment');
          }
        }}
      />
    </div>
  );
};

// Helper to transform current doctor lite to modal Doctor shape
const buildModalDoctor = (d: DoctorLite): Doctor => {
  return {
    _id: d._id,
    name: d.name || `${d.firstName || ''} ${d.lastName || ''}`.trim() || 'Doctor',
    profilePhoto: d.profilePhoto || d.profileImage || '',
    specialization: d.specialization || 'General Physician',
    experience: (d.experience as number) || (d.yearsOfExperience as number) || 0,
    languages: d.languages || ['English'],
    ratings: d.ratings || { average: 4.5, count: 0 },
    fees: d.fees || d.consultationFees || { online: 0, inPerson: 0 },
    location: {
      address: d.location?.address || d.hospital || 'Address not available',
      coordinates: [d.location?.lng || 0, d.location?.lat || 0],
      pincode: d.location?.pincode || '000000'
    },
    availableSlots: [],
    hospital: d.hospital,
    department: d.department,
    bio: d.bio,
    emergencyAvailable: false,
    specialties: d.specialties || (d.specialization ? [d.specialization] : [])
  } as Doctor;
};

export default PublicDoctorProfile;
