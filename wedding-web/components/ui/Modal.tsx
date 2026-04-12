'use client';

import React, { useEffect } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '24px',
    animation: 'modal-fade-in 0.2s ease',
  };

  const panelStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '520px',
    maxHeight: '85vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
    animation: 'modal-scale-in 0.2s ease',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid #EDE8E1',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 600,
    color: '#1F2937',
    fontFamily: 'var(--font-display)',
    margin: 0,
  };

  const closeButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    fontSize: '14px',
    color: '#6B7280',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    fontWeight: 500,
    padding: '4px 8px',
  };

  const bodyStyle: React.CSSProperties = {
    padding: '24px',
  };

  return (
    <>
      <div
        style={overlayStyle}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div style={panelStyle}>
          {title && (
            <div style={headerStyle}>
              <h3 style={titleStyle}>{title}</h3>
              <button
                type="button"
                onClick={onClose}
                style={closeButtonStyle}
              >
                Đóng
              </button>
            </div>
          )}
          <div style={bodyStyle}>{children}</div>
        </div>
      </div>
    </>
  );
}
