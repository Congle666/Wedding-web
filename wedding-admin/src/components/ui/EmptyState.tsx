interface EmptyStateProps {
  title: string;
  subtitle?: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ title, subtitle, action }: EmptyStateProps) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px' }}>
      <p style={{ fontSize: 16, fontWeight: 500, color: '#1A1A1A', marginBottom: 4 }}>{title}</p>
      {subtitle && <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 16 }}>{subtitle}</p>}
      {action && (
        <button
          onClick={action.onClick}
          style={{
            background: '#8B1A1A',
            color: '#fff',
            border: 'none',
            padding: '8px 20px',
            borderRadius: 8,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
