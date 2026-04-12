import { useEffect, useRef } from 'react';
import { Input } from 'antd';
import ImageUpload from '../../../components/ui/ImageUpload';
import type { TemplateConfig, SectionKey } from '../../../types/templateConfig';
import { SLOT_REGISTRY } from './slotRegistry';
import GallerySlotEditor from './GallerySlotEditor';
import AssetLibrary from './AssetLibrary';
import SlotDropTarget from './SlotDropTarget';

interface Props {
  section: SectionKey;
  config: TemplateConfig;
  onChange: (patch: Partial<TemplateConfig> | ((prev: TemplateConfig) => TemplateConfig)) => void;
  /** Lifted state — the slot key currently focused in the inspector. */
  activeSlotKey: string;
  /** Setter to update the focused slot (also called by iframe SLOT_FOCUSED). */
  onActiveSlotChange: (slotKey: string) => void;
}

/**
 * Lists every asset slot of the selected section. Each slot supports THREE
 * input methods, all using native HTML5 drag-and-drop:
 *   1. Click a preset in the AssetLibrary below → instant apply
 *   2. Drag a preset thumbnail → drop onto a slot tile
 *   3. Drag a preset thumbnail → drop directly onto the matching element in
 *      the iframe preview (handled by editModeHelpers in the theme)
 *
 * Native HTML5 drag was chosen over @dnd-kit because pointer-based libraries
 * cannot dispatch events across iframe origins, while `dataTransfer` does.
 */
export default function AssetSlotEditor({
  section,
  config,
  onChange,
  activeSlotKey,
  onActiveSlotChange,
}: Props) {
  const slots = SLOT_REGISTRY[section] || [];
  const globalSlots = section === 'cover' ? SLOT_REGISTRY.global : [];
  const containerRef = useRef<HTMLDivElement | null>(null);

  // When the parent (e.g. iframe SLOT_FOCUSED) changes the active slot,
  // scroll the matching slot row into view inside the inspector panel.
  useEffect(() => {
    if (!activeSlotKey || !containerRef.current) return;
    const target = containerRef.current.querySelector<HTMLElement>(
      `[data-slot-row="${activeSlotKey}"]`
    );
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeSlotKey]);

  const applyToSlot = (sectionKey: string, slotKey: string, url: string) => {
    onChange((prev) => {
      const sectionAssets = (prev.assets as any)[sectionKey] || {};
      return {
        ...prev,
        assets: {
          ...prev.assets,
          [sectionKey]: {
            ...sectionAssets,
            [slotKey]: url || undefined,
          },
        },
      };
    });
  };

  const readSlot = (sectionKey: string, slotKey: string): string => {
    const v = (config.assets as any)?.[sectionKey]?.[slotKey];
    return typeof v === 'string' ? v : '';
  };

  // SlotDropTarget callback — parses `slot:section:slotKey` id back into parts.
  const handlePresetDrop = (slotId: string, url: string) => {
    const [, sectionKey, slotKey] = slotId.split(':');
    if (!sectionKey || !slotKey) return;
    applyToSlot(sectionKey, slotKey, url);
  };

  // Click-to-apply target: the slot the admin most recently focused.
  const handlePresetPick = (url: string) => {
    if (!activeSlotKey) return;
    const slot = slots.find((s) => s.slotKey === activeSlotKey);
    const targetSection = slot ? (slot.section as string) : section;
    applyToSlot(targetSection, activeSlotKey, url);
  };

  if (section === 'gallery') {
    return <GallerySlotEditor config={config} onChange={onChange} />;
  }

  if (slots.length === 0 && globalSlots.length === 0) {
    return (
      <div style={{ color: '#9CA3AF', fontSize: 13, padding: '16px 4px' }}>
        Phần này không có ảnh để tùy chỉnh. Bạn có thể đổi màu / font / chữ ở các tab khác.
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* === SLOTS === */}
      {slots.map((slot) => {
        const dropId = `slot:${slot.section}:${slot.slotKey}`;
        const isActive = activeSlotKey === slot.slotKey;
        return (
          <div
            key={dropId}
            data-slot-row={slot.slotKey}
            onClick={() => onActiveSlotChange(slot.slotKey)}
            style={{ cursor: 'pointer' }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: isActive ? '#8B1A1A' : '#1A1A1A',
                marginBottom: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {isActive && <span style={{ color: '#8B1A1A' }}>●</span>}
              {slot.label}
              {slot.aspect && (
                <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 400 }}>
                  ({slot.aspect})
                </span>
              )}
            </div>
            <SlotDropTarget id={dropId} onPresetDrop={handlePresetDrop}>
              <ImageUpload
                value={readSlot(slot.section as string, slot.slotKey)}
                onChange={(url) => applyToSlot(slot.section as string, slot.slotKey, url)}
                hint={slot.hint || 'JPG, PNG, WebP. Tối đa 5MB'}
              />
            </SlotDropTarget>
          </div>
        );
      })}

      {/* === GLOBAL SLOTS (cover screen only) === */}
      {globalSlots.length > 0 && (
        <>
          <div style={{ borderTop: '1px dashed #E5E7EB', margin: '8px 0 4px' }} />
          <div
            style={{
              fontSize: 12,
              color: '#9CA3AF',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Tài nguyên chung
          </div>
          {globalSlots.map((slot) => (
            <div key={`global-${slot.slotKey}`}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 6 }}>
                {slot.label}
              </div>
              <Input
                value={readSlot('global', slot.slotKey)}
                onChange={(e) => applyToSlot('global', slot.slotKey, e.target.value)}
                placeholder="/uploads/music.mp3"
              />
              {slot.hint && (
                <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{slot.hint}</p>
              )}
            </div>
          ))}
        </>
      )}

      {/* === ASSET LIBRARY === */}
      <div
        style={{
          marginTop: 8,
          paddingTop: 12,
          borderTop: '1px solid #E5E7EB',
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: '#9CA3AF',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>Thư viện ảnh mẫu</span>
          <span style={{ textTransform: 'none', fontSize: 11, color: '#9CA3AF' }}>
            Bấm hoặc kéo thả vào ảnh trong xem trước
          </span>
        </div>
        <AssetLibrary slotKey={activeSlotKey} onPick={handlePresetPick} />
      </div>
    </div>
  );
}
