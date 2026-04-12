import type { SectionKey } from '../../../types/templateConfig';

/**
 * Origin where the wedding-web preview app is served. Override at build time
 * via `VITE_PREVIEW_ORIGIN` in .env. Defaults to local Next dev server.
 */
export const PREVIEW_ORIGIN: string =
  (import.meta.env.VITE_PREVIEW_ORIGIN as string) || 'http://localhost:3001';

/**
 * Build the preview URL that the iframe loads. `mode=edit` hides the preview
 * banner and enables the postMessage listener in the preview page.
 */
export function buildPreviewUrl(themeSlug: string = 'songphung-red'): string {
  return `${PREVIEW_ORIGIN}/w/preview/${themeSlug}?mode=edit`;
}

/**
 * Human labels + ordering hints for each section shown in the sidebar.
 */
export const SECTION_META: Record<SectionKey, { label: string; description: string }> = {
  cover:     { label: 'Bìa thiệp',      description: 'Màn hình chào đầu tiên' },
  hero:      { label: 'Hero',           description: 'Phượng hoàng + tên cặp đôi' },
  family:    { label: 'Gia đình',       description: 'Thông tin hai bên gia đình' },
  ceremony:  { label: 'Lễ cưới',        description: 'Thời gian, địa điểm, RSVP' },
  countdown: { label: 'Đếm ngược',      description: 'Đồng hồ đếm ngược ngày cưới' },
  gallery:   { label: 'Thư viện ảnh',   description: 'Album ảnh cưới' },
  wishes:    { label: 'Lời chúc',       description: 'Sổ lưu bút khách mời' },
  bank:      { label: 'Mừng cưới',      description: 'Tài khoản nhận mừng + QR' },
  footer:    { label: 'Footer',         description: 'Kết thúc thiệp' },
};

export const ALL_SECTION_KEYS: SectionKey[] = [
  'cover',
  'hero',
  'family',
  'ceremony',
  'countdown',
  'gallery',
  'wishes',
  'bank',
  'footer',
];
