import { ColorPicker, Select, Input } from 'antd';
import type { Color } from 'antd/es/color-picker';
import type { GlobalStyles } from '../../../types/builderConfig';

interface Props {
  globalStyles: GlobalStyles;
  onChange: (styles: GlobalStyles) => void;
}

const HEADING_FONTS = [
  'Cormorant Garamond', 'Playfair Display', 'Great Vibes',
  'Italiana', 'Cinzel', 'DM Serif Display', 'EB Garamond', 'Libre Baskerville',
];
const BODY_FONTS = [
  'Be Vietnam Pro', 'Inter', 'Nunito', 'Montserrat', 'Poppins', 'Roboto', 'Open Sans',
];

export default function GlobalStylesPanel({ globalStyles, onChange }: Props) {
  const setColor = (key: keyof GlobalStyles['colors']) => (c: Color) => {
    onChange({ ...globalStyles, colors: { ...globalStyles.colors, [key]: c.toHexString() } });
  };

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h3 style={{ fontSize: 13, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: 0.5, margin: 0 }}>
        Kiểu dáng chung
      </h3>

      <div>
        <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 8 }}>Màu sắc</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <ColorRow label="Chủ đạo" value={globalStyles.colors.primary} onChange={setColor('primary')} />
          <ColorRow label="Nền" value={globalStyles.colors.background} onChange={setColor('background')} />
          <ColorRow label="Chữ" value={globalStyles.colors.text} onChange={setColor('text')} />
          <ColorRow label="Phụ" value={globalStyles.colors.accent} onChange={setColor('accent')} />
        </div>
      </div>

      <div>
        <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 8 }}>Font chữ</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div>
            <div style={{ fontSize: 11, color: '#6B6B6B', marginBottom: 2 }}>Tiêu đề</div>
            <Select
              size="small"
              value={globalStyles.fonts.heading}
              onChange={(v) => onChange({ ...globalStyles, fonts: { ...globalStyles.fonts, heading: v } })}
              style={{ width: '100%' }}
              options={HEADING_FONTS.map((f) => ({ value: f, label: f }))}
            />
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#6B6B6B', marginBottom: 2 }}>Nội dung</div>
            <Select
              size="small"
              value={globalStyles.fonts.body}
              onChange={(v) => onChange({ ...globalStyles, fonts: { ...globalStyles.fonts, body: v } })}
              style={{ width: '100%' }}
              options={BODY_FONTS.map((f) => ({ value: f, label: f }))}
            />
          </div>
        </div>
      </div>

      <div>
        <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4 }}>Nền giấy (URL)</div>
        <Input
          size="small"
          value={globalStyles.paperBg || ''}
          onChange={(e) => onChange({ ...globalStyles, paperBg: e.target.value })}
          placeholder="/themes/songphung-red/paper-bg.jpg"
        />
      </div>

      <div>
        <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4 }}>Nhạc nền (URL)</div>
        <Input
          size="small"
          value={globalStyles.musicUrl || ''}
          onChange={(e) => onChange({ ...globalStyles, musicUrl: e.target.value })}
          placeholder="/themes/songphung-red/music.mp3"
        />
      </div>
    </div>
  );
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (c: Color) => void }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: '#6B6B6B', marginBottom: 2 }}>{label}</div>
      <ColorPicker value={value} onChange={onChange} size="small" showText />
    </div>
  );
}
