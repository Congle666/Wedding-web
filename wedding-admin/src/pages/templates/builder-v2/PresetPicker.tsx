/**
 * Initial screen shown when admin opens builder-v2 in create mode.
 * Two options: start from blank canvas OR load a preset template.
 */

import { PRESET_REGISTRY } from './presets/songphungRedPreset';
import type { BuilderConfig } from '../../../types/builderConfig';

interface Props {
  onSelectPreset: (config: BuilderConfig) => void;
  onStartBlank: () => void;
}

export default function PresetPicker({ onSelectPreset, onStartBlank }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        gap: 32,
        padding: 32,
        fontFamily: "'Be Vietnam Pro', sans-serif",
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 32,
          fontWeight: 700,
          color: '#1A1A1A',
          marginBottom: 8,
        }}>
          Tạo mẫu thiệp mới
        </h1>
        <p style={{ color: '#6B6B6B', fontSize: 14 }}>
          Bắt đầu từ canvas trắng hoặc chọn một mẫu có sẵn
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 280px))',
        gap: 20,
        maxWidth: 900,
        width: '100%',
      }}>
        {/* Blank canvas */}
        <button
          onClick={onStartBlank}
          style={{
            background: '#fff',
            border: '2px dashed #D1D5DB',
            borderRadius: 12,
            padding: '32px 20px',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#8B1A1A';
            e.currentTarget.style.background = '#FFF5F5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#D1D5DB';
            e.currentTarget.style.background = '#fff';
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 12 }}>+</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A', marginBottom: 4 }}>
            Canvas trắng
          </div>
          <div style={{ fontSize: 12, color: '#9CA3AF' }}>
            Kéo thả từng section block vào
          </div>
        </button>

        {/* Presets */}
        {Object.entries(PRESET_REGISTRY).map(([key, preset]) => (
          <button
            key={key}
            onClick={() => onSelectPreset(preset.config)}
            style={{
              background: '#5F191D',
              border: '2px solid #5F191D',
              borderRadius: 12,
              padding: '32px 20px',
              cursor: 'pointer',
              textAlign: 'center',
              color: '#F8F2ED',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(95,25,29,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              fontSize: 28,
              marginBottom: 8,
              fontFamily: "'Cormorant Garamond', serif",
            }}>
              囍
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
              {preset.label}
            </div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              {preset.description}
            </div>
            <div style={{
              marginTop: 12,
              fontSize: 11,
              opacity: 0.5,
            }}>
              {preset.config.blocks.length} sections đầy đủ
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
