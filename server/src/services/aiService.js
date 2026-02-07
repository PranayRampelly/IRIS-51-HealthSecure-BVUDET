import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Health-focused system prompt
const HEALTH_SYSTEM_PROMPT = `You are a professional AI Health Assistant for HealthSecure, a healthcare platform. Your role is to provide helpful, accurate, and safe health information while always emphasizing the importance of consulting healthcare professionals for medical advice.

IMPORTANT GUIDELINES:
1. Always provide general health information only
2. Never give specific medical diagnoses
3. Always recommend consulting healthcare professionals for medical advice
4. Be empathetic and supportive
5. Use clear, easy-to-understand language
6. Prioritize safety and encourage professional medical consultation
7. Provide evidence-based information when possible
8. Be culturally sensitive and inclusive

CAPABILITIES:
- Symptom explanation and general guidance
- Medication information and safety tips
- Lifestyle and wellness recommendations
- Health education and prevention tips
- Emergency guidance (always direct to emergency services for serious issues)
- General health questions and clarifications

RESPONSE STYLE:
- Professional yet friendly
- Educational and informative
- Safety-focused
- Encouraging of professional consultation
- Clear and concise
- Supportive and empathetic

Remember: You are a health information assistant, not a replacement for professional medical care.`;

class AIService {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    this.chatHistory = new Map(); // Store chat history per user
  }

  /**
   * Generate a health-focused response using Gemini AI
   * @param {string} userMessage - The user's message
   * @param {string} userId - User ID for chat history
   * @param {Object} userContext - Additional user context (optional)
   * @returns {Promise<Object>} AI response with message and metadata
   */
  async generateHealthResponse(userMessage, userId, userContext = {}) {
    try {
      // Get or create chat history for this user
      if (!this.chatHistory.has(userId)) {
        this.chatHistory.set(userId, []);
      }
      const chatHistory = this.chatHistory.get(userId);

      // Create chat session
      const chat = this.model.startChat({
        history: chatHistory,
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
        },
      });

      // Prepare the message with context
      const contextMessage = this.buildContextMessage(userMessage, userContext);
      
      // Send message to Gemini
      const result = await chat.sendMessage(contextMessage);
      const response = await result.response;
      const aiMessage = response.text();

      // Update chat history
      chatHistory.push(
        { role: "user", parts: [{ text: userMessage }] },
        { role: "model", parts: [{ text: aiMessage }] }
      );

      // Keep only last 10 messages to manage memory
      if (chatHistory.length > 20) {
        chatHistory.splice(0, 2);
      }

      // Analyze message category and priority
      const analysis = this.analyzeMessage(userMessage, aiMessage);

      return {
        success: true,
        message: aiMessage,
        category: analysis.category,
        priority: analysis.priority,
        suggestions: analysis.suggestions,
        timestamp: new Date(),
        safetyWarnings: analysis.safetyWarnings
      };

    } catch (error) {
      console.error('AI Service Error:', error);
      
      // Fallback response for errors
      return {
        success: false,
        message: "I apologize, but I'm experiencing technical difficulties right now. Please try again in a moment, or contact our support team if the issue persists. For urgent health concerns, please consult a healthcare professional immediately.",
        category: 'error',
        priority: 'medium',
        suggestions: ['Try again later', 'Contact support', 'Consult healthcare professional'],
        timestamp: new Date(),
        safetyWarnings: ['Always consult healthcare professionals for medical advice']
      };
    }
  }

  /**
   * Build context message with system prompt and user context
   */
  buildContextMessage(userMessage, userContext) {
    let contextMessage = HEALTH_SYSTEM_PROMPT + "\n\n";
    
    if (userContext.age) {
      contextMessage += `User Age: ${userContext.age}\n`;
    }
    if (userContext.gender) {
      contextMessage += `User Gender: ${userContext.gender}\n`;
    }
    if (userContext.medicalHistory && userContext.medicalHistory.length > 0) {
      contextMessage += `Medical History: ${userContext.medicalHistory.join(', ')}\n`;
    }
    if (userContext.medications && userContext.medications.length > 0) {
      contextMessage += `Current Medications: ${userContext.medications.join(', ')}\n`;
    }
    
    contextMessage += `\nUser Message: ${userMessage}\n\nPlease provide a helpful, safe, and professional response.`;
    
    return contextMessage;
  }

  /**
   * Analyze message for category, priority, and safety concerns
   */
  analyzeMessage(userMessage, aiResponse) {
    const userInput = userMessage.toLowerCase();
    const aiOutput = aiResponse.toLowerCase();
    
    let category = 'general';
    let priority = 'low';
    let suggestions = [];
    let safetyWarnings = [];

    // Category detection
    if (userInput.includes('symptom') || userInput.includes('pain') || userInput.includes('ache') || 
        userInput.includes('fever') || userInput.includes('nausea') || userInput.includes('dizzy')) {
      category = 'symptoms';
      priority = 'medium';
      suggestions.push('Describe symptoms in detail', 'Note duration and severity', 'Monitor for changes');
    }
    
    if (userInput.includes('medication') || userInput.includes('medicine') || userInput.includes('pill') || 
        userInput.includes('drug') || userInput.includes('prescription')) {
      category = 'medication';
      priority = 'high';
      suggestions.push('Consult pharmacist', 'Check with doctor', 'Read medication guide');
      safetyWarnings.push('Always consult healthcare professionals about medications');
    }
    
    if (userInput.includes('emergency') || userInput.includes('urgent') || userInput.includes('severe') || 
        userInput.includes('chest pain') || userInput.includes('difficulty breathing')) {
      category = 'emergency';
      priority = 'high';
      suggestions.push('Call emergency services immediately', 'Seek immediate medical attention');
      safetyWarnings.push('For emergencies, call 911 or emergency services immediately');
    }
    
    if (userInput.includes('lifestyle') || userInput.includes('diet') || userInput.includes('exercise') || 
        userInput.includes('sleep') || userInput.includes('stress') || userInput.includes('wellness')) {
      category = 'lifestyle';
      priority = 'low';
      suggestions.push('Start small changes', 'Set realistic goals', 'Track progress');
    }

    // Safety warning detection
    if (aiOutput.includes('consult') || aiOutput.includes('doctor') || aiOutput.includes('professional')) {
      safetyWarnings.push('Always consult healthcare professionals for medical advice');
    }

    return {
      category,
      priority,
      suggestions,
      safetyWarnings
    };
  }

  /**
   * Generate health insights based on user data
   */
  async generateHealthInsights(userData) {
    try {
      const prompt = `Based on the following user data, generate 2-3 personalized health insights and recommendations:

User Data:
- Age: ${userData.age || 'Not specified'}
- Gender: ${userData.gender || 'Not specified'}
- Medical History: ${userData.medicalHistory?.join(', ') || 'None specified'}
- Current Medications: ${userData.medications?.join(', ') || 'None specified'}
- Lifestyle: ${userData.lifestyle || 'Not specified'}

Please provide:
1. Hydration recommendations
2. Medication reminders (if applicable)
3. Lifestyle tips
4. General wellness advice

Format as JSON with fields: title, description, category, priority, icon.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Try to parse JSON, fallback to structured response if needed
      try {
        return JSON.parse(text);
      } catch (parseError) {
        // Fallback to default insights
        return this.getDefaultInsights();
      }

    } catch (error) {
      console.error('Error generating health insights:', error);
      return this.getDefaultInsights();
    }
  }

  /**
   * Get default health insights
   */
  getDefaultInsights() {
    return [
      {
        title: 'Stay Hydrated',
        description: 'Drink 8-10 glasses of water daily for optimal health.',
        category: 'lifestyle',
        priority: 'medium',
        icon: '💧'
      },
      {
        title: 'Regular Exercise',
        description: 'Aim for at least 150 minutes of moderate exercise per week.',
        category: 'lifestyle',
        priority: 'medium',
        icon: '🏃‍♂️'
      },
      {
        title: 'Consult Healthcare Provider',
        description: 'Always consult with healthcare professionals for medical advice.',
        category: 'general',
        priority: 'high',
        icon: '👨‍⚕️'
      }
    ];
  }

  /**
   * Clear chat history for a user
   */
  clearChatHistory(userId) {
    this.chatHistory.delete(userId);
    return { success: true, message: 'Chat history cleared' };
  }

  /**
   * Get chat statistics
   */
  getChatStats() {
    return {
      activeChats: this.chatHistory.size,
      totalMessages: Array.from(this.chatHistory.values()).reduce((sum, history) => sum + history.length, 0)
    };
  }
}

export default new AIService(); 