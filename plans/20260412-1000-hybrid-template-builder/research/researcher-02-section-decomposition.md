# Section Decomposition Analysis: songphung-red Theme

## 1. Section-by-Section Element Inventory

| Section | Block Name | Elements | Layout Type | Text Slots |
|---------|-----------|----------|-------------|-----------|
| **Cover** | `cover-songphung` | phoenix_left, phoenix_right, flower_tl, flower_br, chu_hy (icon), names, amp, date, divider | Absolute overlay (fixed) + flex center | bride_name, groom_name, invitation_greeting, invitation_subtext, button_label |
| **Hero** | `hero-songphung` | phoenix_left, phoenix_right, chu_hy (icon), flower (right), red_band | Absolute positioned asymmetric | bride_name, groom_name |
| **Family** | `family-songphung` | flower (top-right), section_title, bride_photo (circle), groom_photo (circle), center_divider | Grid (1fr - divider - 1fr) + parallax | section_title, parent names, addresses, couple_names |
| **Ceremony** | `ceremony-songphung` | decor_top_left, decor_bottom_right, decor_flower (3x), chu_hy symbol | Flex column center + parallax | venue names, times, dates, form labels |
| **Countdown** | `countdown-songphung` | Background (solid/image), timer boxes | Grid 4 columns | "Days", "Hours", "Minutes", "Seconds" |
| **Gallery** | `gallery-songphung` | Grid container, image cells | Grid 3 columns | Section title |
| **Wishes** | `wishes-songphung` | Comment cards, input form | Flex column | Wish form fields, comment author/text |
| **Bank** | `bank-songphung` | Bank cards (2 cols), copy buttons | Grid 2 columns | Account holder, account number, bank name |
| **Footer** | `footer-songphung` | Names, music credit, social links | Flex center | Names, attribution text |

---

## 2. Shared Element Catalog

**Reusable Decorative Assets Across Sections:**

```
phoenix: 
  - Used in: cover, hero
  - Props: src, width, opacity, zIndex, scaleX(flip), position
  - Animation: slideInLeft/slideInRight (framer-motion) on view
  
chu_hy (Double Happiness symbol):
  - Used in: cover, hero, ceremony
  - Props: src, width, opacity
  - Animation: scale spring (cover), scale + opacity (hero), static (ceremony)
  
flower:
  - Used in: cover (2x positions), hero, family, ceremony
  - Props: src, width, opacity, transform(rotate/scaleX), position
  - Animation: fadeIn on view (family, ceremony via parallax)
  
phoenix-line (decorative line):
  - Used in: ceremony (top-left, bottom-right corners)
  - Props: src, width, opacity, scaleX flip
  - Animation: parallax scroll (negative/positive speed)
```

**Element Position Patterns:**
- **Absolute Overlay**: Cover (fixed full-screen), Hero phoenix (absolute top%)
- **Parallax Background**: Family flower (top-right), Ceremony decorations (corners)
- **Grid Flow**: Family (3-col), Gallery/Bank (2-3 col)
- **Flex Center**: Ceremony section, Footer

---

## 3. Animation/Effect Catalog

| Animation | Used In | Parameters |
|-----------|---------|-----------|
| `slideInLeft` | Hero phoenix-left | duration: 1s, delay: 0.4s |
| `slideInRight` | Hero phoenix-right | duration: 1s, delay: 0.4s |
| `fadeInUp` | Family titles, elements | duration: 0.7s, various delays |
| `scale + opacity` | cover chu_hy | spring type, delay: 0.3s |
| `scaleX` | Hero red band | duration: 0.8s, delay: 0.6s |
| `parallax scroll` | Family/Ceremony decorations | speed: -0.02 to 0.04 (clamped ±80px) |
| `musicPulse` | Music button | infinite keyframe, scale/shadow |
| `floatSlow` | Generic hover (CSS fallback) | translateY(-8px), 3s cycle |

---

## 4. Proposed Element Schema (TypeScript)

```typescript
interface SectionElement {
  // Unique ID within section (e.g., "phoenix_left")
  id: string;
  
  // Element type: 'image' | 'text' | 'symbol' | 'container' | 'form'
  type: 'image' | 'text' | 'symbol' | 'container' | 'form';
  
  // Is this element required for section to render?
  required: boolean;
  
  // Category for asset library filtering
  category: 'phoenix' | 'flower' | 'symbol' | 'border' | 'background' | 'icon';
  
  // Position info
  position: {
    type: 'absolute' | 'relative' | 'fixed' | 'static';
    top?: number | string;
    left?: number | string;
    right?: number | string;
    bottom?: number | string;
    width?: number | string;
    height?: number | string;
    zIndex?: number;
  };
  
  // Customizable CSS properties
  style: {
    opacity?: number;
    transform?: string; // 'scaleX(-1)', 'rotate(180deg)', etc
    filter?: string;
  };
  
  // Animation config
  animation?: {
    variant: 'slideInLeft' | 'slideInRight' | 'fadeIn' | 'scale' | 'parallax' | null;
    delay?: number;
    duration?: number;
    parallaxSpeed?: number; // -0.04 to 0.04
  };
  
  // For editable text slots
  textContent?: {
    key: string;
    editable: boolean;
    defaultText: string;
  };
}
```

---

## 5. Block Template Schema (TypeScript)

```typescript
interface BlockTemplate {
  // Globally unique block ID (e.g., "cover-songphung")
  blockId: string;
  
  // Display name in builder
  label: string;
  
  // Section key from TemplateConfig
  sectionKey: SectionKey;
  
  // Sections can have 0-n decoration elements (optional)
  decorativeElements: SectionElement[];
  
  // Sections always have 1+ structural elements
  structuralElements: SectionElement[];
  
  // Layout: how flex/grid is organized
  layout: {
    type: 'absolute' | 'flex' | 'grid' | 'overlay';
    direction?: 'row' | 'column';
    gap?: number;
    gridCols?: number; // for grid layout
  };
  
  // Override config for this block instance
  config?: Partial<TemplateConfig>;
  
  // Animations active in this block
  animations: Array<{
    elementId: string;
    variant: string;
    delay: number;
  }>;
  
  // Parallax elements (if any) with scroll speed
  parallaxElements?: Array<{
    elementId: string;
    speed: number;
    template?: string;
  }>;
}
```

---

## 6. How "Load songphung-red Preset" Populates Builder

**Flow:**
1. Admin clicks "Load songphung-red preset" button in builder
2. Builder instantiates 9 `BlockTemplate` objects from theme config
3. Each block is added to canvas in order: cover → hero → family → ceremony → countdown → gallery → wishes → bank → footer
4. For each block:
   - **Decorative elements** populate as "optional moveable items" (admin can drag to reorder or delete)
   - **Structural elements** are locked/required (names, times, dates always render)
   - **Text slots** become editable inline in the block preview
   - **Config overrides** (colors, fonts) apply from `cfg.assets[sectionKey]` + `cfg.colors` + `cfg.fonts`

**Blank vs Preset:**
- **Blank section**: Empty layout skeleton, structural elements only (e.g., title placeholder, empty photo frame)
- **Preset section**: All decorative elements + sample texts + animations enabled

---

## 7. Element Categories for Asset Library

```typescript
type ElementCategory = 
  | 'phoenix'      // Birds (phoenix.webp, phoenix2.webp)
  | 'flower'       // Floral designs (flower.webp)
  | 'symbol'       // Chinese/cultural (chu-hy.webp, "Double Happiness")
  | 'border'       // Lines, dividers (phoenix-line.webp)
  | 'background'   // Paper textures, solid colors (paper-bg.jpg)
  | 'icon'         // Music button, close button, etc
;
```

**Asset Mapping:**
- `phoenix.webp` → phoenix, hero, cover (shared)
- `flower.webp` → cover, hero, family, ceremony (shared)
- `chu-hy.webp` → cover, hero, ceremony (symbol)
- `phoenix-line.webp` → ceremony corners (border)
- `paper-bg.jpg` → cover card background (background)

---

## 8. Unresolved Questions

1. **Drag-to-reorder elements within a block**: Should admin reorder phoenix position (left ↔ right) or is that config-based only?
2. **Photo upload in builder**: Family section has bride_photo/groom_photo slots. Does builder allow inline upload or redirect to asset manager?
3. **Parallax on mobile**: Should parallax decorations be disabled in builder preview on small screens?
4. **Music button state**: Should builder show music toggle button, or is it hidden in preview mode?
5. **RSVP form in preview**: Should Ceremony RSVP form be functional in builder or mock-only?
6. **Visibility toggle**: Does builder allow admin to hide/show entire sections (e.g., hide countdown if no date set)?
7. **Theme color inheritance**: When admin changes primary color in settings, do all phoenix colors auto-update or require manual asset replacement?
8. **Form field validation**: Should builder provide live validation for RSVP form fields, or only on actual submit?

---

## Key Insights

- **9 total sections**: Cover is overlay; 8 flow sections below
- **Shared decor**: phoenix, flower, chu_hy reused 2-3x → store as theme-level assets
- **Parallax register**: Family, Ceremony use `registerParallax()` callback; others don't
- **Editing approach**: Use `EditableSlot` + `EditableText` wrappers already in place
- **Config-driven**: Almost all element sizes/positions can be overridden via `cfg.assets[section].*`

---

**Report Generated**: 2026-04-12  
**Status**: Analysis complete. Ready for Block Template implementation.
