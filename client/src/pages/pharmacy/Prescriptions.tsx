import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Pill, CheckCircle, Plus, Trash2, Upload, Search, Calendar,
  RefreshCw, Eye, Edit, User, Phone, FileText
} from 'lucide-react';
import pharmacyService from '@/services/pharmacyService';

const Prescriptions: React.FC = () => {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters and UI state
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Create dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [number, setNumber] = useState('');
  const [patient, setPatient] = useState('');
  const [doctor, setDoctor] = useState('');
  const [notes, setNotes] = useState('');
  const [professional, setProfessional] = useState(false);
  // Patient details (professional)
  const [patientDob, setPatientDob] = useState('');
  const [patientSex, setPatientSex] = useState('');
  const [patientWeight, setPatientWeight] = useState<string>('');
  const [patientHeight, setPatientHeight] = useState<string>('');
  const [allergies, setAllergies] = useState('');
  const [currentMeds, setCurrentMeds] = useState('');
  const [conditions, setConditions] = useState('');
  const [pregnancy, setPregnancy] = useState(false);
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  // Prescriber details (professional)
  const [prescriberReg, setPrescriberReg] = useState('');
  const [clinic, setClinic] = useState('');
  const [prescriberContact, setPrescriberContact] = useState('');
  // Rx metadata (professional)
  const [priority, setPriority] = useState('routine');
  const [refillCount, setRefillCount] = useState<string>('0');
  const [refillInterval, setRefillInterval] = useState('30d');
  const [substitutionAllowed, setSubstitutionAllowed] = useState(true);
  // Fulfillment & billing (professional)
  const [fulfillmentMethod, setFulfillmentMethod] = useState<'pickup'|'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliverySlot, setDeliverySlot] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [items, setItems] = useState<Array<{ name: string; dosage?: string; quantity: number }>>([
    { name: '', dosage: '', quantity: 1 },
  ]);
  const [file, setFile] = useState<File | undefined>(undefined);
  const [extraFiles, setExtraFiles] = useState<File[]>([]);

  // Detail dialog
  const [selectedRx, setSelectedRx] = useState<any | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await pharmacyService.listPrescriptions();
      // Ensure data is always an array to prevent filter errors
      setList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      setList([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await pharmacyService.updatePrescriptionStatus(id, status);
    load();
  };

  const addItem = () => setItems((prev) => [...prev, { name: '', dosage: '', quantity: 1 }]);
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));
  const updateItem = (idx: number, key: 'name'|'dosage'|'quantity', value: string) => {
    setItems((prev) => prev.map((it, i) => i === idx ? { ...it, [key]: key === 'quantity' ? Number(value) : value } : it));
  };

  const create = async () => {
    setCreating(true);
    try {
      const payload = { number, patient, doctor, items };
      await pharmacyService.createPrescription(payload, file);
      setNumber(''); setPatient(''); setDoctor(''); setItems([{ name: '', dosage: '', quantity: 1 }]); setFile(undefined);
      await load();
    } finally {
      setCreating(false);
    }
  };

  // Derived: filtered prescriptions
  const filteredList = list.filter((p) => {
    const matchesTab = activeTab === 'all' ? true : (p.status === activeTab);
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q || `${p.number} ${p.patient} ${p.doctor}`.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' ? true : p.status === statusFilter;
    // dateFilter can be wired to createdAt if present; fallback allow all
    return matchesTab && matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4 bg-health-light-gray min-h-screen px-2 md:px-6 py-4 w-full">
      {/* Header */}
      <div className="bg-health-teal rounded-lg p-6 mb-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-white">Prescription Queue</h1>
            <p className="text-white/80 mt-2">Verify and dispense prescriptions efficiently, with clear tracking</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={load}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              className="bg-white text-health-teal hover:bg-white/90"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Prescription
            </Button>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <Card className="bg-white border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-health-blue-gray w-4 h-4" />
                <Input
                  placeholder="Search by prescription number, patient or doctor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full lg:w-96"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="dispensed">Dispensed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-44">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Tabs and Table */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white border border-health-light-gray">
          <TabsTrigger value="all" className="data-[state=active]:bg-health-aqua data-[state=active]:text-white">All</TabsTrigger>
          <TabsTrigger value="pending" className="data-[state=active]:bg-health-aqua data-[state=active]:text-white">Pending</TabsTrigger>
          <TabsTrigger value="verified" className="data-[state=active]:bg-health-aqua data-[state=active]:text-white">Verified</TabsTrigger>
          <TabsTrigger value="dispensed" className="data-[state=active]:bg-health-aqua data-[state=active]:text-white">Dispensed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-health-light-gray/50">
                    <TableHead className="font-semibold text-health-charcoal">Rx No.</TableHead>
                    <TableHead className="font-semibold text-health-charcoal">Patient</TableHead>
                    <TableHead className="font-semibold text-health-charcoal">Doctor</TableHead>
                    <TableHead className="font-semibold text-health-charcoal">Items</TableHead>
                    <TableHead className="font-semibold text-health-charcoal">Status</TableHead>
                    <TableHead className="font-semibold text-health-charcoal">Document</TableHead>
                    <TableHead className="font-semibold text-health-charcoal">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredList.map((p) => (
                    <TableRow
                      key={p._id}
                      className="hover:bg-health-light-gray/30 cursor-pointer"
                      onClick={() => { setSelectedRx(p); setShowDetailDialog(true); }}
                    >
                      <TableCell className="font-medium text-health-charcoal">
                        <div className="flex items-center gap-2">
                          <Pill className="w-4 h-4 text-health-aqua" />
                          {p.number}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-health-blue-gray" />
                          <span className="font-medium text-health-charcoal">{p.patient}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-health-blue-gray" />
                          <span className="text-health-blue-gray">{p.doctor}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-health-blue-gray">{p.items?.length} items</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${
                          p.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          p.status === 'verified' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {p.documentCloudinaryUrl ? (
                          <a
                            href={p.documentCloudinaryUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-health-aqua underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-xs text-health-blue-gray">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-8 px-2"
                            onClick={(e) => { e.stopPropagation(); updateStatus(p._id, 'verified'); }}
                          >
                            Verify
                          </Button>
                          <Button
                            size="sm"
                            className="text-xs h-8 px-2 bg-health-success hover:bg-health-success/90"
                            onClick={(e) => { e.stopPropagation(); updateStatus(p._id, 'dispensed'); }}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Dispense
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredList.length === 0 && (
                <div className="text-center py-12">
                  <Pill className="w-12 h-12 text-health-blue-gray mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-health-charcoal mb-2">No prescriptions found</h3>
                  <p className="text-health-blue-gray mb-4">Create a new prescription to get started</p>
                  <Button onClick={() => setShowCreateDialog(true)} className="bg-health-aqua hover:bg-health-teal">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Prescription
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Prescription Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl text-health-charcoal">
              <Plus className="w-6 h-6 mr-2 text-health-aqua" />
              Create Prescription
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input placeholder="Prescription Number" value={number} onChange={(e) => setNumber(e.target.value)} />
              <Input placeholder="Patient" value={patient} onChange={(e) => setPatient(e.target.value)} />
              <Input placeholder="Doctor" value={doctor} onChange={(e) => setDoctor(e.target.value)} />
            </div>

            {/* Professional Mode Toggle */}
            <div className="flex items-center gap-2">
              <Checkbox id="professional" checked={professional} onCheckedChange={(v: any) => setProfessional(Boolean(v))} />
              <label htmlFor="professional" className="text-sm text-health-charcoal">Enable Professional Mode (advanced fields)</label>
            </div>

            {professional && (
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="patient">
                  <AccordionTrigger>Patient Details</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <Input type="date" placeholder="DOB" value={patientDob} onChange={(e) => setPatientDob(e.target.value)} />
                      <Select value={patientSex} onValueChange={setPatientSex}>
                        <SelectTrigger><SelectValue placeholder="Sex" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input placeholder="Weight (kg)" value={patientWeight} onChange={(e) => setPatientWeight(e.target.value)} />
                      <Input placeholder="Height (cm)" value={patientHeight} onChange={(e) => setPatientHeight(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                      <Input placeholder="Allergies (comma separated)" value={allergies} onChange={(e) => setAllergies(e.target.value)} />
                      <Input placeholder="Current Medications" value={currentMeds} onChange={(e) => setCurrentMeds(e.target.value)} />
                      <Input placeholder="Conditions/Diagnosis (ICD-10)" value={conditions} onChange={(e) => setConditions(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                      <div className="flex items-center gap-2">
                        <Checkbox id="preg" checked={pregnancy} onCheckedChange={(v: any) => setPregnancy(Boolean(v))} />
                        <label htmlFor="preg" className="text-sm">Pregnancy/Lactation</label>
                      </div>
                      <Input placeholder="Insurance Provider" value={insuranceProvider} onChange={(e) => setInsuranceProvider(e.target.value)} />
                      <Input placeholder="Policy Number" value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="prescriber">
                  <AccordionTrigger>Prescriber Details</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input placeholder="Registration No." value={prescriberReg} onChange={(e) => setPrescriberReg(e.target.value)} />
                      <Input placeholder="Clinic/Hospital" value={clinic} onChange={(e) => setClinic(e.target.value)} />
                      <Input placeholder="Prescriber Contact" value={prescriberContact} onChange={(e) => setPrescriberContact(e.target.value)} />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="metadata">
                  <AccordionTrigger>Prescription Metadata</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <Select value={priority} onValueChange={setPriority}>
                        <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="routine">Routine</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="stat">STAT</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input placeholder="Refills" type="number" value={refillCount} onChange={(e) => setRefillCount(e.target.value)} />
                      <Select value={refillInterval} onValueChange={setRefillInterval}>
                        <SelectTrigger><SelectValue placeholder="Refill Interval" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30d">Every 30 days</SelectItem>
                          <SelectItem value="60d">Every 60 days</SelectItem>
                          <SelectItem value="90d">Every 90 days</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-2">
                        <Checkbox id="subst" checked={substitutionAllowed} onCheckedChange={(v: any) => setSubstitutionAllowed(Boolean(v))} />
                        <label htmlFor="subst" className="text-sm">Generic substitution allowed</label>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="fulfillment">
                  <AccordionTrigger>Fulfillment & Billing</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Select value={fulfillmentMethod} onValueChange={(v: any) => setFulfillmentMethod(v)}>
                        <SelectTrigger><SelectValue placeholder="Fulfillment" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pickup">Pickup</SelectItem>
                          <SelectItem value="delivery">Delivery</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input placeholder="Delivery Address" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} />
                      <Input placeholder="Delivery Slot" value={deliverySlot} onChange={(e) => setDeliverySlot(e.target.value)} />
                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger><SelectValue placeholder="Payment Method" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                          <SelectItem value="upi">UPI</SelectItem>
                          <SelectItem value="insurance">Insurance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}

            {/* Items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-health-charcoal">Items</h3>
                <Button size="sm" variant="outline" onClick={addItem}><Plus className="w-3 h-3 mr-1"/> Add Item</Button>
              </div>
              {items.map((it, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                  <Input placeholder="Name" value={it.name} onChange={(e) => updateItem(idx, 'name', e.target.value)} />
                  <Input placeholder="Dosage" value={it.dosage} onChange={(e) => updateItem(idx, 'dosage', e.target.value)} />
                  <Input placeholder="Qty" type="number" value={it.quantity} onChange={(e) => updateItem(idx, 'quantity', e.target.value)} />
                  <Button variant="destructive" size="icon" onClick={() => removeItem(idx)}><Trash2 className="w-4 h-4"/></Button>
                </div>
              ))}
            </div>

            <Textarea
              placeholder="Notes to pharmacist (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
              <div className="flex items-center gap-3">
                <Input type="file" onChange={(e) => setFile(e.target.files?.[0])} />
                <span className="text-xs text-health-blue-gray">Optional: upload scanned prescription</span>
              </div>
              <div className="flex items-center gap-2">
                <Input type="file" multiple onChange={(e) => setExtraFiles(Array.from(e.target.files || []))} />
                <span className="text-xs text-health-blue-gray">Attach prior auth/ID (optional)</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button className="flex-1 bg-health-aqua hover:bg-health-teal" onClick={create} disabled={creating}>
                {creating ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                Submit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Prescription Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl text-health-charcoal">
              <Pill className="w-6 h-6 mr-2 text-health-aqua" />
              Prescription Details - {selectedRx?.number}
            </DialogTitle>
          </DialogHeader>

          {selectedRx && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-health-light-gray/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-health-blue-gray mb-1">Patient</p>
                  <p className="text-sm text-health-charcoal">{selectedRx.patient}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-health-blue-gray mb-1">Doctor</p>
                  <p className="text-sm text-health-charcoal">{selectedRx.doctor}</p>
                </div>
              <div>
                  <p className="text-sm font-medium text-health-blue-gray mb-1">Status</p>
                  <Badge className={`text-xs ${
                    selectedRx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    selectedRx.status === 'verified' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {selectedRx.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-health-charcoal text-lg">Items</h3>
                {selectedRx.items?.map((it: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 border border-health-light-gray rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-health-charcoal">{it.name}</p>
                      <p className="text-xs text-health-blue-gray">Dosage: {it.dosage || '-'} • Qty: {it.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {selectedRx.documentCloudinaryUrl && (
                <a
                  className="text-sm text-health-aqua underline"
                  href={selectedRx.documentCloudinaryUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  View uploaded document
                </a>
              )}

              <div className="flex gap-3 pt-4 border-t border-health-light-gray">
                <Button variant="outline" className="flex-1" onClick={() => setShowDetailDialog(false)}>Close</Button>
                <Button className="flex-1 bg-health-success hover:bg-health-success/90" onClick={() => updateStatus(selectedRx._id, 'dispensed')}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Dispensed
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Prescriptions;


