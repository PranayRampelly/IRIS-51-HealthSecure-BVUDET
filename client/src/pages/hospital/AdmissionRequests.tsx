import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  FileText, Clock, User, Hospital, AlertTriangle, CheckCircle,
  XCircle, ArrowLeft, Search, Filter, Calendar, Phone,
  Mail, MapPin, Stethoscope, Heart, Brain, Eye, Baby, Shield,
  Users, Bed, Activity, Star
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import hospitalService from '@/services/hospitalService';
import api from '@/lib/api';

interface AdmissionRequest {
  _id: string;
  requestNumber: string;
  patient: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  hospital: {
    _id: string;
    hospitalName: string;
    address: string;
  };
  admissionType: string;
  department: string;
  primaryDiagnosis: string;
  secondaryDiagnosis?: string;
  symptoms: string[];
  allergies?: string[];
  currentMedications?: string[];
  urgency: string;
  expectedStay: number;
  roomPreference?: string;
  specialRequirements?: string;
  insuranceProvider?: string;
  policyNumber?: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  notes?: string;
  preferredAdmissionDate?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  statusHistory: {
    status: string;
    timestamp: string;
    updatedBy: string;
    notes?: string;
  }[];
  reviewNotes?: string;
  assignedDoctor?: {
    _id: string;
    firstName: string;
    lastName: string;
    specialization: string;
  };
  assignedRoom?: string;
  assignedBed?: string;
  estimatedAdmissionDate?: string;
  createdAt: string;
  updatedAt: string;
}

const AdmissionRequests: React.FC = () => {
  const navigate = useNavigate();
  const surfaceCard = "bg-white/80 border border-white/60 shadow-sm backdrop-blur";
  const [requests, setRequests] = useState<AdmissionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<AdmissionRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [assignedDoctor, setAssignedDoctor] = useState('');
  const [assignedRoom, setAssignedRoom] = useState('');
  const [assignedBed, setAssignedBed] = useState('');
  const [estimatedAdmissionDate, setEstimatedAdmissionDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);

  useEffect(() => {
    fetchAdmissionRequests();
    fetchDoctors();
  }, []);

  const fetchAdmissionRequests = async () => {
    setLoading(true);
    try {
      const response = await hospitalService.getHospitalAdmissionRequests();
      setRequests(response);
    } catch (error) {
      console.error('Failed to fetch admission requests:', error);
      toast.error('Failed to load admission requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/hospital/doctors');
      console.log('Doctors API Response:', response.data);
      if (response.data.success) {
        const doctorsList = response.data.doctors || [];
        console.log('Doctors list:', doctorsList);
        setDoctors(doctorsList);
      } else {
        console.warn('API returned success=false:', response.data);
        setDoctors([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch doctors:', error);
      console.error('Error details:', error.response?.data);
      setDoctors([]);
      toast.error('Failed to load doctors list');
    }
  };

  const handleViewDetails = (request: AdmissionRequest) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleReview = (request: AdmissionRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setReviewAction(action);
    setReviewNotes('');
    setAssignedDoctor('');
    setAssignedRoom('');
    setAssignedBed('');
    setEstimatedAdmissionDate('');
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedRequest || !reviewAction) return;

    setSubmitting(true);
    try {
      // Refresh the request to get latest status before submitting
      const currentRequests = await hospitalService.getHospitalAdmissionRequests();
      const currentRequest = currentRequests.find((r: AdmissionRequest) => r._id === selectedRequest._id);
      
      if (!currentRequest) {
        toast.error('Admission request not found');
        setShowReviewModal(false);
        fetchAdmissionRequests();
        return;
      }

      // Check if request is still pending
      if (currentRequest.status !== 'pending') {
        toast.error(`This request has already been ${currentRequest.status}`);
        setShowReviewModal(false);
        fetchAdmissionRequests();
        return;
      }

      // Map frontend action to backend status
      const statusMap: { [key: string]: string } = {
        'approve': 'approved',
        'reject': 'rejected'
      };
      const status = statusMap[reviewAction] || reviewAction;

      const reviewData = {
        status: status,
        reviewNotes,
        assignedDoctor: assignedDoctor || undefined,
        assignedRoom: assignedRoom || undefined,
        assignedBed: assignedBed || undefined,
        estimatedAdmissionDate: estimatedAdmissionDate ? new Date(estimatedAdmissionDate).toISOString() : undefined
      };

      const response = await hospitalService.reviewAdmissionRequest(selectedRequest._id, reviewData);
      if (response.success) {
        toast.success(`Admission request ${reviewAction}d successfully`);
        setShowReviewModal(false);
        // Reset form
        setReviewNotes('');
        setAssignedDoctor('');
        setAssignedRoom('');
        setAssignedBed('');
        setEstimatedAdmissionDate('');
        setSelectedRequest(null);
        setReviewAction(null);
        fetchAdmissionRequests();
      } else {
        toast.error(response.message || 'Failed to review admission request');
      }
    } catch (error: any) {
      console.error('Failed to review admission request:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to review admission request';
      toast.error(errorMessage);
      
      // If error is about status, refresh the list
      if (errorMessage.includes('not pending') || errorMessage.includes('already been')) {
        fetchAdmissionRequests();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAdmissionTypeColor = (type: string) => {
    switch (type) {
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'elective': return 'bg-blue-100 text-blue-800';
      case 'transfer': return 'bg-purple-100 text-purple-800';
      case 'day-care': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.primaryDiagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'all' || request.urgency === urgencyFilter;
    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-health-light-gray via-white to-health-light-gray/40">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.3em] text-health-aqua/70 uppercase mb-2">Care Coordination</p>
            <h1 className="text-3xl font-montserrat font-bold text-health-teal">Admission Requests</h1>
            <p className="text-health-charcoal mt-2">Review and manage patient admission requests</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/hospital/dashboard')}
              className="border-health-teal/30 text-health-teal hover:bg-health-teal/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className={surfaceCard}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-health-charcoal/70">Total Requests</p>
                  <p className="text-2xl font-bold text-health-teal">{requests.length}</p>
                </div>
                <div className="p-2 bg-health-teal/15 rounded-xl">
                  <FileText className="h-6 w-6 text-health-teal" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={surfaceCard}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-health-charcoal/70">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-xl">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={surfaceCard}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-health-charcoal/70">Approved</p>
                  <p className="text-2xl font-bold text-health-success">{approvedCount}</p>
                </div>
                <div className="p-2 bg-health-success/15 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-health-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={surfaceCard}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-health-charcoal/70">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
                </div>
                <div className="p-2 bg-red-100 rounded-xl">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className={surfaceCard}>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by patient name, request number, or diagnosis..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Urgency</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Requests List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-health-teal mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading admission requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <Card className={surfaceCard}>
            <CardContent className="p-12 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No admission requests found</h3>
              <p className="text-gray-600">
                {requests.length === 0
                  ? "No admission requests have been submitted yet."
                  : "No requests match your current filters."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredRequests.map((request) => (
              <Card key={request._id} className={`${surfaceCard} hover:shadow-lg transition-shadow`}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1 capitalize">{request.status}</span>
                        </Badge>
                        <Badge className={getAdmissionTypeColor(request.admissionType)}>
                          {request.admissionType}
                        </Badge>
                        <Badge className={getUrgencyColor(request.urgency)}>
                          {request.urgency}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h3 className="font-semibold text-lg mb-2">
                            {request.patient.firstName} {request.patient.lastName}
                          </h3>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span>Request #{request.requestNumber}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>Submitted {format(new Date(request.createdAt), 'MMM dd, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span>{request.patient.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              <span>{request.patient.email}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Medical Details</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p><strong>Department:</strong> {request.department}</p>
                            <p><strong>Diagnosis:</strong> {request.primaryDiagnosis}</p>
                            <p><strong>Expected Stay:</strong> {request.expectedStay} days</p>
                            {request.assignedDoctor && (
                              <p><strong>Assigned Doctor:</strong> Dr. {request.assignedDoctor.firstName} {request.assignedDoctor.lastName}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Emergency Contact</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p><strong>Name:</strong> {request.emergencyContact.name}</p>
                            <p><strong>Relationship:</strong> {request.emergencyContact.relationship}</p>
                            <p><strong>Phone:</strong> {request.emergencyContact.phone}</p>
                            {request.emergencyContact.email && (
                              <p><strong>Email:</strong> {request.emergencyContact.email}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {request.status === 'approved' && (request.assignedRoom || request.estimatedAdmissionDate) && (
                        <div className="mt-4 p-3 bg-green-50 rounded-lg">
                          <h4 className="font-semibold text-green-800 mb-2">Admission Details</h4>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            {request.assignedRoom && (
                              <p><strong>Room:</strong> {request.assignedRoom}</p>
                            )}
                            {request.assignedBed && (
                              <p><strong>Bed:</strong> {request.assignedBed}</p>
                            )}
                            {request.estimatedAdmissionDate && (
                              <p><strong>Estimated Admission:</strong> {format(new Date(request.estimatedAdmissionDate), 'MMM dd, yyyy')}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {request.reviewNotes && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <h4 className="font-semibold text-blue-800 mb-2">Review Notes</h4>
                          <p className="text-sm text-blue-700">{request.reviewNotes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(request)}
                      >
                        View Details
                      </Button>
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleReview(request, 'approve')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleReview(request, 'reject')}
                            variant="destructive"
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Request Details Modal */}
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Admission Request Details</DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Patient Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Name:</strong> {selectedRequest.patient.firstName} {selectedRequest.patient.lastName}</p>
                      <p><strong>Email:</strong> {selectedRequest.patient.email}</p>
                      <p><strong>Phone:</strong> {selectedRequest.patient.phone}</p>
                      <p><strong>Request Number:</strong> {selectedRequest.requestNumber}</p>
                      <div><strong>Status:</strong>
                        <Badge className={`ml-2 ${getStatusColor(selectedRequest.status)}`}>
                          {selectedRequest.status}
                        </Badge>
                      </div>
                      <p><strong>Submitted:</strong> {format(new Date(selectedRequest.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">Medical Details</h3>
                    <div className="space-y-2 text-sm">
                      <div><strong>Admission Type:</strong>
                        <Badge className={`ml-2 ${getAdmissionTypeColor(selectedRequest.admissionType)}`}>
                          {selectedRequest.admissionType}
                        </Badge>
                      </div>
                      <div><strong>Urgency:</strong>
                        <Badge className={`ml-2 ${getUrgencyColor(selectedRequest.urgency)}`}>
                          {selectedRequest.urgency}
                        </Badge>
                      </div>
                      <p><strong>Department:</strong> {selectedRequest.department}</p>
                      <p><strong>Primary Diagnosis:</strong> {selectedRequest.primaryDiagnosis}</p>
                      {selectedRequest.secondaryDiagnosis && (
                        <p><strong>Secondary Diagnosis:</strong> {selectedRequest.secondaryDiagnosis}</p>
                      )}
                      <p><strong>Expected Stay:</strong> {selectedRequest.expectedStay} days</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Symptoms & Medications</h3>
                    <div className="space-y-2 text-sm">
                      {selectedRequest.symptoms.length > 0 && (
                        <div>
                          <p><strong>Symptoms:</strong></p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedRequest.symptoms.map((symptom, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">{symptom}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedRequest.allergies && selectedRequest.allergies.length > 0 && (
                        <div>
                          <p><strong>Allergies:</strong></p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedRequest.allergies.map((allergy, index) => (
                              <Badge key={index} variant="destructive" className="text-xs">{allergy}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedRequest.currentMedications && selectedRequest.currentMedications.length > 0 && (
                        <div>
                          <p><strong>Current Medications:</strong></p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedRequest.currentMedications.map((medication, index) => (
                              <Badge key={index} variant="outline" className="text-xs">{medication}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">Emergency Contact</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Name:</strong> {selectedRequest.emergencyContact.name}</p>
                      <p><strong>Relationship:</strong> {selectedRequest.emergencyContact.relationship}</p>
                      <p><strong>Phone:</strong> {selectedRequest.emergencyContact.phone}</p>
                      {selectedRequest.emergencyContact.email && (
                        <p><strong>Email:</strong> {selectedRequest.emergencyContact.email}</p>
                      )}
                    </div>
                  </div>
                </div>

                {selectedRequest.notes && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Patient Notes</h3>
                    <p className="text-sm text-gray-700">{selectedRequest.notes}</p>
                  </div>
                )}

                {selectedRequest.statusHistory && selectedRequest.statusHistory.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Status History</h3>
                    <div className="space-y-2">
                      {selectedRequest.statusHistory.map((history, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                          <Badge className={getStatusColor(history.status)}>
                            {history.status}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {format(new Date(history.timestamp), 'MMM dd, yyyy HH:mm')}
                          </span>
                          {history.notes && (
                            <span className="text-sm text-gray-500">- {history.notes}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Review Modal */}
        <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {reviewAction === 'approve' ? 'Approve' : 'Reject'} Admission Request
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Review Notes *</Label>
                <Textarea
                  placeholder={`Enter your ${reviewAction === 'approve' ? 'approval' : 'rejection'} notes...`}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {reviewAction === 'approve' && (
                <>
                  <div>
                    <Label>Assign Doctor</Label>
                    <Select value={assignedDoctor} onValueChange={setAssignedDoctor}>
                      <SelectTrigger>
                        <SelectValue placeholder={doctors.length === 0 ? "Loading doctors..." : "Select a doctor"} />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.length === 0 ? (
                          <SelectItem value="no-doctors" disabled>
                            {loading ? "Loading doctors..." : "No doctors available"}
                          </SelectItem>
                        ) : (
                          doctors.map((doctor) => (
                            <SelectItem key={doctor.id || doctor._id} value={doctor.id || doctor._id}>
                              Dr. {doctor.firstName || doctor.name?.split(' ')[0] || 'Unknown'} {doctor.lastName || doctor.name?.split(' ').slice(1).join(' ') || ''} - {doctor.specialty || doctor.specialization || 'General'}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Assign Room</Label>
                      <Input
                        placeholder="e.g., 301"
                        value={assignedRoom}
                        onChange={(e) => setAssignedRoom(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Assign Bed</Label>
                      <Input
                        placeholder="e.g., A"
                        value={assignedBed}
                        onChange={(e) => setAssignedBed(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Estimated Admission Date</Label>
                    <Input
                      type="date"
                      value={estimatedAdmissionDate}
                      onChange={(e) => setEstimatedAdmissionDate(e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowReviewModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitReview}
                  disabled={submitting || !reviewNotes}
                  className={reviewAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                >
                  {submitting ? 'Submitting...' : `${reviewAction === 'approve' ? 'Approve' : 'Reject'} Request`}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdmissionRequests; 