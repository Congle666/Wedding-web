import api from './axios';
import type { ApiResponse, PaginatedData, Review } from '../types';

export const reviewApi = {
  listPending: (params: { page?: number; limit?: number } = {}) =>
    api.get<ApiResponse<PaginatedData<Review>>>('/admin/reviews', { params }).then((r) => r.data),

  approve: (id: string) =>
    api.put<ApiResponse<Review>>(`/admin/reviews/${id}/approve`).then((r) => r.data),
};
