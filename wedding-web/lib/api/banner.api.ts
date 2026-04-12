import api from './axios';

export interface Banner {
  id: number;
  title: string;
  image_url: string;
  image_mobile_url: string;
  link_url: string;
  link_target: string;
  position: string;
  sort_order: number;
  is_active: boolean;
  started_at: string | null;
  ended_at: string | null;
  click_count: number;
  view_count: number;
}

// Returns { success, data: Banner[] }
export const bannerApi = {
  list(position?: string) {
    return api.get('/banners', { params: position ? { position } : undefined }).then((r) => r.data);
  },
};
