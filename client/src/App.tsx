
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import EmailVerification from "./pages/EmailVerification";
import VerifyEmail from "./pages/VerifyEmail";
import DashboardLayout from "./components/layout/DashboardLayout";
import TwoFASetup from './pages/TwoFASetup';

// Public Pages
import Resources from "./pages/public/Resources";
import Contact from "./pages/public/Contact";
import PrivacyPolicy from "./pages/public/PrivacyPolicy";
import TermsOfService from "./pages/public/TermsOfService";
import Compliance from "./pages/public/Compliance";
import PublicShare from './pages/PublicShare';
import PublicDoctorProfile from './pages/public/PublicDoctorProfile';
import Features from '@/components/Features';

// Patient Dashboard Pages
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientRecords from "./pages/patient/PatientRecords";
import PatientProofs from "./pages/patient/PatientProofs";
import PatientLogs from "./pages/patient/PatientLogs";
import PatientSettings from "./pages/patient/PatientSettings";
import PatientRecordDetail from "./pages/patient/PatientRecordDetail";
import PatientProofDetail from "./pages/patient/PatientProofDetail";
import MyProfile from "./pages/patient/MyProfile";
import AccountSettings from "./pages/patient/AccountSettings";
import PatientBookAppointment from "./pages/patient/PatientBookAppointment";
import DocumentVault from "./pages/patient/DocumentVault";
import ActivityDashboard from "./pages/patient/ActivityDashboard";
import ActiveShares from "./pages/patient/ActiveShares";
import Help from "./pages/patient/Help";
import HealthCoach from "./pages/patient/HealthCoach";
import PatientInsurance from "./pages/patient/PatientInsurance";
import ApplyForInsurance from "./pages/patient/ApplyForInsurance";
import SubmitClaim from "./pages/patient/SubmitClaim";
import TestButtons from "./pages/patient/TestButtons";
import SubmitClaimMinimal from "./pages/patient/SubmitClaimMinimal";
import EmergencyServices from "./pages/patient/EmergencyServices";
import PharmacyServices from "./pages/patient/PharmacyServices";
import BookAmbulance from "./pages/patient/BookAmbulance";
import EmergencyContacts from "./pages/patient/EmergencyContacts";
import SearchMedicines from "./pages/patient/SearchMedicines";
import Cart from "./pages/patient/Cart";
import PriceComparison from "./pages/patient/PriceComparison";
import MyPrescriptions from "./pages/patient/MyPrescriptions";
import OrderMedicines from "./pages/patient/OrderMedicines";
import TrackOrders from "./pages/patient/TrackOrders";
import Checkout from "./pages/patient/Checkout";
import HospitalServices from "./pages/patient/HospitalServices";
import HospitalDirectory from "./pages/patient/HospitalDirectory";
import HospitalDetail from "./pages/patient/HospitalDetail";
import BedAvailability from "./pages/patient/BedAvailability";
import BookBed from "./pages/patient/BookBed";
import BookingConfirmation from "./pages/patient/BookingConfirmation";
import HospitalDetails from "./pages/patient/HospitalDetails";
import FindDoctors from "./pages/patient/FindDoctors";
import DoctorDetails from "./pages/patient/DoctorDetails";
import PatientDoctorProfile from "./pages/patient/DoctorProfile";
import HospitalAppointments from "./pages/patient/HospitalAppointments";
import EditAppointment from "./pages/patient/EditAppointment";
import RescheduleAppointment from "./pages/patient/RescheduleAppointment";
import CancelAppointment from "./pages/patient/CancelAppointment";
import ContactDoctor from "./pages/patient/ContactDoctor";
import HospitalDiscovery from "./pages/patient/HospitalDiscovery";
import RequestAdmission from "./pages/patient/RequestAdmission";
import AdmissionRequests from "./pages/patient/AdmissionRequests";
import PatientAIAssistant from "./pages/patient/PatientAIAssistant";
import PatientMessages from "./pages/patient/PatientMessages";
import HospitalAdmissionRequests from "./pages/hospital/AdmissionRequests";

// Doctor Dashboard Pages
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorRequestProof from "./pages/doctor/DoctorRequestProof";
import DoctorVerifyProofs from "./pages/doctor/DoctorVerifyProofs";
import DoctorUploadPrescription from "./pages/doctor/DoctorUploadPrescription";
import DoctorPatients from "./pages/doctor/DoctorPatients";
import DoctorSettings from "./pages/doctor/DoctorSettings";
import DoctorPatientDetail from "./pages/doctor/DoctorPatientDetail";
import DoctorProofDetail from "./pages/doctor/DoctorProofDetail";
import DoctorAllProofRequests from "./pages/doctor/DoctorAllProofRequests";
import DoctorCreateTemplate from "./pages/doctor/DoctorCreateTemplate";
import DoctorNewTemplate from "./pages/doctor/DoctorNewTemplate";
import DoctorImportTemplate from "./pages/doctor/DoctorImportTemplate";
import DoctorTemplateLibrary from "./pages/doctor/DoctorTemplateLibrary";
import DoctorTemplateAnalytics from "./pages/doctor/DoctorTemplateAnalytics";
import DoctorTemplateSettings from "./pages/doctor/DoctorTemplateSettings";
import DoctorPatientSearch from "./pages/doctor/DoctorPatientSearch";
import DoctorProfile from "./pages/doctor/DoctorProfile";
import DoctorAnalytics from "./pages/doctor/DoctorAnalytics";
import DoctorPatientRecords from "./pages/doctor/DoctorPatientRecords";
import DoctorPatientAnalytics from "./pages/doctor/DoctorPatientAnalytics";
import DoctorScheduleAppointment from "./pages/doctor/DoctorScheduleAppointment";
import DoctorMessages from "./pages/doctor/DoctorMessages";
import DoctorNotifications from "./pages/doctor/DoctorNotifications";
// Doctor Appointment and Consultation Pages
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import AppointmentDetail from "./pages/doctor/AppointmentDetail";
import DoctorConsultations from "./pages/doctor/DoctorConsultations";
import DoctorConsultation from "./pages/doctor/DoctorConsultation";
import DoctorConsultationHistory from "./pages/doctor/DoctorConsultationHistory";
import { DoctorConsultationRoom } from "./pages/doctor/DoctorConsultationRoom";
import { VideoConsultationRoom } from "./pages/patient/VideoConsultationRoom";
import DoctorProofTemplates from "./pages/doctor/DoctorProofTemplates";
import DoctorPrescriptionHistory from "./pages/doctor/DoctorPrescriptionHistory";
import DoctorDocumentVault from "./pages/doctor/DoctorDocumentVault";
import DoctorCertificates from "./pages/doctor/DoctorCertificates";
import DoctorReferrals from "./pages/doctor/DoctorReferrals";
import DoctorAvailability from "./pages/doctor/DoctorAvailability";
import DoctorPracticeAnalytics from "./pages/doctor/DoctorPracticeAnalytics";
import DoctorPatientInsights from "./pages/doctor/DoctorPatientInsights";
import DoctorConsultationReports from "./pages/doctor/DoctorConsultationReports";
import DoctorRevenueAnalytics from "./pages/doctor/DoctorRevenueAnalytics";
import DoctorAIAssistant from "./pages/doctor/DoctorAIAssistant";
import DoctorGuidelines from "./pages/doctor/DoctorGuidelines";
import DoctorDrugDatabase from "./pages/doctor/DoctorDrugDatabase";
import DoctorCalculator from "./pages/doctor/DoctorCalculator";
import DoctorAccountSettings from "./pages/doctor/DoctorAccountSettings";
import DoctorLogs from "./pages/doctor/DoctorLogs";
import DoctorHelp from "./pages/doctor/DoctorHelp";

// Insurance Dashboard Pages
import InsuranceDashboard from "./pages/insurance/InsuranceDashboard";
import InsuranceClaims from "./pages/insurance/InsuranceClaims";
import InsuranceValidateProofs from "./pages/insurance/InsuranceValidateProofs";
import InsurancePolicies from "./pages/insurance/InsurancePolicies";
import CreatePolicy from "./pages/insurance/CreatePolicy";
import InsuranceReports from "./pages/insurance/InsuranceReports";
import CreateClaim from "./pages/insurance/CreateClaim";
import InsuranceSettings from "./pages/insurance/InsuranceSettings";
import InsuranceRequestProof from "./pages/insurance/InsuranceRequestProof";
import InsuranceClaimDetail from "./pages/insurance/InsuranceClaimDetail";
import InsuranceApplications from "./pages/insurance/InsuranceApplications";

// Pharmacy Dashboard Pages
import PharmacyDashboard from './pages/pharmacy/PharmacyDashboard';
import Orders from './pages/pharmacy/Orders';
import Prescriptions from './pages/pharmacy/Prescriptions';
import Inventory from './pages/pharmacy/Inventory';
import PharmacyReports from './pages/pharmacy/Reports';
import Suppliers from './pages/pharmacy/Suppliers';
import Customers from './pages/pharmacy/Customers';
import PharmacySettings from './pages/pharmacy/Settings';
import PharmacyMyProfile from './pages/pharmacy/MyProfile';

// Researcher Dashboard Pages
import ResearcherDashboard from "./pages/researcher/ResearcherDashboard";
import ResearcherQueryBuilder from "./pages/researcher/ResearcherQueryBuilder";
import ResearcherQueries from "./pages/researcher/ResearcherQueries";
import ResearcherDatasets from "./pages/researcher/ResearcherDatasets";
import ResearcherExports from "./pages/researcher/ResearcherExports";
import ResearcherSettings from "./pages/researcher/ResearcherSettings";
import ResearcherQueryResults from "./pages/researcher/ResearcherQueryResults";

// Admin Dashboard Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import AdminSystemHealth from "./pages/admin/AdminSystemHealth";
import AdminCompliance from "./pages/admin/AdminCompliance";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminUserEdit from "./pages/admin/AdminUserEdit";

import NotFound from "./pages/NotFound";
import { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import HospitalDashboard from './pages/hospital/HospitalDashboard';
import HospitalProfile from './pages/hospital/HospitalProfile';
import HospitalMyProfile from './pages/hospital/HospitalMyProfile';
import HospitalAnalytics from './pages/hospital/HospitalAnalytics';
import HospitalPatients from './pages/hospital/HospitalPatients';
import HospitalAdmissions from './pages/hospital/HospitalAdmissions';
import HospitalDepartments from './pages/hospital/HospitalDepartments';
import HospitalBilling from './pages/hospital/HospitalBilling';
import HospitalStaff from './pages/hospital/HospitalStaff';
import HospitalReports from './pages/hospital/HospitalReports';
import HospitalSettings from './pages/hospital/HospitalSettings';

// Blood Bank Dashboard Pages
import BloodBankDashboard from './pages/bloodbank/BloodBankDashboard';
import BloodInventory from './pages/bloodbank/BloodInventory';
import BloodDonors from './pages/bloodbank/BloodDonors';
import BloodRequests from './pages/bloodbank/BloodRequests';
import QualityControl from './pages/bloodbank/QualityControl';
import EmergencyAlerts from './pages/bloodbank/EmergencyAlerts';
import Reports from './pages/bloodbank/Reports';
import Settings from './pages/bloodbank/Settings';
import Profile from './pages/bloodbank/Profile';
import ProfileCompletionCheck from './components/bloodbank/ProfileCompletionCheck';

// Hospital Patient Care Pages
import PatientCare from './pages/hospital/PatientCare';
import PatientManagement from './pages/hospital/PatientManagement';
import Admissions from './pages/hospital/Admissions';
import Discharges from './pages/hospital/Discharges';
import HospitalPatientRecords from './pages/hospital/PatientRecords';
import PatientTracking from './pages/hospital/PatientTracking';
import EmergencyCases from './pages/hospital/EmergencyCases';

// Hospital Staff Management Pages
import StaffDirectory from './pages/hospital/StaffDirectory';
import DoctorManagement from './pages/hospital/DoctorManagement';
import NurseManagement from './pages/hospital/NurseManagement';
import StaffScheduling from './pages/hospital/StaffScheduling';
import StaffTraining from './pages/hospital/StaffTraining';
import PerformanceReviews from './pages/hospital/PerformanceReviews';

// Hospital Operations Pages
import BedManagement from './pages/hospital/BedManagement';
import RoomManagement from './pages/hospital/RoomManagement';
import InventoryManagement from './pages/hospital/InventoryManagement';
import EquipmentMaintenance from './pages/hospital/EquipmentMaintenance';
import FacilityManagement from './pages/hospital/FacilityManagement';
import Security from './pages/hospital/Security';
import Ambulance from './pages/hospital/Ambulance';

// Hospital Ambulance Pages
import AmbulanceDrivers from './pages/hospital/AmbulanceDrivers';
import VehicleFleet from './pages/hospital/VehicleFleet';
import EmergencyCalls from './pages/hospital/EmergencyCalls';
import PatientTransport from './pages/hospital/PatientTransport';
import RoutePlanning from './pages/hospital/RoutePlanning';
import DispatchCenter from './pages/hospital/DispatchCenter';

// BioAura Pages
import BioAuraDashboard from './pages/bioaura/BioAuraDashboard';
import EnvironmentDashboard from './pages/bioaura/EnvironmentDashboard';
import AirQualityMonitoring from './pages/bioaura/AirQualityMonitoring';
import ClimateAnalysis from './pages/bioaura/ClimateAnalysis';
import PollutionTrends from './pages/bioaura/PollutionTrends';
import RegionalEnvironmentMap from './pages/bioaura/RegionalEnvironmentMap';
import EnvironmentAlerts from './pages/bioaura/EnvironmentAlerts';
import HealthIndex from './pages/bioaura/HealthIndex';
import DemandPatterns from './pages/bioaura/DemandPatterns';
import SalesAnalytics from './pages/bioaura/SalesAnalytics';
import StockAnalysis from './pages/bioaura/StockAnalysis';
import PharmacyNetwork from './pages/bioaura/PharmacyNetwork';
import RegionalInsights from './pages/bioaura/RegionalInsights';
import ApiIntegration from './pages/bioaura/ApiIntegration';
import DiseasePrediction from './pages/bioaura/DiseasePrediction';
import PharmacyIntelligence from './pages/bioaura/PharmacyIntelligence';

// Initialize mock data when app starts
const queryClient = new QueryClient();

const App = () => {

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/home" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/email-verification" element={<EmailVerification />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/features" element={<Features />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/compliance" element={<Compliance />} />
              <Route path="/2fa-setup" element={<TwoFASetup />} />
              <Route path="/share/:link" element={<PublicShare />} />
              <Route path="/doctors/:doctorId" element={<PublicDoctorProfile />} />

              {/* Video Consultation Routes (outside dashboard layout) */}
              <Route path="/doctor/consultation/:appointmentId" element={<DoctorConsultationRoom />} />
              <Route path="/patient/video-consultation/:appointmentId" element={<VideoConsultationRoom />} />

              {/* Patient Dashboard Routes */}
              <Route path="/patient/*" element={<DashboardLayout role="patient" />}>
                <Route path="" element={<PatientDashboard />} />
                <Route path="dashboard" element={<PatientDashboard />} />
                <Route path="records" element={<PatientRecords />} />
                <Route path="records/:recordId" element={<PatientRecordDetail />} />
                <Route path="proofs" element={<PatientProofs />} />
                <Route path="proof/:proofId" element={<PatientProofDetail />} />
                <Route path="insurance" element={<PatientInsurance />} />
                <Route path="apply-insurance" element={<ApplyForInsurance />} />
                <Route path="submit-claim" element={<SubmitClaim />} />
                <Route path="submit-claim/:claimId" element={<SubmitClaim />} />
                <Route path="test-buttons" element={<TestButtons />} />
                <Route path="submit-claim-minimal" element={<SubmitClaimMinimal />} />
                <Route path="logs" element={<PatientLogs />} />
                <Route path="profile" element={<MyProfile />} />
                <Route path="account-settings" element={<AccountSettings />} />
                <Route path="book-appointment" element={<PatientBookAppointment />} />
                <Route path="health-coach" element={<HealthCoach />} />
                <Route path="document-vault" element={<DocumentVault />} />
                <Route path="document-vault/activity" element={<ActivityDashboard />} />
                <Route path="document-vault/shares" element={<ActiveShares />} />
                <Route path="help" element={<Help />} />
                <Route path="emergency" element={<EmergencyServices />} />
                <Route path="pharmacy" element={<PharmacyServices />} />
                <Route path="pharmacy/search" element={<SearchMedicines />} />
                <Route path="pharmacy/cart" element={<Cart />} />
                <Route path="pharmacy/price-comparison" element={<PriceComparison />} />
                <Route path="pharmacy/prescriptions" element={<MyPrescriptions />} />
                <Route path="pharmacy/order" element={<OrderMedicines />} />
                <Route path="pharmacy/track-orders" element={<TrackOrders />} />
                <Route path="pharmacy/checkout" element={<Checkout />} />
                <Route path="hospitals" element={<HospitalDiscovery />} />
                <Route path="ambulance" element={<BookAmbulance />} />
                <Route path="emergency-contacts" element={<EmergencyContacts />} />
                <Route path="hospital-services" element={<HospitalServices />} />
                <Route path="hospital-directory" element={<HospitalDirectory />} />
                <Route path="bed-availability" element={<BedAvailability />} />
                <Route path="book-bed" element={<BookBed />} />
                <Route path="book-bed/:hospitalId" element={<BookBed />} />
                <Route path="booking-confirmation" element={<BookingConfirmation />} />
                <Route path="hospital-details/:hospitalId" element={<HospitalDetails />} />
                <Route path="hospital/:id" element={<HospitalDetail />} />
                <Route path="find-doctors" element={<FindDoctors />} />
                <Route path="doctor-details/:doctorId" element={<DoctorDetails />} />
                <Route path="doctor-profile/:doctorId" element={<PatientDoctorProfile />} />
                <Route path="hospital-appointments" element={<HospitalAppointments />} />
                <Route path="edit-appointment/:id" element={<EditAppointment />} />
                <Route path="reschedule-appointment/:id" element={<RescheduleAppointment />} />
                <Route path="cancel-appointment/:id" element={<CancelAppointment />} />
                <Route path="contact-doctor/:id" element={<ContactDoctor />} />
                <Route path="hospital-discovery" element={<HospitalDiscovery />} />
                <Route path="request-admission" element={<RequestAdmission />} />
                <Route path="admission-requests" element={<AdmissionRequests />} />
                <Route path="messages" element={<PatientMessages />} />
                <Route path="ai-assistant" element={<PatientAIAssistant />} />
              </Route>

              {/* BioAura Dashboard Routes */}
              <Route path="/bioaura/*" element={<DashboardLayout role="bioaura" />}>
                <Route path="" element={<BioAuraDashboard />} />
                <Route path="dashboard" element={<BioAuraDashboard />} />
                <Route path="disease-prediction" element={<DiseasePrediction />} />
                <Route path="pharmacy-intelligence" element={<PharmacyIntelligence />} />
                <Route path="health-index" element={<HealthIndex />} />
                <Route path="demand-patterns" element={<DemandPatterns />} />
                <Route path="sales-analytics" element={<SalesAnalytics />} />
                <Route path="stock-analysis" element={<StockAnalysis />} />
                <Route path="pharmacy-network" element={<PharmacyNetwork />} />
                <Route path="regional-insights" element={<RegionalInsights />} />
                <Route path="api-integration" element={<ApiIntegration />} />
                {/* Environment Agent Routes */}
                <Route path="environment/dashboard" element={<EnvironmentDashboard />} />
                <Route path="environment/air-quality" element={<AirQualityMonitoring />} />
                <Route path="environment/climate" element={<ClimateAnalysis />} />
                <Route path="environment/pollution-trends" element={<PollutionTrends />} />
                <Route path="environment/regional-map" element={<RegionalEnvironmentMap />} />
                <Route path="environment/alerts" element={<EnvironmentAlerts />} />
              </Route>

              {/* Doctor Dashboard Routes */}
              <Route path="/doctor/*" element={<DashboardLayout role="doctor" />}>
                <Route path="dashboard" element={<DoctorDashboard />} />
                <Route path="analytics" element={<DoctorAnalytics />} />
                <Route path="appointments" element={<DoctorAppointments />} />
                <Route path="appointments/:appointmentId" element={<AppointmentDetail />} />
                <Route path="consultations" element={<DoctorConsultations />} />
                <Route path="consultations/:appointmentId" element={<DoctorConsultation />} />
                <Route path="schedule" element={<DoctorScheduleAppointment />} />
                <Route path="consultation-history" element={<DoctorConsultationHistory />} />
                <Route path="availability" element={<DoctorAvailability />} />
                <Route path="request-proof" element={<DoctorRequestProof />} />
                <Route path="verify-proofs" element={<DoctorVerifyProofs />} />
                <Route path="all-proof-requests" element={<DoctorAllProofRequests />} />
                <Route path="proof-templates" element={<DoctorProofTemplates />} />
                <Route path="create-template" element={<DoctorCreateTemplate />} />
                <Route path="new-template" element={<DoctorNewTemplate />} />
                <Route path="new-template/:id" element={<DoctorNewTemplate />} />
                <Route path="import-template" element={<DoctorImportTemplate />} />
                <Route path="template-library" element={<DoctorTemplateLibrary />} />
                <Route path="template-analytics" element={<DoctorTemplateAnalytics />} />
                <Route path="template-settings" element={<DoctorTemplateSettings />} />
                <Route path="upload-prescription" element={<DoctorUploadPrescription />} />
                <Route path="prescription-history" element={<DoctorPrescriptionHistory />} />
                <Route path="document-vault" element={<DoctorDocumentVault />} />
                <Route path="certificates" element={<DoctorCertificates />} />
                <Route path="patients" element={<DoctorPatients />} />
                <Route path="patient-search" element={<DoctorPatientSearch />} />
                <Route path="patient-records" element={<DoctorPatientRecords />} />
                <Route path="patient-analytics" element={<DoctorPatientAnalytics />} />
                <Route path="patient/:patientId" element={<DoctorPatientDetail />} />
                <Route path="proof/:proofId" element={<DoctorProofDetail />} />
                <Route path="messages" element={<DoctorMessages />} />
                <Route path="notifications" element={<DoctorNotifications />} />
                <Route path="referrals" element={<DoctorReferrals />} />
                <Route path="practice-analytics" element={<DoctorPracticeAnalytics />} />
                <Route path="patient-insights" element={<DoctorPatientInsights />} />
                <Route path="consultation-reports" element={<DoctorConsultationReports />} />
                <Route path="revenue-analytics" element={<DoctorRevenueAnalytics />} />
                <Route path="ai-assistant" element={<DoctorAIAssistant />} />
                <Route path="guidelines" element={<DoctorGuidelines />} />
                <Route path="drug-database" element={<DoctorDrugDatabase />} />
                <Route path="calculator" element={<DoctorCalculator />} />
                <Route path="profile" element={<DoctorProfile />} />
                <Route path="account-settings" element={<DoctorAccountSettings />} />
                <Route path="logs" element={<DoctorLogs />} />
                <Route path="help" element={<DoctorHelp />} />
                <Route path="settings" element={<DoctorSettings />} />
              </Route>

              {/* Insurance Dashboard Routes */}
              <Route path="/insurance/*" element={<DashboardLayout role="insurance" />}>
                <Route path="dashboard" element={<InsuranceDashboard />} />
                <Route path="claims" element={<InsuranceClaims />} />
                <Route path="claims/new" element={<CreateClaim />} />
                <Route path="claim/:claimId" element={<InsuranceClaimDetail />} />
                <Route path="request-proof" element={<InsuranceRequestProof />} />
                <Route path="validate-proofs" element={<InsuranceValidateProofs />} />
                <Route path="policies" element={<InsurancePolicies />} />
                <Route path="policies/create" element={<CreatePolicy />} />
                <Route path="reports" element={<InsuranceReports />} />
                <Route path="settings" element={<InsuranceSettings />} />
                <Route path="applications" element={<InsuranceApplications />} />
              </Route>

              {/* Researcher Dashboard Routes */}
              <Route path="/researcher/*" element={<DashboardLayout role="researcher" />}>
                <Route path="dashboard" element={<ResearcherDashboard />} />
                <Route path="query-builder" element={<ResearcherQueryBuilder />} />
                <Route path="queries" element={<ResearcherQueries />} />
                <Route path="query/:queryId/results" element={<ResearcherQueryResults />} />
                <Route path="datasets" element={<ResearcherDatasets />} />
                <Route path="exports" element={<ResearcherExports />} />
                <Route path="settings" element={<ResearcherSettings />} />
              </Route>

              {/* Pharmacy Dashboard Routes */}
              <Route path="/pharmacy/*" element={<DashboardLayout role="pharmacy" />}>
                <Route path="dashboard" element={<PharmacyDashboard />} />
                <Route path="orders" element={<Orders />} />
                <Route path="prescriptions" element={<Prescriptions />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="suppliers" element={<Suppliers />} />
                <Route path="customers" element={<Customers />} />
                <Route path="reports" element={<PharmacyReports />} />
                <Route path="settings" element={<PharmacySettings />} />
                <Route path="my-profile" element={<PharmacyMyProfile />} />
              </Route>

              {/* Admin Dashboard Routes */}
              <Route path="/admin/*" element={<DashboardLayout role="admin" />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="users/:userId/edit" element={<AdminUserEdit />} />
                <Route path="audit-logs" element={<AdminAuditLogs />} />
                <Route path="system-health" element={<AdminSystemHealth />} />
                <Route path="compliance" element={<AdminCompliance />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              {/* Hospital Dashboard Routes */}
              <Route path="/hospital/*" element={<DashboardLayout role="hospital" />}>
                <Route path="dashboard" element={<HospitalDashboard />} />
                <Route path="profile" element={<HospitalMyProfile />} />
                <Route path="analytics" element={<HospitalAnalytics />} />
                <Route path="patients" element={<HospitalPatients />} />
                <Route path="admissions" element={<Admissions />} />
                <Route path="departments" element={<HospitalDepartments />} />
                <Route path="billing" element={<HospitalBilling />} />
                <Route path="staff" element={<HospitalStaff />} />
                <Route path="reports" element={<HospitalReports />} />
                <Route path="settings" element={<HospitalSettings />} />

                {/* Hospital Patient Care Routes */}
                <Route path="patient-care" element={<PatientCare />} />
                <Route path="discharges" element={<Discharges />} />
                <Route path="patient-records" element={<HospitalPatientRecords />} />
                <Route path="patient-tracking" element={<PatientTracking />} />
                <Route path="emergency" element={<EmergencyCases />} />
                <Route path="admission-requests" element={<HospitalAdmissionRequests />} />

                {/* Hospital Staff Management Routes */}
                <Route path="staff-directory" element={<StaffDirectory />} />
                <Route path="doctor-management" element={<DoctorManagement />} />
                <Route path="nurse-management" element={<NurseManagement />} />
                <Route path="staff-scheduling" element={<StaffScheduling />} />
                <Route path="staff-training" element={<StaffTraining />} />
                <Route path="performance-reviews" element={<PerformanceReviews />} />

                {/* Hospital Operations Routes */}
                <Route path="bed-management" element={<BedManagement />} />
                <Route path="room-management" element={<RoomManagement />} />
                <Route path="inventory-management" element={<InventoryManagement />} />
                <Route path="equipment-maintenance" element={<EquipmentMaintenance />} />
                <Route path="facility-management" element={<FacilityManagement />} />
                <Route path="security" element={<Security />} />

                {/* Hospital Ambulance Routes */}
                <Route path="ambulance" element={<Ambulance />} />
                <Route path="ambulance/drivers" element={<AmbulanceDrivers />} />
                <Route path="ambulance/vehicles" element={<VehicleFleet />} />
                <Route path="ambulance/calls" element={<EmergencyCalls />} />
                <Route path="ambulance/transports" element={<PatientTransport />} />
                <Route path="ambulance/routes" element={<RoutePlanning />} />
                <Route path="ambulance/dispatch" element={<DispatchCenter />} />
              </Route>

              {/* Blood Bank Dashboard Routes */}
              <Route path="/bloodbank/*" element={
                <ProfileCompletionCheck>
                  <DashboardLayout role="bloodbank" />
                </ProfileCompletionCheck>
              }>
                <Route path="dashboard" element={<BloodBankDashboard />} />
                <Route path="inventory" element={<BloodInventory />} />
                <Route path="donors" element={<BloodDonors />} />
                <Route path="requests" element={<BloodRequests />} />
                <Route path="quality-control" element={<QualityControl />} />
                <Route path="emergency-alerts" element={<EmergencyAlerts />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
                <Route path="profile" element={<Profile />} />
              </Route>

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
