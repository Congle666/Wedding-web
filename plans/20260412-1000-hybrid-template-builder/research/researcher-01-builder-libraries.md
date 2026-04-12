# React Hybrid Section-Block Builder Research
**Date:** 2025-02-12 | **Project:** Vietnamese Wedding Template Builder

---

## 1. Library Comparison Table

| Feature | Puck | Craft.js | @dnd-kit Custom | GrapesJS |
|---------|------|----------|-----------------|----------|
| **Block-level DnD** | ✅ Excellent | ✅ Good | ✅ Full control | ✅ Yes |
| **Element-level DnD** (within blocks) | ⚠️ Limited | ❌ Not ideal | ✅ Complete | ❌ HTML-focused |
| **Custom React components** | ✅ Native | ✅ Native | ✅ Native | ⚠️ Wrapper overhead |
| **Nested component support** | ✅ Yes | ⚠️ Limited (issue #507) | ✅ Yes | ⚠️ Experimental |
| **JSON serialization** | ✅ Native | ✅ Yes | ✅ Custom needed | ✅ Yes |
| **Bundle size** | ~150KB (gzipped) | ~200KB | Minimal (~50KB @dnd-kit) | ~300KB |
| **Production readiness** | ✅ Stable | ⚠️ Slower updates | ✅ Yes | ✅ Yes |
| **MIT/Open-source** | ✅ MIT | ✅ MIT | ✅ MIT | ✅ AGPL/Commercial |
| **Vietnamese wedding fit** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |

---

## 2. Recommendation: **Puck + Custom @dnd-kit Layer**

### Why Puck Primary
- **Block-level DnD ready**: Perfect for section reordering, visibility toggling
- **Component config system**: Integrates songphung-red sections naturally
- **JSON export**: Matches your DB schema expectations
- **Low maintenance**: MIT-licensed, active updates through 2025
- **Element inspector**: Can be extended for per-element property editing

### Why Add @dnd-kit for Element-Level
Puck doesn't support element-level DnD within blocks (e.g., dragging phoenix image to different corner). Instead of custom framework:
1. Keep Puck for section/block orchestration
2. Wrap each section's **internal layout** with @dnd-kit for element repositioning
3. Puck's inspector panel → feed to @dnd-kit config → update element position

**Cost:** ~200 lines of glue code per section type. **Benefit:** Hybrid architecture respects both tools' strengths.

### Why NOT Craft.js
- Issue #507 shows nested component support is incomplete
- Limited element-level customization without state complexity
- Slower GitHub activity vs Puck

### Why NOT Pure @dnd-kit
- Pure rebuild means inspector, previews, serialization, reordering all custom
- ~3-4 weeks dev instead of 1-2 with Puck base
- YAGNI principle violated

### Why NOT GrapesJS
- HTML-first mindset conflicts with React component rendering
- Requires wrapping songphung-red sections as HTML, not JSX
- License complexity (AGPL/commercial)

---

## 3. Element-Level Config Schema Design

Extend `TemplateConfig` with section-specific element positions:

```typescript
// In types/templateConfig.ts

export interface ElementPosition {
  x: number;           // % or px
  y: number;
  width: number;       // % or px
  height: number;
  zIndex?: number;
  rotation?: number;
}

export interface ElementStyle {
  opacity?: number;    // 0-1
  filter?: string;     // blur, brightness, etc.
  transform?: string;
}

export interface ElementAnimation {
  type?: 'fade-in' | 'slide-in' | 'parallax' | 'zoom' | 'rotate';
  duration?: number;   // ms
  delay?: number;
  easing?: 'ease-in' | 'ease-out' | 'ease-in-out';
}

export interface LayoutElement {
  id: string;                    // unique within section
  type: 'image' | 'text' | 'shape';
  assetKey?: string;             // refs CoverAssets.phoenix_left
  content?: string;              // for text elements
  position: ElementPosition;
  style: ElementStyle;
  animation?: ElementAnimation;
}

export interface CoverLayout {
  elements: LayoutElement[];     // [phoenix_left, phoenix_right, flower_tl, ...]
  backgroundColor?: string;
}

// Then in TemplateConfig:
export interface TemplateConfig {
  // ... existing fields ...
  assets: TemplateAssets;
  
  // NEW: layout overrides per section
  layouts?: {
    cover?: CoverLayout;
    hero?: HeroLayout;
    family?: FamilyLayout;
    // ...
  };
}
```

**Default behavior:** If no layout override exists, render section with hardcoded positions (backwards compatible).

---

## 4. Animation/Effect System Design

```typescript
// types/animations.ts

export type AnimationType = 
  | 'fade-in'
  | 'slide-in-left'
  | 'slide-in-right'
  | 'slide-in-up'
  | 'slide-in-down'
  | 'parallax'
  | 'zoom-in'
  | 'rotate';

export interface AnimationConfig {
  enabled: boolean;
  type: AnimationType;
  duration: number;      // ms, 300-2000
  delay: number;         // ms, 0-1000
  easing: 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
  parallaxIntensity?: number;  // 0-1 for parallax only
  triggerOn?: 'page-load' | 'scroll-into-view';
}

// Inspector component picks from presets:
export const ANIMATION_PRESETS = {
  'fade-in': { duration: 600, delay: 0, easing: 'ease-in-out' },
  'slide-in-up': { duration: 800, delay: 200, easing: 'ease-out' },
  'parallax': { duration: 0, parallaxIntensity: 0.5, triggerOn: 'scroll' },
};
```

Rationale: Vietnamese wedding sites often use parallax + fade-in for visual impact. Keep presets simple, allow tweaking in inspector.

---

## 5. Rendering Config → Wedding Page

### Current Flow (songphung-red only)
```
DB: templates.customizable_fields (JSON) 
  → wedding-web: /templates/SongphungRed.tsx
  → Hard-coded section ordering, positions, colors
```

### New Flow (multi-template)
```
DB: templates.customizable_fields (TemplateConfig + LayoutConfig)
  → wedding-web: /templates/[templateId].tsx
  → Dynamic renderer reads config
  → Renders sections in order
  → Applies positions, animations from layout config
```

### Implementation Pattern

```typescript
// wedding-web: components/TemplateRenderer.tsx

function TemplateRenderer({ config, data }: Props) {
  const sections = getSectionsInOrder(config);
  
  return (
    <>
      {sections.map(sectionKey => {
        const SectionComponent = SECTION_REGISTRY[sectionKey];
        const layout = config.layouts?.[sectionKey];
        
        return (
          <SectionComponent
            key={sectionKey}
            config={config}
            layout={layout}      // NEW: element positions, animations
            weddingData={data}
          />
        );
      })}
    </>
  );
}

// Inside section component (e.g., CoverSection)
function CoverSection({ config, layout }: Props) {
  return (
    <div className="section-cover">
      {layout?.elements.map(el => (
        <div
          key={el.id}
          style={{
            position: 'absolute',
            left: `${el.position.x}%`,
            top: `${el.position.y}%`,
            opacity: el.style?.opacity ?? 1,
            animation: el.animation ? generateCSSAnimation(el.animation) : undefined,
          }}
        >
          {el.type === 'image' && (
            <img src={resolveAsset(config.assets, el.assetKey)} />
          )}
          {el.type === 'text' && <p>{el.content}</p>}
        </div>
      ))}
    </div>
  );
}
```

---

## 6. Reusable Code from Current Codebase

### ✅ Can Reuse
- **assetPresets.ts** → SONGPHUNG_PRESETS, getPresetsForSlot() — adapt for element dragging
- **templateConfig.ts** → Extend with layouts without breaking existing DB records
- **InspectorPanel.tsx** → Base for per-element property editor (color, opacity, position inputs)
- **SlotRegistry pattern** → Adapt to ElementRegistry for element type definitions
- **PreviewFrame.tsx** → Keep iframe, inject new layout config into preview

### ❌ Needs Replacement
- **SlotDropTarget.tsx** → Build @dnd-kit-based ElementDropZone
- **SectionSidebar.tsx** → Extend to show element types, not just asset library
- **TemplateBuilderPage.tsx** → Wire in Puck + @dnd-kit hybrid (1-2 days work)

### 📦 Dependencies to Add
```json
{
  "@dnd-kit/core": "^6.1.0",
  "@dnd-kit/utilities": "^3.2.0",
  "@dnd-kit/sortable": "^7.0.0",
  "puck": "^0.21.0"
}
```

---

## 7. Architecture Diagram

```
Admin UI (TemplateBuilderPage)
│
├─ Puck Editor (section DnD)
│  ├─ Reorder sections
│  ├─ Toggle visibility
│  └─ Open inspector → ElementPropertyPanel
│
└─ ElementPropertyPanel (@dnd-kit + custom)
   ├─ Show current element list (drag to reposition)
   ├─ Inspector inputs (position, color, animation)
   └─ Asset library (pick phoenix variant, etc.)

Config Output → DB
  {
    version: '1.0',
    sections: { cover: {...}, hero: {...}, ... },
    layouts: {
      cover: {
        elements: [
          { id: 'phoenix-left', type: 'image', position: {x:5, y:10}, ... }
        ]
      }
    }
  }

Public View (wedding-web)
  TemplateRenderer reads config → renders dynamic sections
```

---

## 8. Unresolved Questions

1. **SVG vs raster for decorative elements?** Currently using .webp (phoenixes, flowers). Should builder support uploading custom SVG patterns?
2. **CSS Grid vs absolute positioning for layouts?** Current schema uses %, which works for both. Grid would be more responsive but harder to visually edit.
3. **Multi-section animations in sync?** Can we chain animations across sections (e.g., phoenix fade-in while cover text slides)?
4. **Undo/redo in Puck + @dnd-kit?** Puck has built-in undo; need to ensure @dnd-kit element moves integrate properly.
5. **Mobile responsiveness in builder?** Show breakpoints (mobile/tablet/desktop) in preview, or assume responsive CSS handles it?

---

## References

- [Puck GitHub](https://github.com/puckeditor/puck)
- [Puck Docs](https://puckeditor.com/docs)
- [Craft.js GitHub](https://github.com/prevwong/craft.js/)
- [Craft.js Issue #507 (nested components)](https://github.com/prevwong/craft.js/issues/507)
- [@dnd-kit Documentation](https://docs.dnd-kit.com/)
