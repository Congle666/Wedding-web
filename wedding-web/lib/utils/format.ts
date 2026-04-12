import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('vi');

/**
 * Định dạng số tiền theo đơn vị VND
 * formatVND(500000) → "500.000 ₫"
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

/**
 * Định dạng số với dấu phân cách hàng nghìn
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('vi-VN').format(num);
}

/**
 * Định dạng số rút gọn
 * formatCompactNumber(1200) → "1.2K"
 */
export function formatCompactNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

/**
 * Định dạng ngày tiếng Việt
 * formatDateVN(date) → "24 tháng 3, 2026"
 */
export function formatDateVN(date: string | Date): string {
  return dayjs(date).format('D [tháng] M, YYYY');
}

/**
 * Định dạng ngày ngắn gọn
 * formatDateShort(date) → "24/03/2026"
 */
export function formatDateShort(date: string | Date): string {
  return dayjs(date).format('DD/MM/YYYY');
}

/**
 * Định dạng thời gian tương đối
 * formatRelative(date) → "3 giờ trước"
 */
export function formatRelative(date: string | Date): string {
  return dayjs(date).fromNow();
}

const VIETNAMESE_DIACRITICS_MAP: Record<string, string> = {
  à: 'a', á: 'a', ả: 'a', ã: 'a', ạ: 'a',
  ă: 'a', ắ: 'a', ằ: 'a', ẳ: 'a', ẵ: 'a', ặ: 'a',
  â: 'a', ấ: 'a', ầ: 'a', ẩ: 'a', ẫ: 'a', ậ: 'a',
  đ: 'd',
  è: 'e', é: 'e', ẻ: 'e', ẽ: 'e', ẹ: 'e',
  ê: 'e', ế: 'e', ề: 'e', ể: 'e', ễ: 'e', ệ: 'e',
  ì: 'i', í: 'i', ỉ: 'i', ĩ: 'i', ị: 'i',
  ò: 'o', ó: 'o', ỏ: 'o', õ: 'o', ọ: 'o',
  ô: 'o', ố: 'o', ồ: 'o', ổ: 'o', ỗ: 'o', ộ: 'o',
  ơ: 'o', ớ: 'o', ờ: 'o', ở: 'o', ỡ: 'o', ợ: 'o',
  ù: 'u', ú: 'u', ủ: 'u', ũ: 'u', ụ: 'u',
  ư: 'u', ứ: 'u', ừ: 'u', ử: 'u', ữ: 'u', ự: 'u',
  ỳ: 'y', ý: 'y', ỷ: 'y', ỹ: 'y', ỵ: 'y',
};

function removeDiacritics(str: string): string {
  return str
    .split('')
    .map((char) => VIETNAMESE_DIACRITICS_MAP[char] || VIETNAMESE_DIACRITICS_MAP[char.toLowerCase()]?.toUpperCase() || char)
    .join('');
}

/**
 * Định dạng tên miền: viết thường, bỏ dấu, thay khoảng trắng bằng gạch ngang
 */
export function formatDomain(str: string): string {
  return removeDiacritics(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Tạo slug: viết thường, bỏ dấu, thay khoảng trắng bằng gạch ngang
 */
export function slugify(str: string): string {
  return removeDiacritics(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}
