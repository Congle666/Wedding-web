import api from './axios';

export interface TemplateListParams {
  page?: number;
  limit?: number;
  category_id?: string;
  sort?: string;
  search?: string;
  has_video?: boolean;
}

export interface Template {
  id: string;
  slug: string;
  name: string;
  description: string;
  thumbnail_url: string;
  price_per_day: number;
  price_per_month: number;
  category_id: number;
  category: { id: number; name: string; slug: string };
  is_free: boolean;
  has_video: boolean;
  is_active: boolean;
  view_count: number;
  preview_images: string[] | null;
  customizable_fields: { key: string; label: string; type: string; default: string }[] | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
}

// All functions unwrap Axios response and return the backend body:
// { success, data, message }
// For list endpoints: data = { items: T[], total, page, limit }
// For single endpoints: data = T
// For array endpoints (categories, banners): data = T[]
export const templateApi = {
  // Returns { success, data: { items: Template[], total, page, limit } }
  list(params?: TemplateListParams) {
    return api.get('/templates', { params }).then((r) => r.data);
  },

  // Returns { success, data: Template }
  getBySlug(slug: string) {
    return api.get('/templates/' + slug).then((r) => r.data);
  },

  // Returns { success, data: Category[] }
  getCategories() {
    return api.get('/categories').then((r) => r.data);
  },
};
