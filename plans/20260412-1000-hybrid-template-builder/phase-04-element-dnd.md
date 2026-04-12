# Phase 04 -- Element-Level DnD Within Blocks

## Context Links
- [Phase 03: Block renderers](./phase-03-block-renderers.md)
- [Research: builder libraries](./research/researcher-01-builder-libraries.md)
- [@dnd-kit deps in package.json](../../../wedding-admin/package.json) -- already `@dnd-kit/core: ^6.3.1`

## Overview
- **Date**: 2026-04-12
- **Description**: Use @dnd-kit inside each block renderer to make decorative elements draggable and resizable. Admin can reposition phoenix, resize flowers, delete optional elements, and add new elements from asset library.
- **Priority**: High
- **Implementation status**: Not Started
- **Review status**: Pending

## Key Insights
- @dnd-kit already installed (`@dnd-kit/core: ^6.3.1`, `@dnd-kit/sortable: ^10.0.0`, `@dnd-kit/utilities: ^3.2.2`).
- Elements use absolute positioning within a block container -- @dnd-kit's `useDraggable` with `transform` works naturally.
- Resize needs custom implementation: @dnd-kit doesn't provide resize handles. Use corner-drag approach with pointer events.
- Need to convert pixel drag deltas to percentage-based position updates (block container has known dimensions).
- `locked: true` elements (structural text, names) should not be draggable/deletable.
- @dnd-kit only active in builder mode (`isBuilder === true`). Public page renders static positions.

## Requirements
1. `<DraggableElement>` wrapper using `useDraggable` from @dnd-kit
2. Drag updates `element.position.{x, y}` in real-time (percentage relative to block container)
3. Resize handles on corners; drag updates `element.position.{width, height}`
4. Click-to-select: clicking element sets it as "active" for inspector panel
5. Delete button on hover for non-locked elements
6. Snap-to-grid option (8px grid, toggleable)
7. `<AddElementButton>` opens asset library modal to insert new element into block
8. Multi-select NOT required (YAGNI -- single element editing is sufficient)

## Architecture

### DraggableElement Component

```typescript
// builder-v2/components/DraggableElement.tsx

import { useDraggable } from '@dnd-kit/core';

interface Props {
  element: ElementInstance;
  containerRef: RefObject<HTMLDivElement>;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onPositionChange: (id: string, pos: Partial<ElementPosition>) => void;
  onDelete: (id: string) => void;
}

function DraggableElement({ element, containerRef, isSelected, onSelect, onPositionChange, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: element.id,
    disabled: element.locked,
  });

  // Convert px transform to % of container
  const containerRect = containerRef.current?.getBoundingClientRect();
  const deltaXPct = transform ? (transform.x / (containerRect?.width ?? 1)) * 100 : 0;
  const deltaYPct = transform ? (transform.y / (containerRect?.height ?? 1)) * 100 : 0;

  const style: CSSProperties = {
    position: 'absolute',
    left: `${element.position.x + deltaXPct}%`,
    top: `${element.position.y + deltaYPct}%`,
    width: `${element.position.width}%`,
    // Selection affordance
    outline: isSelected ? '2px solid #1890ff' : '1px dashed transparent',
    cursor: element.locked ? 'default' : 'move',
    zIndex: element.style.zIndex + (isSelected ? 1000 : 0),
  };

  return (
    <div ref={setNodeRef} style={style} {...(element.locked ? {} : { ...listeners, ...attributes })}
      onClick={(e) => { e.stopPropagation(); onSelect(element.id); }}
    >
      <ElementContent element={element} />

      {/* Resize handles (corners) */}
      {isSelected && !element.locked && (
        <ResizeHandles
          element={element}
          containerRef={containerRef}
          onResize={(newWidth, newHeight) =>
            onPositionChange(element.id, { width: newWidth, height: newHeight })
          }
        />
      )}

      {/* Delete button */}
      {isSelected && !element.locked && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(element.id); }}
          style={deleteButtonStyle}
        >x</button>
      )}
    </div>
  );
}
```

### ResizeHandles Component

```typescript
// builder-v2/components/ResizeHandles.tsx

function ResizeHandles({ element, containerRef, onResize }: {
  element: ElementInstance;
  containerRef: RefObject<HTMLDivElement>;
  onResize: (width: number, height: number) => void;
}) {
  // Use pointer events for resize (not @dnd-kit -- simpler)
  const handlePointerDown = (corner: 'se' | 'sw' | 'ne' | 'nw') => (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = element.position.width;
    const startHeight = element.position.height;
    const containerWidth = containerRef.current?.offsetWidth ?? 1;
    const containerHeight = containerRef.current?.offsetHeight ?? 1;

    const onMove = (me: PointerEvent) => {
      const dx = ((me.clientX - startX) / containerWidth) * 100;
      const dy = ((me.clientY - startY) / containerHeight) * 100;
      // SE corner: increase width/height
      if (corner === 'se') {
        onResize(Math.max(5, startWidth + dx), Math.max(0, startHeight + dy));
      }
      // Other corners: adjust position + size accordingly
    };

    const onUp = () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  return (
    <>
      {['se', 'sw', 'ne', 'nw'].map(corner => (
        <div key={corner}
          onPointerDown={handlePointerDown(corner as any)}
          style={{
            position: 'absolute',
            width: 8, height: 8,
            background: '#1890ff',
            border: '1px solid white',
            borderRadius: 2,
            cursor: `${corner}-resize`,
            ...cornerPosition(corner),
          }}
        />
      ))}
    </>
  );
}
```

### DnD Context in Block Renderer

```typescript
// Inside each block renderer (builder mode)

import { DndContext, type DragEndEvent } from '@dnd-kit/core';

function CoverBlockRenderer({ elements, isBuilder, ... }: BlockRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [localElements, setLocalElements] = useState(elements);

  // Sync from props
  useEffect(() => setLocalElements(elements), [elements]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const container = containerRef.current;
    if (!container) return;
    const { width, height } = container.getBoundingClientRect();
    const dxPct = (delta.x / width) * 100;
    const dyPct = (delta.y / height) * 100;

    setLocalElements(prev => prev.map(el =>
      el.id === active.id
        ? { ...el, position: { ...el.position, x: el.position.x + dxPct, y: el.position.y + dyPct } }
        : el
    ));
    // Propagate to Puck state via onElementsChange callback
    onElementsChange?.(localElements);
  };

  if (!isBuilder) {
    // Static rendering for public page
    return <StaticCoverBlock elements={elements} ... />;
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div ref={containerRef} style={{ position: 'relative', ... }}>
        {localElements.map(el => (
          <DraggableElement key={el.id} element={el} containerRef={containerRef}
            isSelected={selectedId === el.id} onSelect={setSelectedId}
            onPositionChange={handlePositionChange} onDelete={handleDelete}
          />
        ))}
      </div>
    </DndContext>
  );
}
```

### Add Element Flow

```
Admin clicks [+ Add Element] button on block
  -> Modal opens with asset categories (phoenix, flower, symbol, border)
  -> Admin picks an asset
  -> New ElementInstance created:
      { id: nanoid(), type: 'image', content: assetUrl,
        position: { x: 50, y: 50, width: 20, height: 0 },  // center of block
        style: DEFAULT_ELEMENT_STYLE, animation: DEFAULT_ANIMATION,
        locked: false }
  -> Appended to block's elements[]
  -> Element appears at center of block, admin drags to desired position
```

## Related Code Files
- `wedding-admin/src/pages/templates/builder/SlotDropTarget.tsx` -- v1 drop target (replaced)
- `wedding-admin/src/pages/templates/builder/AssetLibrary.tsx` -- asset presets (reused in add-element modal)
- `wedding-admin/src/pages/templates/builder/assetPresets.ts` -- SONGPHUNG_PRESETS categories (reused)

## Implementation Steps

1. Create `builder-v2/components/DraggableElement.tsx`
2. Create `builder-v2/components/ResizeHandles.tsx`
3. Create `builder-v2/components/AddElementModal.tsx` -- reuse SONGPHUNG_PRESETS data
4. Add `DndContext` wrapper inside each block renderer (builder mode branch)
5. Wire `onDragEnd` to update element positions in Puck state
6. Wire `onDelete` to remove element from block's elements[]
7. Wire `onAdd` to append new element to block's elements[]
8. Add snap-to-grid modifier: `@dnd-kit/modifiers` `createSnapModifier(8)`
9. Add keyboard accessibility: arrow keys move selected element by 1% increments
10. Test: drag phoenix to new position, resize flower, delete element, add new element

## Todo List
- [ ] Create DraggableElement component
- [ ] Create ResizeHandles component
- [ ] Create AddElementModal
- [ ] Wire DndContext in each block renderer
- [ ] Implement drag-to-reposition with % conversion
- [ ] Implement corner-resize with pointer events
- [ ] Implement element deletion
- [ ] Implement element addition from asset library
- [ ] Add snap-to-grid option
- [ ] Keyboard arrow key support
- [ ] Test all interactions

## Success Criteria
- Admin can drag decorative elements to new positions within a block
- Element position persists in BuilderConfig JSON after save
- Admin can resize elements via corner handles
- Admin can delete non-locked elements
- Admin can add new elements from asset library
- Locked elements (structural text) cannot be moved/deleted

## Risk Assessment
- **Performance**: Many elements with absolute positioning + DndContext per block could cause jank. Mitigation: limit elements per block to 50; use `React.memo` on DraggableElement.
- **Position accuracy**: Converting between px drag deltas and % positions depends on container size at drag time. Container resize during drag could cause drift. Mitigation: capture container rect at dragStart, not on every frame.
- **Z-index conflicts**: Multiple absolutely-positioned elements may overlap. Mitigation: selected element gets temporary z-index boost; element.style.zIndex for persistent ordering.

## Security Considerations
- No new security surface; all element data validated by Phase 01 schema.
- Asset URLs in AddElementModal sourced from hardcoded SONGPHUNG_PRESETS (trusted).

## Next Steps
- Phase 05: Property inspector for selected element (style, animation editing)
