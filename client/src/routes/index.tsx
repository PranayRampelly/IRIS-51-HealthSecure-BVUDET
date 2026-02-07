import PublicShare from '../pages/PublicShare';
import { Route } from 'react-router-dom';
import PatientBookAppointment from '@/pages/patient/PatientBookAppointment';
import PublicDoctorProfile from '../pages/public/PublicDoctorProfile';
import PatientDashboard from '@/pages/patient/PatientDashboard';
import EmergencyServices from '@/pages/patient/EmergencyServices';
import PharmacyServices from '@/pages/patient/PharmacyServices';
import SearchMedicines from '@/pages/patient/SearchMedicines';
import Cart from '@/pages/patient/Cart.tsx';
import Checkout from '@/pages/patient/Checkout.tsx';
import PriceComparison from '@/pages/patient/PriceComparison.tsx';
import { VideoConsultationRoom } from '@/pages/patient/VideoConsultationRoom';
import DoctorAppointments from '@/pages/doctor/DoctorAppointments';
import DoctorConsultation from '@/pages/doctor/DoctorConsultation';
import { DoctorConsultationRoom } from '@/pages/doctor/DoctorConsultationRoom';
import AppointmentDetail from '@/pages/doctor/AppointmentDetail';
import DoctorCreateTemplate from '@/pages/doctor/DoctorCreateTemplate';
import DoctorNewTemplate from '@/pages/doctor/DoctorNewTemplate';
import DoctorImportTemplate from '@/pages/doctor/DoctorImportTemplate';
import DoctorTemplateLibrary from '@/pages/doctor/DoctorTemplateLibrary';
import DoctorTemplateAnalytics from '@/pages/doctor/DoctorTemplateAnalytics';
import DoctorTemplateSettings from '@/pages/doctor/DoctorTemplateSettings';
import HospitalProfile from '@/pages/hospital/HospitalProfile';
import RequestAdmission from '@/pages/patient/RequestAdmission';
import AdmissionRequests from '@/pages/patient/AdmissionRequests';
import HospitalAdmissionRequests from '@/pages/hospital/AdmissionRequests';
import BloodBankDashboard from '@/pages/bloodbank/BloodBankDashboard';
import { TestPaymentSuccess } from '@/pages/TestPaymentSuccess';
import BloodInventory from '@/pages/bloodbank/BloodInventory';
import BloodDonors from '@/pages/bloodbank/BloodDonors';
import BloodRequests from '@/pages/bloodbank/BloodRequests';
import QualityControl from '@/pages/bloodbank/QualityControl';
import EmergencyAlerts from '@/pages/bloodbank/EmergencyAlerts';
import Reports from '@/pages/bloodbank/Reports';
import BloodBankProfile from '@/pages/bloodbank/Profile';
import BloodBankSettings from '@/pages/bloodbank/Settings';

const routes = [
  <Route path="/share/:link" element={<PublicShare />} />,
  {
    path: '/appointments',
    element: <PatientBookAppointment />,
  },
  {
    path: '/doctors/:doctorId',
    element: <PublicDoctorProfile />,
  },
  {
    path: '/test-payment-success',
    element: <TestPaymentSuccess />,
  },
  // Video Consultation Routes moved to main App.tsx
  // Patient Routes
  {
    path: '/patient',
    children: [
      {
        path: 'dashboard',
        element: <PatientDashboard />,
      },
      {
        path: 'emergency',
        element: <EmergencyServices />,
      },
      {
        path: 'pharmacy',
        element: <PharmacyServices />,
      },
      {
        path: 'pharmacy/search',
        element: <SearchMedicines />,
      },
      {
        path: 'pharmacy/cart',
        element: <Cart />,
      },
      {
        path: 'pharmacy/checkout',
        element: <Checkout />,
      },
      {
        path: 'pharmacy/price-comparison',
        element: <PriceComparison />,
      },
      {
        path: 'video-consultation/:appointmentId',
        element: <VideoConsultationRoom />,
      },
      {
        path: 'request-admission',
        element: <RequestAdmission />,
      },
      {
        path: 'admission-requests',
        element: <AdmissionRequests />,
      },
    ],
  },
  // Doctor Routes
  {
    path: '/doctor',
    children: [
      {
        path: 'appointments',
        element: <DoctorAppointments />,
      },
      {
        path: 'appointments/:appointmentId',
        element: <AppointmentDetail />,
      },
      {
        path: 'create-template',
        element: <DoctorCreateTemplate />,
      },
      {
        path: 'new-template',
        element: <DoctorNewTemplate />,
      },
      {
        path: 'new-template/:id',
        element: <DoctorNewTemplate />,
      },
      {
        path: 'import-template',
        element: <DoctorImportTemplate />,
      },
      {
        path: 'template-library',
        element: <DoctorTemplateLibrary />,
      },
      {
        path: 'template-analytics',
        element: <DoctorTemplateAnalytics />,
      },
      {
        path: 'template-settings',
        element: <DoctorTemplateSettings />,
      },
    ],
  },
  // Hospital Routes
  {
    path: '/hospital',
    children: [
      {
        path: 'profile',
        element: <HospitalProfile />,
      },
      {
        path: 'admission-requests',
        element: <HospitalAdmissionRequests />,
      },
    ],
  },
  // Blood Bank Routes
  {
    path: '/bloodbank',
    children: [
      {
        path: 'dashboard',
        element: <BloodBankDashboard />,
      },
      {
        path: 'inventory',
        element: <BloodInventory />,
      },
      {
        path: 'donors',
        element: <BloodDonors />,
      },
      {
        path: 'requests',
        element: <BloodRequests />,
      },
      {
        path: 'quality-control',
        element: <QualityControl />,
      },
      {
        path: 'emergency-alerts',
        element: <EmergencyAlerts />,
      },
      {
        path: 'reports',
        element: <Reports />,
      },
      {
        path: 'profile',
        element: <BloodBankProfile />,
      },
      {
        path: 'settings',
        element: <BloodBankSettings />,
      },
    ],
  },
];

export default routes; 