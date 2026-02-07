
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Shield, User, Calendar as CalendarIcon, Clock, Send, Plus, Eye, Filter, Search } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { createProofRequest, getDoctorProofRequests } from '@/services/proofRequestService';

const DoctorRequestProof = () => {
  // State for form fields
  const [patientId, setPatientId] = useState('');
  const [purpose, setPurpose] = useState('');
  const [customPurpose, setCustomPurpose] = useState('');
  const [expiryDate, setExpiryDate] = useState<Date>();
  const [urgency, setUrgency] = useState('normal');
  const [dataFields, setDataFields] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [file, setFile] = useState<File | null>(null);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);

  // Mock stats and requests
  const stats = [
    { label: 'Total Requests', value: 12, icon: <Shield className="w-6 h-6 text-health-teal" /> },
    { label: 'Pending', value: 4, icon: <Clock className="w-6 h-6 text-health-warning" /> },
    { label: 'Approved', value: 6, icon: <Shield className="w-6 h-6 text-health-success" /> },
    { label: 'Expired', value: 2, icon: <Shield className="w-6 h-6 text-health-danger" /> },
  ];

  const availableDataFields = [
    'Basic Demographics',
    'Medical History',
    'Current Medications',
    'Lab Results',
    'Diagnostic Images',
    'Vital Signs',
    'Allergies',
    'Immunization Records',
    'Surgical History',
    'Family Medical History'
  ];

  React.useEffect(() => {
    async function fetchRecentRequests() {
      try {
        const res = await getDoctorProofRequests({ limit: 5 });
        setRecentRequests(res.data.requests || res.data.recentRequests || []);
      } catch (e) {
        setRecentRequests([]);
      }
    }
    fetchRecentRequests();
  }, []);

  const handleDataFieldChange = (field: string, checked: boolean) => {
    if (checked) {
      setDataFields([...dataFields, field]);
    } else {
      setDataFields(dataFields.filter(f => f !== field));
    }
  };

  const handleSubmitRequest = async () => {
    try {
      if (!patientId || !(purpose === 'other' ? customPurpose : purpose) || dataFields.length === 0) {
        toast.error('Please fill all required fields');
        return;
      }
      const data: any = {
        patientId,
        proofType: 'Custom',
        requestedProof: purpose === 'other' ? customPurpose : purpose,
        purpose: purpose === 'other' ? customPurpose : purpose,
        urgency: urgency === 'normal' ? 'Medium' : urgency.charAt(0).toUpperCase() + urgency.slice(1),
        expiresAt: expiryDate ? expiryDate.toISOString() : undefined,
        metadata: {
          dataFields: dataFields.join(','),
          customMessage
        }
      };
      if (file) data.file = file;
      await createProofRequest(data);
      toast.success('Proof request submitted!');
      setPatientId('');
      setPurpose('');
      setCustomPurpose('');
      setExpiryDate(undefined);
      setUrgency('normal');
      setDataFields([]);
      setCustomMessage('');
      setFile(null);
      // Refresh recent requests
      const res = await getDoctorProofRequests({ limit: 5 });
      setRecentRequests(res.data.requests || res.data.recentRequests || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to submit proof request');
    }
  };

  // Filtered requests for search and status
  const filteredRequests = recentRequests.filter(req => {
    const patient = req.patientId?.firstName || req.patient || '';
    const purpose = req.purpose || '';
    const id = req._id || req.id || '';
    const matchesSearch =
      patient.toLowerCase().includes(search.toLowerCase()) ||
      purpose.toLowerCase().includes(search.toLowerCase()) ||
      id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-montserrat font-bold text-health-teal">Request Proof</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-health-charcoal">Request zero-knowledge proofs from patients for specific data verification</span>
            <span className="flex items-center ml-2 text-xs text-health-success font-semibold"><span className="w-2 h-2 rounded-full bg-health-success mr-1"></span>Live</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="/doctor/all-proof-requests">
            <Button variant="outline"><Shield className="w-4 h-4 mr-2" />View All Requests</Button>
          </Link>
          <Link to="/doctor/create-template">
            <Button variant="outline"><Plus className="w-4 h-4 mr-2" />Create Template</Button>
          </Link>
          <Link to="/doctor/patient-search">
            <Button variant="outline"><User className="w-4 h-4 mr-2" />Patient Search</Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="flex flex-row items-center gap-4 p-4">
            <div className="bg-health-light-gray rounded-lg p-3 flex items-center justify-center">{stat.icon}</div>
            <div>
              <div className="text-2xl font-bold text-health-teal">{stat.value}</div>
              <div className="text-health-charcoal text-sm font-medium">{stat.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content: Form + Recent Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Request Form */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" />New Proof Request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label htmlFor="patientId">Patient ID or Email</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-health-blue-gray w-4 h-4" />
                <Input
                  id="patientId"
                  placeholder="Enter patient ID or email address"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="purpose">Purpose of Request</Label>
              <Select value={purpose} onValueChange={setPurpose}>
                <SelectTrigger>
                  <SelectValue placeholder="Select the purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="insurance-claim">Insurance Claim Verification</SelectItem>
                  <SelectItem value="treatment-planning">Treatment Planning</SelectItem>
                  <SelectItem value="consultation">Medical Consultation</SelectItem>
                  <SelectItem value="referral">Specialist Referral</SelectItem>
                  <SelectItem value="research">Medical Research</SelectItem>
                  <SelectItem value="legal">Legal Documentation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {purpose === 'other' && (
                <Input
                  className="mt-2"
                  placeholder="Enter custom purpose"
                  value={customPurpose}
                  onChange={e => setCustomPurpose(e.target.value)}
                />
              )}
            </div>

            <div>
              <Label>Data Fields Required</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {availableDataFields.map((field) => (
                  <div key={field} className="flex items-center space-x-2">
                    <Checkbox
                      id={field}
                      checked={dataFields.includes(field)}
                      onCheckedChange={(checked) => handleDataFieldChange(field, checked as boolean)}
                    />
                    <Label htmlFor={field} className="text-sm cursor-pointer">{field}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Expiry Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expiryDate ? format(expiryDate, "PPP") : "Select expiry date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={expiryDate}
                    onSelect={setExpiryDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Urgency Level</Label>
              <Select value={urgency} onValueChange={setUrgency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Response within 7 days</SelectItem>
                  <SelectItem value="normal">Normal - Response within 3 days</SelectItem>
                  <SelectItem value="high">High - Response within 24 hours</SelectItem>
                  <SelectItem value="urgent">Urgent - Response within 6 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="customMessage">Additional Message (Optional)</Label>
              <Textarea
                id="customMessage"
                placeholder="Provide any additional context or instructions for the patient..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="file">Attach File (optional)</Label>
              <Input id="file" type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
            </div>

            <Button 
              onClick={handleSubmitRequest}
              className="w-full bg-health-teal hover:bg-health-teal/90 text-white mt-2"
              disabled={!patientId || !(purpose === 'other' ? customPurpose : purpose) || dataFields.length === 0}
            >
              <Send className="w-4 h-4 mr-2" />
              Send Proof Request
            </Button>
          </CardContent>
        </Card>

        {/* Recent Requests Table/List */}
        <div className="space-y-6">
          {/* Filters/Search */}
          <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-between mb-2">
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-health-blue-gray w-4 h-4" />
              <Input
                placeholder="Search by patient, purpose, or request ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 mt-2 md:mt-0">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRequests.length === 0 ? (
                  <div className="text-center text-health-charcoal/60 py-8">No requests found.</div>
                ) : (
                  filteredRequests.map((request) => (
                    <div key={request._id || request.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-health-light-gray/40 transition">
                      <div>
                        <p className="font-medium">{request.patientId?.firstName || request.patient || 'Unknown'}</p>
                        <p className="text-sm text-health-charcoal/70">{request.purpose}</p>
                        <p className="text-xs text-health-charcoal/50">{request.createdAt ? new Date(request.createdAt).toLocaleDateString() : request.requestedAt}</p>
                        {request.cloudinaryUrl && (
                          <a href={request.cloudinaryUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline">View Attachment</a>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          request.status === 'Approved' ? 'bg-health-success text-white' :
                          request.status === 'Pending' ? 'bg-health-warning text-white' :
                          'bg-health-danger text-white'
                        }`}>
                          {request.status}
                        </span>
                        <Button size="icon" variant="outline"><Eye className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorRequestProof;
