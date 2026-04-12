# Phase 04 — Image Slot Editor

## Context
- Parent: [plan.md](./plan.md)
- Depends on: [phase-03](./phase-03-builder-shell-and-preview.md)
- Related: `wedding-admin/src/components/ui/ImageUpload.tsx`, existing `/api/admin/upload`

## Overview
- **Date:** 2026-04-08
- **Description:** Slot-based drag-drop / click-to-upload editor for all configurable assets. Each slot maps to canonical key in `TemplateConfig.assets.*`. Reuses existing ImageUpload.
- **Priority:** High
- **Implementation Status:** Not Started
- **Review Status:** Pending

## Key Insights
- `ImageUpload` already exists in admin (used by TemplateFormPage.tsx:7). Handles upload to `/api/admin/upload` → returns URL.
- Drop target may be the section card directly or a "drop here" overlay. Use `@dnd-kit` for intra-inspector drag (e.g. rearrange gallery images). Clicks + file input remain primary interaction.
- Music file = separate slot (audio), needs different upload handler or extended validation; reuse same endpoint if it supports audio mimetypes (verify).
- Gallery = dynamic list of images — needs add/remove/reorder.

## Requirements
1. Canonical slot registry file w/ type, dimensions, accept mimetypes, default URL.
2. Reusable `<AssetSlot>` component: renders thumbnail, upload trigger, clear button, drag handle for gallery items.
3. Slot groups collapsible per section in Inspector.
4. Gallery slot: multi-upload, sortable via `@dnd-kit/sortable`.
5. Music slot: single audio file, mp3/ogg, size ≤ 5MB (proposed).
6. Clear → resets to default URL (not empty — ensures theme still renders).

## Architecture

### Slot registry
```ts
// wedding-admin/src/pages/templates/builder/slots/slotRegistry.ts
export interface SlotDef {
  section: SectionKey;
  key: string;              // e.g. 'phoenix_left'
  label: string;            // VI label
  accept: string;           // 'image/*' | 'audio/*'
  recommendedDims?: string; // '400x600'
  defaultUrl: string;       // from DEFAULT_SONGPHUNG_RED
  multi?: boolean;          // gallery
}

export const SLOT_REGISTRY: SlotDef[] = [
  { section:'cover', key:'phoenix_left',  label:'Phượng trái',  accept:'image/*', recommendedDims:'400x800', defaultUrl:'/themes/songphung-red/phoenix.webp' },
  { section:'cover', key:'phoenix_right', label:'Phượng phải',  accept:'image/*', recommendedDims:'400x800', defaultUrl:'/themes/songphung-red/phoenix.webp' },
  { section:'cover', key:'flower_tl',     label:'Hoa trên trái',accept:'image/*', recommendedDims:'300x300', defaultUrl:'/themes/songphung-red/flower.webp' },
  { section:'cover', key:'flower_br',     label:'Hoa dưới phải',accept:'image/*', recommendedDims:'300x300', defaultUrl:'/themes/songphung-red/flower.webp' },
  { section:'cover', key:'chu_hy',        label:'Chữ Hỷ',       accept:'image/*', recommendedDims:'200x200', defaultUrl:'/themes/songphung-red/chu-hy.webp' },
  { section:'cover', key:'paper_bg',      label:'Nền giấy',     accept:'image/*', recommendedDims:'800x800', defaultUrl:'/themes/songphung-red/paper-bg.jpg' },
  { section:'hero',  key:'phoenix_left',  label:'Phượng trái',  accept:'image/*', defaultUrl:'/themes/songphung-red/phoenix.webp' },
  { section:'hero',  key:'phoenix_right', label:'Phượng phải',  accept:'image/*', defaultUrl:'/themes/songphung-red/phoenix.webp' },
  { section:'hero',  key:'chu_hy',        label:'Chữ Hỷ',       accept:'image/*', defaultUrl:'/themes/songphung-red/chu-hy.webp' },
  { section:'family',key:'flower',        label:'Hoa trang trí',accept:'image/*', defaultUrl:'/themes/songphung-red/flower.webp' },
  { section:'family',key:'groom_photo',   label:'Ảnh chú rể',   accept:'image/*', recommendedDims:'600x800', defaultUrl:'' },
  { section:'family',key:'bride_photo',   label:'Ảnh cô dâu',   accept:'image/*', recommendedDims:'600x800', defaultUrl:'' },
  { section:'gallery',key:'images',       label:'Album',        accept:'image/*', multi:true, defaultUrl:'' },
  { section:'global',key:'music_url',     label:'Nhạc nền',     accept:'audio/mpeg,audio/ogg', defaultUrl:'/themes/songphung-red/music.mp3' },
  // + bank, footer, ceremony decor...
];
```

### `<AssetSlot>` component
```tsx
<AssetSlot
  def={slotDef}
  value={cfg.assets[section]?.[key]}
  onChange={(url) => updateAsset(section, key, url)}
  onClear={() => updateAsset(section, key, def.defaultUrl)}
/>
```
Renders: thumbnail (img or audio `<audio controls>`), upload button (opens ImageUpload), reset.

### Gallery slot (multi)
```tsx
<SortableContext items={galleryImages} strategy={rectSortingStrategy}>
  {galleryImages.map(url => <SortableImage key={url} url={url} onRemove={...} />)}
  <AddImageButton onUpload={...} />
</SortableContext>
```

## Related Code Files
- `wedding-admin/src/components/ui/ImageUpload.tsx` — reuse for file picker
- `wedding-admin/src/api/axios.ts` or upload util — existing upload endpoint
- `handlers/upload_handler.go` — verify audio mimetype support
- `wedding-admin/src/pages/templates/builder/InspectorPanel.tsx` — Phase 03 shell

## Implementation Steps
1. Author `slotRegistry.ts` w/ full list mirroring `DEFAULT_SONGPHUNG_RED.assets`.
2. Create `AssetSlot.tsx` — single-image slot w/ ImageUpload, thumbnail, clear.
3. Create `AudioSlot.tsx` — for music.
4. Create `GallerySlot.tsx` — multi-upload + dnd-kit sortable.
5. Create `SectionAssetGroup.tsx` — collapsible per-section grouping; iterates registry filtered by section.
6. Wire into `InspectorPanel`: for each visible section, render `SectionAssetGroup`.
7. Update handler: on change, patch `cfg.assets[section][key] = url`, bubble up to builder state → triggers postMessage.
8. Verify `/api/admin/upload` accepts `audio/*`. If not, extend handler (allow-list mimetypes).

## Todo
- [ ] slotRegistry.ts
- [ ] AssetSlot component
- [ ] AudioSlot component
- [ ] GallerySlot w/ sortable
- [ ] SectionAssetGroup
- [ ] Inspector integration
- [ ] Verify audio upload
- [ ] Test: upload phoenix → iframe updates live

## Success Criteria
- Upload new phoenix image in cover slot → iframe cover phoenix swaps within <300ms.
- Clear button returns to default.
- Gallery: upload 3 images, drag reorder → iframe reflects new order.
- Upload mp3 → iframe music toggle plays new track on "Mở thiệp".

## Risk Assessment
- **Upload endpoint audio support:** unknown. Mitigate: verify first, else extend.
- **Image file size:** uncapped could bloat template JSON (only stores URL, safe — actual file in uploads dir).
- **Stale cache:** overwritten filenames may cache. Mitigate: cache-bust w/ `?v=timestamp` appended URL, or force unique filename on upload (probably already done).

## Security Considerations
- Validate URL prefix stored in config (`/uploads/` or `/themes/`) — enforced in Phase 01 validator.
- Upload endpoint must enforce mimetype + size cap server-side (reject executables).
- Filename sanitization on upload (existing endpoint should handle).

## Next Steps
→ Phase 05: color/font/text/visibility/reorder editors.
