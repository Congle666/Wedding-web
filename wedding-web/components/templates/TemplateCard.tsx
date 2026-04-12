'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { formatVND, formatCompactNumber } from '@/lib/utils/format';
import type { Template } from '@/lib/api/template.api';

interface TemplateCardProps {
  template: Template;
}

export default function TemplateCard({ template }: TemplateCardProps) {
  const [hovered, setHovered] = useState(false);

  const isNew =
    (Date.now() - new Date(template.created_at).getTime()) /
      (1000 * 60 * 60 * 24) <
    30;

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    border: '1px solid #EDE8E1',
    borderRadius: '16px',
    overflow: 'hidden',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    ...(hovered
      ? {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
        }
      : {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
        }),
  };

  const thumbnailWrapperStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    paddingBottom: '75%', /* 4:3 aspect */
    backgroundColor: '#F3F4F6',
    borderRadius: '12px',
    overflow: 'hidden',
  };

  const imageStyle: React.CSSProperties = {
    objectFit: 'cover',
    transition: 'transform 0.4s ease',
    transform: hovered ? 'scale(1.05)' : 'scale(1)',
  };

  const badgeBaseStyle: React.CSSProperties = {
    position: 'absolute',
    zIndex: 2,
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 600,
    fontFamily: 'var(--font-body)',
    lineHeight: '16px',
  };

  const newBadgeStyle: React.CSSProperties = {
    ...badgeBaseStyle,
    top: '10px',
    left: '10px',
    backgroundColor: '#8B1A1A',
    color: '#FFFFFF',
  };

  const videoBadgeStyle: React.CSSProperties = {
    ...badgeBaseStyle,
    top: '10px',
    right: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#FFFFFF',
  };

  const contentStyle: React.CSSProperties = {
    padding: '16px',
  };

  const nameStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 700,
    fontFamily: 'var(--font-body)',
    color: '#1F2937',
    margin: '0 0 4px 0',
    lineHeight: 1.4,
  };

  const categoryStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 600,
    fontFamily: 'var(--font-body)',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: '0 0 8px 0',
  };

  const priceStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: 'var(--font-body)',
    color: '#8B1A1A',
    margin: '0 0 4px 0',
  };

  const viewStyle: React.CSSProperties = {
    fontSize: '12px',
    fontFamily: 'var(--font-body)',
    color: '#9CA3AF',
    margin: '0 0 12px 0',
  };

  const buttonsRowStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={thumbnailWrapperStyle}>
        {template.thumbnail_url && (
          <Image
            src={template.thumbnail_url}
            alt={template.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            style={imageStyle}
          />
        )}
        {isNew && <span style={newBadgeStyle}>Mới</span>}
        {template.has_video && <span style={videoBadgeStyle}>Có video</span>}
      </div>

      <div style={contentStyle}>
        <h3 style={nameStyle}>{template.name}</h3>
        <p style={categoryStyle}>{template.category?.name || 'Chưa phân loại'}</p>
        <p style={priceStyle}>từ {formatVND(template.price_per_day)} / ngày</p>
        <p style={viewStyle}>
          {formatCompactNumber(template.view_count)} lượt xem
        </p>

        <div style={buttonsRowStyle}>
          <Link href={`/mau-thiep/${template.slug}`} style={{ flex: 1, textDecoration: 'none' }}>
            <Button variant="outline" size="sm" fullWidth>
              Xem trước
            </Button>
          </Link>
          <Link href={`/dat-thue/${template.id}`} style={{ flex: 1, textDecoration: 'none' }}>
            <Button variant="primary" size="sm" fullWidth>
              Thuê ngay
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
