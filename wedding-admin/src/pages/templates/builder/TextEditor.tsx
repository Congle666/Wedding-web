import { Input } from 'antd';
import type { TemplateConfig, SectionKey } from '../../../types/templateConfig';

interface Props {
  section: SectionKey;
  config: TemplateConfig;
  onChange: (patch: Partial<TemplateConfig> | ((prev: TemplateConfig) => TemplateConfig)) => void;
}

interface TextFieldDef {
  key: string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
}

/**
 * Registry of text fields exposed per section. Only the sections that actually
 * carry configurable text show fields here; the rest render an empty-state.
 */
const TEXT_REGISTRY: Partial<Record<SectionKey, TextFieldDef[]>> = {
  cover: [
    { key: 'invitation_greeting', label: 'Lời chào mời', placeholder: 'Trân trọng kính mời' },
    { key: 'invitation_subtext',  label: 'Phụ đề',        placeholder: 'Đến dự lễ thành hôn của chúng tôi' },
    { key: 'button_label',        label: 'Nhãn nút mở',   placeholder: 'Mở thiệp mời' },
  ],
  hero: [
    { key: 'subtitle', label: 'Phụ đề hero', placeholder: 'Save the date' },
  ],
  family:   [{ key: 'section_title', label: 'Tiêu đề section', placeholder: 'Thành hôn' }],
  ceremony: [{ key: 'section_title', label: 'Tiêu đề section', placeholder: 'Lễ cưới' }],
  gallery:  [{ key: 'section_title', label: 'Tiêu đề section', placeholder: 'Khoảnh khắc' }],
  wishes:   [{ key: 'section_title', label: 'Tiêu đề section', placeholder: 'Sổ lưu bút' }],
  bank:     [{ key: 'section_title', label: 'Tiêu đề section', placeholder: 'Hộp mừng cưới' }],
};

export default function TextEditor({ section, config, onChange }: Props) {
  const fields = TEXT_REGISTRY[section] || [];

  if (fields.length === 0) {
    return (
      <div style={{ color: '#9CA3AF', fontSize: 13, padding: '16px 4px' }}>
        Section này không có văn bản mẫu để chỉnh sửa.
      </div>
    );
  }

  const read = (key: string): string => {
    const v = (config.text_samples as any)?.[section]?.[key];
    return typeof v === 'string' ? v : '';
  };

  const write = (key: string, value: string) => {
    onChange((prev) => {
      const current = (prev.text_samples as any)[section] || {};
      return {
        ...prev,
        text_samples: {
          ...prev.text_samples,
          [section]: { ...current, [key]: value },
        },
      };
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {fields.map((f) => (
        <div key={f.key}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 }}>
            {f.label}
          </div>
          {f.multiline ? (
            <Input.TextArea
              rows={3}
              value={read(f.key)}
              placeholder={f.placeholder}
              onChange={(e) => write(f.key, e.target.value)}
            />
          ) : (
            <Input
              value={read(f.key)}
              placeholder={f.placeholder}
              onChange={(e) => write(f.key, e.target.value)}
            />
          )}
        </div>
      ))}
    </div>
  );
}
