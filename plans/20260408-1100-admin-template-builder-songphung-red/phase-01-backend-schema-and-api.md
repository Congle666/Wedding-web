# Phase 01 — Backend Schema & API

## Context
- Parent: [plan.md](./plan.md)
- Depends on: none
- Related: `d:/GoLang_Wedding/models/template.go`, `d:/GoLang_Wedding/handlers/admin_handler.go`, `d:/GoLang_Wedding/handlers/wedding_handler.go`

## Overview
- **Date:** 2026-04-08
- **Description:** Define canonical `template_config` JSON schema (TS + Go). Validate in admin CRUD. Expose in public wedding API response so theme can consume.
- **Priority:** High
- **Implementation Status:** Not Started
- **Review Status:** Pending

## Key Insights
- `CustomizableFields datatypes.JSON` already exists (models/template.go:35). No migration needed.
- `AdminTemplateInput` already passes it through (admin_handler.go:28, 52, 96). Validation missing — accept any JSON.
- Public handler currently does NOT forward `customizable_fields` into WeddingData response. Must add.
- Use loose validation (schema version check + max size) rather than strict shape enforcement; keeps schema evolution cheap.

## Requirements
1. Go struct `TemplateConfig` mirrors TS interface.
2. Admin CRUD validates `customizable_fields`: must be valid JSON object OR null; size ≤ 64 KB; optional `version` field.
3. Public `GET /api/weddings/:slug` response embeds `template_config` (parsed object) inside WeddingData.
4. Admin `GET /api/admin/templates/:id` returns `customizable_fields` as parsed object (already works via `datatypes.JSON`).

## Architecture

### Canonical TypeScript interface
```ts
// wedding-admin/src/types/templateConfig.ts
// wedding-web/types/templateConfig.ts (duplicate — keep in sync)
export interface TemplateConfig {
  version: '1.0';
  base_theme: 'songphung-red'; // reserved for multi-theme future
  colors: {
    primary: string;      // default #5F191D
    background: string;   // default #F8F2ED
    text: string;         // default #2C1810
    accent: string;       // default #C8963C
  };
  fonts: {
    heading: string;      // Google Font family, default 'Cormorant Garamond'
    body: string;         // default 'Be Vietnam Pro'
  };
  assets: {
    cover?: { phoenix_left?: string; phoenix_right?: string; flower_tl?: string; flower_br?: string; chu_hy?: string; paper_bg?: string };
    hero?: { phoenix_left?: string; phoenix_right?: string; chu_hy?: string };
    family?: { flower?: string; groom_photo?: string; bride_photo?: string };
    ceremony?: { decor?: string };
    gallery?: { images?: string[] };
    bank?: { bg?: string };
    footer?: { decor?: string };
    global?: { music_url?: string };
  };
  text_samples: {
    cover?: { button_label?: string; invitation_greeting?: string; invitation_subtext?: string };
    hero?: { subtitle?: string };
    family?: { section_title?: string };
    ceremony?: { section_title?: string };
    gallery?: { section_title?: string };
    wishes?: { section_title?: string };
    bank?: { section_title?: string };
  };
  sections: Record<SectionKey, { visible: boolean; order: number }>;
}
export type SectionKey = 'cover'|'hero'|'family'|'ceremony'|'countdown'|'gallery'|'wishes'|'bank'|'footer';
```

### Go struct
```go
// models/template_config.go (NEW)
type TemplateConfig struct {
  Version     string                       `json:"version"`
  BaseTheme   string                       `json:"base_theme"`
  Colors      TemplateColors               `json:"colors"`
  Fonts       TemplateFonts                `json:"fonts"`
  Assets      map[string]map[string]any    `json:"assets"`
  TextSamples map[string]map[string]string `json:"text_samples"`
  Sections    map[string]TemplateSection   `json:"sections"`
}
type TemplateColors struct{ Primary, Background, Text, Accent string }
type TemplateFonts  struct{ Heading, Body string }
type TemplateSection struct{ Visible bool `json:"visible"`; Order int `json:"order"` }
```
Used only for validation helper; storage stays `datatypes.JSON`.

### Data flow
```
Admin Builder ──POST /api/admin/templates──▶ AdminCreateTemplate
                                               │
                                               ├─ ValidateTemplateConfig(input.CustomizableFields)
                                               └─ GORM Save → templates.customizable_fields
Public page ──GET /api/weddings/:slug──▶ WeddingHandler
                                          │
                                          └─ Marshal template.customizable_fields → WeddingData.template_config
```

## Related Code Files
- `d:/GoLang_Wedding/models/template.go:25-45` — Template model
- `d:/GoLang_Wedding/handlers/admin_handler.go:20-108` — AdminTemplateInput + Create/Update
- `d:/GoLang_Wedding/handlers/wedding_handler.go` — public wedding fetch (locate `GetWeddingBySlug` or similar)
- `d:/GoLang_Wedding/wedding-web/app/w/[slug]/page.tsx:21-68` — WeddingData interface

## Implementation Steps
1. Create `models/template_config.go` w/ TemplateConfig structs + `DefaultSongPhungRedConfig()` helper.
2. Create `utils/template_config_validator.go`: `ValidateTemplateConfigJSON(raw datatypes.JSON) error` — JSON parse, size ≤ 64KB, version in allow-list, base_theme in allow-list.
3. Call validator in `AdminCreateTemplate` (admin_handler.go:37) and `AdminUpdateTemplate` (admin_handler.go:73) after `ShouldBindJSON`.
4. Locate public wedding response builder (`handlers/wedding_handler.go`). Add `TemplateConfig` field to response DTO. Unmarshal `template.CustomizableFields` into `map[string]any` and forward.
5. Create `wedding-admin/src/types/templateConfig.ts` + `wedding-web/types/templateConfig.ts` (copies — keep in sync; document drift).
6. Extend `WeddingData` interface (wedding-web/app/w/[slug]/page.tsx:21) w/ optional `template_config?: TemplateConfig`.
7. Add `defaultSongPhungRedConfig()` helper in `wedding-web/lib/templateConfigDefaults.ts`.

## Todo
- [ ] models/template_config.go
- [ ] DefaultSongPhungRedConfig() Go helper
- [ ] Validator util + size cap 64KB
- [ ] Hook validator into AdminCreate/Update
- [ ] Wedding handler emits template_config
- [ ] TS interface shared copies
- [ ] Extend WeddingData w/ optional template_config
- [ ] Smoke test: create template w/ config, fetch wedding API, assert config echoes

## Success Criteria
- POST /api/admin/templates w/ malformed JSON → 400.
- POST w/ >64KB config → 400.
- GET /api/weddings/:slug → includes `template_config` when set, omits when null.
- Existing templates (null config) continue working (no regression).

## Risk Assessment
- **Schema drift TS↔Go:** two copies. Mitigate: comment header pointing to sibling, CI lint optional.
- **Silent JSON corruption:** weak validation. Mitigate: size cap + version whitelist.

## Security Considerations
- Asset URLs must not be arbitrary remote — restrict to same-origin `/uploads/` or `/themes/` prefixes (validator regex).
- Strip HTML from `text_samples` on read (Phase 2 theme renders w/o dangerouslySetInnerHTML).
- Admin-only endpoints already gated by admin middleware; verify.

## Next Steps
→ Phase 02: refactor SongPhungTheme to consume this schema.
