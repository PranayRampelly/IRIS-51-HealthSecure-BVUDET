import apiService from './api';

export interface Symptom {
  name: string;
  severity: number;
  category: 'general' | 'respiratory' | 'gastrointestinal' | 'neurological' | 'musculoskeletal' | 'other';
}

export interface PatientProfile {
  age: number;
  biologicalSex: 'male' | 'female' | 'other';
  weight?: number;
  height?: number;
}

export interface HealthAssessment {
  patientProfile: PatientProfile;
  primaryConcern?: string;
  symptomDuration?: string;
  overallSeverity?: number;
  symptomOnset?: string;
  symptomProgression?: string;
  symptoms: Symptom[];
  medicalHistory?: Array<{ condition: string; isActive: boolean }>;
  medications?: Array<{ name: string }>;
  allergies?: Array<{ allergen: string }>;
  familyHistory?: Array<{ condition: string; relationship: string }>;
  lifestyleFactors?: {
    smoking?: 'non_smoker' | 'former_smoker' | 'current_smoker';
    alcohol?: 'none' | 'occasional' | 'moderate' | 'heavy';
    exercise?: 'sedentary' | 'light' | 'moderate' | 'active';
    diet?: 'standard' | 'vegetarian' | 'vegan' | 'keto' | 'paleo';
    sleepHours?: number;
  };
  analysisResult?: HealthAnalysis;
}

export interface PredictedCondition {
  condition: string;
  probability: number;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
}

export interface HealthAnalysis {
  predictedConditions: PredictedCondition[];
  severityScore: number;
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  recommendations: string[];
  nextSteps: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

class HealthCoachService {
  private apiService: any;

  constructor() {
    this.apiService = apiService;
  }

  // Get available symptoms from backend
  async getAvailableSymptoms(): Promise<ApiResponse<Record<string, string[]>>> {
    try {
      const response = await this.apiService.getAvailableSymptoms();
      return response;
    } catch (error) {
      console.error('Error fetching available symptoms:', error);
      throw error;
    }
  }

  // Create health assessment
  async createHealthAssessment(assessmentData: Partial<HealthAssessment>): Promise<ApiResponse<{ assessmentId: string; analysis: HealthAnalysis }>> {
    try {
      const response = await this.apiService.createHealthAssessment(assessmentData);
      return response;
    } catch (error) {
      console.error('Error creating health assessment:', error);
      throw error;
    }
  }

  // Get health assessment by ID
  async getHealthAssessment(id: string): Promise<ApiResponse<HealthAssessment>> {
    try {
      const response = await this.apiService.getHealthAssessment(id);
      return response;
    } catch (error) {
      console.error('Error fetching health assessment:', error);
      throw error;
    }
  }

  // Get user's health assessments
  async getUserHealthAssessments(page: number = 1, limit: number = 10): Promise<ApiResponse<{ assessments: HealthAssessment[]; pagination: any }>> {
    try {
      const response = await this.apiService.getUserHealthAssessments(page, limit);
      return response;
    } catch (error) {
      console.error('Error fetching user health assessments:', error);
      throw error;
    }
  }

  // Update health assessment
  async updateHealthAssessment(id: string, updateData: Partial<HealthAssessment>): Promise<ApiResponse<HealthAssessment>> {
    try {
      const response = await this.apiService.updateHealthAssessment(id, updateData);
      return response;
    } catch (error) {
      console.error('Error updating health assessment:', error);
      throw error;
    }
  }

  // Delete health assessment
  async deleteHealthAssessment(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.apiService.deleteHealthAssessment(id);
      return response;
    } catch (error) {
      console.error('Error deleting health assessment:', error);
      throw error;
    }
  }

  // Get health assessment statistics
  async getHealthAssessmentStats(): Promise<ApiResponse<{ totalAssessments: number; recentAssessments: number; urgencyStats: any[] }>> {
    try {
      const response = await this.apiService.getHealthAssessmentStats();
      return response;
    } catch (error) {
      console.error('Error fetching health assessment stats:', error);
      throw error;
    }
  }

  // Legacy method for backward compatibility
  async getHealthCoachPrediction(data: { symptoms: string[] }): Promise<HealthAnalysis> {
    try {
      // Convert simple symptom list to proper format
      const symptoms: Symptom[] = data.symptoms.map(symptom => ({
        name: symptom,
        severity: 5,
        category: this.categorizeSymptom(symptom)
      }));

      const assessmentData: Partial<HealthAssessment> = {
        patientProfile: {
          age: 30,
          biologicalSex: 'male',
          weight: 70,
          height: 170
        },
        symptoms,
        overallSeverity: 5
      };

      const response = await this.createHealthAssessment(assessmentData);
      return response.data!.analysis;
    } catch (error) {
      console.error('Error in legacy prediction:', error);
      throw error;
    }
  }

  // Helper method to categorize symptoms
  private categorizeSymptom(symptom: string): Symptom['category'] {
    const symptomLower = symptom.toLowerCase();

    if (['fever', 'fatigue', 'chills', 'weight loss', 'night sweats', 'loss of appetite', 'swelling'].includes(symptomLower)) {
      return 'general';
    } else if (['cough', 'difficulty breathing', 'sore throat', 'runny nose', 'chest pain', 'shortness of breath', 'wheezing', 'sneezing', 'nasal congestion'].includes(symptomLower)) {
      return 'respiratory';
    } else if (['nausea', 'vomiting', 'abdominal pain', 'diarrhea', 'constipation', 'bloody stool', 'lower abdominal pain'].includes(symptomLower)) {
      return 'gastrointestinal';
    } else if (['headache', 'dizziness', 'memory problems', 'blurred vision', 'numbness', 'sensitivity to light', 'confusion', 'seizure', 'paralysis'].includes(symptomLower)) {
      return 'neurological';
    } else if (['muscle pain', 'joint pain', 'back pain', 'stiffness', 'weakness'].includes(symptomLower)) {
      return 'musculoskeletal';
    } else {
      return 'other';
    }
  }

  // Utility methods for UI display
  getUrgencyColor(urgencyLevel: string): string {
    switch (urgencyLevel.toLowerCase()) {
      case 'emergency':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  getSeverityColor(severity: string): string {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  }

  formatConditionName(condition: string): string {
    // Convert condition names to proper case
    return condition
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  getConditionDescription(condition: string): string {
    const descriptions: Record<string, string> = {
      'Common Cold': 'A viral infection of the upper respiratory tract causing mild symptoms.',
      'Influenza': 'A contagious respiratory illness caused by influenza viruses.',
      'Hypertension': 'High blood pressure that can lead to serious health complications.',
      'Diabetes': 'A metabolic disorder affecting blood sugar regulation.',
      'Asthma': 'A chronic respiratory condition causing airway inflammation and constriction.',
      'COVID-19': 'A respiratory illness caused by the SARS-CoV-2 virus.',
      'Depression': 'A mental health disorder characterized by persistent sadness and loss of interest.',
      'Arthritis': 'Inflammation of joints causing pain and stiffness.',
      'Migraine': 'A neurological condition causing severe recurring headaches.',
      'Allergic Rhinitis': 'An allergic response causing nasal inflammation and symptoms.',
      'Gastroenteritis': 'Inflammation of the stomach and intestines causing digestive symptoms.',
      'Bronchitis': 'Inflammation of the bronchial tubes in the lungs.',
      'Urinary Tract Infection': 'Bacterial infection in the urinary system.',
      'Pneumonia': 'Infection causing inflammation of the air sacs in the lungs.',
      'Food Poisoning': 'Illness caused by consuming contaminated food.',
      'Appendicitis': 'Inflammation of the appendix requiring surgical intervention.'
    };

    return descriptions[condition] || 'A medical condition requiring professional evaluation.';
  }

  getRecommendationIcon(recommendation: string): string {
    if (recommendation.includes('emergency') || recommendation.includes('immediate')) {
      return '🚨';
    } else if (recommendation.includes('urgent') || recommendation.includes('24 hours')) {
      return '🏥';
    } else if (recommendation.includes('appointment') || recommendation.includes('doctor')) {
      return '👨‍⚕️';
    } else if (recommendation.includes('monitor') || recommendation.includes('watch')) {
      return '👀';
    } else if (recommendation.includes('over-the-counter') || recommendation.includes('OTC')) {
      return '💊';
    } else if (recommendation.includes('test') || recommendation.includes('COVID')) {
      return '🦠';
    } else if (recommendation.includes('blood') || recommendation.includes('glucose')) {
      return '🩸';
    } else if (recommendation.includes('pressure') || recommendation.includes('hypertension')) {
      return '❤️';
    } else if (recommendation.includes('asthma') || recommendation.includes('inhaler')) {
      return '🫁';
    } else {
      return '📋';
    }
  }

  // Get symptom categories for UI organization
  getSymptomCategories(): Record<string, string[]> {
    return {
      general: ['Fever', 'Fatigue', 'Chills', 'Weight Loss', 'Night Sweats', 'Loss of Appetite', 'Swelling'],
      respiratory: ['Cough', 'Difficulty Breathing', 'Sore Throat', 'Runny Nose', 'Chest Pain', 'Shortness of Breath', 'Wheezing', 'Sneezing', 'Nasal Congestion'],
      gastrointestinal: ['Nausea', 'Vomiting', 'Abdominal Pain', 'Diarrhea', 'Constipation', 'Bloody Stool', 'Lower Abdominal Pain'],
      neurological: ['Headache', 'Dizziness', 'Memory Problems', 'Blurred Vision', 'Numbness', 'Sensitivity to Light', 'Confusion', 'Seizure', 'Paralysis'],
      musculoskeletal: ['Muscle Pain', 'Joint Pain', 'Back Pain', 'Stiffness', 'Weakness'],
      other: ['Rash', 'Itching', 'Swollen Glands', 'Bloody Urine', 'Skin Discoloration', 'Ear Pain', 'Frequent Urination', 'Burning Sensation', 'Cloudy Urine', 'Loss of Taste or Smell', 'Watery Eyes', 'Unconsciousness', 'Severe Headache', 'Severe Abdominal Pain', 'Persistent Cough']
    };
  }

  // Get category display names
  getCategoryDisplayName(category: string): string {
    const displayNames: Record<string, string> = {
      general: 'General Symptoms',
      respiratory: 'Respiratory Symptoms',
      gastrointestinal: 'Gastrointestinal Symptoms',
      neurological: 'Neurological Symptoms',
      musculoskeletal: 'Musculoskeletal Symptoms',
      other: 'Other Symptoms'
    };
    return displayNames[category] || category;
  }

  // Get category icon
  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      general: '🏥',
      respiratory: '🫁',
      gastrointestinal: '🩺',
      neurological: '🧠',
      musculoskeletal: '💪',
      other: '📋'
    };
    return icons[category] || '📋';
  }
}

const healthCoachService = new HealthCoachService();
export default healthCoachService; 