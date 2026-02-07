import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  FileText, Clock, User, Hospital, AlertTriangle, CheckCircle,
  XCircle, ArrowLeft, Plus, Search, Filter, Calendar, Phone,
  Mail, MapPin, Stethoscope, Heart, Brain, Eye, Baby, Shield
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import patientHospitalService, { PatientAdmissionRequest } from '@/services/patientHospitalService';

const AdmissionRequests: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<PatientAdmissionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<PatientAdmissionRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchAdmissionRequests();
  }, []);

  const fetchAdmissionRequests = async () => {
    setLoading(true);
    try {
      const response = await patientHospitalService.getPatientAdmissionRequests();
      setRequests(response);
    } catch (error) {
      console.error('Failed to fetch admission requests:', error);
      toast.error('Failed to load admission requests');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (request: PatientAdmissionRequest) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleCancelRequest = async (requestId: string, reason: string) => {
    setCancelling(true);
    try {
      await patientHospitalService.cancelAdmissionRequest(requestId, reason);
      toast.success('Admission request cancelled successfully');
      setShowCancelModal(false);
      fetchAdmissionRequests();
    } catch (error) {
      console.error('Failed to cancel admission request:', error);
      toast.error('Failed to cancel admission request');
    } finally {
      setCancelling(false);
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
    const matchesSearch = request.hospital.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.primaryDiagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/patient/dashboard')}
            className="mb-4 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admission Requests</h1>
              <p className="text-gray-600">Track your hospital admission requests</p>
            </div>
            <Button
              onClick={() => navigate('/patient/request-admission')}
              className="bg-health-teal hover:bg-health-aqua"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by hospital, request number, or diagnosis..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
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
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No admission requests found</h3>
              <p className="text-gray-600 mb-6">
                {requests.length === 0
                  ? "You haven't submitted any admission requests yet."
                  : "No requests match your current filters."
                }
              </p>
              {requests.length === 0 && (
                <Button
                  onClick={() => navigate('/patient/request-admission')}
                  className="bg-health-teal hover:bg-health-aqua"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Submit Your First Request
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredRequests.map((request) => (
              <Card key={request._id} className="hover:shadow-md transition-shadow">
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-semibold text-lg mb-2">{request.hospital.hospitalName}</h3>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{typeof request.hospital.address === 'string' ? request.hospital.address : `${request.hospital.address?.street || ''}, ${request.hospital.address?.city || ''}, ${request.hospital.address?.state || ''}`}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span>Request #{request.requestNumber}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>Submitted {format(new Date(request.createdAt), 'MMM dd, yyyy')}</span>
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
                      </div>

                      {request.status === 'approved' && (request.assignedRoom || request.estimatedAdmissionDate) && (
                        <div className="mt-4 p-3 bg-green-50 rounded-lg">
                          <h4 className="font-semibold text-green-800 mb-2">Admission Details</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
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
                          <h4 className="font-semibold text-blue-800 mb-2">Hospital Notes</h4>
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowCancelModal(true);
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          Cancel
                        </Button>
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
                    <h3 className="font-semibold text-lg mb-3">Request Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Request Number:</strong> {selectedRequest.requestNumber}</p>
                      <p><strong>Status:</strong>
                        <Badge className={`ml-2 ${getStatusColor(selectedRequest.status)}`}>
                          {selectedRequest.status}
                        </Badge>
                      </p>
                      <p><strong>Submitted:</strong> {format(new Date(selectedRequest.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                      <p><strong>Last Updated:</strong> {format(new Date(selectedRequest.updatedAt), 'MMM dd, yyyy HH:mm')}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">Hospital Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Hospital:</strong> {selectedRequest.hospital.hospitalName}</p>
                      <p><strong>Address:</strong> {typeof selectedRequest.hospital.address === 'string' ? selectedRequest.hospital.address : `${selectedRequest.hospital.address?.street || ''}, ${selectedRequest.hospital.address?.city || ''}, ${selectedRequest.hospital.address?.state || ''}`}</p>
                      <p><strong>Department:</strong> {selectedRequest.department}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Medical Details</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Admission Type:</strong>
                        <Badge className={`ml-2 ${getAdmissionTypeColor(selectedRequest.admissionType)}`}>
                          {selectedRequest.admissionType}
                        </Badge>
                      </p>
                      <p><strong>Urgency:</strong>
                        <Badge className={`ml-2 ${getUrgencyColor(selectedRequest.urgency)}`}>
                          {selectedRequest.urgency}
                        </Badge>
                      </p>
                      <p><strong>Primary Diagnosis:</strong> {selectedRequest.primaryDiagnosis}</p>
                      {selectedRequest.secondaryDiagnosis && (
                        <p><strong>Secondary Diagnosis:</strong> {selectedRequest.secondaryDiagnosis}</p>
                      )}
                      <p><strong>Expected Stay:</strong> {selectedRequest.expectedStay} days</p>
                    </div>
                  </div>

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
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">Emergency Contact</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <p><strong>Name:</strong> {selectedRequest.emergencyContact.name}</p>
                    <p><strong>Relationship:</strong> {selectedRequest.emergencyContact.relationship}</p>
                    <p><strong>Phone:</strong> {selectedRequest.emergencyContact.phone}</p>
                    {selectedRequest.emergencyContact.email && (
                      <p><strong>Email:</strong> {selectedRequest.emergencyContact.email}</p>
                    )}
                  </div>
                </div>

                {selectedRequest.notes && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Additional Notes</h3>
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

        {/* Cancel Request Modal */}
        <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Admission Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">
                Are you sure you want to cancel your admission request to {selectedRequest?.hospital.hospitalName}?
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCancelModal(false)}
                >
                  Keep Request
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (selectedRequest) {
                      handleCancelRequest(selectedRequest._id, 'Cancelled by patient');
                    }
                  }}
                  disabled={cancelling}
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Request'}
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