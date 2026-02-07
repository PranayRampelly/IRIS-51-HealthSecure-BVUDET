import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import aiAssistantService, { ChatMessage, HealthInsight, AIResponse } from '@/services/aiAssistantService';
import { 
  Brain, 
  MessageSquare, 
  Stethoscope, 
  Activity, 
  Heart, 
  Pill, 
  Calendar,
  Clock,
  User,
  Sparkles,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
  Send,
  Bot,
  Zap,
  Target,
  BarChart3,
  FileText,
  Shield,
  Star
} from 'lucide-react';

const PatientAIAssistant: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I'm your AI Health Assistant. I'm here to help you with health-related questions, symptom analysis, medication guidance, and lifestyle recommendations. How can I assist you today?",
      timestamp: new Date(),
      category: 'general'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [healthInsights, setHealthInsights] = useState<HealthInsight[]>([]);
  const [aiServiceStatus, setAiServiceStatus] = useState<'online' | 'offline'>('offline');

  const quickActions = [
    { label: 'Symptom Checker', icon: <Stethoscope className="w-4 h-4" />, action: () => handleQuickAction('symptom') },
    { label: 'Medication Guide', icon: <Pill className="w-4 h-4" />, action: () => handleQuickAction('medication') },
    { label: 'Lifestyle Tips', icon: <Heart className="w-4 h-4" />, action: () => handleQuickAction('lifestyle') },
    { label: 'Emergency Help', icon: <AlertTriangle className="w-4 h-4" />, action: () => handleQuickAction('emergency') },
  ];

  // Load health insights and check AI service status on component mount
  useEffect(() => {
    checkAIServiceStatus();
    if (user) {
      loadHealthInsights();
    }
  }, [user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadHealthInsights = async () => {
    if (!user) {
      // Use fallback insights when not authenticated
      setHealthInsights([
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
          title: 'Consult Healthcare Provider',
          description: 'Always consult with healthcare professionals for medical advice.',
          category: 'general',
          priority: 'high',
          icon: '👨‍⚕️'
        }
      ]);
      return;
    }

    try {
      const insights = await aiAssistantService.getHealthInsights();
      setHealthInsights(insights);
    } catch (error) {
      console.error('Failed to load health insights:', error);
      // Use fallback insights
      setHealthInsights([
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
          title: 'Consult Healthcare Provider',
          description: 'Always consult with healthcare professionals for medical advice.',
          category: 'general',
          priority: 'high',
          icon: '👨‍⚕️'
        }
      ]);
    }
  };

  const checkAIServiceStatus = async () => {
    try {
      await aiAssistantService.checkAIHealth();
      setAiServiceStatus('online');
    } catch (error) {
      console.error('AI service is offline:', error);
      setAiServiceStatus('offline');
      toast({
        title: "AI Service Notice",
        description: "AI service is currently offline. Using fallback responses.",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      let aiResponse: AIResponse;

      if (aiServiceStatus === 'online' && user) {
        // Use real AI service only if authenticated
        aiResponse = await aiAssistantService.sendMessage(inputMessage);
      } else {
        // Use fallback response if not authenticated or service is offline
        aiResponse = aiAssistantService.generateMockResponse(inputMessage);
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse.message,
        timestamp: new Date(),
        category: aiResponse.category as 'general' | 'symptoms' | 'medication' | 'lifestyle' | 'emergency'
      };

      setMessages(prev => [...prev, aiMessage]);

      // Show suggestions if available
      if (aiResponse.suggestions.length > 0) {
        toast({
          title: "Suggestions",
          description: aiResponse.suggestions.join(', '),
        });
      }

      // Show safety warnings if any
      if (aiResponse.safetyWarnings.length > 0) {
        aiResponse.safetyWarnings.forEach(warning => {
          toast({
            title: "Important Notice",
            description: warning,
            variant: "destructive",
          });
        });
      }

    } catch (error) {
      console.error('Failed to get AI response:', error);
      
      // Fallback response
      const fallbackResponse = aiAssistantService.generateMockResponse(inputMessage);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: fallbackResponse.message,
        timestamp: new Date(),
        category: fallbackResponse.category as 'general' | 'symptoms' | 'medication' | 'lifestyle' | 'emergency'
      };

      setMessages(prev => [...prev, aiMessage]);

      toast({
        title: "Service Notice",
        description: "Using fallback response due to service issues.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (action: string) => {
    let message = '';
    switch (action) {
      case 'symptom':
        message = 'I\'d like to check my symptoms. Can you help me understand what might be causing them?';
        break;
      case 'medication':
        message = 'I have questions about my medications. Can you provide guidance on dosage, side effects, and interactions?';
        break;
      case 'lifestyle':
        message = 'I\'m looking for lifestyle and wellness tips to improve my health. What recommendations do you have?';
        break;
      case 'emergency':
        message = 'I need emergency health guidance. What should I do?';
        break;
    }
    setInputMessage(message);
  };



  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Health Assistant</h1>
                <p className="text-sm text-gray-500">Your personal health companion</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge 
                variant="secondary" 
                className={aiServiceStatus === 'online' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
                }
              >
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  aiServiceStatus === 'online' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                {aiServiceStatus === 'online' ? 'Online' : 'Offline'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chat Area */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-teal-600" />
                  <span>Health Chat</span>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-teal-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {message.type === 'ai' && (
                            <Bot className="w-4 h-4 mt-1 text-teal-600 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Bot className="w-4 h-4 text-teal-600" />
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t border-gray-200 p-4">
                  <div className="flex space-x-2">
                    <Textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Ask me about your health, symptoms, medications, or lifestyle..."
                      className="flex-1 resize-none"
                      rows={2}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isTyping}
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {quickActions.map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={action.action}
                        className="text-xs"
                      >
                        {action.icon}
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Health Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-teal-600" />
                  <span>Health Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                                 {healthInsights.map((insight) => (
                   <div
                     key={insight.id}
                     className={`p-3 rounded-lg border ${getPriorityColor(insight.priority)}`}
                   >
                     <div className="flex items-start space-x-2">
                       <span className="text-lg">{insight.icon}</span>
                       <div className="flex-1">
                         <h4 className="font-medium text-sm">{insight.title}</h4>
                         <p className="text-xs mt-1">{insight.description}</p>
                       </div>
                     </div>
                   </div>
                 ))}
              </CardContent>
            </Card>

            {/* AI Capabilities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-teal-600" />
                  <span>AI Capabilities</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Symptom Analysis</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Medication Guidance</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Lifestyle Recommendations</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Health Education</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Emergency Guidance</span>
                </div>
              </CardContent>
            </Card>

            {/* Important Notice */}
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-2">
                  <Info className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-orange-800 text-sm">Important Notice</h4>
                    <p className="text-orange-700 text-xs mt-1">
                      This AI assistant provides general health information only. 
                      Always consult healthcare professionals for medical advice, 
                      diagnosis, or treatment.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientAIAssistant; 