import api from './api';
import { Message } from '../types';

interface MessagesResponse {
  status: string;
  data: {
    messages: Message[];
  };
}

interface MessageResponse {
  status: string;
  data: {
    message: Message;
  };
}

export const messageService = {
  /**
   * Get messages for a user
   */
  async getMessages(userId: string): Promise<Message[]> {
    const response = await api.get<MessagesResponse>(`/messages/user/${userId}`);
    return response.data.data.messages;
  },

  /**
   * Send a message
   */
  async sendMessage(data: {
    senderId: string;
    recipientId: string;
    subject: string;
    content: string;
    attachments?: string[];
  }): Promise<Message> {
    const response = await api.post<MessageResponse>('/messages', data);
    return response.data.data.message;
  },

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string): Promise<void> {
    await api.patch(`/messages/${messageId}/read`);
  },

  /**
   * Delete message
   */
  async deleteMessage(messageId: string): Promise<void> {
    await api.delete(`/messages/${messageId}`);
  },
};

export default messageService;
