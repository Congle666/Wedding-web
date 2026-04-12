'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import dayjs from 'dayjs';
import type { TemplateConfig } from '@/types/templateConfig';
import { DEFAULT_SONGPHUNG_RED_CONFIG } from '@/types/templateConfig';
import { EditableSlot, EditableText } from './editModeHelpers';

interface Props {
  groomName: string;
  brideName: string;
  weddingDate: string;
  guestName?: string;
  onOpen?: () => void;
  cfg?: TemplateConfig;
  editMode?: boolean;
}

export default function CoverSection({
  groomName,
  brideName,
  weddingDate,
  guestName,
  onOpen,
  cfg = DEFAULT_SONGPHUNG_RED_CONFIG,
  editMode = false,
}: Props) {
  const coverAssets = cfg.assets.cover || {};
  const coverText = cfg.text_samples.cover || {};
  const primary = cfg.colors.primary;
  const bg = cfg.colors.background;
  const fontHeading = `'${cfg.fonts.heading}', serif`;
  const phoenixLeft = coverAssets.phoenix_left || '/themes/songphung-red/phoenix.webp';
  const phoenixRight = coverAssets.phoenix_right || '/themes/songphung-red/phoenix2.webp';
  const flowerTl = coverAssets.flower_tl || '/themes/songphung-red/flower.webp';
  const flowerBr = coverAssets.flower_br || '/themes/songphung-red/flower.webp';
  const chuHy = coverAssets.chu_hy || '/themes/songphung-red/chu-hy.webp';
  const paperBg = coverAssets.paper_bg || '/themes/songphung-red/paper-bg.jpg';
  const [opened, setOpened] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {}, []);

  const formattedDate = useMemo(() => {
    const d = dayjs(weddingDate);
    return `${d.format('DD')} tháng ${d.month() + 1}, ${d.format('YYYY')}`;
  }, [weddingDate]);

  const handleOpen = useCallback(() => {
    // In edit mode the cover stays open so admin can keep editing it.
    if (editMode) return;
    setOpened(true);
    if (onOpen) onOpen();

    // Đợi animation cover fade out xong rồi remove
    setTimeout(() => {
      setShouldRender(false);
      // Scroll về đầu trang mượt
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1200);
  }, [onOpen, editMode]);

  if (!shouldRender) return null;

  return (
    <AnimatePresence>
      {shouldRender && (
        <motion.section
          initial={{ opacity: 1 }}
          animate={opened ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            zIndex: 100,
          }}
        >
          {/* Card */}
          <motion.div
            className="sp-cover-card"
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={opened
              ? { opacity: 0, y: -40, scale: 0.9 }
              : { opacity: 1, y: 0, scale: 1 }
            }
            transition={{ duration: opened ? 0.8 : 0.8, ease: 'easeOut' }}
            style={{
              position: 'relative',
              zIndex: 10,
              backgroundColor: bg,
              backgroundImage: `url(${paperBg})`,
              ...(editMode ? { outline: '1px dashed rgba(139,26,26,0.3)' } : {}),
              backgroundSize: '600px auto',
              backgroundRepeat: 'repeat',
              borderRadius: 16,
              width: '90%',
              maxWidth: 550,
              padding: '48px 32px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'visible',
            }}
          >
            {/* Phoenix LEFT - lower position (asymmetric) */}
            <EditableSlot
              section="cover"
              slot="phoenix_left"
              variant="absolute"
              editMode={editMode}
              hint="Bấm để đổi phượng hoàng trái"
              style={{
                bottom: -30,
                left: -25,
                width: 200,
                zIndex: -1,
                pointerEvents: editMode ? 'auto' : 'none',
              }}
            >
              <div className="sp-cover-phoenix-left" style={{ width: '100%' }}>
                <Image
                  src={phoenixLeft}
                  alt=""
                  width={200}
                  height={350}
                  style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                  priority
                  unoptimized={phoenixLeft.startsWith('/uploads/')}
                />
              </div>
            </EditableSlot>

            {/* Phoenix RIGHT - higher position (asymmetric), mirrored */}
            <EditableSlot
              section="cover"
              slot="phoenix_right"
              variant="absolute"
              editMode={editMode}
              hint="Bấm để đổi phượng hoàng phải"
              style={{
                top: -50,
                right: -25,
                width: 200,
                zIndex: -1,
                transform: 'scaleX(-1)',
                pointerEvents: editMode ? 'auto' : 'none',
              }}
            >
              <div className="sp-cover-phoenix-right" style={{ width: '100%' }}>
                <Image
                  src={phoenixRight}
                  alt=""
                  width={200}
                  height={350}
                  style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                  priority
                  unoptimized={phoenixRight.startsWith('/uploads/')}
                />
              </div>
            </EditableSlot>

            {/* Flower bottom-left */}
            <EditableSlot
              section="cover"
              slot="flower_br"
              variant="absolute"
              editMode={editMode}
              hint="Bấm để đổi hoa góc dưới"
              style={{
                bottom: -15,
                left: 80,
                width: 130,
                opacity: 0.7,
                zIndex: -1,
                pointerEvents: editMode ? 'auto' : 'none',
              }}
            >
              <div className="sp-cover-flower" style={{ width: '100%' }}>
                <Image
                  src={flowerBr}
                  alt=""
                  width={130}
                  height={130}
                  style={{ width: '100%', height: 'auto' }}
                  unoptimized={flowerBr.startsWith('/uploads/')}
                />
              </div>
            </EditableSlot>

            {/* Flower top-right */}
            <EditableSlot
              section="cover"
              slot="flower_tl"
              variant="absolute"
              editMode={editMode}
              hint="Bấm để đổi hoa góc trên"
              style={{
                top: -10,
                right: 50,
                width: 110,
                opacity: 0.5,
                zIndex: -1,
                transform: 'rotate(180deg)',
                pointerEvents: editMode ? 'auto' : 'none',
              }}
            >
              <div className="sp-cover-flower" style={{ width: '100%' }}>
                <Image
                  src={flowerTl}
                  alt=""
                  width={110}
                  height={110}
                  style={{ width: '100%', height: 'auto' }}
                  unoptimized={flowerTl.startsWith('/uploads/')}
                />
              </div>
            </EditableSlot>

            {/* Double Happiness icon */}
            <EditableSlot
              section="cover"
              slot="chu_hy"
              editMode={editMode}
              hint="Bấm để đổi chữ Hỷ"
              style={{ marginBottom: 20 }}
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6, type: 'spring' }}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Image
                  src={chuHy}
                  alt="Hỷ"
                  width={28}
                  height={28}
                  style={{ width: 28, height: 28, objectFit: 'contain' }}
                  unoptimized={chuHy.startsWith('/uploads/')}
                />
              </motion.div>
            </EditableSlot>

            {/* Bride Name */}
            <motion.h1
              className="sp-cover-name"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              style={{
                fontFamily: fontHeading,
                fontSize: 40,
                fontWeight: 700,
                fontStyle: 'italic',
                color: primary,
                lineHeight: 1.2,
                margin: 0,
                letterSpacing: 1.5,
              }}
            >
              {brideName}
            </motion.h1>

            {/* & */}
            <motion.span
              className="sp-cover-amp"
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              style={{
                fontFamily: fontHeading,
                fontSize: 26,
                fontStyle: 'italic',
                color: primary,
                fontWeight: 300,
                margin: '4px 0',
              }}
            >
              &amp;
            </motion.span>

            {/* Groom Name */}
            <motion.h1
              className="sp-cover-name"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.7 }}
              style={{
                fontFamily: fontHeading,
                fontSize: 40,
                fontWeight: 700,
                fontStyle: 'italic',
                color: primary,
                lineHeight: 1.2,
                margin: 0,
                letterSpacing: 1.5,
              }}
            >
              {groomName}
            </motion.h1>

            {/* Decorative divider */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.6 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                margin: '16px 0',
              }}
            >
              <div style={{ width: 60, height: 1, backgroundColor: primary, opacity: 0.4 }} />
              <Image
                src={chuHy}
                alt=""
                width={16}
                height={16}
                style={{ width: 16, height: 16, objectFit: 'contain', opacity: 0.6 }}
                unoptimized={chuHy.startsWith('/uploads/')}
              />
              <div style={{ width: 60, height: 1, backgroundColor: primary, opacity: 0.4 }} />
            </motion.div>

            {/* Date */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              style={{
                fontFamily: fontHeading,
                fontSize: 18,
                color: primary,
                letterSpacing: 1.5,
                margin: '0 0 12px',
              }}
            >
              {formattedDate}
            </motion.p>

            {/* Invitation text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              style={{
                fontFamily: fontHeading,
                fontSize: 17,
                fontStyle: 'italic',
                color: primary,
                margin: '8px 0 0',
                lineHeight: 1.5,
              }}
            >
              <EditableText
                section="cover"
                slot="invitation_greeting"
                value={coverText.invitation_greeting || ''}
                fallback="Thân Mời"
                editMode={editMode}
              />
            </motion.p>

            {/* Guest name (if available) */}
            {guestName && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 0.6 }}
                style={{
                  marginTop: 8,
                  padding: '8px 24px',
                  border: '1px solid rgba(95,25,29,0.3)',
                  borderRadius: 8,
                  backgroundColor: 'rgba(255,255,255,0.5)',
                }}
              >
                <p
                  style={{
                    fontFamily: fontHeading,
                    fontSize: 22,
                    fontWeight: 700,
                    color: primary,
                    margin: 0,
                  }}
                >
                  {guestName}
                </p>
              </motion.div>
            )}

            {/* Sub text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.5 }}
              style={{
                fontFamily: fontHeading,
                fontSize: 14,
                fontStyle: 'italic',
                color: primary,
                margin: '8px 0 0',
                opacity: 0.8,
              }}
            >
              <EditableText
                section="cover"
                slot="invitation_subtext"
                value={coverText.invitation_subtext || ''}
                fallback="đến dự buổi tiệc chung vui cùng gia đình"
                editMode={editMode}
              />
            </motion.p>

            {/* Open button */}
            <motion.button
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6, duration: 0.6 }}
              whileHover={{ scale: 1.05, backgroundColor: '#8C2B30' }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpen}
              style={{
                marginTop: 24,
                width: 160,
                height: 48,
                padding: '0 40px',
                backgroundColor: primary,
                color: bg,
                border: 'none',
                borderRadius: 25,
                fontFamily: fontHeading,
                fontSize: 18,
                fontWeight: 600,
                cursor: 'pointer',
                letterSpacing: 0.5,
              }}
            >
              <EditableText
                section="cover"
                slot="button_label"
                value={coverText.button_label || ''}
                fallback="Mở thiệp"
                editMode={editMode}
              />
            </motion.button>
          </motion.div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
