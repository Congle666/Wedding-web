'use client';

import React from 'react';

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'white';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: { padding: '8px 16px', fontSize: '13px' },
  md: { padding: '12px 24px', fontSize: '15px' },
  lg: { padding: '16px 32px', fontSize: '16px' },
};

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: '#8B1A1A',
    color: '#FFFFFF',
    border: '2px solid #8B1A1A',
  },
  outline: {
    backgroundColor: 'transparent',
    color: '#8B1A1A',
    border: '2px solid #8B1A1A',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: '#6B7280',
    border: '2px solid transparent',
  },
  white: {
    backgroundColor: '#FFFFFF',
    color: '#8B1A1A',
    border: '2px solid #FFFFFF',
  },
};

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  children,
  disabled,
  style,
  onMouseEnter,
  onMouseLeave,
  ...rest
}: ButtonProps) {
  const [hovered, setHovered] = React.useState(false);

  const getHoverStyle = (): React.CSSProperties => {
    if (!hovered) return {};
    switch (variant) {
      case 'primary':
        return { backgroundColor: '#6E1515', borderColor: '#6E1515' };
      case 'outline':
        return { backgroundColor: '#FFF5F5' };
      case 'ghost':
        return { color: '#8B1A1A' };
      case 'white':
        return { backgroundColor: '#F9F9F9' };
      default:
        return {};
    }
  };

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    borderRadius: '8px',
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    transition: 'all 0.2s ease',
    width: fullWidth ? '100%' : undefined,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...getHoverStyle(),
    ...style,
  };

  return (
    <button
      disabled={disabled || loading}
      style={baseStyle}
      onMouseEnter={(e) => {
        setHovered(true);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setHovered(false);
        onMouseLeave?.(e);
      }}
      {...rest}
    >
      {loading ? 'Đang xử lý...' : children}
    </button>
  );
}
