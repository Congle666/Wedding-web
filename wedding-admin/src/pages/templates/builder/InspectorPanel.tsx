import { Tabs } from 'antd';
import type { TemplateConfig, SectionKey } from '../../../types/templateConfig';
import { SECTION_META } from './constants';
import AssetSlotEditor from './AssetSlotEditor';
import StyleEditor from './StyleEditor';
import TextEditor from './TextEditor';

interface Props {
  section: SectionKey;
  config: TemplateConfig;
  onChange: (patch: Partial<TemplateConfig> | ((prev: TemplateConfig) => TemplateConfig)) => void;
  /** Lifted state — slot key currently focused. */
  activeSlotKey: string;
  onActiveSlotChange: (slotKey: string) => void;
}

/**
 * Right-column inspector. Three tabs:
 *   - Ảnh: drag/drop + URL upload for asset slots of the active section
 *   - Chữ: text samples for the active section (titles, captions)
 *   - Màu/Font: global colors + fonts (applies across all sections)
 */
export default function InspectorPanel({
  section,
  config,
  onChange,
  activeSlotKey,
  onActiveSlotChange,
}: Props) {
  const sectionLabel = SECTION_META[section]?.label || section;

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            fontSize: 12,
            color: '#9CA3AF',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          Đang chỉnh sửa
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A' }}>{sectionLabel}</div>
      </div>
      <Tabs
        defaultActiveKey="assets"
        items={[
          {
            key: 'assets',
            label: 'Ảnh',
            children: (
              <AssetSlotEditor
                section={section}
                config={config}
                onChange={onChange}
                activeSlotKey={activeSlotKey}
                onActiveSlotChange={onActiveSlotChange}
              />
            ),
          },
          {
            key: 'text',
            label: 'Chữ',
            children: <TextEditor section={section} config={config} onChange={onChange} />,
          },
          {
            key: 'style',
            label: 'Màu / Font',
            children: <StyleEditor config={config} onChange={onChange} />,
          },
        ]}
      />
    </div>
  );
}
