import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageCircle, Send, Phone, Mail, MapPin, Clock, 
  User, Building, X, Paperclip, Image, FileText, 
  Video, Mic, Heart, AlertCircle, CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { Hospital } from '@/services/hospitalServicesService';
import { toast } from 'sonner';
import patientHospitalService from '@/services/patientHospitalService';

interface HospitalMessagingModalProps {
  hospital: Hospital;
  onClose: () => void;
}

interface Message {
  id: string;
  from: {
    id: string;
    name: string;
    role: string;
  };
  to: {
    id: string;
    name: string;
    role: string;
  };
  message: string;
  type: 'text' | 'image' | 'file' | 'voice';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  attachments?: string[];
}

const HospitalMessagingModal: React.FC<HospitalMessagingModalProps> = ({
  hospital,
  onClose
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState<'text' | 'image' | 'file' | 'voice'>('text');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMessages();
    scrollToBottom();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      // Mock messages for demonstration
      const mockMessages: Message[] = [
        {
          id: '1',
          from: {
            id: 'patient-1',
            name: 'You',
            role: 'patient'
          },
          to: {
            id: hospital.id,
            name: hospital.name,
            role: 'hospital'
          },
          message: 'Hi, I have a question about my upcoming appointment.',
          type: 'text',
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
          status: 'read'
        },
        {
          id: '2',
          from: {
            id: hospital.id,
            name: hospital.name,
            role: 'hospital'
          },
          to: {
            id: 'patient-1',
            name: 'You',
            role: 'patient'
          },
          message: 'Hello! We\'re here to help. What would you like to know about your appointment?',
          type: 'text',
          timestamp: new Date(Date.now() - 3000000), // 50 minutes ago
          status: 'read'
        },
        {
          id: '3',
          from: {
            id: 'patient-1',
            name: 'You',
            role: 'patient'
          },
          to: {
            id: hospital.id,
            name: hospital.name,
            role: 'hospital'
          },
          message: 'I was wondering if I need to bring any specific documents or prepare anything for my consultation.',
          type: 'text',
          timestamp: new Date(Date.now() - 2400000), // 40 minutes ago
          status: 'read'
        },
        {
          id: '4',
          from: {
            id: hospital.id,
            name: hospital.name,
            role: 'hospital'
          },
          to: {
            id: 'patient-1',
            name: 'You',
            role: 'patient'
          },
          message: 'Please bring your ID, insurance card, and any previous medical records if available. Also, please arrive 15 minutes before your scheduled time.',
          type: 'text',
          timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
          status: 'read'
        }
      ];
      
      setMessages(mockMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) {
      toast.error('Please enter a message or attach a file');
      return;
    }

    setSending(true);
    try {
      const messageData = {
        message: newMessage.trim(),
        messageType: messageType,
        attachments: attachments.map(file => file.name)
      };

      // Send message to hospital
      await patientHospitalService.sendMessageToHospital(hospital.id, messageData);

      // Add message to local state
      const newMsg: Message = {
        id: Date.now().toString(),
        from: {
          id: 'patient-1',
          name: 'You',
          role: 'patient'
        },
        to: {
          id: hospital.id,
          name: hospital.name,
          role: 'hospital'
        },
        message: newMessage.trim(),
        type: messageType,
        timestamp: new Date(),
        status: 'sent',
        attachments: attachments.map(file => file.name)
      };

      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      setAttachments([]);
      setMessageType('text');
      
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return format(timestamp, 'h:mm a');
    } else if (diffInHours < 24) {
      return format(timestamp, 'h:mm a');
    } else {
      return format(timestamp, 'MMM d, h:mm a');
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'file':
        return <FileText className="h-4 w-4" />;
      case 'voice':
        return <Mic className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return <CheckCircle className="h-3 w-3 text-blue-500" />;
      case 'read':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-health-teal/10 rounded-full flex items-center justify-center">
                <Building className="h-5 w-5 text-health-teal" />
              </div>
              <div>
                <h3 className="font-semibold">{hospital.name}</h3>
                <p className="text-sm text-gray-500">Messaging</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-[600px]">
          {/* Hospital Info */}
          <Card className="mb-4">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-health-teal" />
                    <span className="text-sm">{hospital.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-health-teal" />
                    <span className="text-sm">{hospital.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-health-teal" />
                    <span className="text-sm">24/7 Support</span>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Online
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-4 space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-teal mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
                <p className="text-gray-600">Start a conversation with {hospital.name}</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.from.role === 'patient' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.from.role === 'patient'
                        ? 'bg-health-teal text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs font-medium opacity-80">
                            {message.from.name}
                          </span>
                          {message.from.role === 'patient' && getStatusIcon(message.status)}
                        </div>
                        
                        {message.type !== 'text' && (
                          <div className="flex items-center space-x-1 mb-2">
                            {getMessageIcon(message.type)}
                            <span className="text-xs opacity-80">
                              {message.type === 'image' ? 'Image' : 
                               message.type === 'file' ? 'File' : 'Voice Message'}
                            </span>
                          </div>
                        )}
                        
                        <p className="text-sm">{message.message}</p>
                        
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {message.attachments.map((attachment, index) => (
                              <div key={index} className="flex items-center space-x-1 text-xs opacity-80">
                                <Paperclip className="h-3 w-3" />
                                <span>{attachment}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="text-xs opacity-70 mt-2">
                          {formatMessageTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="mt-4 space-y-3">
            {/* Attachments */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
                    <Paperclip className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAttachment(index)}
                      className="h-4 w-4 p-0 hover:bg-gray-200"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="flex items-end space-x-2">
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <Select value={messageType} onValueChange={(value: any) => setMessageType(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="file">File</SelectItem>
                      <SelectItem value="voice">Voice</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-1"
                  >
                    <Paperclip className="h-4 w-4" />
                    <span>Attach</span>
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
                
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="min-h-[80px] resize-none"
                  disabled={sending}
                />
              </div>
              
              <Button
                onClick={handleSendMessage}
                disabled={sending || (!newMessage.trim() && attachments.length === 0)}
                className="bg-health-teal hover:bg-health-aqua px-4"
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt"
        />
      </DialogContent>
    </Dialog>
  );
};

export default HospitalMessagingModal; 