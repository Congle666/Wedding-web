'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import type { TemplateConfig } from '@/types/templateConfig';
import { DEFAULT_SONGPHUNG_RED_CONFIG } from '@/types/templateConfig';
import { EditableSlot, EditableText } from './editModeHelpers';

interface Props {
  galleryUrls: string[];
  cfg?: TemplateConfig;
  editMode?: boolean;
}

function Lightbox({
  images,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  images: string[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose, onPrev, onNext]);

  const btnStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.3)',
    color: '#fff',
    fontSize: 24,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(8px)',
    zIndex: 1002,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.9)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)',
          border: 'none',
          color: '#fff',
          fontSize: 24,
          cursor: 'pointer',
          zIndex: 1002,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ✕
      </button>

      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          style={{ ...btnStyle, left: 16 }}
        >
          ‹
        </button>
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          maxWidth: '90vw',
          maxHeight: '85vh',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <Image
          src={images[index]}
          alt={`Ảnh ${index + 1}`}
          width={900}
          height={600}
          style={{
            width: 'auto',
            height: 'auto',
            maxWidth: '90vw',
            maxHeight: '85vh',
            objectFit: 'contain',
            borderRadius: 8,
          }}
        />
      </div>

      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          style={{ ...btnStyle, right: 16 }}
        >
          ›
        </button>
      )}

      <div
        style={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.7)',
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 14,
        }}
      >
        {index + 1} / {images.length}
      </div>
    </motion.div>
  );
}

export default function GallerySection({
  galleryUrls,
  cfg = DEFAULT_SONGPHUNG_RED_CONFIG,
  editMode = false,
}: Props) {
  const galleryAssets: any = (cfg.assets as any).gallery || {};
  const flowerAsset = galleryAssets.flower || '/themes/songphung-red/flower.webp';
  const sectionTitle = (cfg.text_samples as any).gallery?.section_title || '';
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const safeUrls = galleryUrls || [];
  const hasImages = safeUrls.length > 0;
  const len = safeUrls.length;
  const displayUrls = safeUrls.slice(0, 4);
  const moreCount = len > 4 ? len - 4 : 0;

  const onClose = useCallback(() => setLightboxIndex(null), []);
  const onPrev = useCallback(() => {
    setLightboxIndex((i) => i !== null && len > 0 ? (i - 1 + len) % len : null);
  }, [len]);
  const onNext = useCallback(() => {
    setLightboxIndex((i) => i !== null && len > 0 ? (i + 1) % len : null);
  }, [len]);

  const placeholders = Array.from({ length: 4 }, (_, i) => i);

  return (
    <section
      ref={ref}
      style={{
        padding: '72px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background - flower LEFT */}
      <EditableSlot
        section="gallery"
        slot="flower"
        variant="absolute"
        editMode={editMode}
        hint="Đổi hoa trang trí Album"
        style={{
          top: -50,
          left: -100,
          width: 350,
          opacity: 0.30,
          zIndex: 0,
          pointerEvents: editMode ? 'auto' : 'none',
        }}
      >
        <Image
          src={flowerAsset}
          alt=""
          width={350}
          height={350}
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
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginBottom: 30,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <EditableText
          section="gallery"
          slot="section_title"
          value={sectionTitle}
          fallback="Album Ảnh Cưới"
          editMode={editMode}
        />
      </motion.h2>

      {/* 2x2 grid */}
      <div
        className="sp-gallery-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 280px)',
          gap: 20,
          justifyContent: 'center',
          maxWidth: 600,
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {hasImages
          ? displayUrls.map((url, i) => {
              const isLast = i === displayUrls.length - 1 && moreCount > 0;
              return (
                <motion.div
                  key={url}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.1 * i }}
                  onClick={() => setLightboxIndex(i)}
                  style={{
                    position: 'relative',
                    width: 280,
                    height: 280,
                    borderRadius: 10,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <Image
                    src={url}
                    alt={`Ảnh cưới ${i + 1}`}
                    fill
                    sizes="280px"
                    style={{ objectFit: 'cover', transition: 'transform 0.3s ease' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                    }}
                  />
                  {isLast && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        color: '#F8F2ED',
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 30,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 2,
                      }}
                    >
                      +{moreCount}
                    </div>
                  )}
                </motion.div>
              );
            })
          : placeholders.map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.1 * i }}
                style={{
                  width: 280,
                  height: 280,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #EDE8E1 0%, #D4C5B5 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 32,
                    color: '#5F191D',
                    opacity: 0.3,
                  }}
                >
                  ❦
                </span>
              </motion.div>
            ))}
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && hasImages && (
          <Lightbox
            images={safeUrls}
            index={lightboxIndex}
            onClose={onClose}
            onPrev={onPrev}
            onNext={onNext}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
