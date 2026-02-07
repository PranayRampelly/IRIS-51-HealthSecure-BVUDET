import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Plus, 
  Edit, 
  Copy, 
  Trash2, 
  Eye, 
  Download,
  Search,
  Filter,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

interface ProofTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  fields: Array<{
    name: string;
    type: 'text' | 'number' | 'date' | 'select' | 'textarea';
    required: boolean;
    placeholder?: string;
    options?: string[];
  }>;
}

const DoctorProofTemplates: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<ProofTemplate | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const templates: ProofTemplate[] = [
    {
      id: '1',
      name: 'Medical Certificate',
      description: 'Standard medical certificate for patients requiring documentation for work or school',
      category: 'Certificates',
      status: 'active',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20',
      usageCount: 45,
      fields: [
        { name: 'Patient Name', type: 'text', required: true, placeholder: 'Enter patient full name' },
        { name: 'Date of Birth', type: 'date', required: true },
        { name: 'Diagnosis', type: 'textarea', required: true, placeholder: 'Enter diagnosis details' },
        { name: 'Treatment Period', type: 'text', required: true, placeholder: 'e.g., 2 weeks' },
        { name: 'Restrictions', type: 'textarea', required: false, placeholder: 'Any work/school restrictions' },
        { name: 'Follow-up Date', type: 'date', required: false }
      ]
    },
    {
      id: '2',
      name: 'Prescription Template',
      description: 'Standard prescription form with medication details and dosage instructions',
      category: 'Prescriptions',
      status: 'active',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-18',
      usageCount: 128,
      fields: [
        { name: 'Medication Name', type: 'text', required: true, placeholder: 'Enter medication name' },
        { name: 'Dosage', type: 'text', required: true, placeholder: 'e.g., 500mg' },
        { name: 'Frequency', type: 'select', required: true, options: ['Once daily', 'Twice daily', 'Three times daily', 'As needed'] },
        { name: 'Duration', type: 'text', required: true, placeholder: 'e.g., 7 days' },
        { name: 'Special Instructions', type: 'textarea', required: false, placeholder: 'Any special instructions' },
        { name: 'Refills', type: 'number', required: false, placeholder: 'Number of refills' }
      ]
    },
    {
      id: '3',
      name: 'Lab Results Summary',
      description: 'Template for summarizing laboratory test results and recommendations',
      category: 'Reports',
      status: 'active',
      createdAt: '2024-01-08',
      updatedAt: '2024-01-15',
      usageCount: 32,
      fields: [
        { name: 'Test Name', type: 'text', required: true, placeholder: 'Enter test name' },
        { name: 'Test Date', type: 'date', required: true },
        { name: 'Results', type: 'textarea', required: true, placeholder: 'Enter test results' },
        { name: 'Normal Range', type: 'text', required: false, placeholder: 'Normal range values' },
        { name: 'Interpretation', type: 'textarea', required: true, placeholder: 'Interpretation of results' },
        { name: 'Recommendations', type: 'textarea', required: false, placeholder: 'Follow-up recommendations' }
      ]
    },
    {
      id: '4',
      name: 'Referral Letter',
      description: 'Professional referral letter template for specialist consultations',
      category: 'Referrals',
      status: 'draft',
      createdAt: '2024-01-12',
      updatedAt: '2024-01-12',
      usageCount: 0,
      fields: [
        { name: 'Specialist Name', type: 'text', required: true, placeholder: 'Specialist name' },
        { name: 'Specialty', type: 'text', required: true, placeholder: 'Specialty field' },
        { name: 'Reason for Referral', type: 'textarea', required: true, placeholder: 'Detailed reason for referral' },
        { name: 'Clinical History', type: 'textarea', required: true, placeholder: 'Relevant clinical history' },
        { name: 'Current Medications', type: 'textarea', required: false, placeholder: 'Current medications' },
        { name: 'Urgency', type: 'select', required: true, options: ['Routine', 'Urgent', 'Emergency'] }
      ]
    },
    {
      id: '5',
      name: 'Discharge Summary',
      description: 'Comprehensive discharge summary for hospital patients',
      category: 'Reports',
      status: 'archived',
      createdAt: '2023-12-20',
      updatedAt: '2024-01-05',
      usageCount: 15,
      fields: [
        { name: 'Admission Date', type: 'date', required: true },
        { name: 'Discharge Date', type: 'date', required: true },
        { name: 'Primary Diagnosis', type: 'text', required: true, placeholder: 'Primary diagnosis' },
        { name: 'Secondary Diagnoses', type: 'textarea', required: false, placeholder: 'Secondary diagnoses' },
        { name: 'Procedures Performed', type: 'textarea', required: false, placeholder: 'Procedures performed' },
        { name: 'Discharge Medications', type: 'textarea', required: true, placeholder: 'Medications at discharge' },
        { name: 'Follow-up Instructions', type: 'textarea', required: true, placeholder: 'Follow-up instructions' }
      ]
    }
  ];

  const categories = ['Certificates', 'Prescriptions', 'Reports', 'Referrals', 'Forms'];
  const statuses = ['active', 'draft', 'archived'];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || template.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-gray-100 text-gray-800'
    };
    return <Badge className={variants[status]}>{status}</Badge>;
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      Certificates: <FileText className="w-4 h-4" />,
      Prescriptions: <FileText className="w-4 h-4" />,
      Reports: <FileText className="w-4 h-4" />,
      Referrals: <FileText className="w-4 h-4" />,
      Forms: <FileText className="w-4 h-4" />
    };
    return icons[category] || <FileText className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Proof Templates</h1>
          <p className="text-gray-600 mt-1">Manage and customize your proof templates</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Templates</p>
                <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
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
                <p className="text-sm font-medium text-gray-600">Active Templates</p>
                <p className="text-2xl font-bold text-gray-900">
                  {templates.filter(t => t.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Usage</p>
                <p className="text-2xl font-bold text-gray-900">
                  {templates.reduce((sum, t) => sum + t.usageCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Settings className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
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
                placeholder="Search templates..."
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

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(template.category)}
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <p className="text-sm text-gray-600">{template.category}</p>
                  </div>
                </div>
                {getStatusBadge(template.status)}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{template.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Usage Count:</span>
                  <span className="font-medium">{template.usageCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Fields:</span>
                  <span className="font-medium">{template.fields.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Updated:</span>
                  <span className="font-medium">
                    {new Date(template.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Template Details - {template.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Description</p>
                        <p className="text-gray-900">{template.description}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Template Fields</p>
                        <div className="space-y-2">
                          {template.fields.map((field, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div>
                                <p className="font-medium text-sm">{field.name}</p>
                                <p className="text-xs text-gray-600">{field.type}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                {field.required && (
                                  <Badge variant="secondary" className="text-xs">Required</Badge>
                                )}
                                <Badge variant="outline" className="text-xs">{field.type}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Template Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Template Name</label>
              <Input placeholder="Enter template name" />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Description</label>
              <Textarea placeholder="Enter template description" />
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
                <label className="text-sm font-medium text-gray-600">Status</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button>
                Create Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorProofTemplates; 