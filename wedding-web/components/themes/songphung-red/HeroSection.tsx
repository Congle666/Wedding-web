'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import type { TemplateConfig } from '@/types/templateConfig';
import { DEFAULT_SONGPHUNG_RED_CONFIG } from '@/types/templateConfig';
import { EditableSlot, EditableText } from './editModeHelpers';

interface Props {
  groomName: string;
  brideName: string;
  cfg?: TemplateConfig;
  editMode?: boolean;
}

export default function HeroSection({
  groomName,
  brideName,
  cfg = DEFAULT_SONGPHUNG_RED_CONFIG,
  editMode = false,
}: Props) {
  const heroAssets = cfg.assets.hero || {};
  const primary = cfg.colors.primary;
  const phoenixLeft = heroAssets.phoenix_left || '/themes/songphung-red/phoenix.webp';
  const phoenixRight = heroAssets.phoenix_right || '/themes/songphung-red/phoenix2.webp';
  const chuHy = heroAssets.chu_hy || '/themes/songphung-red/chu-hy.webp';
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section
      ref={ref}
      style={{
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/*
        Layout bất đối xứng:
        - Phoenix TRÁI: top: 10% (thấp hơn)
        - Phoenix PHẢI: top: -5% (cao hơn)
        - Cùng kích thước 40%
        - Cả 2 đều zIndex: 4 để đuôi hiện TRÊN band đỏ (zIndex: 3)
        - Chữ Hỷ căn giữa ngang, ở khoảng 35% từ trên (giữa vùng cream)
        - Tên cặp đôi góc trên trái, zIndex: 10 (trên phoenix)
      */}

      {/* Phoenix LEFT - thấp hơn, head quay PHẢI */}
      <EditableSlot
        section="hero"
        slot="phoenix_left"
        variant="absolute"
        editMode={editMode}
        hint="Đổi phượng hoàng trái (hero)"
        style={{
          left: -20,
          top: '10%',
          width: '40%',
          zIndex: 4,
          pointerEvents: editMode ? 'auto' : 'none',
        }}
      >
        <motion.div
          className="sp-hero-phoenix-left"
          initial={{ opacity: 0, x: -60 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 1, delay: 0.4 }}
          style={{ width: '100%' }}
        >
          <Image
            src={phoenixLeft}
            alt="Phượng hoàng"
            width={600}
            height={1100}
            style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
            priority
            unoptimized={phoenixLeft.startsWith('/uploads/')}
          />
        </motion.div>
      </EditableSlot>

      {/* Phoenix RIGHT - cao hơn, mirror head quay TRÁI */}
      <EditableSlot
        section="hero"
        slot="phoenix_right"
        variant="absolute"
        editMode={editMode}
        hint="Đổi phượng hoàng phải (hero)"
        style={{
          right: -20,
          top: '-5%',
          width: '40%',
          zIndex: 4,
          transform: 'scaleX(-1)',
          pointerEvents: editMode ? 'auto' : 'none',
        }}
      >
        <motion.div
          className="sp-hero-phoenix-right"
          initial={{ opacity: 0, x: 60 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 1, delay: 0.4 }}
          style={{ width: '100%' }}
        >
          <Image
            src={phoenixRight}
            alt="Phượng hoàng"
            width={600}
            height={1100}
            style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
            priority
            unoptimized={phoenixRight.startsWith('/uploads/')}
          />
        </motion.div>
      </EditableSlot>

      {/* Tên cặp đôi - góc trên trái */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, delay: 0.2 }}
        style={{
          position: 'absolute',
          top: 40,
          left: '8%',
          zIndex: 10,
          textAlign: 'left',
        }}
      >
        <h1
          className="sp-hero-name"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 44,
            fontWeight: 700,
            fontStyle: 'italic',
            color: primary,
            lineHeight: 1.15,
            margin: 0,
            textTransform: 'uppercase',
          }}
        >
          {brideName}
        </h1>
        <h1
          className="sp-hero-name"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 44,
            fontWeight: 700,
            fontStyle: 'italic',
            color: primary,
            lineHeight: 1.15,
            margin: '4px 0 0',
            textTransform: 'uppercase',
          }}
        >
          {groomName}
        </h1>
      </motion.div>

      {/* Chữ Hỷ - căn giữa ngang, nằm giữa vùng cream (trên band đỏ) */}
      <div
        style={{
          position: 'absolute',
          top: '35%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 5,
        }}
      >
        <EditableSlot
          section="hero"
          slot="chu_hy"
          editMode={editMode}
          hint="Đổi chữ Hỷ ở Hero"
        >
          <motion.div
            className="sp-hero-xi"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
            style={{ textAlign: 'center', userSelect: 'none' }}
          >
            <Image
              src={chuHy}
              alt="Hỷ"
              width={220}
              height={220}
              style={{ width: 220, height: 220, objectFit: 'contain' }}
              priority
              unoptimized={chuHy.startsWith('/uploads/')}
            />
          </motion.div>
        </EditableSlot>
      </div>

      {/* Hoa trang trí - giữa phải, phía trên band đỏ */}
      <div
        style={{
          position: 'absolute',
          bottom: '36%',
          right: -10,
          width: 180,
          zIndex: 5,
          pointerEvents: 'none',
          transform: 'scaleX(-1)',
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 0.4 } : {}}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <Image
            src="/themes/songphung-red/flower.webp"
            alt=""
            width={180}
            height={180}
            style={{ width: '100%', height: 'auto' }}
          />
        </motion.div>
      </div>

      {/* Band đỏ - chiếm 35% dưới cùng */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.6 }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '35%',
          backgroundColor: primary,
          zIndex: 3,
          transformOrigin: 'center',
        }}
      />
    </section>
  );
}
