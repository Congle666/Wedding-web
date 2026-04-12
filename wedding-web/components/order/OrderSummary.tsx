'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import Divider from '@/components/ui/Divider';
import { formatVND, formatDateShort } from '@/lib/utils/format';

interface OrderSummaryProps {
  templateName: string;
  thumbnailUrl: string;
  packageType: 'daily' | 'monthly';
  durationDays: number;
  rentalStart: Date | null;
  pricePerDay: number;
  pricePerMonth: number;
  couponDiscount: number;
  customDomain: string;
}

export default function OrderSummary({
  templateName,
  thumbnailUrl,
  packageType,
  durationDays,
  rentalStart,
  pricePerDay,
  pricePerMonth,
  couponDiscount,
  customDomain,
}: OrderSummaryProps) {
  const subtotal =
    packageType === 'monthly'
      ? pricePerMonth * Math.ceil(durationDays / 30)
      : pricePerDay * durationDays;

  const total = Math.max(0, subtotal - couponDiscount);

  const rentalEnd =
    rentalStart
      ? new Date(rentalStart.getTime() + durationDays * 24 * 60 * 60 * 1000)
      : null;

  const packageLabel =
    packageType === 'monthly'
      ? 'Theo tháng \u2014 30 ngày'
      : `Theo ngày \u2014 ${durationDays} ngày`;

  return (
    <Card style={{ padding: '24px' }}>
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '18px',
          fontWeight: 600,
          color: '#1F2937',
          marginBottom: '20px',
        }}
      >
        Tóm tắt đơn hàng
      </h3>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <img
          src={thumbnailUrl}
          alt={templateName}
          style={{
            width: '64px',
            height: '48px',
            objectFit: 'cover',
            borderRadius: '6px',
            border: '1px solid #EDE8E1',
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '15px',
            fontWeight: 500,
            color: '#1F2937',
          }}
        >
          {templateName}
        </span>
      </div>

      <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: '#6B7280', lineHeight: 2 }}>
        <div>
          <span style={{ fontWeight: 500, color: '#374151' }}>Gói thuê:</span>{' '}
          {packageLabel}
        </div>
        {rentalStart && rentalEnd && (
          <div>
            <span style={{ fontWeight: 500, color: '#374151' }}>Thời gian:</span>{' '}
            Từ: {formatDateShort(rentalStart)} {'\u2192'} Đến: {formatDateShort(rentalEnd)}
          </div>
        )}
        {customDomain && (
          <div>
            <span style={{ fontWeight: 500, color: '#374151' }}>Tên miền:</span>{' '}
            juntech.vn/{customDomain}
          </div>
        )}
      </div>

      <Divider />

      <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
            color: '#6B7280',
          }}
        >
          <span>Tạm tính</span>
          <span>{formatVND(subtotal)}</span>
        </div>

        {couponDiscount > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              color: '#EF4444',
            }}
          >
            <span>Giảm giá</span>
            <span>-{formatVND(couponDiscount)}</span>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid #EDE8E1',
          }}
        >
          <span
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: '#1F2937',
            }}
          >
            Tổng cộng
          </span>
          <span
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#8B1A1A',
              fontFamily: 'var(--font-display)',
            }}
          >
            {formatVND(total)}
          </span>
        </div>
      </div>

      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '12px',
          color: '#9CA3AF',
          marginTop: '16px',
          lineHeight: 1.5,
        }}
      >
        Bằng cách đặt thuê, bạn đồng ý với Điều khoản dịch vụ của JunTech.
      </p>
    </Card>
  );
}
