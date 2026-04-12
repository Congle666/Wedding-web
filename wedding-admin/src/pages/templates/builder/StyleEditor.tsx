import { ColorPicker, Select } from 'antd';
import type { Color } from 'antd/es/color-picker';
import type { TemplateConfig } from '../../../types/templateConfig';

interface Props {
  config: TemplateConfig;
  onChange: (patch: Partial<TemplateConfig> | ((prev: TemplateConfig) => TemplateConfig)) => void;
}

const HEADING_FONTS: string[] = [
  'Cormorant Garamond',
  'Playfair Display',
  'Great Vibes',
  'Italiana',
  'Cinzel',
  'DM Serif Display',
  'EB Garamond',
  'Libre Baskerville',
];

const BODY_FONTS: string[] = [
  'Be Vietnam Pro',
  'Inter',
  'Nunito',
  'Montserrat',
  'Poppins',
  'Roboto',
  'Open Sans',
];

/**
 * Global style editor — colors + fonts apply to the entire theme (all sections
 * read via CSS variables or font family strings pushed through `cfg`).
 */
export default function StyleEditor({ config, onChange }: Props) {
  const setColor = (key: keyof TemplateConfig['colors']) => (c: Color) => {
    const hex = c.toHexString();
    onChange((prev) => ({ ...prev, colors: { ...prev.colors, [key]: hex } }));
  };

  const setFont = (key: keyof TemplateConfig['fonts']) => (value: string) => {
    onChange((prev) => ({ ...prev, fonts: { ...prev.fonts, [key]: value } }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <div style={{ fontSize: 12, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
          Màu sắc
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <ColorRow label="Màu chủ đạo"  value={config.colors.primary}    onChange={setColor('primary')}    />
          <ColorRow label="Nền thiệp"    value={config.colors.background} onChange={setColor('background')} />
          <ColorRow label="Màu chữ"      value={config.colors.text}       onChange={setColor('text')}       />
          <ColorRow label="Màu phụ"      value={config.colors.accent}     onChange={setColor('accent')}     />
        </div>
      </div>

      <div>
        <div style={{ fontSize: 12, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
          Font chữ
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <div style={{ fontSize: 13, color: '#374151', marginBottom: 4 }}>Font tiêu đề</div>
            <Select
              value={config.fonts.heading}
              onChange={setFont('heading')}
              style={{ width: '100%' }}
              options={HEADING_FONTS.map((f) => ({ value: f, label: f }))}
              showSearch
            />
          </div>
          <div>
            <div style={{ fontSize: 13, color: '#374151', marginBottom: 4 }}>Font nội dung</div>
            <Select
              value={config.fonts.body}
              onChange={setFont('body')}
              style={{ width: '100%' }}
              options={BODY_FONTS.map((f) => ({ value: f, label: f }))}
              showSearch
            />
          </div>
        </div>
        <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 8 }}>
          Font được tải động từ Google Fonts khi preview cập nhật.
        </p>
      </div>
    </div>
  );
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (c: Color) => void;
}) {
  return (
    <div>
      <div style={{ fontSize: 12, color: '#6B6B6B', marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <ColorPicker value={value} onChange={onChange} size="small" showText />
      </div>
    </div>
  );
}
