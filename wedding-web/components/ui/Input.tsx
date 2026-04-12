'use client';

import React, { useState } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  type = 'text',
  style,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '6px',
    fontFamily: 'var(--font-body)',
  };

  const inputWrapperStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    paddingRight: isPassword ? '64px' : '12px',
    fontSize: '15px',
    fontFamily: 'var(--font-body)',
    border: `1px solid ${error ? '#EF4444' : focused ? '#8B1A1A' : '#EDE8E1'}`,
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    backgroundColor: '#FFFFFF',
    color: '#1F2937',
    ...style,
  };

  const errorStyle: React.CSSProperties = {
    fontSize: '13px',
    color: '#EF4444',
    marginTop: '4px',
    fontFamily: 'var(--font-body)',
  };

  const toggleStyle: React.CSSProperties = {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#8B1A1A',
    fontFamily: 'var(--font-body)',
    fontWeight: 500,
    padding: '4px',
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      {label && <label style={labelStyle}>{label}</label>}
      <div style={inputWrapperStyle}>
        <input
          type={inputType}
          style={inputStyle}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={toggleStyle}
          >
            {showPassword ? 'Ẩn' : 'Hiện'}
          </button>
        )}
      </div>
      {error && <p style={errorStyle}>{error}</p>}
    </div>
  );
}
