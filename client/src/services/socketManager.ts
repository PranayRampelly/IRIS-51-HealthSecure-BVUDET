import { io, Socket } from 'socket.io-client';

export class SocketManager {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private eventListeners: Map<string, Array<(data: any) => void>> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket(): void {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No authentication token found');
        return;
      }

      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
      
      this.socket = io(socketUrl, {
        auth: { token },
        transports: ['websocket'],
        autoConnect: false
      });

      this.setupEventHandlers();
    } catch (error) {
      console.error('Error initializing socket:', error);
    }
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
      
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.socket?.connect();
      } else if (this.reconnectAttempts < this.maxReconnectAttempts) {
        // Client disconnected, attempt reconnection with exponential backoff
        setTimeout(() => {
          this.reconnectAttempts++;
          this.reconnectDelay *= 2;
          this.socket?.connect();
        }, this.reconnectDelay);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
    });

    // Handle custom events
    this.socket.onAny((eventName: string, ...args: any[]) => {
      if (this.eventListeners.has(eventName)) {
        this.eventListeners.get(eventName)?.forEach(callback => {
          try {
            callback(...args);
          } catch (error) {
            console.error(`Error in event listener for ${eventName}:`, error);
          }
        });
      }
    });
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not initialized'));
        return;
      }

      if (this.isConnected) {
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 10000);

      this.socket.once('connect', () => {
        clearTimeout(timeout);
        resolve();
      });

      this.socket.once('connect_error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });

      this.socket.connect();
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  emit(event: string, data?: any): void {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  }

  on(event: string, callback: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)?.push(callback);
  }

  off(event: string, callback?: (data: any) => void): void {
    if (!this.eventListeners.has(event)) return;

    if (callback) {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    } else {
      this.eventListeners.delete(event);
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Method to check if socket is ready
  isReady(): boolean {
    return this.socket !== null && this.isConnected;
  }

  // Method to get socket instance (for advanced usage)
  getSocket(): Socket | null {
    return this.socket;
  }
}
