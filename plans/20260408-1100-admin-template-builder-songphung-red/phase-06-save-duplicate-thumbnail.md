# Phase 06 — Save, Duplicate, Thumbnail

## Context
- Parent: [plan.md](./plan.md)
- Depends on: [phase-01](./phase-01-backend-schema-and-api.md), [phase-03](./phase-03-builder-shell-and-preview.md)
- Related: `wedding-admin/src/api/template.api.ts`, `handlers/admin_handler.go`

## Overview
- **Date:** 2026-04-08
- **Description:** Save button writes template via existing admin CRUD. Duplicate action deep-copies `customizable_fields` w/ new slug. Optional auto-generated thumbnail via html2canvas (fallback manual upload).
- **Priority:** Medium
- **Implementation Status:** Not Started
- **Review Status:** Pending

## Key Insights
- Admin CRUD already handles `customizable_fields` (admin_handler.go:52,96). No backend change for save/update.
- Slug must be unique — admin generates `{baseSlug}-copy-{timestamp}` for duplicate.
- Auto-thumbnail from iframe contents is cross-origin restricted — html2canvas inside preview page is feasible but requires message from admin to trigger and return dataURL.
- Phase 1 recommendation: manual thumbnail upload (reuse existing ImageUpload in header metadata drawer). Auto-gen = stretch goal.

## Requirements
1. Save button: POST create or PUT update via `templateApi.create/update`.
2. Metadata drawer: name, slug, category, price, description, thumbnail — editable in builder header before save (not just legacy form).
3. Duplicate action: clone current state w/ new slug + name suffix `(Bản sao)`, navigate to new `/templates/new/builder` or immediately POST.
4. Unsaved-changes guard: prompt on navigate-away.
5. Optional: auto-thumbnail screenshot via postMessage.

## Architecture

### Save flow
```
SaveButton.click
  → validate metadata form
  → build payload { ...metadata, theme_slug:'songphung-red', customizable_fields: cfg }
  → POST /api/admin/templates (create) OR PUT /api/admin/templates/:id (update)
  → onSuccess: toast + navigate to edit route OR stay
```

### Duplicate flow
```
DuplicateButton.click
  → copy = structuredClone(cfg)
  → newSlug = slugify(name) + '-copy-' + Date.now()
  → POST create w/ { name: name+' (Bản sao)', slug:newSlug, customizable_fields:copy, ...otherMeta }
  → navigate to /templates/edit/:newId/builder
```

### Thumbnail auto-gen (optional, stretch)
```
admin → iframe: postMessage({ type:'CAPTURE_THUMBNAIL' })
preview: dynamic import('html2canvas'), render #capture-root, toBlob, postMessage({ type:'THUMBNAIL_CAPTURED', dataUrl })
admin → upload dataUrl to /api/admin/upload → get URL → set thumbnail_url
```
**Recommendation:** defer. Phase 1 = manual thumbnail via ImageUpload in metadata drawer.

### Metadata drawer
Top-right drawer or modal triggered by "Cài đặt mẫu" button. Contains: name, slug, category, price_per_day, price_per_month, is_free, has_video, is_active, thumbnail_url (ImageUpload). Submitted together w/ config on Save.

## Related Code Files
- `wedding-admin/src/api/template.api.ts` — create/update functions
- `wedding-admin/src/pages/templates/TemplateFormPage.tsx:101-120` — existing submit pattern
- `handlers/admin_handler.go:37-108` — endpoints

## Implementation Steps
1. Create `MetadataDrawer.tsx` in builder w/ antd Drawer + Form for non-config fields.
2. Create `useBuilderState.ts` hook bundling metadata + config + dirty flag.
3. `SaveButton`: validate metadata → call `templateApi.create` or `templateApi.update`.
4. `DuplicateButton`: open confirm dialog → POST w/ cloned config + new slug → navigate.
5. Navigation guard: `useBeforeUnload` + react-router `useBlocker` for dirty state.
6. Load existing template on edit route: `useQuery(['template', id])` → hydrate metadata + config.
7. (Optional) Thumbnail capture flow — design but skip implementation unless user confirms.
8. Handle slug uniqueness conflict: on 409, append random suffix and retry once, else surface error.

## Todo
- [ ] MetadataDrawer component
- [ ] useBuilderState hook w/ dirty tracking
- [ ] Save create/update wiring
- [ ] Duplicate action
- [ ] Navigation dirty guard
- [ ] Hydrate edit mode from API
- [ ] Slug conflict fallback
- [ ] (Optional) Thumbnail auto-gen spike

## Success Criteria
- Create flow: builder → Save → new row appears in templates list w/ config persisted.
- Edit flow: reopen builder → config loads, changes save, iframe reflects persisted state on reload.
- Duplicate: clone appears in list w/ suffixed name + new slug; edit independently does not affect original.
- Dirty prompt on tab close w/ unsaved edits.

## Risk Assessment
- **Slug collisions:** race w/ manual edit. Mitigate: retry w/ random suffix.
- **Large config payload:** JSON size near 64KB cap w/ many gallery URLs. Mitigate: URLs are short, cap is generous; warn on approach.
- **html2canvas cross-origin:** complex, iframe same-origin within own domain but admin is different origin. Defer.
- **React Query stale cache:** invalidate `['templates']` + `['template', id]` on save.

## Security Considerations
- Metadata drawer inputs — keep antd form validation (trim, maxLength).
- Slug must be URL-safe — reuse existing `slugify` util (TemplateFormPage.tsx:13).
- Only admin-authed users can access `/templates/*` routes (existing auth guard presumed).

## Next Steps
→ User review of plan. Confirm unresolved questions (thumbnail auto-gen, music size cap, preview auth). Proceed to implementation starting Phase 01.
