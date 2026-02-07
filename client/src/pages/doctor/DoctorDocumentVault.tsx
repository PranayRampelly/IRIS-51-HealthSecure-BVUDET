import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Folder, 
  FileText, 
  Upload, 
  Download,
  Share2,
  Lock,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Plus,
  Calendar,
  User,
  Shield,
  Activity,
  BarChart3
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  size: string;
  uploadedAt: string;
  uploadedBy: string;
  status: 'active' | 'archived' | 'deleted';
  accessLevel: 'private' | 'shared' | 'public';
  tags: string[];
  description?: string;
  patientId?: string;
  patientName?: string;
}

interface DocumentStats {
  totalDocuments: number;
  totalSize: string;
  activeDocuments: number;
  sharedDocuments: number;
  categories: Array<{ name: string; count: number }>;
  recentUploads: Array<{ date: string; count: number }>;
}

const DoctorDocumentVault: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [accessFilter, setAccessFilter] = useState<string>('all');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const documents: Document[] = [
    {
      id: '1',
      name: 'Medical Certificate - Sarah Johnson',
      type: 'PDF',
      category: 'Certificates',
      size: '2.3 MB',
      uploadedAt: '2024-01-15',
      uploadedBy: 'Dr. Smith',
      status: 'active',
      accessLevel: 'shared',
      tags: ['certificate', 'medical', 'patient'],
      description: 'Medical certificate for work leave',
      patientId: 'P001',
      patientName: 'Sarah Johnson'
    },
    {
      id: '2',
      name: 'Lab Results - Blood Test',
      type: 'PDF',
      category: 'Lab Reports',
      size: '1.8 MB',
      uploadedAt: '2024-01-14',
      uploadedBy: 'Dr. Smith',
      status: 'active',
      accessLevel: 'private',
      tags: ['lab', 'blood', 'results'],
      description: 'Complete blood count results',
      patientId: 'P002',
      patientName: 'Michael Chen'
    },
    {
      id: '3',
      name: 'Prescription Template',
      type: 'DOCX',
      category: 'Templates',
      size: '156 KB',
      uploadedAt: '2024-01-13',
      uploadedBy: 'Dr. Smith',
      status: 'active',
      accessLevel: 'public',
      tags: ['template', 'prescription'],
      description: 'Standard prescription template'
    },
    {
      id: '4',
      name: 'Patient Consent Form',
      type: 'PDF',
      category: 'Forms',
      size: '890 KB',
      uploadedAt: '2024-01-12',
      uploadedBy: 'Dr. Smith',
      status: 'active',
      accessLevel: 'shared',
      tags: ['consent', 'form', 'legal'],
      description: 'General patient consent form'
    },
    {
      id: '5',
      name: 'X-Ray Report - Chest',
      type: 'DICOM',
      category: 'Imaging',
      size: '15.2 MB',
      uploadedAt: '2024-01-11',
      uploadedBy: 'Dr. Smith',
      status: 'active',
      accessLevel: 'private',
      tags: ['x-ray', 'chest', 'imaging'],
      description: 'Chest X-ray examination report',
      patientId: 'P003',
      patientName: 'Emily Davis'
    },
    {
      id: '6',
      name: 'Referral Letter Template',
      type: 'DOCX',
      category: 'Templates',
      size: '234 KB',
      uploadedAt: '2024-01-10',
      uploadedBy: 'Dr. Smith',
      status: 'archived',
      accessLevel: 'public',
      tags: ['template', 'referral', 'letter'],
      description: 'Professional referral letter template'
    }
  ];

  const stats: DocumentStats = {
    totalDocuments: 156,
    totalSize: '2.3 GB',
    activeDocuments: 142,
    sharedDocuments: 45,
    categories: [
      { name: 'Lab Reports', count: 35 },
      { name: 'Certificates', count: 28 },
      { name: 'Templates', count: 25 },
      { name: 'Forms', count: 22 },
      { name: 'Imaging', count: 18 }
    ],
    recentUploads: [
      { date: 'Today', count: 5 },
      { date: 'Yesterday', count: 8 },
      { date: 'This Week', count: 25 },
      { date: 'This Month', count: 89 }
    ]
  };

  const categories = ['Lab Reports', 'Certificates', 'Templates', 'Forms', 'Imaging', 'Prescriptions', 'Referrals'];
  const statuses = ['active', 'archived', 'deleted'];
  const accessLevels = ['private', 'shared', 'public'];

  const filteredDocuments = documents.filter(document => {
    const matchesSearch = document.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         document.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || document.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || document.status === statusFilter;
    const matchesAccess = accessFilter === 'all' || document.accessLevel === accessFilter;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesAccess;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      archived: 'bg-yellow-100 text-yellow-800',
      deleted: 'bg-red-100 text-red-800'
    };
    return <Badge className={variants[status]}>{status}</Badge>;
  };

  const getAccessBadge = (access: string) => {
    const variants: Record<string, string> = {
      private: 'bg-red-100 text-red-800',
      shared: 'bg-blue-100 text-blue-800',
      public: 'bg-green-100 text-green-800'
    };
    return <Badge className={variants[access]}>{access}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      PDF: <FileText className="w-4 h-4" />,
      DOCX: <FileText className="w-4 h-4" />,
      DICOM: <FileText className="w-4 h-4" />,
      JPG: <FileText className="w-4 h-4" />,
      PNG: <FileText className="w-4 h-4" />
    };
    return icons[type] || <FileText className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Document Vault</h1>
          <p className="text-gray-600 mt-1">Secure document storage and management</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Folder className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDocuments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Documents</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeDocuments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Share2 className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Shared Documents</p>
                <p className="text-2xl font-bold text-gray-900">{stats.sharedDocuments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Size</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSize}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search documents..."
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

            <Select value={accessFilter} onValueChange={setAccessFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by access" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Access</SelectItem>
                {accessLevels.map(access => (
                  <SelectItem key={access} value={access}>{access}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="documents" className="space-y-6">
        <TabsList>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredDocuments.map((document) => (
                  <div key={document.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {getTypeIcon(document.type)}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{document.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm text-gray-600">{document.category}</span>
                            <span className="text-sm text-gray-600">•</span>
                            <span className="text-sm text-gray-600">{document.size}</span>
                            {document.patientName && (
                              <>
                                <span className="text-sm text-gray-600">•</span>
                                <span className="text-sm text-gray-600">{document.patientName}</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            {document.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(document.uploadedAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">{document.uploadedBy}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(document.status)}
                          {getAccessBadge(document.accessLevel)}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Document Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Name</p>
                                    <p className="text-gray-900">{document.name}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Type</p>
                                    <p className="text-gray-900">{document.type}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Category</p>
                                    <p className="text-gray-900">{document.category}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Size</p>
                                    <p className="text-gray-900">{document.size}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Uploaded</p>
                                    <p className="text-gray-900">
                                      {new Date(document.uploadedAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Uploaded By</p>
                                    <p className="text-gray-900">{document.uploadedBy}</p>
                                  </div>
                                </div>
                                
                                {document.description && (
                                  <div>
                                    <p className="text-sm font-medium text-gray-600">Description</p>
                                    <p className="text-gray-900">{document.description}</p>
                                  </div>
                                )}
                                
                                <div>
                                  <p className="text-sm font-medium text-gray-600 mb-2">Tags</p>
                                  <div className="flex flex-wrap gap-2">
                                    {document.tags.map((tag, index) => (
                                      <Badge key={index} variant="outline">
                                        {tag}
                                      </Badge>
                                    ))}
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
                <CardTitle>Recent Uploads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentUploads.map((upload) => (
                    <div key={upload.date} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">{upload.date}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-health-aqua h-2 rounded-full" 
                            style={{ width: `${(upload.count / Math.max(...stats.recentUploads.map(u => u.count))) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{upload.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Document Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">PDF Documents</span>
                    <span className="text-sm font-medium text-gray-900">65%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">DOCX Files</span>
                    <span className="text-sm font-medium text-gray-900">20%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">DICOM Images</span>
                    <span className="text-sm font-medium text-gray-900">10%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Other</span>
                    <span className="text-sm font-medium text-gray-900">5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Categories</CardTitle>
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

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Document Name</label>
              <Input placeholder="Enter document name" />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Description</label>
              <Input placeholder="Enter document description" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Category</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Access Level</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select access level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="shared">Shared</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Tags</label>
              <Input placeholder="Enter tags separated by commas" />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Upload File</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500 mt-1">PDF, DOCX, DICOM up to 50MB</p>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button>
                Upload Document
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorDocumentVault; 