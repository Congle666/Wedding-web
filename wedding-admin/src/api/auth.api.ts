import api from './axios';
import type { ApiResponse, LoginRequest, LoginResponse, User } from '../types';

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<ApiResponse<LoginResponse>>('/auth/login', data).then((r) => r.data),

  getMe: () =>
    api.get<ApiResponse<User>>('/auth/me').then((r) => r.data),
};
