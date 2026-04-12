/**
 * TemplateConfig — canonical schema persisted in templates.customizable_fields.
 *
 * KEEP IN SYNC WITH:
 *   - wedding-admin/src/types/templateConfig.ts
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

export interface TemplateAssets {
  cover?: {
    phoenix_left?: string;
    phoenix_right?: string;
    flower_tl?: string;
    flower_br?: string;
    chu_hy?: string;
    paper_bg?: string;
  };
  hero?: {
    phoenix_left?: string;
    phoenix_right?: string;
    chu_hy?: string;
  };
  family?: {
    flower?: string;
    groom_photo?: string;
    bride_photo?: string;
  };
  ceremony?: { decor?: string };
  gallery?: { images?: string[] };
  bank?: { bg?: string };
  footer?: { decor?: string };
  global?: { music_url?: string };
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

/**
 * Canonical defaults mirroring the hardcoded songphung-red theme values.
 * When `template_config` is null/undefined on a Template row the theme renderer
 * MUST fall back to these values so legacy templates keep rendering unchanged.
 */
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

/**
 * Deep-merge a partial config coming from the API into the canonical defaults.
 * Any missing slot/color/font/text key is replaced by its default value so the
 * renderer never has to branch on undefined.
 */
export function mergeTemplateConfig(
  partial: Partial<TemplateConfig> | null | undefined
): TemplateConfig {
  if (!partial) return DEFAULT_SONGPHUNG_RED_CONFIG;
  const base = DEFAULT_SONGPHUNG_RED_CONFIG;
  return {
    version: (partial.version as '1.0') || base.version,
    base_theme: (partial.base_theme as 'songphung-red') || base.base_theme,
    colors: { ...base.colors, ...(partial.colors || {}) },
    fonts: { ...base.fonts, ...(partial.fonts || {}) },
    assets: deepMergeAssets(base.assets, partial.assets || {}),
    text_samples: deepMergeText(base.text_samples, partial.text_samples || {}),
    sections: { ...base.sections, ...(partial.sections || {}) },
  };
}

function deepMergeAssets(a: TemplateAssets, b: TemplateAssets): TemplateAssets {
  const out: TemplateAssets = { ...a };
  for (const key of Object.keys(b) as (keyof TemplateAssets)[]) {
    const av = (a as any)[key] || {};
    const bv = (b as any)[key] || {};
    (out as any)[key] = { ...av, ...bv };
  }
  return out;
}

function deepMergeText(
  a: TemplateTextSamples,
  b: TemplateTextSamples
): TemplateTextSamples {
  const out: TemplateTextSamples = { ...a };
  for (const key of Object.keys(b) as (keyof TemplateTextSamples)[]) {
    const av = (a as any)[key] || {};
    const bv = (b as any)[key] || {};
    (out as any)[key] = { ...av, ...bv };
  }
  return out;
}
