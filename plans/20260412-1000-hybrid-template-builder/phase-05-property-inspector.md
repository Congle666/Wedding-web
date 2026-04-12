# Phase 05 -- Property Inspector + Asset Library

## Context Links
- [Phase 04: Element DnD](./phase-04-element-dnd.md)
- [Current InspectorPanel](../../../wedding-admin/src/pages/templates/builder/InspectorPanel.tsx)
- [Current AssetSlotEditor](../../../wedding-admin/src/pages/templates/builder/AssetSlotEditor.tsx)
- [Current assetPresets.ts](../../../wedding-admin/src/pages/templates/builder/assetPresets.ts)

## Overview
- **Date**: 2026-04-12
- **Description**: Right panel shows properties of selected element (position, style, animation). Asset library panel lets admin browse/insert decorative assets. Extends Puck's built-in inspector with element-level controls.
- **Priority**: High
- **Implementation status**: Not Started
- **Review status**: Pending

## Key Insights
- Current v1 InspectorPanel (`InspectorPanel.tsx:23-77`) has 3 tabs: Assets, Text, Style. v2 inspector needs: Element Properties, Asset Library, Block Settings.
- Puck has a built-in inspector for component-level props. We extend it with custom field renderers for element-level editing.
- Selected element state lives in the block renderer (Phase 04) -- needs to bubble up to inspector via Puck's custom field or React context.
- Current `assetPresets.ts:37-105` has SONGPHUNG_PRESETS with categories -- reuse for element asset library.
- Current `AssetSlotEditor.tsx` handles URL input + preset grid + upload -- refactor for element-level targeting.

## Requirements
1. Element property inspector: position (x, y, width), opacity, rotation, flip, zIndex
2. Image element: src browser (asset library), opacity slider, size inputs
3. Text element: inline content edit, fontSize slider, fontFamily select, color picker, weight
4. Animation picker: type dropdown, duration slider, delay slider, trigger (load/scroll)
5. Asset library panel: categorized grid (phoenix, flower, symbol, border, background)
6. Click asset in library -> insert into selected block as new element
7. Drag asset from library -> drop onto block canvas (reuse HTML5 drag from v1)
8. Upload custom image -> add to element content

## Architecture

### Element Inspector Component

```typescript
// builder-v2/components/ElementInspector.tsx

interface Props {
  element: ElementInstance | null;
  onChange: (id: string, patch: Partial<ElementInstance>) => void;
}

function ElementInspector({ element, onChange }: Props) {
  if (!element) return <EmptyState message="Chon mot element de chinh sua" />;

  return (
    <div>
      <h4>{element.type} - {element.id}</h4>

      {/* Position */}
      <Section title="Vi tri">
        <NumberInput label="X (%)" value={element.position.x}
          onChange={v => onChange(element.id, { position: { ...element.position, x: v } })} />
        <NumberInput label="Y (%)" value={element.position.y}
          onChange={v => onChange(element.id, { position: { ...element.position, y: v } })} />
        <NumberInput label="Width (%)" value={element.position.width} min={1} max={100}
          onChange={v => onChange(element.id, { position: { ...element.position, width: v } })} />
      </Section>

      {/* Style */}
      <Section title="Style">
        <Slider label="Opacity" value={element.style.opacity} min={0} max={1} step={0.05}
          onChange={v => onChange(element.id, { style: { ...element.style, opacity: v } })} />
        <NumberInput label="Rotation (deg)" value={element.style.rotation}
          onChange={v => onChange(element.id, { style: { ...element.style, rotation: v } })} />
        <Toggle label="Flip X" value={element.style.flipX}
          onChange={v => onChange(element.id, { style: { ...element.style, flipX: v } })} />
        <NumberInput label="Z-Index" value={element.style.zIndex}
          onChange={v => onChange(element.id, { style: { ...element.style, zIndex: v } })} />
      </Section>

      {/* Type-specific */}
      {element.type === 'image' && (
        <Section title="Hinh anh">
          <ImagePicker value={element.content}
            onChange={url => onChange(element.id, { content: url })} />
        </Section>
      )}

      {element.type === 'text' && (
        <Section title="Van ban">
          <Input.TextArea value={element.content}
            onChange={e => onChange(element.id, { content: e.target.value })} />
          <NumberInput label="Font size" value={element.style.fontSize ?? 16}
            onChange={v => onChange(element.id, { style: { ...element.style, fontSize: v } })} />
          <Select label="Font" value={element.style.fontFamily}
            options={FONT_OPTIONS}
            onChange={v => onChange(element.id, { style: { ...element.style, fontFamily: v } })} />
          <ColorPicker label="Color" value={element.style.color ?? '#000'}
            onChange={v => onChange(element.id, { style: { ...element.style, color: v } })} />
        </Section>
      )}

      {/* Animation */}
      <Section title="Animation">
        <AnimationPicker element={element} onChange={onChange} />
      </Section>

      {/* Lock toggle */}
      <Toggle label="Khoa element (khong xoa/di chuyen)" value={element.locked}
        onChange={v => onChange(element.id, { locked: v })} />
    </div>
  );
}
```

### Animation Picker

```typescript
// builder-v2/components/AnimationPicker.tsx

const ANIMATION_OPTIONS: { value: AnimationType; label: string }[] = [
  { value: 'none', label: 'Khong' },
  { value: 'fadeIn', label: 'Fade In' },
  { value: 'fadeInUp', label: 'Fade In Up' },
  { value: 'slideInLeft', label: 'Slide tu trai' },
  { value: 'slideInRight', label: 'Slide tu phai' },
  { value: 'scaleIn', label: 'Phong to' },
  { value: 'parallax', label: 'Parallax' },
];

function AnimationPicker({ element, onChange }: { element: ElementInstance; onChange: ... }) {
  const anim = element.animation;
  return (
    <>
      <Select value={anim.type} options={ANIMATION_OPTIONS}
        onChange={v => onChange(element.id, { animation: { ...anim, type: v } })} />
      {anim.type !== 'none' && (
        <>
          <Slider label="Duration (ms)" value={anim.duration} min={200} max={2000} step={100} />
          <Slider label="Delay (ms)" value={anim.delay} min={0} max={2000} step={100} />
          <Select label="Trigger" value={anim.triggerOn}
            options={[{ value: 'load', label: 'Page load' }, { value: 'scroll', label: 'Scroll vao view' }]} />
          {anim.type === 'parallax' && (
            <Slider label="Parallax speed" value={anim.parallaxSpeed ?? 0.02} min={-0.05} max={0.05} step={0.005} />
          )}
        </>
      )}
    </>
  );
}
```

### Asset Library Panel

```typescript
// builder-v2/components/AssetLibraryPanel.tsx
// Reuse SONGPHUNG_PRESETS from assetPresets.ts, extend categories

interface Props {
  onInsert: (assetUrl: string, category: string) => void;  // insert as new element
  onReplace: (assetUrl: string) => void;  // replace selected element's content
}

function AssetLibraryPanel({ onInsert, onReplace }: Props) {
  const [activeCategory, setActiveCategory] = useState<PresetCategory>('phoenix');

  const categories: { key: PresetCategory; label: string }[] = [
    { key: 'phoenix', label: 'Phuong hoang' },
    { key: 'flower', label: 'Hoa' },
    { key: 'chu_hy', label: 'Chu Hy' },
    { key: 'paper_bg', label: 'Nen' },
  ];

  const filtered = SONGPHUNG_PRESETS.filter(p => p.category === activeCategory);

  return (
    <div>
      <Segmented options={categories.map(c => ({ value: c.key, label: c.label }))}
        value={activeCategory} onChange={setActiveCategory} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {filtered.map(preset => (
          <AssetThumbnail key={preset.url} preset={preset}
            onClick={() => onInsert(preset.url, preset.category)}
            draggable  // HTML5 drag to drop onto canvas
          />
        ))}
      </div>
    </div>
  );
}
```

### Integration with Puck Inspector

```typescript
// In puckConfig.ts, each component's fields include a custom element editor

fields: {
  elements: {
    type: 'custom',
    render: ({ value, onChange }) => (
      <ElementInspectorWrapper
        elements={value}
        onChange={onChange}
      />
    ),
  },
},
```

## Related Code Files
- `wedding-admin/src/pages/templates/builder/InspectorPanel.tsx:23-77` -- v1 inspector (3 tabs)
- `wedding-admin/src/pages/templates/builder/AssetSlotEditor.tsx` -- v1 asset editor
- `wedding-admin/src/pages/templates/builder/AssetLibrary.tsx` -- v1 asset grid
- `wedding-admin/src/pages/templates/builder/assetPresets.ts:37-105` -- SONGPHUNG_PRESETS
- `wedding-admin/src/pages/templates/builder/StyleEditor.tsx` -- color/font editors (reuse)
- `wedding-admin/src/pages/templates/builder/TextEditor.tsx` -- text sample editor

## Implementation Steps

1. Create `builder-v2/components/ElementInspector.tsx` with position, style, type-specific sections
2. Create `builder-v2/components/AnimationPicker.tsx` with preset dropdown + sliders
3. Create `builder-v2/components/ImagePicker.tsx` -- URL input + upload button + asset grid
4. Create `builder-v2/components/AssetLibraryPanel.tsx` -- reuse SONGPHUNG_PRESETS, add category tabs
5. Wire ElementInspector into Puck custom field renderer for `elements` prop
6. Create selected-element context/state bridge between block renderer (Phase 04) and inspector
7. Implement "replace image" flow: select image element -> browse asset library -> click to replace
8. Implement "insert element" flow: browse asset library -> click/drag -> new element in block
9. Add font family selector with Google Fonts options (Cormorant Garamond, Be Vietnam Pro, etc.)
10. Add color picker using Ant Design's ColorPicker component
11. Test: select element, change opacity, change rotation, replace image, add animation

## Todo List
- [ ] Create ElementInspector component
- [ ] Create AnimationPicker component
- [ ] Create ImagePicker component
- [ ] Create AssetLibraryPanel component
- [ ] Wire into Puck custom field
- [ ] Selected element state bridge
- [ ] Replace image flow
- [ ] Insert element flow
- [ ] Font family selector
- [ ] Color picker integration
- [ ] Test all property edits persist

## Success Criteria
- Selecting element in canvas shows its properties in right panel
- Changing position/style/animation values updates element in real-time
- Asset library shows categorized assets
- Click asset inserts new element at block center
- Image picker allows URL input and upload
- Animation picker shows preview-friendly presets

## Risk Assessment
- **State sync complexity**: Selected element state lives in block renderer (Phase 04) but inspector lives in Puck's side panel. May need React context or Puck's `dispatch` API. Mitigation: use Puck's `usePuck()` hook to access/update component props.
- **Too many inputs**: Inspector with all properties open could overwhelm admin. Mitigation: collapsible sections, show only relevant fields per element type.

## Security Considerations
- Image upload: validate file type (png, jpg, webp, svg only), max size 5MB.
- URL input: validate against allowed prefixes (same as v1 validator).
- Color picker: sanitize hex values (6-char hex only).

## Next Steps
- Phase 06: Global styles panel (colors, fonts, paper background)
