# Phase 02 — Hero & Family Sections

## Context
- Parent: ../plan.md
- Depends on: phase-01 (EditableText, prop fan-out)
- Research: ../research/researcher-01-section-edit-inventory.md (Hero, Family entries)

## Overview
- Date: 2026-04-09
- Description: Wrap Hero (3 framer-motion images) and Family (decorative flower + 2 photo slots + section title) in EditableSlot/EditableText.
- Priority: High
- Implementation status: Not Started
- Review status: Pending

## Key Insights
- Hero phoenix_left/right and chu_hy already read from `cfg.assets.hero` — only wrapping work, no schema.
- Family `groom_photo`/`bride_photo` currently order-driven; cfg fallback exists but never wins. Decision: keep order priority but allow cfg to override when admin is in editMode (or always — see open question).
- Phoenix presets reusable across cover/hero via `assetPresets.ts` `slots` filter (no asset duplication).
- All `/uploads/` URLs need `unoptimized` flag — Family photos most at-risk.

## Requirements
- Hero: wrap phoenix_left, phoenix_right, chu_hy with EditableSlot; wrap hero subtitle text with EditableText (slot `hero.subtitle`).
- Family: wrap flower with EditableSlot; wrap section title "Thông Tin Lễ Cưới" with EditableText (slot `family.section_title`); wrap groom/bride photo elements with EditableSlot.
- Toggle `pointerEvents: editMode ? 'auto' : 'none'` on motion.div decor wrappers.
- Add hero subtitle and family section title to `slotRegistry.ts` if absent.
- Extend `assetPresets.ts` `slots` arrays so phoenix/flower presets accept `hero.*` and `family.*` keys.

## Architecture

### EditableSlot wrap pattern (from CoverSection)
```tsx
<EditableSlot section="hero" slot="phoenix_left" editMode={editMode}>
  <motion.div style={{ pointerEvents: editMode ? 'auto' : 'none' }} layout={false}>
    <Image src={...} unoptimized={src.startsWith('/uploads/')} />
  </motion.div>
</EditableSlot>
```

### Slot keys touched
- hero.phoenix_left, hero.phoenix_right, hero.chu_hy, hero.subtitle
- family.flower, family.groom_photo, family.bride_photo, family.section_title

## Related Code Files
- wedding-web/components/themes/songphung-red/HeroSection.tsx:67, :92, :165, :195
- wedding-web/components/themes/songphung-red/FamilySection.tsx:55, :82, :118, :187
- wedding-admin/src/pages/templates/builder/slotRegistry.ts (add missing keys)
- wedding-admin/src/pages/templates/builder/assetPresets.ts (extend slots filter)

## Implementation Steps
1. HeroSection: accept `editMode` prop; wrap phoenix_left, phoenix_right, chu_hy `<motion.div>` blocks in `EditableSlot`. Flip `pointerEvents` on the wrapper.
2. HeroSection: locate subtitle render (if not present, add reading `cfg.text_samples?.hero?.subtitle`); wrap with EditableText.
3. FamilySection: accept `editMode`; wrap flower div (line 55) in EditableSlot, flip pointerEvents, drop parallax callback when editMode true (or set `pointer-events:auto` and let parallax keep running — verify no transform conflict).
4. FamilySection: wrap groom_photo (line 187) and bride_photo (line 118) Image elements in EditableSlot — even when order-provided, EditableSlot can still accept drops to override cfg.
5. FamilySection: wrap "Thông Tin Lễ Cưới" h2 (line 82) with EditableText.
6. Add `unoptimized={src.startsWith('/uploads/')}` to Family photo Images (lines 118, 187).
7. slotRegistry.ts: ensure entries exist for hero.subtitle (text), family.section_title (text), family.flower (image), family.groom_photo, family.bride_photo. Mark text vs image kind if registry supports.
8. assetPresets.ts: ensure phoenix presets list `hero.phoenix_left`, `hero.phoenix_right`; flower presets list `family.flower`.
9. Manual: in builder, click each new element, drop a preset, type into title — verify SLOT_FOCUSED/PRESET_DROPPED/TEXT_EDITED arrive.

## Todo
- [ ] HeroSection editMode prop + 3 EditableSlot wraps
- [ ] HeroSection subtitle EditableText
- [ ] FamilySection editMode prop + flower wrap
- [ ] FamilySection groom/bride photo wraps + unoptimized flag
- [ ] FamilySection section title EditableText
- [ ] slotRegistry entries
- [ ] assetPresets slots filter extended
- [ ] Smoke test in builder

## Success Criteria
- All 7 hero+family elements clickable in builder, focus inspector, accept drops where applicable.
- Section title editable inline, persists via TEXT_EDITED.
- Public view (editMode=false) renders identical pixels to current.

## Risk Assessment
- Parallax ref on family.flower may conflict with EditableSlot drag overlay — fall back to disabling parallax when editMode.
- Family photo override semantics (order vs cfg) unclear — flag for product decision.
- Phoenix scaleX:-1 transform may cause drag-image to look mirrored — cosmetic, accept.

## Security Considerations
- Same as phase 01 (plaintext only).
- Image preset URLs already validated by existing PRESET_DROPPED handler.

## Next Steps
Phase 03: Ceremony + Countdown.
