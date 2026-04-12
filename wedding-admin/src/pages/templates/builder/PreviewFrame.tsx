import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { TemplateConfig } from '../../../types/templateConfig';
import { buildPreviewUrl, PREVIEW_ORIGIN } from './constants';

export interface PreviewFrameHandle {
  /** Push a config update to the iframe (debounced upstream). */
  pushConfig: (config: TemplateConfig) => void;
}

export interface SlotFocusEvent {
  section: string;
  slot: string;
}

export interface PresetDropEvent {
  section: string;
  slot: string;
  url: string;
}

export interface TextEditEvent {
  section: string;
  slot: string;
  value: string;
}

interface Props {
  themeSlug?: string;
  /**
   * Fired when the admin clicks on an editable element inside the iframe
   * (e.g. the phoenix image). The builder uses this to auto-focus the
   * matching inspector slot.
   */
  onSlotFocus?: (e: SlotFocusEvent) => void;
  /**
   * Fired when the admin drops a preset thumbnail onto an editable element
   * inside the iframe. The dropped URL gets applied to the slot's config.
   */
  onPresetDrop?: (e: PresetDropEvent) => void;
  /**
   * Fired when the admin commits an inline text edit (blur/Enter) on a
   * text element inside the iframe (e.g. section title, invitation greeting).
   */
  onTextEdit?: (e: TextEditEvent) => void;
}

/**
 * Hosts the wedding-web preview in an iframe and handles bidirectional
 * postMessage with the preview page. Messages handled:
 *   - PREVIEW_READY     ← from preview, marks ready + flushes buffered config
 *   - SLOT_FOCUSED      ← from preview, fires `onSlotFocus`
 *   - PRESET_DROPPED    ← from preview, fires `onPresetDrop`
 *   - TEMPLATE_CONFIG_UPDATE → to preview, push live config changes
 */
const PreviewFrame = forwardRef<PreviewFrameHandle, Props>(function PreviewFrame(
  { themeSlug = 'songphung-red', onSlotFocus, onPresetDrop, onTextEdit },
  ref
) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [ready, setReady] = useState(false);
  const pendingRef = useRef<TemplateConfig | null>(null);
  const readyRef = useRef(false);

  // Stash callback refs so the message listener doesn't capture stale closures
  // every time the parent re-renders.
  const focusRef = useRef(onSlotFocus);
  const dropRef = useRef(onPresetDrop);
  const textEditRef = useRef(onTextEdit);
  focusRef.current = onSlotFocus;
  dropRef.current = onPresetDrop;
  textEditRef.current = onTextEdit;

  const previewUrl = buildPreviewUrl(themeSlug);

  useImperativeHandle(
    ref,
    () => ({
      pushConfig(config: TemplateConfig) {
        if (!readyRef.current) {
          pendingRef.current = config;
          return;
        }
        const frame = iframeRef.current;
        if (!frame?.contentWindow) return;
        try {
          frame.contentWindow.postMessage(
            { type: 'TEMPLATE_CONFIG_UPDATE', config },
            PREVIEW_ORIGIN
          );
        } catch (err) {
          console.warn('pushConfig failed', err);
        }
      },
    }),
    []
  );

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== PREVIEW_ORIGIN) return;
      const data = event.data;
      if (!data || typeof data !== 'object') return;

      switch (data.type) {
        case 'PREVIEW_READY': {
          readyRef.current = true;
          setReady(true);
          if (pendingRef.current) {
            const frame = iframeRef.current;
            if (frame?.contentWindow) {
              frame.contentWindow.postMessage(
                { type: 'TEMPLATE_CONFIG_UPDATE', config: pendingRef.current },
                PREVIEW_ORIGIN
              );
            }
            pendingRef.current = null;
          }
          break;
        }
        case 'SLOT_FOCUSED': {
          if (typeof data.section === 'string' && typeof data.slot === 'string') {
            focusRef.current?.({ section: data.section, slot: data.slot });
          }
          break;
        }
        case 'PRESET_DROPPED': {
          if (
            typeof data.section === 'string' &&
            typeof data.slot === 'string' &&
            typeof data.url === 'string'
          ) {
            dropRef.current?.({ section: data.section, slot: data.slot, url: data.url });
          }
          break;
        }
        case 'TEXT_EDITED': {
          if (
            typeof data.section === 'string' &&
            typeof data.slot === 'string' &&
            typeof data.value === 'string'
          ) {
            textEditRef.current?.({
              section: data.section,
              slot: data.slot,
              value: data.value,
            });
          }
          break;
        }
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#F3F4F6',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
      }}
    >
      {!ready && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9CA3AF',
            fontSize: 14,
            zIndex: 1,
            pointerEvents: 'none',
          }}
        >
          Đang tải bản xem trước...
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={previewUrl}
        title="Xem trước mẫu thiệp"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          background: '#fff',
          display: 'block',
        }}
      />
    </div>
  );
});

export default PreviewFrame;
