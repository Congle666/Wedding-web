# Phase 02 — Theme Refactor (Config-Aware SongPhung-Red)

## Context
- Parent: [plan.md](./plan.md)
- Depends on: [phase-01](./phase-01-backend-schema-and-api.md)
- Related: `d:/GoLang_Wedding/wedding-web/components/themes/songphung-red/*`

## Overview
- **Date:** 2026-04-08
- **Description:** Refactor songphung-red theme to read colors, fonts, assets, text, section order/visibility from optional `template_config`. Fall back to current hardcoded defaults when null → 100% backward compatible.
- **Priority:** High
- **Implementation Status:** Not Started
- **Review Status:** Pending

## Key Insights
- All 9 sections currently hardcode asset paths + inline colors (see researcher-01 table).
- `SongPhungTheme.tsx:99-100` hardcodes outer bg `#E8D5C4`, inner `#F8F2ED`, paper-bg url.
- Section visibility already config-aware via `data.visible_sections` (SongPhungTheme.tsx:93). Extend to use `template_config.sections[key].visible` w/ fallback.
- Section order currently static JSX sequence. Must become dynamic map + sort.
- Music URL already overridable via `data.music_url` (line 28).

## Requirements
1. Single source of truth: `useTemplateConfig(data)` hook returns merged config (template_config ⊕ DEFAULT_SONGPHUNG_RED).
2. Every hardcoded asset/color/font/text becomes `cfg.xxx` read.
3. Section render loop maps over sorted `sections[key].order` filtered by `visible`.
4. Default export unchanged — upstream consumers untouched.
5. Fonts dynamically injected via `<link>` or CSS var updates (fonts listed in DEFAULT list).

## Architecture

### Merge strategy
```ts
function mergeConfig(partial?: Partial<TemplateConfig>): TemplateConfig {
  return deepMerge(DEFAULT_SONGPHUNG_RED, partial ?? {});
}
```
Deep-merge ensures missing keys inherit defaults. Avoid lodash — small custom `deepMerge` util.

### Component signature
```tsx
// unchanged public API
<SongPhungTheme data={weddingData} />
// internal:
const cfg = mergeConfig(data.template_config);
```

### CSS variables approach (recommended for live updates)
Inject `<style>` block w/ CSS vars scoped to wrapper:
```tsx
<div style={{
  '--sp-primary': cfg.colors.primary,
  '--sp-bg': cfg.colors.background,
  '--sp-text': cfg.colors.text,
  '--sp-accent': cfg.colors.accent,
  '--sp-font-heading': `'${cfg.fonts.heading}', serif`,
  '--sp-font-body': `'${cfg.fonts.body}', sans-serif`,
} as React.CSSProperties}>
```
Child sections read via `var(--sp-primary)` — minimizes prop drilling, enables postMessage live updates w/o re-render cascade.

### Section ordering
```tsx
const orderedKeys = (Object.keys(cfg.sections) as SectionKey[])
  .filter(k => cfg.sections[k].visible)
  .sort((a, b) => cfg.sections[a].order - cfg.sections[b].order);

const SECTION_COMPONENTS: Record<SectionKey, FC<{data: WeddingData; cfg: TemplateConfig}>> = { cover: CoverSection, hero: HeroSection, ... };

return <>{orderedKeys.map(k => { const C = SECTION_COMPONENTS[k]; return <C key={k} data={data} cfg={cfg} />; })}</>;
```

### Per-section prop
Each section receives `cfg: TemplateConfig` and reads `cfg.assets.cover?.phoenix_left ?? '/themes/songphung-red/phoenix.webp'`.

## Related Code Files
- `wedding-web/components/themes/songphung-red/SongPhungTheme.tsx:19-280` — root
- `CoverSection.tsx:L77,106,129,151,174,200,280,319,364,391` — hardcoded assets/text
- `HeroSection.tsx:L55,80` — phoenix refs
- `FamilySection.tsx:L47` — flower
- `CeremonySection.tsx`, `CountdownSection.tsx`, `GallerySection.tsx`, `WishesSection.tsx`, `BankSection.tsx`, `FooterSection.tsx`
- `wedding-web/lib/templateConfigDefaults.ts` (new, from Phase 01)
- `wedding-web/lib/deepMerge.ts` (new)

## Implementation Steps
1. Create `wedding-web/lib/deepMerge.ts` (tiny, object-only).
2. Create `wedding-web/lib/templateConfigDefaults.ts` exporting `DEFAULT_SONGPHUNG_RED: TemplateConfig` reflecting CURRENT hardcoded values exactly.
3. Create `wedding-web/components/themes/songphung-red/useTemplateConfig.ts` hook.
4. Refactor `SongPhungTheme.tsx`:
   - Compute `cfg = mergeConfig(data.template_config)`
   - Inject CSS vars on wrapper (replace hardcoded bg color/image)
   - Build `SECTION_COMPONENTS` map + render loop via ordered keys
   - Pass `cfg` prop to each child
5. Refactor each section file (9 total). For each:
   - Accept new `cfg: TemplateConfig` prop
   - Replace asset paths w/ `cfg.assets.<section>.<key> ?? defaultPath`
   - Replace color literals w/ `var(--sp-primary)` etc.
   - Replace hardcoded text w/ `cfg.text_samples.<section>.<key> ?? defaultText`
6. Add `<link>` tag for heading+body Google Fonts dynamically (useEffect). Only load if different from defaults.
7. Verify backward compat: render w/ `data.template_config = undefined` → pixel match vs current.

## Todo
- [ ] deepMerge util
- [ ] DEFAULT_SONGPHUNG_RED w/ exact current values
- [ ] useTemplateConfig hook
- [ ] SongPhungTheme CSS vars wrapper
- [ ] Dynamic section ordering loop
- [ ] Refactor CoverSection
- [ ] Refactor HeroSection
- [ ] Refactor FamilySection
- [ ] Refactor CeremonySection
- [ ] Refactor CountdownSection
- [ ] Refactor GallerySection
- [ ] Refactor WishesSection
- [ ] Refactor BankSection
- [ ] Refactor FooterSection
- [ ] Dynamic Google Fonts loader
- [ ] Regression test: undefined config → identical render

## Success Criteria
- Existing wedding pages (no template_config) render identically.
- Setting `cfg.colors.primary = '#0000FF'` turns red accents blue across all sections.
- Toggling `cfg.sections.gallery.visible = false` hides gallery.
- Reordering `cfg.sections.ceremony.order` moves section.
- Replacing `cfg.assets.cover.phoenix_left` swaps image.

## Risk Assessment
- **Visual regression:** 9 sections × many hardcoded values → high miss probability. Mitigate: screenshot diff test on preview route pre/post.
- **CSS var cascade:** child sections may override w/ their own literals. Mitigate: grep for hex colors post-refactor.
- **Font flash:** dynamic font link causes FOUT. Mitigate: preload defaults in layout.

## Security Considerations
- `cfg.assets.*` URLs rendered in `<img src>` — must validate prefix at input (Phase 01) to prevent external exfil / mixed content.
- No `dangerouslySetInnerHTML` for text_samples — plain text only.

## Next Steps
→ Phase 03: admin builder shell + preview iframe.
