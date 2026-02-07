
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Upload, User, Calendar, Plus, Trash2, Send } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const DoctorUploadPrescription = () => {
  const [patientId, setPatientId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [medications, setMedications] = useState([
    { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    async function fetchPrescriptions() {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8080/api/doctor/prescriptions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPrescriptions(res.data.prescriptions || []);
      } catch (e) {
        setPrescriptions([]);
      }
      setLoading(false);
    }
    fetchPrescriptions();
  }, []);

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (index: number, field: string, value: string) => {
    const updated = medications.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    );
    setMedications(updated);
  };

  const handleSubmit = async () => {
    try {
      if (!patientId || !diagnosis || medications.every(med => !med.name.trim())) {
        toast.error('Please fill all required fields');
        return;
      }
      const formData = new FormData();
      formData.append('patientId', patientId);
      formData.append('title', diagnosis);
      formData.append('description', notes);
      formData.append('medications', JSON.stringify(medications.filter(med => med.name.trim() !== '')));
      formData.append('instructions', notes);
      formData.append('followUpDate', '');
      if (file) formData.append('file', file);
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8080/api/doctor/prescriptions', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Prescription uploaded successfully!');
      setPatientId('');
      setDiagnosis('');
      setNotes('');
      setMedications([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
      setFile(null);
      // Refresh prescriptions
      setLoading(true);
      const res = await axios.get('http://localhost:8080/api/doctor/prescriptions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPrescriptions(res.data.prescriptions || []);
      setLoading(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to upload prescription');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-montserrat font-bold text-health-teal">Upload Prescription</h1>
        <p className="text-health-charcoal mt-2">Create and upload secure digital prescriptions to the blockchain</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prescription Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>New Prescription</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="patientId">Patient ID or Email</Label>
                <div className="relative">
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
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Input
                  id="diagnosis"
                  placeholder="Enter primary diagnosis"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="file">Attach File (optional)</Label>
                <Input id="file" type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Medications</CardTitle>
                <Button size="sm" variant="outline" onClick={addMedication}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Medication
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {medications.map((medication, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Medication {index + 1}</h4>
                    {medications.length > 1 && (
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => removeMedication(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Medication Name</Label>
                      <Input
                        placeholder="e.g., Metformin"
                        value={medication.name}
                        onChange={(e) => updateMedication(index, 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Dosage</Label>
                      <Input
                        placeholder="e.g., 500mg"
                        value={medication.dosage}
                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Frequency</Label>
                      <Select 
                        value={medication.frequency} 
                        onValueChange={(value) => updateMedication(index, 'frequency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="once-daily">Once daily</SelectItem>
                          <SelectItem value="twice-daily">Twice daily</SelectItem>
                          <SelectItem value="three-times-daily">Three times daily</SelectItem>
                          <SelectItem value="four-times-daily">Four times daily</SelectItem>
                          <SelectItem value="as-needed">As needed</SelectItem>
                          <SelectItem value="every-other-day">Every other day</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Duration</Label>
                      <Input
                        placeholder="e.g., 30 days"
                        value={medication.duration}
                        onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Special Instructions</Label>
                    <Textarea
                      placeholder="Take with food, avoid alcohol, etc."
                      value={medication.instructions}
                      onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Include any additional instructions, warnings, or notes for the patient..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button 
                  onClick={handleSubmit}
                  className="w-full bg-health-teal hover:bg-health-teal/90 text-white"
                  disabled={!patientId || !diagnosis || medications.every(med => !med.name.trim())}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Upload Prescription to Blockchain
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Prescriptions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Prescriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Diagnosis</TableHead>
                    <TableHead>Medications</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>File</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                    </TableRow>
                  ) : prescriptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-health-charcoal/60 py-8">No prescriptions found.</TableCell>
                    </TableRow>
                  ) : (
                    prescriptions.map((prescription) => (
                      <TableRow key={prescription._id}>
                        <TableCell>
                          {prescription.patientId ? (
                            <div>
                              <div className="font-medium">{prescription.patientId.firstName} {prescription.patientId.lastName}</div>
                              <div className="text-xs text-gray-500">{prescription.patientId.email}</div>
                            </div>
                          ) : 'Unknown'}
                        </TableCell>
                        <TableCell>{prescription.title}</TableCell>
                        <TableCell>{prescription.metadata?.medications || ''}</TableCell>
                        <TableCell>{prescription.date ? new Date(prescription.date).toLocaleDateString() : ''}</TableCell>
                        <TableCell>
                          <Badge className="bg-health-success text-white">Active</Badge>
                        </TableCell>
                        <TableCell>
                          {prescription.fileUrl ? (
                            <a href={prescription.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline">View</a>
                          ) : (
                            <span className="text-gray-400">None</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="w-5 h-5" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                View All Prescriptions
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <User className="w-4 h-4 mr-2" />
                Patient Search
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Prescription Templates
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorUploadPrescription;
