/**
 * BuilderConfig v2.0 — Hybrid section-block template builder schema.
 *
 * KEEP IN SYNC WITH:
 *   - wedding-web/types/builderConfig.ts
 *   - GoLang_Wedding/models/builder_config.go
 *
 * v1.0 (TemplateConfig) = flat slot-based config.
 * v2.0 (BuilderConfig)  = composable blocks with positionable elements.
 * Renderer detects version field and routes accordingly.
 */

// ─── Block Types ───────────────────────────────────────────

export type BlockType =
  | 'cover-songphung'
  | 'hero-songphung'
  | 'family-default'
  | 'ceremony-default'
  | 'countdown-default'
  | 'gallery-default'
  | 'wishes-default'
  | 'bank-default'
  | 'footer-default';

// ─── Element Types ─────────────────────────────────────────

export type ElementType = 'image' | 'text' | 'shape' | 'divider';

export type AnimationType =
  | 'none'
  | 'fadeIn'
  | 'fadeInUp'
  | 'slideInLeft'
  | 'slideInRight'
  | 'scaleIn'
  | 'parallax';

export interface ElementPosition {
  /** Percentage (0-100) from left edge of block container */
  x: number;
  /** Percentage (0-100) from top edge of block container */
  y: number;
  /** Percentage of block width (0 = auto-size from content) */
  width: number;
  /** Percentage of block height (0 = auto-size from content) */
  height: number;
}

export interface ElementStyle {
  opacity: number;
  zIndex: number;
  rotation: number;
  flipX: boolean;
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  fontStyle?: 'normal' | 'italic';
}

export interface ElementAnimation {
  type: AnimationType;
  /** Duration in ms (300-2000) */
  duration: number;
  /** Delay in ms (0-2000) */
  delay: number;
  triggerOn: 'load' | 'scroll';
  /** Only for parallax type (-0.05 to 0.05) */
  parallaxSpeed?: number;
}

export interface ElementInstance {
  id: string;
  type: ElementType;
  position: ElementPosition;
  style: ElementStyle;
  animation: ElementAnimation;
  /** Image URL (for type=image) or text content (for type=text) */
  content: string;
  /** Structural elements can't be deleted by admin */
  locked: boolean;
  /** Asset category hint for library filtering */
  category?: string;
}

export interface BlockSettings {
  [key: string]: any;
}

export interface BlockInstance {
  id: string;
  blockType: BlockType;
  visible: boolean;
  elements: ElementInstance[];
  settings: BlockSettings;
}

// ─── Global Styles ─────────────────────────────────────────

export interface GlobalStyles {
  colors: {
    primary: string;
    background: string;
    text: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  paperBg?: string;
  musicUrl?: string;
}

// ─── Root Config ───────────────────────────────────────────

export interface BuilderConfig {
  version: '2.0';
  blocks: BlockInstance[];
  globalStyles: GlobalStyles;
}

// ─── Limits ────────────────────────────────────────────────

export const MAX_BLOCKS_PER_CONFIG = 20;
export const MAX_ELEMENTS_PER_BLOCK = 50;

// ─── Type Guards ───────────────────────────────────────────

export function isBuilderConfig(cfg: any): cfg is BuilderConfig {
  return cfg?.version === '2.0' && Array.isArray(cfg?.blocks);
}

export function isLegacyConfig(cfg: any): boolean {
  return cfg?.version === '1.0' || (!cfg?.version && cfg?.base_theme);
}

// ─── Defaults ──────────────────────────────────────────────

export const DEFAULT_ELEMENT_STYLE: ElementStyle = {
  opacity: 1,
  zIndex: 1,
  rotation: 0,
  flipX: false,
};

export const DEFAULT_ELEMENT_ANIMATION: ElementAnimation = {
  type: 'fadeIn',
  duration: 600,
  delay: 0,
  triggerOn: 'scroll',
};

export const DEFAULT_GLOBAL_STYLES: GlobalStyles = {
  colors: {
    primary: '#5F191D',
    background: '#F8F2ED',
    text: '#2C1810',
    accent: '#C8963C',
  },
  fonts: {
    heading: 'Cormorant Garamond',
    body: 'Be Vietnam Pro',
  },
  paperBg: '/themes/songphung-red/paper-bg.jpg',
  musicUrl: '/themes/songphung-red/music.mp3',
};

export function createEmptyBuilderConfig(): BuilderConfig {
  return {
    version: '2.0',
    blocks: [],
    globalStyles: { ...DEFAULT_GLOBAL_STYLES },
  };
}

// ─── Animation Presets (for inspector dropdown) ────────────

export const ANIMATION_PRESETS: { value: AnimationType; label: string }[] = [
  { value: 'none', label: 'Không có' },
  { value: 'fadeIn', label: 'Hiện dần' },
  { value: 'fadeInUp', label: 'Hiện dần + lên' },
  { value: 'slideInLeft', label: 'Trượt từ trái' },
  { value: 'slideInRight', label: 'Trượt từ phải' },
  { value: 'scaleIn', label: 'Phóng to dần' },
  { value: 'parallax', label: 'Parallax cuộn' },
];

// ─── Block Type Labels ─────────────────────────────────────

export const BLOCK_TYPE_META: Record<BlockType, { label: string; description: string }> = {
  'cover-songphung': { label: 'Bìa thiệp (Song Phụng)', description: 'Màn hình chào đầu tiên với phượng hoàng + chữ Hỷ' },
  'hero-songphung': { label: 'Hero (Song Phụng)', description: 'Phượng hoàng lớn + tên cặp đôi' },
  'family-default': { label: 'Gia đình', description: '2 cột thông tin cha mẹ + ảnh cô dâu chú rể' },
  'ceremony-default': { label: 'Lễ cưới', description: 'Thời gian, địa điểm, RSVP, bản đồ' },
  'countdown-default': { label: 'Đếm ngược', description: 'Đồng hồ đếm ngược ngày cưới' },
  'gallery-default': { label: 'Album ảnh', description: 'Grid ảnh cưới + lightbox' },
  'wishes-default': { label: 'Lời chúc', description: 'Sổ lưu bút khách mời' },
  'bank-default': { label: 'Mừng cưới', description: 'Tài khoản ngân hàng + mã QR' },
  'footer-default': { label: 'Footer', description: 'Kết thúc thiệp + credit' },
};
