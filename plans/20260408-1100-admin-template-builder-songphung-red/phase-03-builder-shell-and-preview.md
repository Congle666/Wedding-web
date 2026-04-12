# Phase 03 — Builder Shell & Live Preview

## Context
- Parent: [plan.md](./plan.md)
- Depends on: [phase-01](./phase-01-backend-schema-and-api.md), [phase-02](./phase-02-theme-refactor-config-aware.md)
- Related: `wedding-admin/src/pages/templates/`, `wedding-web/app/w/preview/[theme]/page.tsx`

## Overview
- **Date:** 2026-04-08
- **Description:** Create new builder routes in wedding-admin. 3-column layout w/ iframe preview + postMessage bridge. Preview route enhanced to listen for config updates.
- **Priority:** High
- **Implementation Status:** Not Started
- **Review Status:** Pending

## Key Insights
- Preview route exists: `wedding-web/app/w/preview/[theme]/page.tsx:8` w/ MOCK_DATA — easy extension.
- admin runs Vite on :5173, web runs Next on :3000 — cross-origin postMessage needed, `targetOrigin` explicit.
- ReactQuery already installed in admin; fetch template by id for edit mode.
- Legacy `TemplateFormPage.tsx` remains for non-builder metadata; builder only handles `customizable_fields` + saves same endpoint.

## Requirements
1. Routes: `/templates/new/builder` and `/templates/edit/:id/builder` in wedding-admin router.
2. Layout: 3 columns — SectionSidebar (left, 260px) | iframe preview (center, flex) | Inspector (right, 340px). Sticky header w/ Save/Back/Duplicate.
3. State: single `TemplateConfig` react state in builder page; useMemo derived values.
4. postMessage: debounced (150ms) dispatch to iframe on any config change.
5. Preview page listens `message` events, merges into local config state, forces re-render.
6. Install `@dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`.

## Architecture

### Routes
```
wedding-admin/src/routes.tsx (or wherever router is defined)
  /templates/new/builder         → TemplateBuilderPage (mode=create)
  /templates/edit/:id/builder    → TemplateBuilderPage (mode=edit)
```

### Component tree
```
TemplateBuilderPage
├── BuilderHeader (title, Save, Duplicate, Back)
├── BuilderLayout (3 cols)
│   ├── SectionSidebar        (Phase 05)
│   │   └── SortableSectionList (visible toggle + drag reorder)
│   ├── PreviewFrame
│   │   └── <iframe src={PREVIEW_URL} ref>
│   └── InspectorPanel
│       ├── AssetSlotEditor    (Phase 04, per-section)
│       ├── ColorEditor        (Phase 05)
│       ├── FontEditor         (Phase 05)
│       └── TextEditor         (Phase 05)
└── SaveBar (Phase 06)
```

### postMessage protocol
```ts
// Admin → Preview
interface ConfigUpdateMsg {
  type: 'TEMPLATE_CONFIG_UPDATE';
  config: TemplateConfig;
}
iframeRef.current?.contentWindow?.postMessage(
  { type: 'TEMPLATE_CONFIG_UPDATE', config } satisfies ConfigUpdateMsg,
  PREVIEW_ORIGIN // e.g. 'http://localhost:3000'
);

// Preview → Admin (ready handshake)
interface PreviewReadyMsg { type: 'PREVIEW_READY' }
```

Handshake: preview posts `PREVIEW_READY` on mount; admin queues updates until received.

### Preview page extension
`wedding-web/app/w/preview/[theme]/page.tsx`:
```tsx
const [cfg, setCfg] = useState<TemplateConfig | undefined>();
useEffect(() => {
  const onMsg = (e: MessageEvent) => {
    if (e.data?.type === 'TEMPLATE_CONFIG_UPDATE') setCfg(e.data.config);
  };
  window.addEventListener('message', onMsg);
  window.parent?.postMessage({ type: 'PREVIEW_READY' }, '*');
  return () => window.removeEventListener('message', onMsg);
}, []);
const data = { ...MOCK_DATA, template_config: cfg, template: { ...MOCK_DATA.template, theme_slug: themeSlug } };
```

### Env config
- `VITE_PREVIEW_ORIGIN` env var in wedding-admin → defaults `http://localhost:3000`.

## Related Code Files
- `wedding-admin/src/App.tsx` or `src/main.tsx` — router setup (locate React Router config)
- `wedding-admin/src/pages/templates/TemplateFormPage.tsx` — legacy form (sibling, unchanged)
- `wedding-admin/src/api/template.api.ts` — existing CRUD
- `wedding-web/app/w/preview/[theme]/page.tsx:43-75` — inject postMessage listener

## Implementation Steps
1. `cd wedding-admin && npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`.
2. Add routes in admin router: `/templates/new/builder`, `/templates/edit/:id/builder`.
3. Add "Mở Builder" button on template list + existing TemplateFormPage linking to builder.
4. Create `wedding-admin/src/pages/templates/builder/TemplateBuilderPage.tsx` — top-level state + data fetching.
5. Create `BuilderLayout.tsx`, `BuilderHeader.tsx`, `PreviewFrame.tsx`.
6. Implement `PreviewFrame`: holds ref, listens for PREVIEW_READY, exposes `pushConfig(cfg)` via imperative handle or context.
7. Add `useDebouncedEffect` → call `pushConfig` when state changes.
8. Patch `wedding-web/app/w/preview/[theme]/page.tsx` w/ postMessage listener + handshake.
9. Add `?mode=edit` query support in preview to hide banner.
10. Skeleton Inspector/Sidebar components (stubs for Phases 04–05).

## Todo
- [ ] Install @dnd-kit deps
- [ ] Add builder routes
- [ ] Entry links from list/form page
- [ ] TemplateBuilderPage shell w/ state
- [ ] BuilderLayout 3-col
- [ ] PreviewFrame w/ postMessage bridge
- [ ] Debounced config push
- [ ] Preview page listener + handshake
- [ ] Hide banner when mode=edit
- [ ] Stub Inspector + Sidebar

## Success Criteria
- Open `/templates/new/builder` → 3-col layout renders, iframe loads songphung-red preview.
- Console log `PREVIEW_READY` received.
- Manually calling `pushConfig` w/ modified colors updates iframe live.
- No full iframe reload during edits.

## Risk Assessment
- **CORS / cross-origin postMessage:** must set correct `targetOrigin`. Mitigate: env var.
- **Dev vs prod origins:** env var drift. Mitigate: document in README.
- **Preview page hydration race:** listener may attach after admin sends. Mitigate: handshake queue.
- **Stale config on iframe reload:** admin must resend on `PREVIEW_READY`.

## Security Considerations
- Validate `event.origin` on preview side against allow-list (admin origin).
- Admin side: always pass explicit `targetOrigin`, never `'*'`.
- `/w/preview` is public — acceptable since only MOCK_DATA. Confirm no real data leak.

## Next Steps
→ Phase 04: image slot editor populates Inspector.
