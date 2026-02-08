import { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';

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
    audioSize?: number;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    fileFormat?: string;
    read: boolean;
    readAt?: Date;
    delivered: boolean;
    deliveredAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

interface UseWebSocketReturn {
    socket: any | null;
    isConnected: boolean;
    sendTextMessage: (receiverId: string, content: string) => void;
    sendVoiceMessage: (receiverId: string, audioBlob: Blob, audioDuration: number, audioFormat: string) => Promise<void>;
    sendImageMessage: (receiverId: string, imageBlob: Blob, imageFormat: string) => Promise<void>;
    sendDocumentMessage: (receiverId: string, docBlob: Blob, docName: string, docFormat: string) => Promise<void>;
    markMessageAsRead: (messageId: string) => void;
    onNewMessage: (callback: (message: Message) => void) => (() => void);
    onVoiceMessage: (callback: (message: Message) => void) => (() => void);
    onMessageRead: (callback: (data: { messageId: string; readAt: Date }) => void) => (() => void);
    onTyping: (callback: (data: { userId: string; user: { firstName: string; lastName: string } }) => void) => (() => void);
    onTypingStop: (callback: (data: { userId: string }) => void) => (() => void);
    sendTypingStart: (receiverId: string) => void;
    sendTypingStop: (receiverId: string) => void;
    error: string | null;
}

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useWebSocket = (): UseWebSocketReturn => {
    const [socket, setSocket] = useState<any | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const socketRef = useRef<any | null>(null);

    useEffect(() => {
        // Get auth token from localStorage
        const token = localStorage.getItem('token');

        if (!token) {
            setError('No authentication token found');
            return;
        }

        // Create socket connection
        const newSocket = io(SOCKET_URL, {
            auth: {
                token
            },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

        // Connection event handlers
        newSocket.on('connect', () => {
            console.log('WebSocket connected');
            setIsConnected(true);
            setError(null);
        });

        newSocket.on('disconnect', (reason) => {
            console.log('WebSocket disconnected:', reason);
            setIsConnected(false);
        });

        newSocket.on('connect_error', (err) => {
            console.error('WebSocket connection error:', err);
            setError('Failed to connect to server');
            setIsConnected(false);
        });

        newSocket.on('message:error', (data: { message: string; error?: string }) => {
            console.error('Message error:', data);
            setError(data.message);
        });

        // Cleanup on unmount
        return () => {
            newSocket.close();
        };
    }, []);

    const sendTextMessage = useCallback((receiverId: string, content: string) => {
        if (!socketRef.current || !isConnected) {
            setError('Not connected to server');
            return;
        }

        socketRef.current.emit('message:text:send', {
            receiverId,
            content
        });
    }, [isConnected]);

    const sendVoiceMessage = useCallback(async (
        receiverId: string,
        audioBlob: Blob,
        audioDuration: number,
        audioFormat: string
    ): Promise<void> => {
        if (!socketRef.current || !isConnected) {
            setError('Not connected to server');
            throw new Error('Not connected to server');
        }

        try {
            // Convert blob to base64
            const base64Audio = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64 = (reader.result as string).split(',')[1];
                    resolve(base64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(audioBlob);
            });

            socketRef.current.emit('message:voice:send', {
                receiverId,
                audioBlob: base64Audio,
                audioDuration,
                audioFormat
            });
        } catch (err) {
            console.error('Error sending voice message:', err);
            setError('Failed to send voice message');
            throw err;
        }
    }, [isConnected]);

    const sendImageMessage = useCallback(async (
        receiverId: string,
        imageBlob: Blob,
        imageFormat: string
    ): Promise<void> => {
        if (!socketRef.current || !isConnected) {
            setError('Not connected to server');
            throw new Error('Not connected to server');
        }

        try {
            // Convert blob to base64
            const base64Image = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64 = (reader.result as string).split(',')[1];
                    resolve(base64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(imageBlob);
            });

            socketRef.current.emit('message:image:send', {
                receiverId,
                imageBlob: base64Image,
                imageFormat
            });
        } catch (err) {
            console.error('Error sending image message:', err);
            setError('Failed to send image message');
            throw err;
        }
    }, [isConnected]);

    const sendDocumentMessage = useCallback(async (
        receiverId: string,
        docBlob: Blob,
        docName: string,
        docFormat: string
    ): Promise<void> => {
        if (!socketRef.current || !isConnected) {
            setError('Not connected to server');
            throw new Error('Not connected to server');
        }

        try {
            // Convert blob to base64
            const base64Doc = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64 = (reader.result as string).split(',')[1];
                    resolve(base64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(docBlob);
            });

            socketRef.current.emit('message:document:send', {
                receiverId,
                docBlob: base64Doc,
                docName,
                docFormat
            });
        } catch (err) {
            console.error('Error sending document message:', err);
            setError('Failed to send document message');
            throw err;
        }
    }, [isConnected]);

    const markMessageAsRead = useCallback((messageId: string) => {
        if (!socketRef.current || !isConnected) {
            return;
        }

        socketRef.current.emit('message:read', { messageId });
    }, [isConnected]);

    const onNewMessage = useCallback((callback: (message: Message) => void) => {
        const currentSocket = socketRef.current;
        if (!currentSocket) return () => { };

        currentSocket.on('message:new', callback);
        currentSocket.on('message:sent', callback);

        return () => {
            currentSocket.off('message:new', callback);
            currentSocket.off('message:sent', callback);
        };
    }, [isConnected]); // Re-attach if socket/connection changes

    const onVoiceMessage = useCallback((callback: (message: Message) => void) => {
        const currentSocket = socketRef.current;
        if (!currentSocket) return () => { };

        currentSocket.on('message:voice:new', callback);
        currentSocket.on('message:voice:sent', callback);

        return () => {
            currentSocket.off('message:voice:new', callback);
            currentSocket.off('message:voice:sent', callback);
        };
    }, [isConnected]);

    const onMessageRead = useCallback((callback: (data: { messageId: string; readAt: Date }) => void) => {
        const currentSocket = socketRef.current;
        if (!currentSocket) return () => { };

        currentSocket.on('message:read:update', callback);

        return () => {
            currentSocket.off('message:read:update', callback);
        };
    }, [isConnected]);

    const onTyping = useCallback((callback: (data: { userId: string; user: { firstName: string; lastName: string } }) => void) => {
        const currentSocket = socketRef.current;
        if (!currentSocket) return () => { };

        currentSocket.on('message:typing', callback);

        return () => {
            currentSocket.off('message:typing', callback);
        };
    }, [isConnected]);

    const onTypingStop = useCallback((callback: (data: { userId: string }) => void) => {
        const currentSocket = socketRef.current;
        if (!currentSocket) return () => { };

        currentSocket.on('message:typing:stop', callback);

        return () => {
            currentSocket.off('message:typing:stop', callback);
        };
    }, [isConnected]);

    const sendTypingStart = useCallback((receiverId: string) => {
        if (!socketRef.current || !isConnected) return;

        socketRef.current.emit('message:typing:start', { receiverId });
    }, [isConnected]);

    const sendTypingStop = useCallback((receiverId: string) => {
        if (!socketRef.current || !isConnected) return;

        socketRef.current.emit('message:typing:stop', { receiverId });
    }, [isConnected]);

    return {
        socket,
        isConnected,
        sendTextMessage,
        sendVoiceMessage,
        sendImageMessage,
        sendDocumentMessage,
        markMessageAsRead,
        onNewMessage,
        onVoiceMessage,
        onMessageRead,
        onTyping,
        onTypingStop,
        sendTypingStart,
        sendTypingStop,
        error
    };
};
