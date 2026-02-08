import api from './api';

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  category?: 'general' | 'symptoms' | 'medication' | 'lifestyle' | 'emergency' | 'error';
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
      console.log('Sending message to AI:', message);
      const response = await api.post(`${this.baseURL}/chat`, {
        message,
        userContext
      });

      console.log('AI Chat Response:', response);

      // Handle both {success, data} and raw data if necessary
      if (response && response.success) {
        return response.data;
      } else {
        throw new Error(response?.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('AI Assistant Service Error:', error);
      throw error;
    }
  }

  /**
   * Get personalized health insights
   */
  async getHealthInsights(): Promise<HealthInsight[]> {
    try {
      console.log('Fetching health insights...');
      const response = await api.get(`${this.baseURL}/insights`);

      console.log('Health Insights Response:', response);

      if (response && response.success) {
        return response.data;
      } else {
        throw new Error(response?.message || 'Failed to get health insights');
      }
    } catch (error) {
      console.error('Health Insights Error:', error);
      // Return default insights on error
      throw error;
    }
  }

  /**
   * Get health tips by category
   */
  async getHealthTips(category?: string): Promise<HealthInsight[]> {
    try {
      console.log('Fetching health tips for category:', category);
      const params = category ? { category } : {};
      const response = await api.get(`${this.baseURL}/tips`, { params });

      console.log('Health Tips Response:', response);

      if (response && response.success) {
        return response.data;
      } else {
        throw new Error(response?.message || 'Failed to get health tips');
      }
    } catch (error) {
      console.error('Health Tips Error:', error);
      throw error;
    }
  }

  /**
   * Get chat history for the current user
   */
  async getChatHistory(): Promise<ChatMessage[]> {
    try {
      console.log('Fetching chat history...');
      const response = await api.get(`${this.baseURL}/chat/history`);

      console.log('Chat History Response:', response);

      if (response && response.success) {
        // Map backend Date strings to Date objects
        if (Array.isArray(response.data)) {
          return response.data.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
        }
        return []; // Return empty array if data is not an array
      } else {
        throw new Error(response?.message || 'Failed to get chat history');
      }
    } catch (error) {
      console.error('Get Chat History Error:', error);
      throw error;
    }
  }

  /**
   * Clear chat history
   */

  /**
   * Check AI service health
   */
  async checkAIHealth(): Promise<{ status: string; responseTime: string; model: string }> {
    try {
      const response = await api.get(`${this.baseURL}/health`);
      console.log('AI Health Check Result:', response);

      if (response && (response.success || response.status === 'operational')) {
        return response.data || response;
      } else {
        throw new Error(response?.message || 'AI service health check failed');
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
        message: "If you're experiencing a medical emergency, please call emergency services immediately (911 in the US). I can provide direct analysis for non-life-threatening issues, but serious symptoms require immediate professional clinical attention.",
        category: 'emergency',
        priority: 'high',
        suggestions: ['Call emergency services immediately', 'Seek immediate medical attention'],
        timestamp: new Date(),
        safetyWarnings: ['For emergencies, call 911 or emergency services immediately']
      };
    }

    return {
      success: true,
      message: "I'm processing your query. As an advanced clinical assistant, I'll provide a direct analysis once the connection is restored.",
      category: 'general',
      priority: 'low',
      suggestions: ['Check connection', 'Try again later'],
      timestamp: new Date(),
      safetyWarnings: []
    };
  }
}

export default new AIAssistantService(); 