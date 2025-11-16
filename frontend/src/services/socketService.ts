/**
 * Service Socket.io pour le frontend
 * Gère la connexion WebSocket et les événements temps réel
 */

import { io, Socket } from 'socket.io-client';

// Types des événements (doivent correspondre au backend)
interface ServerToClientEvents {
  'new-message': (data: any) => void;
  'message-sent': (data: any) => void;
  'message-read': (data: any) => void;
  'typing-indicator': (data: any) => void;
  'new-notification': (notification: any) => void;
  'user-online': (userId: string) => void;
  'user-offline': (userId: string) => void;
  'user-status-change': (data: any) => void;
  'progress-update': (data: any) => void;
  'activity-completed': (data: any) => void;
  'reward-unlocked': (data: any) => void;
  authenticated: (userId: string) => void;
  'auth-error': (error: string) => void;
  error: (error: any) => void;
}

interface ClientToServerEvents {
  authenticate: (token: string) => void;
  'join-room': (userId: string) => void;
  'leave-room': (userId: string) => void;
  'send-message': (data: any) => void;
  'typing-start': (data: any) => void;
  'typing-stop': (data: any) => void;
  'message-read': (messageId: string) => void;
  'mark-notification-read': (notificationId: string) => void;
  'user-status': (status: 'online' | 'offline' | 'away') => void;
}

type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>;

class SocketService {
  private socket: SocketType | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, Set<Function>> = new Map();

  /**
   * Se connecter au serveur Socket.io
   */
  connect(token: string): void {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    this.socket = io(serverUrl, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    }) as SocketType;

    this.setupEventHandlers();
  }

  /**
   * Configurer les gestionnaires d'événements
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;

      // S'authentifier avec le token
      const token = localStorage.getItem('authToken');
      if (token) {
        this.socket?.emit('authenticate', token);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('authenticated', (userId) => {
      console.log('🔐 Authenticated as user:', userId);
      this.emit('authenticated', userId);
    });

    this.socket.on('auth-error', (error) => {
      console.error('Authentication error:', error);
      this.emit('auth-error', error);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.emit('error', error);
    });

    // Événements de messagerie
    this.socket.on('new-message', (data) => {
      console.log('📨 New message received:', data);
      this.emit('new-message', data);
    });

    this.socket.on('message-sent', (data) => {
      console.log('✉️ Message sent:', data);
      this.emit('message-sent', data);
    });

    this.socket.on('message-read', (data) => {
      console.log('👁️ Message read:', data);
      this.emit('message-read', data);
    });

    this.socket.on('typing-indicator', (data) => {
      this.emit('typing-indicator', data);
    });

    // Événements de notifications
    this.socket.on('new-notification', (notification) => {
      console.log('🔔 New notification:', notification);
      this.emit('new-notification', notification);
    });

    // Événements de présence
    this.socket.on('user-online', (userId) => {
      console.log('🟢 User online:', userId);
      this.emit('user-online', userId);
    });

    this.socket.on('user-offline', (userId) => {
      console.log('🔴 User offline:', userId);
      this.emit('user-offline', userId);
    });

    this.socket.on('user-status-change', (data) => {
      this.emit('user-status-change', data);
    });

    // Événements de progrès
    this.socket.on('progress-update', (data) => {
      console.log('📊 Progress update:', data);
      this.emit('progress-update', data);
    });

    this.socket.on('activity-completed', (data) => {
      console.log('🎯 Activity completed:', data);
      this.emit('activity-completed', data);
    });

    this.socket.on('reward-unlocked', (data) => {
      console.log('🏆 Reward unlocked:', data);
      this.emit('reward-unlocked', data);
    });
  }

  /**
   * Se déconnecter
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * Rejoindre une room
   */
  joinRoom(userId: string): void {
    if (!this.socket) return;
    this.socket.emit('join-room', userId);
  }

  /**
   * Quitter une room
   */
  leaveRoom(userId: string): void {
    if (!this.socket) return;
    this.socket.emit('leave-room', userId);
  }

  /**
   * Envoyer un message
   */
  sendMessage(data: {
    recipientId: string;
    subject: string;
    content: string;
    attachments?: string[];
  }): void {
    if (!this.socket) return;
    this.socket.emit('send-message', data);
  }

  /**
   * Indiquer que l'utilisateur tape
   */
  startTyping(conversationId: string, userId: string): void {
    if (!this.socket) return;
    this.socket.emit('typing-start', { conversationId, userId });
  }

  /**
   * Indiquer que l'utilisateur a arrêté de taper
   */
  stopTyping(conversationId: string, userId: string): void {
    if (!this.socket) return;
    this.socket.emit('typing-stop', { conversationId, userId });
  }

  /**
   * Marquer un message comme lu
   */
  markMessageAsRead(messageId: string): void {
    if (!this.socket) return;
    this.socket.emit('message-read', messageId);
  }

  /**
   * Changer le statut utilisateur
   */
  setUserStatus(status: 'online' | 'offline' | 'away'): void {
    if (!this.socket) return;
    this.socket.emit('user-status', status);
  }

  /**
   * Marquer une notification comme lue
   */
  markNotificationAsRead(notificationId: string): void {
    if (!this.socket) return;
    this.socket.emit('mark-notification-read', notificationId);
  }

  /**
   * S'abonner à un événement
   */
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  /**
   * Se désabonner d'un événement
   */
  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  /**
   * Émettre un événement aux listeners locaux
   */
  private emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  /**
   * Vérifier si le socket est connecté
   */
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  /**
   * Obtenir l'ID du socket
   */
  getSocketId(): string | undefined {
    return this.socket?.id;
  }
}

// Exporter une instance unique (singleton)
export const socketService = new SocketService();

// Export du type pour utilisation dans les composants
export type { SocketService };
