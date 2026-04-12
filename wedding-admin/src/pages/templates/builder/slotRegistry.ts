import type { SectionKey } from '../../../types/templateConfig';

export interface SlotDef {
  /** Path inside `cfg.assets`: [sectionKey, slotKey] */
  section: keyof NonNullable<import('../../../types/templateConfig').TemplateConfig['assets']> | string;
  slotKey: string;
  label: string;
  hint?: string;
  /** Recommended aspect ratio displayed to the admin */
  aspect?: string;
  /** true if this slot lives under `assets.global` */
  global?: boolean;
}

/**
 * Canonical registry of every configurable asset slot in songphung-red.
 * Each entry tells the builder which sub-key of `cfg.assets.<section>` it
 * controls and what to label in the UI.
 *
 * IMPORTANT: keys here must match the slot keys used by `EditableSlot`
 * wrappers inside the theme components — the cross-iframe drop handler
 * trusts these keys verbatim.
 */
export const SLOT_REGISTRY: Record<SectionKey | 'global', SlotDef[]> = {
  cover: [
    { section: 'cover', slotKey: 'phoenix_left',  label: 'Phượng hoàng trái',  hint: 'PNG/WebP nền trong suốt', aspect: '4:7' },
    { section: 'cover', slotKey: 'phoenix_right', label: 'Phượng hoàng phải',  hint: 'PNG/WebP nền trong suốt', aspect: '4:7' },
    { section: 'cover', slotKey: 'flower_tl',     label: 'Hoa góc trên',       hint: 'Decorative', aspect: '1:1' },
    { section: 'cover', slotKey: 'flower_br',     label: 'Hoa góc dưới',       hint: 'Decorative', aspect: '1:1' },
    { section: 'cover', slotKey: 'chu_hy',        label: 'Chữ Hỷ',             hint: 'Biểu tượng Song Hỷ', aspect: '1:1' },
    { section: 'cover', slotKey: 'paper_bg',      label: 'Nền giấy thiệp',     hint: 'Texture nền, lặp được', aspect: 'tile' },
  ],
  hero: [
    { section: 'hero', slotKey: 'phoenix_left',  label: 'Phượng trái (Hero)', aspect: '4:7' },
    { section: 'hero', slotKey: 'phoenix_right', label: 'Phượng phải (Hero)', aspect: '4:7' },
    { section: 'hero', slotKey: 'chu_hy',        label: 'Chữ Hỷ (Hero)',      aspect: '1:1' },
  ],
  family: [
    { section: 'family', slotKey: 'flower',      label: 'Hoa trang trí',     aspect: '1:1' },
    { section: 'family', slotKey: 'groom_photo', label: 'Ảnh chú rể (mẫu)',  hint: 'Ảnh mẫu — khách upload sẽ override', aspect: '1:1' },
    { section: 'family', slotKey: 'bride_photo', label: 'Ảnh cô dâu (mẫu)',  hint: 'Ảnh mẫu — khách upload sẽ override', aspect: '1:1' },
  ],
  ceremony: [
    { section: 'ceremony', slotKey: 'decor_top_left',     label: 'Decor góc trên trái',  hint: 'Phượng/decor', aspect: '4:7' },
    { section: 'ceremony', slotKey: 'decor_bottom_right', label: 'Decor góc dưới phải',  hint: 'Phượng/decor', aspect: '4:7' },
    { section: 'ceremony', slotKey: 'decor_flower',       label: 'Hoa góc dưới trái',    aspect: '1:1' },
  ],
  countdown: [
    { section: 'countdown', slotKey: 'flower', label: 'Hoa trang trí Đếm ngược', aspect: '1:1' },
  ],
  gallery: [
    { section: 'gallery', slotKey: 'flower', label: 'Hoa trang trí Album', aspect: '1:1' },
  ],
  wishes: [
    { section: 'wishes', slotKey: 'decor_phoenix', label: 'Phượng decor (Sổ lưu bút)', aspect: '4:7' },
    { section: 'wishes', slotKey: 'decor_flower',  label: 'Hoa decor (Sổ lưu bút)',    aspect: '1:1' },
  ],
  bank: [
    { section: 'bank', slotKey: 'flower', label: 'Hoa decor (Mừng cưới)', aspect: '1:1' },
  ],
  footer: [],
  global:    [{ section: 'global', slotKey: 'music_url', label: 'Nhạc nền (URL)', hint: 'MP3 file, .wav nếu cần' }],
};
