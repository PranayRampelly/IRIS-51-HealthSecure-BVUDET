import dotenv from 'dotenv';
import aiService from './src/services/aiService.js';

// Load environment variables
dotenv.config();

console.log('Testing AI Service...');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Set' : 'Not set');

async function testAIService() {
  try {
    console.log('\n1. Testing AI Health Check...');
    
    // Test with a simple message
    const response = await aiService.generateHealthResponse(
      'Hello, this is a test message.',
      'test-user-123',
      { age: 30, gender: 'male' }
    );

    console.log('✅ AI Response:', response);
    
    console.log('\n2. Testing Health Insights...');
    const insights = await aiService.generateHealthInsights({
      age: 30,
      gender: 'male',
      medicalHistory: ['None'],
      medications: ['None'],
      lifestyle: 'Active'
    });
    
    console.log('✅ Health Insights:', insights);
    
    console.log('\n3. Testing Chat Stats...');
    const stats = aiService.getChatStats();
    console.log('✅ Chat Stats:', stats);
    
    console.log('\n🎉 All tests passed! AI service is working correctly.');
    
  } catch (error) {
    console.error('❌ AI Service Test Failed:', error.message);
    
    if (error.message.includes('API key')) {
      console.log('\n💡 To fix this:');
      console.log('1. Get a Gemini API key from: https://makersuite.google.com/app/apikey');
      console.log('2. Add it to your .env file: GEMINI_API_KEY=your_key_here');
    }
  }
}

testAIService(); 