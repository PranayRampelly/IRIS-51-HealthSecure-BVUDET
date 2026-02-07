import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

// Types
export interface RealtimeMessage {
  id: string;
  type: 'notification' | 'message' | 'status_update' | 'emergency' | 'appointment' | 'admission';
  title: string;
  message: string;
  data?: any;
  timestamp: string;
  read: boolean;
}

export interface RealtimeStats {
  connectedUsers: number;
  connectedStaff: number;
  activeAppointments: number;
  activeAdmissions: number;
  emergencyCases: number;
  availableBeds: number;
}

export interface RealtimeUpdate {
  type: string;
  data: any;
  timestamp: string;
}

// Realtime Service
class RealtimeService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private messageHandlers: Map<string, Function[]> = new Map();
  private statsHandlers: Map<string, Function[]> = new Map();
  private updateHandlers: Map<string, Function[]> = new Map();
  private hasShownInitialConnection: boolean = false;
  private isInitializing: boolean = false;
  private connectionPromise: Promise<void> | null = null;

  // Initialize connection
  initialize(token: string, userId: string, userRole: string): Promise<void> {
    // If already initializing, return the existing promise
    if (this.isInitializing && this.connectionPromise) {
      return this.connectionPromise;
    }

    // If already connected, return resolved promise
    if (this.socket && this.isConnected) {
      console.log('Already connected to real-time service');
      return Promise.resolve();
    }

    this.isInitializing = true;
    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        // Disconnect existing socket if any
        if (this.socket) {
          this.socket.disconnect();
          this.socket = null;
        }

        const rawBase = (import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000') as string;
        const baseURL = rawBase.replace(/\/api\/?$/, '');
        this.socket = io(baseURL, {
          auth: {
            token,
            userId,
            userRole
          },
          transports: ['websocket', 'polling'],
          timeout: 10000,
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: this.reconnectDelay,
          forceNew: true,
          autoConnect: true,
          withCredentials: true
        });

        this.setupEventListeners();
        this.setupReconnectionLogic();

        this.socket.on('connect', () => {
          console.log('Connected to real-time service');
          this.isConnected = true;
          this.isInitializing = false;
          this.connectionPromise = null;
          this.reconnectAttempts = 0;
          // Only show initial connection toast, not reconnection toasts
          if (!this.hasShownInitialConnection) {
            toast.success('Real-time connection established', {
              description: 'You will receive live updates for your records.'
            });
            this.hasShownInitialConnection = true;
          }
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('Connection error:', error);
          this.isConnected = false;
          this.isInitializing = false;
          this.connectionPromise = null;
          reject(error);
        });

      } catch (error) {
        console.error('Failed to initialize real-time service:', error);
        this.isInitializing = false;
        this.connectionPromise = null;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  // Backward-compatible helper used by older components
  // Accepts just the JWT token and derives userId/role from localStorage
  ensureConnection(token: string): Promise<void> {
    try {
      const raw = localStorage.getItem('user');
      const parsed = raw ? JSON.parse(raw) : {};
      const userId = parsed._id || parsed.id || '';
      const role = parsed.role || 'patient';
      return this.initialize(token, userId, role);
    } catch {
      return this.initialize(token, '', 'patient');
    }
  }

  // Backward-compatible event helpers expected by some components
  on(eventType: string, handler: Function): void {
    this.onUpdate(eventType, handler);
  }

  off(eventType: string, handler: Function): void {
    this.offUpdate(eventType, handler);
  }

  unsubscribeFromProofUpdates(): void {
    ['proof_created','proof_updated','proof_shared','proof_revoked','proof_expired'].forEach((t) => {
      const handlers = this.updateHandlers.get(t) || [];
      handlers.forEach((h) => this.offUpdate(t, h));
    });
    if (this.socket) {
      ['proof:created','proof:updated','proof:shared','proof:revoked','proof:expired'].forEach((evt) => this.socket!.off(evt));
    }
  }

  // Setup event listeners
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from real-time service:', reason);
      this.isConnected = false;
    });

    // Message events
    this.socket.on('message', (message: RealtimeMessage) => {
      this.handleMessage(message);
    });

    // Stats events
    this.socket.on('stats_update', (stats: RealtimeStats) => {
      this.handleStatsUpdate(stats);
    });

    // General updates
    this.socket.on('update', (update: RealtimeUpdate) => {
      this.handleUpdate(update);
    });

    // Proof-related events (server emits with colon form)
    const proofEventMap: Record<string, string> = {
      'proof:created': 'proof_created',
      'proof:updated': 'proof_updated',
      'proof:shared': 'proof_shared',
      'proof:revoked': 'proof_revoked',
      'proof:expired': 'proof_expired'
    };
    Object.entries(proofEventMap).forEach(([serverEvent, clientType]) => {
      this.socket!.on(serverEvent, (data: any) => {
        this.handleUpdate({ type: clientType, data, timestamp: new Date().toISOString() });
      });
    });

    // Hospital-specific events
    this.socket.on('hospital_capacity_update', (data: any) => {
      this.handleUpdate({ type: 'hospital_capacity_update', data, timestamp: new Date().toISOString() });
    });

    this.socket.on('hospital_announcement', (data: any) => {
      this.handleUpdate({ type: 'hospital_announcement', data, timestamp: new Date().toISOString() });
    });

    this.socket.on('appointment_update', (data: any) => {
      this.handleUpdate({ type: 'appointment_update', data, timestamp: new Date().toISOString() });
    });

    this.socket.on('admission_update', (data: any) => {
      this.handleUpdate({ type: 'admission_update', data, timestamp: new Date().toISOString() });
    });

    this.socket.on('emergency_alert', (data: any) => {
      this.handleUpdate({ type: 'emergency_alert', data, timestamp: new Date().toISOString() });
    });

    // Patient-specific events
    this.socket.on('patient_appointment_confirmed', (data: any) => {
      this.handleUpdate({ type: 'patient_appointment_confirmed', data, timestamp: new Date().toISOString() });
    });

    this.socket.on('patient_emergency_response', (data: any) => {
      this.handleUpdate({ type: 'patient_emergency_response', data, timestamp: new Date().toISOString() });
    });

    this.socket.on('patient_message_received', (data: any) => {
      this.handleUpdate({ type: 'patient_message_received', data, timestamp: new Date().toISOString() });
    });

    // Error handling
    this.socket.on('error', (error: any) => {
      console.error('Real-time service error:', error);
      toast.error('Real-time connection error');
    });
  }

  // Setup reconnection logic
  private setupReconnectionLogic(): void {
    if (!this.socket) return;

    this.socket.on('reconnect_attempt', (attemptNumber: number) => {
      console.log(`Reconnection attempt ${attemptNumber}`);
      this.reconnectAttempts = attemptNumber;
    });

    this.socket.on('reconnect', (attemptNumber: number) => {
      console.log(`Reconnected after ${attemptNumber} attempts`);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      // Don't show toast for reconnections to avoid spam
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Failed to reconnect after maximum attempts');
      this.isConnected = false;
      toast.error('Real-time connection lost', {
        description: 'Please refresh the page to reconnect.'
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from real-time service:', reason);
      this.isConnected = false;
      
      // Only show disconnect toast if it's not a normal disconnect or server disconnect
      if (reason !== 'io client disconnect' && reason !== 'io server disconnect') {
        toast.error('Real-time connection lost', {
          description: 'Attempting to reconnect...'
        });
      }
    });

    // Add error handling
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.isConnected = false;
    });

    // Add connect_error handling
    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.isConnected = false;
      this.isInitializing = false;
      this.connectionPromise = null;
    });
  }

  // Handle incoming messages
  private handleMessage(message: RealtimeMessage): void {
    console.log('Received message:', message);
    
    // Show toast notification
    if (message.type === 'emergency') {
      toast.error(message.title, { description: message.message });
    } else if (message.type === 'notification') {
      toast.info(message.title, { description: message.message });
    } else {
      toast(message.title, { description: message.message });
    }

    // Trigger message handlers
    const handlers = this.messageHandlers.get(message.type) || [];
    handlers.forEach(handler => handler(message));
  }

  // Handle stats updates
  private handleStatsUpdate(stats: RealtimeStats): void {
    console.log('Stats update:', stats);
    
    // Trigger stats handlers
    const handlers = this.statsHandlers.get('stats_update') || [];
    handlers.forEach(handler => handler(stats));
  }

  // Handle general updates
  private handleUpdate(update: RealtimeUpdate): void {
    console.log('Update received:', update);
    
    // Trigger update handlers
    const handlers = this.updateHandlers.get(update.type) || [];
    handlers.forEach(handler => handler(update));
  }

  // Join rooms
  joinRoom(roomName: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_room', roomName);
      console.log(`Joined room: ${roomName}`);
    }
  }

  leaveRoom(roomName: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_room', roomName);
      console.log(`Left room: ${roomName}`);
    }
  }

  // Send messages
  sendMessage(roomName: string, message: string, messageType: string = 'text'): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_message', {
        room: roomName,
        message,
        messageType,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Send updates
  sendUpdate(type: string, data: any): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_update', {
        type,
        data,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Subscribe to message events
  onMessage(type: string, handler: Function): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type)!.push(handler);
  }

  // Subscribe to stats updates
  onStatsUpdate(handler: Function): void {
    if (!this.statsHandlers.has('stats_update')) {
      this.statsHandlers.set('stats_update', []);
    }
    this.statsHandlers.get('stats_update')!.push(handler);
  }

  // Subscribe to updates
  onUpdate(type: string, handler: Function): void {
    if (!this.updateHandlers.has(type)) {
      this.updateHandlers.set(type, []);
    }
    this.updateHandlers.get(type)!.push(handler);
  }

  // Unsubscribe from events
  offMessage(type: string, handler: Function): void {
    const handlers = this.messageHandlers.get(type) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  offStatsUpdate(handler: Function): void {
    const handlers = this.statsHandlers.get('stats_update') || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  offUpdate(type: string, handler: Function): void {
    const handlers = this.updateHandlers.get(type) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  // Get connection status
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Get detailed connection info
  getConnectionInfo(): {
    isConnected: boolean;
    isInitializing: boolean;
    reconnectAttempts: number;
    socketId?: string;
  } {
    return {
      isConnected: this.isConnected,
      isInitializing: this.isInitializing,
      reconnectAttempts: this.reconnectAttempts,
      socketId: this.socket?.id
    };
  }

  // Disconnect
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.isInitializing = false;
      this.connectionPromise = null;
      this.hasShownInitialConnection = false;
      this.messageHandlers.clear();
      this.statsHandlers.clear();
      this.updateHandlers.clear();
    }
  }

  // Reset connection state (useful for page refreshes)
  resetConnectionState(): void {
    this.hasShownInitialConnection = false;
    this.reconnectAttempts = 0;
  }

  // Manual reconnect
  async reconnect(token: string, userId: string, userRole: string): Promise<void> {
    console.log('Manual reconnect requested');
    this.disconnect();
    this.resetConnectionState();
    return this.initialize(token, userId, userRole);
  }
}

export default new RealtimeService(); 