'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import dayjs from 'dayjs';
import type { TemplateConfig } from '@/types/templateConfig';
import { DEFAULT_SONGPHUNG_RED_CONFIG } from '@/types/templateConfig';
import { EditableSlot, EditableText } from './editModeHelpers';

interface Props {
  weddingDate: string;
  cfg?: TemplateConfig;
  editMode?: boolean;
}

function calcTimeLeft(target: dayjs.Dayjs) {
  const now = dayjs();
  const diff = target.diff(now, 'second');
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / 86400),
    hours: Math.floor((diff % 86400) / 3600),
    minutes: Math.floor((diff % 3600) / 60),
    seconds: diff % 60,
  };
}

export default function CountdownSection({
  weddingDate,
  cfg = DEFAULT_SONGPHUNG_RED_CONFIG,
  editMode = false,
}: Props) {
  const countdownAssets: any = (cfg.assets as any).countdown || {};
  const flowerAsset = countdownAssets.flower || '/themes/songphung-red/flower.webp';
  const sectionTitle = (cfg.text_samples as any).countdown?.section_title || '';
  const target = dayjs(weddingDate);
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    setMounted(true);
    setTime(calcTimeLeft(target));
    const timer = setInterval(() => {
      setTime(calcTimeLeft(target));
    }, 1000);
    return () => clearInterval(timer);
  }, [weddingDate]);

  return (
    <section
      ref={ref}
      style={{
        padding: '60px 24px 50px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background - flower RIGHT */}
      <EditableSlot
        section="countdown"
        slot="flower"
        variant="absolute"
        editMode={editMode}
        hint="Đổi hoa trang trí Đếm ngược"
        style={{
          top: -40,
          right: -80,
          width: 300,
          opacity: 0.30,
          zIndex: 0,
          transform: 'scaleX(-1)',
          pointerEvents: editMode ? 'auto' : 'none',
        }}
      >
        <Image
          src={flowerAsset}
          alt=""
          width={300}
          height={300}
          style={{ width: '100%', height: 'auto' }}
          unoptimized={flowerAsset.startsWith('/uploads/')}
        />
      </EditableSlot>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        layout={false}
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 24,
          fontWeight: 700,
          color: '#5F191D',
          marginBottom: 30,
          textTransform: 'uppercase',
          letterSpacing: 1,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <EditableText
          section="countdown"
          slot="section_title"
          value={sectionTitle}
          fallback="Cùng Đếm Ngược"
          editMode={editMode}
        />
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.3 }}
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 28,
          fontWeight: 700,
          color: '#5F191D',
          marginBottom: 20,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {mounted
          ? `${time.days} ngày ${time.hours} giờ ${time.minutes} phút ${time.seconds} giây`
          : '-- ngày -- giờ -- phút -- giây'}
      </motion.p>
    </section>
  );
}
