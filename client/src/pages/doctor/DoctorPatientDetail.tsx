
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Shield, FileText, Calendar, Phone, Mail } from 'lucide-react';
import axios from 'axios';

const DoctorPatientDetail = () => {
  const { patientId } = useParams();
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [patient, setPatient] = useState<any>(null);

  useEffect(() => {
    async function fetchPatientDetail() {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:8080/api/doctor/patients/${patientId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPatient(res.data.patient || null);
        setRecentRequests(res.data.recentRequests || []);
      } catch (e) {
        setPatient(null);
        setRecentRequests([]);
      }
    }
    fetchPatientDetail();
  }, [patientId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/doctor/patients">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Patients
            </Button>
          </Link>
          <h1 className="text-3xl font-montserrat font-bold text-health-teal">Patient Profile</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            View Records
          </Button>
          <Button className="bg-health-teal hover:bg-health-teal/90">
            <Shield className="w-4 h-4 mr-2" />
            Request Proof
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={patient?.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-health-teal text-white text-lg">
                    {patient?.firstName?.charAt(0) || ''}{patient?.lastName?.charAt(0) || ''}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold text-health-teal">{patient?.firstName} {patient?.lastName}</h3>
                  <p className="text-health-charcoal">Patient ID: {patientId}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-health-teal" />
                  <span className="text-sm text-health-charcoal">DOB: March 15, 1985</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-health-teal" />
                  <span className="text-sm text-health-charcoal">(555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-health-teal" />
                  <span className="text-sm text-health-charcoal">john.doe@email.com</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Consent Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-health-charcoal">Data Sharing</span>
                  <Badge className="bg-health-success">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-health-charcoal">Emergency Access</span>
                  <Badge className="bg-health-success">Granted</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-health-charcoal">Research Participation</span>
                  <Badge variant="secondary">Declined</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Proof Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentRequests.length === 0 ? (
                  <div className="text-center text-health-charcoal/60 py-8">No requests found.</div>
                ) : (
                  recentRequests.map((request) => (
                    <div key={request._id || request.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-health-teal">{request.purpose}</h4>
                        <Badge className={request.status === 'Approved' ? 'bg-health-success' : request.status === 'Pending' ? 'bg-health-warning' : 'bg-health-danger'}>{request.status}</Badge>
                      </div>
                      <p className="text-sm text-health-charcoal mb-2">{request.requestedProof}</p>
                      <p className="text-xs text-health-charcoal/70">Requested: {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : ''}{request.approvedAt ? ` • Completed: ${new Date(request.approvedAt).toLocaleDateString()}` : ''}</p>
                      {request.cloudinaryUrl && (
                        <a href={request.cloudinaryUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline">View Attachment</a>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Medical History Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-health-teal mb-2">Known Conditions</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Hypertension</Badge>
                    <Badge variant="outline">Type 2 Diabetes</Badge>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-health-teal mb-2">Current Medications</h4>
                  <ul className="text-sm text-health-charcoal space-y-1">
                    <li>• Lisinopril 10mg daily</li>
                    <li>• Metformin 500mg twice daily</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-health-teal mb-2">Last Visit</h4>
                  <p className="text-sm text-health-charcoal">January 15, 2024 - Annual physical examination</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorPatientDetail;
