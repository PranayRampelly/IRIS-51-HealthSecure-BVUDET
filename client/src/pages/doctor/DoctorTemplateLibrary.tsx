import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, Filter, Download, Star, Users, 
  Clock, Eye, Copy, ArrowLeft, Heart,
  TrendingUp, Award, Shield, CheckCircle,
  BookOpen, Globe, UserCheck, Zap, Upload
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock public templates data
const mockPublicTemplates = [
  {
    id: 'PUBLIC-001',
    name: 'Comprehensive Insurance Verification',
    description: 'Complete insurance verification template with all required fields for major insurance providers',
    author: 'Dr. Sarah Johnson',
    authorHospital: 'City General Hospital',
    category: 'Insurance',
    fields: ['Medical History', 'Lab Results', 'Diagnostic Images', 'Current Medications', 'Allergies'],
    urgency: 'high',
    rating: 4.8,
    downloads: 234,
    lastUpdated: '2024-01-10',
    tags: ['insurance', 'comprehensive', 'verified'],
    estimatedTime: '2-3 days',
    isVerified: true,
    isFeatured: true
  },
  {
    id: 'PUBLIC-002',
    name: 'Pediatric Specialist Referral',
    description: 'Specialized template for pediatric referrals with age-appropriate data fields',
    author: 'Dr. Michael Chen',
    authorHospital: 'Children\'s Medical Center',
    category: 'Referral',
    fields: ['Basic Demographics', 'Growth Charts', 'Immunization Records', 'Current Symptoms'],
    urgency: 'normal',
    rating: 4.6,
    downloads: 156,
    lastUpdated: '2024-01-08',
    tags: ['pediatric', 'referral', 'specialist'],
    estimatedTime: '1-2 days',
    isVerified: true,
    isFeatured: false
  },
  {
    id: 'PUBLIC-003',
    name: 'Emergency Cardiac Assessment',
    description: 'Rapid cardiac assessment template for emergency situations',
    author: 'Dr. Emily Rodriguez',
    authorHospital: 'Emergency Medical Center',
    category: 'Emergency',
    fields: ['Vital Signs', 'ECG Results', 'Cardiac History', 'Current Medications'],
    urgency: 'urgent',
    rating: 4.9,
    downloads: 89,
    lastUpdated: '2024-01-12',
    tags: ['emergency', 'cardiac', 'urgent'],
    estimatedTime: 'Immediate',
    isVerified: true,
    isFeatured: true
  },
  {
    id: 'PUBLIC-004',
    name: 'Routine Diabetes Management',
    description: 'Comprehensive diabetes management template for regular checkups',
    author: 'Dr. David Kim',
    authorHospital: 'Endocrine Specialists',
    category: 'Routine',
    fields: ['Blood Sugar Levels', 'HbA1c', 'Medication Compliance', 'Dietary Habits'],
    urgency: 'low',
    rating: 4.7,
    downloads: 198,
    lastUpdated: '2024-01-05',
    tags: ['diabetes', 'routine', 'management'],
    estimatedTime: '1 day',
    isVerified: true,
    isFeatured: false
  },
  {
    id: 'PUBLIC-005',
    name: 'Oncology Treatment Plan',
    description: 'Comprehensive oncology treatment planning template',
    author: 'Dr. Lisa Thompson',
    authorHospital: 'Cancer Treatment Center',
    category: 'Specialist',
    fields: ['Diagnosis', 'Staging', 'Treatment History', 'Side Effects', 'Lab Results'],
    urgency: 'high',
    rating: 4.5,
    downloads: 67,
    lastUpdated: '2024-01-15',
    tags: ['oncology', 'treatment', 'specialist'],
    estimatedTime: '3-5 days',
    isVerified: true,
    isFeatured: false
  },
  {
    id: 'PUBLIC-006',
    name: 'Mental Health Assessment',
    description: 'Comprehensive mental health evaluation template',
    author: 'Dr. James Wilson',
    authorHospital: 'Psychiatric Institute',
    category: 'Specialist',
    fields: ['Mental Health History', 'Current Symptoms', 'Medication History', 'Risk Assessment'],
    urgency: 'normal',
    rating: 4.4,
    downloads: 123,
    lastUpdated: '2024-01-03',
    tags: ['mental-health', 'assessment', 'psychiatry'],
    estimatedTime: '1-2 days',
    isVerified: true,
    isFeatured: false
  }
];

const templateCategories = [
  'All Categories', 'Insurance', 'Referral', 'Emergency', 'Routine', 'Specialist', 'Follow-up'
];

const urgencyLevels = [
  { value: 'all', label: 'All Urgency' },
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
];

const DoctorTemplateLibrary = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedUrgency, setSelectedUrgency] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showPreview, setShowPreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Filter and sort templates
  const filteredTemplates = mockPublicTemplates
    .filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      const matchesUrgency = selectedUrgency === 'all' || template.urgency === selectedUrgency;
      
      return matchesSearch && matchesCategory && matchesUrgency;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'downloads':
          return b.downloads - a.downloads;
        case 'recent':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const handlePreview = (template: typeof mockPublicTemplates[0]) => {
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  const handleDownload = (template: typeof mockPublicTemplates[0]) => {
    // Mock download functionality
    console.log('Downloading template:', template.id);
    // In real implementation, this would trigger the download/import process
  };

  const handleFavorite = (templateId: string) => {
    setFavorites(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const featuredTemplates = mockPublicTemplates.filter(t => t.isFeatured);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-3xl font-montserrat font-bold text-health-teal">Template Library</h1>
          </div>
          <p className="text-health-charcoal">Browse and import professional templates from the community</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <BookOpen className="w-4 h-4 mr-2" />
            My Favorites
          </Button>
          <Button className="bg-health-teal hover:bg-health-teal/90">
            <Upload className="w-4 h-4 mr-2" />
            Share Template
          </Button>
        </div>
      </div>

      {/* Featured Templates */}
      {featuredTemplates.length > 0 && (
        <Card className="border-2 border-health-teal/20 bg-gradient-to-r from-health-teal/5 to-health-aqua/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-health-teal" />
              Featured Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredTemplates.map(template => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg mb-1">{template.name}</h3>
                        <p className="text-sm text-health-charcoal/70 mb-2">{template.description}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {template.category}
                          </Badge>
                          <Badge className={`text-xs ${getUrgencyColor(template.urgency)}`}>
                            {template.urgency}
                          </Badge>
                          {template.isVerified && (
                            <Badge variant="outline" className="text-xs text-health-success">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleFavorite(template.id)}
                        className={favorites.includes(template.id) ? 'text-red-500' : ''}
                      >
                        <Heart className={`w-4 h-4 ${favorites.includes(template.id) ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between text-xs text-health-charcoal/60 mb-3">
                      <span>By {template.author}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span>{template.rating}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handlePreview(template)}>
                        <Eye className="w-3 h-3 mr-1" />
                        Preview
                      </Button>
                      <Button size="sm" onClick={() => handleDownload(template)}>
                        <Download className="w-3 h-3 mr-1" />
                        Import
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-health-charcoal/50 w-4 h-4" />
              <Input
                placeholder="Search templates by name, description, or tags..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {templateCategories.map(category => (
                  <SelectItem key={category} value={category === 'All Categories' ? 'all' : category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedUrgency} onValueChange={setSelectedUrgency}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Urgency" />
              </SelectTrigger>
              <SelectContent>
                {urgencyLevels.map(level => (
                  <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="downloads">Most Downloaded</SelectItem>
                <SelectItem value="recent">Recently Updated</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid/List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
        {filteredTemplates.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <BookOpen className="w-12 h-12 text-health-charcoal/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-health-charcoal mb-2">No templates found</h3>
            <p className="text-health-charcoal/60 mb-4">Try adjusting your search criteria</p>
          </div>
        ) : (
          filteredTemplates.map(template => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{template.name}</CardTitle>
                    <p className="text-sm text-health-charcoal/70 mb-2">{template.description}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {template.category}
                      </Badge>
                      <Badge className={`text-xs ${getUrgencyColor(template.urgency)}`}>
                        {template.urgency}
                      </Badge>
                      {template.isVerified && (
                        <Badge variant="outline" className="text-xs text-health-success">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleFavorite(template.id)}
                    className={favorites.includes(template.id) ? 'text-red-500' : ''}
                  >
                    <Heart className={`w-4 h-4 ${favorites.includes(template.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-health-charcoal/70 mb-1">Required Fields</p>
                    <div className="flex flex-wrap gap-1">
                      {template.fields.slice(0, 3).map(field => (
                        <Badge key={field} variant="secondary" className="text-xs">
                          {field}
                        </Badge>
                      ))}
                      {template.fields.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{template.fields.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-health-charcoal/60">
                    <div className="flex items-center gap-4">
                      <span>By {template.author}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span>{template.rating}</span>
                      </div>
                    </div>
                    <span>{template.downloads} downloads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-health-charcoal/50" />
                    <span className="text-xs text-health-charcoal/60">{template.estimatedTime}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handlePreview(template)}>
                      <Eye className="w-3 h-3 mr-1" />
                      Preview
                    </Button>
                    <Button size="sm" onClick={() => handleDownload(template)}>
                      <Download className="w-3 h-3 mr-1" />
                      Import
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Template Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Template Preview
            </DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-health-charcoal/70">Template Name</label>
                  <p className="font-medium">{previewTemplate.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-health-charcoal/70">Category</label>
                  <Badge variant="outline">{previewTemplate.category}</Badge>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-health-charcoal/70">Description</label>
                <p className="text-sm">{previewTemplate.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-health-charcoal/70">Author</label>
                  <p className="text-sm">{previewTemplate.author}</p>
                  <p className="text-xs text-health-charcoal/60">{previewTemplate.authorHospital}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-health-charcoal/70">Last Updated</label>
                  <p className="text-sm">{previewTemplate.lastUpdated}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-health-charcoal/70">Required Fields</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {previewTemplate.fields.map(field => (
                    <Badge key={field} variant="secondary">
                      {field}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-health-charcoal/70">Rating</label>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{previewTemplate.rating}/5.0</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-health-charcoal/70">Downloads</label>
                  <p className="font-medium">{previewTemplate.downloads}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-health-charcoal/70">Response Time</label>
                  <p className="font-medium">{previewTemplate.estimatedTime}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="bg-health-teal hover:bg-health-teal/90 text-white">
                  <Download className="w-4 h-4 mr-2" />
                  Import Template
                </Button>
                <Button variant="outline" onClick={() => handleFavorite(previewTemplate.id)}>
                  <Heart className={`w-4 h-4 mr-2 ${favorites.includes(previewTemplate.id) ? 'fill-current' : ''}`} />
                  {favorites.includes(previewTemplate.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DoctorTemplateLibrary;
