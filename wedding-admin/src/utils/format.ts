import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('vi-VN').format(num);
}

export function formatCompactNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '\u2014';
  return dayjs(date).format('DD [tháng] M, YYYY');
}

export function formatShortDate(date: string | null | undefined): string {
  if (!date) return '\u2014';
  return dayjs(date).format('DD/MM/YYYY');
}

export function formatDateTime(date: string | null | undefined): string {
  if (!date) return '\u2014';
  return dayjs(date).format('HH:mm DD/MM/YYYY');
}

export function formatRelative(date: string | null | undefined): string {
  if (!date) return '\u2014';
  return dayjs(date).fromNow();
}

export function formatChartDate(date: string): string {
  return dayjs(date).format('DD/MM');
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function truncateOrderId(id: string): string {
  return `ORD-${id.substring(0, 4).toUpperCase()}`;
}
