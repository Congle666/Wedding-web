export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string;
  role: string;
  provider: 'local' | 'google' | 'facebook';
  provider_id?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface TemplateCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  sort_order: number;
  is_active: boolean;
}

export interface CustomizableField {
  key: string;
  label: string;
  type: string;
  default: string;
}

export interface Template {
  id: string;
  category_id: number;
  category: TemplateCategory;
  name: string;
  slug: string;
  thumbnail_url: string;
  preview_images: string[] | null;
  price_per_day: number;
  price_per_month: number;
  customizable_fields: CustomizableField[] | null;
  description: string;
  is_free: boolean;
  has_video: boolean;
  is_active: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  min_order: number;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export type OrderStatus = 'pending' | 'paid' | 'published' | 'expired' | 'cancelled';

export interface OrderItem {
  id: string;
  order_id: string;
  template_id: string;
  template: Template;
  price_snapshot: number;
  config_snapshot: Record<string, unknown>;
}

export interface Order {
  id: string;
  user_id: string;
  user: User;
  status: OrderStatus;
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
  coupon?: Coupon;
  order_items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface WeddingInfo {
  id: string;
  order_id: string;
  groom_name: string;
  bride_name: string;
  groom_parent: string;
  bride_parent: string;
  groom_photo_url: string;
  bride_photo_url: string;
  groom_address: string;
  bride_address: string;
  wedding_date: string | null;
  lunar_date: string;
  wedding_time: string;
  ceremony_time: string;
  ceremony_venue: string;
  ceremony_address: string;
  ceremony_maps_url: string;
  reception_venue: string;
  reception_time: string;
  reception_address: string;
  reception_maps_url: string;
  venue_address: string;
  maps_embed_url: string;
  event_description: string;
  gallery_urls: string[] | null;
  guest_book_config: Record<string, unknown> | null;
  rsvp_config: Record<string, unknown> | null;
  bank_accounts: { bank: string; account: string; name: string }[] | null;
  music_url: string;
  view_count: number;
  visible_sections: Record<string, boolean> | null;
  updated_at: string;
}

export interface Guest {
  id: string;
  order_id: string;
  name: string;
  slug: string;
  phone: string;
  group_name: string;
  side: 'groom' | 'bride' | 'both';
  notes: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  provider: string;
  transaction_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  method: string;
  gateway_response: Record<string, unknown> | null;
  paid_at: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  user: User;
  template_id: string;
  template: Template;
  order_id: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
}

export type BannerPosition = 'home_top' | 'home_middle' | 'home_bottom' | 'template_list' | 'checkout' | 'popup';

export interface Banner {
  id: number;
  title: string;
  image_url: string;
  image_mobile_url: string;
  link_url: string;
  link_target: '_self' | '_blank';
  position: BannerPosition;
  sort_order: number;
  is_active: boolean;
  started_at: string | null;
  ended_at: string | null;
  click_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
