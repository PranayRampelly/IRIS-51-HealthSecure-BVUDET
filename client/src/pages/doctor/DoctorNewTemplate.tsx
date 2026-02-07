import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import {
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  Clock,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle,
  X,
  Plus,
  Trash2,
  Copy,
  Download,
  Upload,
  Settings,
  Calendar,
  Tag,
  Star,
  Share2,
  Lock,
  Globe
} from 'lucide-react';

interface TemplateFormData {
  title: string;
  description: string;
  category: string;
  urgency: string;
  symptoms: string[];
  diagnosis: string;
  treatment: string;
  medications: string[];
  followUp: string;
  notes: string;
  isPublic: boolean;
  estimatedTime: string;
  tags: string[];
}

const DoctorNewTemplate: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<TemplateFormData>({
    title: '',
    description: '',
    category: '',
    urgency: 'medium',
    symptoms: [],
    diagnosis: '',
    treatment: '',
    medications: [],
    followUp: '',
    notes: '',
    isPublic: false,
    estimatedTime: '',
    tags: []
  });

  const [currentSymptom, setCurrentSymptom] = useState('');
  const [currentMedication, setCurrentMedication] = useState('');
  const [currentTag, setCurrentTag] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const categories = [
    'Cardiology', 'Neurology', 'Orthopedics', 'Dermatology', 
    'Endocrinology', 'Gastroenterology', 'Pulmonology', 'Oncology',
    'Pediatrics', 'Emergency Medicine', 'General Practice'
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' },
    { value: 'critical', label: 'Critical', color: 'bg-red-200 text-red-900' }
  ];

  const timeEstimates = [
    '15 minutes', '30 minutes', '45 minutes', '1 hour',
    '1.5 hours', '2 hours', '3+ hours'
  ];

  useEffect(() => {
    if (isEditing && id) {
      // Load existing template data
      setFormData({
        title: 'Sample Template',
        description: 'This is a sample template for demonstration',
        category: 'Cardiology',
        urgency: 'medium',
        symptoms: ['Chest pain', 'Shortness of breath', 'Fatigue'],
        diagnosis: 'Angina pectoris',
        treatment: 'Nitroglycerin, lifestyle modifications',
        medications: ['Nitroglycerin', 'Aspirin', 'Beta-blocker'],
        followUp: 'Follow up in 2 weeks',
        notes: 'Patient education on lifestyle changes',
        isPublic: false,
        estimatedTime: '30 minutes',
        tags: ['cardiology', 'chest-pain', 'angina']
      });
    }
  }, [isEditing, id]);

  const addSymptom = () => {
    if (currentSymptom.trim() && !formData.symptoms.includes(currentSymptom.trim())) {
      setFormData(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, currentSymptom.trim()]
      }));
      setCurrentSymptom('');
    }
  };

  const removeSymptom = (symptom: string) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter(s => s !== symptom)
    }));
  };

  const addMedication = () => {
    if (currentMedication.trim() && !formData.medications.includes(currentMedication.trim())) {
      setFormData(prev => ({
        ...prev,
        medications: [...prev.medications, currentMedication.trim()]
      }));
      setCurrentMedication('');
    }
  };

  const removeMedication = (medication: string) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter(m => m !== medication)
    }));
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim().toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim().toLowerCase()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveProgress(0);

    // Simulate save progress
    const interval = setInterval(() => {
      setSaveProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setSaving(false);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
          return 100;
        }
        return prev + 20;
      });
    }, 200);
  };

  const handlePreview = () => {
    setPreviewMode(!previewMode);
  };

  const getUrgencyColor = (urgency: string) => {
    return urgencyLevels.find(level => level.value === urgency)?.color || '';
  };

  const getUrgencyLabel = (urgency: string) => {
    return urgencyLevels.find(level => level.value === urgency)?.label || '';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
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
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit Template' : 'Create New Template'}
              </h1>
              <p className="text-gray-600">
                {isEditing ? 'Update your template details' : 'Design a comprehensive medical template'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={saving}
            >
              {previewMode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {previewMode ? 'Hide Preview' : 'Preview'}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !formData.title.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Template'}
            </Button>
          </div>
        </div>

        {/* Success Alert */}
        {showSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Template saved successfully!
            </AlertDescription>
          </Alert>
        )}

        {/* Save Progress */}
        {saving && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Saving template...</span>
                <span className="text-sm text-gray-500">{saveProgress}%</span>
              </div>
              <Progress value={saveProgress} className="w-full" />
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Essential details about your template
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Title *
                  </label>
                  <Input
                    placeholder="Enter template title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <Textarea
                    placeholder="Describe the purpose and scope of this template"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Urgency Level
                    </label>
                    <Select
                      value={formData.urgency}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, urgency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {urgencyLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            <div className="flex items-center">
                              <Badge className={`mr-2 ${level.color}`}>
                                {level.label}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Time
                  </label>
                  <Select
                    value={formData.estimatedTime}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, estimatedTime: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select estimated time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeEstimates.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Clinical Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Clinical Details
                </CardTitle>
                <CardDescription>
                  Medical information and treatment plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Symptoms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Common Symptoms
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <Input
                      placeholder="Add a symptom"
                      value={currentSymptom}
                      onChange={(e) => setCurrentSymptom(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSymptom()}
                    />
                    <Button onClick={addSymptom} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.symptoms.map((symptom, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center">
                        {symptom}
                        <X
                          className="w-3 h-3 ml-1 cursor-pointer"
                          onClick={() => removeSymptom(symptom)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diagnosis
                  </label>
                  <Textarea
                    placeholder="Enter diagnosis details"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Treatment Plan
                  </label>
                  <Textarea
                    placeholder="Describe the treatment approach"
                    value={formData.treatment}
                    onChange={(e) => setFormData(prev => ({ ...prev, treatment: e.target.value }))}
                    rows={3}
                  />
                </div>

                {/* Medications */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medications
                  </label>
                  <div className="flex space-x-2 mb-2">
                    <Input
                      placeholder="Add a medication"
                      value={currentMedication}
                      onChange={(e) => setCurrentMedication(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addMedication()}
                    />
                    <Button onClick={addMedication} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.medications.map((medication, index) => (
                      <Badge key={index} variant="outline" className="flex items-center">
                        {medication}
                        <X
                          className="w-3 h-3 ml-1 cursor-pointer"
                          onClick={() => removeMedication(medication)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Follow-up Instructions
                  </label>
                  <Textarea
                    placeholder="Enter follow-up requirements"
                    value={formData.followUp}
                    onChange={(e) => setFormData(prev => ({ ...prev, followUp: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <Textarea
                    placeholder="Any additional notes or instructions"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Template Preview */}
            {previewMode && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="w-5 h-5 mr-2" />
                    Template Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{formData.title || 'Template Title'}</h3>
                    <p className="text-gray-600 text-sm">{formData.description || 'No description'}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge className={getUrgencyColor(formData.urgency)}>
                      {getUrgencyLabel(formData.urgency)}
                    </Badge>
                    {formData.category && (
                      <Badge variant="outline">{formData.category}</Badge>
                    )}
                  </div>

                  {formData.estimatedTime && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      {formData.estimatedTime}
                    </div>
                  )}

                  {formData.symptoms.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Symptoms:</h4>
                      <div className="flex flex-wrap gap-1">
                        {formData.symptoms.map((symptom, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {symptom}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.diagnosis && (
                    <div>
                      <h4 className="font-medium text-sm mb-1">Diagnosis:</h4>
                      <p className="text-sm text-gray-600">{formData.diagnosis}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Template Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="public"
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, isPublic: checked as boolean }))
                    }
                  />
                  <label htmlFor="public" className="text-sm font-medium">
                    Make template public
                  </label>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  {formData.isPublic ? (
                    <Globe className="w-4 h-4 mr-2 text-blue-600" />
                  ) : (
                    <Lock className="w-4 h-4 mr-2 text-gray-400" />
                  )}
                  {formData.isPublic ? 'Public template' : 'Private template'}
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="w-5 h-5 mr-2" />
                  Tags
                </CardTitle>
                <CardDescription>
                  Add tags to help organize and find your template
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add a tag"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button onClick={addTag} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="flex items-center">
                      #{tag}
                      <X
                        className="w-3 h-3 ml-1 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate Template
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Export Template
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Template
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorNewTemplate;
