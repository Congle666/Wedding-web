import api from './axios';
import type { ApiResponse, PaginatedData, Order, WeddingInfo, OrderStatus, Guest } from '../types';

export interface OrderListParams {
  page?: number;
  limit?: number;
  status?: string;
}

export const orderApi = {
  list: (params: OrderListParams = {}) =>
    api.get<ApiResponse<PaginatedData<Order>>>('/admin/orders', { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiResponse<Order>>(`/orders/${id}`).then((r) => r.data),

  updateStatus: (id: string, status: OrderStatus) =>
    api.put<ApiResponse<Order>>(`/admin/orders/${id}/status`, { status }).then((r) => r.data),

  getWeddingInfo: (orderId: string) =>
    api.get<ApiResponse<WeddingInfo | null>>(`/orders/${orderId}/wedding`).then((r) => r.data),

  // Guests
  getGuests: (orderId: string) =>
    api.get<ApiResponse<Guest[]>>(`/orders/${orderId}/guests`).then((r) => r.data),

  createGuest: (orderId: string, data: { name: string; phone?: string; group_name?: string; side?: string; notes?: string }) =>
    api.post<ApiResponse<Guest>>(`/orders/${orderId}/guests`, data).then((r) => r.data),

  updateGuest: (orderId: string, guestId: string, data: Partial<Guest>) =>
    api.put<ApiResponse<Guest>>(`/orders/${orderId}/guests/${guestId}`, data).then((r) => r.data),

  deleteGuest: (orderId: string, guestId: string) =>
    api.delete<ApiResponse<null>>(`/orders/${orderId}/guests/${guestId}`).then((r) => r.data),
};
