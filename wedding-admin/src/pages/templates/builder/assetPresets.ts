/**
 * Hardcoded asset presets for the songphung-red theme. Each preset is a static
 * file served by wedding-web under `/themes/songphung-red/`. Admin can drag
 * these into slots in the builder or click to apply.
 *
 * When adding a new preset:
 *  1. Place file under `wedding-web/public/themes/songphung-red/`
 *  2. Add entry here with the correct `category` so it surfaces in the right slot.
 *
 * Categories map to the visual role of the image, not to a specific slot —
 * the same `phoenix` preset can be applied to both `cover.phoenix_left` and
 * `hero.phoenix_right`. The `AssetLibrary` component filters by category
 * depending on which slot is currently active.
 */

export type PresetCategory =
  | 'phoenix'
  | 'chu_hy'
  | 'flower'
  | 'paper_bg'
  | 'photo';

export interface AssetPreset {
  url: string;
  label: string;
  category: PresetCategory;
  /** Compatible slot keys — used to show only relevant presets per slot */
  slots: string[];
}

/**
 * NOTE: Preview URLs use the wedding-web origin so the admin (Vite :5173)
 * can render them. Use `resolvePresetUrl` below to convert to absolute.
 * Stored value in `customizable_fields` is the relative `/themes/...` path
 * — the public site reads it directly under same-origin.
 */
export const SONGPHUNG_PRESETS: AssetPreset[] = [
  // Phượng hoàng — dùng cho cover, hero, ceremony, wishes
  {
    url: '/themes/songphung-red/phoenix.webp',
    label: 'Phượng hoàng cổ điển',
    category: 'phoenix',
    slots: ['phoenix_left', 'phoenix_right', 'decor_top_left', 'decor_bottom_right', 'decor_phoenix'],
  },
  {
    url: '/themes/songphung-red/phoenix2.webp',
    label: 'Phượng hoàng biến thể',
    category: 'phoenix',
    slots: ['phoenix_left', 'phoenix_right', 'decor_top_left', 'decor_bottom_right', 'decor_phoenix'],
  },
  {
    url: '/themes/songphung-red/phoenix-line.webp',
    label: 'Phượng hoàng nét mảnh',
    category: 'phoenix',
    slots: ['phoenix_left', 'phoenix_right', 'decor_top_left', 'decor_bottom_right', 'decor_phoenix'],
  },

  // Chữ Hỷ — Song Hỷ các biến thể
  {
    url: '/themes/songphung-red/chu-hy.webp',
    label: 'Chữ Hỷ truyền thống',
    category: 'chu_hy',
    slots: ['chu_hy'],
  },
  {
    url: '/themes/songphung-red/double-happiness.png',
    label: 'Song Hỷ vector',
    category: 'chu_hy',
    slots: ['chu_hy'],
  },
  {
    url: '/themes/songphung-red/double-happiness.svg',
    label: 'Song Hỷ SVG',
    category: 'chu_hy',
    slots: ['chu_hy'],
  },
  {
    url: '/themes/songphung-red/hy-symbol.png',
    label: 'Hỷ đơn giản',
    category: 'chu_hy',
    slots: ['chu_hy'],
  },

  // Hoa trang trí
  {
    url: '/themes/songphung-red/flower.webp',
    label: 'Hoa đỏ truyền thống',
    category: 'flower',
    slots: ['flower', 'flower_tl', 'flower_br', 'decor_flower'],
  },

  // Nền giấy
  {
    url: '/themes/songphung-red/paper-bg.jpg',
    label: 'Giấy nền cổ',
    category: 'paper_bg',
    slots: ['paper_bg'],
  },
  {
    url: '/themes/songphung-red/paper-texture.jpg',
    label: 'Giấy dó',
    category: 'paper_bg',
    slots: ['paper_bg'],
  },
];

/**
 * Return presets compatible with a given slot key. Fallback: if no preset
 * explicitly lists this slot, return all presets (so admin can still browse).
 */
export function getPresetsForSlot(slotKey: string): AssetPreset[] {
  const matches = SONGPHUNG_PRESETS.filter((p) => p.slots.includes(slotKey));
  return matches.length > 0 ? matches : SONGPHUNG_PRESETS;
}

/**
 * Convert a relative preset URL into an absolute one that the admin app
 * (running on a different origin) can load thumbnails from. Reads the same
 * `VITE_PREVIEW_ORIGIN` used by the iframe preview to guarantee they agree.
 */
export function resolvePresetUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  const origin = (import.meta.env.VITE_PREVIEW_ORIGIN as string) || 'http://localhost:3001';
  return `${origin}${url}`;
}
