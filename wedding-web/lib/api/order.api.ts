import api from './axios';

export interface OrderListParams {
  page?: number;
  limit?: number;
  status?: string;
}

export interface Order {
  id: string;
  user_id: string;
  user: { id: string; full_name: string; email: string };
  status: string;
  package_type: 'daily' | 'monthly';
  rental_start: string | null;
  rental_end: string | null;
  duration_days: number;
  subtotal: number;
  discount: number;
  total: number;
  custom_domain: string;
  published_url: string;
  coupon_id?: string;
  coupon?: { id: string; code: string; type: string; value: number };
  order_items: { id: string; template_id: string; template: { id: string; name: string; slug: string; thumbnail_url: string }; price_snapshot: number }[];
  created_at: string;
  updated_at: string;
}

export interface WeddingInfo {
  id?: string;
  order_id?: string;
  groom_name: string;
  bride_name: string;
  groom_parent: string;
  bride_parent: string;
  wedding_date: string | null;
  wedding_time: string;
  ceremony_venue: string;
  reception_venue: string;
  venue_address: string;
  maps_embed_url: string;
  event_description: string;
  gallery_urls: string[] | null;
  guest_book_config: Record<string, unknown> | null;
  rsvp_config: Record<string, unknown> | null;
  bank_accounts: { bank: string; account: string; name: string }[] | null;
  [key: string]: unknown;
}

export interface CreateOrderData {
  package_type: string;
  rental_start: string;
  duration_days: number;
  items: { template_id: string }[];
  coupon_code?: string;
  custom_domain?: string;
}

// All functions return the backend response body: { success, data, message }
// For lists: data = { items: T[], total, page, limit }
// For single: data = T
export const orderApi = {
  list(params?: OrderListParams) {
    return api.get('/orders', { params }).then((r) => r.data);
  },

  getById(id: string) {
    return api.get('/orders/' + id).then((r) => r.data);
  },

  create(data: CreateOrderData) {
    return api.post('/orders', data).then((r) => r.data);
  },

  cancel(id: string) {
    return api.put('/orders/' + id + '/cancel').then((r) => r.data);
  },

  getWeddingInfo(orderId: string) {
    return api.get('/orders/' + orderId + '/wedding').then((r) => r.data);
  },

  updateWeddingInfo(orderId: string, data: Partial<WeddingInfo>) {
    return api.put('/orders/' + orderId + '/wedding', data).then((r) => r.data);
  },

  publish(orderId: string) {
    return api.post('/orders/' + orderId + '/publish').then((r) => r.data);
  },
};
