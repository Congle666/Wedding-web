# Drag-Drop Visual Template Builder Architecture — Research Report

**Date**: 2026-04-08 | **Project**: Wedding Admin Template Builder (SongPhung Red Theme)

---

## 1. Drag-Drop Library Decision: @dnd-kit/core Confirmed

**Verdict**: Use `@dnd-kit/core` with `@dnd-kit/sortable` for slot-based reordering.

**Rationale**:
- **Modern design**: Prioritizes performance via minimal re-renders; React hooks-first API.
- **Accessibility**: Built-in keyboard navigation + screen reader support (critical for admin UX).
- **Slot targeting**: Native droppable zone API (`<Droppable>`) ideal for fixed-layout wedding template.
- **Bundle overhead**: ~15–20 KB gzip (@dnd-kit/core + sortable utilities); negligible for Vite build.
- **Ecosystem**: `@dnd-kit/sortable` handles section reordering; `@dnd-kit/utilities` provides sensor handling.
- **Market**: 11.9M weekly npm downloads (Feb 2025); supersedes react-dnd for new projects.

**Install**:
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**API**: `DndContext` → `Droppable` zones per slot + `Draggable` assets; `useSortable()` hook for reordering sections.

---

## 2. Live Preview Strategy: iframe + postMessage

**Approach**: Render SongPhungTheme inside iframe pointing to existing `wedding-web/app/w/preview/[theme]/page.tsx` (confirmed exists).

**Why NOT direct import**:
- Admin = Vite (ESM); wedding-web = Next.js; CSS/font conflicts likely.
- Isolation: template config changes don't break admin state.
- Scalability: preview route already handles WeddingData serialization (line 8–41 mock data).

**Flow**:
1. Admin iframe src: `http://localhost:3000/w/preview/songphung-red?mode=edit`
2. Admin sends config via `window.postMessage({ type: 'UPDATE_CONFIG', payload: templateConfig })`
3. Preview route receives message, patches mock data, re-renders.
4. No iframe reload needed (React state update).

**Fallback**: If postMessage cross-origin issues → pass config as URL query params (base64 encoded). Lightweight for JSON <5KB.

---

## 3. Color & Font Picker

**Color Picker**:
- **Library**: `antd@5.22.0` (wedding-admin package.json:14) ships ColorPicker since v5.5.0 ✓
- **Usage**: `<ColorPicker value={color} onChange={handleColorChange} showText format="hex" />`
- **Fields**: primary, background, text_color, accent (4 main theme colors).

**Font Picker**:
- **Strategy**: Hardcode list (YAGNI—don't fetch Google Fonts API; admins never change font roster).
- **Preset fonts**: Cormorant Garamond (heading), Be Vietnam Pro (body), Playfair Display (accent), Great Vibes (script).
- **Already in preview route**: CSS `<link>` to fonts.googleapis.com (line 54–57) ✓
- **Admin UI**: Dropdown `<Select>` for heading_font, body_font; live preview updates immediately.

---

## 4. Proposed template_config JSON Schema

Store in `customizable_fields` column (GORM `datatypes.JSON`, models/template.go:35).

```json
{
  "version": "1.0",
  "sections": {
    "cover": { "visible": true, "order": 0 },
    "hero": { "visible": true, "order": 1 },
    "family": { "visible": true, "order": 2 },
    "ceremony": { "visible": true, "order": 3 },
    "countdown": { "visible": true, "order": 4 },
    "gallery": { "visible": true, "order": 5 },
    "wishes": { "visible": true, "order": 6 },
    "bank": { "visible": true, "order": 7 },
    "footer": { "visible": true, "order": 8 }
  },
  "assets": {
    "cover_image": "https://cdn.example.com/cover.jpg",
    "hero_background": "https://cdn.example.com/bg.jpg",
    "gallery_images": ["img1.jpg", "img2.jpg"]
  },
  "colors": {
    "primary": "#D4532E",
    "background": "#F8F2ED",
    "text_color": "#2C1810",
    "accent": "#E8D5C4"
  },
  "fonts": {
    "heading_font": "Playfair Display",
    "body_font": "Be Vietnam Pro"
  },
  "text_samples": {
    "hero_subtitle": "Chúng tôi sẽ kết hôn",
    "ceremony_label": "Lễ cưới"
  }
}
```

---

## 5. Theme Refactor Plan: SongPhungTheme Reads Config

**Current state** (SongPhungTheme.tsx:1–120 reviewed):
- Hardcoded paths: `data.music_url || '/themes/songphung-red/music.mp3'` (line 28).
- Hardcoded visibility: checks `data.visible_sections[key]` (line 94).
- Hardcoded colors: inline styles `backgroundColor: '#E8D5C4'` (line 99).

**Refactor**:
1. Update `WeddingData` interface (wedding-web/app/w/[slug]/page.tsx) to accept optional `template_config?: TemplateConfig` object.
2. In SongPhungTheme, add helper:
   ```tsx
   const config = data.template_config || DEFAULT_CONFIG;
   const getColor = (key: string) => config.colors[key] || DEFAULT_COLORS[key];
   const isSectionVisible = (key: string) => config.sections[key]?.visible !== false;
   ```
3. Replace inline colors: `backgroundColor={getColor('background')}`.
4. Apply section order: map `config.sections` by `order` field (sortable reorder).

**Backward compatibility**: If `template_config` is null/empty, use hardcoded defaults (no breaking changes). Existing templates keep rendering as-is.

---

## 6. Backend Flow: Admin Save → DB → Public Render

**Admin UI** (wedding-admin/src/pages/templates/TemplateFormPage.tsx):
1. Build config JSON (sections, assets, colors, fonts, text_samples).
2. POST `/api/admin/templates/{id}` with `{ customizable_fields: config }`.

**Backend** (handlers/admin_handler.go):
1. Unmarshal `customizable_fields` into model.Template.CustomizableFields (datatypes.JSON).
2. GORM saves to `templates.customizable_fields` column.

**Public render** (wedding-web/app/mau-thiep/[slug]/page.tsx):
1. Fetch template from API (includes customizable_fields).
2. Pass `template_config: JSON.parse(template.customizable_fields)` to SongPhungTheme.
3. SongPhungTheme applies config (colors, fonts, section visibility, asset URLs).

**No migration needed**: Column exists (type JSON); null values are safe.

---

## 7. Implementation Checklist

- [ ] Install @dnd-kit packages
- [ ] Create TemplateConfig TypeScript interface
- [ ] Build Droppable slot UI component (image upload per section)
- [ ] Add ColorPicker (antd) for 4 colors
- [ ] Add Font dropdown selector (hardcoded list)
- [ ] Implement postMessage to iframe preview
- [ ] Refactor SongPhungTheme to read config (backward-compatible)
- [ ] Update WeddingData interface for template_config
- [ ] Test config persistence (save → API → render)
- [ ] Update API response mapping (customizable_fields → template_config)

---

## Unresolved Questions

1. **Image upload strategy**: Where are slot images stored? (S3, local /public, CDN?) Admin upload UX not yet scoped.
2. **Section reorder persistence**: Are section orders part of template_config or per-order customization?
3. **Preview route auth**: Does `/w/preview/songphung-red` need auth? Currently public mock data.
4. **Font fallback**: If admin picks font not loaded in CSS, what happens? (Browser fallback to serif/sans-serif?)
5. **Multi-theme extensibility**: Is this builder template-specific or reusable for other themes (songphung-gold, etc.)?
