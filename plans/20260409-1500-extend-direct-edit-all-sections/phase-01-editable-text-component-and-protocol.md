# Phase 01 — EditableText Component & Protocol

## Context
- Parent: ../plan.md
- Depends on: existing `editModeHelpers.tsx` `EditableSlot` pattern
- Research: ../research/researcher-02-inline-text-edit.md

## Overview
- Date: 2026-04-09
- Description: Land foundation for inline text editing. New `EditableText` component, `TEXT_EDITED` postMessage, admin handler, prop propagation through `SongPhungTheme`.
- Priority: High (blocks phases 2–5)
- Implementation status: Not Started
- Review status: Pending

## Key Insights
- `contentEditable="plaintext-only"` Baseline 2025+ — no Slate.js needed (YAGNI).
- Blur-only sync prevents postMessage spam; no debounce required.
- Framer-motion `layout` prop drops caret during re-layout — must set `layout={false}` on motion parents wrapping editable text.
- Read `textContent` (never `innerHTML`) for sanitization.
- `cfg.text_samples[section][slot]` already exists in templateConfig schemas (TS + Go) — no migration.

## Requirements
- New component `EditableText.tsx` adjacent to `editModeHelpers.tsx`.
- New postMessage type `TEXT_EDITED { type, section, slot, value }`.
- `PreviewFrame.tsx` listener routes message to a new `onTextEdit` callback prop.
- `TemplateBuilderPage.tsx` updates `config.text_samples[section][slot]` immutably and re-emits `TEMPLATE_CONFIG_UPDATE`.
- All 8 section components must accept `editMode?: boolean` prop and forward to children where needed (Cover already does; copy pattern).

## Architecture

### Component diagram
```
SongPhungTheme (editMode)
 ├── CoverSection      (editMode) — already wrapped
 ├── HeroSection       (editMode) — phase 2
 ├── FamilySection     (editMode) — phase 2
 ├── CeremonySection   (editMode) — phase 3
 ├── CountdownSection  (editMode) — phase 3
 ├── GallerySection    (editMode) — phase 4
 ├── WishesSection     (editMode) — phase 4
 ├── BankSection       (editMode) — phase 4
 └── FooterSection     (editMode) — phase 4
       └── EditableText (new) / EditableSlot (existing)
```

### postMessage shapes
```ts
// preview -> admin
{ type: 'TEXT_EDITED', section: string, slot: string, value: string }
// optional dirty-state guards (phase 5)
{ type: 'START_TEXT_EDIT', section, slot }
{ type: 'END_TEXT_EDIT',   section, slot, value }
```

### Schema additions
None. Reuse existing `text_samples: Record<section, Record<slot, string>>`.

## Related Code Files
- wedding-web/components/themes/songphung-red/editModeHelpers.tsx (sibling location for new file)
- wedding-web/components/themes/songphung-red/CoverSection.tsx (reference: editMode usage)
- wedding-web/components/themes/songphung-red/SongPhungTheme.tsx (prop fan-out)
- wedding-admin/src/pages/templates/builder/PreviewFrame.tsx (postMessage listener `case`)
- wedding-admin/src/pages/templates/builder/TemplateBuilderPage.tsx (`config` state setter)
- wedding-admin/src/types/templateConfig.ts (`text_samples` field)
- wedding-web/types/templateConfig.ts (mirror)
- models/template_config.go (Go mirror — verify field tag)

## Implementation Steps
1. Create `EditableText.tsx` per research sketch (~30 LOC). Export named.
2. Append `.sp-editable-text:hover` + `:focus` rules to `EditModeStyles()` (in `editModeHelpers.tsx`).
3. Extend `editModeHelpers.tsx` with `emitTextEdited(section, slot, value)` helper sibling to `emitSlotFocused`.
4. Add `editMode?: boolean` to `SongPhungThemeProps`; default false; thread into all section children (no-ops where unused yet).
5. In `PreviewFrame.tsx`, add `case 'TEXT_EDITED'` next to existing handlers; call `props.onTextEdit?.({ section, slot, value })`.
6. In `TemplateBuilderPage.tsx`, define `handleTextEdit` that does immutable update of `config.text_samples` and triggers same dirty/save path as preset drops.
7. Add `layout={false}` audit note for framer-motion parents (no edits yet — phases 2–4 will use it).
8. Manual smoke: temporarily wrap `cover.invitation_greeting` literal with `<EditableText>` to verify round-trip; revert before commit if scope-creep.

## Todo
- [ ] EditableText.tsx created
- [ ] Hover/focus CSS added
- [ ] emitTextEdited helper exported
- [ ] SongPhungTheme threads editMode to all 8 sections
- [ ] PreviewFrame `TEXT_EDITED` case
- [ ] TemplateBuilderPage handleTextEdit + config update
- [ ] Smoke test cover greeting round-trip

## Success Criteria
- Editing a wrapped text element fires `TEXT_EDITED` exactly once on blur.
- Admin `config.text_samples` updates and preview re-renders without caret jump.
- editMode=false renders zero contentEditable nodes (no SSR mismatch).
- TypeScript compiles in both apps.

## Risk Assessment
- Caret loss inside framer-motion layouts — mitigate with `layout={false}`.
- Race: rapid blur->focus across slots could drop one update — accept (single-user admin).
- SSR: contentEditable on server-rendered span — guard with `if (!editMode) return <span>{value}</span>` (already in sketch).

## Security Considerations
- Plaintext only via `textContent` read; never `innerHTML`.
- No HTML/script injection vector since payload stored as string and rendered as text node.
- Admin-only context; public guest view continues to render plain string.

## Next Steps
Phase 02: apply `EditableSlot` + `EditableText` to Hero and Family.
