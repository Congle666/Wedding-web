# Phase 07 -- Preset System + "Load songphung-red"

## Context Links
- [Phase 01: Schema](./phase-01-schema-redesign.md)
- [Phase 03: Block renderers](./phase-03-block-renderers.md)
- [Current default config](../../../wedding-admin/src/types/templateConfig.ts)
- [Section decomposition](./research/researcher-02-section-decomposition.md)

## Overview
- **Date**: 2026-04-12
- **Description**: Define preset system. songphung-red = 1 complete preset that populates all 9 blocks with default element positions extracted from current hardcoded CSS. Support blank canvas start and per-block preset insertion.
- **Priority**: Medium
- **Implementation status**: Not Started
- **Review status**: Pending

## Key Insights
- Current `DEFAULT_SONGPHUNG_RED_CONFIG` (`templateConfig.ts:97-156`) has assets/colors/fonts/text -- must be transformed into `BuilderConfig` v2.0 with 9 BlockInstances + elements.
- Element positions extracted by analyzing current CSS in CoverSection, HeroSection, etc. (see Phase 03 position table).
- Preset is a static JSON file (or TypeScript const) -- NOT a DB entity. Simple, versionable, no CRUD needed.
- "Blank canvas" = empty `blocks[]` array; admin adds blocks from Puck sidebar.
- "Load preset" = populate `blocks[]` with preset's blocks. Can also "add single block from preset."

## Requirements
1. `SONGPHUNG_RED_PRESET`: complete BuilderConfig with 9 blocks + all elements at default positions
2. Builder start screen: "Blank canvas" or "Use songphung-red preset" buttons
3. Per-block preset: Puck sidebar shows blocks with preset data -- adding a block auto-fills its default elements
4. `migrateV1ToV2()` implementation: convert legacy TemplateConfig -> BuilderConfig using songphung-red preset data
5. Future extensibility: other presets (minimal-white, etc.) follow same pattern

## Architecture

### Preset Data Structure

```typescript
// builder-v2/presets/songphungRed.ts

import type { BuilderConfig, BlockInstance, ElementInstance } from '../../../types/builderConfig';

const COVER_ELEMENTS: ElementInstance[] = [
  {
    id: 'phoenix_left', type: 'image',
    position: { x: -5, y: 75, width: 36, height: 0 },
    style: { opacity: 1, zIndex: -1, rotation: 0, flipX: false },
    animation: { type: 'none', duration: 0, delay: 0, triggerOn: 'load' },
    content: '/themes/songphung-red/phoenix.webp',
    locked: false, category: 'phoenix',
  },
  {
    id: 'phoenix_right', type: 'image',
    position: { x: 69, y: -9, width: 36, height: 0 },
    style: { opacity: 1, zIndex: -1, rotation: 0, flipX: true },
    animation: { type: 'none', duration: 0, delay: 0, triggerOn: 'load' },
    content: '/themes/songphung-red/phoenix2.webp',
    locked: false, category: 'phoenix',
  },
  {
    id: 'flower_tl', type: 'image',
    position: { x: 61, y: -2, width: 20, height: 0 },
    style: { opacity: 0.5, zIndex: -1, rotation: 180, flipX: false },
    animation: { type: 'none', duration: 0, delay: 0, triggerOn: 'load' },
    content: '/themes/songphung-red/flower.webp',
    locked: false, category: 'flower',
  },
  {
    id: 'flower_br', type: 'image',
    position: { x: 15, y: 88, width: 24, height: 0 },
    style: { opacity: 0.7, zIndex: -1, rotation: 0, flipX: false },
    animation: { type: 'none', duration: 0, delay: 0, triggerOn: 'load' },
    content: '/themes/songphung-red/flower.webp',
    locked: false, category: 'flower',
  },
  {
    id: 'chu_hy', type: 'image',
    position: { x: 45, y: 5, width: 8, height: 0 },
    style: { opacity: 1, zIndex: 1, rotation: 0, flipX: false },
    animation: { type: 'scaleIn', duration: 600, delay: 300, triggerOn: 'load' },
    content: '/themes/songphung-red/chu-hy.webp',
    locked: false, category: 'chu_hy',
  },
  // Text elements for cover
  {
    id: 'invitation_greeting', type: 'text',
    position: { x: 10, y: 70, width: 80, height: 0 },
    style: { opacity: 1, zIndex: 2, rotation: 0, flipX: false, fontSize: 17, fontStyle: 'italic' },
    animation: { type: 'fadeIn', duration: 600, delay: 1200, triggerOn: 'load' },
    content: 'Tran trong kinh moi',
    locked: true,
  },
  {
    id: 'button_label', type: 'text',
    position: { x: 30, y: 90, width: 40, height: 0 },
    style: { opacity: 1, zIndex: 2, rotation: 0, flipX: false, fontSize: 18, fontWeight: 600 },
    animation: { type: 'fadeInUp', duration: 600, delay: 1600, triggerOn: 'load' },
    content: 'Mo thiep moi',
    locked: true,
  },
];

// Similar arrays for HERO_ELEMENTS, FAMILY_ELEMENTS, etc.

export const SONGPHUNG_RED_PRESET: BuilderConfig = {
  version: '2.0',
  blocks: [
    { id: 'cover-1', blockType: 'cover-songphung', visible: true, elements: COVER_ELEMENTS, settings: {} },
    { id: 'hero-1', blockType: 'hero-songphung', visible: true, elements: HERO_ELEMENTS, settings: {} },
    { id: 'family-1', blockType: 'family-default', visible: true, elements: FAMILY_ELEMENTS, settings: {} },
    { id: 'ceremony-1', blockType: 'ceremony-default', visible: true, elements: CEREMONY_ELEMENTS, settings: {} },
    { id: 'countdown-1', blockType: 'countdown-default', visible: true, elements: COUNTDOWN_ELEMENTS, settings: {} },
    { id: 'gallery-1', blockType: 'gallery-default', visible: true, elements: GALLERY_ELEMENTS, settings: {} },
    { id: 'wishes-1', blockType: 'wishes-default', visible: true, elements: WISHES_ELEMENTS, settings: {} },
    { id: 'bank-1', blockType: 'bank-default', visible: true, elements: BANK_ELEMENTS, settings: {} },
    { id: 'footer-1', blockType: 'footer-default', visible: true, elements: FOOTER_ELEMENTS, settings: {} },
  ],
  globalStyles: {
    colors: { primary: '#5F191D', background: '#F8F2ED', text: '#2C1810', accent: '#C8963C' },
    fonts: { heading: 'Cormorant Garamond', body: 'Be Vietnam Pro' },
    paperBg: '/themes/songphung-red/paper-bg.jpg',
    musicUrl: '/themes/songphung-red/music.mp3',
  },
};
```

### Preset Registry

```typescript
// builder-v2/presets/index.ts

import { SONGPHUNG_RED_PRESET } from './songphungRed';

export interface PresetMeta {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  config: BuilderConfig;
}

export const PRESET_REGISTRY: PresetMeta[] = [
  {
    id: 'songphung-red',
    name: 'Song Phung Do',
    description: '9 section day du, phong cach truyen thong Viet',
    thumbnail: '/builder/presets/songphung-red-thumb.png',
    config: SONGPHUNG_RED_PRESET,
  },
  // Future: { id: 'minimal-white', ... }
];
```

### Builder Start Screen

```typescript
// builder-v2/components/StartScreen.tsx

function StartScreen({ onStart }: { onStart: (config: BuilderConfig | null) => void }) {
  return (
    <div style={{ display: 'flex', gap: 24, justifyContent: 'center', padding: 48 }}>
      <Card onClick={() => onStart(null)} title="Blank Canvas"
        description="Bat dau tu trang trang, them block tu thu vien"
        icon={<PlusIcon />}
      />
      {PRESET_REGISTRY.map(preset => (
        <Card key={preset.id} onClick={() => onStart(preset.config)}
          title={preset.name} description={preset.description}
          thumbnail={preset.thumbnail}
        />
      ))}
    </div>
  );
}
```

### Migration v1 -> v2

```typescript
// utils/migrateConfig.ts

export function migrateV1ToV2(v1: TemplateConfig): BuilderConfig {
  // Start from songphung-red preset as base
  const base = structuredClone(SONGPHUNG_RED_PRESET);

  // Override globalStyles from v1
  base.globalStyles.colors = { ...v1.colors };
  base.globalStyles.fonts = { ...v1.fonts };
  base.globalStyles.paperBg = v1.assets.cover?.paper_bg;
  base.globalStyles.musicUrl = v1.assets.global?.music_url;

  // Override element content from v1 assets
  const coverBlock = base.blocks.find(b => b.blockType === 'cover-songphung');
  if (coverBlock && v1.assets.cover) {
    updateElementContent(coverBlock, 'phoenix_left', v1.assets.cover.phoenix_left);
    updateElementContent(coverBlock, 'phoenix_right', v1.assets.cover.phoenix_right);
    updateElementContent(coverBlock, 'flower_tl', v1.assets.cover.flower_tl);
    updateElementContent(coverBlock, 'flower_br', v1.assets.cover.flower_br);
    updateElementContent(coverBlock, 'chu_hy', v1.assets.cover.chu_hy);
  }
  // ... similar for hero, family, etc.

  // Override text content from v1 text_samples
  if (v1.text_samples.cover) {
    updateElementContent(coverBlock, 'invitation_greeting', v1.text_samples.cover.invitation_greeting);
    updateElementContent(coverBlock, 'button_label', v1.text_samples.cover.button_label);
  }

  // Apply section visibility from v1
  for (const block of base.blocks) {
    const sectionKey = blockTypeToSectionKey(block.blockType);
    if (sectionKey && v1.sections[sectionKey]) {
      block.visible = v1.sections[sectionKey].visible;
    }
  }

  // Reorder blocks based on v1 section order
  base.blocks.sort((a, b) => {
    const orderA = v1.sections[blockTypeToSectionKey(a.blockType)]?.order ?? 99;
    const orderB = v1.sections[blockTypeToSectionKey(b.blockType)]?.order ?? 99;
    return orderA - orderB;
  });

  return base;
}

function updateElementContent(block: BlockInstance, elementId: string, content?: string) {
  if (!content || !block) return;
  const el = block.elements.find(e => e.id === elementId);
  if (el) el.content = content;
}

function blockTypeToSectionKey(bt: BlockType): SectionKey {
  const map: Record<string, SectionKey> = {
    'cover-songphung': 'cover', 'hero-songphung': 'hero', 'family-default': 'family',
    'ceremony-default': 'ceremony', 'countdown-default': 'countdown', 'gallery-default': 'gallery',
    'wishes-default': 'wishes', 'bank-default': 'bank', 'footer-default': 'footer',
  };
  return map[bt] || 'cover';
}
```

## Related Code Files
- `wedding-admin/src/types/templateConfig.ts:97-156` -- DEFAULT_SONGPHUNG_RED_CONFIG (source data for preset)
- `wedding-web/components/themes/songphung-red/CoverSection.tsx:128-265` -- element positions to extract
- `wedding-web/components/themes/songphung-red/HeroSection.tsx:62-99` -- hero positions
- `wedding-admin/src/pages/templates/builder/assetPresets.ts:37-105` -- asset URLs

## Implementation Steps

1. Create `builder-v2/presets/songphungRed.ts` with all 9 block element arrays (most effort -- ~200 lines per block, extracted from current section components)
2. Create `builder-v2/presets/index.ts` with PRESET_REGISTRY
3. Create `builder-v2/components/StartScreen.tsx` with blank/preset choices
4. Wire StartScreen into TemplateBuilderPageV2 -- show on initial load (no blocks)
5. Implement `migrateV1ToV2()` in `wedding-admin/src/utils/migrateConfig.ts`
6. When editing existing v1 template in builder-v2, auto-migrate config
7. Add "Reset to preset" button in builder toolbar (replaces all blocks with preset defaults)
8. Create preset thumbnails (screenshot current songphung-red sections)
9. Test: start blank, add blocks manually; start from preset, all 9 blocks render with correct elements

## Todo List
- [ ] Extract all element positions from current section components into preset data
- [ ] Create songphungRed.ts preset file
- [ ] Create preset registry
- [ ] Create StartScreen component
- [ ] Wire into builder page
- [ ] Implement migrateV1ToV2
- [ ] Add "Reset to preset" button
- [ ] Create preset thumbnails
- [ ] Test blank canvas flow
- [ ] Test preset load flow
- [ ] Test v1 -> v2 migration

## Success Criteria
- "Use songphung-red preset" populates 9 blocks with visually correct element positions
- "Blank canvas" starts empty, blocks addable from sidebar
- v1 template loaded in builder-v2 auto-migrates: colors/fonts/assets carry over
- "Reset to preset" restores default element positions

## Risk Assessment
- **Position accuracy**: Extracting positions from CSS px values to % is approximate. Visual calibration needed. Mitigation: iterative adjustment, side-by-side comparison.
- **Preset data maintenance**: If block renderer changes element layout, preset data must update too. Mitigation: preset data is source of truth for default positions; renderers always read from elements[].
- **v1 migration completeness**: Some v1 customizations (section order, visibility) may not map 1:1. Mitigation: preserve as much as possible; admin can fine-tune in builder.

## Security Considerations
- Preset data is hardcoded in source code (not user input) -- no validation needed.
- Migration output is validated by same v2.0 validator before DB write.

## Next Steps
- Phase 08: Dynamic renderer for public wedding page
