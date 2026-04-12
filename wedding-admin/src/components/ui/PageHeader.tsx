import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  extra?: ReactNode;
  onAdd?: () => void;
  addText?: string;
}

export default function PageHeader({ title, subtitle, extra, onAdd, addText }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div>
        <h1 style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: 24, fontWeight: 600, color: '#1A1A1A', margin: 0 }}>
          {title}
        </h1>
        {subtitle && <p style={{ fontSize: 13, color: '#6B6B6B', marginTop: 4 }}>{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {extra}
        {onAdd && (
          <button
            onClick={onAdd}
            style={{
              background: '#8B1A1A',
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#6E1515')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#8B1A1A')}
          >
            {addText || 'Thêm mới'}
          </button>
        )}
      </div>
    </div>
  );
}
