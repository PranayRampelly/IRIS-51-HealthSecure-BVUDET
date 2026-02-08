import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import aiAssistantService, { ChatMessage, HealthInsight, AIResponse } from '@/services/aiAssistantService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Brain,
  MessageSquare,
  Stethoscope,
  Heart,
  Pill,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Info,
  Send,
  Bot,
  Zap,
  Mic,
  MicOff,
  Trash2,
  ChevronRight
} from 'lucide-react';

const PatientAIAssistant: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [healthInsights, setHealthInsights] = useState<HealthInsight[]>([]);
  const [aiServiceStatus, setAiServiceStatus] = useState<'online' | 'offline'>('offline');
  const [isListening, setIsListening] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const quickActions = [
    { label: 'Symptom Checker', icon: <Stethoscope className="w-4 h-4" />, action: () => handleQuickAction('symptom') },
    { label: 'Medication Guide', icon: <Pill className="w-4 h-4" />, action: () => handleQuickAction('medication') },
    { label: 'Lifestyle Tips', icon: <Heart className="w-4 h-4" />, action: () => handleQuickAction('lifestyle') },
    { label: 'Emergency Help', icon: <AlertTriangle className="w-4 h-4" />, action: () => handleQuickAction('emergency') },
  ];

  // Load chat history and check AI service status on component mount
  useEffect(() => {
    checkContextAndStatus();
  }, [user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const checkContextAndStatus = async () => {
    await checkAIServiceStatus();
    if (user) {
      await loadChatHistory();
      await loadHealthInsights();
    }
    setIsLoadingHistory(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const history = await aiAssistantService.getChatHistory();
      if (history.length > 0) {
        setMessages(history);
      } else {
        // Welcome message if no history
        setMessages([
          {
            id: 'welcome',
            type: 'ai',
            content: "Hello! I'm your AI Health Assistant. I've been updated to securely access your health records and vitals. How can I help you today?",
            timestamp: new Date(),
            category: 'general'
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const loadHealthInsights = async () => {
    try {
      const insights = await aiAssistantService.getHealthInsights();
      setHealthInsights(insights);
    } catch (error) {
      console.error('Failed to load health insights:', error);
    }
  };

  const checkAIServiceStatus = async () => {
    try {
      await aiAssistantService.checkAIHealth();
      setAiServiceStatus('online');
    } catch (error) {
      console.error('AI service is offline:', error);
      setAiServiceStatus('offline');
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
        aiResponse = await aiAssistantService.sendMessage(userMessage.content);
      } else {
        aiResponse = aiAssistantService.generateMockResponse(userMessage.content);
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse.message,
        timestamp: new Date(),
        category: aiResponse.category as any
      };

      setMessages(prev => [...prev, aiMessage]);

      if (aiResponse.safetyWarnings?.length > 0) {
        aiResponse.safetyWarnings.forEach(warning => {
          toast({
            title: "Safety Notice",
            description: warning,
            variant: "destructive",
          });
        });
      }

    } catch (error) {
      console.error('Failed to get AI response:', error);
      toast({
        title: "Service Error",
        description: "Failed to communicate with AI. Using fallback.",
        variant: "destructive",
      });

      const fallback = aiAssistantService.generateMockResponse(userMessage.content);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'ai',
        content: fallback.message,
        timestamp: new Date(),
        category: 'error'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (action: string) => {
    let message = '';
    switch (action) {
      case 'symptom': message = 'Help me check some symptoms I\'m experiencing.'; break;
      case 'medication': message = 'Tell me about my medications and potential side effects.'; break;
      case 'lifestyle': message = 'What are some wellness tips based on my current health data?'; break;
      case 'emergency': message = 'What are the red flags for chest pain?'; break;
    }
    setInputMessage(message);
  };

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        title: "Not Supported",
        description: "Voice input is not supported in your browser.",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(prev => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.start();
  };

  const clearChat = async () => {
    if (window.confirm('Are you sure you want to clear your chat history?')) {
      try {
        await aiAssistantService.clearChatHistory();
        setMessages([{
          id: 'welcome',
          type: 'ai',
          content: "Chat history cleared. How can I help you today?",
          timestamp: new Date(),
          category: 'general'
        }]);
        toast({ title: "History Cleared", description: "Chat history has been permanently removed." });
      } catch (error) {
        toast({ title: "Error", description: "Failed to clear history.", variant: "destructive" });
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl shadow-lg ring-4 ring-teal-50">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-700 to-teal-900">
                  AI Health Assistant
                </h1>
                <div className="flex items-center space-x-2 mt-0.5">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${aiServiceStatus === 'online' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {aiServiceStatus === 'online' ? 'Gemini 1.5 Powered' : 'Offline Mode'}
                  </p>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={clearChat} className="text-slate-400 hover:text-rose-600 transition-colors">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Chat
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[700px] flex flex-col border-none shadow-xl overflow-hidden ring-1 ring-slate-200 bg-white/80 backdrop-blur-sm">
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                  {isLoadingHistory ? (
                    <div className="flex items-center justify-center h-full space-x-2">
                      <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    </div>
                  ) : messages.map((msg, index) => (
                    <div
                      key={msg.id || `msg-${index}`}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                      <div className={`flex items-start max-w-[85%] space-x-3 ${msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center shadow-md ${msg.type === 'user' ? 'bg-teal-600' : 'bg-slate-100'
                          }`}>
                          {msg.type === 'user' ? <CheckCircle className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-teal-600" />}
                        </div>

                        <div className={`p-4 rounded-2xl shadow-sm ring-1 ${msg.type === 'user'
                          ? 'bg-teal-600 text-white ring-teal-500'
                          : 'bg-white text-slate-800 ring-slate-100'
                          }`}>
                          <div className={`prose prose-sm max-w-none ${msg.type === 'user' ? 'prose-invert' : 'prose-slate'}`}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                          <div className={`text-[10px] mt-2 font-medium opacity-60 ${msg.type === 'user' ? 'text-teal-50' : 'text-slate-400'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start animate-pulse">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shadow-md">
                          <Bot className="w-4 h-4 text-teal-600" />
                        </div>
                        <div className="bg-white p-4 rounded-2xl shadow-sm ring-1 ring-slate-100 flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" />
                          <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 bg-slate-50/50 border-t border-slate-100">
                  <div className="relative group">
                    <Textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Ask about your health, vitals, or medical history..."
                      className="min-h-[100px] w-full p-4 rounded-2xl border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all bg-white shadow-inner pr-24 resize-none text-slate-700 leading-relaxed"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <div className="absolute right-3 bottom-3 flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleListening}
                        className={`rounded-xl transition-all ${isListening ? 'bg-rose-50 text-rose-600 animate-pulse ring-2 ring-rose-200' : 'text-slate-400 hover:text-teal-600 hover:bg-teal-50'}`}
                      >
                        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </Button>
                      <Button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || isTyping}
                        className="rounded-xl h-11 w-11 bg-teal-600 hover:bg-teal-700 shadow-lg shadow-teal-500/20 active:scale-95 transition-all p-0"
                      >
                        <Send className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={action.action}
                        className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-700 hover:shadow-sm transition-all text-xs font-medium"
                      >
                        <span className="text-teal-500">{action.icon}</span>
                        <span>{action.label}</span>
                        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Health Insights */}
            <Card className="border-none shadow-lg ring-1 ring-slate-100 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white py-4 px-5">
                <CardTitle className="text-sm font-bold flex items-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Personalized Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {healthInsights.length > 0 ? (
                  healthInsights.map((insight, index) => (
                    <div
                      key={insight.id || `insight-${index}`}
                      className={`group p-4 rounded-xl border-l-4 transition-all hover:translate-x-1 ${insight.priority === 'high' ? 'bg-rose-50 border-rose-500' :
                        insight.priority === 'medium' ? 'bg-amber-50 border-amber-500' : 'bg-emerald-50 border-emerald-500'
                        }`}
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl drop-shadow-sm group-hover:scale-110 transition-transform">{insight.icon}</span>
                        <div>
                          <h4 className={`text-xs font-bold ${insight.priority === 'high' ? 'text-rose-800' :
                            insight.priority === 'medium' ? 'text-amber-800' : 'text-emerald-800'
                            }`}>{insight.title}</h4>
                          <p className="text-[11px] text-slate-600 leading-relaxed mt-1">{insight.description}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Bot className="w-5 h-5 text-slate-300" />
                    </div>
                    <p className="text-xs text-slate-400">Thinking about your health...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Status/Efficiency Card */}
            <Card className="border-none shadow-md ring-1 ring-slate-100 bg-teal-50/30">
              <CardContent className="p-5">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Advanced Intelligence</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                      Powered by HealthSecure Core Intelligence. Direct analysis mode active.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Stats Brief */}
            <div className="px-2">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium px-1">
                <span className="flex items-center">
                  <Zap className="w-3 h-3 mr-1 text-teal-400" />
                  Ready to assist 24/7
                </span>
                <span className="flex items-center">
                  <Heart className="w-3 h-3 mr-1 text-rose-400" />
                  Your health partner
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientAIAssistant;
