import { useState, type ReactNode } from 'react';

interface Props {
  /**
   * Stable id used by the parent to recover which slot received a drop.
   * Format: `slot:<sectionKey>:<slotKey>` — passed back to `onDrop` parsed.
   */
  id: string;
  /**
   * Called with the dropped preset URL when the admin drops a thumbnail
   * from `AssetLibrary` onto this slot. Drops without the
   * `text/x-preset-url` MIME type are ignored.
   */
  onPresetDrop: (slotId: string, url: string) => void;
  children: ReactNode;
}

/**
 * Wraps a slot's `ImageUpload` so that preset thumbnails dragged from
 * `AssetLibrary` (HTML5 native drag) can be dropped onto it. Highlights the
 * dropzone with an outline + badge while a compatible drag is hovering.
 *
 * Uses native HTML5 drag-and-drop (NOT @dnd-kit) so the same drop semantics
 * also work cross-iframe — the songphung-red theme uses identical handlers
 * inside the preview iframe via `editModeHelpers.tsx`.
 */
export default function SlotDropTarget({ id, onPresetDrop, children }: Props) {
  const [hover, setHover] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes('text/x-preset-url')) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    if (!hover) setHover(true);
  };

  const handleDragLeave = () => {
    setHover(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    setHover(false);
    const url = e.dataTransfer.getData('text/x-preset-url');
    if (!url) return;
    e.preventDefault();
    e.stopPropagation();
    onPresetDrop(id, url);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        position: 'relative',
        borderRadius: 8,
        outline: hover ? '2px solid #8B1A1A' : '2px solid transparent',
        outlineOffset: 2,
        transition: 'outline-color 0.15s',
        background: hover ? 'rgba(139,26,26,0.04)' : 'transparent',
      }}
    >
      {children}
      {hover && (
        <div
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            background: '#8B1A1A',
            color: '#fff',
            fontSize: 11,
            padding: '2px 8px',
            borderRadius: 10,
            pointerEvents: 'none',
            fontWeight: 600,
            zIndex: 5,
          }}
        >
          Thả ảnh vào đây
        </div>
      )}
    </div>
  );
}
