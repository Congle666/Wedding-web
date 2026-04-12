'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';

export default function HeroBanner() {
  const heroStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100vh',
    minHeight: 600,
    backgroundColor: '#2A1A1A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  };

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0.15))',
    zIndex: 1,
  };

  const contentStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 2,
    textAlign: 'center',
    color: '#FFFFFF',
    padding: '0 24px',
    maxWidth: 800,
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: "'Be Vietnam Pro', sans-serif",
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 24,
  };

  const headingStyle: React.CSSProperties = {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 68,
    lineHeight: 1.1,
    margin: '0 0 24px',
    color: '#FFFFFF',
  };

  const line2Style: React.CSSProperties = {
    fontWeight: 300,
    fontStyle: 'italic',
  };

  const subtitleStyle: React.CSSProperties = {
    fontFamily: "'Be Vietnam Pro', sans-serif",
    fontSize: 18,
    lineHeight: 1.6,
    color: 'rgba(255,255,255,0.9)',
    maxWidth: 560,
    margin: '0 auto 40px',
  };

  const buttonsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    flexWrap: 'wrap',
  };

  const scrollHintStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 32,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  };

  return (
    <section style={heroStyle}>
      <div style={overlayStyle} />

      <motion.div
        style={contentStyle}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <span style={labelStyle}>
          THIỆP CƯỚI ONLINE — JUNTECH
        </span>

        <h1 style={headingStyle}>
          <span>Thiệp cưới của bạn</span>
          <br />
          <span style={line2Style}>xứng tầm ngày trọng đại</span>
        </h1>

        <p style={subtitleStyle}>
          Hơn 50 mẫu thiệp đẹp, tuỳ chỉnh theo ý muốn, chia sẻ đến mọi người chỉ trong vài phút
        </p>

        <div style={buttonsStyle}>
          <Link href="/mau-thiep" style={{ textDecoration: 'none' }}>
            <Button variant="white" size="lg">Xem mẫu thiệp</Button>
          </Link>
          <Link href="#how-it-works" style={{ textDecoration: 'none' }}>
            <Button
              variant="outline"
              size="lg"
              style={{
                borderColor: 'rgba(255,255,255,0.6)',
                color: '#FFFFFF',
                backgroundColor: 'transparent',
              }}
            >
              Tìm hiểu thêm
            </Button>
          </Link>
        </div>
      </motion.div>

      <div style={scrollHintStyle}>
        <span style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.05em' }}>
          Cuộn xuống
        </span>
        <span style={{ display: 'block', width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.4)' }} />
      </div>

    </section>
  );
}
