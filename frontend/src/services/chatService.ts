import api from './api';

export const chatService = {
  async createChat(title?: string) {
    const response = await api.post('/api/chat', { title });
    return response.data;
  },

  async getUserChats() {
    const response = await api.get('/api/chat');
    return response.data;
  },

  async getChatById(chatId: string) {
    const response = await api.get(`/api/chat/${chatId}`);
    return response.data;
  },

  async sendMessage(chatId: string, content: string) {
    const response = await api.post(`/api/chat/${chatId}/messages`, {
      content,
    });
    return response.data;
  },

  async updateChat(chatId: string, title: string) {
    const response = await api.put(`/api/chat/${chatId}`, { title });
    return response.data;
  },

  async deleteChat(chatId: string) {
    const response = await api.delete(`/api/chat/${chatId}`);
    return response.data;
  },
};