/**
 * Types pour les événements Socket.io
 */

// Événements côté client (emit)
export interface ClientToServerEvents {
  // Authentification et connexion
  authenticate: (token: string) => void;
  'join-room': (userId: string) => void;
  'leave-room': (userId: string) => void;

  // Messagerie
  'send-message': (data: SendMessageData) => void;
  'typing-start': (data: TypingData) => void;
  'typing-stop': (data: TypingData) => void;
  'message-read': (messageId: string) => void;

  // Notifications
  'mark-notification-read': (notificationId: string) => void;

  // Présence
  'user-status': (status: 'online' | 'offline' | 'away') => void;
}

// Événements côté serveur (emit vers clients)
export interface ServerToClientEvents {
  // Messagerie
  'new-message': (data: NewMessageData) => void;
  'message-sent': (data: MessageSentData) => void;
  'message-delivered': (messageId: string) => void;
  'message-read': (data: MessageReadData) => void;
  'typing-indicator': (data: TypingIndicatorData) => void;

  // Notifications
  'new-notification': (notification: NotificationData) => void;
  'notification-update': (notification: NotificationData) => void;

  // Présence utilisateur
  'user-online': (userId: string) => void;
  'user-offline': (userId: string) => void;
  'user-status-change': (data: UserStatusData) => void;

  // Progrès et activités
  'progress-update': (data: ProgressUpdateData) => void;
  'activity-completed': (data: ActivityCompletedData) => void;
  'reward-unlocked': (data: RewardUnlockedData) => void;

  // Système
  authenticated: (userId: string) => void;
  'auth-error': (error: string) => void;
  error: (error: SocketError) => void;
}

// Données inter-serveur
export interface InterServerEvents {
  ping: () => void;
}

// Données de socket
export interface SocketData {
  userId?: string;
  userName?: string;
  userRole?: string;
  authenticated: boolean;
}

// ============ Types de données ============

export interface SendMessageData {
  recipientId: string;
  subject: string;
  content: string;
  attachments?: string[];
}

export interface NewMessageData {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  subject: string;
  content: string;
  attachments: string[];
  createdAt: string;
}

export interface MessageSentData {
  messageId: string;
  recipientId: string;
  timestamp: string;
}

export interface MessageReadData {
  messageId: string;
  readBy: string;
  readAt: string;
}

export interface TypingData {
  conversationId: string;
  userId: string;
}

export interface TypingIndicatorData {
  userId: string;
  userName: string;
  isTyping: boolean;
}

export interface NotificationData {
  id: string;
  userId: string;
  type: 'message' | 'progress' | 'reward' | 'activity' | 'system';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface UserStatusData {
  userId: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: string;
}

export interface ProgressUpdateData {
  childId: string;
  tokensEarned: number;
  totalActivitiesCompleted: number;
  currentStreak: number;
}

export interface ActivityCompletedData {
  childId: string;
  activityId: string;
  activityTitle: string;
  successRate: number;
  tokensEarned: number;
}

export interface RewardUnlockedData {
  childId: string;
  rewardId: string;
  rewardName: string;
  rewardType: string;
}

export interface SocketError {
  message: string;
  code?: string;
  details?: any;
}

// Type pour les rooms (salles)
export type RoomId = string;

// Constantes pour les événements
export const SOCKET_EVENTS = {
  // Client to Server
  AUTHENTICATE: 'authenticate',
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',
  SEND_MESSAGE: 'send-message',
  TYPING_START: 'typing-start',
  TYPING_STOP: 'typing-stop',
  MESSAGE_READ: 'message-read',
  MARK_NOTIFICATION_READ: 'mark-notification-read',
  USER_STATUS: 'user-status',

  // Server to Client
  NEW_MESSAGE: 'new-message',
  MESSAGE_SENT: 'message-sent',
  MESSAGE_DELIVERED: 'message-delivered',
  MESSAGE_READ_EVENT: 'message-read',
  TYPING_INDICATOR: 'typing-indicator',
  NEW_NOTIFICATION: 'new-notification',
  NOTIFICATION_UPDATE: 'notification-update',
  USER_ONLINE: 'user-online',
  USER_OFFLINE: 'user-offline',
  USER_STATUS_CHANGE: 'user-status-change',
  PROGRESS_UPDATE: 'progress-update',
  ACTIVITY_COMPLETED: 'activity-completed',
  REWARD_UNLOCKED: 'reward-unlocked',
  AUTHENTICATED: 'authenticated',
  AUTH_ERROR: 'auth-error',
  ERROR: 'error',
} as const;
