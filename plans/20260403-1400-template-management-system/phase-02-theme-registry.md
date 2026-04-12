# Phase 2: Theme Registry — Dynamic Theme Loading

## Context
- Parent: [plan.md](plan.md)
- Depends on: Phase 1
- Priority: HIGH
- Status: Pending

## Overview
Frontend cần biết theme nào để render. Tạo theme registry map slug → component.

## Architecture

```
components/themes/
├── registry.ts              ← Map slug → component
├── songphung-red/           ← Theme 1 (existing)
│   ├── SongPhungTheme.tsx
│   ├── CoverSection.tsx
│   └── ...
├── minimal-white/           ← Theme 2 (new)
│   ├── MinimalWhiteTheme.tsx
│   └── ...
└── vintage-floral/          ← Theme 3 (new)
    ├── VintageFloralTheme.tsx
    └── ...
```

```typescript
// registry.ts
import SongPhungTheme from './songphung-red/SongPhungTheme';
import MinimalWhiteTheme from './minimal-white/MinimalWhiteTheme';

const THEME_REGISTRY: Record<string, React.ComponentType<WeddingData>> = {
  'songphung-red': SongPhungTheme,
  'minimal-white': MinimalWhiteTheme,
};

export function getThemeComponent(slug: string) {
  return THEME_REGISTRY[slug] || SongPhungTheme; // fallback
}
```

## Changes to /w/[slug]/page.tsx
```typescript
// Before: always render SongPhungTheme
<SongPhungTheme data={data} />

// After: dynamic theme selection
const ThemeComponent = getThemeComponent(data.template?.theme_slug);
<ThemeComponent data={data} />
```

## API Changes
- GET /api/wedding/:slug response must include `template.theme_slug`

## Implementation Steps
1. Create registry.ts
2. Update /w/[slug]/page.tsx to use registry
3. Update public wedding API to return theme_slug
4. Test with existing SongPhungDo theme

## Related Files
- app/w/[slug]/page.tsx
- components/themes/registry.ts (new)
- handlers/public_wedding_handler.go
