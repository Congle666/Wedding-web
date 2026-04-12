# Admin Visual Template Builder — SongPhung-Red

**Date:** 2026-04-08 | **Priority:** High | **Status:** Completed

## Goal
Admin creates templates by cloning/customizing `songphung-red` reference theme via slot-based visual builder. Config persists in existing `templates.customizable_fields` JSON column (no DB migration). Theme refactored config-aware w/ fallback defaults (backward compat).

## Scope (Phase 1)
- Single base theme: `songphung-red`
- Slot-based image drop, 4 color pickers, heading+body font select, per-section text samples, visibility toggle, drag reorder
- Live preview via iframe + postMessage to `/w/preview/songphung-red`
- Save creates/updates Template row; duplicate deep-copies `customizable_fields` w/ new slug
- Manual thumbnail upload (auto-gen deferred)

## Out of Scope
- Multi-theme builder (schema reserves `base_theme` for future)
- Responsive breakpoint overrides
- Auto thumbnail gen via html2canvas (noted risk)
- Admin preview auth hardening

## Phases
| # | File | Status |
|---|------|--------|
| 01 | [phase-01-backend-schema-and-api.md](./phase-01-backend-schema-and-api.md) | Completed |
| 02 | [phase-02-theme-refactor-config-aware.md](./phase-02-theme-refactor-config-aware.md) | Completed |
| 03 | [phase-03-builder-shell-and-preview.md](./phase-03-builder-shell-and-preview.md) | Completed |
| 04 | [phase-04-image-slot-editor.md](./phase-04-image-slot-editor.md) | Completed |
| 05 | [phase-05-color-font-text-editor.md](./phase-05-color-font-text-editor.md) | Completed |
| 06 | [phase-06-save-duplicate-thumbnail.md](./phase-06-save-duplicate-thumbnail.md) | Completed |

## Key Design Decisions
- **Storage:** Reuse `templates.customizable_fields datatypes.JSON` — no migration.
- **Backward compat:** Theme falls back to hardcoded defaults when `template_config` null/empty. Existing templates unchanged.
- **Preview transport:** iframe `src=/w/preview/songphung-red?mode=edit` + `postMessage({type:'TEMPLATE_CONFIG_UPDATE', config})`. Preview page holds React state, re-renders on message.
- **Drag-drop:** `@dnd-kit/core` + `@dnd-kit/sortable`.
- **Color:** Ant Design `ColorPicker` (antd@5.22 already installed).
- **Fonts:** Hardcoded Google Fonts list (YAGNI — no API fetch).
- **Upload:** Reuse existing `/api/admin/upload` → `d:/GoLang_Wedding/uploads/`.
- **Duplicate:** Backend endpoint or admin-side deep clone w/ `slug-copy-{ts}`.

## Dependencies
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` (new npm deps in `wedding-admin`)
- No backend deps added

## Research
- [researcher-01-songphung-red-structure.md](./research/researcher-01-songphung-red-structure.md)
- [researcher-02-builder-architecture.md](./research/researcher-02-builder-architecture.md)

## Related Files
- `d:/GoLang_Wedding/models/template.go:25` — Template model (CustomizableFields col)
- `d:/GoLang_Wedding/handlers/admin_handler.go:20` — AdminTemplateInput already accepts `customizable_fields`
- `d:/GoLang_Wedding/wedding-admin/src/pages/templates/TemplateFormPage.tsx` — legacy form (keep)
- `d:/GoLang_Wedding/wedding-web/components/themes/songphung-red/SongPhungTheme.tsx` — refactor target
- `d:/GoLang_Wedding/wedding-web/app/w/preview/[theme]/page.tsx:8` — MOCK_DATA preview route
- `d:/GoLang_Wedding/wedding-web/app/w/[slug]/page.tsx:21` — WeddingData interface

## Unresolved Questions
1. Auto thumbnail gen (html2canvas) vs manual upload — recommend manual Phase 1.
2. Multi-theme base — schema reserves `base_theme` field, Phase 1 hardcodes `songphung-red`.
3. Music upload max size — propose 5MB, confirm w/ user.
4. Admin preview auth — current `/w/preview` public; acceptable risk Phase 1.
5. Section reorder: is section `order` persisted in `template_config.sections[key].order` only, or also in per-order customization? (Proposal: template_config only.)
