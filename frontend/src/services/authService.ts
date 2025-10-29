import api from './api';

export const authService = {
  async signup(username: string, email: string, password: string) {
    const response = await api.post('/api/auth/signup', {
      username,
      email,
      password,
    });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async login(email: string, password: string) {
    const response = await api.post('/api/auth/login', {
      email,
      password,
    });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async googleAuth(token: string) {
    const response = await api.post('/api/auth/google', { token });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async verifyToken() {
    const response = await api.get('/api/auth/verify');
    return response.data;
  },

  // NEW: Get organization credits
  async getOrganizationCredits() {
    const response = await api.get('/api/chat/credits');
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },
};