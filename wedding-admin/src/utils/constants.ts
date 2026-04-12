import type { OrderStatus, BannerPosition } from '../types';

export const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; text: string; bg: string; border: string }> = {
  pending:   { label: 'Chờ thanh toán', text: '#92400E', bg: '#FEF3C7', border: '#FCD34D' },
  paid:      { label: 'Đã thanh toán',  text: '#1E40AF', bg: '#EFF6FF', border: '#93C5FD' },
  published: { label: 'Đang hiển thị',  text: '#065F46', bg: '#ECFDF5', border: '#6EE7B7' },
  expired:   { label: 'Hết hạn',        text: '#374151', bg: '#F3F4F6', border: '#D1D5DB' },
  cancelled: { label: 'Đã huỷ',         text: '#991B1B', bg: '#FEF2F2', border: '#FCA5A5' },
};

export const BANNER_POSITION_LABELS: Record<BannerPosition, string> = {
  home_top: 'Đầu trang chủ',
  home_middle: 'Giữa trang chủ',
  home_bottom: 'Cuối trang chủ',
  template_list: 'Trang mẫu thiệp',
  checkout: 'Trang thanh toán',
  popup: 'Popup',
};

export const PROVIDER_LABELS: Record<string, string> = {
  local: 'Email',
  google: 'Google',
  facebook: 'Facebook',
};
