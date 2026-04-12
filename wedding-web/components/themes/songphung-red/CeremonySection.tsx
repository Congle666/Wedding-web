'use client';

import { useRef, useState, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import dayjs from 'dayjs';
import type { TemplateConfig } from '@/types/templateConfig';
import { DEFAULT_SONGPHUNG_RED_CONFIG } from '@/types/templateConfig';
import { EditableSlot, EditableText } from './editModeHelpers';

interface Props {
  weddingTime: string;
  weddingDate: string;
  ceremonyVenue: string;
  receptionVenue: string;
  venueAddress: string;
  mapsEmbedUrl: string;
  slug: string;
  ceremonyTime?: string;
  ceremonyAddress?: string;
  ceremonyMapsUrl?: string;
  receptionTime?: string;
  receptionAddress?: string;
  receptionMapsUrl?: string;
  lunarDate?: string;
  registerParallax?: (el: HTMLElement | null, speed: number, template?: string) => void;
  cfg?: TemplateConfig;
  editMode?: boolean;
}

function formatGoogleCalendarDate(dateStr: string, timeStr: string): string {
  const d = dayjs(dateStr);
  const timeParts = timeStr.match(/(\d{1,2}):(\d{2})/);
  const hour = timeParts ? parseInt(timeParts[1], 10) : 10;
  const minute = timeParts ? parseInt(timeParts[2], 10) : 0;
  const start = d.hour(hour).minute(minute).second(0);
  const end = start.add(2, 'hour');
  const fmt = (dt: dayjs.Dayjs) => dt.format('YYYYMMDD') + 'T' + dt.format('HHmmss');
  return `${fmt(start)}/${fmt(end)}`;
}

function getLunarDateDisplay(dateStr: string, lunarDate?: string): string | null {
  if (lunarDate) {
    return `(Tức ngày ${lunarDate})`;
  }
  return null;
}

export default function CeremonySection({
  weddingTime,
  weddingDate,
  ceremonyVenue,
  receptionVenue,
  venueAddress,
  mapsEmbedUrl,
  ceremonyTime,
  ceremonyAddress,
  ceremonyMapsUrl,
  receptionTime,
  receptionAddress,
  receptionMapsUrl,
  lunarDate,
  slug,
  registerParallax,
  cfg = DEFAULT_SONGPHUNG_RED_CONFIG,
  editMode = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  // Ceremony decor slots — admin can override each piece via cfg.assets.ceremony.*
  const ceremonyAssets: any = cfg.assets.ceremony || {};
  const decorTopLeft  = ceremonyAssets.decor_top_left  || '/themes/songphung-red/phoenix-line.webp';
  const decorBottomRight = ceremonyAssets.decor_bottom_right || '/themes/songphung-red/phoenix-line.webp';
  const decorFlower   = ceremonyAssets.decor_flower   || '/themes/songphung-red/flower.webp';
  const d = dayjs(weddingDate);
  const formattedDate = d.format('DD/MM/YYYY');
  const dayOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'][d.day()];

  const timeParts = weddingTime.match(/(\d{1,2}):(\d{2})/);
  const hour = timeParts ? parseInt(timeParts[1], 10) : 10;
  const minute = timeParts ? parseInt(timeParts[2], 10) : 0;
  const donKhachTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  const feasHour = minute + 30 >= 60 ? hour + 1 : hour;
  const feasMinute = minute + 30 >= 60 ? minute + 30 - 60 : minute + 30;
  const khaiTiecTime = `${String(feasHour).padStart(2, '0')}:${String(feasMinute).padStart(2, '0')}`;

  const [rsvpName, setRsvpName] = useState('');
  const [rsvpPhone, setRsvpPhone] = useState('');
  const [rsvpAttending, setRsvpAttending] = useState<'yes' | 'no'>('yes');
  const [rsvpCount, setRsvpCount] = useState('1');
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);

  const handleAddToCalendar = useCallback(() => {
    const dates = formatGoogleCalendarDate(weddingDate, weddingTime);
    const calTitle = encodeURIComponent(`Lễ cưới - ${receptionVenue}`);
    const details = encodeURIComponent(`Tiệc cưới\nThời gian: ${weddingTime}, ${formattedDate}\nĐịa điểm: ${receptionVenue}\nĐịa chỉ: ${venueAddress}`);
    const location = encodeURIComponent(`${receptionVenue}, ${venueAddress}`);
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${calTitle}&dates=${dates}&details=${details}&location=${location}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [weddingDate, weddingTime, receptionVenue, venueAddress, formattedDate]);

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName.trim()) return;
    setRsvpSubmitting(true);
    try {
      await fetch(`/api/wedding/${slug}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: rsvpName.trim(),
          phone: rsvpPhone.trim(),
          attending: rsvpAttending === 'yes',
          guest_count: parseInt(rsvpCount) || 1,
          wishes: '',
        }),
      });
      setRsvpSubmitted(true);
    } catch {} finally {
      setRsvpSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    background: '#fff',
    border: '1px solid #ccc',
    borderRadius: 8,
    color: '#333',
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 16,
    outline: 'none',
    transition: 'border-color 0.3s',
  };

  return (
    <section
      ref={ref}
      style={{
        position: 'relative',
        padding: '72px 24px',
        overflow: 'hidden',
      }}
    >
      {/* Background - decor top-left (default phoenix-line) */}
      <EditableSlot
        section="ceremony"
        slot="decor_top_left"
        variant="absolute"
        editMode={editMode}
        hint="Đổi decor góc trên trái (Lễ cưới)"
        style={{
          top: -40,
          left: -120,
          width: 350,
          opacity: 0.30,
          zIndex: 0,
          pointerEvents: editMode ? 'auto' : 'none',
        }}
      >
        <div
          ref={editMode ? undefined : (el) => registerParallax?.(el, -0.02)}
          data-parallax={editMode ? undefined : ''}
          style={{ width: '100%' }}
        >
          <Image
            src={decorTopLeft}
            alt=""
            width={350}
            height={612}
            style={{ width: '100%', height: 'auto' }}
            unoptimized={decorTopLeft.startsWith('/uploads/')}
          />
        </div>
      </EditableSlot>

      {/* Background - decor bottom-right */}
      <EditableSlot
        section="ceremony"
        slot="decor_bottom_right"
        variant="absolute"
        editMode={editMode}
        hint="Đổi decor góc dưới phải"
        style={{
          bottom: -80,
          right: -140,
          width: 400,
          opacity: 0.25,
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
            src={decorBottomRight}
            alt=""
            width={400}
            height={700}
            style={{ width: '100%', height: 'auto' }}
            unoptimized={decorBottomRight.startsWith('/uploads/')}
          />
        </div>
      </EditableSlot>

      {/* Background - decor flower bottom-left */}
      <EditableSlot
        section="ceremony"
        slot="decor_flower"
        variant="absolute"
        editMode={editMode}
        hint="Đổi hoa trang trí góc dưới trái"
        style={{
          bottom: -60,
          left: -100,
          width: 400,
          opacity: 0.30,
          zIndex: 0,
          pointerEvents: editMode ? 'auto' : 'none',
        }}
      >
        <div
          ref={editMode ? undefined : (el) => registerParallax?.(el, 0.04)}
          data-parallax={editMode ? undefined : ''}
          style={{ width: '100%' }}
        >
          <Image
            src={decorFlower}
            alt=""
            width={400}
            height={400}
            style={{ width: '100%', height: 'auto' }}
            unoptimized={decorFlower.startsWith('/uploads/')}
          />
        </div>
      </EditableSlot>

      {/* Lễ Gia Tiên (chỉ hiện khi có ceremony riêng) */}
      {(ceremonyTime || ceremonyAddress) && (
        <motion.div
          className="sp-ceremony-detail"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15 }}
          style={{
            maxWidth: 600,
            margin: '0 auto 40px',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
            padding: '40px 32px',
            background: 'rgba(255,255,255,0.4)',
            borderRadius: 12,
          }}
        >
          <h3 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 22, fontWeight: 700, color: '#5F191D',
            textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16,
          }}>
            Lễ Gia Tiên
          </h3>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 36, fontWeight: 700, color: '#5F191D', marginBottom: 8,
          }}>
            {ceremonyTime || weddingTime}
          </div>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 16, color: '#5F191D', marginBottom: 4,
          }}>
            {ceremonyVenue}
          </p>
          {ceremonyAddress && (
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 14, color: '#5F191D', opacity: 0.8, fontStyle: 'italic',
            }}>
              {ceremonyAddress}
            </p>
          )}
        </motion.div>
      )}

      {/* Tiệc Cưới (main event) */}
      <motion.div
        className="sp-ceremony-detail"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.2 }}
        style={{
          maxWidth: 600,
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
          padding: '48px 32px',
        }}
      >
        {/* Big time display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
          style={{ marginBottom: 20 }}
        >
          <div
            className="sp-ceremony-time-big"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 48,
              fontWeight: 700,
              color: '#5F191D',
              lineHeight: 1,
              marginBottom: 10,
            }}
          >
            {receptionTime || weddingTime}
          </div>

          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 20,
              color: '#5F191D',
              fontWeight: 500,
              marginBottom: 5,
            }}
          >
            {dayOfWeek.toUpperCase()} {d.format('DD')} THÁNG {String(d.month() + 1).padStart(2, '0')}
          </p>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 20,
              color: '#5F191D',
              fontWeight: 500,
              marginBottom: 5,
            }}
          >
            {d.format('YYYY')}
          </p>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 16,
              color: '#5F191D',
              fontStyle: 'italic',
              opacity: 0.8,
            }}
          >
            {getLunarDateDisplay(weddingDate, lunarDate)}
          </p>
        </motion.div>

        {/* Don khach / Khai tiec */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 40,
            marginBottom: 30,
            marginTop: 20,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 18,
                color: '#5F191D',
              }}
            >
              ĐÓN KHÁCH
            </span>
            <span
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 20,
                fontWeight: 700,
                color: '#5F191D',
                marginTop: 5,
              }}
            >
              {donKhachTime}
            </span>
          </div>
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 18,
                color: '#5F191D',
              }}
            >
              KHAI TIỆC
            </span>
            <span
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 20,
                fontWeight: 700,
                color: '#5F191D',
                marginTop: 5,
              }}
            >
              {khaiTiecTime}
            </span>
          </div>
        </motion.div>

        {/* Add to calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.6 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            marginBottom: 30,
          }}
        >
          <a
            onClick={handleAddToCalendar}
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 16,
              color: '#5F191D',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            Thêm vào lịch
          </a>
          <a
            href={`/api/wedding/${slug}/calendar.ics`}
            download
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 14,
              color: '#5F191D',
              textDecoration: 'underline',
              cursor: 'pointer',
              opacity: 0.7,
            }}
          >
            Tải file .ics (Apple/Outlook)
          </a>
        </motion.div>

        {/* RSVP form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.7 }}
          style={{ marginBottom: 8 }}
        >
          {rsvpSubmitted ? (
            <div
              style={{
                textAlign: 'center',
                padding: '32px 24px',
                background: '#fff',
                borderRadius: 10,
                border: '1px solid #ddd',
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: '#E8F5E9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: 24,
                  color: '#2E7D32',
                }}
              >
                ✓
              </div>
              <h3
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 24,
                  color: '#5F191D',
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                Cảm ơn bạn!
              </h3>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 16,
                  color: '#5F191D',
                }}
              >
                Chúng tôi đã nhận được phản hồi của bạn.
              </p>
            </div>
          ) : (
            <form
              className="sp-rsvp-form"
              onSubmit={handleRsvpSubmit}
              style={{
                background: '#fff',
                borderRadius: 10,
                padding: '30px',
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <input
                type="text"
                value={rsvpName}
                onChange={(e) => setRsvpName(e.target.value)}
                placeholder="Họ và tên *"
                required
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#5F191D'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#ccc'; }}
              />
              <input
                type="tel"
                value={rsvpPhone}
                onChange={(e) => setRsvpPhone(e.target.value)}
                placeholder="Số điện thoại"
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#5F191D'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#ccc'; }}
              />

              <div style={{ display: 'flex', gap: 24 }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 16,
                    color: '#5F191D',
                  }}
                >
                  <input
                    type="radio"
                    name="rsvp-attending"
                    checked={rsvpAttending === 'yes'}
                    onChange={() => setRsvpAttending('yes')}
                    style={{ accentColor: '#5F191D', width: 16, height: 16 }}
                  />
                  Tham dự
                </label>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 16,
                    color: '#5F191D',
                  }}
                >
                  <input
                    type="radio"
                    name="rsvp-attending"
                    checked={rsvpAttending === 'no'}
                    onChange={() => setRsvpAttending('no')}
                    style={{ accentColor: '#5F191D', width: 16, height: 16 }}
                  />
                  Không tham dự
                </label>
              </div>

              {rsvpAttending === 'yes' && (
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={rsvpCount}
                  onChange={(e) => setRsvpCount(e.target.value)}
                  placeholder="Số khách"
                  style={{ ...inputStyle, maxWidth: 140 }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#5F191D'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = '#ccc'; }}
                />
              )}

              <button
                type="submit"
                disabled={rsvpSubmitting}
                style={{
                  width: 220,
                  height: 55,
                  padding: '0',
                  backgroundColor: '#5F191D',
                  color: '#F8F2ED',
                  border: 'none',
                  borderRadius: 30,
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 20,
                  fontWeight: 700,
                  cursor: rsvpSubmitting ? 'not-allowed' : 'pointer',
                  opacity: rsvpSubmitting ? 0.7 : 1,
                  transition: 'background-color 0.3s ease, transform 0.3s ease',
                  textTransform: 'uppercase',
                  alignSelf: 'center',
                }}
              >
                {rsvpSubmitting ? 'Đang gửi...' : 'Xác Nhận Tham Dự'}
              </button>
            </form>
          )}
        </motion.div>
      </motion.div>

      {/* Venue section */}
      {mapsEmbedUrl && mapsEmbedUrl.trim() !== '' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.8 }}
          style={{
            marginTop: 60,
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <h3
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 24,
              fontWeight: 700,
              color: '#5F191D',
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 20,
            }}
          >
            Tiệc cưới sẽ tổ chức tại
          </h3>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 16,
              color: '#5F191D',
              lineHeight: 1.5,
              marginBottom: 30,
            }}
          >
            {receptionVenue}, {venueAddress}
          </p>
          <div
            style={{
              width: '80%',
              maxWidth: 800,
              height: 400,
              borderRadius: 10,
              border: '1px solid #ddd',
              overflow: 'hidden',
              margin: '0 auto',
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
            }}
          >
            <iframe
              src={mapsEmbedUrl}
              style={{
                width: '100%',
                height: '100%',
                border: 0,
              }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Bản đồ địa điểm tổ chức"
            />
          </div>
        </motion.div>
      )}
    </section>
  );
}
