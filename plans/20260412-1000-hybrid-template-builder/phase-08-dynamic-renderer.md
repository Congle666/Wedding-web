# Phase 08 -- Dynamic Renderer for Public Wedding Page

## Context Links
- [Phase 01: Schema](./phase-01-schema-redesign.md)
- [Phase 03: Block renderers](./phase-03-block-renderers.md)
- [Phase 07: Preset system](./phase-07-preset-system.md)
- [Current SongPhungTheme](../../../wedding-web/components/themes/songphung-red/SongPhungTheme.tsx)
- [Current useTemplateConfig](../../../wedding-web/components/themes/songphung-red/useTemplateConfig.ts)

## Overview
- **Date**: 2026-04-12
- **Description**: Create DynamicThemeRenderer in wedding-web that reads BuilderConfig v2.0, iterates blocks[], renders each via block renderer components. Replaces SongPhungTheme for v2 configs while maintaining backward compatibility for v1.
- **Priority**: Critical (enables public page rendering of builder output)
- **Implementation status**: Not Started
- **Review status**: Pending

## Key Insights
- Current rendering path: `SongPhungTheme.tsx:55-398` reads v1 config, renders 9 hardcoded sections in order. v2 path: DynamicThemeRenderer iterates `blocks[]` and renders each via BLOCK_REGISTRY.
- Block renderers from Phase 03 are created in wedding-admin. For public page they must exist in wedding-web too. Options: (a) duplicate with sync discipline, (b) shared package, (c) build admin block renderers as separate npm package consumed by both.
- **Decision**: Duplicate block renderers into `wedding-web/components/themes/dynamic/blocks/`. Maintain sync via Phase 03 block renderer specs. Shared package adds build complexity disproportionate to codebase size (KISS).
- Animation rendering: use framer-motion (already in wedding-web) for element animations. Map `AnimationType` to framer-motion variants.
- Parallax: reuse existing `registerParallax` pattern from `SongPhungTheme.tsx:94-134`.
- Version detection at route level: `/w/[slug]` page checks config version, routes to SongPhungTheme or DynamicThemeRenderer.

## Requirements
1. `DynamicThemeRenderer` component in wedding-web
2. Reads `BuilderConfig` from `template.customizable_fields`
3. Iterates `blocks[]`, renders via `DynamicBlockRenderer` (block registry)
4. Applies `globalStyles` as CSS variables on root wrapper
5. Handles animations per element (framer-motion variants)
6. Handles parallax elements (reuse existing scroll handler)
7. Responsive CSS (mobile/tablet/desktop) -- same media queries as current
8. Backward compat: v1 config -> SongPhungTheme; v2 config -> DynamicThemeRenderer
9. Preview route `/w/preview/[theme]` supports v2 config via postMessage
10. Cover section overlay behavior (fixed, fades out on open) preserved

## Architecture

### DynamicThemeRenderer

```typescript
// wedding-web/components/themes/dynamic/DynamicThemeRenderer.tsx

import type { BuilderConfig, BlockInstance } from '@/types/builderConfig';
import { BLOCK_REGISTRY } from './blocks/blockRegistry';

interface Props {
  data: WeddingData;
  config: BuilderConfig;
}

export default function DynamicThemeRenderer({ data, config }: Props) {
  const { globalStyles, blocks } = config;
  const [coverOpen, setCoverOpen] = useState(false);
  const parallaxRefs = useRef<...>([]);
  const registerParallax = useCallback(...); // same as SongPhungTheme

  // Google Fonts loader
  useEffect(() => { loadGoogleFonts(globalStyles.fonts); }, [globalStyles.fonts]);

  // Parallax scroll handler
  useEffect(() => { ... }, []); // same as SongPhungTheme:106-134

  const cssVars: CSSProperties = {
    ['--sp-primary' as any]: globalStyles.colors.primary,
    ['--sp-bg' as any]: globalStyles.colors.background,
    ['--sp-text' as any]: globalStyles.colors.text,
    ['--sp-accent' as any]: globalStyles.colors.accent,
    ['--sp-font-heading' as any]: `'${globalStyles.fonts.heading}', serif`,
    ['--sp-font-body' as any]: `'${globalStyles.fonts.body}', sans-serif`,
  };

  // Separate cover block (overlay behavior) from flow blocks
  const coverBlock = blocks.find(b => b.blockType.startsWith('cover-') && b.visible);
  const flowBlocks = blocks.filter(b => !b.blockType.startsWith('cover-') && b.visible);
  const footerBlock = flowBlocks.find(b => b.blockType.startsWith('footer-'));
  const middleBlocks = flowBlocks.filter(b => !b.blockType.startsWith('footer-'));

  return (
    <div style={cssVars}>
      <div style={{
        overflow: 'hidden',
        backgroundColor: globalStyles.colors.background,
        backgroundImage: globalStyles.paperBg ? `url(${globalStyles.paperBg})` : undefined,
        backgroundSize: '800px auto',
        backgroundRepeat: 'repeat',
        maxWidth: 800,
        margin: '0 auto',
        boxShadow: '0 0 60px rgba(0,0,0,0.15)',
        position: 'relative',
      }}>
        {/* Responsive CSS */}
        <style>{RESPONSIVE_STYLES}</style>

        {/* Cover overlay */}
        {coverBlock && !coverOpen && (
          <CoverBlockRenderer
            elements={coverBlock.elements}
            settings={coverBlock.settings}
            globalStyles={globalStyles}
            weddingData={data}
            onOpen={() => setCoverOpen(true)}
          />
        )}

        {/* Flow sections */}
        <div id="invitation-content">
          {middleBlocks.map(block => {
            const Renderer = BLOCK_REGISTRY[block.blockType];
            if (!Renderer) return null;
            return (
              <Renderer
                key={block.id}
                elements={block.elements}
                settings={block.settings}
                globalStyles={globalStyles}
                weddingData={data}
                registerParallax={registerParallax}
              />
            );
          })}

          {footerBlock && (
            <FooterBlockRenderer
              elements={footerBlock.elements}
              settings={footerBlock.settings}
              globalStyles={globalStyles}
              weddingData={data}
            />
          )}
        </div>

        {/* Music button */}
        {coverOpen && <MusicButton ... />}
      </div>
    </div>
  );
}
```

### Version Detection at Route Level

```typescript
// wedding-web/app/w/[slug]/page.tsx (existing)

import { isBuilderConfig } from '@/types/builderConfig';
import SongPhungTheme from '@/components/themes/songphung-red/SongPhungTheme';
import DynamicThemeRenderer from '@/components/themes/dynamic/DynamicThemeRenderer';

export default function WeddingPage({ data }: Props) {
  const config = data.template_config;

  if (isBuilderConfig(config)) {
    return <DynamicThemeRenderer data={data} config={config} />;
  }

  // Legacy v1 path
  return <SongPhungTheme data={data} />;
}
```

### Animation Rendering

```typescript
// wedding-web/components/themes/dynamic/blocks/shared/AnimatedElement.tsx

import { motion, useInView } from 'framer-motion';

const ANIMATION_VARIANTS: Record<AnimationType, (anim: ElementAnimation) => any> = {
  none: () => ({}),
  fadeIn: (a) => ({
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: a.duration / 1000, delay: a.delay / 1000 },
  }),
  fadeInUp: (a) => ({
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: a.duration / 1000, delay: a.delay / 1000 },
  }),
  slideInLeft: (a) => ({
    initial: { opacity: 0, x: -60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: a.duration / 1000, delay: a.delay / 1000 },
  }),
  slideInRight: (a) => ({
    initial: { opacity: 0, x: 60 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: a.duration / 1000, delay: a.delay / 1000 },
  }),
  scaleIn: (a) => ({
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { delay: a.delay / 1000, duration: a.duration / 1000, type: 'spring' },
  }),
  parallax: () => ({}), // handled by registerParallax, not framer-motion
};

function AnimatedElement({ element, children, registerParallax }: {
  element: ElementInstance;
  children: ReactNode;
  registerParallax?: (...) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const anim = element.animation;

  // Parallax handled separately
  if (anim.type === 'parallax' && registerParallax) {
    return (
      <div ref={(el) => registerParallax(el, anim.parallaxSpeed ?? 0.02)}
        data-parallax="">
        {children}
      </div>
    );
  }

  if (anim.type === 'none') return <>{children}</>;

  const variant = ANIMATION_VARIANTS[anim.type](anim);
  const shouldAnimate = anim.triggerOn === 'load' || isInView;

  return (
    <motion.div ref={ref}
      initial={variant.initial}
      animate={shouldAnimate ? variant.animate : variant.initial}
      transition={variant.transition}
    >
      {children}
    </motion.div>
  );
}
```

### File Structure in wedding-web

```
wedding-web/components/themes/dynamic/
  DynamicThemeRenderer.tsx       -- Main renderer
  blocks/
    blockRegistry.ts             -- Maps blockType -> component
    shared/
      ElementRenderer.tsx        -- Renders single element (mirrored from admin)
      AnimatedElement.tsx         -- Framer-motion wrapper
      BlockRendererProps.ts       -- Shared interface
    CoverBlockRenderer.tsx       -- Cover section (overlay behavior)
    HeroBlockRenderer.tsx
    FamilyBlockRenderer.tsx
    CeremonyBlockRenderer.tsx
    CountdownBlockRenderer.tsx
    GalleryBlockRenderer.tsx
    WishesBlockRenderer.tsx
    BankBlockRenderer.tsx
    FooterBlockRenderer.tsx
```

### Preview Route Update

```typescript
// wedding-web/app/w/preview/[theme]/page.tsx

// Existing postMessage listener handles TEMPLATE_CONFIG_UPDATE
// Add: detect if incoming config is v2.0, route to DynamicThemeRenderer

useEffect(() => {
  const onMessage = (event: MessageEvent) => {
    if (event.data?.type === 'TEMPLATE_CONFIG_UPDATE') {
      const config = event.data.config;
      if (isBuilderConfig(config)) {
        setBuilderConfig(config);  // triggers DynamicThemeRenderer
      } else {
        setLegacyConfig(config);   // triggers SongPhungTheme
      }
    }
  };
  window.addEventListener('message', onMessage);
  return () => window.removeEventListener('message', onMessage);
}, []);
```

## Related Code Files
- `wedding-web/components/themes/songphung-red/SongPhungTheme.tsx:55-398` -- legacy renderer (preserved)
- `wedding-web/components/themes/songphung-red/SongPhungTheme.tsx:94-134` -- parallax system (reuse)
- `wedding-web/components/themes/songphung-red/SongPhungTheme.tsx:137-156` -- Google Fonts loader (reuse)
- `wedding-web/components/themes/songphung-red/SongPhungTheme.tsx:172-181` -- CSS vars (reuse pattern)
- `wedding-web/components/themes/songphung-red/SongPhungTheme.tsx:204-253` -- responsive CSS (reuse)
- `wedding-web/app/w/[slug]/page.tsx` -- route page (add version check)

## Implementation Steps

1. Create `wedding-web/types/builderConfig.ts` (copy from Phase 01, or symlink to admin)
2. Create `wedding-web/components/themes/dynamic/` directory structure
3. Create `ElementRenderer.tsx` (public page version -- no DnD, only static rendering + animations)
4. Create `AnimatedElement.tsx` with framer-motion variant mapping
5. Duplicate block renderer components from admin `builder-v2/blocks/` into `dynamic/blocks/`, removing builder-mode code (DnD, selection, delete buttons)
6. Create `blockRegistry.ts`
7. Create `DynamicThemeRenderer.tsx` with version detection, CSS vars, parallax, cover overlay logic
8. Update `wedding-web/app/w/[slug]/page.tsx` to detect config version and route accordingly
9. Update preview route to handle v2.0 configs via postMessage
10. Copy responsive CSS from `SongPhungTheme.tsx:204-253` into dynamic renderer (adapt class names)
11. Test: create v2 config in builder, save, load public page -- all blocks render correctly
12. Test: v1 config still renders via SongPhungTheme unchanged

## Todo List
- [ ] Create builderConfig.ts in wedding-web/types/
- [ ] Create dynamic/ directory structure
- [ ] Create ElementRenderer (public, no DnD)
- [ ] Create AnimatedElement with framer-motion
- [ ] Duplicate block renderers (public versions)
- [ ] Create blockRegistry
- [ ] Create DynamicThemeRenderer
- [ ] Update [slug] page with version detection
- [ ] Update preview route for v2
- [ ] Responsive CSS
- [ ] Test v2 public rendering
- [ ] Test v1 backward compat

## Success Criteria
- Public page renders v2 BuilderConfig with correct block ordering, element positions, animations
- Cover section overlay + open behavior works identically to current
- Parallax decorations scroll correctly
- Music player works
- v1 templates render unchanged via SongPhungTheme
- Mobile responsive layout matches current quality
- Preview route live-updates for both v1 and v2 configs

## Risk Assessment
- **Block renderer duplication**: wedding-admin and wedding-web have separate copies. Changes must be synced. Mitigation: block renderers are stable after Phase 03; admin versions have DnD additions, public versions are pure render. Document sync requirement in contributing guide.
- **Animation performance**: Many animated elements per block could cause jank on low-end mobile. Mitigation: limit to 10 animated elements per block; use `will-change: transform` selectively; `once: true` on useInView.
- **SEO**: Current SongPhungTheme uses Next.js Image with priority loading. DynamicThemeRenderer must maintain same SSR behavior. Mitigation: use Next.js Image component in public block renderers (not plain `<img>`).
- **Bundle size**: Adding DynamicThemeRenderer + all block renderers increases wedding-web bundle. Mitigation: dynamic import (`next/dynamic`) for DynamicThemeRenderer -- only loaded when v2 config detected.

## Security Considerations
- Element content URLs validated by backend (Phase 01 validator) before DB write
- Public renderer reads from DB only -- no user input at render time
- No `dangerouslySetInnerHTML` in any block renderer
- CSS variable injection: sanitize color values server-side (hex only)

## Next Steps
- This is the final phase. After completion:
  - Remove v1 builder route (or keep as fallback)
  - Migrate existing v1 templates to v2 via admin tool
  - Add more presets (minimal-white, etc.)
  - Consider shared component package if sync burden becomes high
