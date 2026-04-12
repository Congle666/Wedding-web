import api from './axios';
import type { ApiResponse, PaginatedData, Template, TemplateCategory } from '../types';

export interface TemplateListParams {
  page?: number;
  limit?: number;
  category_id?: number | string;
  has_video?: string;
  sort?: string;
  search?: string;
}

export interface TemplateFormData {
  category_id: number;
  name: string;
  slug: string;
  thumbnail_url?: string;
  preview_images?: string[];
  price_per_day: number;
  price_per_month: number;
  customizable_fields?: Array<{ key: string; label: string; type: string; default: string }>;
  description?: string;
  html_content?: string;
  theme_slug?: string;
  has_video: boolean;
  is_active: boolean;
}

export const templateApi = {
  list: (params: TemplateListParams = {}) =>
    api.get<ApiResponse<PaginatedData<Template>>>('/templates', { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get(`/admin/templates/${id}`).then((r) => r.data),

  getCategories: () =>
    api.get<ApiResponse<TemplateCategory[]>>('/categories').then((r) => r.data),

  create: (data: TemplateFormData) =>
    api.post<ApiResponse<Template>>('/admin/templates', data).then((r) => r.data),

  update: (id: string, data: TemplateFormData) =>
    api.put<ApiResponse<Template>>(`/admin/templates/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/admin/templates/${id}`).then((r) => r.data),

  createCategory: (data: Partial<TemplateCategory>) =>
    api.post('/admin/categories', data).then((r) => r.data),

  updateCategory: (id: number, data: Partial<TemplateCategory>) =>
    api.put(`/admin/categories/${id}`, data).then((r) => r.data),

  deleteCategory: (id: number) =>
    api.delete(`/admin/categories/${id}`).then((r) => r.data),
};
