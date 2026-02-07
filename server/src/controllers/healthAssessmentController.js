import HealthAssessment from '../models/HealthAssessment.js';
import { logAccess } from '../utils/logger.js';

// Real disease data from CSV
const DISEASE_DATA = [
  { disease: 'Common Cold', casesPer10k: 850, ageGroup: '0-15', malePercentage: 48, seasonality: 'Winter', symptoms: ['Cough', 'Runny Nose', 'Sore Throat', 'Fatigue', 'Sneezing', 'Nasal Congestion'] },
  { disease: 'Influenza', casesPer10k: 420, ageGroup: '16-30', malePercentage: 47, seasonality: 'Winter', symptoms: ['Fever', 'Cough', 'Fatigue', 'Muscle Pain', 'Headache', 'Chills'] },
  { disease: 'Hypertension', casesPer10k: 380, ageGroup: '50+', malePercentage: 52, seasonality: 'Year-round', symptoms: ['Headache', 'Dizziness', 'Chest Pain', 'Shortness of Breath'] },
  { disease: 'Diabetes', casesPer10k: 330, ageGroup: '40+', malePercentage: 51, seasonality: 'Year-round', symptoms: ['Frequent Urination', 'Fatigue', 'Blurred Vision', 'Weight Loss', 'Loss of Appetite'] },
  { disease: 'Asthma', casesPer10k: 235, ageGroup: '20-40', malePercentage: 46, seasonality: 'Year-round', symptoms: ['Difficulty Breathing', 'Chest Pain', 'Cough', 'Wheezing', 'Shortness of Breath'] },
  { disease: 'COVID-19', casesPer10k: 210, ageGroup: '25-55', malePercentage: 51, seasonality: 'Year-round', symptoms: ['Fever', 'Cough', 'Fatigue', 'Loss of Taste or Smell', 'Difficulty Breathing', 'Chest Pain'] },
  { disease: 'Depression', casesPer10k: 190, ageGroup: '20-40', malePercentage: 35, seasonality: 'Year-round', symptoms: ['Fatigue', 'Loss of Appetite', 'Weight Loss', 'Memory Problems'] },
  { disease: 'Arthritis', casesPer10k: 170, ageGroup: '45+', malePercentage: 42, seasonality: 'Year-round', symptoms: ['Joint Pain', 'Muscle Pain', 'Back Pain', 'Stiffness', 'Swelling'] },
  { disease: 'Migraine', casesPer10k: 145, ageGroup: '25-45', malePercentage: 32, seasonality: 'Year-round', symptoms: ['Headache', 'Sensitivity to Light', 'Nausea', 'Blurred Vision'] },
  { disease: 'Allergic Rhinitis', casesPer10k: 135, ageGroup: '15-35', malePercentage: 45, seasonality: 'Spring', symptoms: ['Runny Nose', 'Sneezing', 'Watery Eyes', 'Itching', 'Nasal Congestion'] },
  { disease: 'Gastroenteritis', casesPer10k: 120, ageGroup: '5-25', malePercentage: 48, seasonality: 'Summer', symptoms: ['Nausea', 'Vomiting', 'Abdominal Pain', 'Diarrhea', 'Loss of Appetite'] },
  { disease: 'Bronchitis', casesPer10k: 115, ageGroup: '30-60', malePercentage: 52, seasonality: 'Winter', symptoms: ['Cough', 'Chest Pain', 'Fatigue', 'Difficulty Breathing', 'Wheezing'] },
  { disease: 'Urinary Tract Infection', casesPer10k: 90, ageGroup: '20-40', malePercentage: 22, seasonality: 'Year-round', symptoms: ['Frequent Urination', 'Burning Sensation', 'Lower Abdominal Pain', 'Cloudy Urine', 'Bloody Urine'] },
  { disease: 'Pneumonia', casesPer10k: 85, ageGroup: '0-10', malePercentage: 50, seasonality: 'Winter', symptoms: ['Fever', 'Cough', 'Chest Pain', 'Difficulty Breathing', 'Fatigue'] },
  { disease: 'Food Poisoning', casesPer10k: 75, ageGroup: 'All ages', malePercentage: 49, seasonality: 'Summer', symptoms: ['Nausea', 'Vomiting', 'Abdominal Pain', 'Diarrhea', 'Fever'] },
  { disease: 'Appendicitis', casesPer10k: 30, ageGroup: '10-30', malePercentage: 55, seasonality: 'Year-round', symptoms: ['Abdominal Pain', 'Nausea', 'Vomiting', 'Loss of Appetite', 'Fever'] }
];

// Available symptoms from JSON
const AVAILABLE_SYMPTOMS = {
  general: ['Fever', 'Fatigue', 'Chills', 'Weight Loss', 'Night Sweats', 'Loss of Appetite', 'Swelling'],
  respiratory: ['Cough', 'Difficulty Breathing', 'Sore Throat', 'Runny Nose', 'Chest Pain', 'Shortness of Breath', 'Wheezing', 'Sneezing', 'Nasal Congestion'],
  gastrointestinal: ['Nausea', 'Vomiting', 'Abdominal Pain', 'Diarrhea', 'Constipation', 'Bloody Stool', 'Lower Abdominal Pain'],
  neurological: ['Headache', 'Dizziness', 'Memory Problems', 'Blurred Vision', 'Numbness', 'Sensitivity to Light', 'Confusion', 'Seizure', 'Paralysis'],
  musculoskeletal: ['Muscle Pain', 'Joint Pain', 'Back Pain', 'Stiffness', 'Weakness'],
  other: ['Rash', 'Itching', 'Swollen Glands', 'Bloody Urine', 'Skin Discoloration', 'Ear Pain', 'Frequent Urination', 'Burning Sensation', 'Cloudy Urine', 'Loss of Taste or Smell', 'Watery Eyes', 'Unconsciousness', 'Severe Headache', 'Severe Abdominal Pain', 'Persistent Cough']
};

// Symptom severity weights
const SYMPTOM_WEIGHTS = {
  'Fever': 8,
  'Chest Pain': 9,
  'Difficulty Breathing': 9,
  'Severe Headache': 8,
  'Severe Abdominal Pain': 8,
  'Unconsciousness': 10,
  'Seizure': 9,
  'Paralysis': 9,
  'Bloody Stool': 7,
  'Bloody Urine': 7,
  'Confusion': 7,
  'Shortness of Breath': 8,
  'Headache': 5,
  'Cough': 4,
  'Fatigue': 3,
  'Nausea': 4,
  'Vomiting': 5,
  'Abdominal Pain': 6,
  'Diarrhea': 4,
  'Joint Pain': 5,
  'Muscle Pain': 4,
  'Rash': 3,
  'Runny Nose': 2,
  'Sore Throat': 3,
  'Dizziness': 4,
  'Loss of Appetite': 3,
  'Swelling': 4,
  'Chills': 3,
  'Weight Loss': 5,
  'Night Sweats': 4,
  'Blurred Vision': 6,
  'Constipation': 2,
  'Itching': 2,
  'Numbness': 5,
  'Swollen Glands': 4,
  'Memory Problems': 5,
  'Loss of Taste or Smell': 4,
  'Skin Discoloration': 4,
  'Ear Pain': 4,
  'Frequent Urination': 3,
  'Burning Sensation': 5,
  'Sneezing': 1,
  'Watery Eyes': 2,
  'Nasal Congestion': 2,
  'Sensitivity to Light': 4,
  'Cloudy Urine': 4,
  'Lower Abdominal Pain': 6,
  'Back Pain': 5,
  'Stiffness': 3,
  'Weakness': 5,
  'Wheezing': 6,
  'Persistent Cough': 5
};

// Age group mapping
const getAgeGroup = (age) => {
  if (age < 16) return '0-15';
  if (age < 31) return '16-30';
  if (age < 41) return '20-40';
  if (age < 46) return '25-45';
  if (age < 51) return '30-60';
  if (age < 61) return '45+';
  return '50+';
};

// Season detection
const getCurrentSeason = () => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'Spring';
  if (month >= 5 && month <= 7) return 'Summer';
  if (month >= 8 && month <= 10) return 'Winter';
  return 'Winter';
};

// Calculate disease probability based on symptoms, age, sex, and season
const calculateDiseaseProbability = (disease, symptoms, patientProfile) => {
  const patientSymptoms = symptoms.map(s => s.name);
  const diseaseSymptoms = disease.symptoms;
  
  // Calculate symptom match percentage
  const matchingSymptoms = diseaseSymptoms.filter(symptom => 
    patientSymptoms.some(patientSymptom => 
      patientSymptom.toLowerCase().includes(symptom.toLowerCase()) ||
      symptom.toLowerCase().includes(patientSymptom.toLowerCase())
    )
  );
  
  const symptomMatchPercentage = (matchingSymptoms.length / diseaseSymptoms.length) * 100;
  
  // Age factor
  const patientAgeGroup = getAgeGroup(patientProfile.age);
  const ageFactor = patientAgeGroup === disease.ageGroup ? 1.2 : 
                   patientAgeGroup.includes(disease.ageGroup) || disease.ageGroup.includes(patientAgeGroup) ? 1.1 : 0.8;
  
  // Sex factor
  const sexFactor = patientProfile.biologicalSex === 'male' ? 
                   (disease.malePercentage / 100) : 
                   ((100 - disease.malePercentage) / 100);
  
  // Season factor
  const currentSeason = getCurrentSeason();
  const seasonFactor = disease.seasonality === currentSeason ? 1.3 : 
                      disease.seasonality === 'Year-round' ? 1.0 : 0.7;
  
  // Base probability from disease prevalence
  const baseProbability = (disease.casesPer10k / 10000) * 100;
  
  // Calculate final probability
  let probability = baseProbability * symptomMatchPercentage * ageFactor * sexFactor * seasonFactor;
  
  // Cap probability at 95%
  probability = Math.min(probability, 95);
  
  return Math.round(probability);
};

// Calculate severity score
const calculateSeverityScore = (symptoms, overallSeverity) => {
  let totalWeight = 0;
  let maxWeight = 0;
  
  symptoms.forEach(symptom => {
    const weight = SYMPTOM_WEIGHTS[symptom.name] || 3;
    totalWeight += weight * symptom.severity;
    maxWeight += weight * 10; // Max severity is 10
  });
  
  // Normalize to 0-100 scale
  const normalizedScore = (totalWeight / maxWeight) * 100;
  
  // Factor in overall severity
  const finalScore = (normalizedScore * 0.7) + (overallSeverity * 10 * 0.3);
  
  return Math.round(Math.min(finalScore, 100));
};

// Determine urgency level
const determineUrgencyLevel = (severityScore, symptoms) => {
  const highUrgencySymptoms = ['Chest Pain', 'Difficulty Breathing', 'Severe Headache', 'Severe Abdominal Pain', 'Unconsciousness', 'Seizure', 'Paralysis'];
  const hasHighUrgencySymptom = symptoms.some(s => highUrgencySymptoms.includes(s.name));
  
  if (hasHighUrgencySymptom || severityScore >= 80) return 'emergency';
  if (severityScore >= 60) return 'high';
  if (severityScore >= 40) return 'medium';
  return 'low';
};

// Generate recommendations based on conditions and urgency
const generateRecommendations = (predictedConditions, urgencyLevel) => {
  const recommendations = [];
  
  if (urgencyLevel === 'emergency') {
    recommendations.push('🚨 Seek immediate medical attention - call emergency services');
    recommendations.push('⚠️ Do not delay treatment - symptoms indicate serious condition');
  } else if (urgencyLevel === 'high') {
    recommendations.push('🏥 Schedule urgent appointment with healthcare provider');
    recommendations.push('📞 Contact your doctor within 24 hours');
  } else if (urgencyLevel === 'medium') {
    recommendations.push('👨‍⚕️ Schedule appointment with primary care physician');
    recommendations.push('📋 Monitor symptoms and seek care if they worsen');
  } else {
    recommendations.push('💊 Consider over-the-counter treatments for symptom relief');
    recommendations.push('👀 Monitor symptoms and seek care if they persist beyond 1 week');
  }
  
  // Disease-specific recommendations
  predictedConditions.forEach(condition => {
    const disease = condition.condition.toLowerCase();
    if (disease.includes('covid')) {
      recommendations.push('🦠 Get tested for COVID-19 and follow isolation guidelines');
    } else if (disease.includes('diabetes')) {
      recommendations.push('🩸 Monitor blood glucose levels and consult endocrinologist');
    } else if (disease.includes('hypertension')) {
      recommendations.push('❤️ Monitor blood pressure regularly and reduce salt intake');
    } else if (disease.includes('asthma')) {
      recommendations.push('🫁 Use prescribed inhaler and avoid triggers');
    }
  });
  
  return recommendations;
};

// Generate next steps
const generateNextSteps = (urgencyLevel, predictedConditions) => {
  const nextSteps = [];
  
  if (urgencyLevel === 'emergency') {
    nextSteps.push('Call 911 or go to nearest emergency room immediately');
    nextSteps.push('Bring list of current medications and medical history');
  } else if (urgencyLevel === 'high') {
    nextSteps.push('Contact your primary care physician today');
    nextSteps.push('Prepare detailed symptom timeline for your appointment');
  } else {
    nextSteps.push('Schedule appointment with healthcare provider within 1 week');
    nextSteps.push('Keep symptom diary to track changes');
  }
  
  nextSteps.push('Bring this analysis report to your healthcare provider');
  nextSteps.push('Follow up with specialist if recommended');
  
  return nextSteps;
};

// Main analysis function
const analyzeSymptoms = (symptoms, patientProfile, overallSeverity) => {
  // Calculate disease probabilities
  const diseaseProbabilities = DISEASE_DATA.map(disease => ({
    condition: disease.disease,
    probability: calculateDiseaseProbability(disease, symptoms, patientProfile),
    severity: disease.casesPer10k > 300 ? 'high' : disease.casesPer10k > 150 ? 'medium' : 'low',
    confidence: Math.min(calculateDiseaseProbability(disease, symptoms, patientProfile) + 20, 95)
  })).filter(disease => disease.probability > 10); // Only include diseases with >10% probability
  
  // Sort by probability
  diseaseProbabilities.sort((a, b) => b.probability - a.probability);
  
  // Take top 5 most likely conditions
  const predictedConditions = diseaseProbabilities.slice(0, 5);
  
  // Calculate overall severity score
  const severityScore = calculateSeverityScore(symptoms, overallSeverity);
  
  // Determine urgency level
  const urgencyLevel = determineUrgencyLevel(severityScore, symptoms);
  
  // Generate recommendations and next steps
  const recommendations = generateRecommendations(predictedConditions, urgencyLevel);
  const nextSteps = generateNextSteps(urgencyLevel, predictedConditions);
  
  return {
    predictedConditions,
    severityScore,
    urgencyLevel,
    recommendations,
    nextSteps
  };
};

// Get available symptoms
export const getAvailableSymptoms = async (req, res) => {
  try {
    res.json({
      success: true,
      data: AVAILABLE_SYMPTOMS
    });
  } catch (error) {
    console.error('Error getting available symptoms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available symptoms'
    });
  }
};

// Create health assessment
export const createHealthAssessment = async (req, res) => {
  try {
    const {
      patientProfile,
      primaryConcern,
      symptomDuration,
      overallSeverity,
      symptomOnset,
      symptomProgression,
      symptoms,
      medicalHistory = [],
      medications = [],
      allergies = [],
      familyHistory = [],
      lifestyle = {}
    } = req.body;

    // Validate required fields
    if (!patientProfile || !symptoms || symptoms.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Patient profile and symptoms are required'
      });
    }

    // Perform clinical analysis
    const analysisResult = analyzeSymptoms(symptoms, patientProfile, overallSeverity || 5);

    // Create health assessment record
    const healthAssessment = new HealthAssessment({
      userId: req.user._id,
      patientProfile,
      primaryConcern: primaryConcern || 'General health assessment',
      symptomDuration,
      overallSeverity: overallSeverity || 5,
      symptomOnset,
      symptomProgression,
      symptoms,
      medicalHistory,
      medications,
      allergies,
      familyHistory,
      lifestyle,
      analysis: analysisResult
    });

    await healthAssessment.save();

    // Log access
    await logAccess(req.user._id, 'CREATE', 'HealthAssessment', healthAssessment._id, null, req, 'Created health assessment');

    res.status(201).json({
      success: true,
      message: 'Health assessment created successfully',
      data: {
        assessmentId: healthAssessment._id,
        analysis: analysisResult
      }
    });

  } catch (error) {
    console.error('Error creating health assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create health assessment'
    });
  }
};

// Get health assessment by ID
export const getHealthAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const assessment = await HealthAssessment.findById(id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Health assessment not found'
      });
    }

    // Check if user owns this assessment
    if (assessment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await logAccess(req.user._id, 'VIEW', 'HealthAssessment', assessment._id, null, req, 'Viewed health assessment');

    res.json({
      success: true,
      data: assessment
    });

  } catch (error) {
    console.error('Error getting health assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get health assessment'
    });
  }
};

// Get user's health assessments
export const getUserHealthAssessments = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const assessments = await HealthAssessment.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await HealthAssessment.countDocuments({ userId: req.user._id });

    await logAccess(req.user._id, 'VIEW', 'HealthAssessment', null, null, req, 'Viewed health assessments list');

    res.json({
      success: true,
      data: {
        assessments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error getting user health assessments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get health assessments'
    });
  }
};

// Update health assessment
export const updateHealthAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const assessment = await HealthAssessment.findById(id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Health assessment not found'
      });
    }

    // Check if user owns this assessment
    if (assessment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Re-analyze if symptoms changed
    if (updateData.symptoms && updateData.symptoms.length > 0) {
      const analysisResult = analyzeSymptoms(
        updateData.symptoms, 
        updateData.patientProfile || assessment.patientProfile,
        updateData.overallSeverity || assessment.overallSeverity || 5
      );
      updateData.analysis = analysisResult;
    }

    const updatedAssessment = await HealthAssessment.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );

    await logAccess(req.user._id, 'UPDATE', 'HealthAssessment', assessment._id, null, req, 'Updated health assessment');

    res.json({
      success: true,
      message: 'Health assessment updated successfully',
      data: updatedAssessment
    });

  } catch (error) {
    console.error('Error updating health assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update health assessment'
    });
  }
};

// Delete health assessment
export const deleteHealthAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const assessment = await HealthAssessment.findById(id);

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Health assessment not found'
      });
    }

    // Check if user owns this assessment
    if (assessment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await HealthAssessment.findByIdAndDelete(id);

    await logAccess(req.user._id, 'DELETE', 'HealthAssessment', assessment._id, null, req, 'Deleted health assessment');

    res.json({
      success: true,
      message: 'Health assessment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting health assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete health assessment'
    });
  }
};

// Get health assessment statistics
export const getHealthAssessmentStats = async (req, res) => {
  try {
    const totalAssessments = await HealthAssessment.countDocuments({ userId: req.user._id });
    const recentAssessments = await HealthAssessment.countDocuments({
      userId: req.user._id,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });

    const urgencyStats = await HealthAssessment.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: '$analysis.urgencyLevel', count: { $sum: 1 } } }
    ]);

    await logAccess(req.user._id, 'VIEW', 'HealthAssessment', null, null, req, 'Viewed health assessment statistics');

    res.json({
      success: true,
      data: {
        totalAssessments,
        recentAssessments,
        urgencyStats
      }
    });

  } catch (error) {
    console.error('Error getting health assessment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get health assessment statistics'
    });
  }
}; 