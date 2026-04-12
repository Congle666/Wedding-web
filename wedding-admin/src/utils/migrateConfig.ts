/**
 * Migration utility: TemplateConfig v1.0 → BuilderConfig v2.0.
 * Full implementation in Phase 07 when preset data is available.
 */

import type { TemplateConfig } from '../types/templateConfig';
import type { BuilderConfig } from '../types/builderConfig';
import { DEFAULT_GLOBAL_STYLES, createEmptyBuilderConfig } from '../types/builderConfig';

/**
 * Convert a v1.0 TemplateConfig into a v2.0 BuilderConfig by mapping
 * flat slot-based assets/text/sections into composable block instances.
 *
 * NOTE: Element positions will be approximate since v1.0 used hardcoded CSS.
 * The v1 rendering path (SongPhungTheme) is preserved for exact pixel match.
 */
export function migrateV1ToV2(v1: TemplateConfig): BuilderConfig {
  const config = createEmptyBuilderConfig();

  // Map global styles from v1 colors/fonts
  config.globalStyles = {
    colors: { ...v1.colors },
    fonts: { ...v1.fonts },
    paperBg: v1.assets.cover?.paper_bg || DEFAULT_GLOBAL_STYLES.paperBg,
    musicUrl: v1.assets.global?.music_url as string || DEFAULT_GLOBAL_STYLES.musicUrl,
  };

  // Block population will be implemented in Phase 07 (preset system)
  // when SONGPHUNG_RED_PRESET provides full element position data.
  // For now: return empty blocks with global styles migrated.

  return config;
}
