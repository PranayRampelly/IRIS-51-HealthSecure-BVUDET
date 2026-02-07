import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Calendar, AlertTriangle, CheckCircle, Clock, Activity, Stethoscope, User, FileText, Brain, Heart, Shield } from 'lucide-react';
import healthCoachService, { 
  type Symptom, 
  type PatientProfile, 
  type HealthAssessment,
  type HealthAnalysis 
} from '@/services/healthCoachService';

// Shadcn UI components
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DiseasePrediction: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'assessment' | 'advanced'>('assessment');
  
  // Symptom section visibility
  const [showGeneral, setShowGeneral] = useState(true);
  const [showRespiratory, setShowRespiratory] = useState(false);
  const [showGastrointestinal, setShowGastrointestinal] = useState(false);
  const [showNeurological, setShowNeurological] = useState(false);
  const [showMusculoskeletal, setShowMusculoskeletal] = useState(false);
  const [showOther, setShowOther] = useState(false);

  // Selected symptoms
  const [selectedGeneral, setSelectedGeneral] = useState<Symptom[]>([]);
  const [selectedRespiratory, setSelectedRespiratory] = useState<Symptom[]>([]);
  const [selectedGastrointestinal, setSelectedGastrointestinal] = useState<Symptom[]>([]);
  const [selectedNeurological, setSelectedNeurological] = useState<Symptom[]>([]);
  const [selectedMusculoskeletal, setSelectedMusculoskeletal] = useState<Symptom[]>([]);
  const [selectedOther, setSelectedOther] = useState<Symptom[]>([]);

  // Patient profile
  const [patientProfile, setPatientProfile] = useState<PatientProfile>({
    age: 30,
    biologicalSex: 'male',
    weight: 70,
    height: 170
  });

  // Symptom information
  const [primaryConcern, setPrimaryConcern] = useState('');
  const [symptomDuration, setSymptomDuration] = useState('1_3_days');
  const [overallSeverity, setOverallSeverity] = useState(5);
  const [symptomOnset, setSymptomOnset] = useState<Date | undefined>(undefined);
  const [symptomProgression, setSymptomProgression] = useState('staying_same');

  // Advanced options
  const [medicalHistory, setMedicalHistory] = useState<string[]>([]);
  const [medications, setMedications] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [familyHistory, setFamilyHistory] = useState<string[]>([]);
  const [lifestyle, setLifestyle] = useState({
    smoking: 'non_smoker' as 'non_smoker' | 'former_smoker' | 'current_smoker',
    alcohol: 'none' as 'none' | 'occasional' | 'moderate' | 'heavy',
    exercise: 'sedentary' as 'sedentary' | 'light' | 'moderate' | 'active',
    diet: 'standard' as 'standard' | 'vegetarian' | 'vegan' | 'keto' | 'paleo',
    sleepHours: 7
  });

  // Results and loading
  const [result, setResult] = useState<HealthAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);

  // Available symptoms
  const [availableSymptoms, setAvailableSymptoms] = useState({
    general: ['Fever', 'Fatigue', 'Chills', 'Weight Loss', 'Night Sweats', 'Loss of Appetite', 'Swelling'],
    respiratory: ['Cough', 'Difficulty Breathing', 'Sore Throat', 'Runny Nose', 'Chest Pain', 'Shortness of Breath'],
    gastrointestinal: ['Nausea', 'Vomiting', 'Abdominal Pain', 'Diarrhea', 'Constipation', 'Bloody Stool'],
    neurological: ['Headache', 'Dizziness', 'Memory Problems', 'Blurred Vision', 'Numbness'],
    musculoskeletal: ['Muscle Pain', 'Joint Pain', 'Back Pain', 'Stiffness', 'Weakness'],
    other: ['Rash', 'Itching', 'Swollen Glands', 'Bloody Urine', 'Skin Discoloration']
  });

  useEffect(() => {
    loadAvailableSymptoms();
  }, []);

  const loadAvailableSymptoms = async () => {
    try {
      const response = await healthCoachService.getAvailableSymptoms();
      if (response.success) {
        setAvailableSymptoms(response.data);
      }
    } catch (error) {
      console.error('Failed to load symptoms:', error);
    }
  };

  const handleSymptomChange = (
    symptomName: string,
    selectedSymptoms: Symptom[],
    setSelectedSymptoms: React.Dispatch<React.SetStateAction<Symptom[]>>,
    category: Symptom['category']
  ) => {
    const isSelected = selectedSymptoms.some(s => s.name === symptomName);
    
    if (isSelected) {
      setSelectedSymptoms(prev => prev.filter(s => s.name !== symptomName));
    } else {
      setSelectedSymptoms(prev => [...prev, {
        name: symptomName,
        severity: 5,
        category
      }]);
    }
  };

  const getAllSelectedSymptoms = (): Symptom[] => {
    return [
      ...selectedGeneral,
      ...selectedRespiratory,
      ...selectedGastrointestinal,
      ...selectedNeurological,
      ...selectedMusculoskeletal,
      ...selectedOther,
    ];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const symptoms = getAllSelectedSymptoms();
      
      if (symptoms.length === 0) {
        setError('Please select at least one symptom');
        setLoading(false);
        return;
      }

      if (!primaryConcern.trim()) {
        setError('Please enter your primary concern');
        setLoading(false);
        return;
      }

      const assessmentData: Partial<HealthAssessment> = {
        patientProfile,
        primaryConcern: primaryConcern.trim(),
        symptomDuration,
        overallSeverity,
        symptomOnset: symptomOnset ? symptomOnset.toISOString() : undefined,
        symptomProgression,
        symptoms,
        ...(activeTab === 'advanced' && {
          medicalHistory: medicalHistory.map(condition => ({ condition, isActive: true })),
          medications: medications.map(name => ({ name })),
          allergies: allergies.map(allergen => ({ allergen })),
          familyHistory: familyHistory.map(condition => ({ condition, relationship: 'family' })),
          lifestyle
        })
      };

      const response = await healthCoachService.createHealthAssessment(assessmentData);
      
      if (response.success) {
        setResult(response.data.analysis);
        setAssessmentId(response.data.assessmentId);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedGeneral([]);
    setSelectedRespiratory([]);
    setSelectedGastrointestinal([]);
    setSelectedNeurological([]);
    setSelectedMusculoskeletal([]);
    setSelectedOther([]);
    setPrimaryConcern('');
    setSymptomDuration('1_3_days');
    setOverallSeverity(5);
    setSymptomOnset(undefined);
    setSymptomProgression('staying_same');
    setMedicalHistory([]);
    setMedications([]);
    setAllergies([]);
    setFamilyHistory([]);
    setLifestyle({
      smoking: 'non_smoker',
      alcohol: 'none',
      exercise: 'sedentary',
      diet: 'standard',
      sleepHours: 7
    });
    setResult(null);
    setError(null);
    setAssessmentId(null);
  };

  const renderSymptomSection = (
    title: string,
    symptoms: string[],
    selectedSymptoms: Symptom[],
    setSelectedSymptoms: React.Dispatch<React.SetStateAction<Symptom[]>>,
    isExpanded: boolean,
    setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>,
    category: Symptom['category'],
    icon: React.ReactNode
  ) => (
    <Card className="mb-4">
      <CardHeader 
        className="pb-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {icon}
            <CardTitle className="text-lg font-semibold text-gray-800">{title}</CardTitle>
          </div>
          {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-600" /> : <ChevronDown className="h-5 w-5 text-gray-600" />}
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {symptoms.map((symptom) => (
              <div key={symptom} className="flex items-center space-x-2">
                <Checkbox
                  id={symptom}
                  checked={selectedSymptoms.some(s => s.name === symptom)}
                  onCheckedChange={() => handleSymptomChange(symptom, selectedSymptoms, setSelectedSymptoms, category)}
                  className="border-gray-300 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                />
                <Label htmlFor={symptom} className="text-sm text-gray-700 cursor-pointer capitalize">
                  {symptom.toLowerCase().replace(/_/g, ' ')}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );

  const renderUrgencyBadge = (urgencyLevel: string) => {
    const getBadgeVariant = (level: string) => {
      switch (level.toLowerCase()) {
        case 'emergency':
          return 'destructive';
        case 'high':
          return 'secondary';
        case 'medium':
          return 'default';
        case 'low':
          return 'outline';
        default:
          return 'outline';
      }
    };

    const getIcon = (level: string) => {
      switch (level.toLowerCase()) {
        case 'emergency':
          return <AlertTriangle className="w-4 h-4" />;
        case 'high':
          return <Activity className="w-4 h-4" />;
        default:
          return <Clock className="w-4 h-4" />;
      }
    };

    return (
      <Badge variant={getBadgeVariant(urgencyLevel)} className="flex items-center space-x-1">
        {getIcon(urgencyLevel)}
        <span className="capitalize">{urgencyLevel}</span>
      </Badge>
    );
  };

  return (
    <div className="flex-1 p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Advanced Clinical Symptom Analysis</h1>
          <p className="text-gray-600">
            Enter your symptoms and medical information below for a comprehensive health assessment. 
            The analysis uses advanced medical algorithms to identify potential conditions based on your specific symptom pattern.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'assessment' | 'advanced')} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="assessment" className="flex items-center space-x-2">
              <Stethoscope className="h-4 w-4" />
              <span>Symptom Assessment</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>Advanced Options</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assessment" className="space-y-6">
            <form onSubmit={handleSubmit}>
              {/* Patient Profile Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-teal-600" />
                    <span>Patient Profile</span>
                  </CardTitle>
                  <CardDescription>
                    Basic demographic information for personalized analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={patientProfile.age}
                        onChange={(e) => setPatientProfile(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                        min={0}
                        max={120}
                        className="border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Biological Sex</Label>
                      <RadioGroup
                        value={patientProfile.biologicalSex}
                        onValueChange={(value) => setPatientProfile(prev => ({ ...prev, biologicalSex: value as 'male' | 'female' | 'other' }))}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="male" id="male" className="border-gray-300 data-[state=checked]:bg-teal-600" />
                          <Label htmlFor="male">Male</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="female" id="female" className="border-gray-300 data-[state=checked]:bg-teal-600" />
                          <Label htmlFor="female">Female</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="other" id="other" className="border-gray-300 data-[state=checked]:bg-teal-600" />
                          <Label htmlFor="other">Other</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={patientProfile.weight || ''}
                        onChange={(e) => setPatientProfile(prev => ({ ...prev, weight: parseInt(e.target.value) || undefined }))}
                        min={1}
                        max={300}
                        className="border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Symptom Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-teal-600" />
                    <span>Symptom Information</span>
                  </CardTitle>
                  <CardDescription>
                    Details about your primary symptoms and their characteristics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="primaryConcern">Primary Concern</Label>
                      <Input
                        id="primaryConcern"
                        placeholder="e.g. Fever, Chest Pain, Headache"
                        value={primaryConcern}
                        onChange={(e) => setPrimaryConcern(e.target.value)}
                        className="border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="symptomDuration">Symptom Duration</Label>
                      <Select value={symptomDuration} onValueChange={setSymptomDuration}>
                        <SelectTrigger className="border-gray-300 focus:border-teal-500 focus:ring-teal-500">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="less_than_day">Less than a day</SelectItem>
                          <SelectItem value="1_3_days">1-3 days</SelectItem>
                          <SelectItem value="4_7_days">4-7 days</SelectItem>
                          <SelectItem value="1_2_weeks">1-2 weeks</SelectItem>
                          <SelectItem value="2_4_weeks">2-4 weeks</SelectItem>
                          <SelectItem value="more_than_month">More than a month</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="overallSeverity">Overall Symptom Severity (1-10)</Label>
                      <div className="space-y-2">
                        <Input
                          id="overallSeverity"
                          type="range"
                          min="1"
                          max="10"
                          value={overallSeverity}
                          onChange={(e) => setOverallSeverity(parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="text-center text-sm text-gray-600">{overallSeverity}/10</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>When did symptoms begin?</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal border-gray-300 focus:border-teal-500",
                              !symptomOnset && "text-muted-foreground"
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {symptomOnset ? format(symptomOnset, "PPP") : <span>Select date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={symptomOnset}
                            onSelect={setSymptomOnset}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label>How have your symptoms changed over time?</Label>
                      <RadioGroup
                        value={symptomProgression}
                        onValueChange={setSymptomProgression}
                        className="flex space-x-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="getting_worse" id="getting_worse" className="border-gray-300 data-[state=checked]:bg-teal-600" />
                          <Label htmlFor="getting_worse">Getting worse</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="staying_same" id="staying_same" className="border-gray-300 data-[state=checked]:bg-teal-600" />
                          <Label htmlFor="staying_same">Staying the same</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="improving" id="improving" className="border-gray-300 data-[state=checked]:bg-teal-600" />
                          <Label htmlFor="improving">Improving</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="fluctuating" id="fluctuating" className="border-gray-300 data-[state=checked]:bg-teal-600" />
                          <Label htmlFor="fluctuating">Fluctuating</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Symptom Selection Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-teal-600" />
                    <span>Symptom Selection</span>
                  </CardTitle>
                  <CardDescription>
                    Select all symptoms that apply to your current condition
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderSymptomSection(
                    'General Symptoms', 
                    availableSymptoms.general, 
                    selectedGeneral, 
                    setSelectedGeneral, 
                    showGeneral, 
                    setShowGeneral, 
                    'general',
                    <Activity className="h-4 w-4 text-blue-600" />
                  )}
                  {renderSymptomSection(
                    'Respiratory Symptoms', 
                    availableSymptoms.respiratory, 
                    selectedRespiratory, 
                    setSelectedRespiratory, 
                    showRespiratory, 
                    setShowRespiratory, 
                    'respiratory',
                    <Heart className="h-4 w-4 text-red-600" />
                  )}
                  {renderSymptomSection(
                    'Gastrointestinal Symptoms', 
                    availableSymptoms.gastrointestinal, 
                    selectedGastrointestinal, 
                    setSelectedGastrointestinal, 
                    showGastrointestinal, 
                    setShowGastrointestinal, 
                    'gastrointestinal',
                    <Shield className="h-4 w-4 text-green-600" />
                  )}
                  {renderSymptomSection(
                    'Neurological Symptoms', 
                    availableSymptoms.neurological, 
                    selectedNeurological, 
                    setSelectedNeurological, 
                    showNeurological, 
                    setShowNeurological, 
                    'neurological',
                    <Brain className="h-4 w-4 text-purple-600" />
                  )}
                  {renderSymptomSection(
                    'Musculoskeletal Symptoms', 
                    availableSymptoms.musculoskeletal, 
                    selectedMusculoskeletal, 
                    setSelectedMusculoskeletal, 
                    showMusculoskeletal, 
                    setShowMusculoskeletal, 
                    'musculoskeletal',
                    <Activity className="h-4 w-4 text-orange-600" />
                  )}
                  {renderSymptomSection(
                    'Other Symptoms', 
                    availableSymptoms.other, 
                    selectedOther, 
                    setSelectedOther, 
                    showOther, 
                    setShowOther, 
                    'other',
                    <FileText className="h-4 w-4 text-gray-600" />
                  )}
                </CardContent>
              </Card>

              {/* Analysis Actions */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      className="px-6 py-3 text-gray-700 border-gray-300 hover:bg-gray-100"
                    >
                      Reset Form
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Analyzing...' : 'Generate Clinical Analysis'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-teal-600" />
                  <span>Advanced Medical Information</span>
                </CardTitle>
                <CardDescription>
                  Additional medical history and lifestyle factors for enhanced analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Medical History */}
                <div className="space-y-2">
                  <Label htmlFor="medicalHistory">Medical History</Label>
                  <Input
                    id="medicalHistory"
                    placeholder="Add medical condition (press Enter to add)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const target = e.target as HTMLInputElement;
                        if (target.value.trim()) {
                          setMedicalHistory(prev => [...prev, target.value.trim()]);
                          target.value = '';
                        }
                      }
                    }}
                    className="border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                  />
                  <div className="flex flex-wrap gap-2">
                    {medicalHistory.map((condition, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                        <span>{condition}</span>
                        <button
                          type="button"
                          onClick={() => setMedicalHistory(prev => prev.filter((_, i) => i !== index))}
                          className="ml-1 hover:text-red-600"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Lifestyle Factors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="smoking">Smoking Status</Label>
                    <Select value={lifestyle.smoking} onValueChange={(value) => setLifestyle(prev => ({ ...prev, smoking: value as any }))}>
                      <SelectTrigger className="border-gray-300 focus:border-teal-500 focus:ring-teal-500">
                        <SelectValue placeholder="Select smoking status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="non_smoker">Non-smoker</SelectItem>
                        <SelectItem value="former_smoker">Former smoker</SelectItem>
                        <SelectItem value="current_smoker">Current smoker</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alcohol">Alcohol Consumption</Label>
                    <Select value={lifestyle.alcohol} onValueChange={(value) => setLifestyle(prev => ({ ...prev, alcohol: value as any }))}>
                      <SelectTrigger className="border-gray-300 focus:border-teal-500 focus:ring-teal-500">
                        <SelectValue placeholder="Select alcohol consumption" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="occasional">Occasional</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="heavy">Heavy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exercise">Exercise Level</Label>
                    <Select value={lifestyle.exercise} onValueChange={(value) => setLifestyle(prev => ({ ...prev, exercise: value as any }))}>
                      <SelectTrigger className="border-gray-300 focus:border-teal-500 focus:ring-teal-500">
                        <SelectValue placeholder="Select exercise level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sleepHours">Sleep Hours</Label>
                    <Input
                      id="sleepHours"
                      type="number"
                      value={lifestyle.sleepHours}
                      onChange={(e) => setLifestyle(prev => ({ ...prev, sleepHours: parseInt(e.target.value) || 7 }))}
                      min={0}
                      max={24}
                      className="border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-red-800 font-medium">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Display */}
        {result && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2 text-green-800">
                  <Stethoscope className="h-5 w-5" />
                  <span>Clinical Analysis Results</span>
                </CardTitle>
                {renderUrgencyBadge(result.urgencyLevel)}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Predicted Conditions */}
              <div>
                <h4 className="text-lg font-semibold mb-3 text-gray-800">Predicted Conditions</h4>
                <div className="space-y-3">
                  {result.predictedConditions.map((condition, index) => (
                    <Card key={index} className="bg-white">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-semibold text-gray-800">
                            {healthCoachService.formatConditionName(condition.condition)}
                          </h5>
                          <Badge variant="outline" className={healthCoachService.getSeverityColor(condition.severity)}>
                            {condition.severity} severity
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {healthCoachService.getConditionDescription(condition.condition)}
                        </p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-blue-600">
                            Probability: {condition.probability}%
                          </span>
                          <span className="text-green-600">
                            Confidence: {condition.confidence}%
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Recommendations */}
              <div>
                <h4 className="text-lg font-semibold mb-3 text-gray-800">Recommendations</h4>
                <div className="space-y-2">
                  {result.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className="text-lg">{healthCoachService.getRecommendationIcon(recommendation)}</span>
                      <span className="text-gray-700">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Next Steps */}
              <div>
                <h4 className="text-lg font-semibold mb-3 text-gray-800">Next Steps</h4>
                <div className="space-y-2">
                  {result.nextSteps.map((step, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clinical Disclaimer */}
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="pt-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Clinical Disclaimer:</strong> This analysis utilizes advanced algorithms trained on medical data to identify potential clinical correlations. It is designed to provide information for educational purposes only and does not establish a doctor-patient relationship. The results should be discussed with a qualified healthcare provider who can perform proper clinical evaluation.
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DiseasePrediction; 