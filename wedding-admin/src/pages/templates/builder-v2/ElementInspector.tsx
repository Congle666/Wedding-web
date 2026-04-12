/**
 * Property inspector for a selected element. Shown in a panel when admin
 * clicks an element in the block canvas. Allows editing:
 *   - Position (x, y, width, height as %)
 *   - Style (opacity, rotation, flip, color, fontSize, fontFamily)
 *   - Animation (type, duration, delay, triggerOn)
 *   - Content (image URL with asset library or text)
 *   - Lock/unlock
 */

import { Button, ColorPicker, Input, InputNumber, Select, Slider, Switch } from 'antd';
import type { Color } from 'antd/es/color-picker';
import type { ElementInstance, AnimationType } from '../../../types/builderConfig';
import { ANIMATION_PRESETS, DEFAULT_ELEMENT_ANIMATION, DEFAULT_ELEMENT_STYLE } from '../../../types/builderConfig';
import ImageUpload from '../../../components/ui/ImageUpload';

interface Props {
  element: ElementInstance;
  onChange: (updated: ElementInstance) => void;
  onDelete: (elementId: string) => void;
  onClose: () => void;
}

export default function ElementInspector({ element, onChange, onDelete, onClose }: Props) {
  const updatePosition = (key: keyof ElementInstance['position'], value: number) => {
    onChange({ ...element, position: { ...element.position, [key]: value } });
  };

  const updateStyle = (key: string, value: any) => {
    onChange({ ...element, style: { ...element.style, [key]: value } });
  };

  const updateAnimation = (key: string, value: any) => {
    onChange({ ...element, animation: { ...element.animation, [key]: value } });
  };

  const h3Style: React.CSSProperties = {
    fontSize: 11,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    margin: '16px 0 8px',
  };

  const rowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
    marginBottom: 8,
  };

  return (
    <div style={{ padding: 12, fontSize: 13 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 700, color: '#1A1A1A' }}>{element.category || element.id}</div>
          <div style={{ fontSize: 11, color: '#9CA3AF' }}>{element.type}</div>
        </div>
        <Button size="small" onClick={onClose}>✕</Button>
      </div>

      {/* Content */}
      {element.type === 'image' && (
        <>
          <h3 style={h3Style}>Ảnh</h3>
          <ImageUpload
            value={element.content}
            onChange={(url) => onChange({ ...element, content: url })}
            hint="Kéo thả hoặc bấm để chọn ảnh"
          />
        </>
      )}
      {element.type === 'text' && (
        <>
          <h3 style={h3Style}>Nội dung</h3>
          <Input.TextArea
            rows={2}
            value={element.content}
            onChange={(e) => onChange({ ...element, content: e.target.value })}
          />
        </>
      )}

      {/* Position */}
      <h3 style={h3Style}>Vị trí (%)</h3>
      <div style={rowStyle}>
        <div>
          <div style={{ fontSize: 10, color: '#6B6B6B' }}>X</div>
          <InputNumber size="small" style={{ width: '100%' }} min={-50} max={150} value={element.position.x}
            onChange={(v) => updatePosition('x', Number(v) || 0)} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: '#6B6B6B' }}>Y</div>
          <InputNumber size="small" style={{ width: '100%' }} min={-50} max={150} value={element.position.y}
            onChange={(v) => updatePosition('y', Number(v) || 0)} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: '#6B6B6B' }}>Rộng</div>
          <InputNumber size="small" style={{ width: '100%' }} min={0} max={100} value={element.position.width}
            onChange={(v) => updatePosition('width', Number(v) || 0)} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: '#6B6B6B' }}>Cao</div>
          <InputNumber size="small" style={{ width: '100%' }} min={0} max={100} value={element.position.height}
            onChange={(v) => updatePosition('height', Number(v) || 0)} />
        </div>
      </div>

      {/* Style */}
      <h3 style={h3Style}>Kiểu dáng</h3>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 10, color: '#6B6B6B', marginBottom: 2 }}>Opacity</div>
        <Slider min={0} max={1} step={0.05} value={element.style.opacity}
          onChange={(v) => updateStyle('opacity', v)} />
      </div>
      <div style={rowStyle}>
        <div>
          <div style={{ fontSize: 10, color: '#6B6B6B' }}>Xoay (°)</div>
          <InputNumber size="small" style={{ width: '100%' }} min={-360} max={360}
            value={element.style.rotation} onChange={(v) => updateStyle('rotation', Number(v) || 0)} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: '#6B6B6B' }}>Z-Index</div>
          <InputNumber size="small" style={{ width: '100%' }} min={0} max={100}
            value={element.style.zIndex} onChange={(v) => updateStyle('zIndex', Number(v) || 0)} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Switch size="small" checked={element.style.flipX}
          onChange={(v) => updateStyle('flipX', v)} />
        <span style={{ fontSize: 12 }}>Lật ngang</span>
      </div>

      {element.type === 'text' && (
        <div style={rowStyle}>
          <div>
            <div style={{ fontSize: 10, color: '#6B6B6B' }}>Font size</div>
            <InputNumber size="small" style={{ width: '100%' }} min={8} max={120}
              value={element.style.fontSize || 16} onChange={(v) => updateStyle('fontSize', Number(v) || 16)} />
          </div>
          <div>
            <div style={{ fontSize: 10, color: '#6B6B6B' }}>Màu chữ</div>
            <ColorPicker size="small" showText value={element.style.color || '#2C1810'}
              onChange={(c: Color) => updateStyle('color', c.toHexString())} />
          </div>
        </div>
      )}

      {/* Animation */}
      <h3 style={h3Style}>Hiệu ứng</h3>
      <div style={{ marginBottom: 8 }}>
        <Select
          size="small"
          style={{ width: '100%' }}
          value={element.animation.type}
          onChange={(v) => updateAnimation('type', v)}
          options={ANIMATION_PRESETS}
        />
      </div>
      <div style={rowStyle}>
        <div>
          <div style={{ fontSize: 10, color: '#6B6B6B' }}>Duration (ms)</div>
          <InputNumber size="small" style={{ width: '100%' }} min={100} max={3000} step={100}
            value={element.animation.duration} onChange={(v) => updateAnimation('duration', Number(v) || 600)} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: '#6B6B6B' }}>Delay (ms)</div>
          <InputNumber size="small" style={{ width: '100%' }} min={0} max={3000} step={100}
            value={element.animation.delay} onChange={(v) => updateAnimation('delay', Number(v) || 0)} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Select size="small" value={element.animation.triggerOn}
          onChange={(v) => updateAnimation('triggerOn', v)}
          options={[{ value: 'scroll', label: 'Khi cuộn tới' }, { value: 'load', label: 'Khi tải trang' }]}
          style={{ width: 140 }}
        />
      </div>

      {/* Actions */}
      <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 12, marginTop: 12, display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Switch size="small" checked={element.locked}
            onChange={(v) => onChange({ ...element, locked: v })} />
          <span style={{ fontSize: 11, color: '#6B6B6B' }}>Khóa (không xoá được)</span>
        </div>
        {!element.locked && (
          <Button danger size="small" onClick={() => onDelete(element.id)}>
            Xoá
          </Button>
        )}
      </div>
    </div>
  );
}
