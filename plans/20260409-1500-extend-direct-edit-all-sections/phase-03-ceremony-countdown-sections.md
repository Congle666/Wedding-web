# Phase 03 — Ceremony & Countdown Sections

## Context
- Parent: ../plan.md
- Depends on: phase-01
- Research: ../research/researcher-01-section-edit-inventory.md (Ceremony, Countdown)

## Overview
- Date: 2026-04-09
- Description: Wrap 3 parallax decor divs in Ceremony + 1 flower in Countdown; add section titles as EditableText. Address parallax+editMode interaction.
- Priority: Medium
- Implementation status: Not Started
- Review status: Pending

## Key Insights
- Neither section currently reads `cfg` — must add `cfg` reader for `assets.ceremony.decor`, `assets.countdown.flower`, `text_samples.*.section_title`.
- Ceremony has 3 separate parallax-registered divs sharing slot `ceremony.decor` — collapse to one slot or split? Recommend split: `ceremony.decor_top`, `ceremony.decor_bottom`, `ceremony.decor_flower` so each is independently editable.
- Countdown.flower not yet in `slotRegistry.ts` — add.
- Parallax `registerParallax` callback should short-circuit when editMode true to avoid transforms during drop targeting.

## Requirements
- Ceremony: read cfg for decor URLs (with fallbacks); wrap 3 decor images; wrap "Lễ Gia Tiên" title; accept editMode prop.
- Countdown: read cfg for flower URL; wrap flower; wrap "Cùng Đếm Ngược" title; accept editMode prop.
- Disable parallax transform branch when editMode.
- Add slot keys to registry; add presets to assetPresets if not already general.

## Architecture

### Slot keys touched
- ceremony.decor_top, ceremony.decor_bottom, ceremony.decor_flower (or single ceremony.decor if user prefers — flag in todo)
- ceremony.section_title
- countdown.flower
- countdown.section_title

### Parallax bypass
```tsx
const parallaxRef = editMode ? null : useParallax(...)
```
or pass `disabled={editMode}` to existing helper.

## Related Code Files
- wedding-web/components/themes/songphung-red/CeremonySection.tsx:152, :176, :199, :230
- wedding-web/components/themes/songphung-red/CountdownSection.tsx:65, :91
- wedding-admin/src/pages/templates/builder/slotRegistry.ts
- wedding-admin/src/pages/templates/builder/assetPresets.ts

## Implementation Steps
1. CeremonySection: add `editMode` prop; add `cfg` field reads with fallbacks for decor_top/bottom/flower URLs.
2. Wrap each of 3 decorative motion.divs in EditableSlot; flip pointerEvents conditionally.
3. Wrap "Lễ Gia Tiên" h2 in EditableText (`ceremony.section_title`).
4. Bypass `registerParallax` when editMode true (early return or disabled flag).
5. CountdownSection: add `editMode` + cfg read for flower URL; wrap flower in EditableSlot; wrap "Cùng Đếm Ngược" in EditableText.
6. slotRegistry.ts: add ceremony.decor_top/bottom/flower, ceremony.section_title, countdown.flower, countdown.section_title.
7. assetPresets.ts: ensure flower/phoenix presets target new slot keys.
8. Smoke test: hover, click, drop on each new slot; type into both titles.

## Todo
- [ ] CeremonySection editMode + cfg
- [ ] 3 EditableSlot wraps + parallax bypass
- [ ] Ceremony title EditableText
- [ ] CountdownSection editMode + cfg
- [ ] Countdown flower wrap + title EditableText
- [ ] slotRegistry additions
- [ ] assetPresets slot extensions
- [ ] Smoke test

## Success Criteria
- Parallax effects disabled in editMode without console errors.
- Each ceremony decor independently swappable via drop.
- Title text persists via TEXT_EDITED.

## Risk Assessment
- Splitting ceremony.decor into 3 keys breaks any prior cfg using single key — provide migration fallback (read both old and new key shapes).
- Parallax bypass may cause layout shift on toggle — accept (admin-only).
- 665-line CeremonySection has structure not fully audited; expect 1–2 surprises.

## Security Considerations
- Same baseline (plaintext, validated preset URLs).

## Next Steps
Phase 04: Gallery, Wishes, Bank, Footer.
