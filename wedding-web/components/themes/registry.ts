import type { ComponentType } from 'react';
import type { WeddingData } from '@/app/w/[slug]/page';
import SongPhungTheme from './songphung-red/SongPhungTheme';

/**
 * Common props every theme renderer must accept. `editMode` is set by the
 * preview route when loaded inside the admin builder iframe.
 */
export interface ThemeProps {
  data: WeddingData;
  editMode?: boolean;
}

// Theme registry: maps theme slug to React component
// Add new themes here as they are created
const THEME_REGISTRY: Record<string, ComponentType<ThemeProps>> = {
  'songphung-red': SongPhungTheme,
  // 'minimal-white': MinimalWhiteTheme,  // Phase 4
  // 'vintage-floral': VintageFloralTheme, // Phase 4
};

export function getThemeComponent(slug: string | undefined): ComponentType<ThemeProps> {
  if (slug && THEME_REGISTRY[slug]) {
    return THEME_REGISTRY[slug];
  }
  return SongPhungTheme; // fallback to default theme
}

export function getAvailableThemes(): string[] {
  return Object.keys(THEME_REGISTRY);
}
