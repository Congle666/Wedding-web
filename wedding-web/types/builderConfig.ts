/**
 * BuilderConfig v2.0 — Hybrid section-block template builder schema.
 *
 * KEEP IN SYNC WITH:
 *   - wedding-admin/src/types/builderConfig.ts
 *   - GoLang_Wedding/models/builder_config.go
 */

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
  x: number;
  y: number;
  width: number;
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
  duration: number;
  delay: number;
  triggerOn: 'load' | 'scroll';
  parallaxSpeed?: number;
}

export interface ElementInstance {
  id: string;
  type: ElementType;
  position: ElementPosition;
  style: ElementStyle;
  animation: ElementAnimation;
  content: string;
  locked: boolean;
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

export interface BuilderConfig {
  version: '2.0';
  blocks: BlockInstance[];
  globalStyles: GlobalStyles;
}

export function isBuilderConfig(cfg: any): cfg is BuilderConfig {
  return cfg?.version === '2.0' && Array.isArray(cfg?.blocks);
}

export function isLegacyConfig(cfg: any): boolean {
  return cfg?.version === '1.0' || (!cfg?.version && cfg?.base_theme);
}

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
