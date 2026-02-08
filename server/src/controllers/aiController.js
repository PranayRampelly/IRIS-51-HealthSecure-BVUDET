import aiService from '../services/aiService.js';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import HealthRecord from '../models/HealthRecord.js';
import AIChatMessage from '../models/AIChatMessage.js';

/**
 * @desc    Send message to AI Health Assistant
 * @route   POST /api/ai/chat
 * @access  Private
 */
export const sendMessage = async (req, res) => {
  try {
    const { message, userContext } = req.body;
    const userId = req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // 1. Get user and clinical data for context
    let userData = {};
    try {
      const user = await User.findById(userId).select('dateOfBirth gender medicalConditions currentMedications bloodType email');
      if (user) {
        // Fetch clinical data from Patient model
        const patient = await Patient.findOne({ email: user.email });

        // Fetch recent health records
        const recentRecords = await HealthRecord.find({ patientId: userId })
          .sort({ date: -1 })
          .limit(3)
          .select('type title date description');

        userData = {
          age: user.dateOfBirth ? calculateAge(user.dateOfBirth) : null,
          gender: user.gender,
          bloodType: user.bloodType || (patient ? patient.bloodType : null),
          medicalHistory: user.medicalConditions ? [user.medicalConditions] : (patient ? [patient.primaryDiagnosis, ...(patient.secondaryDiagnosis || [])].filter(Boolean) : []),
          medications: user.currentMedications ? [user.currentMedications] : (patient ? patient.currentMedications.map(m => m.medication) : []),
          latestVitals: patient && patient.vitalSigns && patient.vitalSigns.length > 0
            ? patient.vitalSigns[patient.vitalSigns.length - 1]
            : null,
          recentRecords: recentRecords.map(r => `${r.type}: ${r.title} (${new Date(r.date).toLocaleDateString()})`)
        };
      }
    } catch (userError) {
      console.error('Could not fetch user data for AI context:', userError.message);
    }

    // 2. Generate AI response
    const response = await aiService.generateHealthResponse(
      message.trim(),
      userId,
      { ...userData, ...userContext }
    );

    res.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process message. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get chat history for user
 * @route   GET /api/ai/chat/history
 * @access  Private
 */
export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await AIChatMessage.find({ userId })
      .sort({ timestamp: 1 })
      .limit(50);

    // Map to frontend format
    const formattedHistory = history.map(msg => ({
      id: msg._id,
      type: msg.role === 'user' ? 'user' : 'ai',
      content: msg.content,
      category: msg.category,
      priority: msg.priority,
      suggestions: msg.suggestions,
      timestamp: msg.timestamp,
      safetyWarnings: msg.safetyWarnings
    }));

    res.json({
      success: true,
      data: formattedHistory
    });
  } catch (error) {
    console.error('Get Chat History Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat history.'
    });
  }
};

/**
 * @desc    Get health insights for user
 * @route   GET /api/ai/insights
 * @access  Private
 */
export const getHealthInsights = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user data for insights context
    let userData = {};
    try {
      const user = await User.findById(userId).select('dateOfBirth gender medicalConditions currentMedications email');
      if (user) {
        const patient = await Patient.findOne({ email: user.email });
        userData = {
          age: user.dateOfBirth ? calculateAge(user.dateOfBirth) : null,
          gender: user.gender,
          medicalHistory: user.medicalConditions ? [user.medicalConditions] : (patient ? [patient.primaryDiagnosis].filter(Boolean) : []),
          medications: user.currentMedications ? [user.currentMedications] : (patient ? patient.currentMedications.map(m => m.medication) : []),
          latestVitals: patient && patient.vitalSigns && patient.vitalSigns.length > 0
            ? patient.vitalSigns[patient.vitalSigns.length - 1]
            : null
        };
      }
    } catch (userError) {
      console.log('Could not fetch user data for insights:', userError.message);
    }

    // Generate insights
    const insights = await aiService.generateHealthInsights(userData);

    res.json({
      success: true,
      data: insights
    });

  } catch (error) {
    console.error('Health Insights Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate health insights.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Clear chat history for user
 * @route   DELETE /api/ai/chat/history
 * @access  Private
 */
export const clearChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await aiService.clearChatHistory(userId);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Clear Chat History Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear chat history.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get AI chat statistics (admin only)
 * @route   GET /api/ai/stats
 * @access  Private (Admin)
 */
export const getAIStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const stats = await aiService.getChatStats();

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('AI Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI statistics.'
    });
  }
};

/**
 * @desc    Test AI service health
 * @route   GET /api/ai/health
 * @access  Public
 */
export const checkAIHealth = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'AI service is healthy',
      data: {
        status: 'operational',
        responseTime: 'immediate',
        model: 'gemini-1.5-flash',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('AI Health Check Error:', error);
    res.status(503).json({
      success: false,
      message: 'AI service is experiencing issues'
    });
  }
};

/**
 * @desc    Get quick health tips
 * @route   GET /api/ai/tips
 * @access  Private
 */
export const getHealthTips = async (req, res) => {
  try {
    const { category } = req.query;
    const tips = aiService.getDefaultInsights();
    const filteredTips = category
      ? tips.filter(tip => tip.category === category)
      : tips;

    res.json({
      success: true,
      data: filteredTips
    });

  } catch (error) {
    console.error('Health Tips Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get health tips.'
    });
  }
};

// Helper function to calculate age
function calculateAge(dateOfBirth) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}
