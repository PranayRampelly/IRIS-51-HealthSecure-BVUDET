import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Upload,
  Download,
  FileText,
  Link,
  Search,
  Filter,
  Star,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  X,
  Plus,
  Trash2,
  Copy,
  Eye,
  Globe,
  Lock,
  Tag,
  Calendar,
  BarChart3,
  Settings,
  RefreshCw,
  ExternalLink,
  FileUp,
  FileDown,
  Database,
  Cloud,
  Smartphone,
  Monitor
} from 'lucide-react';

interface ImportedTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  urgency: string;
  author: string;
  rating: number;
  downloads: number;
  isVerified: boolean;
  source: string;
  importDate: string;
  status: 'pending' | 'imported' | 'failed';
  tags: string[];
}

const DoctorImportTemplate: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('file');
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [importedTemplates, setImportedTemplates] = useState<ImportedTemplate[]>([]);

  // Mock data for imported templates
  const mockImportedTemplates: ImportedTemplate[] = [
    {
      id: '1',
      title: 'Cardiac Assessment Template',
      description: 'Comprehensive cardiac evaluation template',
      category: 'Cardiology',
      urgency: 'high',
      author: 'Dr. Sarah Johnson',
      rating: 4.8,
      downloads: 1250,
      isVerified: true,
      source: 'Template Library',
      importDate: '2024-01-15',
      status: 'imported',
      tags: ['cardiology', 'assessment', 'cardiac']
    },
    {
      id: '2',
      title: 'Neurological Exam Template',
      description: 'Standard neurological examination protocol',
      category: 'Neurology',
      urgency: 'medium',
      author: 'Dr. Michael Chen',
      rating: 4.6,
      downloads: 890,
      isVerified: true,
      source: 'File Upload',
      importDate: '2024-01-14',
      status: 'imported',
      tags: ['neurology', 'exam', 'protocol']
    },
    {
      id: '3',
      title: 'Emergency Trauma Template',
      description: 'Rapid assessment for trauma patients',
      category: 'Emergency Medicine',
      urgency: 'critical',
      author: 'Dr. Emily Rodriguez',
      rating: 4.9,
      downloads: 2100,
      isVerified: true,
      source: 'URL Import',
      importDate: '2024-01-13',
      status: 'pending',
      tags: ['emergency', 'trauma', 'assessment']
    }
  ];

  const categories = [
    'All Categories', 'Cardiology', 'Neurology', 'Orthopedics', 
    'Dermatology', 'Endocrinology', 'Gastroenterology', 'Pulmonology', 
    'Oncology', 'Pediatrics', 'Emergency Medicine', 'General Practice'
  ];

  const sources = [
    'All Sources', 'Template Library', 'File Upload', 'URL Import', 
    'Database Import', 'Cloud Sync', 'Mobile App'
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Handle file upload logic here
      console.log('Files selected:', files);
    }
  };

  const handleUrlImport = () => {
    // Handle URL import logic here
    console.log('URL import triggered');
  };

  const handleLibraryImport = () => {
    // Handle library import logic here
    console.log('Library import triggered');
  };

  const simulateImport = () => {
    setIsImporting(true);
    setImportProgress(0);

    const interval = setInterval(() => {
      setImportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsImporting(false);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const getUrgencyColor = (urgency: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
      critical: 'bg-red-200 text-red-900'
    };
    return colors[urgency as keyof typeof colors] || '';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      imported: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || '';
  };

  const filteredTemplates = mockImportedTemplates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSource = selectedSource === 'all' || template.source === selectedSource;
    
    return matchesSearch && matchesCategory && matchesSource;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/doctor/create-template')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Templates
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Import Templates</h1>
              <p className="text-gray-600">
                Import templates from various sources and manage your imported collection
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => navigate('/doctor/template-library')}>
              <Globe className="w-4 h-4 mr-2" />
              Browse Library
            </Button>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Import Settings
            </Button>
          </div>
        </div>

        {/* Success Alert */}
        {showSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Template imported successfully!
            </AlertDescription>
          </Alert>
        )}

        {/* Import Progress */}
        {isImporting && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Importing template...</span>
                <span className="text-sm text-gray-500">{importProgress}%</span>
              </div>
              <Progress value={importProgress} className="w-full" />
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Import Methods */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Import Methods
                </CardTitle>
                <CardDescription>
                  Choose how you want to import templates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="file">File</TabsTrigger>
                    <TabsTrigger value="url">URL</TabsTrigger>
                    <TabsTrigger value="library">Library</TabsTrigger>
                  </TabsList>

                  <TabsContent value="file" className="space-y-4 mt-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <FileUp className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Upload Template File
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Supported formats: JSON, XML, CSV, TXT
                      </p>
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json,.xml,.csv,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                        multiple
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        JSON templates (recommended)
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        XML format support
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        CSV data import
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="url" className="space-y-4 mt-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Template URL
                        </label>
                        <Input
                          placeholder="https://example.com/template.json"
                          className="mb-2"
                        />
                        <p className="text-xs text-gray-500">
                          Enter a direct link to a template file
                        </p>
                      </div>
                      <Button
                        onClick={handleUrlImport}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <Link className="w-4 h-4 mr-2" />
                        Import from URL
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500" />
                        Ensure URL is from trusted source
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        Supports HTTPS URLs only
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="library" className="space-y-4 mt-4">
                    <div className="space-y-4">
                      <div className="text-center">
                        <Database className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Template Library
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Browse and import from our curated template collection
                        </p>
                      </div>
                      <Button
                        onClick={handleLibraryImport}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <Globe className="w-4 h-4 mr-2" />
                        Browse Library
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        Verified templates only
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        Community ratings
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        Regular updates
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Import Statistics */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Import Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Imported</span>
                  <span className="font-semibold">24</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="font-semibold text-blue-600">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="font-semibold text-green-600">96%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Storage Used</span>
                  <span className="font-semibold">2.4 MB</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Imported Templates */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Download className="w-5 h-5 mr-2" />
                      Imported Templates
                    </CardTitle>
                    <CardDescription>
                      Manage your imported template collection
                    </CardDescription>
                  </div>
                  <Button
                    onClick={simulateImport}
                    disabled={isImporting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isImporting ? 'animate-spin' : ''}`} />
                    {isImporting ? 'Importing...' : 'Import Sample'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedSource} onValueChange={setSelectedSource}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sources.map((source) => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Templates List */}
                <div className="space-y-4">
                  {filteredTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{template.title}</h3>
                            <Badge className={getStatusColor(template.status)}>
                              {template.status}
                            </Badge>
                            {template.isVerified && (
                              <Badge className="bg-blue-100 text-blue-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-3">{template.description}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {template.author}
                            </div>
                            <div className="flex items-center">
                              <Star className="w-4 h-4 mr-1" />
                              {template.rating}
                            </div>
                            <div className="flex items-center">
                              <Download className="w-4 h-4 mr-1" />
                              {template.downloads}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {template.importDate}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Badge className={getUrgencyColor(template.urgency)}>
                              {template.urgency}
                            </Badge>
                            <Badge variant="outline">{template.category}</Badge>
                            <Badge variant="outline">{template.source}</Badge>
                            {template.tags.slice(0, 2).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredTemplates.length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No templates found
                      </h3>
                      <p className="text-gray-600">
                        Try adjusting your search criteria or import some templates
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorImportTemplate;
