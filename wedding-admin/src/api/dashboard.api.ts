import api from './axios';
import type { ApiResponse, PaginatedData, Order, Review, Template } from '../types';

export const dashboardApi = {
  getOrders: (params: { page?: number; limit?: number; status?: string } = {}) =>
    api.get<ApiResponse<PaginatedData<Order>>>('/admin/orders', { params }).then((r) => r.data),

  getPendingReviews: (params: { page?: number; limit?: number } = {}) =>
    api.get<ApiResponse<PaginatedData<Review>>>('/admin/reviews', { params }).then((r) => r.data),

  getTemplates: (params: { page?: number; limit?: number } = {}) =>
    api.get<ApiResponse<PaginatedData<Template>>>('/templates', { params }).then((r) => r.data),

  getStats: (period: string) =>
    api.get('/admin/dashboard/stats', { params: { period } }).then((r) => r.data),
};
