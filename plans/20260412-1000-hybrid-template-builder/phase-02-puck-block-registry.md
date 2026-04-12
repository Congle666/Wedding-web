# Phase 02 -- Install Puck + Create Block Registry

## Context Links
- [Phase 01: Schema](./phase-01-schema-redesign.md)
- [Research: builder libraries](./research/researcher-01-builder-libraries.md)
- [Current builder page](../../../wedding-admin/src/pages/templates/builder/TemplateBuilderPage.tsx)
- [Current section sidebar](../../../wedding-admin/src/pages/templates/builder/SectionSidebar.tsx)

## Overview
- **Date**: 2026-04-12
- **Description**: Install @measured/puck in wedding-admin, create builder-v2 directory, define Puck component config mapping each BlockType to a Puck component, and wire up the basic editor shell.
- **Priority**: Critical
- **Implementation status**: Not Started
- **Review status**: Pending

## Key Insights
- @dnd-kit already installed in wedding-admin (`@dnd-kit/core: ^6.3.1`, `@dnd-kit/sortable: ^10.0.0`) -- no need to install again.
- Puck provides: component registry, drag-to-add sidebar, reorder DnD, JSON state management, undo/redo, and a configurable inspector panel.
- Current builder uses 3-column layout (SectionSidebar | PreviewFrame iframe | InspectorPanel) -- Puck replaces the left sidebar (block library + reorder) and partially the right panel (block-level props).
- Puck's `<Puck>` component renders its own editor; we wrap it inside a custom layout to keep the existing header bar and metadata drawer.
- Puck config object maps component names to `{ fields, defaultProps, render }` -- each block type = one Puck component.

## Requirements
1. Install `@measured/puck` in wedding-admin
2. Create `wedding-admin/src/pages/templates/builder-v2/` directory
3. Define Puck config with 9 block components (one per section type)
4. Each Puck component receives `elements[]` and `settings` as Puck fields
5. Puck JSON state maps to/from `BuilderConfig.blocks[]`
6. Create route for builder-v2 alongside existing builder (non-destructive)
7. Block thumbnails in Puck sidebar for visual identification

## Architecture

### Puck Config Structure

```typescript
// builder-v2/puckConfig.ts
import type { Config } from '@measured/puck';

// Each block type = one Puck component
// Puck handles: add/remove/reorder blocks, JSON serialization
// @dnd-kit handles: element-level drag within each block (Phase 04)

export const puckConfig: Config = {
  components: {
    'cover-songphung': {
      label: 'Bia thiep - Song Phung',
      defaultProps: {
        elements: COVER_DEFAULT_ELEMENTS,  // from preset data
        settings: {},
      },
      fields: {
        // Puck fields for block-level settings (not element-level)
        settings: { type: 'custom', render: BlockSettingsEditor },
      },
      render: CoverBlockRenderer,
    },
    'hero-songphung': { ... },
    'family-default': { ... },
    'ceremony-default': { ... },
    'countdown-default': { ... },
    'gallery-default': { ... },
    'wishes-default': { ... },
    'bank-default': { ... },
    'footer-default': { ... },
  },
  categories: {
    'cover': { components: ['cover-songphung'], title: 'Bia' },
    'content': {
      components: ['hero-songphung', 'family-default', 'ceremony-default'],
      title: 'Noi dung',
    },
    'interactive': {
      components: ['countdown-default', 'gallery-default', 'wishes-default', 'bank-default'],
      title: 'Tuong tac',
    },
    'footer': { components: ['footer-default'], title: 'Footer' },
  },
};
```

### Puck <-> BuilderConfig Conversion

```typescript
// builder-v2/puckAdapter.ts

import type { Data } from '@measured/puck';
import type { BuilderConfig, BlockInstance } from '../../types/builderConfig';

/** Convert BuilderConfig -> Puck Data for editor initialization */
export function builderConfigToPuckData(config: BuilderConfig): Data {
  return {
    root: { props: { globalStyles: config.globalStyles } },
    content: config.blocks.map((block) => ({
      type: block.blockType,
      props: {
        id: block.id,
        elements: block.elements,
        settings: block.settings,
        visible: block.visible,
      },
    })),
  };
}

/** Convert Puck Data -> BuilderConfig for save/preview */
export function puckDataToBuilderConfig(data: Data): BuilderConfig {
  return {
    version: '2.0',
    globalStyles: data.root.props.globalStyles,
    blocks: data.content.map((item) => ({
      id: item.props.id,
      blockType: item.type as BlockType,
      visible: item.props.visible ?? true,
      elements: item.props.elements ?? [],
      settings: item.props.settings ?? {},
    })),
  };
}
```

### Component Tree
```
TemplateBuilderPageV2
  |-- Header bar (reuse from v1 builder)
  |-- <Puck config={puckConfig} data={initialData} onPublish={handleSave}>
  |     |-- Puck sidebar (block library, categorized)
  |     |-- Puck canvas
  |     |     |-- CoverBlockRenderer (Puck component)
  |     |     |-- HeroBlockRenderer
  |     |     |-- FamilyBlockRenderer
  |     |     |-- ...
  |     |-- Puck inspector (block-level props)
  |-- MetadataDrawer (reuse from v1)
```

### File Structure
```
wedding-admin/src/pages/templates/builder-v2/
  puckConfig.ts          -- Puck component registry
  puckAdapter.ts         -- BuilderConfig <-> Puck Data conversion
  TemplateBuilderPageV2.tsx  -- Main page component
  blocks/                -- Block renderer components (Phase 03)
    CoverBlockRenderer.tsx
    HeroBlockRenderer.tsx
    ...
  components/            -- Shared builder UI components
    BlockSettingsEditor.tsx
    GlobalStylesPanel.tsx
  thumbnails/            -- Block preview images for sidebar
    cover-songphung.png
    hero-songphung.png
    ...
```

## Related Code Files
- `wedding-admin/src/pages/templates/builder/TemplateBuilderPage.tsx:38-439` -- v1 builder (reference for header, metadata drawer, save logic)
- `wedding-admin/src/pages/templates/builder/SectionSidebar.tsx` -- replaced by Puck sidebar
- `wedding-admin/src/pages/templates/builder/constants.ts:21-31` -- SECTION_META labels reused
- `wedding-admin/src/pages/templates/builder/PreviewFrame.tsx` -- iframe approach replaced by direct Puck canvas rendering

## Implementation Steps

1. Install Puck:
   ```bash
   cd wedding-admin && npm install @measured/puck
   ```
2. Create directory structure: `builder-v2/`, `builder-v2/blocks/`, `builder-v2/components/`, `builder-v2/thumbnails/`
3. Create `puckConfig.ts` with 9 component entries, each with placeholder render function
4. Create `puckAdapter.ts` with `builderConfigToPuckData()` and `puckDataToBuilderConfig()`
5. Create `TemplateBuilderPageV2.tsx`:
   - Reuse header bar JSX from v1 (`TemplateBuilderPage.tsx:222-272`)
   - Reuse metadata drawer JSX from v1 (`TemplateBuilderPage.tsx:351-437`)
   - Reuse save mutation logic from v1 (`TemplateBuilderPage.tsx:162-195`)
   - Replace 3-column body with `<Puck>` component
   - Wire `onPublish` to save mutation
   - Wire `onChange` to debounced preview update
6. Add route in router config:
   - `/templates/new/builder-v2` and `/templates/edit/:id/builder-v2`
   - Keep v1 routes alive for backward compat
7. Create block thumbnails (screenshot each section from songphung-red, crop to 200x120px)
8. Test: Puck editor loads, sidebar shows 9 block types in categories, blocks can be added/removed/reordered

## Todo List
- [ ] `npm install @measured/puck` in wedding-admin
- [ ] Create builder-v2 directory structure
- [ ] Create puckConfig.ts with 9 placeholder components
- [ ] Create puckAdapter.ts conversion functions
- [ ] Create TemplateBuilderPageV2.tsx shell
- [ ] Add routes for builder-v2
- [ ] Create/capture block thumbnails
- [ ] Verify Puck editor renders and blocks add/remove/reorder

## Success Criteria
- Puck editor loads without errors
- All 9 block types visible in categorized sidebar
- Blocks can be dragged into canvas, reordered, removed
- `puckDataToBuilderConfig()` produces valid BuilderConfig v2.0 JSON
- Save mutation persists config to DB

## Risk Assessment
- **Puck version compatibility**: Pin to specific version (e.g., `^0.17.0` or latest stable). Check Puck changelog for breaking changes. Mitigation: lock version in package.json.
- **Puck CSS conflicts with Ant Design**: Both use global styles. Mitigation: scope Puck styles via CSS module or wrapper class.
- **Puck bundle size**: ~150KB gzipped. Acceptable for admin-only page. Not included in public wedding-web bundle.

## Security Considerations
- Puck is admin-only; no user-facing exposure.
- Puck serialization must not include executable code -- JSON only.
- Validate Puck output through `puckDataToBuilderConfig()` before DB write.

## Next Steps
- Phase 03: Implement block renderer components inside each Puck component
