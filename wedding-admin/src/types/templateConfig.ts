/**
 * TemplateConfig — canonical schema persisted in templates.customizable_fields.
 *
 * KEEP IN SYNC WITH:
 *   - wedding-web/types/templateConfig.ts
 *   - GoLang_Wedding/models/template_config.go
 */

export type SectionKey =
  | 'cover'
  | 'hero'
  | 'family'
  | 'ceremony'
  | 'countdown'
  | 'gallery'
  | 'wishes'
  | 'bank'
  | 'footer';

export interface TemplateColors {
  primary: string;
  background: string;
  text: string;
  accent: string;
}

export interface TemplateFonts {
  heading: string;
  body: string;
}

export interface TemplateSection {
  visible: boolean;
  order: number;
}

export interface CoverAssets {
  phoenix_left?: string;
  phoenix_right?: string;
  flower_tl?: string;
  flower_br?: string;
  chu_hy?: string;
  paper_bg?: string;
}

export interface HeroAssets {
  phoenix_left?: string;
  phoenix_right?: string;
  chu_hy?: string;
}

export interface FamilyAssets {
  flower?: string;
  groom_photo?: string;
  bride_photo?: string;
}

export interface GlobalAssets {
  music_url?: string;
}

export interface TemplateAssets {
  cover?: CoverAssets;
  hero?: HeroAssets;
  family?: FamilyAssets;
  ceremony?: { decor?: string };
  gallery?: { images?: string[] };
  bank?: { bg?: string };
  footer?: { decor?: string };
  global?: GlobalAssets;
}

export interface TemplateTextSamples {
  cover?: {
    button_label?: string;
    invitation_greeting?: string;
    invitation_subtext?: string;
  };
  hero?: { subtitle?: string };
  family?: { section_title?: string };
  ceremony?: { section_title?: string };
  gallery?: { section_title?: string };
  wishes?: { section_title?: string };
  bank?: { section_title?: string };
}

export interface TemplateConfig {
  version: '1.0';
  base_theme: 'songphung-red';
  colors: TemplateColors;
  fonts: TemplateFonts;
  assets: TemplateAssets;
  text_samples: TemplateTextSamples;
  sections: Record<SectionKey, TemplateSection>;
}

export const DEFAULT_SONGPHUNG_RED_CONFIG: TemplateConfig = {
  version: '1.0',
  base_theme: 'songphung-red',
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
  assets: {
    cover: {
      phoenix_left: '/themes/songphung-red/phoenix.webp',
      phoenix_right: '/themes/songphung-red/phoenix2.webp',
      flower_tl: '/themes/songphung-red/flower.webp',
      flower_br: '/themes/songphung-red/flower.webp',
      chu_hy: '/themes/songphung-red/chu-hy.webp',
      paper_bg: '/themes/songphung-red/paper-bg.jpg',
    },
    hero: {
      phoenix_left: '/themes/songphung-red/phoenix.webp',
      phoenix_right: '/themes/songphung-red/phoenix2.webp',
      chu_hy: '/themes/songphung-red/chu-hy.webp',
    },
    family: {
      flower: '/themes/songphung-red/flower.webp',
    },
    gallery: { images: [] },
    global: {
      music_url: '/themes/songphung-red/music.mp3',
    },
  },
  text_samples: {
    cover: {
      button_label: 'Mở thiệp mời',
      invitation_greeting: 'Trân trọng kính mời',
      invitation_subtext: 'Đến dự lễ thành hôn của chúng tôi',
    },
    hero: { subtitle: 'Save the date' },
    family: { section_title: 'Thành hôn' },
    ceremony: { section_title: 'Lễ cưới' },
    gallery: { section_title: 'Khoảnh khắc' },
    wishes: { section_title: 'Sổ lưu bút' },
    bank: { section_title: 'Hộp mừng cưới' },
  },
  sections: {
    cover: { visible: true, order: 1 },
    hero: { visible: true, order: 2 },
    family: { visible: true, order: 3 },
    ceremony: { visible: true, order: 4 },
    countdown: { visible: true, order: 5 },
    gallery: { visible: true, order: 6 },
    wishes: { visible: true, order: 7 },
    bank: { visible: true, order: 8 },
    footer: { visible: true, order: 9 },
  },
};
