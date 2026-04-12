/**
 * Song Phụng Đỏ preset — populates the builder canvas with all 9 blocks
 * and their default element positions extracted from the hardcoded CSS
 * in wedding-web/components/themes/songphung-red/*.
 *
 * Admin clicks "Dùng mẫu Song Phụng Đỏ" → this preset loads into Puck.
 * Each element position is in % of its block container.
 */

import type {
  BuilderConfig,
  BlockInstance,
  ElementInstance,
  GlobalStyles,
} from '../../../../types/builderConfig';
import { DEFAULT_GLOBAL_STYLES, DEFAULT_ELEMENT_STYLE, DEFAULT_ELEMENT_ANIMATION } from '../../../../types/builderConfig';

function img(
  id: string,
  src: string,
  x: number, y: number, w: number, h: number,
  category: string,
  overrides?: Partial<ElementInstance>
): ElementInstance {
  return {
    id,
    type: 'image',
    position: { x, y, width: w, height: h },
    style: { ...DEFAULT_ELEMENT_STYLE, ...(overrides?.style || {}) },
    animation: { ...DEFAULT_ELEMENT_ANIMATION, ...(overrides?.animation || {}) },
    content: src,
    locked: false,
    category,
  };
}

function txt(
  id: string,
  content: string,
  x: number, y: number, w: number,
  overrides?: Partial<ElementInstance>
): ElementInstance {
  return {
    id,
    type: 'text',
    position: { x, y, width: w, height: 0 },
    style: {
      ...DEFAULT_ELEMENT_STYLE,
      color: '#5F191D',
      fontSize: 16,
      fontFamily: "'Cormorant Garamond', serif",
      fontWeight: 400,
      ...(overrides?.style || {}),
    },
    animation: { ...DEFAULT_ELEMENT_ANIMATION, ...(overrides?.animation || {}) },
    content,
    locked: false,
    category: 'text',
  };
}

// ─── Cover Block ──────────────────────────────────

const COVER_ELEMENTS: ElementInstance[] = [
  img('cover-phoenix-left', '/themes/songphung-red/phoenix.webp', -5, 60, 30, 0, 'phoenix', {
    animation: { ...DEFAULT_ELEMENT_ANIMATION, type: 'slideInLeft', duration: 1000, delay: 400 },
  }),
  img('cover-phoenix-right', '/themes/songphung-red/phoenix2.webp', 75, -5, 30, 0, 'phoenix', {
    style: { ...DEFAULT_ELEMENT_STYLE, flipX: true },
    animation: { ...DEFAULT_ELEMENT_ANIMATION, type: 'slideInRight', duration: 1000, delay: 400 },
  }),
  img('cover-flower-br', '/themes/songphung-red/flower.webp', 15, 80, 20, 0, 'flower', {
    style: { ...DEFAULT_ELEMENT_STYLE, opacity: 0.7 },
  }),
  img('cover-flower-tl', '/themes/songphung-red/flower.webp', 55, -3, 17, 0, 'flower', {
    style: { ...DEFAULT_ELEMENT_STYLE, opacity: 0.5, rotation: 180 },
  }),
  img('cover-chu-hy', '/themes/songphung-red/chu-hy.webp', 45, 15, 8, 0, 'symbol'),
  txt('cover-greeting', 'Trân trọng kính mời', 20, 72, 60, {
    style: { ...DEFAULT_ELEMENT_STYLE, fontSize: 17, fontStyle: 'italic', color: '#5F191D' },
  }),
  txt('cover-subtext', 'đến dự buổi tiệc chung vui cùng gia đình', 15, 85, 70, {
    style: { ...DEFAULT_ELEMENT_STYLE, fontSize: 14, fontStyle: 'italic', color: '#5F191D', opacity: 0.8 },
  }),
];

// ─── Hero Block ───────────────────────────────────

const HERO_ELEMENTS: ElementInstance[] = [
  img('hero-phoenix-left', '/themes/songphung-red/phoenix.webp', -3, 10, 40, 0, 'phoenix', {
    animation: { ...DEFAULT_ELEMENT_ANIMATION, type: 'slideInLeft', duration: 1000, delay: 400 },
  }),
  img('hero-phoenix-right', '/themes/songphung-red/phoenix2.webp', 63, -5, 40, 0, 'phoenix', {
    style: { ...DEFAULT_ELEMENT_STYLE, flipX: true },
    animation: { ...DEFAULT_ELEMENT_ANIMATION, type: 'slideInRight', duration: 1000, delay: 400 },
  }),
  img('hero-chu-hy', '/themes/songphung-red/chu-hy.webp', 35, 30, 30, 0, 'symbol', {
    animation: { ...DEFAULT_ELEMENT_ANIMATION, type: 'scaleIn', duration: 1200, delay: 300 },
  }),
  img('hero-flower', '/themes/songphung-red/flower.webp', 68, 55, 25, 0, 'flower', {
    style: { ...DEFAULT_ELEMENT_STYLE, opacity: 0.4, flipX: true },
  }),
];

// ─── Family Block ─────────────────────────────────

const FAMILY_ELEMENTS: ElementInstance[] = [
  img('family-flower', '/themes/songphung-red/flower.webp', 70, -8, 55, 0, 'flower', {
    style: { ...DEFAULT_ELEMENT_STYLE, opacity: 0.35, flipX: true },
    animation: { ...DEFAULT_ELEMENT_ANIMATION, type: 'parallax', parallaxSpeed: 0.03, triggerOn: 'scroll' },
  }),
  txt('family-title', 'Thông Tin Lễ Cưới', 25, 5, 50, {
    style: { ...DEFAULT_ELEMENT_STYLE, fontSize: 24, fontWeight: 700, color: '#5F191D' },
  }),
];

// ─── Ceremony Block ───────────────────────────────

const CEREMONY_ELEMENTS: ElementInstance[] = [
  img('ceremony-decor-tl', '/themes/songphung-red/phoenix-line.webp', -15, -8, 45, 0, 'phoenix', {
    style: { ...DEFAULT_ELEMENT_STYLE, opacity: 0.30 },
    animation: { ...DEFAULT_ELEMENT_ANIMATION, type: 'parallax', parallaxSpeed: -0.02, triggerOn: 'scroll' },
  }),
  img('ceremony-decor-br', '/themes/songphung-red/phoenix-line.webp', 65, 75, 50, 0, 'phoenix', {
    style: { ...DEFAULT_ELEMENT_STYLE, opacity: 0.25, flipX: true },
    animation: { ...DEFAULT_ELEMENT_ANIMATION, type: 'parallax', parallaxSpeed: 0.03, triggerOn: 'scroll' },
  }),
  img('ceremony-flower', '/themes/songphung-red/flower.webp', -12, 70, 50, 0, 'flower', {
    style: { ...DEFAULT_ELEMENT_STYLE, opacity: 0.30 },
    animation: { ...DEFAULT_ELEMENT_ANIMATION, type: 'parallax', parallaxSpeed: 0.04, triggerOn: 'scroll' },
  }),
];

// ─── Countdown Block ──────────────────────────────

const COUNTDOWN_ELEMENTS: ElementInstance[] = [
  img('countdown-flower', '/themes/songphung-red/flower.webp', 72, -15, 40, 0, 'flower', {
    style: { ...DEFAULT_ELEMENT_STYLE, opacity: 0.30, flipX: true },
  }),
  txt('countdown-title', 'Cùng Đếm Ngược', 25, 8, 50, {
    style: { ...DEFAULT_ELEMENT_STYLE, fontSize: 24, fontWeight: 700, color: '#5F191D' },
  }),
];

// ─── Gallery Block ────────────────────────────────

const GALLERY_ELEMENTS: ElementInstance[] = [
  img('gallery-flower', '/themes/songphung-red/flower.webp', -12, -10, 45, 0, 'flower', {
    style: { ...DEFAULT_ELEMENT_STYLE, opacity: 0.30 },
  }),
  txt('gallery-title', 'Album Ảnh Cưới', 30, 5, 40, {
    style: { ...DEFAULT_ELEMENT_STYLE, fontSize: 24, fontWeight: 700, color: '#5F191D' },
  }),
];

// ─── Wishes Block ─────────────────────────────────

const WISHES_ELEMENTS: ElementInstance[] = [
  img('wishes-phoenix', '/themes/songphung-red/phoenix-line.webp', 65, 65, 45, 0, 'phoenix', {
    style: { ...DEFAULT_ELEMENT_STYLE, opacity: 0.25, flipX: true },
  }),
  img('wishes-flower', '/themes/songphung-red/flower.webp', -10, 70, 45, 0, 'flower', {
    style: { ...DEFAULT_ELEMENT_STYLE, opacity: 0.30 },
  }),
  txt('wishes-title', 'Sổ lưu bút', 30, 5, 40, {
    style: { ...DEFAULT_ELEMENT_STYLE, fontSize: 24, fontWeight: 700, color: '#5F191D' },
  }),
];

// ─── Bank Block ───────────────────────────────────

const BANK_ELEMENTS: ElementInstance[] = [
  img('bank-flower', '/themes/songphung-red/flower.webp', -10, 65, 45, 0, 'flower', {
    style: { ...DEFAULT_ELEMENT_STYLE, opacity: 0.30 },
  }),
  txt('bank-title', 'Hộp Mừng Cưới', 28, 5, 44, {
    style: { ...DEFAULT_ELEMENT_STYLE, fontSize: 24, fontWeight: 700, color: '#5F191D' },
  }),
];

// ─── Footer Block ─────────────────────────────────

const FOOTER_ELEMENTS: ElementInstance[] = [
  txt('footer-thanks', 'Sự hiện diện của quý khách là niềm vinh hạnh của gia đình chúng tôi!', 10, 30, 80, {
    style: { ...DEFAULT_ELEMENT_STYLE, fontSize: 18, fontStyle: 'italic', color: '#F8F2ED' },
  }),
];

// ─── Full Preset ──────────────────────────────────

function block(id: string, blockType: string, elements: ElementInstance[]): BlockInstance {
  return {
    id,
    blockType: blockType as any,
    visible: true,
    elements,
    settings: {},
  };
}

export const SONGPHUNG_RED_PRESET: BuilderConfig = {
  version: '2.0',
  blocks: [
    block('sp-cover', 'cover-songphung', COVER_ELEMENTS),
    block('sp-hero', 'hero-songphung', HERO_ELEMENTS),
    block('sp-family', 'family-default', FAMILY_ELEMENTS),
    block('sp-ceremony', 'ceremony-default', CEREMONY_ELEMENTS),
    block('sp-countdown', 'countdown-default', COUNTDOWN_ELEMENTS),
    block('sp-gallery', 'gallery-default', GALLERY_ELEMENTS),
    block('sp-wishes', 'wishes-default', WISHES_ELEMENTS),
    block('sp-bank', 'bank-default', BANK_ELEMENTS),
    block('sp-footer', 'footer-default', FOOTER_ELEMENTS),
  ],
  globalStyles: { ...DEFAULT_GLOBAL_STYLES },
};

/**
 * Preset registry — future themes added here.
 */
export const PRESET_REGISTRY: Record<string, { label: string; description: string; config: BuilderConfig }> = {
  'songphung-red': {
    label: 'Song Phụng Đỏ',
    description: 'Mẫu truyền thống với phượng hoàng + chữ Hỷ, tông đỏ cổ điển',
    config: SONGPHUNG_RED_PRESET,
  },
};
