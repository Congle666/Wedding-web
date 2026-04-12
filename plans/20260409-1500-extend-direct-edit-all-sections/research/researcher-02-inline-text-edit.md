# Inline Text Editing Research: Direct Manipulation in songphung-red Builder

## Component Design: EditableText

**TypeScript signature:**
```typescript
export interface EditableTextProps {
  section: string;      // e.g. 'cover', 'family', 'wishes'
  slot: string;         // e.g. 'invitation_greeting', 'section_title'
  value: string;        // current text_samples value
  variant?: 'inline' | 'absolute';
  editMode: boolean;
  onChange?: (newValue: string) => void;  // optional local onBlur
  placeholder?: string;
}
```

**Behavior:**
- When `editMode=false`: renders plain text, zero overhead
- When `editMode=true`: wraps in `<span contentEditable="plaintext-only">` (native Baseline support as of March 2025)
- Double-click → focus + select all text (native behavior)
- Single click → emit `SLOT_FOCUSED` postMessage (existing pattern)
- On blur → post `TEXT_EDITED` message to admin parent
- Dashed outline on hover (copy EditableSlot style)

## Implementation Sketch (~30 lines)

```typescript
export function EditableText({
  section,
  slot,
  value,
  editMode,
  variant = 'inline',
  onChange,
}: EditableTextProps & { editMode: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [isDirty, setIsDirty] = useState(false);

  if (!editMode) return <span>{value}</span>;

  const handleInput = (e: React.FormEvent<HTMLSpanElement>) => {
    const newValue = (e.currentTarget.textContent || '').trim();
    setIsDirty(true);
    onChange?.(newValue);
  };

  const handleBlur = (e: React.FocusEvent<HTMLSpanElement>) => {
    const newValue = (e.currentTarget.textContent || '').trim();
    if (isDirty && newValue !== value) {
      window.parent?.postMessage(
        { type: 'TEXT_EDITED', section, slot, value: newValue },
        '*'
      );
      setIsDirty(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    emitSlotFocused(section, slot);
  };

  return (
    <span
      ref={ref}
      contentEditable="plaintext-only"
      suppressContentEditableWarning
      onInput={handleInput}
      onBlur={handleBlur}
      onClick={handleClick}
      className="sp-editable-text"
      data-edit-section={section}
      data-edit-slot={slot}
      style={{
        outline: '1px dashed transparent',
        outlineOffset: 2,
        cursor: 'text',
        whiteSpace: 'pre-wrap',
      }}
    >
      {value}
    </span>
  );
}
```

**Add to global styles (EditModeStyles):**
```css
.sp-editable-text:hover {
  outline-color: rgba(139, 26, 26, 0.6) !important;
}
.sp-editable-text:focus {
  outline: 2px solid #8B1A1A !important;
  background-color: rgba(139, 26, 26, 0.08);
}
```

## postMessage Protocol Additions

**New message type from preview → admin:**
```typescript
{
  type: 'TEXT_EDITED',
  section: string,      // e.g. 'cover'
  slot: string,         // e.g. 'invitation_greeting'
  value: string         // sanitized plaintext
}
```

**Optional tracking messages (future):**
```typescript
// Admin can track dirty state, show unsaved indicator
{ type: 'START_TEXT_EDIT', section, slot }
{ type: 'END_TEXT_EDIT', section, slot, value }
```

**Admin handler (PreviewFrame.tsx):**
```typescript
case 'TEXT_EDITED': {
  if (typeof data.section === 'string' && typeof data.slot === 'string') {
    // Apply to config: config.text_samples[section][slot] = data.value
    onTextEdit?.(data);  // new callback
  }
  break;
}
```

## Sanitization Rules

**Requirement: plaintext-only, no HTML/scripts**

1. **contentEditable="plaintext-only"** enforces no markup injection (native, Baseline 2025+)
2. **Fallback for older browsers:** if user somehow pastes markup:
   - Strip via `textContent` read (not `innerHTML`)
   - Trim whitespace: `.trim()`
   - Reject if null/empty, keep previous value
3. **No server sanitization needed** if admin/builder only; but apply if values exposed to public (wedding guest view)
4. **Prevent scripts:** No `eval()`, `dangerouslySetInnerHTML`, `innerHTML` reads from contentEditable

## Caret & Enter Handling

**Pitfalls:**
- `contentEditable="plaintext-only"` blocks Enter insertion; user can't create newlines ✓ (desired for single-line text_samples)
- Caret loss after state update: use `suppressContentEditableWarning` + ref-based onInput to avoid re-render flicker
- Paste HTML: `plaintext-only` strips tags automatically ✓

**Fixes:**
- Use `onInput` (not `onChange`) for real-time updates
- Call `e.persist()` if accessing event in setTimeout (React event pooling)
- Prevent `blur()` from losing selection: don't auto-focus another field on blur

**Multi-line fields (future):**
If needed, use `contentEditable="true"` + register Enter key handler:
```typescript
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    e.currentTarget.blur();  // finish editing
  }
};
```

## Recommended Sections for EditableText

**Priority 1 (immediate impact):**
- `cover.invitation_greeting` — main greeting text
- `hero.subtitle` — hero section subtitle
- `family.section_title` — "Thành hôn"
- `ceremony.section_title` — "Lễ cưới"

**Priority 2 (support):**
- `gallery.section_title` — "Khoảnh khắc"
- `wishes.section_title` — "Sổ lưu bút"
- `bank.section_title` — "Hộp mừng cưới"

**Not recommended:**
- `hero.groom_name`, `hero.bride_name` — managed by form inputs in admin panel
- Gallery image captions — not in text_samples (separate model)

## Color Picker Recommendation

**Decision: Open in admin panel, NOT in-iframe**

**Rationale:**
- Inline color picker in preview iframe (contentEditable + color picker overlay) creates UX friction
- Admin already has inspector panel with form controls
- Keep preview for copy/layout; keep admin panel for styling
- Simplifies postMessage protocol (no color-picker state sync needed)

**Implementation:**
1. Admin clicks colored element in preview
2. Preview emits `SLOT_FOCUSED` (existing)
3. Admin inspector auto-opens color picker for that slot's color property
4. User adjusts color via panel input
5. Preview re-renders via `TEMPLATE_CONFIG_UPDATE` (existing flow)

## Risks & Mitigations

**Risk: contentEditable + framer-motion conflicts**

If songphung-red uses framer-motion animations on EditableText parent:
- Framer-motion re-renders during edit can lose caret position/focus
- **Mitigation:** Wrap EditableText in `motion.div` with `layout={false}` to skip layout animation
- Or use `key={section + slot}` to preserve identity
- Test: enter edit mode, type, verify caret doesn't jump

**Risk: Cross-browser behavior (older Safari)**

`contentEditable="plaintext-only"` supported in Safari 15.4+ (2022). Earlier versions need fallback:
- Detect feature: `document.designMode === 'on'` test
- Fallback: Use `<input type="text">` overlay on blur, hide contentEditable

**Risk: Paste handling**

Users may paste rich text. `plaintext-only` strips it, but:
- Test paste from Word, Google Docs (complex formatting)
- Monitor console for warnings if browser doesn't fully support `plaintext-only`

## UX Pattern Comparison

**Builder affordances observed:**
- **Webflow:** Form-based editing (inputs in right panel, not inline) — explicit, discoverable
- **Framer:** Canvas-centric with inline text edit on double-click — fast, reduces panel switching
- **Notion:** Click = inline edit, blur = save — minimal affordance (no outline)

**Recommendation for songphung-red:**
- Hover outline (copy existing EditableSlot) — signals "clickable"
- Single click → focus inspector (existing `SLOT_FOCUSED`)
- Double click → inline edit (native contentEditable behavior)
- Blur → postMessage update (immediate sync)

## Implementation Checklist

- [ ] Create `EditableText.tsx` component in `components/themes/songphung-red/`
- [ ] Update `EditModeStyles()` to include `.sp-editable-text:hover` + `:focus`
- [ ] Add `TEXT_EDITED` handler in PreviewFrame.tsx
- [ ] Wrap text_samples in each section (Cover, Hero, Family, etc.) with `<EditableText>`
- [ ] Test caret position, paste behavior, multiple edits in sequence
- [ ] Test framer-motion animations don't interrupt inline edit
- [ ] Add `TEXT_EDITED` case to TemplateBuilderPage.tsx to apply to config

---

## Unresolved Questions

1. Should EditableText support multi-line input (shift+Enter for linebreak) or stay single-line?
   - Current: `plaintext-only` blocks Enter entirely
   - Implication: wedding names/addresses stay in TextEditor form, only taglines/titles inline
2. How to handle "undo" (Ctrl+Z) — contentEditable native undo or custom state tracking?
3. Should TEXT_EDITED debounce (e.g., 500ms after last keystroke) or fire on blur only?
   - Current sketch: blur only (simpler, less postMessage spam)
4. For bank.section_title and other edits — should admin be able to edit while wedding is live/published?
   - May need `editMode` check in wedding-web public view
