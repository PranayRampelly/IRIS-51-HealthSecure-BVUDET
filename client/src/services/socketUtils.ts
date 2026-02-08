import io from 'socket.io-client';

export interface SocketConfig {
  url: string;
  path?: string;
  transports?: string[];
  timeout?: number;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  reconnectionDelayMax?: number;
  maxReconnectionAttempts?: number;
  autoConnect?: boolean;
  query?: Record<string, any>;
  auth?: Record<string, any>;
}

export class SocketManager {
  private socket: any = null;
  private config: SocketConfig;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectTimer: any = null;

  constructor(config: SocketConfig) {
    this.config = {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      maxReconnectionAttempts: 10,
      autoConnect: true,
      ...config
    };
  }

  connect(): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        // Close existing socket if it exists
        if (this.socket) {
          this.socket.disconnect();
        }

        // Create new socket connection with improved error handling
        // Ensure auth is properly formatted as an object to prevent parse errors
        const authData = this.config.auth || {};
        const queryData = this.config.query || {};

        // Validate and format auth data
        let formattedAuth: any = {};
        if (authData && typeof authData === 'object') {
          formattedAuth = authData;
        } else if (authData && typeof authData === 'string') {
          // If auth is a string (like a token), wrap it properly
          formattedAuth = { token: authData };
        }

        // Ensure query is an object
        const formattedQuery: any = queryData && typeof queryData === 'object' ? queryData : {};

        this.socket = io(this.config.url, {
          path: this.config.path,
          transports: ['websocket', 'polling'], // Ensure WebSocket is preferred but fallback to polling
          timeout: 20000,
          forceNew: true,
          reconnection: true,
          reconnectionAttempts: 10, // Increase attempts
          reconnectionDelay: 2000, // Slightly longer delay for stability
          reconnectionDelayMax: 10000,
          autoConnect: this.config.autoConnect,
          query: formattedQuery,
          auth: formattedAuth,
          withCredentials: true,
          randomizationFactor: 0.5
        } as any);

        // Set up event handlers
        this.setupEventHandlers();

        // Handle connection success
        this.socket.on('connect', () => {
          console.log('Socket connected successfully');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve(this.socket);
        });

        // Handle connection error
        this.socket.on('connect_error', (error: any) => {
          console.error('Socket connection error:', error);
          this.isConnected = false;
          reject(error);
        });

        // Always initiate connection and resolve only after successful connect
        if (!this.socket.connected) {
          this.socket.connect();
        }
      } catch (error) {
        console.error('Failed to create socket connection:', error);
        reject(error);
      }
    });
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('disconnect', (reason: any) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;

      // Attempt to reconnect if not manually disconnected
      if (reason === 'io server disconnect') {
        this.socket.connect();
      }
    });

    this.socket.on('reconnect', (attemptNumber: any) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_error', (error: any) => {
      console.error('Socket reconnection error:', error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.isConnected = false;
      }
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed after all attempts');
      this.isConnected = false;
    });

    this.socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  emit(event: string, data?: any): void {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  }

  on(event: string, callback: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  joinRoom(room: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-room', room);
    }
  }

  leaveRoom(room: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-room', room);
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  getSocket(): any {
    return this.socket;
  }

  // Utility method to check if socket is ready
  isReady(): boolean {
    return this.socket !== null && this.isConnected;
  }

  // Method to manually reconnect
  reconnect(): Promise<any> {
    this.disconnect();
    return this.connect();
  }

  // Method to update auth token and reconnect
  updateAuthToken(token: string): Promise<any> {
    this.config.auth = { ...this.config.auth, token };
    return this.reconnect();
  }

  // Method to check if token is available
  hasValidToken(): boolean {
    const token = this.config.auth?.token;
    return token && token.length > 0;
  }
}

// Helper function to get token from localStorage (either direct token or from user object)
const getAuthToken = (): string => {
  // First try to get token directly
  let token = localStorage.getItem('token');

  // If not found, try to get it from user data stored by AuthContext
  if (!token) {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        token = user.token;
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }
  }

  return token || '';
};

// Create a singleton instance for appointment service
export const appointmentSocketManager = new SocketManager({
  url: import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000',
  query: {
    client: 'appointment-service'
  },
  auth: {
    token: getAuthToken()
  },
  autoConnect: false // Don't auto-connect, wait for explicit connection
});

// Create a singleton instance for proof request service
export const proofRequestSocketManager = new SocketManager({
  url: import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000',
  query: {
    client: 'proof-request-service'
  },
  auth: {
    token: getAuthToken()
  },
  autoConnect: false // Don't auto-connect, wait for explicit connection
});

// Utility function to create socket managers
export const createSocketManager = (config: SocketConfig): SocketManager => {
  return new SocketManager(config);
};

// Utility function to check if WebSocket is supported
export const isWebSocketSupported = (): boolean => {
  return typeof WebSocket !== 'undefined';
};

// Utility function to get optimal transport method
export const getOptimalTransport = (): string[] => {
  if (isWebSocketSupported()) {
    return ['websocket', 'polling'];
  }
  return ['polling'];
};

// Utility function to handle connection errors
export const handleSocketError = (error: any): void => {
  console.error('Socket error occurred:', error);

  // You can add custom error handling logic here
  // For example, show a toast notification to the user
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('socket-error', {
      detail: { error: error.message || 'Connection error' }
    }));
  }
};

// Utility function to validate socket configuration
export const validateSocketConfig = (config: SocketConfig): boolean => {
  if (!config.url) {
    console.error('Socket URL is required');
    return false;
  }

  if (config.timeout && config.timeout < 1000) {
    console.error('Socket timeout must be at least 1000ms');
    return false;
  }

  if (config.reconnectionAttempts && config.reconnectionAttempts < 1) {
    console.error('Reconnection attempts must be at least 1');
    return false;
  }

  return true;
}; 