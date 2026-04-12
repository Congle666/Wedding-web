import React from 'react';

interface SectionTitleProps {
  label?: string;
  title: string;
  subtitle?: string;
}

export default function SectionTitle({
  label,
  title,
  subtitle,
}: SectionTitleProps) {
  const containerStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: '48px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: '#8B1A1A',
    fontFamily: 'var(--font-body)',
    marginBottom: '12px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '36px',
    fontWeight: 600,
    color: '#1F2937',
    fontFamily: 'var(--font-display)',
    lineHeight: 1.2,
    margin: 0,
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '16px',
    color: '#6B7280',
    fontFamily: 'var(--font-body)',
    marginTop: '12px',
    lineHeight: 1.6,
    maxWidth: '600px',
    marginLeft: 'auto',
    marginRight: 'auto',
  };

  return (
    <div style={containerStyle}>
      {label && <p style={labelStyle}>{label}</p>}
      <h2 style={titleStyle}>{title}</h2>
      {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
    </div>
  );
}
