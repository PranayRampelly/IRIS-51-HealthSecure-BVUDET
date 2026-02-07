import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Globe, Calendar, Heart, AlertTriangle, Users, Star } from 'lucide-react';
import PatientBookAppointment from './PatientBookAppointment';
import { useSearchParams, useNavigate } from 'react-router-dom';

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  ratings?: {
    average: number;
    count: number;
  };
  fees?: {
    online: number;
    inPerson: number;
  };
  location?: {
    address: string;
  };
}

const DoctorCard = ({ doctor, onBookNow }: { doctor: Doctor; onBookNow?: (doctor: Doctor) => void }) => (
  <div className="border rounded-lg p-4 bg-white shadow-sm">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="font-semibold text-lg">{doctor.name}</h3>
        <p className="text-gray-600">{doctor.specialization}</p>
        {doctor.location && (
          <p className="text-sm text-gray-500 mt-1">{doctor.location.address}</p>
        )}
      </div>
      <div className="flex items-center">
        <Star className="w-5 h-5 text-yellow-400 mr-1" />
        <span className="font-semibold">{doctor.ratings?.average || '-'}</span>
        <span className="text-gray-500 ml-1">({doctor.ratings?.count || 0})</span>
      </div>
    </div>
    <div className="mt-2 text-sm text-gray-500">
      Fees: ₹{doctor.fees?.online} Online / ₹{doctor.fees?.inPerson} In-Person
    </div>
    {onBookNow && (
      <button
        className="mt-3 px-4 py-2 bg-health-teal text-white rounded"
        onClick={() => onBookNow(doctor)}
      >
        Book Appointment
      </button>
    )}
  </div>
);

const AllDoctors = () => {
  const [doctors, setDoctors] = React.useState<Doctor[]>([]);
  const [loading, setLoading] = React.useState(false);
  React.useEffect(() => {
    setLoading(true);
    fetch('/api/doctors/all')
      .then(res => res.json())
      .then(data => setDoctors(data.doctors || []))
      .catch(() => setDoctors([]))
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="py-8">
      <h2 className="text-xl font-semibold mb-4">All Doctors</h2>
      {loading ? (
        <div className="text-center py-8">Loading all doctors...</div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No doctors found.</div>
      ) : (
        <div className="space-y-4">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor._id} doctor={doctor} />
          ))}
        </div>
      )}
    </div>
  );
};

const MyBookings = () => {
  return (
    <div className="py-8">
      <h2 className="text-xl font-semibold mb-4">My Bookings</h2>
      <div className="text-center py-8 text-gray-500">My bookings content will be displayed here.</div>
    </div>
  );
};

const SavedDoctors = () => {
  return (
    <div className="py-8">
      <h2 className="text-xl font-semibold mb-4">Saved Doctors</h2>
      <div className="text-center py-8 text-gray-500">Saved doctors content will be displayed here.</div>
    </div>
  );
};

const EmergencyBooking = () => {
  return (
    <div className="py-8">
      <h2 className="text-xl font-semibold mb-4">Emergency Booking</h2>
      <div className="text-center py-8 text-gray-500">Emergency booking content will be displayed here.</div>
    </div>
  );
};

const FamilyAppointments = () => {
  return (
    <div className="py-8">
      <h2 className="text-xl font-semibold mb-4">Family Appointments</h2>
      <div className="text-center py-8 text-gray-500">Family appointments content will be displayed here.</div>
    </div>
  );
};

export default function AppointmentNavbar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get the active tab from URL params, default to 'nearby' if not set
  const activeTab = searchParams.get('tab') || 'nearby';
  
  const handleTabChange = (value: string) => {
    // Update URL params to preserve state on refresh
    setSearchParams({ tab: value });
  };

  return (
    <div className="w-full h-full min-h-[calc(100vh-64px)] bg-health-light-gray p-0 md:p-0">
      <div className="w-full h-full bg-white rounded-none md:rounded-2xl shadow-lg p-0 md:p-6 flex flex-col">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col flex-1 h-full">
          <TabsList className="flex flex-wrap gap-2 md:gap-4 bg-health-light-gray rounded-xl p-2 mb-8 justify-center w-full">
            <TabsTrigger value="nearby" className="flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-health-teal data-[state=active]:bg-health-teal data-[state=active]:text-white transition-all">
              <User className="w-5 h-5" /> Nearby Doctors
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-health-teal data-[state=active]:bg-health-teal data-[state=active]:text-white transition-all">
              <Globe className="w-5 h-5" /> All Doctors
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-health-teal data-[state=active]:bg-health-teal data-[state=active]:text-white transition-all">
              <Calendar className="w-5 h-5" /> My Bookings
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-health-teal data-[state=active]:bg-health-teal data-[state=active]:text-white transition-all">
              <Heart className="w-5 h-5" /> Saved Doctors
            </TabsTrigger>
            <TabsTrigger value="emergency" className="flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-health-teal data-[state=active]:bg-health-teal data-[state=active]:text-white transition-all">
              <AlertTriangle className="w-5 h-5" /> Emergency Booking
            </TabsTrigger>
            <TabsTrigger value="family" className="flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-health-teal data-[state=active]:bg-health-teal data-[state=active]:text-white transition-all">
              <Users className="w-5 h-5" /> Family Appointments
            </TabsTrigger>
          </TabsList>
          <div className="flex-1 w-full h-full">
            <TabsContent value="nearby" className="h-full w-full">
              <PatientBookAppointment />
            </TabsContent>
            <TabsContent value="all" className="h-full w-full">
              <AllDoctors />
            </TabsContent>
            <TabsContent value="bookings" className="h-full w-full">
              <MyBookings />
            </TabsContent>
            <TabsContent value="saved" className="h-full w-full">
              <SavedDoctors />
            </TabsContent>
            <TabsContent value="emergency" className="h-full w-full">
              <EmergencyBooking />
            </TabsContent>
            <TabsContent value="family" className="h-full w-full">
              <FamilyAppointments />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
} 