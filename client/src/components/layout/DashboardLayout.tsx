import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import apiService from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Menu, X, Search, Bell, User, Settings,
  Home, FileText, Shield, Activity, HelpCircle,
  LogOut, Users, Database, BarChart3, Lock,
  Stethoscope, Briefcase, Microscope, Key, CreditCard,
  // New icons for enhanced features
  Ambulance, Hospital, Pill, MapPin, AlertTriangle,
  Heart, Brain, Smartphone, Zap, Target,
  Calendar, Clock, Phone, Mail, MessageSquare,
  ShoppingCart, Bed, ChevronDown, ChevronRight,
  // Additional icons for doctor features
  TrendingUp, Video, Plus, List, Award, Share2,
  DollarSign, BookOpen, Calculator,
  // Additional icons for hospital features
  Minus, Building, Package, Wrench, CheckCircle,
  Clipboard, Megaphone, Download, Cog, Monitor, Star,
  // Ambulance icons
  Car,
  // Blood bank icons
  Droplets,
  Truck,
  Cloud,
  Globe,
  Sun,
} from 'lucide-react';
import Logo from '@/components/ui/logo';
import axios from 'axios';
import { getProfileImageUrl } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: number;
}

interface NavSection {
  title: string;
  icon: React.ComponentType<any>;
  items: NavItem[];
}

interface UserProfile {
  firstName?: string;
  lastName?: string;
  hospitalName?: string;
  businessName?: string; // For pharmacy
  profileImage?: string;
  avatarCloudinaryUrl?: string; // For pharmacy
  notificationSettings?: {
    unreadCount?: number;
  };
}

interface DashboardLayoutProps {
  role: 'patient' | 'doctor' | 'insurance' | 'researcher' | 'admin' | 'hospital' | 'bloodbank' | 'pharmacy' | 'bioaura';
  children?: React.ReactNode;
}

const navigationMap: Record<string, NavItem[]> = {
  patient: [
    // Main Dashboard
    { name: 'Dashboard Home', href: '/patient/dashboard', icon: Home },
    { name: 'Messages', href: '/patient/messages', icon: MessageSquare },

    // Health Records Section
    { name: 'My Records', href: '/patient/records', icon: FileText },
    { name: 'Document Vault', href: '/patient/document-vault', icon: Lock },
    { name: 'Shared Proofs', href: '/patient/proofs', icon: Shield },

    // Emergency Services Section
    { name: 'Emergency Services', href: '/patient/emergency', icon: AlertTriangle, badge: 2 },
    // { name: 'Find Hospitals', href: '/patient/hospitals', icon: Hospital },
    { name: 'Book Ambulance', href: '/patient/ambulance', icon: Ambulance },
    { name: 'Emergency Contacts', href: '/patient/emergency-contacts', icon: Phone },

    // Pharmacy Services Section
    { name: 'Pharmacy Services', href: '/patient/pharmacy', icon: Pill, badge: 1 },
    { name: 'Search Medicines', href: '/patient/pharmacy/search', icon: Search },
    { name: 'Cart', href: '/patient/pharmacy/cart', icon: ShoppingCart },
    { name: 'Price Comparison', href: '/patient/pharmacy/price-comparison', icon: BarChart3 },
    { name: 'My Prescriptions', href: '/patient/pharmacy/prescriptions', icon: FileText },
    { name: 'Track Orders', href: '/patient/pharmacy/track-orders', icon: Clock },

    // Hospital Services Section
    { name: 'Hospital Services', href: '/patient/hospital-services', icon: Hospital },
    { name: 'Hospital Directory', href: '/patient/hospital-directory', icon: MapPin },
    { name: 'Bed Availability', href: '/patient/bed-availability', icon: Bed },
    { name: 'Find Doctors', href: '/patient/find-doctors', icon: Stethoscope },
    { name: 'Hospital Appointments', href: '/patient/hospital-appointments', icon: Calendar },

    // Smart Features Section
    { name: 'Smart Features', href: '/patient/smart-features', icon: Zap },
    { name: 'AI Health Assistant', href: '/patient/ai-assistant', icon: Brain },
    { name: 'Health Insights', href: '/patient/health-insights', icon: Target },
    { name: 'Health Tracking', href: '/patient/health-tracking', icon: Heart },
    { name: 'Smart Notifications', href: '/patient/notifications', icon: Bell },

    // Existing Features
    { name: 'My Insurance', href: '/patient/insurance', icon: CreditCard },
    { name: 'Book Appointment', href: '/patient/book-appointment', icon: BarChart3 },
    { name: 'My Health Coach', href: '/patient/health-coach', icon: Stethoscope },
    { name: 'Access Logs', href: '/patient/logs', icon: Activity },
    { name: 'Account Settings', href: '/patient/account-settings', icon: Settings },
    { name: 'Help', href: '/patient/help', icon: HelpCircle },
  ],
  doctor: [
    { name: 'Dashboard Home', href: '/doctor/dashboard', icon: Home },
    { name: 'My Appointments', href: '/doctor/appointments', icon: BarChart3 },
    { name: 'Online Consultations', href: '/doctor/consultations', icon: Activity },
    { name: 'My Patients', href: '/doctor/patients', icon: Users },
    { name: 'Request Proof', href: '/doctor/request-proof', icon: Shield },
    { name: 'Verify Proofs', href: '/doctor/verify-proofs', icon: Key },
    { name: 'Upload Prescription', href: '/doctor/upload-prescription', icon: FileText },
    { name: 'Settings', href: '/doctor/settings', icon: Settings },
    { name: 'Help', href: '/doctor/help', icon: HelpCircle },
  ],
  insurance: [
    { name: 'Dashboard Home', href: '/insurance/dashboard', icon: Home },
    { name: 'Claim Requests', href: '/insurance/claims', icon: FileText },
    { name: 'Applications', href: '/insurance/applications', icon: FileText },
    { name: 'Request Proof', href: '/insurance/request-proof', icon: Shield },
    { name: 'Validate Proofs', href: '/insurance/validate-proofs', icon: Shield },
    { name: 'My Policies', href: '/insurance/policies', icon: Briefcase },
    { name: 'Reports', href: '/insurance/reports', icon: BarChart3 },
    { name: 'Settings', href: '/insurance/settings', icon: Settings },
    { name: 'Help', href: '/insurance/help', icon: HelpCircle },
  ],
  researcher: [
    { name: 'Dashboard Home', href: '/researcher/dashboard', icon: Home },
    { name: 'Query Builder', href: '/researcher/query-builder', icon: Database },
    { name: 'My Queries', href: '/researcher/queries', icon: FileText },
    { name: 'Data Sets', href: '/researcher/datasets', icon: BarChart3 },
    { name: 'Exports', href: '/researcher/exports', icon: FileText },
    { name: 'Settings', href: '/researcher/settings', icon: Settings },
    { name: 'Help', href: '/researcher/help', icon: HelpCircle },
  ],
  admin: [
    { name: 'Dashboard Home', href: '/admin/dashboard', icon: Home },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: Activity },
    { name: 'System Health', href: '/admin/system-health', icon: BarChart3 },
    { name: 'Compliance', href: '/admin/compliance', icon: Lock },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
    { name: 'Help', href: '/admin/help', icon: HelpCircle },
  ],
  hospital: [
    { name: 'Dashboard Home', href: '/hospital/dashboard', icon: Home },
    { name: 'Patient Management', href: '/hospital/patients', icon: Users },
    { name: 'Appointments', href: '/hospital/appointments', icon: Calendar },
    { name: 'Medical Records', href: '/hospital/records', icon: FileText },
    { name: 'Staff Management', href: '/hospital/staff', icon: Users },
    { name: 'Inventory', href: '/hospital/inventory', icon: Briefcase },
    { name: 'Billing', href: '/hospital/billing', icon: DollarSign },
    { name: 'Reports', href: '/hospital/reports', icon: BarChart3 },
    { name: 'Settings', href: '/hospital/settings', icon: Settings },
    { name: 'Help', href: '/hospital/help', icon: HelpCircle },
  ],
  bloodbank: [
    { name: 'Dashboard Home', href: '/bloodbank/dashboard', icon: Home },
    { name: 'Blood Inventory', href: '/bloodbank/inventory', icon: Activity },
    { name: 'Donor Management', href: '/bloodbank/donors', icon: Users },
    { name: 'Blood Requests', href: '/bloodbank/requests', icon: FileText },
    { name: 'Quality Control', href: '/bloodbank/quality', icon: Shield },
    { name: 'Emergency Alerts', href: '/bloodbank/emergency', icon: AlertTriangle },
    { name: 'Reports', href: '/bloodbank/reports', icon: BarChart3 },
    { name: 'Settings', href: '/bloodbank/settings', icon: Settings },
    { name: 'Help', href: '/bloodbank/help', icon: HelpCircle },
  ],
  pharmacy: [
    { name: 'Dashboard Home', href: '/pharmacy/dashboard', icon: Home },
    { name: 'Orders', href: '/pharmacy/orders', icon: ShoppingCart },
    { name: 'Prescriptions', href: '/pharmacy/prescriptions', icon: FileText },
    { name: 'Inventory', href: '/pharmacy/inventory', icon: Package },
    { name: 'Suppliers', href: '/pharmacy/suppliers', icon: Truck },
    { name: 'Customers', href: '/pharmacy/customers', icon: Users },
    { name: 'Reports', href: '/pharmacy/reports', icon: BarChart3 },
    { name: 'Settings', href: '/pharmacy/settings', icon: Settings },
  ],
  bioaura: [
    { name: 'AI Overview', href: '/bioaura/dashboard', icon: Brain },
    { name: 'Disease Prediction', href: '/bioaura/disease-prediction', icon: Target },
    { name: 'Health Index', href: '/bioaura/health-index', icon: Activity },
    { name: 'Demand Patterns', href: '/bioaura/demand-patterns', icon: TrendingUp },
    { name: 'Sales Analytics', href: '/bioaura/sales-analytics', icon: BarChart3 },
    { name: 'Stock Analysis', href: '/bioaura/stock-analysis', icon: Package },
    { name: 'Pharmacy Network', href: '/bioaura/pharmacy-network', icon: MapPin },
    { name: 'Regional Insights', href: '/bioaura/regional-insights', icon: Globe },
    { name: 'API Integration', href: '/bioaura/api-integration', icon: Cloud },
  ],
};

// New structured navigation for patient with collapsible sections
const patientNavigationSections: NavSection[] = [
  {
    title: 'Dashboard',
    icon: Home,
    items: [
      { name: 'Dashboard Home', href: '/patient/dashboard', icon: Home },
    ]
  },
  {
    title: 'Health Records',
    icon: FileText,
    items: [
      { name: 'My Records', href: '/patient/records', icon: FileText },
      { name: 'Document Vault', href: '/patient/document-vault', icon: Lock },
      { name: 'Shared Proofs', href: '/patient/proofs', icon: Shield },
    ]
  },
  {
    title: 'Insurance',
    icon: CreditCard,
    items: [
      { name: 'My Insurance', href: '/patient/insurance', icon: CreditCard },
      { name: 'Book Appointment', href: '/patient/book-appointment', icon: BarChart3 },
      { name: 'My Health Coach', href: '/patient/health-coach', icon: Stethoscope },
    ]
  },
  {
    title: 'Emergency Services',
    icon: AlertTriangle,
    items: [
      { name: 'Emergency Services', href: '/patient/emergency', icon: AlertTriangle, badge: 2 },
      // { name: 'Find Hospitals', href: '/patient/hospitals', icon: Hospital },
      { name: 'Book Ambulance', href: '/patient/ambulance', icon: Ambulance },
      { name: 'Emergency Contacts', href: '/patient/emergency-contacts', icon: Phone },
    ]
  },
  {
    title: 'Pharmacy Services',
    icon: Pill,
    items: [
      { name: 'Pharmacy Services', href: '/patient/pharmacy', icon: Pill, badge: 1 },
      { name: 'Search Medicines', href: '/patient/pharmacy/search', icon: Search },
      { name: 'Cart', href: '/patient/pharmacy/cart', icon: ShoppingCart },
      { name: 'Price Comparison', href: '/patient/pharmacy/price-comparison', icon: BarChart3 },
      { name: 'My Prescriptions', href: '/patient/pharmacy/prescriptions', icon: FileText },
      { name: 'Track Orders', href: '/patient/pharmacy/track-orders', icon: Clock },
    ]
  },
  {
    title: 'Hospital Services',
    icon: Hospital,
    items: [
      { name: 'Hospital Services', href: '/patient/hospital-services', icon: Hospital },
      { name: 'Hospital Directory', href: '/patient/hospital-directory', icon: MapPin },
      { name: 'Bed Availability', href: '/patient/bed-availability', icon: Bed },
      { name: 'Find Doctors', href: '/patient/find-doctors', icon: Stethoscope },
      { name: 'Hospital Appointments', href: '/patient/hospital-appointments', icon: Calendar },
      { name: 'Request Admission', href: '/patient/request-admission', icon: Plus },
      { name: 'My Admission Requests', href: '/patient/admission-requests', icon: FileText },
    ]
  },
  {
    title: 'Smart Features',
    icon: Zap,
    items: [
      { name: 'Smart Features', href: '/patient/smart-features', icon: Zap },
      { name: 'AI Health Assistant', href: '/patient/ai-assistant', icon: Brain },
      { name: 'Health Insights', href: '/patient/health-insights', icon: Target },
      { name: 'Health Tracking', href: '/patient/health-tracking', icon: Heart },
      { name: 'Smart Notifications', href: '/patient/notifications', icon: Bell },
    ]
  },
  {
    title: 'Communication',
    icon: MessageSquare,
    items: [
      { name: 'Messages', href: '/patient/messages', icon: MessageSquare },
      { name: 'Support', href: '/patient/help', icon: HelpCircle },
    ]
  },
  {
    title: 'Other Services',
    icon: Settings,
    items: [
      { name: 'Access Logs', href: '/patient/logs', icon: Activity },
      { name: 'Account Settings', href: '/patient/account-settings', icon: Settings },
      { name: 'Help', href: '/patient/help', icon: HelpCircle },
    ]
  },
];

// New structured navigation for doctor with collapsible sections
const doctorNavigationSections: NavSection[] = [
  {
    title: 'Dashboard',
    icon: Home,
    items: [
      { name: 'Dashboard Home', href: '/doctor/dashboard', icon: Home },
      { name: 'Analytics', href: '/doctor/analytics', icon: BarChart3 },
    ]
  },
  {
    title: 'Patient Management',
    icon: Users,
    items: [
      { name: 'My Patients', href: '/doctor/patients', icon: Users },
      { name: 'Patient Search', href: '/doctor/patient-search', icon: Search },
      { name: 'Patient Records', href: '/doctor/patient-records', icon: FileText },
      { name: 'Patient Analytics', href: '/doctor/patient-analytics', icon: TrendingUp },
    ]
  },
  {
    title: 'Appointments & Consultations',
    icon: Calendar,
    items: [
      { name: 'My Appointments', href: '/doctor/appointments', icon: Calendar },
      { name: 'Online Consultations', href: '/doctor/consultations', icon: Video },
      { name: 'Schedule Appointment', href: '/doctor/schedule', icon: Plus },
      { name: 'Consultation History', href: '/doctor/consultation-history', icon: Clock },
    ]
  },
  {
    title: 'Availability Management',
    icon: Clock,
    items: [
      { name: 'Manage Availability', href: '/doctor/availability', icon: Clock },
    ]
  },
  {
    title: 'Proof Management',
    icon: Shield,
    items: [
      { name: 'Request Proof', href: '/doctor/request-proof', icon: Shield },
      { name: 'Verify Proofs', href: '/doctor/verify-proofs', icon: Key },
      { name: 'All Proof Requests', href: '/doctor/all-proof-requests', icon: List },
      { name: 'Proof Templates', href: '/doctor/proof-templates', icon: FileText },
      { name: 'Create Template', href: '/doctor/create-template', icon: Plus },
    ]
  },
  {
    title: 'Medical Documents',
    icon: FileText,
    items: [
      { name: 'Upload Prescription', href: '/doctor/upload-prescription', icon: FileText },
      { name: 'Prescription History', href: '/doctor/prescription-history', icon: Clock },
      { name: 'Document Vault', href: '/doctor/document-vault', icon: Lock },
      { name: 'Medical Certificates', href: '/doctor/certificates', icon: Award },
    ]
  },
  {
    title: 'Communication',
    icon: MessageSquare,
    items: [
      { name: 'Messages', href: '/doctor/messages', icon: MessageSquare },
      { name: 'Notifications', href: '/doctor/notifications', icon: Bell },
      { name: 'Referrals', href: '/doctor/referrals', icon: Share2 },
    ]
  },
  {
    title: 'Professional Tools',
    icon: Stethoscope,
    items: [
      { name: 'AI Assistant', href: '/doctor/ai-assistant', icon: Brain },
      { name: 'Clinical Guidelines', href: '/doctor/guidelines', icon: BookOpen },
      { name: 'Drug Database', href: '/doctor/drug-database', icon: Pill },
      { name: 'Medical Calculator', href: '/doctor/calculator', icon: Calculator },
    ]
  },
  {
    title: 'Administration',
    icon: Settings,
    items: [
      { name: 'My Profile', href: '/doctor/profile', icon: User },
      { name: 'Account Settings', href: '/doctor/account-settings', icon: Settings },
      { name: 'Access Logs', href: '/doctor/logs', icon: Activity },
      { name: 'Help & Support', href: '/doctor/help', icon: HelpCircle },
    ]
  },
];

// New structured navigation for hospital with collapsible sections
const hospitalNavigationSections: NavSection[] = [
  {
    title: 'Dashboard',
    icon: Home,
    items: [
      { name: 'Dashboard Home', href: '/hospital/dashboard', icon: Home },
      { name: 'Hospital Profile', href: '/hospital/profile', icon: Building },
      { name: 'Hospital Analytics', href: '/hospital/analytics', icon: BarChart3 },
      { name: 'Performance Metrics', href: '/hospital/performance', icon: TrendingUp },
    ]
  },
  {
    title: 'Patient Care',
    icon: Users,
    items: [
      { name: 'Patient Management', href: '/hospital/patients', icon: Users },
      { name: 'Admissions', href: '/hospital/admissions', icon: Plus },
      { name: 'Admission Requests', href: '/hospital/admission-requests', icon: FileText },
      { name: 'Discharges', href: '/hospital/discharges', icon: Minus },
      { name: 'Patient Records', href: '/hospital/patient-records', icon: FileText },
      { name: 'Patient Tracking', href: '/hospital/patient-tracking', icon: Activity },
      { name: 'Emergency Cases', href: '/hospital/emergency', icon: AlertTriangle },
    ]
  },
  {
    title: 'Ambulance Services',
    icon: Ambulance,
    items: [
      { name: 'Ambulance Dashboard', href: '/hospital/ambulance', icon: Ambulance },
      { name: 'Driver Management', href: '/hospital/ambulance/drivers', icon: Users },
      { name: 'Vehicle Fleet', href: '/hospital/ambulance/vehicles', icon: Car },
      { name: 'Emergency Calls', href: '/hospital/ambulance/calls', icon: Phone },
      { name: 'Patient Transport', href: '/hospital/ambulance/transports', icon: Activity },
      { name: 'Route Planning', href: '/hospital/ambulance/routes', icon: MapPin },
      { name: 'Dispatch Center', href: '/hospital/ambulance/dispatch', icon: MessageSquare },
    ]
  },
  {
    title: 'Medical Services',
    icon: Stethoscope,
    items: [
      { name: 'Departments', href: '/hospital/departments', icon: Building },
      { name: 'Specialties', href: '/hospital/specialties', icon: Award },
      { name: 'Medical Equipment', href: '/hospital/equipment', icon: Settings },
      { name: 'Laboratory Services', href: '/hospital/laboratory', icon: Microscope },
      { name: 'Radiology', href: '/hospital/radiology', icon: Monitor },
      { name: 'Pharmacy', href: '/hospital/pharmacy', icon: Pill },
    ]
  },
  {
    title: 'Staff Management',
    icon: Users,
    items: [
      { name: 'Staff Directory', href: '/hospital/staff-directory', icon: Users },
      { name: 'Doctor Management', href: '/hospital/doctor-management', icon: Stethoscope },
      { name: 'Nurse Management', href: '/hospital/nurse-management', icon: Heart },
      { name: 'Staff Scheduling', href: '/hospital/staff-scheduling', icon: Calendar },
      { name: 'Staff Training', href: '/hospital/staff-training', icon: BookOpen },
      { name: 'Performance Reviews', href: '/hospital/performance-reviews', icon: Star },
    ]
  },
  {
    title: 'Hospital Operations',
    icon: Building,
    items: [
      { name: 'Bed Management', href: '/hospital/bed-management', icon: Bed },
      { name: 'Room Management', href: '/hospital/room-management', icon: Home },
      { name: 'Inventory Management', href: '/hospital/inventory-management', icon: Package },
      { name: 'Equipment Maintenance', href: '/hospital/equipment-maintenance', icon: Wrench },
      { name: 'Facility Management', href: '/hospital/facility-management', icon: Building },
      { name: 'Security', href: '/hospital/security', icon: Shield },
    ]
  },
  {
    title: 'Financial Management',
    icon: DollarSign,
    items: [
      { name: 'Billing & Invoicing', href: '/hospital/billing', icon: DollarSign },
      { name: 'Insurance Claims', href: '/hospital/insurance-claims', icon: FileText },
      { name: 'Revenue Analytics', href: '/hospital/revenue', icon: TrendingUp },
      { name: 'Cost Management', href: '/hospital/costs', icon: Calculator },
      { name: 'Payment Processing', href: '/hospital/payments', icon: CreditCard },
      { name: 'Financial Reports', href: '/hospital/financial-reports', icon: BarChart3 },
    ]
  },
  {
    title: 'Quality & Compliance',
    icon: Shield,
    items: [
      { name: 'Quality Standards', href: '/hospital/quality-standards', icon: Award },
      { name: 'Compliance Monitoring', href: '/hospital/compliance', icon: CheckCircle },
      { name: 'Audit Management', href: '/hospital/audits', icon: Clipboard },
      { name: 'Certifications', href: '/hospital/certifications', icon: Award },
      { name: 'Risk Management', href: '/hospital/risk-management', icon: AlertTriangle },
      { name: 'Safety Protocols', href: '/hospital/safety', icon: Shield },
    ]
  },
  {
    title: 'Communication',
    icon: MessageSquare,
    items: [
      { name: 'Internal Messages', href: '/hospital/messages', icon: MessageSquare },
      { name: 'Notifications', href: '/hospital/notifications', icon: Bell },
      { name: 'Announcements', href: '/hospital/announcements', icon: Megaphone },
      { name: 'Patient Communication', href: '/hospital/patient-communication', icon: Phone },
      { name: 'Staff Communication', href: '/hospital/staff-communication', icon: Users },
    ]
  },
  {
    title: 'Reports & Analytics',
    icon: BarChart3,
    items: [
      { name: 'Hospital Reports', href: '/hospital/reports', icon: FileText },
      { name: 'Patient Analytics', href: '/hospital/patient-analytics', icon: TrendingUp },
      { name: 'Operational Analytics', href: '/hospital/operational-analytics', icon: BarChart3 },
      { name: 'Quality Metrics', href: '/hospital/quality-metrics', icon: Target },
      { name: 'Performance Dashboards', href: '/hospital/dashboards', icon: Monitor },
      { name: 'Data Exports', href: '/hospital/exports', icon: Download },
    ]
  },
  {
    title: 'Administration',
    icon: Settings,
    items: [
      { name: 'Hospital Profile', href: '/hospital/profile', icon: Building },
      { name: 'Account Settings', href: '/hospital/account-settings', icon: Settings },
      { name: 'Access Logs', href: '/hospital/logs', icon: Activity },
      { name: 'System Configuration', href: '/hospital/config', icon: Cog },
      { name: 'Backup & Recovery', href: '/hospital/backup', icon: Database },
      { name: 'Help & Support', href: '/hospital/help', icon: HelpCircle },
    ]
  },
];

const bioAuraNavigationSections: NavSection[] = [
  {
    title: 'Pharmacy Intelligence',
    icon: Brain,
    items: navigationMap.bioaura,
  },
  {
    title: 'Environment Agent',
    icon: Cloud,
    items: [
      { name: 'Environment Dashboard', href: '/bioaura/environment/dashboard', icon: Cloud },
      { name: 'Air Quality Monitoring', href: '/bioaura/environment/air-quality', icon: Cloud },
      { name: 'Climate Analysis', href: '/bioaura/environment/climate', icon: Sun },
      { name: 'Pollution Trends', href: '/bioaura/environment/pollution-trends', icon: TrendingUp },
      { name: 'Regional Map', href: '/bioaura/environment/regional-map', icon: MapPin },
      { name: 'Environment Alerts', href: '/bioaura/environment/alerts', icon: AlertTriangle },
    ],
  },
];

const roleIcons = {
  patient: User,
  doctor: Stethoscope,
  insurance: Briefcase,
  researcher: Microscope,
  admin: Settings,
  hospital: Hospital,
  bloodbank: Droplets,
  pharmacy: Pill,
  bioaura: Brain,
};

const roleColors = {
  patient: 'text-health-teal',
  doctor: 'text-health-aqua',
  insurance: 'text-health-success',
  researcher: 'text-health-warning',
  admin: 'text-health-blue-gray',
  hospital: 'text-health-purple',
  bloodbank: 'text-health-danger',
  pharmacy: 'text-health-aqua',
  bioaura: 'text-health-aqua',
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ role }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(() => {
    // Initialize all sections as collapsed (closed) by default
    const initialCollapsedState: Record<string, boolean> = {};
    patientNavigationSections.forEach(section => {
      initialCollapsedState[section.title] = true;
    });
    doctorNavigationSections.forEach(section => {
      initialCollapsedState[section.title] = true;
    });
    hospitalNavigationSections.forEach(section => {
      initialCollapsedState[section.title] = true;
    });
    bioAuraNavigationSections.forEach(section => {
      initialCollapsedState[section.title] = true;
    });
    return initialCollapsedState;
  });
  const location = useLocation();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const token = localStorage.getItem('token');
        if (role === 'doctor') {
          const res = await axios.get('http://localhost:8080/api/doctor/settings', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUserProfile(res.data);
        } else if (role === 'patient') {
          const res = await axios.get('http://localhost:8080/api/patient/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUserProfile(res.data);
        } else if (role === 'hospital') {
          const res = await axios.get('http://localhost:8080/api/hospital/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUserProfile(res.data.data);
        } else if (role === 'pharmacy') {
          const res = await axios.get('http://localhost:8080/api/pharmacy/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUserProfile(res.data);
        }
      } catch (e) {
        setUserProfile(null);
      }
    }
    async function fetchNotifications() {
      // TODO: Replace with real API call if available
      setUnreadNotifications(userProfile?.notificationSettings?.unreadCount || 0);
    }
    fetchUserProfile();
    fetchNotifications();
  }, [role]);

  const navigation = navigationMap[role] || [];
  const RoleIcon = roleIcons[role];
  const roleColor = roleColors[role];

  const toggleSection = (sectionTitle: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate to login even if logout API fails
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-health-light-gray">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 ${isSidebarOpen ? 'w-64' : 'w-20'} bg-health-teal transition-all duration-300 ease-in-out`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-20 px-6 border-b border-health-teal/20" style={{ minWidth: 220 }}>
            <div className="flex items-center space-x-4 w-full">
              {isSidebarOpen ? (
                <>
                  <Logo showText={false} className="text-white" size="md" />
                  <span className="text-white font-normal text-lg select-none" style={{ userSelect: 'none' }}>
                    HealthSecure
                  </span>
                </>
              ) : (
                <Logo showText={false} className="text-white" size="md" />
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
            {role === 'patient' ? (
              // Patient navigation with collapsible sections
              patientNavigationSections.map((section) => {
                const SectionIcon = section.icon;
                const isCollapsed = collapsedSections[section.title];

                return (
                  <div key={section.title} className="space-y-1">
                    {/* Section Header */}
                    <button
                      onClick={() => toggleSection(section.title)}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium transition-colors text-white hover:bg-health-aqua/20 ${isCollapsed ? '' : 'bg-health-aqua/10'
                        }`}
                    >
                      <div className="flex items-center">
                        <SectionIcon className="w-5 h-5 flex-shrink-0" />
                        {isSidebarOpen && (
                          <span className="ml-3">{section.title}</span>
                        )}
                      </div>
                      {isSidebarOpen && (
                        isCollapsed ? (
                          <ChevronRight className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )
                      )}
                    </button>

                    {/* Section Items */}
                    {!isCollapsed && (
                      <div className="ml-4 space-y-1">
                        {section.items.map((item) => {
                          const Icon = item.icon;
                          const isActive = location.pathname === item.href;

                          return (
                            <Link
                              key={item.name}
                              to={item.href}
                              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                ? 'bg-health-aqua text-white'
                                : 'text-white/80 hover:bg-health-aqua/20'
                                }`}
                            >
                              <Icon className="w-5 h-5 flex-shrink-0" />
                              {isSidebarOpen && (
                                <div className="ml-3 flex items-center justify-between w-full">
                                  <span>{item.name}</span>
                                  {item.badge && (
                                    <Badge className="ml-2 bg-health-danger text-white text-xs">
                                      {item.badge}
                                    </Badge>
                                  )}
                                </div>
                              )}
                              {isActive && isSidebarOpen && (
                                <div className="absolute left-0 w-1 h-6 bg-health-aqua rounded-r"></div>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            ) : role === 'doctor' ? (
              // Doctor navigation with collapsible sections
              doctorNavigationSections.map((section) => {
                const SectionIcon = section.icon;
                const isCollapsed = collapsedSections[section.title];

                return (
                  <div key={section.title} className="space-y-1">
                    {/* Section Header */}
                    <button
                      onClick={() => toggleSection(section.title)}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium transition-colors text-white hover:bg-health-aqua/20 ${isCollapsed ? '' : 'bg-health-aqua/10'
                        }`}
                    >
                      <div className="flex items-center">
                        <SectionIcon className="w-5 h-5 flex-shrink-0" />
                        {isSidebarOpen && (
                          <span className="ml-3">{section.title}</span>
                        )}
                      </div>
                      {isSidebarOpen && (
                        isCollapsed ? (
                          <ChevronRight className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )
                      )}
                    </button>

                    {/* Section Items */}
                    {!isCollapsed && (
                      <div className="ml-4 space-y-1">
                        {section.items.map((item) => {
                          const Icon = item.icon;
                          const isActive = location.pathname === item.href;

                          return (
                            <Link
                              key={item.name}
                              to={item.href}
                              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                ? 'bg-health-aqua text-white'
                                : 'text-white/80 hover:bg-health-aqua/20'
                                }`}
                            >
                              <Icon className="w-5 h-5 flex-shrink-0" />
                              {isSidebarOpen && (
                                <div className="ml-3 flex items-center justify-between w-full">
                                  <span>{item.name}</span>
                                  {item.badge && (
                                    <Badge className="ml-2 bg-health-danger text-white text-xs">
                                      {item.badge}
                                    </Badge>
                                  )}
                                </div>
                              )}
                              {isActive && isSidebarOpen && (
                                <div className="absolute left-0 w-1 h-6 bg-health-aqua rounded-r"></div>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            ) : role === 'hospital' ? (
              // Hospital navigation with collapsible sections
              hospitalNavigationSections.map((section) => {
                const SectionIcon = section.icon;
                const isCollapsed = collapsedSections[section.title];

                return (
                  <div key={section.title} className="space-y-1">
                    {/* Section Header */}
                    <button
                      onClick={() => toggleSection(section.title)}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium transition-colors text-white hover:bg-health-aqua/20 ${isCollapsed ? '' : 'bg-health-aqua/10'
                        }`}
                    >
                      <div className="flex items-center">
                        <SectionIcon className="w-5 h-5 flex-shrink-0" />
                        {isSidebarOpen && (
                          <span className="ml-3">{section.title}</span>
                        )}
                      </div>
                      {isSidebarOpen && (
                        isCollapsed ? (
                          <ChevronRight className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )
                      )}
                    </button>

                    {/* Section Items */}
                    {!isCollapsed && (
                      <div className="ml-4 space-y-1">
                        {section.items.map((item) => {
                          const Icon = item.icon;
                          const isActive = location.pathname === item.href;

                          return (
                            <Link
                              key={item.name}
                              to={item.href}
                              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                ? 'bg-health-aqua text-white'
                                : 'text-white/80 hover:bg-health-aqua/20'
                                }`}
                            >
                              <Icon className="w-5 h-5 flex-shrink-0" />
                              {isSidebarOpen && (
                                <div className="ml-3 flex items-center justify-between w-full">
                                  <span>{item.name}</span>
                                  {item.badge && (
                                    <Badge className="ml-2 bg-health-danger text-white text-xs">
                                      {item.badge}
                                    </Badge>
                                  )}
                                </div>
                              )}
                              {isActive && isSidebarOpen && (
                                <div className="absolute left-0 w-1 h-6 bg-health-aqua rounded-r"></div>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            ) : role === 'bioaura' ? (
              bioAuraNavigationSections.map((section) => {
                const SectionIcon = section.icon;
                const isCollapsed = collapsedSections[section.title];

                return (
                  <div key={section.title} className="space-y-1">
                    <button
                      onClick={() => toggleSection(section.title)}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium transition-colors text-white hover:bg-health-aqua/20 ${isCollapsed ? '' : 'bg-health-aqua/10'
                        }`}
                    >
                      <div className="flex items-center">
                        <SectionIcon className="w-5 h-5 flex-shrink-0" />
                        {isSidebarOpen && (
                          <span className="ml-3">{section.title}</span>
                        )}
                      </div>
                      {isSidebarOpen && (
                        isCollapsed ? (
                          <ChevronRight className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )
                      )}
                    </button>

                    {!isCollapsed && (
                      <div className="ml-4 space-y-1">
                        {section.items.map((item) => {
                          const Icon = item.icon;
                          const isActive = location.pathname === item.href;

                          return (
                            <Link
                              key={item.name}
                              to={item.href}
                              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                ? 'bg-health-aqua text-white'
                                : 'text-white/80 hover:bg-health-aqua/20'
                                }`}
                            >
                              <Icon className="w-5 h-5 flex-shrink-0" />
                              {isSidebarOpen && (
                                <div className="ml-3 flex items-center justify-between w-full">
                                  <span>{item.name}</span>
                                  {item.badge && (
                                    <Badge className="ml-2 bg-health-danger text-white text-xs">
                                      {item.badge}
                                    </Badge>
                                  )}
                                </div>
                              )}
                              {isActive && isSidebarOpen && (
                                <div className="absolute left-0 w-1 h-6 bg-health-aqua rounded-r"></div>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              // Other roles use the original flat navigation
              navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                      ? 'bg-health-aqua text-white'
                      : 'text-white hover:bg-health-aqua/20'
                      }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {isSidebarOpen && (
                      <div className="ml-3 flex items-center justify-between w-full">
                        <span>{item.name}</span>
                        {item.badge && (
                          <Badge className="ml-2 bg-health-danger text-white text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    )}
                    {isActive && isSidebarOpen && (
                      <div className="absolute left-0 w-1 h-6 bg-health-aqua rounded-r"></div>
                    )}
                  </Link>
                );
              })
            )}
          </nav>

          {/* Role indicator */}
          {isSidebarOpen && (
            <div className="flex justify-center items-center py-6">
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 shadow-sm border border-white/20">
                <RoleIcon className={`w-6 h-6 text-white bg-health-teal rounded-full p-1`} />
                <span className="text-white font-semibold capitalize tracking-wide text-base">
                  {role}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className={`${isSidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 ease-in-out`}>
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-health-blue-gray/20 h-16 flex items-center justify-between px-6 sticky top-0 z-[90] pointer-events-auto">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hover:bg-health-light-gray"
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>

            <h1 className="text-xl font-montserrat font-semibold text-health-teal">
              {navigation.find(item =>
                item.href === location.pathname ||
                (item.href === '/patient/submit-claim' && location.pathname.startsWith('/patient/submit-claim'))
              )?.name || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              {isSearchOpen ? (
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    placeholder="Search..."
                    className="w-64"
                    autoFocus
                    onBlur={() => setIsSearchOpen(false)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSearchOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(true)}
                  className="hover:bg-health-light-gray"
                >
                  <Search className="h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-health-light-gray"
            >
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs bg-health-danger border-0">
                  {unreadNotifications}
                </Badge>
              )}
            </Button>

            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 hover:bg-health-light-gray">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={getProfileImageUrl(userProfile?.profileImage || userProfile?.avatarCloudinaryUrl) || "/placeholder.svg"} />
                    <AvatarFallback className="bg-health-teal text-white">
                      {role === 'pharmacy' ?
                        (userProfile?.businessName?.charAt(0) || userProfile?.firstName?.charAt(0) || 'P') :
                        (userProfile?.firstName?.charAt(0) || role.charAt(0).toUpperCase())}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-health-charcoal capitalize">
                    {userProfile ?
                      (role === 'doctor' ? `Dr. ${userProfile.firstName} ${userProfile.lastName}` :
                        role === 'patient' ? `${userProfile.firstName} ${userProfile.lastName}` :
                          role === 'hospital' ? userProfile.hospitalName || 'Hospital' :
                            role === 'pharmacy' ? userProfile.businessName || `${userProfile.firstName} ${userProfile.lastName}` || 'Pharmacy' :
                              `${userProfile.firstName} ${userProfile.lastName}`)
                      : `${role} User`}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  {role === 'patient' ? (
                    <Link to="/patient/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      My Profile
                    </Link>
                  ) : role === 'doctor' ? (
                    <Link to="/doctor/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      My Profile
                    </Link>
                  ) : role === 'hospital' ? (
                    <Link to="/hospital/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      My Profile
                    </Link>
                  ) : role === 'pharmacy' ? (
                    <Link to="/pharmacy/my-profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      My Profile
                    </Link>
                  ) : (
                    <span className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      My Profile
                    </span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  {role === 'patient' ? (
                    <Link to="/patient/account-settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Account Settings
                    </Link>
                  ) : role === 'doctor' ? (
                    <Link to="/doctor/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Account Settings
                    </Link>
                  ) : role === 'hospital' ? (
                    <Link to="/hospital/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Account Settings
                    </Link>
                  ) : role === 'pharmacy' ? (
                    <Link to="/pharmacy/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Account Settings
                    </Link>
                  ) : (
                    <span className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Account Settings
                    </span>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className={`${role === 'pharmacy' ? 'p-0' : 'p-6'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
