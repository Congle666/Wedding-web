import { useState } from 'react';
import { Input, Select, Button } from 'antd';
import type { CustomizableField } from '../../../types';

interface CustomFieldEditorProps {
  value: CustomizableField[];
  onChange: (fields: CustomizableField[]) => void;
}

const fieldTypeOptions = [
  { value: 'color', label: 'Color' },
  { value: 'text', label: 'Text' },
  { value: 'select', label: 'Select' },
  { value: 'boolean', label: 'Boolean' },
];

export default function CustomFieldEditor({ value, onChange }: CustomFieldEditorProps) {
  const [showPreview, setShowPreview] = useState(false);

  const handleAdd = () => {
    onChange([...value, { key: '', label: '', type: 'text', default: '' }]);
  };

  const handleUpdate = (index: number, field: Partial<CustomizableField>) => {
    const updated = value.map((item, i) => (i === index ? { ...item, ...field } : item));
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div>
      {value.map((field, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            alignItems: 'center',
            marginBottom: 10,
            padding: 10,
            background: '#FAFAFA',
            borderRadius: 8,
            border: '1px solid #F0F0F0',
          }}
        >
          <Input
            placeholder="Key"
            value={field.key}
            onChange={(e) => handleUpdate(index, { key: e.target.value })}
            style={{ flex: '1 1 120px', minWidth: 100 }}
          />
          <Input
            placeholder="Label"
            value={field.label}
            onChange={(e) => handleUpdate(index, { label: e.target.value })}
            style={{ flex: '1 1 140px', minWidth: 100 }}
          />
          <Select
            value={field.type}
            onChange={(val) => handleUpdate(index, { type: val })}
            options={fieldTypeOptions}
            style={{ flex: '0 0 110px' }}
          />
          <Input
            placeholder="Giá trị mặc định"
            value={field.default}
            onChange={(e) => handleUpdate(index, { default: e.target.value })}
            style={{ flex: '1 1 140px', minWidth: 100 }}
          />
          <Button
            type="text"
            danger
            onClick={() => handleRemove(index)}
            style={{ flexShrink: 0, fontSize: 13 }}
          >
            Xoá
          </Button>
        </div>
      ))}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <Button type="dashed" onClick={handleAdd}>
          Thêm trường
        </Button>
        {value.length > 0 && (
          <Button
            type="link"
            onClick={() => setShowPreview(!showPreview)}
            style={{ color: '#6B6B6B', fontSize: 13, padding: 0 }}
          >
            {showPreview ? 'Ẩn JSON' : 'Xem JSON'}
          </Button>
        )}
      </div>

      {showPreview && value.length > 0 && (
        <pre
          style={{
            marginTop: 12,
            padding: 12,
            background: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: 8,
            fontSize: 12,
            color: '#374151',
            overflow: 'auto',
            maxHeight: 200,
          }}
        >
          {JSON.stringify(value, null, 2)}
        </pre>
      )}
    </div>
  );
}
