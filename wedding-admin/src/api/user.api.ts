import api from './axios';
import type { ApiResponse, PaginatedData, Order } from '../types';

// Users are extracted from orders since no dedicated /users admin endpoint
export const userApi = {
  getOrdersForUsers: (params: { page?: number; limit?: number } = {}) =>
    api.get<ApiResponse<PaginatedData<Order>>>('/admin/orders', { params: { ...params, limit: 200 } }).then((r) => r.data),
};
