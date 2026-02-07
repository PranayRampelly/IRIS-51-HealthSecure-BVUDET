import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import {
  Hospital, Calendar as CalendarIcon, Clock, AlertTriangle,
  User, Phone, Mail, MapPin, FileText, Plus, ArrowLeft,
  Stethoscope, Heart, Brain, Eye, Baby, Shield, Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import patientHospitalService from '@/services/patientHospitalService';
import { AvailableHospital } from '@/services/patientHospitalService';

interface AdmissionRequestData {
  hospitalId: string;
  admissionType: 'emergency' | 'elective' | 'transfer' | 'day-care';
  department: string;
  primaryDiagnosis: string;
  secondaryDiagnosis?: string;
  symptoms: string[];
  allergies?: string[];
  currentMedications?: string[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
  expectedStay: number;
  roomPreference?: 'general' | 'semi-private' | 'private' | 'icu';
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
}

const RequestAdmission: React.FC = () => {
  console.log('RequestAdmission component rendered');
  console.log('Component is loading...');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hospitals, setHospitals] = useState<AvailableHospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<AvailableHospital | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [showHospitalModal, setShowHospitalModal] = useState(false);

  const [requestData, setRequestData] = useState<AdmissionRequestData>({
    hospitalId: '',
    admissionType: 'elective',
    department: '',
    primaryDiagnosis: '',
    symptoms: [],
    urgency: 'medium',
    expectedStay: 1,
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
      email: ''
    }
  });

  // Input state for dynamic fields
  const [symptomInput, setSymptomInput] = useState('');
  const [allergyInput, setAllergyInput] = useState('');
  const [medicationInput, setMedicationInput] = useState('');

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    console.log('Fetching hospitals...');
    setLoading(true);
    try {
      const hospitalsData = await patientHospitalService.getAvailableHospitals();
      console.log('Hospitals data:', hospitalsData);
      console.log('Number of hospitals:', hospitalsData?.length || 0);
      setHospitals(hospitalsData || []);
    } catch (error) {
      console.error('Failed to fetch hospitals:', error);
      toast.error('Failed to load hospitals');

      // Fallback: Set some sample hospitals for testing
      const sampleHospitals = [
        {
          _id: '1',
          hospitalName: 'SL RAHEJA Hospital',
          hospitalType: 'Specialty Hospital',
          location: { address: 'Raheja Rugnalaya Marg, Mumbai, Maharashtra' },
          phone: '+91 22 1234 5678',
          emergencyContact: '+91 22 9999 9999',
          rating: 4.8
        },
        {
          _id: '2',
          hospitalName: 'Apollo Hospitals',
          hospitalType: 'General Hospital',
          location: { address: '154/11, Bannerghatta Road, Bangalore, Karnataka' },
          phone: '+91 80 2630 4050',
          emergencyContact: '+91 80 2630 4051',
          rating: 4.6
        }
      ];
      setHospitals(sampleHospitals);
    } finally {
      setLoading(false);
    }
  };

  const handleHospitalSelect = (hospital: AvailableHospital) => {
    setSelectedHospital(hospital);
    setRequestData(prev => ({ ...prev, hospitalId: hospital._id }));
    setShowHospitalModal(false);
    setStep(2);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setRequestData(prev => ({ ...prev, [field]: value }));
  };

  const handleEmergencyContactChange = (field: string, value: string) => {
    setRequestData(prev => ({
      ...prev,
      emergencyContact: { ...prev.emergencyContact, [field]: value }
    }));
  };

  const addSymptom = () => {
    if (symptomInput && symptomInput.trim()) {
      setRequestData(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, symptomInput.trim()]
      }));
      setSymptomInput('');
    }
  };

  const removeSymptom = (index: number) => {
    setRequestData(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter((_, i) => i !== index)
    }));
  };

  const addAllergy = () => {
    if (allergyInput && allergyInput.trim()) {
      setRequestData(prev => ({
        ...prev,
        allergies: [...(prev.allergies || []), allergyInput.trim()]
      }));
      setAllergyInput('');
    }
  };

  const removeAllergy = (index: number) => {
    setRequestData(prev => ({
      ...prev,
      allergies: prev.allergies?.filter((_, i) => i !== index) || []
    }));
  };

  const addMedication = () => {
    if (medicationInput && medicationInput.trim()) {
      setRequestData(prev => ({
        ...prev,
        currentMedications: [...(prev.currentMedications || []), medicationInput.trim()]
      }));
      setMedicationInput('');
    }
  };

  const removeMedication = (index: number) => {
    setRequestData(prev => ({
      ...prev,
      currentMedications: prev.currentMedications?.filter((_, i) => i !== index) || []
    }));
  };

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        return !!requestData.hospitalId;
      case 2: {
        // Validate Step 2: Medical details including symptoms
        const hasAdmissionType = !!requestData.admissionType;
        const hasDepartment = !!requestData.department;
        const hasPrimaryDiagnosis = !!requestData.primaryDiagnosis;
        const hasSymptoms = requestData.symptoms.length > 0;

        console.log('Step 2 Validation:', {
          hasAdmissionType,
          hasDepartment,
          hasPrimaryDiagnosis,
          hasSymptoms,
          symptomsCount: requestData.symptoms.length
        });

        return hasAdmissionType && hasDepartment && hasPrimaryDiagnosis && hasSymptoms;
      }
      case 3: {
        // Validate Step 3: Emergency contact information only
        const hasContactName = !!requestData.emergencyContact.name;
        const hasContactPhone = !!requestData.emergencyContact.phone;
        const hasContactRelationship = !!requestData.emergencyContact.relationship;

        console.log('Step 3 Validation:', {
          hasContactName,
          hasContactPhone,
          hasContactRelationship,
          contactName: requestData.emergencyContact.name,
          contactPhone: requestData.emergencyContact.phone,
          contactRelationship: requestData.emergencyContact.relationship
        });

        return hasContactName && hasContactPhone && hasContactRelationship;
      }
      case 4:
        return true; // Final step is just review
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    } else {
      // Provide specific error messages based on the current step
      const missingFields = [];

      if (step === 2) {
        if (!requestData.admissionType) missingFields.push('admission type');
        if (!requestData.department) missingFields.push('department');
        if (!requestData.primaryDiagnosis) missingFields.push('primary diagnosis');
        if (requestData.symptoms.length === 0) missingFields.push('symptoms');
      } else if (step === 3) {
        if (!requestData.emergencyContact.name) missingFields.push('emergency contact name');
        if (!requestData.emergencyContact.relationship) missingFields.push('relationship');
        if (!requestData.emergencyContact.phone) missingFields.push('emergency contact phone');
      }

      if (missingFields.length > 0) {
        toast.error(`Please fill in: ${missingFields.join(', ')}`);
      } else {
        toast.error('Please fill in all required fields');
      }
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await patientHospitalService.requestHospitalAdmission(requestData);
      toast.success('Admission request submitted successfully!');
      navigate('/patient/admission-requests');
    } catch (error) {
      console.error('Failed to submit admission request:', error);
      toast.error('Failed to submit admission request');
    } finally {
      setSubmitting(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Request Hospital Admission</h1>
          <p className="text-gray-600">Submit your admission request to hospitals</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= stepNumber ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`w-16 h-1 mx-2 ${step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Select Hospital</span>
            <span>Medical Details</span>
            <span>Contact Info</span>
            <span>Review</span>
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardContent className="p-6">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Select Hospital</h2>
                  <Button
                    onClick={() => setShowHospitalModal(true)}
                    className="w-full"
                  >
                    <Hospital className="h-4 w-4 mr-2" />
                    {selectedHospital ? selectedHospital.hospitalName : 'Choose Hospital'}
                  </Button>
                </div>

                {selectedHospital && (
                  <Card className="border-2 border-blue-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{selectedHospital.hospitalName}</h3>
                          <p className="text-gray-600">{selectedHospital.location?.address || 'Address not available'}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant="secondary">{selectedHospital.hospitalType}</Badge>
                            {selectedHospital.rating && (
                              <div className="flex items-center">
                                <span className="text-yellow-500">★</span>
                                <span className="ml-1">{selectedHospital.rating}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => setShowHospitalModal(true)}
                        >
                          Change
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Medical Details</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Admission Type *</Label>
                    <Select
                      value={requestData.admissionType}
                      onValueChange={(value) => handleInputChange('admissionType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="elective">Elective</SelectItem>
                        <SelectItem value="transfer">Transfer</SelectItem>
                        <SelectItem value="day-care">Day Care</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Department *</Label>
                    <Select
                      value={requestData.department}
                      onValueChange={(value) => handleInputChange('department', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cardiology">Cardiology</SelectItem>
                        <SelectItem value="neurology">Neurology</SelectItem>
                        <SelectItem value="orthopedics">Orthopedics</SelectItem>
                        <SelectItem value="general-surgery">General Surgery</SelectItem>
                        <SelectItem value="pediatrics">Pediatrics</SelectItem>
                        <SelectItem value="obstetrics">Obstetrics</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="icu">ICU</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Urgency Level *</Label>
                    <Select
                      value={requestData.urgency}
                      onValueChange={(value) => handleInputChange('urgency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Expected Stay (Days) *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={requestData.expectedStay}
                      onChange={(e) => handleInputChange('expectedStay', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <Label>Primary Diagnosis *</Label>
                  <Textarea
                    placeholder="Describe your primary medical condition..."
                    value={requestData.primaryDiagnosis}
                    onChange={(e) => handleInputChange('primaryDiagnosis', e.target.value)}
                  />
                </div>

                <div>
                  <Label>Secondary Diagnosis</Label>
                  <Textarea
                    placeholder="Any secondary conditions..."
                    value={requestData.secondaryDiagnosis || ''}
                    onChange={(e) => handleInputChange('secondaryDiagnosis', e.target.value)}
                  />
                </div>

                <div>
                  <Label>Symptoms *</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add symptom..."
                        value={symptomInput}
                        onChange={(e) => setSymptomInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSymptom();
                          }
                        }}
                      />
                      <Button type="button" onClick={addSymptom} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {requestData.symptoms.map((symptom, index) => (
                        <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeSymptom(index)}>
                          {symptom} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Allergies</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add allergy..."
                        value={allergyInput}
                        onChange={(e) => setAllergyInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addAllergy();
                          }
                        }}
                      />
                      <Button type="button" onClick={addAllergy} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {requestData.allergies?.map((allergy, index) => (
                        <Badge key={index} variant="destructive" className="cursor-pointer" onClick={() => removeAllergy(index)}>
                          {allergy} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Current Medications</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add medication..."
                        value={medicationInput}
                        onChange={(e) => setMedicationInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addMedication();
                          }
                        }}
                      />
                      <Button type="button" onClick={addMedication} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {requestData.currentMedications?.map((medication, index) => (
                        <Badge key={index} variant="outline" className="cursor-pointer" onClick={() => removeMedication(index)}>
                          {medication} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Emergency Contact & Preferences</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Emergency Contact Name *</Label>
                    <Input
                      value={requestData.emergencyContact.name}
                      onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Relationship *</Label>
                    <Select
                      value={requestData.emergencyContact.relationship}
                      onValueChange={(value) => handleEmergencyContactChange('relationship', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="spouse">Spouse</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="child">Child</SelectItem>
                        <SelectItem value="sibling">Sibling</SelectItem>
                        <SelectItem value="friend">Friend</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Emergency Contact Phone *</Label>
                    <Input
                      type="tel"
                      value={requestData.emergencyContact.phone}
                      onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Emergency Contact Email</Label>
                    <Input
                      type="email"
                      value={requestData.emergencyContact.email}
                      onChange={(e) => handleEmergencyContactChange('email', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Room Preference</Label>
                    <Select
                      value={requestData.roomPreference}
                      onValueChange={(value) => handleInputChange('roomPreference', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Ward</SelectItem>
                        <SelectItem value="semi-private">Semi-Private</SelectItem>
                        <SelectItem value="private">Private Room</SelectItem>
                        <SelectItem value="icu">ICU</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Insurance Provider</Label>
                    <Input
                      value={requestData.insuranceProvider}
                      onChange={(e) => handleInputChange('insuranceProvider', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label>Special Requirements</Label>
                  <Textarea
                    placeholder="Any special requirements or accommodations needed..."
                    value={requestData.specialRequirements}
                    onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
                  />
                </div>

                <div>
                  <Label>Additional Notes</Label>
                  <Textarea
                    placeholder="Any additional information..."
                    value={requestData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                  />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Review Admission Request</h2>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Hospital Information</h3>
                    <div className="space-y-2">
                      <p><strong>Hospital:</strong> {selectedHospital?.hospitalName}</p>
                      <p><strong>Address:</strong> {selectedHospital?.location?.address || 'Address not available'}</p>
                      <p><strong>Type:</strong> {selectedHospital?.hospitalType}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Medical Details</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getAdmissionTypeColor(requestData.admissionType)}>
                          {requestData.admissionType}
                        </Badge>
                        <Badge className={getUrgencyColor(requestData.urgency)}>
                          {requestData.urgency}
                        </Badge>
                      </div>
                      <p><strong>Department:</strong> {requestData.department}</p>
                      <p><strong>Expected Stay:</strong> {requestData.expectedStay} days</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Primary Diagnosis</h3>
                  <p className="text-gray-700">{requestData.primaryDiagnosis}</p>
                </div>

                {requestData.symptoms.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Symptoms</h3>
                    <div className="flex flex-wrap gap-2">
                      {requestData.symptoms.map((symptom, index) => (
                        <Badge key={index} variant="secondary">{symptom}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-lg mb-2">Emergency Contact</h3>
                  <div className="space-y-1">
                    <p><strong>Name:</strong> {requestData.emergencyContact.name}</p>
                    <p><strong>Relationship:</strong> {requestData.emergencyContact.relationship}</p>
                    <p><strong>Phone:</strong> {requestData.emergencyContact.phone}</p>
                    {requestData.emergencyContact.email && (
                      <p><strong>Email:</strong> {requestData.emergencyContact.email}</p>
                    )}
                  </div>
                </div>

                {requestData.notes && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Additional Notes</h3>
                    <p className="text-gray-700">{requestData.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={step === 1}
              >
                Previous
              </Button>

              <div className="flex gap-2">
                {step < 4 ? (
                  <Button onClick={handleNext}>
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {submitting ? 'Submitting...' : 'Submit Admission Request'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hospital Selection Modal */}
        {showHospitalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Select Hospital</h2>
                <Button variant="ghost" onClick={() => setShowHospitalModal(false)}>×</Button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading hospitals...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {hospitals.map((hospital) => (
                    <Card
                      key={hospital._id}
                      className="cursor-pointer hover:border-blue-600 transition-colors"
                      onClick={() => handleHospitalSelect(hospital)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">{hospital.hospitalName}</h3>
                            <p className="text-gray-600">{hospital.location?.address || 'Address not available'}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <Badge variant="secondary">{hospital.hospitalType}</Badge>
                              {hospital.rating && (
                                <div className="flex items-center">
                                  <span className="text-yellow-500">★</span>
                                  <span className="ml-1">{hospital.rating}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <Hospital className="h-6 w-6 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestAdmission;








