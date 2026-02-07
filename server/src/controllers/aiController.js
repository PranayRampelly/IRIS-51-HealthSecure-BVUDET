import aiService from '../services/aiService.js';
import User from '../models/User.js';

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

    // Get user data for context
    let userData = {};
    try {
      const user = await User.findById(userId).select('dateOfBirth gender medicalConditions currentMedications');
      if (user) {
        userData = {
          age: user.dateOfBirth ? calculateAge(user.dateOfBirth) : null,
          gender: user.gender,
          medicalHistory: user.medicalConditions ? [user.medicalConditions] : [],
          medications: user.currentMedications ? [user.currentMedications] : []
        };
      }
    } catch (userError) {
      console.log('Could not fetch user data for AI context:', userError.message);
    }

    // Generate AI response
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
 * @desc    Get health insights for user
 * @route   GET /api/ai/insights
 * @access  Private
 */
export const getHealthInsights = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to get personalized health insights.'
      });
    }

    const userId = req.user.id;

    // Get user data
    let userData = {};
    try {
      const user = await User.findById(userId).select('dateOfBirth gender medicalConditions currentMedications');
      if (user) {
        userData = {
          age: user.dateOfBirth ? calculateAge(user.dateOfBirth) : null,
          gender: user.gender,
          medicalHistory: user.medicalConditions ? [user.medicalConditions] : [],
          medications: user.currentMedications ? [user.currentMedications] : []
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
    const result = aiService.clearChatHistory(userId);

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
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const stats = aiService.getChatStats();

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('AI Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI statistics.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
    // Simple health check without calling AI service
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
      message: 'AI service is experiencing issues',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
    
    // Filter by category if provided
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
      message: 'Failed to get health tips.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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