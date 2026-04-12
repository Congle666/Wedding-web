'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

/**
 * Helpers used by songphung-red sections to expose editable slots when the
 * theme is rendered inside the admin builder iframe (`editMode === true`).
 *
 * Click → posts `{ type: 'SLOT_FOCUSED', section, slot }` to the parent
 *         admin window so the inspector panel auto-focuses that slot.
 *
 * Drop  → listens for native HTML5 drop events. When the dropped data has the
 *         `text/x-preset-url` MIME type set by `AssetLibrary` thumbnails it
 *         posts `{ type: 'PRESET_DROPPED', section, slot, url }` so the
 *         admin can apply it to the config.
 */

export interface EditableSlotProps {
  section: string;
  slot: string;
  /** Visual outline style. `inline` keeps element flow; `absolute` overlays. */
  variant?: 'inline' | 'absolute';
  /** Optional click hint shown on hover. */
  hint?: string;
  children: ReactNode;
  /** Additional style merged onto the wrapper. */
  style?: CSSProperties;
}

/**
 * Emit a SLOT_FOCUSED message to the admin parent. Safe no-op if not in iframe.
 */
export function emitSlotFocused(section: string, slot: string) {
  try {
    if (typeof window === 'undefined') return;
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        { type: 'SLOT_FOCUSED', section, slot },
        '*' // origin verified by admin listener
      );
    }
  } catch {}
}

/**
 * Emit a PRESET_DROPPED message after a successful HTML5 drop.
 */
function emitPresetDropped(section: string, slot: string, url: string) {
  try {
    if (typeof window === 'undefined') return;
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        { type: 'PRESET_DROPPED', section, slot, url },
        '*'
      );
    }
  } catch {}
}

/**
 * Wrap an editable region with edit-mode affordances. When `editMode` is
 * false this is a transparent passthrough — zero overhead in production.
 */
export function EditableSlot({
  section,
  slot,
  variant = 'inline',
  hint,
  children,
  style,
  editMode,
}: EditableSlotProps & { editMode: boolean }) {
  if (!editMode) {
    return <>{children}</>;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    emitSlotFocused(section, slot);
  };

  const handleDragOver = (e: React.DragEvent) => {
    // Required to enable drop events.
    if (e.dataTransfer.types.includes('text/x-preset-url')) {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'copy';
      (e.currentTarget as HTMLElement).classList.add('sp-edit-drop-hover');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).classList.remove('sp-edit-drop-hover');
  };

  const handleDrop = (e: React.DragEvent) => {
    const url = e.dataTransfer.getData('text/x-preset-url');
    (e.currentTarget as HTMLElement).classList.remove('sp-edit-drop-hover');
    if (!url) return;
    e.preventDefault();
    e.stopPropagation();
    emitPresetDropped(section, slot, url);
  };

  const baseStyle: CSSProperties = {
    position: variant === 'absolute' ? 'absolute' : 'relative',
    cursor: 'pointer',
    outline: '1px dashed transparent',
    outlineOffset: 2,
    transition: 'outline-color 0.15s, background-color 0.15s',
    ...style,
  };

  return (
    <div
      data-edit-section={section}
      data-edit-slot={slot}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="sp-editable-slot"
      title={hint || `Bấm để chỉnh ${slot}`}
      style={baseStyle}
    >
      {children}
    </div>
  );
}

/**
 * Inline text editing affordance. When `editMode` is false this renders the
 * `defaultValue` (or fallback text) inside the supplied tag with no overhead.
 *
 * When `editMode` is true:
 *   - Element becomes `contentEditable="plaintext-only"` (browser strips HTML)
 *   - Hover shows a dashed outline + "click to edit" affordance
 *   - Enter key blurs the field (single-line only — multi-line not supported)
 *   - On blur, posts `{ type: 'TEXT_EDITED', section, slot, value }` to admin
 *   - Reads `textContent` only — never `innerHTML` — to prevent script injection
 *
 * IMPORTANT: framer-motion parents wrapping `EditableText` must set
 * `layout={false}` to prevent caret loss on re-renders.
 */
export interface EditableTextProps {
  section: string;
  slot: string;
  /** Current text value (controlled by cfg.text_samples). */
  value: string;
  /** Fallback text shown when value is empty. */
  fallback?: string;
  editMode?: boolean;
  /** HTML tag to render. Defaults to `span` so the editor stays inline. */
  as?: keyof JSX.IntrinsicElements;
  style?: CSSProperties;
  className?: string;
}

function emitTextEdited(section: string, slot: string, value: string) {
  try {
    if (typeof window === 'undefined') return;
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(
        { type: 'TEXT_EDITED', section, slot, value },
        '*'
      );
    }
  } catch {}
}

export function EditableText({
  section,
  slot,
  value,
  fallback = '',
  editMode = false,
  as = 'span',
  style,
  className,
}: EditableTextProps) {
  const ref = useRef<HTMLElement | null>(null);
  const initialRef = useRef<string>(value || fallback);

  // When the controlled value changes from outside (e.g. another save) AND
  // the element is not currently focused, sync the DOM textContent to the
  // new value. Avoids overwriting the user's in-progress edit.
  useEffect(() => {
    if (!editMode) return;
    const el = ref.current;
    if (!el) return;
    if (document.activeElement === el) return;
    const incoming = value || fallback || '';
    if (el.textContent !== incoming) {
      el.textContent = incoming;
    }
  }, [value, fallback, editMode]);

  if (!editMode) {
    const Tag = as as any;
    return (
      <Tag style={style} className={className}>
        {value || fallback}
      </Tag>
    );
  }

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    const next = (e.currentTarget.textContent || '').trim();
    if (next === initialRef.current) return;
    initialRef.current = next;
    emitTextEdited(section, slot, next);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    // Single-line only — Enter blurs to commit edit
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.currentTarget as HTMLElement).blur();
    }
    // Block any control combos that might paste rich content
    if (e.key === 'b' && (e.ctrlKey || e.metaKey)) e.preventDefault();
    if (e.key === 'i' && (e.ctrlKey || e.metaKey)) e.preventDefault();
    if (e.key === 'u' && (e.ctrlKey || e.metaKey)) e.preventDefault();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain').replace(/\s+/g, ' ').trim();
    document.execCommand('insertText', false, text);
  };

  const handleClick = (e: React.MouseEvent) => {
    // Stop click bubbling so it doesn't fire SLOT_FOCUSED on parent EditableSlot
    e.stopPropagation();
  };

  const Tag = as as any;
  return (
    <Tag
      ref={ref as any}
      contentEditable="plaintext-only"
      suppressContentEditableWarning
      data-edit-section={section}
      data-edit-slot={slot}
      data-editable-text="true"
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onClick={handleClick}
      spellCheck={false}
      style={{
        outline: '1px dashed transparent',
        outlineOffset: 2,
        cursor: 'text',
        transition: 'outline-color 0.15s, background-color 0.15s',
        ...style,
      }}
      className={className}
      title={`Bấm để sửa "${slot}"`}
    >
      {value || fallback}
    </Tag>
  );
}

/**
 * Floating banner displayed at the top of the preview iframe when edit mode
 * is active. Tells the admin which interactions are available.
 */
export function EditModeBanner() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9998,
        background: 'rgba(139, 26, 26, 0.95)',
        color: '#fff',
        padding: '6px 12px',
        fontSize: 11,
        fontFamily: '-apple-system, "Be Vietnam Pro", sans-serif',
        textAlign: 'center',
        pointerEvents: 'none',
        backdropFilter: 'blur(2px)',
      }}
    >
      Chế độ chỉnh sửa: bấm ảnh để chọn slot · kéo thả ảnh từ thư viện vào đây · double-click chữ để sửa
    </div>
  );
}

/**
 * Global stylesheet for edit-mode affordances. Mounted once at the theme
 * root when `editMode` is true.
 */
export function EditModeStyles() {
  return (
    <style>{`
      .sp-editable-slot:hover {
        outline-color: rgba(139, 26, 26, 0.6) !important;
        background-color: rgba(139, 26, 26, 0.04);
      }
      .sp-edit-drop-hover {
        outline: 2px solid #8B1A1A !important;
        background-color: rgba(139, 26, 26, 0.12) !important;
      }
      .sp-editable-slot::after {
        content: attr(data-edit-slot);
        position: absolute;
        top: 4px;
        left: 4px;
        background: #8B1A1A;
        color: #fff !important;
        font-size: 10px !important;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif !important;
        font-style: normal !important;
        font-weight: 600 !important;
        letter-spacing: 0 !important;
        text-transform: lowercase !important;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.15s;
        z-index: 999;
        white-space: nowrap;
      }
      .sp-editable-slot:hover::after {
        opacity: 1;
      }

      [data-editable-text="true"]:hover {
        outline-color: rgba(139, 26, 26, 0.6) !important;
        background-color: rgba(139, 26, 26, 0.06);
      }
      [data-editable-text="true"]:focus {
        outline: 2px solid #8B1A1A !important;
        background-color: rgba(255, 255, 255, 0.85) !important;
      }
    `}</style>
  );
}
