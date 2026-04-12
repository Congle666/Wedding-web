# Hybrid Section-Block Template Builder -- Master Plan

## Summary

Replace the current slot-based template builder with a Puck + @dnd-kit hybrid builder. Admin builds wedding invitations by dragging section blocks onto a canvas (Puck handles block-level DnD), then repositioning/resizing decorative elements within each block (@dnd-kit handles element-level DnD). Output: BuilderConfig v2.0 JSON persisted in DB, rendered by DynamicThemeRenderer on public pages.

**Architecture decision**: Puck + @dnd-kit hybrid over pure Craft.js (see research/researcher-01-builder-libraries.md).

## Phases

| # | Phase | Priority | Est. Effort | Dependencies |
|---|-------|----------|-------------|--------------|
| 01 | [Schema redesign](./phase-01-schema-redesign.md) | Critical | 1-2 days | None |
| 02 | [Puck + block registry](./phase-02-puck-block-registry.md) | Critical | 1-2 days | Phase 01 |
| 03 | [Block renderers](./phase-03-block-renderers.md) | High | 3-4 days | Phase 02 |
| 04 | [Element-level DnD](./phase-04-element-dnd.md) | High | 2-3 days | Phase 03 |
| 05 | [Property inspector](./phase-05-property-inspector.md) | High | 2-3 days | Phase 04 |
| 06 | [Global styles panel](./phase-06-global-styles.md) | Medium | 1-2 days | Phase 02 |
| 07 | [Preset system](./phase-07-preset-system.md) | Medium | 2-3 days | Phase 03 |
| 08 | [Dynamic renderer (public)](./phase-08-dynamic-renderer.md) | Critical | 2-3 days | Phase 03, 07 |

**Total estimated effort**: 14-22 days

**Parallelizable**: Phase 06 can run parallel with Phase 04-05. Phase 07 can start once Phase 03 is done.

## Critical Design Decisions

1. **Puck + @dnd-kit hybrid** over pure Craft.js -- Puck handles section orchestration (add/remove/reorder/inspect); @dnd-kit handles element positioning within blocks. ~200 lines of glue code per block type vs 3-4 weeks building everything custom.

2. **v2.0 schema with backward compat** -- `version` field discriminates. v1.0 -> SongPhungTheme (existing). v2.0 -> DynamicThemeRenderer (new). No breaking changes to existing templates.

3. **Block renderers = refactored songphung-red sections** -- not new code from scratch. Element positions extracted from current CSS; renderers read from `elements[]` array instead of `cfg.assets.<section>.<slot>`.

4. **Elements use absolute positioning within blocks** -- not CSS grid. Enables free-form element placement via DnD. Position stored as % of block container.

5. **Animation presets, not custom keyframes** -- 7 preset types (fadeIn, slideInLeft, parallax, etc.) with duration/delay sliders. Custom CSS keyframes = YAGNI.

6. **256KB config limit** -- blocks with elements are heavier than v1 flat config. Current limit 64KB insufficient.

7. **songphung-red becomes a preset** -- not the only base template. Future presets follow same pattern (PRESET_REGISTRY).

## Key Files Affected

### New files
- `wedding-admin/src/types/builderConfig.ts` -- v2.0 schema
- `wedding-admin/src/pages/templates/builder-v2/` -- entire new builder
- `wedding-admin/src/utils/migrateConfig.ts` -- v1 -> v2 migration
- `wedding-web/types/builderConfig.ts` -- schema mirror
- `wedding-web/components/themes/dynamic/` -- public renderer
- `models/builder_config.go` -- Go struct mirror

### Modified files
- `models/template_config.go:39` -- add "2.0" to allowed versions
- `utils/template_config_validator.go:16` -- 64KB -> 256KB
- `utils/template_config_validator.go:38-96` -- add v2.0 validation branch
- `wedding-web/app/w/[slug]/page.tsx` -- version detection routing

### Preserved (no changes)
- `wedding-web/components/themes/songphung-red/*` -- v1 rendering path untouched
- `wedding-admin/src/pages/templates/builder/` -- v1 builder preserved as fallback

## Dependency Graph

```
Phase 01 (Schema)
  |
  v
Phase 02 (Puck + Registry) -----> Phase 06 (Global Styles)
  |
  v
Phase 03 (Block Renderers) -----> Phase 07 (Presets)
  |                                   |
  v                                   v
Phase 04 (Element DnD)          Phase 08 (Public Renderer)
  |
  v
Phase 05 (Inspector)
```

## Unresolved Questions

1. **Mobile responsive preview in builder?** Should builder show mobile/tablet/desktop breakpoint toggle? Current builder uses iframe that can be resized. Puck canvas is direct render -- would need viewport simulation.

2. **Max blocks per template?** Proposed: 20. Is this sufficient? Could an admin want 30+ blocks for a very detailed invitation?

3. **Custom CSS per element?** Advanced users might want custom CSS. Currently not planned (YAGNI). Could add `element.customCSS: string` later if needed.

4. **Export template as image/PDF?** Not in scope. Would require puppeteer/playwright server-side rendering. Could be a future feature.

5. **Block renderer code sharing**: wedding-admin and wedding-web both need block renderers. Currently planned as duplication. If sync burden proves high, extract to shared npm workspace package.

6. **SVG support**: Current decorative assets are .webp raster. Should builder support uploading custom SVG patterns? Asset URL validation would need to allow .svg MIME type.

7. **Undo/redo for element moves**: Puck has built-in undo for block-level changes. @dnd-kit element repositioning needs separate undo stack or integration with Puck's history. Currently not planned for MVP.
