/**
 * Lấy chữ cái viết tắt từ tên
 * getInitials("Nguyen Van A") → "NVA"
 */
export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

/**
 * Tính phần trăm tiết kiệm khi thanh toán theo tháng so với theo ngày
 * calculateSavings(50000, 1200000) → percent saved
 */
export function calculateSavings(daily: number, monthly: number): number {
  const dailyTotal = daily * 30;
  if (dailyTotal === 0) return 0;
  const saved = ((dailyTotal - monthly) / dailyTotal) * 100;
  return Math.round(saved * 100) / 100;
}

/**
 * Gộp tên lớp CSS, lọc bỏ giá trị falsy
 * cn('btn', isActive && 'btn-active', null) → "btn btn-active"
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Giới hạn giá trị trong khoảng [min, max]
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
