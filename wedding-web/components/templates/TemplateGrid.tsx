'use client';

import React from 'react';
import Skeleton from '@/components/ui/Skeleton';
import TemplateCard from '@/components/templates/TemplateCard';
import type { Template } from '@/lib/api/template.api';

interface TemplateGridProps {
  templates: Template[];
  loading: boolean;
  total: number;
  onClearFilters?: () => void;
}

export default function TemplateGrid({
  templates,
  loading,
  total,
  onClearFilters,
}: TemplateGridProps) {
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
  };

  const emptyStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '64px 24px',
    fontFamily: 'var(--font-body)',
  };

  const emptyTitleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 600,
    color: '#374151',
    margin: '0 0 12px 0',
  };

  const emptyDescStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#9CA3AF',
    margin: '0 0 24px 0',
  };

  const clearBtnStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: '#8B1A1A',
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: 'var(--font-body)',
    cursor: 'pointer',
    padding: 0,
    textDecoration: 'underline',
  };

  const skeletonCardStyle: React.CSSProperties = {
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid #EDE8E1',
  };

  if (loading) {
    return (
      <>
        <div className="template-grid" style={gridStyle}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={skeletonCardStyle}>
              <Skeleton height="0" width="100%" />
              <div style={{ paddingBottom: '75%', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, backgroundColor: '#E5E7EB' }}>
                  <Skeleton width="100%" height="100%" />
                </div>
              </div>
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Skeleton width="70%" height="18px" />
                <Skeleton width="40%" height="12px" />
                <Skeleton width="55%" height="14px" />
                <Skeleton width="35%" height="12px" />
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <Skeleton width="50%" height="34px" />
                  <Skeleton width="50%" height="34px" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (!loading && total === 0) {
    return (
      <div style={emptyStyle}>
        <p style={emptyTitleStyle}>Không tìm thấy mẫu phù hợp</p>
        <p style={emptyDescStyle}>
          Hãy thử thay đổi bộ lọc hoặc từ khoá tìm kiếm để xem thêm kết quả.
        </p>
        {onClearFilters && (
          <button style={clearBtnStyle} onClick={onClearFilters}>
            Xoá bộ lọc
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="template-grid" style={gridStyle}>
        {templates.map((t) => (
          <TemplateCard key={t.id} template={t} />
        ))}
      </div>
    </>
  );
}
