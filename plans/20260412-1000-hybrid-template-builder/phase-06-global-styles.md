# Phase 06 -- Global Styles + Effects Panel

## Context Links
- [Phase 05: Property inspector](./phase-05-property-inspector.md)
- [Current StyleEditor](../../../wedding-admin/src/pages/templates/builder/StyleEditor.tsx)
- [SongPhungTheme CSS vars](../../../wedding-web/components/themes/songphung-red/SongPhungTheme.tsx)

## Overview
- **Date**: 2026-04-12
- **Description**: Global settings panel for colors, fonts, paper background, and music URL. Applies across all blocks. Separate from per-element properties (Phase 05).
- **Priority**: Medium
- **Implementation status**: Not Started
- **Review status**: Pending

## Key Insights
- Current `StyleEditor.tsx` already handles 4 colors (primary, background, text, accent) + 2 fonts (heading, body) -- reuse most of this logic.
- `SongPhungTheme.tsx:172-181` sets CSS variables (`--sp-primary`, etc.) from config -- v2 block renderers should do same from `globalStyles`.
- `SongPhungTheme.tsx:137-156` dynamically loads Google Fonts -- reuse this pattern.
- Paper background currently at `cfg.assets.cover.paper_bg` -- in v2, moves to `globalStyles.paperBg`.
- Music URL currently at `cfg.assets.global.music_url` -- moves to `globalStyles.musicUrl`.

## Requirements
1. Color palette editor: primary, background, text, accent -- with color pickers
2. Font selector: heading font, body font -- with Google Fonts preview
3. Paper background: URL input + preset selector (paper-bg.jpg, paper-texture.jpg)
4. Music URL: input field + file upload
5. Changes propagate to all blocks immediately (via Puck root props)
6. Preset color palettes (quick-select common Vietnamese wedding color schemes)

## Architecture

### Global Styles Panel

```typescript
// builder-v2/components/GlobalStylesPanel.tsx

interface Props {
  globalStyles: GlobalStyles;
  onChange: (styles: GlobalStyles) => void;
}

function GlobalStylesPanel({ globalStyles, onChange }: Props) {
  return (
    <div>
      {/* Color Palette */}
      <Section title="Mau sac">
        <ColorField label="Primary" value={globalStyles.colors.primary}
          onChange={v => onChange({ ...globalStyles, colors: { ...globalStyles.colors, primary: v } })} />
        <ColorField label="Background" value={globalStyles.colors.background}
          onChange={v => onChange({ ...globalStyles, colors: { ...globalStyles.colors, background: v } })} />
        <ColorField label="Text" value={globalStyles.colors.text}
          onChange={v => onChange({ ...globalStyles, colors: { ...globalStyles.colors, text: v } })} />
        <ColorField label="Accent" value={globalStyles.colors.accent}
          onChange={v => onChange({ ...globalStyles, colors: { ...globalStyles.colors, accent: v } })} />

        {/* Quick presets */}
        <div style={{ marginTop: 12 }}>
          <label>Preset:</label>
          {COLOR_PRESETS.map(preset => (
            <ColorPresetChip key={preset.name} {...preset}
              onClick={() => onChange({ ...globalStyles, colors: preset.colors })} />
          ))}
        </div>
      </Section>

      {/* Fonts */}
      <Section title="Font chu">
        <FontSelector label="Heading" value={globalStyles.fonts.heading}
          onChange={v => onChange({ ...globalStyles, fonts: { ...globalStyles.fonts, heading: v } })} />
        <FontSelector label="Body" value={globalStyles.fonts.body}
          onChange={v => onChange({ ...globalStyles, fonts: { ...globalStyles.fonts, body: v } })} />
      </Section>

      {/* Paper Background */}
      <Section title="Nen giay">
        <ImagePicker value={globalStyles.paperBg}
          presets={PAPER_PRESETS}
          onChange={v => onChange({ ...globalStyles, paperBg: v })} />
      </Section>

      {/* Music */}
      <Section title="Nhac nen">
        <Input value={globalStyles.musicUrl}
          placeholder="/themes/songphung-red/music.mp3"
          onChange={e => onChange({ ...globalStyles, musicUrl: e.target.value })} />
      </Section>
    </div>
  );
}
```

### Color Presets

```typescript
const COLOR_PRESETS = [
  {
    name: 'Song Phung Do',
    colors: { primary: '#5F191D', background: '#F8F2ED', text: '#2C1810', accent: '#C8963C' },
  },
  {
    name: 'Hoa Sen Hong',
    colors: { primary: '#8B3A62', background: '#FFF5F5', text: '#2D1F2D', accent: '#D4A574' },
  },
  {
    name: 'Thanh lich',
    colors: { primary: '#1A365D', background: '#F7FAFC', text: '#1A202C', accent: '#B7791F' },
  },
  {
    name: 'Trang nha',
    colors: { primary: '#2D3748', background: '#FFFFF0', text: '#1A202C', accent: '#C4B5A0' },
  },
];
```

### Font Options

```typescript
const FONT_OPTIONS = [
  { value: 'Cormorant Garamond', label: 'Cormorant Garamond (default)' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Great Vibes', label: 'Great Vibes (script)' },
  { value: 'Dancing Script', label: 'Dancing Script' },
  { value: 'Be Vietnam Pro', label: 'Be Vietnam Pro (default body)' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Open Sans', label: 'Open Sans' },
];
```

### Integration with Puck

Global styles live on Puck's `root` props:

```typescript
// In puckConfig.ts
export const puckConfig: Config = {
  root: {
    fields: {
      globalStyles: {
        type: 'custom',
        render: ({ value, onChange }) => (
          <GlobalStylesPanel globalStyles={value} onChange={onChange} />
        ),
      },
    },
    defaultProps: {
      globalStyles: DEFAULT_GLOBAL_STYLES,
    },
    render: ({ children, globalStyles }) => (
      <div style={buildCSSVars(globalStyles)}>
        {children}
      </div>
    ),
  },
  components: { ... },
};
```

## Related Code Files
- `wedding-admin/src/pages/templates/builder/StyleEditor.tsx` -- v1 color/font editor (reuse logic)
- `wedding-web/components/themes/songphung-red/SongPhungTheme.tsx:172-181` -- CSS variable setup
- `wedding-web/components/themes/songphung-red/SongPhungTheme.tsx:137-156` -- Google Fonts loader
- `wedding-admin/src/pages/templates/builder/assetPresets.ts:92-104` -- paper_bg presets

## Implementation Steps

1. Create `builder-v2/components/GlobalStylesPanel.tsx` with color, font, paper, music sections
2. Create `builder-v2/components/ColorField.tsx` -- Ant Design ColorPicker wrapper
3. Create `builder-v2/components/FontSelector.tsx` -- dropdown with Google Fonts preview
4. Create `builder-v2/components/ColorPresetChip.tsx` -- visual swatch for quick color scheme selection
5. Define `COLOR_PRESETS` and `FONT_OPTIONS` constants
6. Wire GlobalStylesPanel into Puck root `fields.globalStyles` custom renderer
7. Implement CSS variable propagation in Puck root `render` function
8. Add Google Fonts dynamic loading (reuse logic from `SongPhungTheme.tsx:137-156`)
9. Test: change primary color, see all blocks update; change font, see text update; change paper bg

## Todo List
- [ ] Create GlobalStylesPanel component
- [ ] Create ColorField component
- [ ] Create FontSelector component
- [ ] Create ColorPresetChip component
- [ ] Define color presets and font options
- [ ] Wire into Puck root fields
- [ ] CSS variable propagation
- [ ] Google Fonts dynamic loading
- [ ] Test global style changes across blocks

## Success Criteria
- Changing primary color updates all block text/borders/backgrounds immediately
- Changing font updates all heading/body text across blocks
- Paper background texture changes across all blocks
- Color presets apply 4 colors in one click
- Google Fonts load dynamically when custom font selected

## Risk Assessment
- **Google Fonts latency**: Loading custom fonts may cause FOUT in builder preview. Mitigation: preload common fonts; show loading indicator.
- **Color contrast**: Admin may pick colors with poor contrast (white text on white bg). Mitigation: add contrast warning when text/bg ratio < 4.5:1.

## Security Considerations
- Color values: sanitize to hex format only (regex `^#[0-9A-Fa-f]{6}$`)
- Font family: whitelist against known Google Fonts list (prevent CSS injection)
- Music URL: validate prefix same as asset URLs
- Paper bg URL: validate prefix same as asset URLs

## Next Steps
- Phase 07: Preset system + "Load songphung-red" button
