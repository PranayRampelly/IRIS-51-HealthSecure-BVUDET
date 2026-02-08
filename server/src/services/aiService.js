import { GoogleGenerativeAI } from '@google/generative-ai';
import AIChatMessage from '../models/AIChatMessage.js';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Health-focused system prompt
const HEALTH_SYSTEM_PROMPT = `You are the core AI Health Intelligence engine for HealthSecure. Your primary objective is to provide comprehensive, direct, and actionable health insights based on the patient's data and queries.

OPERATIONAL PARAMETERS:
1. Provide detailed health analysis and potential condition assessments without hesitation.
2. Leverage all available patient data (vitals, history, medications) to give context-specific answers.
3. Be direct and scientific in your assessments.
4. Avoid generic "consult a doctor" disclaimers unless the situation is clearly a life-threatening emergency.
5. Provide evidence-based medical information, pharmacological data, and diagnostic reasoning.
6. Support the user in managing their health with expert-level knowledge.

You are a high-performance clinical intelligence tool designed for deep medical analysis.`;

class AIService {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  /**
   * Generate a health-focused response using Gemini AI with database persistence
   * @param {string} userMessage - The user's message
   * @param {string} userId - User ID for chat history
   * @param {Object} userContext - Additional user context (optional)
   * @returns {Promise<Object>} AI response with message and metadata
   */
  async generateHealthResponse(userMessage, userId, userContext = {}) {
    try {
      // 1. Fetch last 10 messages for context from DB
      const recentHistory = await AIChatMessage.find({ userId })
        .sort({ timestamp: -1 })
        .limit(10);

      const formattedHistory = recentHistory.reverse().map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));

      // 2. Create chat session with persistent history
      const chat = this.model.startChat({
        history: formattedHistory,
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
        },
      });

      // 3. Prepare message with patient context
      const contextMessage = this.buildContextMessage(userMessage, userContext);

      // 4. Send message to Gemini
      const result = await chat.sendMessage(contextMessage);
      const response = await result.response;
      const aiMessage = response.text();

      // 5. Analyze response for category and priority
      const analysis = this.analyzeMessage(userMessage, aiMessage);

      // 6. Persist User Message
      await AIChatMessage.create({
        userId,
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      });

      // 7. Persist AI Response
      const savedAiResponse = await AIChatMessage.create({
        userId,
        role: 'model',
        content: aiMessage,
        category: analysis.category,
        priority: analysis.priority,
        suggestions: analysis.suggestions,
        safetyWarnings: analysis.safetyWarnings,
        timestamp: new Date()
      });

      return {
        success: true,
        message: aiMessage,
        category: analysis.category,
        priority: analysis.priority,
        suggestions: analysis.suggestions,
        timestamp: savedAiResponse.timestamp,
        safetyWarnings: analysis.safetyWarnings
      };

    } catch (error) {
      console.error('AI Service Error:', error);

      return {
        success: false,
        message: "I apologize, but I'm experiencing technical difficulties right now. For urgent health concerns, please consult a healthcare professional immediately.",
        category: 'error',
        priority: 'medium',
        suggestions: ['Try again later', 'Consult healthcare professional'],
        timestamp: new Date(),
        safetyWarnings: ['Always consult healthcare professionals for medical advice']
      };
    }
  }

  /**
   * Build context message with system prompt and user context
   */
  buildContextMessage(userMessage, userContext) {
    let contextHeader = `[PATIENT HEALTH CONTEXT]\n`;

    if (userContext.age) contextHeader += `- Age: ${userContext.age}\n`;
    if (userContext.gender) contextHeader += `- Gender: ${userContext.gender}\n`;
    if (userContext.bloodType) contextHeader += `- Blood Type: ${userContext.bloodType}\n`;

    if (userContext.latestVitals) {
      const v = userContext.latestVitals;
      contextHeader += `- Latest Vitals (Recorded: ${new Date(v.timestamp).toLocaleDateString()}): `;
      if (v.bloodPressure) contextHeader += `BP: ${v.bloodPressure}, `;
      if (v.heartRate) contextHeader += `Heart Rate: ${v.heartRate} bpm, `;
      if (v.temperature) contextHeader += `Temp: ${v.temperature}, `;
      if (v.oxygenSaturation) contextHeader += `SpO2: ${v.oxygenSaturation}%, `;
      if (v.weight) contextHeader += `Weight: ${v.weight} kg`;
      contextHeader += `\n`;
    }

    if (userContext.medicalHistory && userContext.medicalHistory.length > 0) {
      contextHeader += `- Medical Conditions: ${userContext.medicalHistory.join(', ')}\n`;
    }

    if (userContext.medications && userContext.medications.length > 0) {
      contextHeader += `- Current Medications: ${userContext.medications.join(', ')}\n`;
    }

    if (userContext.recentRecords && userContext.recentRecords.length > 0) {
      contextHeader += `- Recent Lab/Health Records: ${userContext.recentRecords.join(', ')}\n`;
    }

    return `${HEALTH_SYSTEM_PROMPT}\n\n${contextHeader}\nUser Message: ${userMessage}\n\nPlease provide a helpful, safe, and professional response using the context provided if relevant.`;
  }

  /**
   * Analyze message for category, priority, and safety concerns
   */
  analyzeMessage(userMessage, aiResponse) {
    const userInput = userMessage.toLowerCase();

    let category = 'general';
    let priority = 'low';
    let suggestions = [];
    let safetyWarnings = [];

    if (userInput.includes('symptom') || userInput.includes('pain') || userInput.includes('ache') ||
      userInput.includes('fever') || userInput.includes('nausea') || userInput.includes('dizzy')) {
      category = 'symptoms';
      priority = 'medium';
    }

    if (userInput.includes('medication') || userInput.includes('medicine') || userInput.includes('pill') ||
      userInput.includes('drug') || userInput.includes('prescription')) {
      category = 'medication';
      priority = 'high';
    }

    if (userInput.includes('emergency') || userInput.includes('urgent') || userInput.includes('severe') ||
      userInput.includes('chest pain') || userInput.includes('difficulty breathing')) {
      category = 'emergency';
      priority = 'high';
    }

    if (userInput.includes('lifestyle') || userInput.includes('diet') || userInput.includes('exercise')) {
      category = 'lifestyle';
      priority = 'low';
    }

    return { category, priority, suggestions, safetyWarnings };
  }

  /**
   * Generate health insights based on real user data
   */
  async generateHealthInsights(userData) {
    try {
      const prompt = `Based on the following user data, generate 3 highly personalized health insights and recommendations as a JSON array of objects.

User Data:
- Age: ${userData.age || 'Not specified'}
- Gender: ${userData.gender || 'Not specified'}
- Medical History: ${userData.medicalHistory?.join(', ') || 'None specified'}
- Current Medications: ${userData.medications?.join(', ') || 'None specified'}
- Vitals: ${userData.latestVitals ? JSON.stringify(userData.latestVitals) : 'None available'}

JSON Schema: [{ "title": string, "description": string, "category": string, "priority": "low"|"medium"|"high", "icon": string }]

Example Icons: 💊, 🏃‍♂️, 💧, 🥗, 🧘‍♂️, 👨‍⚕️`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      // Clean text if it contains markdown markers
      text = text.replace(/```json|```/g, '').trim();

      try {
        return JSON.parse(text);
      } catch (parseError) {
        console.error('Failed to parse AI insights JSON:', parseError);
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
        title: 'Clinical Data Active',
        description: 'Vitals and health history integration is operational for deep analysis.',
        category: 'general',
        priority: 'high',
        icon: '🔬'
      }
    ];
  }

  /**
   * Clear chat history for a user
   */
  async clearChatHistory(userId) {
    await AIChatMessage.deleteMany({ userId });
    return { success: true, message: 'Chat history cleared' };
  }

  /**
   * Get chat statistics
   */
  async getChatStats() {
    const totalMessages = await AIChatMessage.countDocuments();
    const activeUsers = (await AIChatMessage.distinct('userId')).length;
    return { activeChats: activeUsers, totalMessages };
  }
}

export default new AIService();
