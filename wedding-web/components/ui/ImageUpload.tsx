'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useAuthStore } from '@/lib/store/auth.store';

interface Props {
  value?: string;
  onChange?: (url: string) => void;
  label?: string;
  placeholder?: string;
}

export default function ImageUpload({ value, onChange, label, placeholder }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const { token } = useAuthStore();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File vượt quá 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Chỉ chấp nhận file ảnh');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload/image', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const json = await res.json();
      if (json.success && json.data?.url) {
        onChange?.(json.data.url);
      } else {
        setError(json.message || 'Upload thất bại');
      }
    } catch {
      setError('Lỗi kết nối');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleRemove = () => {
    onChange?.('');
  };

  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: 13,
          fontWeight: 500,
          color: '#374151',
          marginBottom: 6,
          fontFamily: 'var(--font-body)',
        }}>
          {label}
        </label>
      )}

      {value ? (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <div style={{
            width: 120,
            height: 120,
            borderRadius: 12,
            overflow: 'hidden',
            border: '2px solid #EDE8E1',
          }}>
            <Image
              src={value}
              alt=""
              width={120}
              height={120}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            style={{
              position: 'absolute',
              top: -8,
              right: -8,
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: '#DC2626',
              color: '#fff',
              border: 'none',
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}
          >
            x
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{
            width: '100%',
            padding: '20px 16px',
            border: '2px dashed #D1D5DB',
            borderRadius: 12,
            background: uploading ? '#F9FAFB' : '#fff',
            cursor: uploading ? 'wait' : 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            fontFamily: 'var(--font-body)',
            transition: 'border-color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#8B1A1A')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#D1D5DB')}
        >
          <span style={{ fontSize: 24 }}>{uploading ? '...' : '+'}</span>
          <span style={{ fontSize: 13, color: '#6B7280' }}>
            {uploading ? 'Đang tải lên...' : (placeholder || 'Chọn ảnh từ máy')}
          </span>
          <span style={{ fontSize: 11, color: '#9CA3AF' }}>JPG, PNG, WebP - tối đa 5MB</span>
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {error && (
        <p style={{ fontSize: 12, color: '#DC2626', marginTop: 4 }}>{error}</p>
      )}
    </div>
  );
}
