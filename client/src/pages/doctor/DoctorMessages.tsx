import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare, Send, Search, Phone, Video, MoreHorizontal,
  Clock, Check, CheckCheck, User, Users, FileText, Image
} from 'lucide-react';

interface Message {
  id: string;
  sender: string;
  senderId: string;
  receiver: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
  type: 'text' | 'file' | 'image';
  fileUrl?: string;
  fileName?: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  online: boolean;
  type: 'patient' | 'doctor' | 'staff';
}

const DoctorMessages: React.FC = () => {
  const [selectedContact, setSelectedContact] = useState<string>('');
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const contacts: Contact[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@email.com',
      avatar: '/placeholder.svg',
      lastMessage: 'Thank you for the prescription',
      lastMessageTime: '2 hours ago',
      unreadCount: 2,
      online: true,
      type: 'patient'
    },
    {
      id: '2',
      name: 'Dr. Sarah Wilson',
      email: 'sarah.wilson@hospital.com',
      avatar: '/placeholder.svg',
      lastMessage: 'Can you review the patient case?',
      lastMessageTime: '1 day ago',
      unreadCount: 0,
      online: false,
      type: 'doctor'
    },
    {
      id: '3',
      name: 'Jane Smith',
      email: 'jane.smith@email.com',
      avatar: '/placeholder.svg',
      lastMessage: 'When is my next appointment?',
      lastMessageTime: '3 hours ago',
      unreadCount: 1,
      online: true,
      type: 'patient'
    },
  ];

  const messages: Message[] = [
    {
      id: '1',
      sender: 'John Doe',
      senderId: '1',
      receiver: 'Dr. You',
      receiverId: 'doctor',
      content: 'Hello doctor, I have a question about my medication',
      timestamp: '10:30 AM',
      read: true,
      type: 'text'
    },
    {
      id: '2',
      sender: 'Dr. You',
      senderId: 'doctor',
      receiver: 'John Doe',
      receiverId: '1',
      content: 'Hello John, what would you like to know?',
      timestamp: '10:32 AM',
      read: true,
      type: 'text'
    },
    {
      id: '3',
      sender: 'John Doe',
      senderId: '1',
      receiver: 'Dr. You',
      receiverId: 'doctor',
      content: 'I was wondering about the side effects',
      timestamp: '10:35 AM',
      read: true,
      type: 'text'
    },
    {
      id: '4',
      sender: 'Dr. You',
      senderId: 'doctor',
      receiver: 'John Doe',
      receiverId: '1',
      content: 'The common side effects include...',
      timestamp: '10:40 AM',
      read: false,
      type: 'text'
    },
  ];

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedContactData = contacts.find(c => c.id === selectedContact);
  const contactMessages = messages.filter(m => 
    (m.senderId === selectedContact && m.receiverId === 'doctor') ||
    (m.senderId === 'doctor' && m.receiverId === selectedContact)
  );

  const handleSendMessage = () => {
    if (messageText.trim() && selectedContact) {
      // Handle sending message
      console.log('Sending message:', messageText);
      setMessageText('');
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-health-charcoal">Messages</h1>
          <p className="text-health-blue-gray mt-2">Communicate with patients and colleagues</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Phone className="w-4 h-4 mr-2" />
            Voice Call
          </Button>
          <Button variant="outline" size="sm">
            <Video className="w-4 h-4 mr-2" />
            Video Call
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Contacts List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-health-aqua" />
              <span>Contacts</span>
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
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className={`flex items-center space-x-3 p-4 cursor-pointer hover:bg-gray-50 border-l-4 ${
                    selectedContact === contact.id 
                      ? 'border-health-aqua bg-health-aqua/10' 
                      : 'border-transparent'
                  }`}
                  onClick={() => setSelectedContact(contact.id)}
                >
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={contact.avatar} />
                      <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {contact.online && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-health-charcoal truncate">{contact.name}</p>
                      <div className="flex items-center space-x-2">
                        {getContactTypeBadge(contact.type)}
                        {contact.unreadCount > 0 && (
                          <Badge className="bg-health-danger text-white text-xs">
                            {contact.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-health-blue-gray truncate">{contact.lastMessage}</p>
                    <p className="text-xs text-health-blue-gray">{contact.lastMessageTime}</p>
                  </div>
                </div>
              ))}
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
                        <AvatarFallback>{selectedContactData?.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-health-charcoal">{selectedContactData?.name}</p>
                        <p className="text-sm text-health-blue-gray">{selectedContactData?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getContactTypeBadge(selectedContactData?.type || '')}
                      <Button variant="outline" size="sm">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Video className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 p-0">
                  <div className="h-full flex flex-col">
                    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                      {contactMessages.map((message) => {
                        const isOwnMessage = message.senderId === 'doctor';
                        
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-xs lg:max-w-md ${
                              isOwnMessage 
                                ? 'bg-health-aqua text-white' 
                                : 'bg-gray-100 text-health-charcoal'
                            } rounded-lg p-3`}>
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-xs opacity-75">{message.timestamp}</span>
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
                          </div>
                        );
                      })}
                    </div>

                    {/* Message Input */}
                    <div className="border-t p-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <FileText className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Image className="w-4 h-4" />
                        </Button>
                        <div className="flex-1">
                          <Textarea
                            placeholder="Type your message..."
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            className="min-h-[40px] max-h-[120px] resize-none"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                          />
                        </div>
                        <Button 
                          onClick={handleSendMessage}
                          disabled={!messageText.trim()}
                          size="sm"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
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