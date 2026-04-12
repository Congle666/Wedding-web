'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import dayjs from 'dayjs';
import type { Wish } from '@/app/w/[slug]/page';
import type { TemplateConfig } from '@/types/templateConfig';
import { DEFAULT_SONGPHUNG_RED_CONFIG } from '@/types/templateConfig';
import { EditableSlot, EditableText } from './editModeHelpers';

interface Props {
  wishes: Wish[];
  slug: string;
  cfg?: TemplateConfig;
  editMode?: boolean;
}

export default function WishesSection({
  wishes: initialWishes,
  slug,
  cfg = DEFAULT_SONGPHUNG_RED_CONFIG,
  editMode = false,
}: Props) {
  const wishesAssets: any = (cfg.assets as any).wishes || {};
  const decorPhoenix = wishesAssets.decor_phoenix || '/themes/songphung-red/phoenix-line.webp';
  const decorFlower  = wishesAssets.decor_flower  || '/themes/songphung-red/flower.webp';
  const sectionTitle = cfg.text_samples.wishes?.section_title || '';
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const [wishesList, setWishesList] = useState<Wish[]>(initialWishes || []);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setSubmitting(true);

    const optimisticWish: Wish = {
      id: `temp-${Date.now()}`,
      guest_name: name.trim(),
      message: message.trim(),
      created_at: new Date().toISOString(),
    };

    setWishesList((prev) => [optimisticWish, ...prev]);
    setName('');
    setMessage('');

    try {
      await fetch(`/api/wedding/${slug}/wishes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_name: optimisticWish.guest_name,
          message: optimisticWish.message,
        }),
      });
    } catch {
      // keep optimistic update
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: 'calc(100% - 20px)',
    padding: 12,
    border: '1px solid #ccc',
    borderRadius: 8,
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 16,
    color: '#333',
    outline: 'none',
    transition: 'border-color 0.3s',
    marginBottom: 20,
  };

  return (
    <section
      ref={ref}
      style={{
        padding: '72px 24px 50px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background - decor phoenix bottom-right */}
      <EditableSlot
        section="wishes"
        slot="decor_phoenix"
        variant="absolute"
        editMode={editMode}
        hint="Đổi phượng decor (Sổ lưu bút)"
        style={{
          bottom: -80,
          right: -150,
          width: 350,
          opacity: 0.25,
          zIndex: 0,
          transform: 'scaleX(-1)',
          pointerEvents: editMode ? 'auto' : 'none',
        }}
      >
        <Image
          src={decorPhoenix}
          alt=""
          width={350}
          height={612}
          style={{ width: '100%', height: 'auto' }}
          unoptimized={decorPhoenix.startsWith('/uploads/')}
        />
      </EditableSlot>

      {/* Background - decor flower bottom-left */}
      <EditableSlot
        section="wishes"
        slot="decor_flower"
        variant="absolute"
        editMode={editMode}
        hint="Đổi hoa decor (Sổ lưu bút)"
        style={{
          bottom: -50,
          left: -80,
          width: 350,
          opacity: 0.30,
          zIndex: 0,
          pointerEvents: editMode ? 'auto' : 'none',
        }}
      >
        <Image
          src={decorFlower}
          alt=""
          width={350}
          height={350}
          style={{ width: '100%', height: 'auto' }}
          unoptimized={decorFlower.startsWith('/uploads/')}
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
          marginBottom: 30,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <EditableText
          section="wishes"
          slot="section_title"
          value={sectionTitle}
          fallback="Sổ lưu bút"
          editMode={editMode}
        />
      </motion.h2>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.3 }}
        onSubmit={handleSubmit}
        style={{
          width: '60%',
          maxWidth: 600,
          margin: '0 auto 50px',
          backgroundColor: '#FFF',
          borderRadius: 10,
          padding: 30,
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.08)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tên của bạn"
          required
          style={inputStyle}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#5F191D'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#ccc'; }}
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Để lại lời chúc của bạn"
          required
          rows={4}
          style={{
            ...inputStyle,
            resize: 'vertical',
            minHeight: 100,
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#5F191D'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#ccc'; }}
        />
        <div style={{ textAlign: 'center' }}>
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: 150,
              height: 45,
              backgroundColor: '#5F191D',
              color: '#F8F2ED',
              border: 'none',
              borderRadius: 25,
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 18,
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
              transition: 'background-color 0.3s ease, transform 0.3s ease',
            }}
          >
            {submitting ? 'Đang gửi...' : 'GỬI LỜI CHÚC'}
          </button>
        </div>
      </motion.form>

      {/* Wishes list */}
      {wishesList.length > 0 && (
        <div
          style={{
            width: '60%',
            maxWidth: 600,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 15,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {wishesList.map((w, i) => (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              style={{
                backgroundColor: '#FDF4F4',
                borderRadius: 10,
                padding: 20,
                boxShadow: '0 3px 10px rgba(0, 0, 0, 0.05)',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 18,
                    color: '#5F191D',
                    fontWeight: 700,
                  }}
                >
                  {w.guest_name}
                </span>
                <span
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 13,
                    color: '#777',
                    opacity: 0.8,
                  }}
                >
                  {dayjs(w.created_at).format('HH:mm DD/MM/YYYY')}
                </span>
              </div>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 16,
                  color: '#333',
                  lineHeight: 1.6,
                  margin: 0,
                  wordBreak: 'break-word',
                }}
              >
                {w.message}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
