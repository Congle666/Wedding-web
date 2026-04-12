import { Tabs } from 'antd';
import { getPresetsForSlot, resolvePresetUrl, type AssetPreset } from './assetPresets';

interface Props {
  /**
   * Slot key currently active in the inspector. Filters which presets the
   * library shows so admin only sees images that visually fit.
   */
  slotKey: string;
  /**
   * Apply the chosen preset URL to the active slot. Called for click-to-apply
   * (drag-drop is handled via native HTML5 + the preview iframe).
   */
  onPick: (relativeUrl: string) => void;
}

/**
 * Library of preset images for the songphung-red theme. Each thumbnail is:
 *   - clickable        → instant apply to active slot
 *   - HTML5 draggable  → can be dropped onto a slot in the inspector OR
 *                        directly onto the corresponding element inside the
 *                        iframe preview (cross-frame works because we use
 *                        native dataTransfer with `text/x-preset-url`).
 *
 * Phase 1 only ships the hardcoded `Songphung-red` tab. The `Của tôi` tab is
 * a placeholder for the future DB-backed `asset_library` table.
 */
export default function AssetLibrary({ slotKey, onPick }: Props) {
  const presets = getPresetsForSlot(slotKey);

  return (
    <div style={{ marginTop: 4 }}>
      <Tabs
        size="small"
        defaultActiveKey="songphung"
        items={[
          {
            key: 'songphung',
            label: `Songphung-red (${presets.length})`,
            children: <PresetGrid presets={presets} onPick={onPick} />,
          },
          {
            key: 'mine',
            label: 'Của tôi',
            children: (
              <div style={{ color: '#9CA3AF', fontSize: 12, padding: '12px 4px' }}>
                Tính năng thư viện cá nhân sẽ có ở phiên bản tới. Bây giờ anh
                có thể upload ảnh trực tiếp ở khung dưới.
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}

function PresetGrid({
  presets,
  onPick,
}: {
  presets: AssetPreset[];
  onPick: (url: string) => void;
}) {
  if (presets.length === 0) {
    return (
      <div style={{ color: '#9CA3AF', fontSize: 12, padding: '8px 4px' }}>
        Không có ảnh mẫu cho slot này.
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 8,
      }}
    >
      {presets.map((p) => (
        <PresetThumb key={p.url} preset={p} onPick={onPick} />
      ))}
    </div>
  );
}

function PresetThumb({
  preset,
  onPick,
}: {
  preset: AssetPreset;
  onPick: (url: string) => void;
}) {
  /**
   * Native HTML5 drag setup. We attach the relative URL on a custom MIME type
   * `text/x-preset-url` so drop targets (both inside the panel and inside the
   * cross-origin iframe) can recognize this as a preset drop and ignore other
   * drags (e.g. text selections).
   */
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/x-preset-url', preset.url);
    // Also set text/uri-list as a fallback for browsers that strip custom MIMEs
    e.dataTransfer.setData('text/uri-list', resolvePresetUrl(preset.url));
    // Provide a clean drag image (the thumb itself) by letting the browser default fire.
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onPick(preset.url)}
      title={`${preset.label} — bấm để áp dụng, hoặc kéo vào ảnh trong xem trước`}
      style={{
        position: 'relative',
        aspectRatio: '1 / 1',
        border: '1px solid #E5E7EB',
        borderRadius: 6,
        background: '#FAFAFA',
        cursor: 'grab',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      <img
        src={resolvePresetUrl(preset.url)}
        alt={preset.label}
        draggable={false}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          padding: 4,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.7))',
          color: '#fff',
          fontSize: 9,
          padding: '8px 4px 3px',
          textAlign: 'center',
          lineHeight: 1.2,
          pointerEvents: 'none',
        }}
      >
        {preset.label}
      </div>
    </div>
  );
}
