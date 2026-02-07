
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Shield, Clock, CheckCircle, Users, 
  Calendar, Download, Search, Plus 
} from 'lucide-react';
import axios from 'axios';
import ProfileCompletionCheck from '@/components/doctor/ProfileCompletionCheck';
import DoctorProfileCompletionDialog from '@/components/doctor/DoctorProfileCompletionDialog';

const mockVerifiedProofs = [
  { 
    id: 1, 
    patient: 'John Doe', 
    proofType: 'Vaccination Status', 
    verificationDate: '2024-01-16 10:30',
    signature: '0x7f9a2b8c...'
  },
  { 
    id: 2, 
    patient: 'Alice Wilson', 
    proofType: 'Allergy Status', 
    verificationDate: '2024-01-15 14:22',
    signature: '0x3e1f6d4a...'
  },
  { 
    id: 3, 
    patient: 'David Brown', 
    proofType: 'Lab Results', 
    verificationDate: '2024-01-15 09:15',
    signature: '0x9c4a7b2f...'
  },
];

const mockPatients = [
  { id: 1, name: 'Sarah Connor', lastProof: '2024-01-15', avatar: '/placeholder.svg' },
  { id: 2, name: 'Michael Scott', lastProof: '2024-01-12', avatar: '/placeholder.svg' },
  { id: 3, name: 'Emma Thompson', lastProof: '2024-01-10', avatar: '/placeholder.svg' },
  { id: 4, name: 'James Wilson', lastProof: '2024-01-08', avatar: '/placeholder.svg' },
];

const DoctorDashboard = () => {
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [verifiedProofs, setVerifiedProofs] = useState<any[]>([]);
  const [doctorName, setDoctorName] = useState<string>('');
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8080/api/doctor/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDashboardStats(res.data.stats);
        setPendingRequests(res.data.recentRequests || []);
        setPatients(res.data.patients || []);
        setVerifiedProofs(res.data.verifiedProofs || []);
      } catch (e) {
        setDashboardStats(null);
        setPendingRequests([]);
        setPatients([]);
        setVerifiedProofs([]);
      }
    }
    async function fetchDoctorName() {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8080/api/doctor/settings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDoctorName(`Dr. ${res.data.firstName} ${res.data.lastName}`);
        
        // Check if this is a new user (no profile completion)
        if (!res.data.firstName || !res.data.lastName || !res.data.licenseNumber) {
          setIsNewUser(true);
          setShowProfileDialog(true);
        }
      } catch (e) {
        setDoctorName('Doctor');
        // If settings fetch fails, assume new user
        setIsNewUser(true);
        setShowProfileDialog(true);
      }
    }
    fetchDashboard();
    fetchDoctorName();
  }, []);

  return (
    <div className="space-y-6">
      {/* Profile Completion Check */}
      <ProfileCompletionCheck />
      
      {/* Profile Completion Dialog for New Users */}
      <DoctorProfileCompletionDialog
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
        onComplete={() => {
          setIsNewUser(false);
          setShowProfileDialog(false);
          // Refresh the page or reload data
          window.location.reload();
        }}
      />
      
      {/* Welcome Header */}
      <Card className="bg-gradient-to-r from-health-aqua to-health-teal text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-montserrat">
            Welcome {doctorName}
          </CardTitle>
          <p className="text-white/90">
            {dashboardStats ? `${dashboardStats.pendingRequests ?? 0} pending proof requests, ${dashboardStats.verifiedThisWeek ?? 0} verified proofs this week, ${dashboardStats.newPatientsThisWeek ?? 0} new patients joined` : 'Loading...'}
          </p>
          <Button className="w-fit bg-white text-health-teal hover:bg-white/90 mt-4">
            <Shield className="w-4 h-4 mr-2" />
            Request Proof from Patient
          </Button>
        </CardHeader>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-health-teal">{dashboardStats?.pendingRequests ?? 0}</p>
              </div>
              <Clock className="h-8 w-8 text-health-warning" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verified This Week</p>
                <p className="text-2xl font-bold text-health-success">{dashboardStats?.verifiedThisWeek ?? 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-health-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-health-teal">{dashboardStats?.totalPatients ?? 0}</p>
              </div>
              <Users className="h-8 w-8 text-health-teal" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Response Time</p>
                <p className="text-2xl font-bold text-health-aqua">{dashboardStats?.avgResponseTime ?? 0}h</p>
              </div>
              <Calendar className="h-8 w-8 text-health-aqua" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Proof Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Pending Proof Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div key={request._id || request.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-health-light-gray/50">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={request.patientId?.profileImage || "/placeholder.svg"} />
                    <AvatarFallback className="bg-health-teal text-white">
                      {(request.patientId?.firstName || 'U')[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{request.patientId?.firstName || request.patient || 'Unknown'}</div>
                    <div className="text-sm text-gray-600">{request.purpose}</div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      Requested: {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : request.date}
                    </div>
                    {request.cloudinaryUrl && (
                      <a href={request.cloudinaryUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline">View Attachment</a>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary">{request.status}</Badge>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">Send Reminder</Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-600">Cancel Request</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Verified Proofs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Recently Verified Proofs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {verifiedProofs.length === 0 ? (
              <div className="text-center text-health-charcoal/60 py-8">No verified proofs found.</div>
            ) : (
              verifiedProofs.map((proof: any) => (
                <div key={proof._id || proof.id} className="flex items-center justify-between p-4 border rounded-lg bg-health-success/5 border-health-success/20">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-health-success rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium">{proof.patientName || proof.patient || 'Unknown'}</div>
                      <div className="text-sm text-gray-600">{proof.proofType}</div>
                      <div className="text-xs text-gray-500">
                        Verified: {proof.verificationDate ? new Date(proof.verificationDate).toLocaleString() : ''}
                      </div>
                      {proof.signature && (
                        <div className="text-xs font-mono text-gray-400">
                          Signature: {proof.signature}
                        </div>
                      )}
                    </div>
                  </div>
                  {proof.fileUrl ? (
                    <a href={proof.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                    </a>
                  ) : (
                    <Button size="sm" variant="outline" disabled>
                      <Download className="w-4 h-4 mr-2" />
                      No PDF
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Patient Directory */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Patient Directory
            </CardTitle>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  className="pl-10 pr-4 py-2 border rounded-md text-sm"
                />
              </div>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Patient
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {patients.map((patient) => (
              <div key={patient._id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3 mb-3">
                  <Avatar>
                    <AvatarImage src={patient.profileImage || "/placeholder.svg"} />
                    <AvatarFallback className="bg-health-teal text-white">
                      {patient.firstName?.charAt(0) || ''}{patient.lastName?.charAt(0) || ''}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">{patient.firstName} {patient.lastName}</div>
                    <div className="text-xs text-gray-500">
                      Email: {patient.email}
                    </div>
                  </div>
                </div>
                <Button size="sm" className="w-full bg-health-aqua text-white">
                  Request New Proof
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorDashboard;
