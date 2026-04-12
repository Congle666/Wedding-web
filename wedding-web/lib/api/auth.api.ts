import api from './axios';

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  avatar_url: string;
  provider: string;
  is_verified: boolean;
}

// All return { success, data, message }
export const authApi = {
  register(data: { full_name: string; email: string; phone?: string; password: string }) {
    return api.post('/auth/register', data).then((r) => r.data);
  },

  login(data: { email: string; password: string }) {
    return api.post('/auth/login', data).then((r) => r.data);
  },

  getMe() {
    return api.get('/auth/me').then((r) => r.data);
  },
};
