import React, { useState, useEffect, useRef } from 'react';
import emergencyContactsService, { EmergencyContactDTO } from '@/services/emergencyContactsService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Phone, User, MessageSquare, Star, Filter, Search,
  Navigation, Info, Heart, Shield, Users, Calendar,
  CheckCircle, XCircle, AlertTriangle, Plus, Edit, Trash2,
  Mail, MapPin, Clock, Bell, Settings, UserPlus, Download, Upload
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface EmergencyContact {
  id: number;
  name: string;
  number: string;
  email?: string;
  type: 'emergency' | 'doctor' | 'family' | 'hospital' | 'pharmacy' | 'insurance';
  relationship?: string;
  notes?: string;
  isFavorite: boolean;
  isEmergency: boolean;
  lastContacted?: string;
  address?: string;
  specialty?: string;
  insuranceProvider?: string;
  availability?: string;
  photo?: string;
}

const EmergencyContacts = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<EmergencyContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<EmergencyContact | null>(null);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [activeTab, setActiveTab] = useState('all');
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Add/Edit form state
  const [contactForm, setContactForm] = useState({
    name: '',
    number: '',
    email: '',
    type: 'family' as EmergencyContact['type'],
    relationship: '',
    notes: '',
    isFavorite: false,
    isEmergency: false,
    address: '',
    specialty: '',
    insuranceProvider: '',
    availability: ''
  });

  // Mock data (fallback if API fails)
  const mockContacts: EmergencyContact[] = [
    {
      id: 1,
      name: 'Dr. Sarah Wilson',
      number: '+1-555-0301',
      email: 'dr.sarah.wilson@cityhospital.com',
      type: 'doctor',
      relationship: 'Primary Care Physician',
      notes: 'Available 24/7 for emergencies. Specializes in internal medicine.',
      isFavorite: true,
      isEmergency: true,
      lastContacted: '2024-01-15',
      address: 'City General Hospital, 123 Main St',
      specialty: 'Internal Medicine',
      availability: '24/7'
    },
    {
      id: 2,
      name: 'Emergency Services',
      number: '911',
      type: 'emergency',
      notes: 'General emergency number for life-threatening situations',
      isFavorite: true,
      isEmergency: true
    },
    {
      id: 3,
      name: 'Mom',
      number: '+1-555-0303',
      email: 'mom@email.com',
      type: 'family',
      relationship: 'Mother',
      notes: 'Emergency contact and next of kin',
      isFavorite: true,
      isEmergency: true,
      lastContacted: '2024-01-10'
    },
    {
      id: 4,
      name: 'City General Hospital',
      number: '+1-555-0101',
      email: 'emergency@citygeneral.com',
      type: 'hospital',
      notes: 'Nearest emergency hospital with trauma center',
      isFavorite: false,
      isEmergency: true,
      address: '123 Main Street, City Center',
      availability: '24/7'
    },
    {
      id: 5,
      name: 'Dad',
      number: '+1-555-0305',
      email: 'dad@email.com',
      type: 'family',
      relationship: 'Father',
      notes: 'Secondary emergency contact',
      isFavorite: false,
      isEmergency: true,
      lastContacted: '2024-01-08'
    },
    {
      id: 6,
      name: 'Dr. Michael Chen',
      number: '+1-555-0306',
      email: 'dr.chen@cardiology.com',
      type: 'doctor',
      relationship: 'Cardiologist',
      notes: 'Specialist for heart-related issues',
      isFavorite: false,
      isEmergency: false,
      lastContacted: '2024-01-12',
      address: 'Heart Center, 456 Oak Ave',
      specialty: 'Cardiology',
      availability: 'Mon-Fri 9AM-5PM'
    },
    {
      id: 7,
      name: 'Blue Cross Insurance',
      number: '+1-555-0307',
      email: 'claims@bluecross.com',
      type: 'insurance',
      notes: 'Primary health insurance provider',
      isFavorite: false,
      isEmergency: false,
      insuranceProvider: 'Blue Cross Blue Shield',
      availability: 'Mon-Fri 8AM-6PM'
    },
    {
      id: 8,
      name: 'City Pharmacy',
      number: '+1-555-0308',
      email: 'info@citypharmacy.com',
      type: 'pharmacy',
      notes: '24-hour pharmacy for emergency prescriptions',
      isFavorite: false,
      isEmergency: false,
      address: '789 Pine Road, Community Area',
      availability: '24/7'
    }
  ];

  useEffect(() => {
    // Load from API
    (async () => {
      try {
        const res = await emergencyContactsService.list();
        const apiContacts: EmergencyContact[] = (res.contacts || []).map((c: any, idx: number) => ({
          id: c._id || idx + 1,
          name: c.name || '',
          number: c.number || c.phone || '',
          email: c.email || '',
          type: (c.type as EmergencyContact['type']) || 'family',
          relationship: c.relationship || '',
          notes: c.notes || '',
          isFavorite: !!c.isFavorite,
          isEmergency: !!c.isEmergency,
          lastContacted: c.lastContacted || undefined,
          address: c.address || '',
          specialty: c.specialty || '',
          availability: c.availability || '',
        }));
        setContacts(apiContacts);
        setFilteredContacts(apiContacts);
      } catch (e) {
        // Fallback to local mock if API not available
        setContacts(mockContacts);
        setFilteredContacts(mockContacts);
      }
    })();
  }, []);

  useEffect(() => {
    let filtered = contacts;

    // Apply search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(contact =>
        (contact.name || '').toLowerCase().includes(q) ||
        (contact.number || '').includes(searchQuery) ||
        (contact.notes || '').toLowerCase().includes(q)
      );
    }

    // Apply type filter
    if (selectedType && selectedType !== 'all') {
      filtered = filtered.filter(contact => contact.type === selectedType);
    }

    // Apply tab filter
    switch (activeTab) {
      case 'emergency':
        filtered = filtered.filter(contact => contact.isEmergency);
        break;
      case 'favorites':
        filtered = filtered.filter(contact => contact.isFavorite);
        break;
      case 'doctors':
        filtered = filtered.filter(contact => contact.type === 'doctor');
        break;
      case 'family':
        filtered = filtered.filter(contact => contact.type === 'family');
        break;
      default:
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          return (a.type || '').localeCompare(b.type || '');
        case 'lastContacted':
          return new Date(b.lastContacted || 0).getTime() - new Date(a.lastContacted || 0).getTime();
        default:
          return 0;
      }
    });

    setFilteredContacts(filtered);
  }, [contacts, searchQuery, selectedType, activeTab, sortBy]);

  const handleContactCall = (number: string) => {
    window.open(`tel:${number}`, '_self');
  };

  const handleContactMessage = (number: string) => {
    window.open(`sms:${number}`, '_self');
  };

  const handleContactEmail = (email: string) => {
    window.open(`mailto:${email}`, '_self');
  };

  const handleAddContact = () => {
    setEditingContact(null);
    setContactForm({
      name: '',
      number: '',
      email: '',
      type: 'family',
      relationship: '',
      notes: '',
      isFavorite: false,
      isEmergency: false,
      address: '',
      specialty: '',
      insuranceProvider: '',
      availability: ''
    });
    setShowAddDialog(true);
  };

  const handleEditContact = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setContactForm({
      name: contact.name,
      number: contact.number,
      email: contact.email || '',
      type: contact.type,
      relationship: contact.relationship || '',
      notes: contact.notes || '',
      isFavorite: contact.isFavorite,
      isEmergency: contact.isEmergency,
      address: contact.address || '',
      specialty: contact.specialty || '',
      insuranceProvider: contact.insuranceProvider || '',
      availability: contact.availability || ''
    });
    setShowAddDialog(true);
  };

  const handleSaveContact = () => {
    const persist = async () => {
      if (editingContact) {
        // Optimistic update
        setContacts(prev => prev.map(contact => 
          contact.id === editingContact.id 
            ? { ...contact, ...contactForm }
            : contact
        ));
        try {
          await emergencyContactsService.update(String(editingContact.id), contactForm as any);
        } catch {}
      } else {
        const newContact: EmergencyContact = { id: Date.now(), ...contactForm };
        setContacts(prev => [newContact, ...prev]);
        try {
          await emergencyContactsService.create(contactForm as any);
        } catch {}
      }
      setShowAddDialog(false);
    };
    persist();
  };

  const handleDeleteContact = (contactId: number) => {
    setContacts(prev => prev.filter(contact => contact.id !== contactId));
    emergencyContactsService.remove(String(contactId)).catch(() => {});
  };

  const handleToggleFavorite = (contactId: number) => {
    setContacts(prev => prev.map(contact => 
      contact.id === contactId 
        ? { ...contact, isFavorite: !contact.isFavorite }
        : contact
    ));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSortBy('name');
    setActiveTab('all');
    setFilteredContacts(contacts);
  };

  const handleExportCSV = () => {
    const headers = ['Name','Phone','Email','Type','Relationship','Notes','Favorite','Emergency','Last Contacted','Address','Specialty','Insurance Provider','Availability'];
    const rows = contacts.map(c => [
      c.name,
      c.number,
      c.email || '',
      c.type,
      c.relationship || '',
      (c.notes || '').replace(/\n|\r/g, ' '),
      c.isFavorite ? 'Yes' : 'No',
      c.isEmergency ? 'Yes' : 'No',
      c.lastContacted || '',
      c.address || '',
      c.specialty || '',
      c.insuranceProvider || '',
      c.availability || ''
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'emergency-contacts.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportJSON: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      const text = await file.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data)) throw new Error('Invalid JSON format');
      const normalized: EmergencyContact[] = data.map((item: any, idx: number) => ({
        id: item.id ?? Date.now() + idx,
        name: String(item.name || ''),
        number: String(item.number || ''),
        email: item.email ? String(item.email) : undefined,
        type: ['emergency','doctor','family','hospital','pharmacy','insurance'].includes(item.type) ? item.type : 'family',
        relationship: item.relationship || undefined,
        notes: item.notes || undefined,
        isFavorite: Boolean(item.isFavorite),
        isEmergency: Boolean(item.isEmergency),
        lastContacted: item.lastContacted || undefined,
        address: item.address || undefined,
        specialty: item.specialty || undefined,
        insuranceProvider: item.insuranceProvider || undefined,
        availability: item.availability || undefined,
      }));
      setContacts(normalized);
      setFilteredContacts(normalized);
    } catch (err) {
      console.error('Import failed:', err);
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const totalCount = contacts.length;
  const emergencyCount = contacts.filter(c => c.isEmergency).length;
  const favoritesCount = contacts.filter(c => c.isFavorite).length;

  const getContactTypeColor = (type: string) => {
    switch (type) {
      case 'emergency': return 'bg-health-danger';
      case 'doctor': return 'bg-health-teal';
      case 'family': return 'bg-health-success';
      case 'hospital': return 'bg-health-warning';
      case 'pharmacy': return 'bg-health-aqua';
      case 'insurance': return 'bg-health-blue-gray';
      default: return 'bg-health-blue-gray';
    }
  };

  const getContactTypeIcon = (type: string) => {
    switch (type) {
      case 'emergency': return AlertTriangle;
      case 'doctor': return User;
      case 'family': return Heart;
      case 'hospital': return Shield;
      case 'pharmacy': return CheckCircle;
      case 'insurance': return Users;
      default: return User;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-health-teal to-health-aqua text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Phone className="w-6 h-6" />
                Emergency Contacts
              </CardTitle>
              <p className="text-health-light-gray">
                Manage your emergency contacts and quick access to important medical services.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <div className="bg-white/10 rounded-md px-3 py-2 text-sm">
                Total: <span className="font-semibold">{totalCount}</span>
              </div>
              <div className="bg-white/10 rounded-md px-3 py-2 text-sm">
                Emergency: <span className="font-semibold">{emergencyCount}</span>
              </div>
              <div className="bg-white/10 rounded-md px-3 py-2 text-sm">
                Favorites: <span className="font-semibold">{favoritesCount}</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <button className="w-full text-left" onClick={() => handleContactCall('911')} aria-label="Call Emergency">
            <CardContent className="p-6 text-center flex flex-col items-center justify-center h-full">
              <AlertTriangle className="w-8 h-8 mb-3 text-health-danger" />
              <h3 className="font-semibold text-health-charcoal">Emergency 911</h3>
              <p className="text-sm text-health-charcoal/70 mt-1">Life-threatening emergencies</p>
            </CardContent>
          </button>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <button className="w-full text-left" onClick={() => setActiveTab('doctors')} aria-label="Primary Doctor">
            <CardContent className="p-6 text-center flex flex-col items-center justify-center h-full">
              <User className="w-8 h-8 mb-3 text-health-teal" />
              <h3 className="font-semibold text-health-charcoal">Primary Doctor</h3>
              <p className="text-sm text-health-charcoal/70 mt-1">Your main physician</p>
            </CardContent>
          </button>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <button className="w-full text-left" onClick={() => setActiveTab('family')} aria-label="Family Contact">
            <CardContent className="p-6 text-center flex flex-col items-center justify-center h-full">
              <Heart className="w-8 h-8 mb-3 text-health-success" />
              <h3 className="font-semibold text-health-charcoal">Family Contact</h3>
              <p className="text-sm text-health-charcoal/70 mt-1">Emergency family contact</p>
            </CardContent>
          </button>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <button className="w-full text-left" onClick={() => setSelectedType('hospital')} aria-label="Nearest Hospital">
            <CardContent className="p-6 text-center flex flex-col items-center justify-center h-full">
              <Shield className="w-8 h-8 mb-3 text-health-warning" />
              <h3 className="font-semibold text-health-charcoal">Nearest Hospital</h3>
              <p className="text-sm text-health-charcoal/70 mt-1">Emergency hospital</p>
            </CardContent>
          </button>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Contact Management
            </span>
            <div className="flex items-center gap-2">
              <input ref={fileInputRef} type="file" accept="application/json,.json" className="hidden" onChange={handleImportJSON} />
              <Button variant="outline" onClick={clearFilters} aria-label="Clear filters">
                <XCircle className="w-4 h-4 mr-2" />
                Clear
              </Button>
              <Button variant="outline" onClick={handleImportClick} aria-label="Import contacts">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Button variant="outline" onClick={handleExportCSV} aria-label="Export contacts">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button onClick={handleAddContact} aria-label="Add contact">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All Contacts</TabsTrigger>
              <TabsTrigger value="emergency">Emergency</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="doctors">Doctors</TabsTrigger>
              <TabsTrigger value="family">Family</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search contacts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Contact Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="hospital">Hospital</SelectItem>
                    <SelectItem value="pharmacy">Pharmacy</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="type">Type</SelectItem>
                    <SelectItem value="lastContacted">Last Contacted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Contacts List */}
              <div className="space-y-4">
                {filteredContacts.length === 0 && (
                  <div className="text-center py-12 text-health-charcoal/70 border rounded-md">
                    No contacts found. Try adjusting filters or add a new contact.
                  </div>
                )}
                {filteredContacts.map((contact) => {
                  const TypeIcon = getContactTypeIcon(contact.type);
                  
                  return (
                    <Card key={contact.id} className="rounded-lg border border-health-blue-gray/10 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getContactTypeColor(contact.type)} shadow-sm ring-2 ring-white/70`}>
                              <TypeIcon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-lg font-semibold text-health-charcoal">{contact.name}</h3>
                                <Badge className={getContactTypeColor(contact.type)}>
                                  {contact.type.toUpperCase()}
                                </Badge>
                                {contact.isFavorite && (
                                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                )}
                                {contact.isEmergency && (
                                  <Badge className="bg-health-danger text-white text-xs">
                                    EMERGENCY
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-2">
                                <div>
                                  <span className="text-xs font-medium uppercase text-health-charcoal/60">Phone</span>
                                  <p className="text-sm mt-0.5">{contact.number}</p>
                                </div>
                                {contact.email && (
                                  <div>
                                    <span className="text-xs font-medium uppercase text-health-charcoal/60">Email</span>
                                    <p className="text-sm mt-0.5">{contact.email}</p>
                                  </div>
                                )}
                                {contact.relationship && (
                                  <div>
                                    <span className="text-xs font-medium uppercase text-health-charcoal/60">Relationship</span>
                                    <p className="text-sm mt-0.5">{contact.relationship}</p>
                                  </div>
                                )}
                                {contact.availability && (
                                  <div>
                                    <span className="text-xs font-medium uppercase text-health-charcoal/60">Availability</span>
                                    <p className="text-sm mt-0.5">{contact.availability}</p>
                                  </div>
                                )}
                              </div>

                              {contact.address && (
                                <div className="mb-1">
                                  <span className="text-xs font-medium uppercase text-health-charcoal/60">Address</span>
                                  <p className="text-sm text-gray-600 mt-0.5">{contact.address}</p>
                                </div>
                              )}

                              {contact.notes && (
                                <div className="mb-1">
                                  <span className="text-xs font-medium uppercase text-health-charcoal/60">Notes</span>
                                  <p className="text-sm text-gray-600 mt-0.5">{contact.notes}</p>
                                </div>
                              )}

                              {contact.lastContacted && (
                                <div className="text-xs text-health-charcoal/60">
                                  Last contacted: {new Date(contact.lastContacted).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 ml-0 md:ml-4 justify-end self-start md:self-center shrink-0">
                            <Button size="icon" onClick={() => handleContactCall(contact.number)} aria-label={`Call ${contact.name}`} title="Call" className="bg-health-teal text-white hover:opacity-90 rounded-full w-9 h-9"> 
                              <Phone className="w-4 h-4" />
                            </Button>
                            {contact.email && (
                              <Button size="icon" variant="ghost" onClick={() => handleContactEmail(contact.email!)} aria-label={`Email ${contact.name}`} title="Email" className="rounded-full w-9 h-9">
                                <Mail className="w-4 h-4" />
                              </Button>
                            )}
                            <Button size="icon" variant="ghost" onClick={() => handleContactMessage(contact.number)} aria-label={`Message ${contact.name}`} title="Message" className="rounded-full w-9 h-9"> 
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => handleToggleFavorite(contact.id)}
                              aria-label={contact.isFavorite ? 'Unfavorite' : 'Favorite'}
                              title={contact.isFavorite ? 'Unfavorite' : 'Favorite'}
                              className="rounded-full w-9 h-9"
                            >
                              <Star className={`w-4 h-4 ${contact.isFavorite ? 'text-yellow-500 fill-current' : ''}`} />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => handleEditContact(contact)}
                              aria-label="Edit contact"
                              title="Edit"
                              className="rounded-full w-9 h-9"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => handleDeleteContact(contact.id)}
                              aria-label="Delete contact"
                              title="Delete"
                              className="rounded-full w-9 h-9 text-health-danger hover:bg-health-danger/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Contact Details Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              {selectedContact?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Contact Information</h4>
                  <p><strong>Phone:</strong> {selectedContact.number}</p>
                  {selectedContact.email && (
                    <p><strong>Email:</strong> {selectedContact.email}</p>
                  )}
                  {selectedContact.address && (
                    <p><strong>Address:</strong> {selectedContact.address}</p>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Details</h4>
                  <p><strong>Type:</strong> {selectedContact.type}</p>
                  {selectedContact.relationship && (
                    <p><strong>Relationship:</strong> {selectedContact.relationship}</p>
                  )}
                  {selectedContact.specialty && (
                    <p><strong>Specialty:</strong> {selectedContact.specialty}</p>
                  )}
                  {selectedContact.availability && (
                    <p><strong>Availability:</strong> {selectedContact.availability}</p>
                  )}
                </div>
              </div>
              {selectedContact.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <p className="text-gray-600">{selectedContact.notes}</p>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <Button onClick={() => handleContactCall(selectedContact.number)}>
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
                {selectedContact.email && (
                  <Button variant="outline" onClick={() => handleContactEmail(selectedContact.email!)}>
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                )}
                <Button variant="outline" onClick={() => handleContactMessage(selectedContact.number)}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Contact Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingContact ? 'Edit Contact' : 'Add New Contact'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter contact name"
                />
              </div>
              <div>
                <Label htmlFor="number">Phone Number</Label>
                <Input
                  id="number"
                  value={contactForm.number}
                  onChange={(e) => setContactForm(prev => ({ ...prev, number: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="type">Contact Type</Label>
                <Select value={contactForm.type} onValueChange={(value) => setContactForm(prev => ({ ...prev, type: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="hospital">Hospital</SelectItem>
                    <SelectItem value="pharmacy">Pharmacy</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="relationship">Relationship (Optional)</Label>
                <Input
                  id="relationship"
                  value={contactForm.relationship}
                  onChange={(e) => setContactForm(prev => ({ ...prev, relationship: e.target.value }))}
                  placeholder="e.g., Primary Doctor, Mother"
                />
              </div>
              <div>
                <Label htmlFor="specialty">Specialty (Optional)</Label>
                <Input
                  id="specialty"
                  value={contactForm.specialty}
                  onChange={(e) => setContactForm(prev => ({ ...prev, specialty: e.target.value }))}
                  placeholder="e.g., Cardiology, Pediatrics"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address (Optional)</Label>
              <Input
                id="address"
                value={contactForm.address}
                onChange={(e) => setContactForm(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter address"
              />
            </div>

            <div>
              <Label htmlFor="availability">Availability (Optional)</Label>
              <Input
                id="availability"
                value={contactForm.availability}
                onChange={(e) => setContactForm(prev => ({ ...prev, availability: e.target.value }))}
                placeholder="e.g., 24/7, Mon-Fri 9AM-5PM"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={contactForm.notes}
                onChange={(e) => setContactForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about this contact"
              />
            </div>

            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isFavorite"
                  checked={contactForm.isFavorite}
                  onChange={(e) => setContactForm(prev => ({ ...prev, isFavorite: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="isFavorite">Mark as Favorite</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isEmergency"
                  checked={contactForm.isEmergency}
                  onChange={(e) => setContactForm(prev => ({ ...prev, isEmergency: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="isEmergency">Emergency Contact</Label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSaveContact} className="flex-1">
                {editingContact ? 'Update Contact' : 'Add Contact'}
              </Button>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmergencyContacts; 