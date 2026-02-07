import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, UserPlus, Search, Filter, Eye, Edit, Trash2, 
  Phone, Mail, MapPin, Calendar, Heart, AlertTriangle,
  CheckCircle, Clock, RefreshCw, Plus, Download, Upload,
  Shield, FileText, Activity, TrendingUp, UserCheck
} from 'lucide-react';
import { toast } from 'sonner';

interface BloodDonor {
  id: string;
  donorId: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    bloodType: string;
    weight: number;
    height: number;
  };
  contact: {
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  medicalInfo: {
    medicalHistory: string[];
    currentMedications: string[];
    allergies: string[];
    recentProcedures: string[];
    travelHistory: string[];
  };
  eligibility: {
    isEligible: boolean;
    lastDonationDate: string;
    nextEligibleDate: string;
    deferralReason?: string;
    deferralEndDate?: string;
  };
  donationHistory: {
    totalDonations: number;
    lastDonationDate: string;
    totalVolumeDonated: number;
    lastDonationVolume: number;
  };
  preferences: {
    preferredDonationType: 'whole' | 'plasma' | 'platelets' | 'double-red';
    preferredLocation: string;
    preferredTime: string;
    communicationPreference: 'email' | 'sms' | 'phone';
  };
  bloodBank: {
    assignedBank: string;
    donorCategory: 'regular' | 'rare' | 'emergency' | 'first-time';
    loyaltyPoints: number;
    specialNotes: string;
  };
  compliance: {
    isVerified: boolean;
    documentsSubmitted: string[];
    consentGiven: boolean;
    consentDate: string;
    lastScreeningDate: string;
  };
  statistics: {
    responseRate: number;
    averageResponseTime: number;
    reliabilityScore: number;
  };
  status: 'active' | 'inactive' | 'deferred' | 'blacklisted';
  createdAt: string;
  updatedAt: string;
}

const BloodDonors: React.FC = () => {
  const [donors, setDonors] = useState<BloodDonor[]>([]);
  const [filteredDonors, setFilteredDonors] = useState<BloodDonor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [eligibilityFilter, setEligibilityFilter] = useState('all');
  const [selectedDonor, setSelectedDonor] = useState<BloodDonor | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockDonors: BloodDonor[] = [
      {
        id: '1',
        donorId: 'DON001',
        personalInfo: {
          firstName: 'Rahul',
          lastName: 'Sharma',
          dateOfBirth: '1990-05-15',
          age: 33,
          gender: 'male',
          bloodType: 'O+',
          weight: 70,
          height: 175
        },
        contact: {
          phone: '+91 98765 43210',
          email: 'rahul.sharma@email.com',
          address: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001'
        },
        medicalInfo: {
          medicalHistory: ['None'],
          currentMedications: ['None'],
          allergies: ['None'],
          recentProcedures: ['None'],
          travelHistory: ['None']
        },
        eligibility: {
          isEligible: true,
          lastDonationDate: '2024-01-15',
          nextEligibleDate: '2024-04-15'
        },
        donationHistory: {
          totalDonations: 8,
          lastDonationDate: '2024-01-15',
          totalVolumeDonated: 3200,
          lastDonationVolume: 400
        },
        preferences: {
          preferredDonationType: 'whole',
          preferredLocation: 'Mumbai Central',
          preferredTime: 'Morning',
          communicationPreference: 'sms'
        },
        bloodBank: {
          assignedBank: 'Mumbai Blood Bank',
          donorCategory: 'regular',
          loyaltyPoints: 240,
          specialNotes: 'Reliable donor, always on time'
        },
        compliance: {
          isVerified: true,
          documentsSubmitted: ['ID Proof', 'Medical Certificate'],
          consentGiven: true,
          consentDate: '2023-01-10',
          lastScreeningDate: '2024-01-15'
        },
        statistics: {
          responseRate: 95,
          averageResponseTime: 2.5,
          reliabilityScore: 92
        },
        status: 'active',
        createdAt: '2023-01-10T10:00:00Z',
        updatedAt: '2024-01-15T14:30:00Z'
      },
      {
        id: '2',
        donorId: 'DON002',
        personalInfo: {
          firstName: 'Priya',
          lastName: 'Patel',
          dateOfBirth: '1988-12-03',
          age: 35,
          gender: 'female',
          bloodType: 'B-',
          weight: 55,
          height: 160
        },
        contact: {
          phone: '+91 98765 43211',
          email: 'priya.patel@email.com',
          address: '456 Park Avenue',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001'
        },
        medicalInfo: {
          medicalHistory: ['None'],
          currentMedications: ['Iron Supplements'],
          allergies: ['None'],
          recentProcedures: ['None'],
          travelHistory: ['None']
        },
        eligibility: {
          isEligible: true,
          lastDonationDate: '2024-02-20',
          nextEligibleDate: '2024-05-20'
        },
        donationHistory: {
          totalDonations: 12,
          lastDonationDate: '2024-02-20',
          totalVolumeDonated: 4800,
          lastDonationVolume: 400
        },
        preferences: {
          preferredDonationType: 'plasma',
          preferredLocation: 'Delhi Central',
          preferredTime: 'Afternoon',
          communicationPreference: 'email'
        },
        bloodBank: {
          assignedBank: 'Delhi Blood Bank',
          donorCategory: 'rare',
          loyaltyPoints: 360,
          specialNotes: 'Rare blood type, high priority'
        },
        compliance: {
          isVerified: true,
          documentsSubmitted: ['ID Proof', 'Medical Certificate', 'Address Proof'],
          consentGiven: true,
          consentDate: '2022-06-15',
          lastScreeningDate: '2024-02-20'
        },
        statistics: {
          responseRate: 98,
          averageResponseTime: 1.8,
          reliabilityScore: 96
        },
        status: 'active',
        createdAt: '2022-06-15T09:00:00Z',
        updatedAt: '2024-02-20T16:45:00Z'
      }
    ];
    
    setDonors(mockDonors);
    setFilteredDonors(mockDonors);
  }, []);

  // Filter donors based on search and filters
  useEffect(() => {
    let filtered = donors;

    if (searchTerm) {
      filtered = filtered.filter(donor =>
        donor.personalInfo.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donor.personalInfo.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donor.donorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donor.contact.phone.includes(searchTerm) ||
        donor.contact.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (bloodTypeFilter !== 'all') {
      filtered = filtered.filter(donor => donor.personalInfo.bloodType === bloodTypeFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(donor => donor.status === statusFilter);
    }

    if (eligibilityFilter !== 'all') {
      if (eligibilityFilter === 'eligible') {
        filtered = filtered.filter(donor => donor.eligibility.isEligible);
      } else if (eligibilityFilter === 'ineligible') {
        filtered = filtered.filter(donor => !donor.eligibility.isEligible);
      }
    }

    setFilteredDonors(filtered);
  }, [donors, searchTerm, bloodTypeFilter, statusFilter, eligibilityFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'deferred': return 'bg-yellow-100 text-yellow-800';
      case 'blacklisted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEligibilityColor = (isEligible: boolean) => {
    return isEligible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getBloodTypeColor = (bloodType: string) => {
    const colors: { [key: string]: string } = {
      'O+': 'bg-red-100 text-red-800',
      'O-': 'bg-red-100 text-red-800',
      'A+': 'bg-blue-100 text-blue-800',
      'A-': 'bg-blue-100 text-blue-800',
      'B+': 'bg-purple-100 text-purple-800',
      'B-': 'bg-purple-100 text-purple-800',
      'AB+': 'bg-green-100 text-green-800',
      'AB-': 'bg-green-100 text-green-800'
    };
    return colors[bloodType] || 'bg-gray-100 text-gray-800';
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Donor data refreshed successfully');
    }, 1000);
  };

  const handleViewDonor = (donor: BloodDonor) => {
    setSelectedDonor(donor);
    setIsViewDialogOpen(true);
  };

  const handleDeleteDonor = (donorId: string) => {
    if (confirm('Are you sure you want to delete this donor?')) {
      setDonors(donors.filter(d => d.id !== donorId));
      toast.success('Donor deleted successfully');
    }
  };

  const donorStats = {
    total: donors.length,
    active: donors.filter(d => d.status === 'active').length,
    eligible: donors.filter(d => d.eligibility.isEligible).length,
    rareTypes: donors.filter(d => d.bloodBank.donorCategory === 'rare').length
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-health-charcoal">Donor Management</h1>
          <p className="text-health-blue-gray mt-2">Manage blood donors, track eligibility, and coordinate donations</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Donor
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-health-blue-gray">Total Donors</p>
                <p className="text-2xl font-bold text-health-charcoal">{donorStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-health-blue-gray">Active Donors</p>
                <p className="text-2xl font-bold text-health-charcoal">{donorStats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Heart className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-health-blue-gray">Eligible Now</p>
                <p className="text-2xl font-bold text-health-charcoal">{donorStats.eligible}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-health-blue-gray">Rare Blood Types</p>
                <p className="text-2xl font-bold text-health-charcoal">{donorStats.rareTypes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-white border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="text-sm font-medium text-health-charcoal mb-2 block">
                Search Donors
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-health-blue-gray" />
                <Input
                  id="search"
                  placeholder="Search by name, ID, phone, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="w-full lg:w-48">
              <Label htmlFor="bloodType" className="text-sm font-medium text-health-charcoal mb-2 block">
                Blood Type
              </Label>
              <Select value={bloodTypeFilter} onValueChange={setBloodTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full lg:w-48">
              <Label htmlFor="status" className="text-sm font-medium text-health-charcoal mb-2 block">
                Status
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="deferred">Deferred</SelectItem>
                  <SelectItem value="blacklisted">Blacklisted</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full lg:w-48">
              <Label htmlFor="eligibility" className="text-sm font-medium text-health-charcoal mb-2 block">
                Eligibility
              </Label>
              <Select value={eligibilityFilter} onValueChange={setEligibilityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Eligibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Eligibility</SelectItem>
                  <SelectItem value="eligible">Eligible</SelectItem>
                  <SelectItem value="ineligible">Ineligible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Donors Table */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Donors ({filteredDonors.length})</span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Donor ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Blood Type</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Eligibility</TableHead>
                  <TableHead>Last Donation</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDonors.map((donor) => (
                  <TableRow key={donor.id}>
                    <TableCell className="font-medium">{donor.donorId}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-health-charcoal">
                          {donor.personalInfo.firstName} {donor.personalInfo.lastName}
                        </div>
                        <div className="text-sm text-health-blue-gray">
                          Age: {donor.personalInfo.age} • {donor.personalInfo.gender}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getBloodTypeColor(donor.personalInfo.bloodType)}>
                        {donor.personalInfo.bloodType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Phone className="w-3 h-3 mr-1 text-health-blue-gray" />
                          {donor.contact.phone}
                        </div>
                        <div className="flex items-center text-sm">
                          <Mail className="w-3 h-3 mr-1 text-health-blue-gray" />
                          {donor.contact.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(donor.status)}>
                        {donor.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getEligibilityColor(donor.eligibility.isEligible)}>
                        {donor.eligibility.isEligible ? 'Eligible' : 'Not Eligible'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="text-health-charcoal">
                          {new Date(donor.donationHistory.lastDonationDate).toLocaleDateString()}
                        </div>
                        <div className="text-health-blue-gray">
                          {donor.donationHistory.totalDonations} donations
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDonor(donor)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteDonor(donor.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredDonors.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-health-blue-gray mx-auto mb-4" />
              <p className="text-health-blue-gray">No donors found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Donor Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Donor Details - {selectedDonor?.donorId}</DialogTitle>
          </DialogHeader>
          
          {selectedDonor && (
            <div className="space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserCheck className="w-5 h-5 mr-2" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-health-blue-gray">Full Name</Label>
                    <p className="text-health-charcoal">
                      {selectedDonor.personalInfo.firstName} {selectedDonor.personalInfo.lastName}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-health-blue-gray">Date of Birth</Label>
                    <p className="text-health-charcoal">
                      {new Date(selectedDonor.personalInfo.dateOfBirth).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-health-blue-gray">Age</Label>
                    <p className="text-health-charcoal">{selectedDonor.personalInfo.age} years</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-health-blue-gray">Gender</Label>
                    <p className="text-health-charcoal">{selectedDonor.personalInfo.gender}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-health-blue-gray">Blood Type</Label>
                    <Badge className={getBloodTypeColor(selectedDonor.personalInfo.bloodType)}>
                      {selectedDonor.personalInfo.bloodType}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-health-blue-gray">Weight & Height</Label>
                    <p className="text-health-charcoal">
                      {selectedDonor.personalInfo.weight} kg / {selectedDonor.personalInfo.height} cm
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="w-5 h-5 mr-2" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-health-blue-gray">Phone</Label>
                    <p className="text-health-charcoal">{selectedDonor.contact.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-health-blue-gray">Email</Label>
                    <p className="text-health-charcoal">{selectedDonor.contact.email}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-health-blue-gray">Address</Label>
                    <p className="text-health-charcoal">
                      {selectedDonor.contact.address}, {selectedDonor.contact.city}, {selectedDonor.contact.state} - {selectedDonor.contact.pincode}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Donation History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Donation History
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-health-blue-gray">Total Donations</Label>
                    <p className="text-2xl font-bold text-health-charcoal">
                      {selectedDonor.donationHistory.totalDonations}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-health-blue-gray">Total Volume</Label>
                    <p className="text-2xl font-bold text-health-charcoal">
                      {selectedDonor.donationHistory.totalVolumeDonated} ml
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-health-blue-gray">Last Donation</Label>
                    <p className="text-health-charcoal">
                      {new Date(selectedDonor.donationHistory.lastDonationDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-health-blue-gray">Last Volume</Label>
                    <p className="text-health-charcoal">
                      {selectedDonor.donationHistory.lastDonationVolume} ml
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Eligibility & Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Eligibility & Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-health-blue-gray">Current Status</Label>
                    <Badge className={getStatusColor(selectedDonor.status)}>
                      {selectedDonor.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-health-blue-gray">Eligibility</Label>
                    <Badge className={getEligibilityColor(selectedDonor.eligibility.isEligible)}>
                      {selectedDonor.eligibility.isEligible ? 'Eligible' : 'Not Eligible'}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-health-blue-gray">Next Eligible Date</Label>
                    <p className="text-health-charcoal">
                      {new Date(selectedDonor.eligibility.nextEligibleDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-health-blue-gray">Verification Status</Label>
                    <Badge className={selectedDonor.compliance.isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {selectedDonor.compliance.isVerified ? 'Verified' : 'Not Verified'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Donor Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Donor</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                This feature will be implemented to add new donors to the system. 
                It will include comprehensive forms for personal information, medical history, 
                and consent management.
              </AlertDescription>
            </Alert>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button disabled>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Donor
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BloodDonors;
