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
  groomParent: string;
  brideParent: string;
  groomPhotoUrl?: string;
  bridePhotoUrl?: string;
  groomAddress?: string;
  brideAddress?: string;
  registerParallax?: (el: HTMLElement | null, speed: number, template?: string) => void;
  cfg?: TemplateConfig;
  editMode?: boolean;
}

export default function FamilySection({ groomName, brideName, groomParent, brideParent, groomPhotoUrl, bridePhotoUrl, groomAddress, brideAddress, registerParallax, cfg = DEFAULT_SONGPHUNG_RED_CONFIG, editMode = false }: Props) {
  const familyAssets = cfg.assets.family || {};
  const flowerAsset = familyAssets.flower || '/themes/songphung-red/flower.webp';
  // allow config-level fallback when order doesn't provide a photo
  const effectiveGroomPhoto = groomPhotoUrl || familyAssets.groom_photo;
  const effectiveBridePhoto = bridePhotoUrl || familyAssets.bride_photo;
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      ref={ref}
      style={{
        position: 'relative',
        padding: '80px 24px 72px',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration - flower RIGHT, partially visible */}
      <EditableSlot
        section="family"
        slot="flower"
        variant="absolute"
        editMode={editMode}
        hint="Đổi hoa trang trí"
        style={{
          top: -40,
          right: -80,
          width: 450,
          opacity: 0.35,
          zIndex: 0,
          transform: 'scaleX(-1)',
          pointerEvents: editMode ? 'auto' : 'none',
        }}
      >
        <div
          ref={editMode ? undefined : (el) => registerParallax?.(el, 0.03)}
          data-parallax={editMode ? undefined : ''}
          style={{ width: '100%' }}
        >
          <Image
            src={flowerAsset}
            alt=""
            width={450}
            height={450}
            style={{ width: '100%', height: 'auto' }}
            unoptimized={flowerAsset.startsWith('/uploads/')}
          />
        </div>
      </EditableSlot>

      {/* Section Title */}
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
          zIndex: 2,
        }}
      >
        <EditableText
          section="family"
          slot="section_title"
          value={cfg.text_samples.family?.section_title || ''}
          fallback="Thông Tin Lễ Cưới"
          editMode={editMode}
        />
      </motion.h2>

      {/* Two columns with center divider */}
      <div
        style={{
          maxWidth: 900,
          margin: '0 auto 48px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div
          className="sp-family-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: 80,
            width: '100%',
            alignItems: 'start',
            padding: '0 50px',
          }}
        >
          {/* Left column - Bride's family */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            style={{ textAlign: 'center', padding: 20 }}
          >
            {(effectiveBridePhoto || editMode) && (
              <EditableSlot
                section="family"
                slot="bride_photo"
                editMode={editMode}
                hint="Đổi ảnh cô dâu (mẫu)"
                style={{
                  display: 'inline-block',
                  margin: '0 auto 16px',
                }}
              >
                <div style={{
                  width: 110, height: 110, borderRadius: '50%',
                  overflow: 'hidden',
                  border: '3px solid #5F191D',
                }}>
                  {effectiveBridePhoto ? (
                    <Image src={effectiveBridePhoto} alt={brideName}
                      width={110} height={110}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      unoptimized={effectiveBridePhoto.startsWith('/uploads/')}
                    />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%',
                      background: '#F5EAE0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, color: '#9CA3AF',
                    }}>
                      Cô dâu
                    </div>
                  )}
                </div>
              </EditableSlot>
            )}
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 18,
                fontWeight: 700,
                color: '#5F191D',
                marginBottom: 10,
              }}
            >
              Ông Bà
            </p>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 16,
                fontWeight: 700,
                color: '#5F191D',
                lineHeight: 1.6,
                margin: '5px 0',
              }}
            >
              {brideParent}
            </p>
            {brideAddress && (
              <p style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 14, color: '#5F191D', fontStyle: 'italic',
                opacity: 0.8, marginTop: 8,
              }}>
                {brideAddress}
              </p>
            )}
          </motion.div>

          {/* Center divider */}
          <motion.div
            className="sp-family-divider"
            initial={{ opacity: 0, scaleY: 0 }}
            animate={isInView ? { opacity: 1, scaleY: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{
              width: 1,
              background: '#5F191D',
              minHeight: 120,
              alignSelf: 'stretch',
              transformOrigin: 'top',
              opacity: 0.3,
            }}
          />

          {/* Right column - Groom's family */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.5 }}
            style={{ textAlign: 'center', padding: 20 }}
          >
            {(effectiveGroomPhoto || editMode) && (
              <EditableSlot
                section="family"
                slot="groom_photo"
                editMode={editMode}
                hint="Đổi ảnh chú rể (mẫu)"
                style={{
                  display: 'inline-block',
                  margin: '0 auto 16px',
                }}
              >
                <div style={{
                  width: 110, height: 110, borderRadius: '50%',
                  overflow: 'hidden',
                  border: '3px solid #5F191D',
                }}>
                  {effectiveGroomPhoto ? (
                    <Image src={effectiveGroomPhoto} alt={groomName}
                      width={110} height={110}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      unoptimized={effectiveGroomPhoto.startsWith('/uploads/')}
                    />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%',
                      background: '#F5EAE0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, color: '#9CA3AF',
                    }}>
                      Chú rể
                    </div>
                  )}
                </div>
              </EditableSlot>
            )}
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 18,
                fontWeight: 700,
                color: '#5F191D',
                marginBottom: 10,
              }}
            >
              Ông Bà
            </p>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 16,
                fontWeight: 700,
                color: '#5F191D',
                lineHeight: 1.6,
                margin: '5px 0',
              }}
            >
              {groomParent}
            </p>
            {groomAddress && (
              <p style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 14, color: '#5F191D', fontStyle: 'italic',
                opacity: 0.8, marginTop: 8,
              }}>
                {groomAddress}
              </p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Invitation text */}
      <motion.p
        className="sp-invite-text"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.6 }}
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 14,
          color: '#5F191D',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: 1,
          lineHeight: 1.8,
          maxWidth: 600,
          margin: '0 auto 40px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        Trân trọng kính mời quý khách tới lễ thành hôn của con chúng tôi
      </motion.p>

      {/* Couple names large */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.7 }}
        style={{
          textAlign: 'center',
          position: 'relative',
          zIndex: 2,
          marginTop: 40,
          marginBottom: 40,
        }}
      >
        <h3
          className="sp-couple-name-large"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 48,
            fontWeight: 700,
            fontStyle: 'italic',
            color: '#5F191D',
            lineHeight: 1.2,
            margin: 0,
          }}
        >
          {groomName}
        </h3>
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 16,
            color: '#5F191D',
            textTransform: 'uppercase',
            marginTop: 5,
            marginBottom: 15,
            opacity: 0.9,
          }}
        >
          Chú Rể
        </p>

        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.9 }}
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 36,
            fontStyle: 'italic',
            color: '#C8963C',
            fontWeight: 300,
            display: 'block',
            margin: '15px 0',
          }}
        >
          &amp;
        </motion.span>

        <h3
          className="sp-couple-name-large"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 48,
            fontWeight: 700,
            fontStyle: 'italic',
            color: '#5F191D',
            lineHeight: 1.2,
            margin: 0,
          }}
        >
          {brideName}
        </h3>
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 16,
            color: '#5F191D',
            textTransform: 'uppercase',
            marginTop: 5,
            marginBottom: 15,
            opacity: 0.9,
          }}
        >
          Cô Dâu
        </p>
      </motion.div>
    </section>
  );
}
