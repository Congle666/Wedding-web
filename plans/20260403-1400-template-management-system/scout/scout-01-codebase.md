# Wedding Platform Template/Theme Management System - Codebase Scout Report

## Executive Summary
The system uses a **hybrid architecture**: backend stores HTML templates, frontend has only one hardcoded React theme component (SongPhungTheme). No dynamic theme selection exists—all orders use the same React component, while legacy HTML rendering is also supported for backward compatibility.

---

## Backend Template Management

### Routes (routes/routes.go)
- **Public endpoints:**
  - `GET /api/templates` — List templates with filters (category, price, has_video)
  - `GET /api/templates/:slug` — Get single template
- **Admin endpoints (protected):**
  - `POST /api/admin/templates` — Create template
  - `PUT /api/admin/templates/:id` — Update template
  - `DELETE /api/admin/templates/:id` — Delete template (checks FK: order_items)

### Template Model (models/template.go)
```go
type Template struct {
  ID                 string     // UUID
  CategoryID         uint       // Foreign key
  Name, Slug         string
  ThumbnailURL       string
  PreviewImages      JSON       // Array of image URLs
  PricePerDay, PricePerMonth float64
  CustomizableFields JSON      // Not used yet
  Description        string
  HtmlContent        string     // LONGTEXT — full HTML for legacy rendering
  HasVideo, IsActive bool
  ViewCount          uint
}
```

**Key insight:** HtmlContent field stores complete HTML with placeholders (`{{groom_name}}`, `{{bride_name}}`, etc.). No `theme_name` or `theme_type` field exists.

### Admin Template CRUD (handlers/admin_handler.go)
- **Create:** `AdminCreateTemplate()` — accepts all fields including `html_content`
- **Update:** `AdminUpdateTemplate()` — updates via map, allows `html_content` modification
- **Delete:** Prevents deletion if orders reference the template (FK constraint)
- **Read:** `AdminGetTemplateByID()` — returns full template with category

**No theme selection UI:** Only template CRUD, no way to assign or select which theme component to use.

---

## Wedding Rendering

### HTML Rendering (handlers/wedding_render_handler.go)
- **Endpoint:** `GET /w/:slug` — Serves static HTML page
- **Flow:** Find order → Get template HTML → Replace placeholders → Stream HTML string
- **Placeholders replaced:** groom_name, bride_name, wedding_date, venue, gallery_urls, bank_accounts, rsvp_enabled, guest_book_enabled
- **Limitation:** No React—pure server-side string replacement

### Public API (handlers/public_wedding_handler.go)
- **Endpoint:** `GET /api/wedding/:slug` — Returns JSON with all wedding data
- **Used by:** Frontend React app to render the wedding page
- **Returns:** template object + wedding info + wishes + RSVP count
- **Template field minimal:** Only slug and category—doesn't include html_content

---

## Frontend Theme System

### Current State: Single Hardcoded Theme
- **Theme location:** `/wedding-web/components/themes/songphung-red/`
- **Components:**
  - `SongPhungTheme.tsx` — Main theme wrapper (no props for theme selection)
  - `CoverSection.tsx`, `CountdownSection.tsx`, `CeremonySection.tsx`, etc. — 9 sub-components
- **Styling:** Inline CSS with responsive breakpoints via media queries
- **Theme color:** Hardcoded red/cream palette (#8B1A1A background, #F5EAE0 cream)

### Wedding Page Routing (app/w/[slug]/page.tsx)
```tsx
const { data } = useQuery({ queryFn: () => fetchWedding(slug) });
return <SongPhungTheme data={data} />;  // Always uses SongPhungTheme
```

**Critical limitation:** Theme component is hardcoded. No dynamic theme selection based on:
- Template selection
- Theme ID in database
- Admin preference
- Order metadata

### Template Detail Page (app/mau-thiep/[slug]/page.tsx)
- Displays template preview with thumbnail
- Shows pricing, description, reviews
- No theme preview or visual representation of what the actual wedding will look like

---

## Admin Template Form (wedding-admin/src/pages/templates/TemplateFormPage.tsx)

### What Works
- ✅ Create/Edit template with name, slug, category, pricing
- ✅ Upload thumbnail image
- ✅ Paste/Upload HTML file (drag-and-drop)
- ✅ Preview uploaded HTML in new window
- ✅ Placeholder guide (copy-paste reference)
- ✅ Toggle has_video, is_active, customizable fields editor

### What's Missing
- ❌ **No theme selection dropdown** — Can't select which React component to use
- ❌ **No React component upload** — Only HTML files accepted
- ❌ **No preview of React rendering** — Can't see how SongPhungTheme will look with their HTML
- ❌ **No way to create new themes via UI** — Must edit React components manually in code

---

## Critical Gaps & Issues

### 1. Single Theme Lock-In
- All weddings render via `SongPhungTheme` component
- No abstraction for theme selection
- Adding a second theme requires manual code changes

### 2. HTML vs React Duality
- Backend stores `HtmlContent` for legacy SSR rendering (`/w/:slug`)
- Frontend uses React (`/api/wedding/:slug` + SongPhungTheme)
- Admin form teaches users to upload HTML but it's only used for SSR
- React rendering ignores HTML content entirely

### 3. Theme Metadata Missing
- Template model has no `theme_name`, `theme_id`, or `theme_slug` field
- No way to track which theme a template uses
- Database schema can't support multiple themes per category

### 4. Admin Workflow Broken
- Admin uploads HTML but can't verify it will render correctly in React
- No visual feedback on what customers will actually see
- Customizable fields are stored but never used in rendering

---

## Data Flow Diagram

### Public Wedding View (React)
```
GET /api/wedding/:slug 
  → Order + WeddingInfo + Wishes + RSVP count
  → SongPhungTheme (hardcoded)
  → Renders wedding page
```

### Legacy SSR View (HTML)
```
GET /w/:slug
  → Order + Template.HtmlContent
  → String replace {{placeholders}}
  → Stream HTML response
```

### Admin Form → API
```
Form submit (html_content, name, etc.)
  → POST /api/admin/templates
  → Stored in DB (HtmlContent + metadata)
  → No feedback on React rendering
```

---

## Recommendations for Multi-Theme Support

1. **Add theme field to Template model:** `ThemeSlug string` (e.g., "songphung-red")
2. **Create theme registry:** Map theme slugs to React components
3. **Modify wedding page:** `const ThemeComponent = themeRegistry[template.theme_slug] || SongPhungTheme`
4. **Update admin form:** Add theme selector dropdown (requires backend endpoint to list available themes)
5. **Database migration:** Add optional `theme_slug` column to templates table
6. **Deprecate HTML rendering:** Eventually remove `/w/:slug` SSR, use only React (`/w/[slug]`)

---

## Files Involved
- Backend: `/handlers/{admin,template,wedding_render,public_wedding}_handler.go`
- Models: `/models/{template,order,wedding_info}.go`
- Frontend: `/wedding-web/app/w/[slug]/page.tsx`, `/components/themes/songphung-red/`
- Admin: `/wedding-admin/src/pages/templates/TemplateFormPage.tsx`
- Routes: `/routes/routes.go`

**Total scope:** ~15 files, ~2000 LOC for full theme system implementation
