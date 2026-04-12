import api from './axios';

export interface Review {
  id: string;
  user_id: string;
  user: { id: string; full_name: string; email: string };
  template_id: string;
  template: { id: string; name: string; slug: string };
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
}

// Returns { success, data: { items: Review[], total, page, limit } }
export const reviewApi = {
  listByTemplate(templateId: string, params?: { page?: number; limit?: number }) {
    return api.get('/reviews/template/' + templateId, { params }).then((r) => r.data);
  },

  create(templateId: string, data: { rating: number; comment: string }) {
    return api.post('/reviews/template/' + templateId, data).then((r) => r.data);
  },
};
