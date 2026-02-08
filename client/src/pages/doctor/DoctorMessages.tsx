import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  MessageSquare, Send, Search, Phone, Video, MoreHorizontal,
  Clock, Check, CheckCheck, User, Users, FileText, Image, Mic
} from 'lucide-react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { VoiceMessagePlayer } from '@/components/VoiceMessagePlayer';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Message {
  _id: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    avatar?: string;
  };
  receiver: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    avatar?: string;
  };
  messageType: 'text' | 'voice' | 'image' | 'document';
  content?: string;
  audioUrl?: string;
  audioDuration?: number;
  audioFormat?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileFormat?: string;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface Contact {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  role: string;
  lastMessage?: Message;
  unreadCount: number;
  online?: boolean;
}

const DoctorMessages: React.FC = () => {
  const [selectedContact, setSelectedContact] = useState<string>('');
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    isConnected,
    sendTextMessage,
    sendVoiceMessage,
    sendImageMessage,
    sendDocumentMessage,
    markMessageAsRead,
    onNewMessage,
    onVoiceMessage,
    onMessageRead,
    error: wsError
  } = useWebSocket();

  // Get current user ID from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    // Check both _id and id for robustness
    const id = user._id || user.id || '';
    setCurrentUserId(id);
    console.log('Current User ID initialized:', id);
  }, []);

  // Load conversations
  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages when contact is selected
  useEffect(() => {
    if (selectedContact) {
      loadMessages(selectedContact);
      setSearchTerm(''); // Clear search when selecting a contact
    }
  }, [selectedContact]);

  // Handle searching for new contacts
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        fetchSearchResults(searchTerm);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchSearchResults = async (query: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/messages/search-contacts?q=${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        // Filter out current user
        const filteredResults = response.data.data.filter((u: any) => u._id !== currentUserId);
        setSearchResults(filteredResults);
      }
    } catch (err) {
      console.error('Error searching contacts:', err);
    }
  };

  // Listen for new messages
  useEffect(() => {
    const cleanup1 = onNewMessage((message) => {
      // Add to messages if it's for the current conversation
      if (
        (message.sender._id === selectedContact && message.receiver._id === currentUserId) ||
        (message.sender._id === currentUserId && message.receiver._id === selectedContact)
      ) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      }

      // Update conversations list
      loadConversations();
    });

    const cleanup2 = onVoiceMessage((message) => {
      if (
        (message.sender._id === selectedContact && message.receiver._id === currentUserId) ||
        (message.sender._id === currentUserId && message.receiver._id === selectedContact)
      ) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      }

      loadConversations();
    });

    const cleanup3 = onMessageRead((data) => {
      setMessages(prev => prev.map(msg =>
        msg._id === data.messageId ? { ...msg, read: true, readAt: data.readAt } : msg
      ));
    });

    return () => {
      cleanup1?.();
      cleanup2?.();
      cleanup3?.();
    };
  }, [selectedContact, currentUserId, isConnected, onNewMessage, onVoiceMessage, onMessageRead]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const conversationList: Contact[] = response.data.data.map((conv: any) => ({
          _id: conv._id._id,
          firstName: conv._id.firstName,
          lastName: conv._id.lastName,
          email: conv._id.email,
          avatar: conv._id.avatar,
          role: conv._id.role,
          lastMessage: conv.lastMessage,
          unreadCount: conv.unreadCount,
          online: false
        }));
        setContacts(conversationList);
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
    }
  };

  const loadMessages = async (userId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setMessages(response.data.data);
        scrollToBottom();

        // Mark conversation as read
        await axios.patch(
          `${API_URL}/api/messages/conversation/${userId}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTextMessage = () => {
    if (messageText.trim() && selectedContact) {
      sendTextMessage(selectedContact, messageText);
      setMessageText('');
      setTimeout(() => loadConversations(), 500); // Refresh list to show latest message
    }
  };

  const handleSendVoiceMessage = async (audioBlob: Blob, duration: number, format: string) => {
    try {
      await sendVoiceMessage(selectedContact, audioBlob, duration, format);
      setShowVoiceRecorder(false);
      setTimeout(() => loadConversations(), 500); // Refresh list
    } catch (err) {
      console.error('Error sending voice message:', err);
      setError('Failed to send voice message');
    }
  };

  const handleSendImageMessage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedContact) {
      try {
        const format = file.type.split('/')[1] || 'png';
        await sendImageMessage(selectedContact, file, format);
        setTimeout(() => loadConversations(), 500);
      } catch (err) {
        console.error('Error sending image:', err);
        setError('Failed to send image');
      }
    }
  };

  const handleSendDocumentMessage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedContact) {
      try {
        const format = file.name.split('.').pop() || 'pdf';
        await sendDocumentMessage(selectedContact, file, file.name, format);
        setTimeout(() => loadConversations(), 500);
      } catch (err) {
        console.error('Error sending document:', err);
        setError('Failed to send document');
      }
    }
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);

      stream.getTracks().forEach(track => track.stop());

      canvas.toBlob(async (blob) => {
        if (blob && selectedContact) {
          await sendImageMessage(selectedContact, blob, 'png');
          setTimeout(() => loadConversations(), 500);
        }
      }, 'image/png');

    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please check permissions.');
    }
  };

  const handleVoiceMessagePlay = (messageId: string) => {
    markMessageAsRead(messageId);
  };

  const filteredContacts = [
    ...contacts.filter(contact =>
      `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    ...searchResults.filter(result => !contacts.some(c => c._id === result._id))
  ];

  const selectedContactData = filteredContacts.find(c => c._id === selectedContact);

  const getContactTypeBadge = (type: string) => {
    switch (type) {
      case 'patient':
        return <Badge className="bg-blue-100 text-blue-800">Patient</Badge>;
      case 'doctor':
        return <Badge className="bg-green-100 text-green-800">Doctor</Badge>;
      case 'staff':
        return <Badge className="bg-purple-100 text-purple-800">Staff</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const formatTimestamp = (date: Date): string => {
    const d = new Date(date);
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-health-charcoal">Messages</h1>
          <p className="text-health-blue-gray mt-2">Communicate with patients and colleagues</p>
        </div>
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <Badge className="bg-green-100 text-green-800">Connected</Badge>
          ) : (
            <Badge variant="destructive">Disconnected</Badge>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {(error || wsError) && (
        <Alert variant="destructive">
          <AlertDescription>{error || wsError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Contacts List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-xl font-montserrat font-bold text-health-charcoal flex items-center justify-between">
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-health-teal" />
                Contacts
              </div>
              <div className={`flex items-center space-x-1 text-xs font-normal ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span>{isConnected ? 'Real-time On' : 'Connecting...'}</span>
              </div>
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1 max-h-[calc(100vh-300px)] overflow-y-auto">
              {filteredContacts.length === 0 ? (
                <div className="p-8 text-center">
                  <User className="w-12 h-12 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-health-blue-gray">
                    {searchTerm ? 'No matching contacts found' : 'No conversations yet'}
                  </p>
                  {searchTerm && (
                    <p className="text-xs text-health-blue-gray mt-1">
                      Try searching by name or email
                    </p>
                  )}
                </div>
              ) : (
                filteredContacts.map((contact) => (
                  <div
                    key={contact._id}
                    className={`flex items-center space-x-3 p-4 cursor-pointer hover:bg-gray-50 border-l-4 ${selectedContact === contact._id
                      ? 'border-health-aqua bg-health-aqua/10'
                      : 'border-transparent'
                      }`}
                    onClick={() => setSelectedContact(contact._id)}
                  >
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={contact.avatar} />
                        <AvatarFallback>{contact.firstName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {contact.online && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-health-charcoal truncate">
                          {contact.firstName} {contact.lastName}
                        </p>
                        <div className="flex items-center space-x-2">
                          {getContactTypeBadge(contact.role)}
                          {contact.unreadCount > 0 && (
                            <Badge className="bg-health-danger text-white text-xs">
                              {contact.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {contact.lastMessage && (
                        <p className="text-sm text-health-blue-gray truncate">
                          {contact.lastMessage.messageType === 'voice' ? '🎤 Voice message' : contact.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            {selectedContact ? (
              <>
                {/* Chat Header */}
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={selectedContactData?.avatar} />
                        <AvatarFallback>{selectedContactData?.firstName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-health-charcoal">
                          {selectedContactData?.firstName} {selectedContactData?.lastName}
                        </p>
                        <p className="text-sm text-health-blue-gray">{selectedContactData?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {selectedContactData && getContactTypeBadge(selectedContactData.role)}
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 p-0">
                  <div className="h-full flex flex-col">
                    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                      {loading ? (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-health-blue-gray">Loading messages...</p>
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-health-blue-gray">No messages yet. Start the conversation!</p>
                        </div>
                      ) : (
                        messages.map((message) => {
                          const isOwnMessage = (message.sender._id || message.sender) === currentUserId;

                          return (
                            <div
                              key={message._id}
                              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                            >
                              {message.messageType === 'text' ? (
                                <div className={`max-w-xs lg:max-w-md ${isOwnMessage
                                  ? 'bg-health-aqua text-white'
                                  : 'bg-gray-100 text-health-charcoal'
                                  } rounded-lg p-3`}>
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-xs opacity-75">{formatTimestamp(message.createdAt)}</span>
                                    {isOwnMessage && (
                                      <div className="flex items-center space-x-1">
                                        {message.read ? (
                                          <CheckCheck className="w-3 h-3" />
                                        ) : (
                                          <Check className="w-3 h-3" />
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-sm">{message.content}</p>
                                </div>
                              ) : message.messageType === 'image' ? (
                                <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'bg-health-aqua/10' : 'bg-gray-100'} p-2 rounded-lg`}>
                                  <img
                                    src={`${API_URL}${message.fileUrl}`}
                                    alt="Message attachment"
                                    className="rounded-md max-h-64 object-contain cursor-pointer"
                                    onClick={() => window.open(`${API_URL}${message.fileUrl}`, '_blank')}
                                  />
                                  <div className="flex items-center justify-between mt-1 px-1">
                                    <span className="text-[10px] text-health-blue-gray opacity-75">{formatTimestamp(message.createdAt)}</span>
                                    <a
                                      href={`${API_URL}${message.fileUrl}`}
                                      download
                                      className="text-[10px] text-health-aqua hover:underline"
                                    >
                                      Download
                                    </a>
                                  </div>
                                </div>
                              ) : message.messageType === 'document' ? (
                                <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'bg-health-aqua/20' : 'bg-gray-100'} p-3 rounded-lg`}>
                                  <div className="flex items-center space-x-3 mb-2">
                                    <div className="bg-white p-2 rounded shadow-sm">
                                      <FileText className="w-6 h-6 text-health-aqua" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{message.fileName}</p>
                                      <p className="text-[10px] text-health-blue-gray opacity-75">
                                        {(message.fileSize! / 1024).toFixed(1)} KB • {message.fileFormat?.toUpperCase()}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-health-blue-gray opacity-75">{formatTimestamp(message.createdAt)}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 text-health-aqua text-xs hover:bg-white/50"
                                      onClick={() => window.open(`${API_URL}${message.fileUrl}`, '_blank')}
                                    >
                                      Open
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="max-w-xs lg:max-w-md">
                                  <VoiceMessagePlayer
                                    audioUrl={message.audioUrl ? `${API_URL}${message.audioUrl}` : ''}
                                    duration={message.audioDuration || 0}
                                    sender={message.sender}
                                    timestamp={message.createdAt}
                                    isOwnMessage={isOwnMessage}
                                    onPlay={() => handleVoiceMessagePlay(message._id)}
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Voice Recorder */}
                    {showVoiceRecorder && (
                      <div className="border-t p-4">
                        <VoiceRecorder
                          onSend={handleSendVoiceMessage}
                          onCancel={() => setShowVoiceRecorder(false)}
                        />
                      </div>
                    )}

                    {/* Message Input */}
                    {!showVoiceRecorder && (
                      <div className="border-t p-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="file"
                            id="image-upload-doc"
                            accept="image/*"
                            className="hidden"
                            onChange={handleSendImageMessage}
                          />
                          <input
                            type="file"
                            id="doc-upload-doc"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                            className="hidden"
                            onChange={handleSendDocumentMessage}
                          />

                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 rounded-full text-health-blue-gray hover:text-health-aqua hover:bg-health-aqua/10"
                              onClick={() => document.getElementById('image-upload-doc')?.click()}
                              title="Send Image"
                            >
                              <Image className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 rounded-full text-health-blue-gray hover:text-health-aqua hover:bg-health-aqua/10"
                              onClick={() => document.getElementById('doc-upload-doc')?.click()}
                              title="Send Document"
                            >
                              <FileText className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 rounded-full text-health-blue-gray hover:text-health-aqua hover:bg-health-aqua/10"
                              onClick={handleCameraCapture}
                              title="Capture Photo"
                            >
                              <Video className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 rounded-full text-health-blue-gray hover:text-health-aqua hover:bg-health-aqua/10"
                              onClick={() => setShowVoiceRecorder(true)}
                              title="Record Voice"
                            >
                              <Mic className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex-1">
                            <Textarea
                              placeholder="Type your message..."
                              value={messageText}
                              onChange={(e) => setMessageText(e.target.value)}
                              className="min-h-[40px] max-h-[120px] resize-none py-2"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSendTextMessage();
                                }
                              }}
                            />
                          </div>
                          <Button
                            onClick={handleSendTextMessage}
                            disabled={!messageText.trim()}
                            className="bg-health-aqua hover:bg-health-teal text-white rounded-full w-10 h-10 p-0"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-health-charcoal mb-2">Select a contact</h3>
                  <p className="text-health-blue-gray">Choose a contact to start messaging</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorMessages;