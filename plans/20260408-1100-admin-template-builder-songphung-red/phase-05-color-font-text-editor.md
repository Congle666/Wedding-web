# Phase 05 — Color / Font / Text / Section Editor

## Context
- Parent: [plan.md](./plan.md)
- Depends on: [phase-03](./phase-03-builder-shell-and-preview.md), [phase-04](./phase-04-image-slot-editor.md)
- Related: antd@5.22 ColorPicker, `@dnd-kit/sortable`

## Overview
- **Date:** 2026-04-08
- **Description:** Inspector panel editors for 4 colors, 2 fonts, per-section text samples. Sidebar editor for section visibility toggle + drag reorder.
- **Priority:** High
- **Implementation Status:** Not Started
- **Review Status:** Pending

## Key Insights
- `antd@5.22` ships `ColorPicker` (since 5.5). No extra dep.
- Google Fonts hardcoded list (YAGNI — no API).
- Text samples = optional overrides; empty string = use default.
- Section reorder uses `@dnd-kit/sortable` already installed Phase 03.
- Reorder persists via updating `cfg.sections[key].order` — normalize to 0..N-1 after drop.

## Requirements
1. `ColorEditor`: 4 ColorPickers (primary, background, text, accent) w/ VI labels.
2. `FontEditor`: 2 Selects (heading, body) from hardcoded list. On change, dynamically load font link tag in admin + push to preview.
3. `TextEditor`: per-section collapsible form, inputs for `text_samples[section][key]`.
4. `SectionSidebar`: sortable list, visibility switch per item, drag handle.
5. All changes update builder state → debounced postMessage.

## Architecture

### Font list (hardcoded)
```ts
// wedding-admin/src/pages/templates/builder/fonts.ts
export const HEADING_FONTS = [
  'Cormorant Garamond','Playfair Display','Great Vibes','Cinzel','EB Garamond','Libre Caslon Display','Cormorant SC','Lora'
];
export const BODY_FONTS = [
  'Be Vietnam Pro','Inter','Roboto','Noto Serif','Merriweather','Nunito','Open Sans'
];
export const GOOGLE_FONTS_CSS = (heading: string, body: string) =>
  `https://fonts.googleapis.com/css2?family=${encodeURIComponent(heading).replace(/%20/g,'+')}:wght@400;600;700&family=${encodeURIComponent(body).replace(/%20/g,'+')}:wght@300;400;500;600;700&display=swap`;
```
Both preview page and admin must ensure selected fonts are loaded.

### ColorEditor
```tsx
<ColorPicker
  value={cfg.colors.primary}
  onChange={(c) => updateColor('primary', c.toHexString())}
  showText format="hex"
/>
```
4 instances in labeled grid.

### TextEditor
```tsx
SLOT_REGISTRY.filter(isTextSlot).map(... => (
  <Form.Item label={def.label}>
    <Input value={cfg.text_samples[section]?.[key] ?? ''} onChange={...} placeholder={defaultText} />
  </Form.Item>
));
```
Separate `TEXT_REGISTRY` or extend slot registry w/ type discriminator.

### SectionSidebar (sortable)
```tsx
<DndContext onDragEnd={onReorder}>
  <SortableContext items={orderedKeys} strategy={verticalListSortingStrategy}>
    {orderedKeys.map(key => (
      <SortableSectionItem key={key}>
        <DragHandle />
        <span>{SECTION_LABELS[key]}</span>
        <Switch checked={cfg.sections[key].visible} onChange={...} />
      </SortableSectionItem>
    ))}
  </SortableContext>
</DndContext>
```
After drag end: recompute `order` 0..N-1, update state.

### Text registry
```ts
// wedding-admin/src/pages/templates/builder/textRegistry.ts
export const TEXT_REGISTRY = [
  { section:'cover',  key:'button_label',        label:'Nút mở thiệp',         default:'Mở thiệp' },
  { section:'cover',  key:'invitation_greeting', label:'Lời mời',              default:'Thân Mời' },
  { section:'cover',  key:'invitation_subtext',  label:'Phụ đề lời mời',       default:'đến dự buổi tiệc chung vui cùng gia đình' },
  { section:'hero',   key:'subtitle',            label:'Phụ đề Hero',          default:'Chúng tôi sẽ kết hôn' },
  { section:'family', key:'section_title',       label:'Tiêu đề Gia Đình',     default:'Gia Đình' },
  { section:'ceremony',key:'section_title',      label:'Tiêu đề Lễ Cưới',      default:'Lễ Thành Hôn' },
  { section:'gallery',key:'section_title',       label:'Tiêu đề Album',        default:'Hình ảnh' },
  { section:'wishes', key:'section_title',       label:'Tiêu đề Lời Chúc',     default:'Lời Chúc' },
  { section:'bank',   key:'section_title',       label:'Tiêu đề Mừng Cưới',    default:'Quà Tặng' },
];
```

## Related Code Files
- `wedding-admin/src/pages/templates/builder/InspectorPanel.tsx` — host
- `wedding-admin/src/pages/templates/builder/SectionSidebar.tsx`
- antd docs: ColorPicker 5.5+

## Implementation Steps
1. Create `fonts.ts`, `textRegistry.ts`, `sectionLabels.ts`.
2. Build `ColorEditor.tsx` (4 ColorPickers).
3. Build `FontEditor.tsx` — on change, inject/update `<link>` in admin document head via `useEffect` w/ `GOOGLE_FONTS_CSS`.
4. Build `TextEditor.tsx` — form driven by TEXT_REGISTRY.
5. Build `SortableSectionItem.tsx` + `SectionSidebar.tsx`.
6. Wire reorder handler to normalize order field.
7. Wire visibility toggle to flip `cfg.sections[key].visible`.
8. Ensure all updates bubble to builder state w/ immer-like immutable update helper.
9. Ensure preview page also loads chosen fonts on message receive (patch preview to update font link when cfg.fonts changes).

## Todo
- [ ] fonts.ts w/ hardcoded lists
- [ ] textRegistry.ts
- [ ] ColorEditor
- [ ] FontEditor w/ dynamic link injection
- [ ] TextEditor
- [ ] SectionSidebar sortable + visibility switch
- [ ] Reorder → normalize order integers
- [ ] Preview page dynamic font link update

## Success Criteria
- Change primary color → CSS var updates in iframe instantly.
- Switch heading font to 'Great Vibes' → iframe titles render in new font (after font link load).
- Edit "Mở thiệp" text → cover button updates.
- Drag Ceremony above Family → iframe reflects new order.
- Toggle Wishes off → section disappears from iframe.

## Risk Assessment
- **Font load latency:** first render flashes default. Mitigate: preload popular fonts in preview layout.
- **Order normalization bug:** drag interactions → inconsistent ints. Mitigate: always resort + reassign indices on drop.
- **antd ColorPicker value format:** must always store hex string, not Color instance.

## Security Considerations
- Text sample inputs must not allow raw HTML — strip tags on save (backend Phase 01 validator) or render as text only (Phase 02).
- Font family names from hardcoded list only — prevent CSS injection via arbitrary string.

## Next Steps
→ Phase 06: save, duplicate, thumbnail.
