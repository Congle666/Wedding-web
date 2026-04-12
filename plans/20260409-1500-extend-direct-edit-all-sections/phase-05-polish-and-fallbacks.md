# Phase 05 — Polish & Fallbacks

## Context
- Parent: ../plan.md
- Depends on: phases 01–04 complete
- Research: both researcher files

## Overview
- Date: 2026-04-09
- Description: Cross-cutting cleanup. Audit `unoptimized` flag, fix lingering pointerEvents conflicts, add edit-mode visual indicator, add dirty-state guard via START/END_TEXT_EDIT, smoke test all 9 sections.
- Priority: Medium
- Implementation status: Not Started
- Review status: Pending

## Key Insights
- Next/Image domain whitelist not applied to `/uploads/` — must use `unoptimized` per occurrence.
- Visual indicator prevents admin confusion ("am I in edit mode?").
- Dirty-state guard prevents losing typed text on rapid config refresh.

## Requirements
- Audit every `<Image>` in songphung-red/ for `/uploads/` srcs and add `unoptimized={src.startsWith('/uploads/')}`.
- Add a top banner overlay in PreviewFrame when editMode active ("Edit mode — click any element").
- Implement `START_TEXT_EDIT`/`END_TEXT_EDIT` postMessages from `EditableText`; admin sets a `textEditing` ref/state and skips applying incoming TEMPLATE_CONFIG_UPDATE while true.
- Hook `EditableText` blur into the same TemplateBuilderPage save chain used by EditableSlot drops (already wired in phase 01 — verify).
- Smoke test matrix: 9 sections × (click → SLOT_FOCUSED, drop → PRESET_DROPPED where image, type+blur → TEXT_EDITED where text). Document results.

## Architecture

### Edit indicator
Pure CSS overlay rendered inside iframe by `SongPhungTheme` when editMode true:
```tsx
{editMode && <div style={{position:'fixed',top:0,left:0,right:0,zIndex:9999,background:'rgba(139,26,26,0.9)',color:'#fff',padding:'4px 12px',fontSize:12}}>Edit mode active — click any element to edit</div>}
```

### Dirty-state protocol
```ts
// preview -> admin
{ type: 'START_TEXT_EDIT', section, slot } // on focus
{ type: 'END_TEXT_EDIT',   section, slot } // on blur (after TEXT_EDITED)
```
Admin keeps `textEditingRef.current = true` between START and END; skips re-rendering preview HTML during that window (or uses `key` stability).

## Related Code Files
- wedding-web/components/themes/songphung-red/*.tsx (full audit)
- wedding-web/components/themes/songphung-red/SongPhungTheme.tsx (banner)
- wedding-web/components/themes/songphung-red/EditableText.tsx (START/END emit)
- wedding-admin/src/pages/templates/builder/PreviewFrame.tsx (handle START/END)
- wedding-admin/src/pages/templates/builder/TemplateBuilderPage.tsx (gate config push)

## Implementation Steps
1. Grep all `<Image` occurrences in songphung-red/; add `unoptimized={src.startsWith('/uploads/')}` where missing.
2. Re-grep `pointerEvents:` for any decor div not yet conditional; convert to `editMode ? 'auto' : 'none'`.
3. Add edit-mode banner inside SongPhungTheme top render block.
4. EditableText: emit START_TEXT_EDIT on focus, END_TEXT_EDIT on blur (after TEXT_EDITED).
5. PreviewFrame: handle START/END to set `textEditingRef.current`; gate any auto-refresh.
6. TemplateBuilderPage: when textEditing true, defer pushing new config back to iframe until END.
7. Smoke test matrix doc — log result per section.

## Todo
- [ ] Image unoptimized audit complete
- [ ] pointerEvents audit complete
- [ ] Edit-mode banner rendered
- [ ] START/END_TEXT_EDIT emitted + handled
- [ ] Config push gated during edit
- [ ] Smoke matrix executed (9 sections)

## Success Criteria
- No `/uploads/` Image renders without `unoptimized`.
- No decor div blocks click while editMode true.
- Banner visible in builder iframe; absent in public view.
- Typing is never interrupted by parent re-pushing config.
- All 9 sections pass smoke matrix.

## Risk Assessment
- Gating config push could mask legitimate updates — release on END within 100ms.
- Banner z-index may collide with theme overlays — pin to 9999 + isolate.

## Security Considerations
- No new attack surface; START/END carry only section/slot strings.

## Next Steps
- Hand off to QA. Capture follow-up tickets for: multi-line text_samples, undo/redo, public-view editing toggle.
