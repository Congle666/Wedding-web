# SongPhung-Red Theme Structure Inventory

## Executive Summary
SongPhungTheme renders 8 sequential sections w/ data + visible_sections control. Each section hardcodes theme assets (/themes/songphung-red/*) but accepts dynamic data via WeddingData props. Theme colors hardcoded (#5F191D red, #F8F2ED cream). Builder must extract customizable surface area (images, text, colors, fonts) into JSON schema.

---

## 1. Section-by-Section Inventory

| Section | File | Hardcoded Images | Hardcoded Text | Colors | Fonts | Must→Config |
|---------|------|------------------|-----------------|--------|-------|----------|
| **Cover** | CoverSection.tsx:L1-398 | phoenix.webp (L106, L129), flower.webp (L151, L174), chu-hy.webp (L200, L280), paper-bg.jpg (L77) | "Mở thiệp" (L391), "Thân Mời" (L319), "đến dự buổi tiệc..." (L364), hardcoded date fmt "DD tháng M, YYYY" (L24) | #5F191D (red), #F8F2ED (cream) (L56, L76, L214, etc) | Cormorant Garamond serif 40px bold (L215-217) | phoenix L/R paths, flower paths, bg img path, button text, invitation text, color scheme, fonts |
| **Hero** | HeroSection.tsx:1-~150+ | phoenix.webp (L55, L80), chu-hy.webp not shown in excerpt | Names only (dynamic via props L9) | #5F191D, #F8F2ED implied | Cormorant Garamond (L9) | phoenix paths, decorative symbols, colors |
| **Family** | FamilySection.tsx:1-~200+ | flower.webp (L47), groom/bride photos (dynamic via props L12-13: groomPhotoUrl, bridePhotoUrl) | "Gia Đình" section title (hardcoded), family member names from props (L10-11) | Cream/red scheme | Cormorant Garamond | flower decorative, background imgs paths, section title text |
| **Ceremony** | CeremonySection.tsx:Not fully read | Assumed decorative (phoenix/flower from theme) | Venue names, dates, times from props (WeddingData:L36-42) | Red/cream scheme | Cormorant Garamond | Venue graphics, decorative assets, date/time formatting |
| **Countdown** | CountdownSection.tsx:Not fully read | Timer graphics (unknown if hardcoded or dynamic) | Timer logic from wedding_date prop | Color scheme | Font scheme | Countdown display logic, styling |
| **Gallery** | GallerySection.tsx:1-~80 | Lightbox/carousel UI (hardcoded nav buttons L39-55), user gallery_urls dynamic (L8-9) | "Hình ảnh" title (likely hardcoded) | UI colors (white overlays L45-55) | Not specified in excerpt | Gallery grid layout, nav btn styling, lightbox colors |
| **Wishes** | WishesSection.tsx:Not read | None visible | RSVP form UI text, guest message display from wishes prop (WeddingData:L49) | Theme colors | Theme fonts | Form labels, section title, display styling |
| **Bank** | BankSection.tsx:1-80+ | QR codes dynamic (getQrUrl L62-66 → vietqr.io API), bank icons logic (L14-51 BANK_CODE_MAP) | Bank names from props (L10), account numbers from props | Theme color buttons (L79) | Not specified | Bank icons/logos, card layout, button styling |
| **Footer** | FooterSection.tsx:Not read | Likely decorative | Copyright, names from props | Theme colors | Theme fonts | Text, colors |

---

## 2. Current WeddingData Contract

**Location:** `wedding-web/app/w/[slug]/page.tsx:21-55`

```typescript
interface WeddingData {
  order_id: string;
  slug: string;
  template: { slug: string; category: string; theme_slug: string };
  // Names & family
  groom_name: string;
  bride_name: string;
  groom_parent: string;
  bride_parent: string;
  // Photos (dynamic URLs)
  groom_photo_url?: string;
  bride_photo_url?: string;
  groom_address?: string;
  bride_address?: string;
  // Dates & times
  wedding_date: string;
  lunar_date?: string;
  wedding_time: string;
  ceremony_time?: string;
  ceremony_venue: string;
  ceremony_address?: string;
  ceremony_maps_url?: string;
  reception_venue: string;
  reception_time?: string;
  reception_address?: string;
  reception_maps_url?: string;
  venue_address: string;
  maps_embed_url: string;
  // Gallery & wishes
  gallery_urls: string[];
  bank_accounts: BankAccount[];
  music_url?: string;
  wishes: Wish[];
  // Meta
  rsvp_count: number;
  custom_domain: string;
  guest_name?: string;
  view_count?: number;
  visible_sections?: Record<string, boolean>;  // ← KEY: Section visibility control
}
```

**Missing for builder:** Colors, fonts, section-specific images, decorative asset URLs.

---

## 3. Current Customizable Fields

**Location:** `models/template.go:25-56`

```go
type Template struct {
  ID                 string
  CustomizableFields datatypes.JSON  // ← JSON blob, no schema defined
  ThemeSlug          string
  // ... other fields
}
```

**Status:** `CustomizableFields` is empty JSON. No shape/schema exists. Must design.

**Where read:** 
- Admin form (not yet examined—assumed TemplateFormPage.tsx + CustomFieldEditor.tsx)
- Likely passed to frontend during template preview/edit flow
- Consumed by theme builder to populate visual editor

---

## 4. Theme Assets & Static Serving

**Location:** `wedding-web/public/themes/songphung-red/` inventory:

- phoenix.webp (main phoenix illustration)
- phoenix2.webp, phoenix-line.webp (variants)
- flower.webp (floral decoration)
- chu-hy.webp (double-happiness symbol)
- double-happiness.png/.svg (alternative DH graphics)
- hy-symbol.png (alternative symbol)
- paper-texture.jpg, paper-bg.jpg (background patterns)
- dh-test1.png, dh-test2.png (test graphics)

**Hardcoded paths:** All referenced as `/themes/songphung-red/[asset]` (relative to public/).

**Admin need:** Builder must allow upload/replacement of these per-section. Current upload handler location unknown—need to verify `handlers/upload_handler.go`.

---

## 5. SongPhungTheme Root Component

**Location:** `wedding-web/components/themes/songphung-red/SongPhungTheme.tsx:1-280`

**Key props:** `data: WeddingData` only.

**Hardcoded theme elements:**
- Background: #E8D5C4 outer, #F8F2ED inner w/ paper-bg.jpg (L99-100)
- Box max-width: 800px, centered (L100)
- Music toggle button: #5F191D bg, 48×48px, fixed bottom-right (L248-276)
- Default music URL fallback: `/themes/songphung-red/music.mp3` (L28)
- Responsive media queries (L141-176) all hardcoded breakpoints

**Section visibility:**
```typescript
const isVisible = (key: string) => {
  if (!data.visible_sections) return true;
  return data.visible_sections[key] !== false;
};
```
Keys referenced: 'hero', 'family', 'ceremony', 'countdown', 'gallery', 'wishes', 'bank' (L190-244).

**Parallax:** Optional registerParallax callback passed to Family & Ceremony sections for scroll effects.

---

## 6. Proposed Config JSON Schema

For `customizable_fields`, recommend structure:

```json
{
  "theme_slug": "songphung-red",
  "colors": {
    "primary_dark": "#5F191D",
    "primary_light": "#F8F2ED",
    "background_outer": "#E8D5C4",
    "accent": "#C8963C"
  },
  "fonts": {
    "heading": { "family": "Cormorant Garamond", "weight": 700, "style": "italic" },
    "body": { "family": "Be Vietnam Pro", "weight": 400, "style": "normal" }
  },
  "assets": {
    "cover": {
      "phoenix_left": "/themes/songphung-red/phoenix.webp",
      "phoenix_right": "/themes/songphung-red/phoenix.webp",
      "flower_bottom_left": "/themes/songphung-red/flower.webp",
      "flower_top_right": "/themes/songphung-red/flower.webp",
      "symbol": "/themes/songphung-red/chu-hy.webp",
      "background": "/themes/songphung-red/paper-bg.jpg"
    },
    "hero": { ... },
    "family": { ... },
    "ceremony": { ... },
    "gallery": { ... },
    "bank": { ... },
    "footer": { ... }
  },
  "text_overrides": {
    "cover": {
      "button_label": "Mở thiệp",
      "invitation_greeting": "Thân Mời",
      "invitation_subtext": "đến dự buổi tiệc chung vui cùng gia đình"
    },
    "bank": {
      "section_title": "Quà Tặng"
    }
  },
  "visible_sections": {
    "cover": true,
    "hero": true,
    "family": true,
    "ceremony": true,
    "countdown": true,
    "gallery": true,
    "wishes": true,
    "bank": true,
    "footer": true
  }
}
```

---

## 7. Admin Form Capabilities & Gaps

**Status:** Not yet examined (TemplateFormPage.tsx, CustomFieldEditor.tsx files not read).

**Known gaps:**
- No customizable_fields editor UI exists yet
- No image upload handler for theme assets (though general upload handler likely exists)
- No color picker integration
- No font selector UI

---

## 8. Unresolved Questions

1. **Upload flow:** Where does `handlers/upload_handler.go` live? How are user-uploaded images served? Is there a `/uploads/` directory?
2. **Admin image upload:** Does `wedding-admin/src/components/ui/ImageUpload.tsx` exist & support theme asset uploads?
3. **Customizable text:** Which text strings should be configurable? (e.g., button labels, section titles, dates format)
4. **Responsive overrides:** Should font sizes/colors have breakpoint-specific values in config?
5. **Music URL:** Should default music or upload be customizable per template?
6. **Section-specific styling:** Should each section have its own color/font overrides, or global only?
7. **Backend template creation:** Do existing admin endpoints support `customizable_fields` JSON mutation? (check template_handler.go)
8. **Preview flow:** How does admin preview a template w/ customizations before saving?

---

## File Reference Map

- Theme components: `d:/GoLang_Wedding/wedding-web/components/themes/songphung-red/`
- Theme registry: `d:/GoLang_Wedding/wedding-web/components/themes/registry.ts`
- Public assets: `d:/GoLang_Wedding/wedding-web/public/themes/songphung-red/`
- WeddingData interface: `d:/GoLang_Wedding/wedding-web/app/w/[slug]/page.tsx:21-55`
- Template model: `d:/GoLang_Wedding/models/template.go:25-56`
- Template handler: `d:/GoLang_Wedding/handlers/template_handler.go` (not fully examined)
