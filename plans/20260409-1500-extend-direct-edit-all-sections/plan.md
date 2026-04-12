# Extend Direct In-Preview Editing to All Songphung-Red Sections

**Date:** 2026-04-09
**Owner:** Builder team
**Status:** Not Started

## Overview
Cover section ships direct manipulation (hover outline, click-to-focus, drag-drop preset, postMessage). Extend same pattern to remaining 8 sections (Hero, Family, Ceremony, Countdown, Gallery, Wishes, Bank, Footer) and add inline text editing for short titles via `contentEditable="plaintext-only"`.

## Goals
- Wrap ~14 hardcoded images across 8 sections in `<EditableSlot>`.
- Introduce `<EditableText>` sibling component + `TEXT_EDITED` postMessage round-trip.
- Toggle pointerEvents on decorative containers when editMode active.
- Apply `unoptimized` flag globally for `/uploads/` URLs.
- Keep YAGNI: single-line plaintext, blur-only sync, no Slate.js, no inline color picker.

## Non-Goals
- Multi-line text editing, undo/redo, public-view editing, in-iframe color picker.
- Refactoring section copy schema beyond `cfg.text_samples[section][slot]`.

## Phases
1. [phase-01-editable-text-component-and-protocol.md](./phase-01-editable-text-component-and-protocol.md) — Foundation: `EditableText`, `TEXT_EDITED` protocol, prop propagation. Status: Not Started
2. [phase-02-hero-family-sections.md](./phase-02-hero-family-sections.md) — Hero (3 imgs) + Family (1 flower + 2 photo fallbacks). Status: Not Started
3. [phase-03-ceremony-countdown-sections.md](./phase-03-ceremony-countdown-sections.md) — Ceremony (3 parallax decor) + Countdown (1 flower). Status: Not Started
4. [phase-04-gallery-wishes-bank-footer-sections.md](./phase-04-gallery-wishes-bank-footer-sections.md) — Gallery, Wishes (2), Bank (1), Footer (text-only). Status: Not Started
5. [phase-05-polish-and-fallbacks.md](./phase-05-polish-and-fallbacks.md) — `unoptimized` audit, edit indicator, dirty guard, smoke test. Status: Not Started

## References
- Research: research/researcher-01-section-edit-inventory.md, research/researcher-02-inline-text-edit.md
- Pattern source: wedding-web/components/themes/songphung-red/CoverSection.tsx
- Helpers: wedding-web/components/themes/songphung-red/editModeHelpers.tsx
- Admin host: wedding-admin/src/pages/templates/builder/PreviewFrame.tsx, TemplateBuilderPage.tsx

## Open Questions (for user)
- Multi-line text_samples? Recommend single-line only.
- Undo/redo for inline edits? Defer.
- Reuse cover phoenix presets for hero? Yes — same `slots` filter via assetPresets.ts.
- Family photos: prefer order-provided or cfg fallback when both exist? Currently order overrides.
