import api from './api';

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  category?: 'general' | 'symptoms' | 'medication' | 'lifestyle' | 'emergency';
}

export interface AIResponse {
  success: boolean;
  message: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  suggestions: string[];
  timestamp: Date;
  safetyWarnings: string[];
}

export interface HealthInsight {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  icon: string;
}

export interface UserContext {
  age?: number;
  gender?: string;
  medicalHistory?: string[];
  medications?: string[];
  lifestyle?: string;
}

class AIAssistantService {
  private baseURL = '/ai';

  /**
   * Send a message to the AI Health Assistant
   */
  async sendMessage(message: string, userContext?: UserContext): Promise<AIResponse> {
    try {
      const response = await api.post(`${this.baseURL}/chat`, {
        message,
        userContext
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('AI Assistant Service Error:', error);
      throw new Error('Failed to communicate with AI assistant. Please try again.');
    }
  }

  /**
   * Get personalized health insights
   */
  async getHealthInsights(): Promise<HealthInsight[]> {
    try {
      const response = await api.get(`${this.baseURL}/insights`);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to get health insights');
      }
    } catch (error) {
      console.error('Health Insights Error:', error);
      // Return default insights on error
      return this.getDefaultInsights();
    }
  }

  /**
   * Get health tips by category
   */
  async getHealthTips(category?: string): Promise<HealthInsight[]> {
    try {
      const params = category ? { category } : {};
      const response = await api.get(`${this.baseURL}/tips`, { params });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to get health tips');
      }
    } catch (error) {
      console.error('Health Tips Error:', error);
      return this.getDefaultInsights();
    }
  }

  /**
   * Clear chat history
   */
  async clearChatHistory(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`${this.baseURL}/chat/history`);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to clear chat history');
      }
    } catch (error) {
      console.error('Clear Chat History Error:', error);
      throw new Error('Failed to clear chat history. Please try again.');
    }
  }

  /**
   * Check AI service health
   */
  async checkAIHealth(): Promise<{ status: string; responseTime: string; model: string }> {
    try {
      const response = await api.get(`${this.baseURL}/health`);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'AI service health check failed');
      }
    } catch (error) {
      console.error('AI Health Check Error:', error);
      throw new Error('AI service is currently unavailable');
    }
  }

  /**
   * Get default health insights (fallback)
   */
  private getDefaultInsights(): HealthInsight[] {
    return [
      {
        id: '1',
        title: 'Stay Hydrated',
        description: 'Drink 8-10 glasses of water daily for optimal health.',
        category: 'lifestyle',
        priority: 'medium',
        icon: '💧'
      },
      {
        id: '2',
        title: 'Regular Exercise',
        description: 'Aim for at least 150 minutes of moderate exercise per week.',
        category: 'lifestyle',
        priority: 'medium',
        icon: '🏃‍♂️'
      },
      {
        id: '3',
        title: 'Consult Healthcare Provider',
        description: 'Always consult with healthcare professionals for medical advice.',
        category: 'general',
        priority: 'high',
        icon: '👨‍⚕️'
      },
      {
        id: '4',
        title: 'Medication Safety',
        description: 'Take medications as prescribed and consult your doctor about any side effects.',
        category: 'medication',
        priority: 'high',
        icon: '💊'
      }
    ];
  }

  /**
   * Generate a mock AI response for testing (when API is not available)
   */
  generateMockResponse(userInput: string): AIResponse {
    const input = userInput.toLowerCase();
    
    if (input.includes('symptom') || input.includes('pain') || input.includes('ache')) {
      return {
        success: true,
        message: "I understand you're experiencing symptoms. While I can provide general information, it's important to consult with a healthcare professional for proper diagnosis. Could you tell me more about your symptoms, their duration, and severity?",
        category: 'symptoms',
        priority: 'medium',
        suggestions: ['Describe symptoms in detail', 'Note duration and severity', 'Monitor for changes'],
        timestamp: new Date(),
        safetyWarnings: ['Always consult healthcare professionals for medical advice']
      };
    }
    
    if (input.includes('medication') || input.includes('medicine') || input.includes('pill')) {
      return {
        success: true,
        message: "I can help you understand your medications, but always consult your doctor or pharmacist for specific medical advice. What would you like to know about your medications?",
        category: 'medication',
        priority: 'high',
        suggestions: ['Consult pharmacist', 'Check with doctor', 'Read medication guide'],
        timestamp: new Date(),
        safetyWarnings: ['Always consult healthcare professionals about medications']
      };
    }
    
    if (input.includes('lifestyle') || input.includes('diet') || input.includes('exercise')) {
      return {
        success: true,
        message: "Great question about lifestyle! I can provide general wellness tips. A balanced diet, regular exercise, adequate sleep, and stress management are key to good health. What specific area would you like to focus on?",
        category: 'lifestyle',
        priority: 'low',
        suggestions: ['Start small changes', 'Set realistic goals', 'Track progress'],
        timestamp: new Date(),
        safetyWarnings: []
      };
    }
    
    if (input.includes('emergency') || input.includes('urgent')) {
      return {
        success: true,
        message: "If you're experiencing a medical emergency, please call emergency services immediately (911 in the US). I can provide general guidance, but serious symptoms require immediate professional medical attention.",
        category: 'emergency',
        priority: 'high',
        suggestions: ['Call emergency services immediately', 'Seek immediate medical attention'],
        timestamp: new Date(),
        safetyWarnings: ['For emergencies, call 911 or emergency services immediately']
      };
    }
    
    return {
      success: true,
      message: "Thank you for your question. I'm here to provide general health information and guidance. For specific medical advice, please consult with your healthcare provider. How else can I assist you today?",
      category: 'general',
      priority: 'low',
      suggestions: ['Ask specific questions', 'Provide more context'],
      timestamp: new Date(),
      safetyWarnings: ['Always consult healthcare professionals for medical advice']
    };
  }
}

export default new AIAssistantService(); 