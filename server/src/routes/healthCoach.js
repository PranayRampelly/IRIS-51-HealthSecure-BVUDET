import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  getAvailableSymptoms,
  createHealthAssessment,
  getHealthAssessment,
  getUserHealthAssessments,
  updateHealthAssessment,
  deleteHealthAssessment,
  getHealthAssessmentStats
} from '../controllers/healthAssessmentController.js';

const router = express.Router();

// Apply authentication to all routes
router.use(auth);

// Get available symptoms
router.get('/symptoms', getAvailableSymptoms);

// Health assessment CRUD operations
router.post('/assessment', createHealthAssessment);
router.get('/assessment/:id', getHealthAssessment);
router.get('/assessments', getUserHealthAssessments);
router.put('/assessment/:id', updateHealthAssessment);
router.delete('/assessment/:id', deleteHealthAssessment);

// Get health assessment statistics
router.get('/stats', getHealthAssessmentStats);

// Legacy endpoint for backward compatibility
router.post('/predict', async (req, res) => {
  try {
    const { symptoms } = req.body;
    
    if (!symptoms || !Array.isArray(symptoms)) {
      return res.status(400).json({
        success: false,
        message: 'Symptoms array is required'
      });
    }

    // Convert to new format and use the main assessment endpoint
    const assessmentData = {
      patientProfile: {
        age: 30,
        biologicalSex: 'male',
        weight: 70,
        height: 170
      },
      symptoms: symptoms.map(symptom => ({
        name: symptom,
        severity: 5,
        category: 'general'
      })),
      overallSeverity: 5
    };

    // Call the main assessment controller
    const result = await createHealthAssessment(req, res);
    
  } catch (error) {
    console.error('Error in legacy predict endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate prediction'
    });
  }
});

export default router; 