'use client';

import { useState, useRef } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
}

export default function ImageUpload({ value, onChange, label, hint }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File không được vượt quá 5MB', { className: 'toast-error' });
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Chỉ chấp nhận file ảnh', { className: 'toast-error' });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data?.data?.url;
      if (url) {
        onChange(url);
        toast.success('Tải ảnh lên thành công', { className: 'toast-success' });
      }
    } catch {
      toast.error('Tải ảnh thất bại', { className: 'toast-error' });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <div>
      {label && (
        <p style={{ fontSize: 14, fontWeight: 500, color: '#1A1A1A', marginBottom: 8 }}>{label}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Preview */}
      {value && (
        <div style={{ marginBottom: 12, position: 'relative', display: 'inline-block' }}>
          <img
            src={value}
            alt="Preview"
            style={{
              maxWidth: '100%',
              maxHeight: 200,
              borderRadius: 8,
              border: '1px solid #E8E3DC',
              objectFit: 'cover',
            }}
          />
          <button
            onClick={() => onChange('')}
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              background: 'rgba(0,0,0,0.6)',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              padding: '2px 8px',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Xoá
          </button>
        </div>
      )}

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragOver ? '#8B1A1A' : '#E8E3DC'}`,
          borderRadius: 8,
          padding: '24px 16px',
          textAlign: 'center',
          cursor: uploading ? 'wait' : 'pointer',
          background: dragOver ? '#FFF5F5' : '#FAFAF9',
          transition: 'all 0.15s',
        }}
      >
        {uploading ? (
          <p style={{ fontSize: 14, color: '#6B6B6B' }}>Đang tải lên...</p>
        ) : (
          <>
            <p style={{ fontSize: 14, color: '#1A1A1A', fontWeight: 500, marginBottom: 4 }}>
              Kéo thả ảnh vào đây hoặc bấm để chọn
            </p>
            <p style={{ fontSize: 12, color: '#9CA3AF' }}>
              {hint || 'JPG, PNG, WebP. Tối đa 5MB'}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
