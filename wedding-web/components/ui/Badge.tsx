import React from 'react';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'muted';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: '#FFF5F5',
    color: '#8B1A1A',
  },
  success: {
    backgroundColor: '#F0FDF4',
    color: '#166534',
  },
  warning: {
    backgroundColor: '#FFFBEB',
    color: '#92400E',
  },
  danger: {
    backgroundColor: '#FEF2F2',
    color: '#DC2626',
  },
  muted: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
};

export default function Badge({ children, variant = 'primary' }: BadgeProps) {
  const style: React.CSSProperties = {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
    fontFamily: 'var(--font-body)',
    lineHeight: '20px',
    ...variantStyles[variant],
  };

  return <span style={style}>{children}</span>;
}
