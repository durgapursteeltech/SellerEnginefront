import { io, Socket } from 'socket.io-client';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dst-engine-uat.onrender.com';
//const API_BASE_URL = 'https://sellerengine.onrender.com';
const API_BASE_URL = 'http://localhost:3002';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(token?: string): void {
    try {
      // Determine WebSocket protocol based on API URL protocol
      const isSecure = API_BASE_URL.startsWith('https://');
      const wsProtocol = isSecure ? 'wss://' : 'ws://';

      // Extract base URL without protocol for socket connection
      const socketUrl = API_BASE_URL.replace(/^https?:\/\//, '');

      this.socket = io(`${wsProtocol}${socketUrl}`, {
        auth: {
          token: token || (typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null)
        },
        transports: ['websocket'],
        timeout: 10000,
      });

      this.setupEventListeners();
      
    } catch (error) {
      console.error('Error connecting to socket:', error);
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Register as admin user
      this.registerAsAdmin();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
      
      if (reason === 'io server disconnect') {
        this.handleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
      this.handleReconnect();
    });

    this.socket.on('supportMessage', (data) => {
      console.log('Received support message:', data);
      // Emit custom event for components to listen to
      this.socket?.emit('supportMessageReceived', data);
    });

    this.socket.on('groupMessage', (data) => {
      console.log('Received group message:', data);
      // Emit custom event for components to listen to
      this.socket?.emit('groupMessageReceived', data);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  private registerAsAdmin(): void {
    if (this.socket) {
      this.socket.emit('register', {
        userId: 99999, // Use numeric admin ID
        userRole: 'superadmin'
      });
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  // Method to listen for support messages (legacy - one-on-one)
  onSupportMessage(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('supportMessage', callback);
    }
  }

  // Method to remove support message listener (legacy)
  offSupportMessage(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.off('supportMessage', callback);
    }
  }

  // Method to listen for group messages
  onGroupMessage(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('groupMessage', callback);
    }
  }

  // Method to remove group message listener
  offGroupMessage(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.off('groupMessage', callback);
    }
  }

  // Method to emit custom events
  emit(event: string, data: any): void {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }

  // Method to listen for custom events
  on(event: string, callback: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Method to remove event listeners
  off(event: string, callback?: (...args: any[]) => void): void {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.removeAllListeners(event);
      }
    }
  }

  // Method to disconnect
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Method to check connection status
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Method to get socket instance
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Create and export singleton instance
export const socketService = new SocketService();
export default socketService;
