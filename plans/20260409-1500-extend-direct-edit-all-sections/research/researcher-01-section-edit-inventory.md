# Songphung-Red Theme: Complete EditableSlot Inventory

**Status:** 8 sections remain (Hero, Family, Ceremony, Countdown, Gallery, Wishes, Bank, Footer)  
**Pattern Reference:** CoverSection (already refactored) + editModeHelpers.tsx

---

## Hero Section
- **File:** HeroSection.tsx (222 lines)
- **Cfg Status:** ✓ Reads cfg.assets.hero (lines 20–24): phoenix_left, phoenix_right, chu_hy. Already uses fallbacks from slotRegistry.
- **Hardcoded Images (3):**
  - `phoenix_left` – line 67, motion.div wrapper | slot: `hero.phoenix_left`
  - `phoenix_right` – line 92, motion.div wrapper, scaleX:-1 | slot: `hero.phoenix_right`
  - `chu_hy` – line 165, motion.div wrapper, scale animation | slot: `hero.chu_hy`
- **Hardcoded Decorative:** /flower.webp (line 195) – static, not in slotRegistry
- **Hardcoded Text:** Names via props (brideName, groomName), not editable. "Hỷ" alt text only.
- **Complications:** 
  - Phoenix images wrapped in framer-motion.div (pointerEvents:none at line 63, 89) → flip to auto when editMode
  - Chu_hy has nested motion.div with scaleOut animation (lines 158–174) → click needs stopPropagation
  - Absolute positioning all correct; no transform conflicts expected
- **Est. Lines-of-Change:** ~30 (wrap 3 images with EditableSlot, add editMode prop)

---

## Family Section
- **File:** FamilySection.tsx (340 lines)
- **Cfg Status:** ✓ Reads cfg.assets.family (lines 23–27): flower, groom_photo, bride_photo. Falls back to order props if no photo provided (lines 26–27 logic).
- **Hardcoded Images (3):**
  - `flower` (decorative) – line 55, div with parallax ref, pointerEvents:none | slot: `family.flower`
  - `groom_photo` – line 187, conditional Image if groomPhotoUrl | NOT in config fallback, order-driven only
  - `bride_photo` – line 118, conditional Image if bridePhotoUrl | NOT in config fallback, order-driven only
- **Hardcoded Text:**
  - "Thông Tin Lễ Cưới" (line 82)
  - "Ông Bà" (lines 133, 202) ×2
  - "Chú Rể" (line 290), "Cô Dâu" (line 335)
  - "Trân trọng kính mời..." (line 249)
- **Complications:**
  - Flower has parallax ref (line 42) + pointerEvents:none (line 50) → must flip on editMode
  - Photos only render if order provides them; config fallback not implemented (design choice?)
  - Couple display uses _different_ names than section labels
- **Est. Lines-of-Change:** ~25 (wrap flower + add editMode prop, consider photo fallback logic)

---

## Ceremony Section
- **File:** CeremonySection.tsx (→ 665 lines, read first 250)
- **Cfg Status:** ✗ Does NOT read cfg at all. Props-only: weddingTime, weddingDate, ceremonyVenue, etc.
- **Hardcoded Images (~3):**
  - `phoenix-line` top-left – line 152, parallax ref, pointerEvents:none | suggested slot: `ceremony.decor` (already in registry)
  - `phoenix-line` bottom-right – line 176, parallax ref, pointerEvents:none, scaleX:-1 | same slot
  - `flower` bottom-left – line 199, parallax ref, pointerEvents:none | same slot
- **Hardcoded Text:**
  - "Lễ Gia Tiên" (line 230) – conditional heading if ceremonyTime exists
  - All venue/time data from props (no editable strings yet)
- **Complications:**
  - Parallax system uses registerParallax callback – pointerEvents:none tied to three separate decorative divs
  - File is 665 lines (large); need to verify full structure for all editable slots
  - All hardcoded strings appear in motion.div animations; need click handler safety
- **Est. Lines-of-Change:** ~20–30 (wrap 3 decor Images, add editMode prop, toggle pointerEvents)

---

## Countdown Section
- **File:** CountdownSection.tsx (114 lines)
- **Cfg Status:** ✗ Accepts cfg prop but does NOT read it (line 26 ignored).
- **Hardcoded Images (1):**
  - `flower` – line 65, pointerEvents:none, scaleX:-1 | NOT in slotRegistry currently
- **Hardcoded Text:**
  - "Cùng Đếm Ngược" (line 91)
- **Complications:**
  - Minimal section; flower is purely decorative
  - Countdown display is dynamic (calculated, not editable)
- **Est. Lines-of-Change:** ~10 (wrap 1 flower image, add editMode prop)

---

## Gallery Section
- **File:** GallerySection.tsx (150+ lines, partial read)
- **Cfg Status:** ✓ Accepts cfg prop but NOT used. Reads galleryUrls array prop only.
- **Hardcoded Images (0):**
  - Gallery images sourced entirely from galleryUrls array (dynamic)
  - Lightbox component: static QR icon, nav buttons (no editableSlots needed)
- **Hardcoded Text:** None observable in read portion
- **Complications:**
  - Registry has empty array: `gallery: []` → images handled separately
  - Lightbox is independent modal (portal-style); click/drop logic complex
  - Unoptimized flag may be needed for /uploads/ URLs in gallery
- **Est. Lines-of-Change:** ~5–10 (potentially add unoptimized flag per image, add editMode prop passthrough)

---

## Wishes Section
- **File:** WishesSection.tsx (partial read ~200 lines)
- **Cfg Status:** ✗ Accepts cfg prop but does NOT read it.
- **Hardcoded Images (2):**
  - `phoenix-line` bottom-right – line 92, pointerEvents:none, scaleX:-1 | NOT in slotRegistry
  - `flower` bottom-left – line 114, pointerEvents:none | NOT in slotRegistry
- **Hardcoded Text:**
  - "Sổ lưu bút" (line 138)
  - Form labels: "Tên của bạn", "Để lại lời chúc..." (lines 163, 172)
- **Complications:**
  - Registry: `wishes: []` (empty) → these decorative images not tracked
  - Form inputs are dynamic (state-driven); no editable slots needed for messages
- **Est. Lines-of-Change:** ~10 (wrap 2 decorative images, add editMode prop)

---

## Bank Section
- **File:** BankSection.tsx (314 lines)
- **Cfg Status:** ✗ Accepts cfg prop but does NOT read it.
- **Hardcoded Images (1):**
  - `flower` – line 262, pointerEvents:none | suggested slot: `bank.bg` (exists in registry as single slot)
- **Hardcoded Text:**
  - "Hộp Mừng Cưới" (line 286)
  - Bank card labels computed from account data (not hardcoded)
- **Complications:**
  - QR codes are generated dynamically via vietqr.io (not editable)
  - Copy/download buttons are functional UX, not design elements
  - `bank.bg` slot in registry suggests section background, but current code only has decorative flower
- **Est. Lines-of-Change:** ~10 (wrap 1 image, add editMode prop, clarify bg vs decor slot intent)

---

## Footer Section
- **File:** FooterSection.tsx (82 lines)
- **Cfg Status:** ✓ Reads cfg.colors.primary, cfg.colors.background, cfg.fonts.heading, cfg.fonts.body (lines 19–22). Does NOT read cfg.assets.
- **Hardcoded Images (0):**
  - No images
- **Hardcoded Text:**
  - "Sự hiện diện của quý khách là niềm vinh hạnh gia đình chúng tôi!" (line 55)
  - "Thiết kế bởi" + link to juntech.vn (lines 67–78)
- **Complications:**
  - Pure text footer; no image editable slots
  - Link is hardcoded; social/contact info could be future enhancement
  - No decorative elements → minimal editMode overhead
- **Est. Lines-of-Change:** ~5 (add editMode prop, future text editability via contentEditable)

---

## Cross-Cutting Concerns

### Slot Namespace Sharing
- **cover.phoenix_left** vs **hero.phoenix_left** → separate cfg entries ✓ (slotRegistry shows both)
- Same pattern for chu_hy, flower between sections → all scoped correctly
- **Risk:** Unclear if Family should use cfg.assets.family.groom_photo or if it's order-only. Currently order overrides cfg (line 26 logic).

### Unoptimized Flag for /uploads/
- **Hero:** Already set (lines 73, 99, 172) ✓
- **Cover:** Already set (lines 141, 170, 198, 227, 260) ✓
- **Family:** MISSING on bridePhotoUrl/groomPhotoUrl (lines 118, 187) — these come from order/props, not cfg
- **Ceremony, Countdown, Gallery, Wishes, Bank, Footer:** All use static /themes/ URLs → safe
- **Action:** Add unoptimized check to Family order-based photos if they can be /uploads/

### Pointer-Events Management
- **Current:** Static pointerEvents:'none' on all decorative divs
- **Issue:** EditMode hover/click will be blocked unless flipped to 'auto' or removed
- **Solution:** Use pattern from CoverSection (line 130, 159) — set `pointerEvents: editMode ? 'auto' : 'none'` on wrapper
- **Affected Sections:** Hero (3 motion.divs), Family (1 parallax div), Ceremony (3 parallax divs), Countdown (1 div), Wishes (2 divs), Bank (1 div)
- **Frequency:** ~11 total decorative containers need this toggle

### Framer-Motion Interaction Risks
- **Hero phoenix_left/right, chu_hy:** motion.div with initial/animate/transition props
- **Cover chu_hy:** motion.div nested inside EditableSlot (line 240–251) ✓ — already works
- **Risk:** Click handlers on motion.div can interfere with scroll/drag if not stopPropagation
- **Mitigation:** CoverSection approach (Section uses parent click, EditableSlot handles it) is safe. Keep EditableSlot onClick logic.

### Missing Registry Entries
- **Countdown.flower, Wishes.phoenix-line/flower, Bank.bg (unclear if decor or actual bg)** — not in current slotRegistry
- **Question:** Should these become slots or remain static fallbacks?

---

## Unresolved Questions

1. **Family Photos:** Should cfg.assets.family.groom_photo/bride_photo be used when order doesn't provide photos, or is order-only by design?
2. **Wishes/Countdown Decorations:** Add phoenix-line/flower to registry as editable slots, or keep as static fallbacks?
3. **Bank.bg:** Is this meant to be section background image (CSS bg-image) or a decorative element? Current code only has flower decor.
4. **EditMode Prop Propagation:** Should all 8 remaining sections accept an editMode prop, or derive it from iframe context?
5. **Text Editability:** Beyond images, should hardcoded strings like "Sổ lưu bút", "Cùng Đếm Ngược", "Hộp Mừng Cưới" become editable via contentEditable later?
6. **Parallax + EditMode:** How should registerParallax callbacks interact with editMode? Block parallax when editing?

---

## Summary Table

| Section | Images | Text | Cfg Read | Complications | Est. LOC |
|---------|--------|------|----------|---------------|---------|
| Hero | 3 (motion) | Names (props) | ✓ | pointerEvents, transform | 30 |
| Family | 3 (parallax+order) | 6 strings | ✓ | parallax refs, photo fallback | 25 |
| Ceremony | 3 (parallax) | Venue (props) | ✗ | Large file, 3 parallax divs | 25–30 |
| Countdown | 1 (static) | "Cùng Đếm Ngược" | ✗ | Minimal | 10 |
| Gallery | 0 (array-driven) | Form labels | ✓ | unoptimized flag | 5–10 |
| Wishes | 2 (static) | "Sổ lưu bút" + form | ✗ | Not in registry | 10 |
| Bank | 1 (static) | "Hộp Mừng Cưới" | ✗ | bg slot unclear | 10 |
| Footer | 0 | "Sự hiện diện..." | ✓ | Text-only | 5 |

**Total estimated lines-of-change:** 120–150 across all sections.
