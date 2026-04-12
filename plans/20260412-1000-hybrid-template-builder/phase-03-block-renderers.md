# Phase 03 -- Block Renderers (Section Components as Puck Components)

## Context Links
- [Phase 01: Schema](./phase-01-schema-redesign.md)
- [Phase 02: Puck registry](./phase-02-puck-block-registry.md)
- [CoverSection.tsx](../../../wedding-web/components/themes/songphung-red/CoverSection.tsx)
- [HeroSection.tsx](../../../wedding-web/components/themes/songphung-red/HeroSection.tsx)
- [FamilySection.tsx](../../../wedding-web/components/themes/songphung-red/FamilySection.tsx)
- [Research: section decomposition](./research/researcher-02-section-decomposition.md)

## Overview
- **Date**: 2026-04-12
- **Description**: Refactor songphung-red section components into "block renderers" that read from `elements[]` array instead of hardcoded CSS positions. Each block renderer maps element IDs to visual output. Backward compat: if no elements[] provided, fall back to hardcoded layout.
- **Priority**: High
- **Implementation status**: Not Started
- **Review status**: Pending

## Key Insights
- Current sections read `cfg.assets.cover.phoenix_left` (flat config keys) -> new renderers read `elements.find(e => e.id === 'phoenix_left').content` (array lookup)
- Decorative elements (phoenix, flower, chu_hy) have hardcoded absolute positions in CSS -> extract as default ElementPosition values
- Structural elements (names, dates, RSVP form) are data-driven from WeddingData -> these become `locked: true` elements or stay as direct props
- Two rendering contexts: admin builder (Puck canvas, no iframe) and public page (DynamicThemeRenderer). Block renderers must work in both.
- Key difference from current architecture: renderers are now React components used BOTH in wedding-admin (Puck) AND wedding-web (public page). Need shared component package or duplication.

## Requirements
1. Create block renderer for each of 9 section types
2. Each renderer accepts `elements: ElementInstance[]` and `settings: BlockSettings`
3. Elements render at their `position` (absolute % within block container)
4. Decorative elements use `content` (URL) + `style` (opacity, rotation, flip)
5. Text elements use `content` (text) + `style` (fontSize, fontFamily, color)
6. Backward compat: renderers also accept legacy `cfg: TemplateConfig` prop, falling back to hardcoded layout when `elements` is empty
7. `DynamicBlockRenderer` component maps `blockType` string -> React component

## Architecture

### Block Renderer Pattern

```typescript
// shared pattern for all block renderers

interface BlockRendererProps {
  // v2.0 mode: element-based rendering
  elements: ElementInstance[];
  settings: BlockSettings;
  globalStyles: GlobalStyles;

  // Wedding data (injected by parent -- Puck in admin or DynamicThemeRenderer in public)
  weddingData?: Partial<WeddingData>;

  // Builder mode flags
  isBuilder?: boolean;   // true in Puck canvas
  onElementSelect?: (elementId: string) => void;  // for inspector focus
}
```

### Element Rendering

```typescript
// blocks/shared/ElementRenderer.tsx

function ElementRenderer({ element, isBuilder, onSelect }: {
  element: ElementInstance;
  isBuilder?: boolean;
  onSelect?: (id: string) => void;
}) {
  const style: CSSProperties = {
    position: 'absolute',
    left: `${element.position.x}%`,
    top: `${element.position.y}%`,
    width: `${element.position.width}%`,
    height: element.position.height > 0 ? `${element.position.height}%` : 'auto',
    opacity: element.style.opacity,
    zIndex: element.style.zIndex,
    transform: buildTransform(element.style),
    // In builder: show selection affordance
    ...(isBuilder ? { cursor: 'move', outline: '1px dashed transparent' } : {}),
  };

  return (
    <div style={style} onClick={() => onSelect?.(element.id)}>
      {element.type === 'image' && <img src={element.content} ... />}
      {element.type === 'text' && <span style={textStyles}>{element.content}</span>}
      {element.type === 'shape' && <div style={shapeStyles} />}
      {element.type === 'divider' && <hr style={dividerStyles} />}
    </div>
  );
}

function buildTransform(style: ElementStyle): string {
  const parts: string[] = [];
  if (style.rotation) parts.push(`rotate(${style.rotation}deg)`);
  if (style.flipX) parts.push('scaleX(-1)');
  return parts.join(' ') || 'none';
}
```

### Cover Block Renderer (example)

```typescript
// blocks/CoverBlockRenderer.tsx

export default function CoverBlockRenderer({
  elements, settings, globalStyles, weddingData, isBuilder, onElementSelect,
}: BlockRendererProps) {
  const { primary, background } = globalStyles.colors;
  const fontHeading = `'${globalStyles.fonts.heading}', serif`;

  // Find specific elements by convention ID or type
  const decorElements = elements.filter(e => e.type === 'image');
  const textElements = elements.filter(e => e.type === 'text');

  return (
    <section style={{
      position: 'relative',
      width: '100%',
      minHeight: '100vh',
      backgroundColor: primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {/* Card container */}
      <div style={{
        position: 'relative',
        backgroundColor: background,
        backgroundImage: globalStyles.paperBg ? `url(${globalStyles.paperBg})` : undefined,
        borderRadius: 16,
        width: '90%',
        maxWidth: 550,
        padding: '48px 32px',
        textAlign: 'center',
      }}>
        {/* Render all elements at their positions */}
        {elements.map(el => (
          <ElementRenderer
            key={el.id}
            element={el}
            isBuilder={isBuilder}
            onSelect={onElementSelect}
          />
        ))}

        {/* Structural content: names, date, button (from weddingData, not elements) */}
        {weddingData && (
          <>
            <h1 style={{ fontFamily: fontHeading, color: primary, fontSize: 40 }}>
              {weddingData.bride_name}
            </h1>
            <span style={{ fontFamily: fontHeading, color: primary }}>&amp;</span>
            <h1 style={{ fontFamily: fontHeading, color: primary, fontSize: 40 }}>
              {weddingData.groom_name}
            </h1>
          </>
        )}
      </div>
    </section>
  );
}
```

### Block Registry

```typescript
// blocks/blockRegistry.ts

import type { ComponentType } from 'react';
import type { BlockType } from '../../types/builderConfig';
import CoverBlockRenderer from './CoverBlockRenderer';
import HeroBlockRenderer from './HeroBlockRenderer';
// ...

export const BLOCK_REGISTRY: Record<BlockType, ComponentType<BlockRendererProps>> = {
  'cover-songphung': CoverBlockRenderer,
  'hero-songphung': HeroBlockRenderer,
  'family-default': FamilyBlockRenderer,
  'ceremony-default': CeremonyBlockRenderer,
  'countdown-default': CountdownBlockRenderer,
  'gallery-default': GalleryBlockRenderer,
  'wishes-default': WishesBlockRenderer,
  'bank-default': BankBlockRenderer,
  'footer-default': FooterBlockRenderer,
};

export function DynamicBlockRenderer({ block, ...rest }: { block: BlockInstance } & Omit<BlockRendererProps, 'elements' | 'settings'>) {
  const Component = BLOCK_REGISTRY[block.blockType];
  if (!Component) return null;
  return <Component elements={block.elements} settings={block.settings} {...rest} />;
}
```

### Position Extraction from Current Components

Default element positions extracted from hardcoded CSS:

| Section | Element | Current CSS | ElementPosition (%) |
|---------|---------|-------------|---------------------|
| Cover | phoenix_left | `bottom: -30, left: -25, width: 200` | `{x: -5, y: 75, width: 36, height: 0}` |
| Cover | phoenix_right | `top: -50, right: -25, width: 200` | `{x: 69, y: -9, width: 36, height: 0}` |
| Cover | flower_tl | `top: -10, right: 50, width: 110` | `{x: 61, y: -2, width: 20, height: 0}` |
| Cover | flower_br | `bottom: -15, left: 80, width: 130` | `{x: 15, y: 88, width: 24, height: 0}` |
| Cover | chu_hy | inline, `width: 44` | `{x: 45, y: 5, width: 8, height: 0}` |
| Hero | phoenix_left | `left: -20, top: 10%, width: 40%` | `{x: -3, y: 10, width: 40, height: 0}` |
| Hero | phoenix_right | `right: -20, top: -5%, width: 40%` | `{x: 63, y: -5, width: 40, height: 0}` |
| Family | flower | `top: -40, right: -80, width: 450` | `{x: 70, y: -5, width: 56, height: 0}` |

*Note*: Percentages approximate; exact values will be calibrated during implementation by visual comparison with current rendering.

## Related Code Files
- `wedding-web/components/themes/songphung-red/CoverSection.tsx:22-476` -- current cover; positions at lines 128-132 (phoenix_left), 155-160 (phoenix_right), 183-188 (flower_br), 209-215 (flower_tl)
- `wedding-web/components/themes/songphung-red/HeroSection.tsx:17-249` -- hero; positions at lines 62-66 (phoenix_left), 94-99 (phoenix_right)
- `wedding-web/components/themes/songphung-red/FamilySection.tsx:24-404` -- family; position at lines 49-56 (flower)
- `wedding-web/components/themes/songphung-red/editModeHelpers.tsx:64-129` -- EditableSlot pattern (informational, not reused in v2)

## Implementation Steps

1. Create `wedding-admin/src/pages/templates/builder-v2/blocks/shared/ElementRenderer.tsx`
2. Create `wedding-admin/src/pages/templates/builder-v2/blocks/shared/BlockRendererProps.ts` (shared interface)
3. Implement `CoverBlockRenderer.tsx` -- refactor from `CoverSection.tsx`, replace `cfg.assets.cover.*` reads with `elements[]` iteration
4. Implement `HeroBlockRenderer.tsx` -- refactor from `HeroSection.tsx`
5. Implement `FamilyBlockRenderer.tsx` -- refactor from `FamilySection.tsx`
6. Implement `CeremonyBlockRenderer.tsx` -- refactor from `CeremonySection.tsx`
7. Implement `CountdownBlockRenderer.tsx` -- simpler (fewer decorative elements)
8. Implement `GalleryBlockRenderer.tsx` -- gallery grid + decorative elements
9. Implement `WishesBlockRenderer.tsx` -- wish cards + decorative elements
10. Implement `BankBlockRenderer.tsx` -- bank cards layout
11. Implement `FooterBlockRenderer.tsx` -- minimal, mostly text
12. Create `blockRegistry.ts` with BLOCK_REGISTRY map + DynamicBlockRenderer
13. Wire block renderers into Puck config `render` functions (update `puckConfig.ts`)
14. Test each block renders correctly in Puck canvas with default elements

## Todo List
- [ ] Create ElementRenderer shared component
- [ ] Create BlockRendererProps interface
- [ ] Implement CoverBlockRenderer
- [ ] Implement HeroBlockRenderer
- [ ] Implement FamilyBlockRenderer
- [ ] Implement CeremonyBlockRenderer
- [ ] Implement CountdownBlockRenderer
- [ ] Implement GalleryBlockRenderer
- [ ] Implement WishesBlockRenderer
- [ ] Implement BankBlockRenderer
- [ ] Implement FooterBlockRenderer
- [ ] Create blockRegistry.ts
- [ ] Wire into puckConfig.ts
- [ ] Visual regression test vs current songphung-red

## Success Criteria
- Each block renderer produces visually identical output to current section components when given equivalent default elements
- Elements render at correct absolute positions within their block
- Block renderers work in both Puck canvas (admin) and standalone (public page)
- No regressions in existing v1 rendering path

## Risk Assessment
- **Visual fidelity**: Converting px-based CSS to %-based positions will cause slight differences. Mitigation: calibrate with side-by-side comparison; accept minor differences as blocks are now customizable.
- **Animation loss**: Current sections use framer-motion with useInView. Block renderers in Puck canvas may not trigger scroll animations correctly. Mitigation: disable animations in builder mode, keep them for public page.
- **Code duplication**: Block renderers exist in wedding-admin but also needed in wedding-web (Phase 08). Mitigation: extract to shared package, or duplicate with clear sync discipline.

## Security Considerations
- ElementRenderer renders `element.content` as `<img src=...>` -- must validate URL prefix (same allow-list as v1).
- Text elements render as textContent, not innerHTML -- XSS safe.
- No `dangerouslySetInnerHTML` anywhere in block renderers.

## Next Steps
- Phase 04: Add @dnd-kit within block renderers for element-level drag
