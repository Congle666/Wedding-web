# Phase 01 -- Schema Redesign: BuilderConfig v2.0

## Context Links
- [Current TemplateConfig (admin)](../../../wedding-admin/src/types/templateConfig.ts)
- [Current TemplateConfig (web)](../../../wedding-web/types/templateConfig.ts)
- [Go model](../../../models/template_config.go)
- [Go validator](../../../utils/template_config_validator.go)
- [Research: section decomposition](./research/researcher-02-section-decomposition.md)

## Overview
- **Date**: 2026-04-12
- **Description**: Design v2.0 BuilderConfig schema with BlockInstance + ElementInstance, Go mirror, validator update, and v1->v2 migration utility. This is the data foundation for the entire builder.
- **Priority**: Critical (blocks all other phases)
- **Implementation status**: Not Started
- **Review status**: Pending

## Key Insights
- Current v1.0 schema uses flat `assets.<section>.<slotKey>` + `text_samples.<section>.<slot>` + `sections.<key>.{visible, order}` -- no concept of composable blocks or positionable elements.
- v2.0 must support arbitrary block ordering, variable block counts, and per-element absolute positioning within each block.
- Go struct uses `map[string]map[string]any` for Assets -- already flexible enough for v2.0 if we store blocks as JSON array.
- Current validator caps at 64KB (`utils/template_config_validator.go:16`). Blocks with elements need ~256KB.
- `SongPhungTheme.tsx:56` reads cfg via `useTemplateConfig()` hook -- version detection must happen here.

## Requirements
1. Define `BuilderConfig` (v2.0) TypeScript interface with `blocks[]` array
2. Define `BlockInstance` interface: blockType, elements[], settings
3. Define `ElementInstance` interface: position, style, animation, content, locked
4. Backward-compatible version detection: `version === '1.0'` vs `version === '2.0'`
5. Migration function: `migrateV1ToV2(v1: TemplateConfig): BuilderConfig`
6. Go struct mirror for validation
7. Update validator max size to 256KB
8. Update `AllowedTemplateConfigVersions` to include `"2.0"`

## Architecture

### TypeScript Schema (wedding-admin + wedding-web)

```typescript
// types/builderConfig.ts

export type BlockType =
  | 'cover-songphung'
  | 'hero-songphung'
  | 'family-default'
  | 'ceremony-default'
  | 'countdown-default'
  | 'gallery-default'
  | 'wishes-default'
  | 'bank-default'
  | 'footer-default';

export type ElementType = 'image' | 'text' | 'shape' | 'divider';

export type AnimationType =
  | 'none'
  | 'fadeIn'
  | 'fadeInUp'
  | 'slideInLeft'
  | 'slideInRight'
  | 'scaleIn'
  | 'parallax';

export interface ElementPosition {
  x: number;      // percentage (0-100) within block
  y: number;      // percentage (0-100) within block
  width: number;  // percentage of block width
  height: number; // percentage of block height (0 = auto)
}

export interface ElementStyle {
  opacity: number;       // 0-1
  zIndex: number;
  rotation: number;      // degrees
  flipX: boolean;
  color?: string;        // for text/shape
  fontSize?: number;     // px, for text
  fontFamily?: string;   // for text
  fontWeight?: number;
  fontStyle?: 'normal' | 'italic';
}

export interface ElementAnimation {
  type: AnimationType;
  duration: number;   // ms, 300-2000
  delay: number;      // ms, 0-2000
  triggerOn: 'load' | 'scroll';
  parallaxSpeed?: number; // -0.05 to 0.05, only for parallax type
}

export interface ElementInstance {
  id: string;           // nanoid, unique within block
  type: ElementType;
  position: ElementPosition;
  style: ElementStyle;
  animation: ElementAnimation;
  content: string;      // image URL or text content
  locked: boolean;      // structural elements can't be deleted
  category?: string;    // 'phoenix' | 'flower' | 'symbol' etc. for asset library filtering
}

export interface BlockSettings {
  /** Block-specific key-value overrides, e.g. gridCols for gallery */
  [key: string]: any;
}

export interface BlockInstance {
  id: string;            // nanoid
  blockType: BlockType;
  visible: boolean;
  elements: ElementInstance[];
  settings: BlockSettings;
}

export interface GlobalStyles {
  colors: {
    primary: string;
    background: string;
    text: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  paperBg?: string;      // background texture URL
  musicUrl?: string;
}

export interface BuilderConfig {
  version: '2.0';
  blocks: BlockInstance[];
  globalStyles: GlobalStyles;
}

// Union type for DB storage -- renderer detects version
export type StoredConfig = TemplateConfig | BuilderConfig;

export function isBuilderConfig(cfg: any): cfg is BuilderConfig {
  return cfg?.version === '2.0' && Array.isArray(cfg?.blocks);
}

export function isLegacyConfig(cfg: any): cfg is TemplateConfig {
  return cfg?.version === '1.0' || (!cfg?.version && cfg?.base_theme);
}
```

### Migration Function

```typescript
// utils/migrateConfig.ts

export function migrateV1ToV2(v1: TemplateConfig): BuilderConfig {
  // Map each v1 section -> BlockInstance with extracted elements
  // Element positions derived from hardcoded CSS in songphung-red components
  // See SONGPHUNG_RED_PRESET in phase-07
}
```

### Go Struct Mirror

```go
// models/builder_config.go

type BuilderConfig struct {
    Version      string          `json:"version"`       // "2.0"
    Blocks       []BlockInstance `json:"blocks"`
    GlobalStyles GlobalStyles    `json:"global_styles"`
}

type BlockInstance struct {
    ID        string            `json:"id"`
    BlockType string            `json:"block_type"`
    Visible   bool              `json:"visible"`
    Elements  []ElementInstance `json:"elements"`
    Settings  map[string]any    `json:"settings"`
}

type ElementInstance struct {
    ID        string           `json:"id"`
    Type      string           `json:"type"`
    Position  ElementPosition  `json:"position"`
    Style     ElementStyle     `json:"style"`
    Animation ElementAnimation `json:"animation"`
    Content   string           `json:"content"`
    Locked    bool             `json:"locked"`
    Category  string           `json:"category,omitempty"`
}

type ElementPosition struct {
    X      float64 `json:"x"`
    Y      float64 `json:"y"`
    Width  float64 `json:"width"`
    Height float64 `json:"height"`
}

type ElementStyle struct {
    Opacity    float64 `json:"opacity"`
    ZIndex     int     `json:"z_index"`
    Rotation   float64 `json:"rotation"`
    FlipX      bool    `json:"flip_x"`
    Color      string  `json:"color,omitempty"`
    FontSize   int     `json:"font_size,omitempty"`
    FontFamily string  `json:"font_family,omitempty"`
    FontWeight int     `json:"font_weight,omitempty"`
    FontStyle  string  `json:"font_style,omitempty"`
}

type ElementAnimation struct {
    Type           string  `json:"type"`
    Duration       int     `json:"duration"`
    Delay          int     `json:"delay"`
    TriggerOn      string  `json:"trigger_on"`
    ParallaxSpeed  float64 `json:"parallax_speed,omitempty"`
}

type GlobalStyles struct {
    Colors   TemplateColors `json:"colors"`
    Fonts    TemplateFonts  `json:"fonts"`
    PaperBg  string         `json:"paper_bg,omitempty"`
    MusicUrl string         `json:"music_url,omitempty"`
}
```

### Data Flow
```
Admin Builder (Puck)
  -> Serialize Puck state to BuilderConfig v2.0
  -> POST /admin/templates { customizable_fields: BuilderConfig }
  -> Go validator: detect version, validate v2.0 schema
  -> DB: templates.customizable_fields (JSON)

Public Page (wedding-web)
  -> Read customizable_fields
  -> isBuilderConfig() ? DynamicThemeRenderer : SongPhungTheme (legacy)
```

## Related Code Files
- `wedding-admin/src/types/templateConfig.ts:87-95` -- current TemplateConfig interface
- `wedding-web/types/templateConfig.ts:77-85` -- mirror
- `models/template_config.go:11-18` -- Go struct
- `models/template_config.go:39-45` -- AllowedVersions/Themes maps
- `utils/template_config_validator.go:16` -- MaxTemplateConfigBytes = 64KB
- `utils/template_config_validator.go:38-96` -- ValidateTemplateConfigJSON
- `wedding-web/components/themes/songphung-red/useTemplateConfig.ts` -- config hook

## Implementation Steps

1. Create `wedding-admin/src/types/builderConfig.ts` with all interfaces above
2. Create `wedding-web/types/builderConfig.ts` (identical copy or shared via symlink)
3. Add `isBuilderConfig()` and `isLegacyConfig()` type guards to both files
4. Create `wedding-admin/src/utils/migrateConfig.ts` -- stub `migrateV1ToV2()` (full implementation in Phase 07 with preset data)
5. Create `models/builder_config.go` with Go struct mirrors
6. Update `models/template_config.go:39` -- add `"2.0": true` to AllowedTemplateConfigVersions
7. Update `utils/template_config_validator.go:16` -- change MaxTemplateConfigBytes to `256 * 1024`
8. Update `ValidateTemplateConfigJSON` to handle both v1.0 and v2.0 shapes:
   - v1.0: existing validation (unchanged)
   - v2.0: validate blocks array, element positions in range, asset URLs prefixed
9. Add unit tests for v2.0 validation in `utils/template_config_validator_test.go`
10. Update `wedding-web/components/themes/songphung-red/useTemplateConfig.ts` to detect config version and return appropriate type

## Todo List
- [ ] Create `builderConfig.ts` in wedding-admin/src/types/
- [ ] Create `builderConfig.ts` in wedding-web/types/
- [ ] Add type guard functions
- [ ] Stub `migrateConfig.ts`
- [ ] Create `builder_config.go` Go structs
- [ ] Update AllowedTemplateConfigVersions
- [ ] Increase MaxTemplateConfigBytes to 256KB
- [ ] Add v2.0 branch to ValidateTemplateConfigJSON
- [ ] Write validator unit tests for v2.0
- [ ] Update useTemplateConfig hook for version detection

## Success Criteria
- `BuilderConfig` TypeScript type compiles with no errors
- Go validator accepts valid v2.0 JSON and rejects malformed v2.0
- v1.0 configs continue to validate and render unchanged
- `isBuilderConfig()` / `isLegacyConfig()` correctly discriminate

## Risk Assessment
- **Schema too rigid**: ElementInstance has fixed fields; future element types (video, countdown timer) might need extra props. Mitigation: `settings: Record<string, any>` on BlockInstance handles block-level extensions; ElementInstance.content is generic string.
- **Migration data loss**: v1->v2 requires mapping hardcoded CSS positions to percentage-based ElementPosition. Positions will be approximate. Mitigation: v1 rendering path preserved; migration only used for "load preset" flow.
- **DB column size**: MySQL JSON column has no inherent size limit, but 256KB config could slow queries if selected in list views. Mitigation: exclude customizable_fields from list queries (already done in `templateApi.getList`).

## Security Considerations
- Asset URL prefix validation must extend to v2.0 `ElementInstance.content` fields (image type only)
- Text content in elements: sanitize on render (already uses textContent, not innerHTML)
- Block count limit: cap at 20 blocks per config to prevent abuse
- Element count limit: cap at 50 elements per block

## Next Steps
- Phase 02: Install Puck + create block registry using these types
