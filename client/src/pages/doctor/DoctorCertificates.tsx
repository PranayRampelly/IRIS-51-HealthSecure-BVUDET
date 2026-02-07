import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Award, 
  FileText, 
  Download,
  Share2,
  Eye,
  Edit,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
  Clock,
  BarChart3,
  Activity,
  Shield
} from 'lucide-react';

interface Certificate {
  id: string;
  name: string;
  type: string;
  patientName: string;
  patientId: string;
  issuedDate: string;
  expiryDate?: string;
  status: 'active' | 'expired' | 'revoked';
  category: string;
  description?: string;
  issuedBy: string;
  certificateNumber: string;
  digitalSignature: boolean;
  blockchainVerified: boolean;
}

interface CertificateStats {
  totalCertificates: number;
  activeCertificates: number;
  expiredCertificates: number;
  verifiedCertificates: number;
  categories: Array<{ name: string; count: number }>;
  monthlyIssued: Array<{ month: string; count: number }>;
}

const DoctorCertificates: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const certificates: Certificate[] = [
    {
      id: '1',
      name: 'Medical Fitness Certificate',
      type: 'Fitness',
      patientName: 'Sarah Johnson',
      patientId: 'P001',
      issuedDate: '2024-01-15',
      expiryDate: '2024-07-15',
      status: 'active',
      category: 'Fitness',
      description: 'Medical fitness certificate for employment',
      issuedBy: 'Dr. Smith',
      certificateNumber: 'MFC-2024-001',
      digitalSignature: true,
      blockchainVerified: true
    },
    {
      id: '2',
      name: 'Sick Leave Certificate',
      type: 'Leave',
      patientName: 'Michael Chen',
      patientId: 'P002',
      issuedDate: '2024-01-14',
      expiryDate: '2024-01-21',
      status: 'active',
      category: 'Leave',
      description: 'Sick leave certificate for 7 days',
      issuedBy: 'Dr. Smith',
      certificateNumber: 'SLC-2024-002',
      digitalSignature: true,
      blockchainVerified: true
    },
    {
      id: '3',
      name: 'Medical Certificate for Travel',
      type: 'Travel',
      patientName: 'Emily Davis',
      patientId: 'P003',
      issuedDate: '2024-01-13',
      expiryDate: '2024-04-13',
      status: 'active',
      category: 'Travel',
      description: 'Medical certificate for international travel',
      issuedBy: 'Dr. Smith',
      certificateNumber: 'MCT-2024-003',
      digitalSignature: true,
      blockchainVerified: true
    },
    {
      id: '4',
      name: 'Disability Certificate',
      type: 'Disability',
      patientName: 'Robert Wilson',
      patientId: 'P004',
      issuedDate: '2024-01-12',
      status: 'active',
      category: 'Disability',
      description: 'Permanent disability certificate',
      issuedBy: 'Dr. Smith',
      certificateNumber: 'DC-2024-004',
      digitalSignature: true,
      blockchainVerified: false
    },
    {
      id: '5',
      name: 'Medical Certificate for Sports',
      type: 'Sports',
      patientName: 'Lisa Brown',
      patientId: 'P005',
      issuedDate: '2023-12-15',
      expiryDate: '2024-06-15',
      status: 'expired',
      category: 'Sports',
      description: 'Medical fitness certificate for sports participation',
      issuedBy: 'Dr. Smith',
      certificateNumber: 'MCS-2023-005',
      digitalSignature: true,
      blockchainVerified: true
    },
    {
      id: '6',
      name: 'Mental Health Certificate',
      type: 'Mental Health',
      patientName: 'David Miller',
      patientId: 'P006',
      issuedDate: '2024-01-10',
      status: 'revoked',
      category: 'Mental Health',
      description: 'Mental health assessment certificate',
      issuedBy: 'Dr. Smith',
      certificateNumber: 'MHC-2024-006',
      digitalSignature: true,
      blockchainVerified: true
    }
  ];

  const stats: CertificateStats = {
    totalCertificates: 89,
    activeCertificates: 65,
    expiredCertificates: 18,
    verifiedCertificates: 78,
    categories: [
      { name: 'Fitness', count: 25 },
      { name: 'Leave', count: 20 },
      { name: 'Travel', count: 15 },
      { name: 'Sports', count: 12 },
      { name: 'Disability', count: 8 }
    ],
    monthlyIssued: [
      { month: 'Jan', count: 15 },
      { month: 'Feb', count: 18 },
      { month: 'Mar', count: 12 },
      { month: 'Apr', count: 20 },
      { month: 'May', count: 16 },
      { month: 'Jun', count: 14 }
    ]
  };

  const categories = ['Fitness', 'Leave', 'Travel', 'Sports', 'Disability', 'Mental Health', 'Other'];
  const statuses = ['active', 'expired', 'revoked'];

  const filteredCertificates = certificates.filter(certificate => {
    const matchesSearch = certificate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         certificate.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         certificate.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || certificate.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || certificate.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      revoked: 'bg-gray-100 text-gray-800'
    };
    return <Badge className={variants[status]}>{status}</Badge>;
  };

  const getVerificationBadge = (verified: boolean) => {
    return verified ? (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Verified
      </Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800">
        <AlertCircle className="w-3 h-3 mr-1" />
        Pending
      </Badge>
    );
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Certificates</h1>
          <p className="text-gray-600 mt-1">Manage and track medical certificates</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Issue Certificate
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Award className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Certificates</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCertificates}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeCertificates}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Shield className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-gray-900">{stats.verifiedCertificates}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-gray-900">{stats.expiredCertificates}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search certificates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="certificates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="certificates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Certificates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredCertificates.map((certificate) => (
                  <div key={certificate.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Award className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{certificate.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm text-gray-600">{certificate.patientName}</span>
                            <span className="text-sm text-gray-600">•</span>
                            <span className="text-sm text-gray-600">{certificate.category}</span>
                            <span className="text-sm text-gray-600">•</span>
                            <span className="text-sm text-gray-600">{certificate.certificateNumber}</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            {getStatusBadge(certificate.status)}
                            {getVerificationBadge(certificate.blockchainVerified)}
                            {certificate.expiryDate && isExpired(certificate.expiryDate) && (
                              <Badge className="bg-red-100 text-red-800">Expired</Badge>
                            )}
                            {certificate.expiryDate && isExpiringSoon(certificate.expiryDate) && (
                              <Badge className="bg-yellow-100 text-yellow-800">Expiring Soon</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            Issued: {new Date(certificate.issuedDate).toLocaleDateString()}
                          </p>
                          {certificate.expiryDate && (
                            <p className="text-sm text-gray-600">
                              Expires: {new Date(certificate.expiryDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Certificate Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Certificate Name</p>
                                    <p className="text-gray-900">{certificate.name}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Certificate Number</p>
                                    <p className="text-gray-900">{certificate.certificateNumber}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Patient</p>
                                    <p className="text-gray-900">{certificate.patientName}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Category</p>
                                    <p className="text-gray-900">{certificate.category}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Issued Date</p>
                                    <p className="text-gray-900">
                                      {new Date(certificate.issuedDate).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Issued By</p>
                                    <p className="text-gray-900">{certificate.issuedBy}</p>
                                  </div>
                                  {certificate.expiryDate && (
                                    <div>
                                      <p className="text-sm font-medium text-gray-600">Expiry Date</p>
                                      <p className="text-gray-900">
                                        {new Date(certificate.expiryDate).toLocaleDateString()}
                                      </p>
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Status</p>
                                    <p className="text-gray-900">{certificate.status}</p>
                                  </div>
                                </div>
                                
                                {certificate.description && (
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Description</p>
                                    <p className="text-gray-900">{certificate.description}</p>
                                  </div>
                                )}
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Digital Signature</p>
                                    <p className="text-gray-900">
                                      {certificate.digitalSignature ? 'Yes' : 'No'}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Blockchain Verified</p>
                                    <p className="text-gray-900">
                                      {certificate.blockchainVerified ? 'Yes' : 'No'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Issued Certificates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.monthlyIssued.map((month) => (
                    <div key={month.month} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">{month.month}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-health-aqua h-2 rounded-full" 
                            style={{ width: `${(month.count / Math.max(...stats.monthlyIssued.map(m => m.count))) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{month.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Certificate Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Active</span>
                    <span className="text-sm font-medium text-gray-900">{stats.activeCertificates}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Expired</span>
                    <span className="text-sm font-medium text-gray-900">{stats.expiredCertificates}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Revoked</span>
                    <span className="text-sm font-medium text-gray-900">
                      {stats.totalCertificates - stats.activeCertificates - stats.expiredCertificates}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Certificate Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.categories.map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                      <span className="text-sm font-medium text-gray-900">{category.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-health-aqua h-2 rounded-full" 
                          style={{ width: `${(category.count / Math.max(...stats.categories.map(c => c.count))) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{category.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Issue Certificate Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Issue New Certificate</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Certificate Type</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select certificate type" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Patient</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="P001">Sarah Johnson</SelectItem>
                  <SelectItem value="P002">Michael Chen</SelectItem>
                  <SelectItem value="P003">Emily Davis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Issue Date</label>
                <Input type="date" />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Expiry Date (Optional)</label>
                <Input type="date" />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Description</label>
              <Input placeholder="Enter certificate description" />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="digitalSignature" />
                <label htmlFor="digitalSignature" className="text-sm text-gray-600">
                  Digital Signature
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="blockchainVerify" />
                <label htmlFor="blockchainVerify" className="text-sm text-gray-600">
                  Blockchain Verification
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button>
                Issue Certificate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorCertificates; 