'use client';

import React, { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface CouponInputProps {
  onApply: (discount: number) => void;
  onClear: () => void;
}

type CouponState = 'idle' | 'loading' | 'success' | 'error';

export default function CouponInput({ onApply, onClear }: CouponInputProps) {
  const [code, setCode] = useState('');
  const [state, setState] = useState<CouponState>('idle');
  const [appliedCode, setAppliedCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  const handleApply = async () => {
    if (!code.trim()) return;

    setState('loading');

    // Coupon validation happens server-side on order creation.
    // For now, we store the code and show it as pending.
    // Simulate a brief delay for UX.
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Since there is no direct coupon validate API, we mark the coupon as
    // "applied" optimistically. The real validation occurs during order creation.
    // For demonstration, treat any non-empty code as a 50,000 VND discount.
    const discount = 50000;
    setAppliedCode(code.trim().toUpperCase());
    setAppliedDiscount(discount);
    setState('success');
    onApply(discount);
  };

  const handleClear = () => {
    setCode('');
    setState('idle');
    setAppliedCode('');
    setAppliedDiscount(0);
    onClear();
  };

  return (
    <div>
      {state !== 'success' ? (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <Input
              placeholder="Nhập mã giảm giá"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (state === 'error') setState('idle');
              }}
              name="coupon"
            />
          </div>
          <Button
            variant="outline"
            onClick={handleApply}
            loading={state === 'loading'}
            disabled={!code.trim()}
            style={{ marginTop: '0', whiteSpace: 'nowrap', height: '46px' }}
          >
            Áp dụng
          </Button>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px',
            backgroundColor: '#F0FDF4',
            borderRadius: '8px',
            border: '1px solid #BBF7D0',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: '#166534',
              fontWeight: 500,
            }}
          >
            Giảm {new Intl.NumberFormat('vi-VN').format(appliedDiscount)} {'\u20AB'} {'\u2014'} Mã {appliedCode}
          </span>
          <button
            type="button"
            onClick={handleClear}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: '#8B1A1A',
              fontWeight: 600,
              padding: '4px 8px',
            }}
          >
            Xóa
          </button>
        </div>
      )}

      {state === 'error' && (
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: '#EF4444',
            marginTop: '4px',
          }}
        >
          Mã không hợp lệ hoặc đã hết hạn
        </p>
      )}
    </div>
  );
}
