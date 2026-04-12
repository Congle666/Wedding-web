export function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function calculateSavingsPercent(daily: number, monthly: number): number {
  if (!daily || !monthly) return 0;
  const fullPrice = daily * 30;
  if (fullPrice <= 0) return 0;
  return Math.round(((fullPrice - monthly) / fullPrice) * 100);
}

export function getBannerDisplayStatus(banner: { is_active: boolean; started_at: string | null; ended_at: string | null }): {
  label: string;
  color: string;
} {
  if (!banner.is_active) return { label: 'Đã ẩn', color: '#6B6B6B' };
  const now = new Date();
  if (banner.started_at && new Date(banner.started_at) > now) return { label: 'Chưa đến hạn', color: '#92400E' };
  if (banner.ended_at && new Date(banner.ended_at) < now) return { label: 'Hết hạn', color: '#374151' };
  return { label: 'Đang hiển thị', color: '#065F46' };
}
