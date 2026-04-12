import { useMemo } from 'react';
import {
  DEFAULT_SONGPHUNG_RED_CONFIG,
  mergeTemplateConfig,
  type TemplateConfig,
  type SectionKey,
} from '@/types/templateConfig';

/**
 * Merge the partial config coming from the wedding API with the canonical
 * songphung-red defaults. Guarantees every key is populated — sections can
 * read `cfg.colors.primary` without null-checks.
 */
export function useTemplateConfig(
  partial: Partial<TemplateConfig> | null | undefined
): TemplateConfig {
  return useMemo(() => mergeTemplateConfig(partial), [partial]);
}

/**
 * Return the ordered list of visible section keys based on the config.
 * Keys with `visible === false` are dropped. Sort is stable on `order`.
 */
export function getOrderedVisibleSections(cfg: TemplateConfig): SectionKey[] {
  return (Object.keys(cfg.sections) as SectionKey[])
    .filter((k) => cfg.sections[k]?.visible !== false)
    .sort((a, b) => (cfg.sections[a]?.order ?? 99) - (cfg.sections[b]?.order ?? 99));
}

export { DEFAULT_SONGPHUNG_RED_CONFIG };
export type { TemplateConfig, SectionKey };
