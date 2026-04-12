import api from './axios';
import type { ApiResponse, Banner, BannerPosition } from '../types';

export interface BannerFormData {
  title: string;
  image_url: string;
  image_mobile_url?: string;
  link_url?: string;
  link_target?: '_self' | '_blank';
  position: BannerPosition;
  sort_order: number;
  is_active: boolean;
  started_at?: string;
  ended_at?: string;
}

export const bannerApi = {
  list: (position?: string) =>
    api.get<ApiResponse<Banner[]>>('/banners', { params: position ? { position } : {} }).then((r) => r.data),

  create: (data: BannerFormData) =>
    api.post<ApiResponse<Banner>>('/admin/banners', data).then((r) => r.data),

  update: (id: number, data: BannerFormData) =>
    api.put<ApiResponse<Banner>>(`/admin/banners/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/admin/banners/${id}`).then((r) => r.data),
};
