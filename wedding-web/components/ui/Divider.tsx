import React from 'react';

interface DividerProps {
  text?: string;
}

export default function Divider({ text }: DividerProps) {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    margin: '24px 0',
  };

  const lineStyle: React.CSSProperties = {
    flex: 1,
    height: '1px',
    backgroundColor: '#EDE8E1',
  };

  const textStyle: React.CSSProperties = {
    fontSize: '13px',
    color: '#9CA3AF',
    fontFamily: 'var(--font-body)',
    whiteSpace: 'nowrap',
  };

  if (!text) {
    return <div style={{ ...lineStyle, margin: '24px 0' }} />;
  }

  return (
    <div style={containerStyle}>
      <div style={lineStyle} />
      <span style={textStyle}>{text}</span>
      <div style={lineStyle} />
    </div>
  );
}
