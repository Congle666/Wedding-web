# Phase 04 — Gallery, Wishes, Bank, Footer Sections

## Context
- Parent: ../plan.md
- Depends on: phase-01
- Research: ../research/researcher-01-section-edit-inventory.md (Gallery, Wishes, Bank, Footer)

## Overview
- Date: 2026-04-09
- Description: Wrap remaining decorative images (Wishes ×2, Bank ×1) and add EditableText titles for Gallery, Wishes, Bank, Footer. Refactor Footer to read from cfg.
- Priority: Medium
- Implementation status: Not Started
- Review status: Pending

## Key Insights
- Gallery has zero hardcoded images (array-driven). Only `gallery.section_title` text + `unoptimized` flag for `/uploads/` URLs in array.
- Wishes/Bank both ignore `cfg` currently — must add reads for decor + section_title.
- Footer has no images, no cfg.assets reads. Adds: section greeting line + signature link as EditableText only.
- All four sections trivial individually; group to amortize editMode prop boilerplate.

## Requirements
- Gallery: editMode prop; EditableText for section title; unoptimized flag pass-through to image renderer.
- Wishes: editMode + cfg reads; wrap phoenix-line and flower in EditableSlot; EditableText title.
- Bank: editMode + cfg reads; wrap flower (clarify slot key — use `bank.flower` not `bank.bg`); EditableText title.
- Footer: editMode + cfg.text_samples reads; EditableText for greeting + designer signature.
- Add new slot keys: gallery.section_title, wishes.phoenix_line, wishes.flower, wishes.section_title, bank.flower, bank.section_title, footer.greeting, footer.signature.

## Architecture

### Slot keys touched
- gallery.section_title (text)
- wishes.phoenix_line, wishes.flower (image), wishes.section_title (text)
- bank.flower (image), bank.section_title (text)
- footer.greeting, footer.signature (text)

### Bank slot rename
Current registry has `bank.bg` (semantically background). Code only renders flower decor. Decision: keep `bank.bg` if future bg image planned; add new `bank.flower` for current decor; document in registry comment.

## Related Code Files
- wedding-web/components/themes/songphung-red/GallerySection.tsx
- wedding-web/components/themes/songphung-red/WishesSection.tsx:92, :114, :138
- wedding-web/components/themes/songphung-red/BankSection.tsx:262, :286
- wedding-web/components/themes/songphung-red/FooterSection.tsx:55, :67
- wedding-admin/src/pages/templates/builder/slotRegistry.ts
- wedding-admin/src/pages/templates/builder/assetPresets.ts

## Implementation Steps
1. GallerySection: add `editMode`; wrap section title with EditableText; ensure inner Image components apply `unoptimized` for `/uploads/` URLs.
2. WishesSection: add `editMode` + cfg reads for phoenix_line/flower URLs; wrap both decor divs in EditableSlot; flip pointerEvents; wrap "Sổ lưu bút" with EditableText.
3. BankSection: add `editMode` + cfg read for flower URL; wrap flower in EditableSlot; wrap "Hộp Mừng Cưới" with EditableText.
4. FooterSection: add `editMode` + cfg.text_samples reads; wrap greeting line and "Thiết kế bởi" anchor text with EditableText (anchor href stays static).
5. slotRegistry.ts: add 8 new keys listed above.
6. assetPresets.ts: ensure phoenix/flower presets list new image slot keys.
7. Smoke test all four sections in builder.

## Todo
- [ ] GallerySection editMode + title + unoptimized
- [ ] WishesSection editMode + 2 image wraps + title
- [ ] BankSection editMode + flower wrap + title
- [ ] FooterSection editMode + greeting/signature EditableText
- [ ] slotRegistry additions
- [ ] assetPresets extensions
- [ ] Smoke test all four

## Success Criteria
- Each section's title editable inline; persists.
- Wishes/Bank decor swappable via drop.
- Footer renders text from cfg.text_samples with same default fallbacks as before.

## Risk Assessment
- Footer link href hardcoded — keep separate from EditableText to prevent admin breaking link.
- Gallery title placement may not exist — add wrapper element if absent.
- Bank flower slot vs bg slot may confuse users — clarify in inspector label.

## Security Considerations
- Footer signature is a `<a>` — only the visible text is editable, `href` stays code-controlled (no XSS via URL injection).

## Next Steps
Phase 05: polish, audits, indicators.
