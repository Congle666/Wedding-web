'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { WeddingData } from '@/app/w/[slug]/page';
import type { BuilderConfig, BlockInstance, GlobalStyles } from '@/types/builderConfig';
import DynamicElement from './DynamicElement';

interface Props {
  data: WeddingData;
  config: BuilderConfig;
}

/**
 * Renders a wedding invitation from a BuilderConfig v2.0.
 * Iterates over `config.blocks[]`, renders each block with its positioned
 * elements (decorative images, text) + structural wedding data content.
 *
 * This replaces the fixed SongPhungTheme for v2.0 templates.
 * v1.0 templates still use SongPhungTheme (version detection in page.tsx).
 */
export default function DynamicThemeRenderer({ data, config }: Props) {
  const gs = config.globalStyles;
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleMusic = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(data.music_url || gs.musicUrl || '/themes/songphung-red/music.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isPlaying, data.music_url, gs.musicUrl]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Dynamic Google Fonts loader
  useEffect(() => {
    const fonts = [gs.fonts.heading, gs.fonts.body].filter(Boolean);
    fonts.forEach((family) => {
      const id = `dyn-font-${family.replace(/\s+/g, '-')}`;
      if (document.getElementById(id)) return;
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@300;400;500;600;700&display=swap`;
      document.head.appendChild(link);
    });
  }, [gs.fonts.heading, gs.fonts.body]);

  const visibleBlocks = config.blocks.filter((b) => b.visible !== false);

  return (
    <div style={{ backgroundColor: '#E8D5C4', minHeight: '100vh' }}>
      <div
        style={{
          overflow: 'hidden',
          backgroundColor: gs.colors.background,
          backgroundImage: gs.paperBg ? `url(${gs.paperBg})` : undefined,
          backgroundSize: '800px auto',
          backgroundRepeat: 'repeat',
          maxWidth: 800,
          margin: '0 auto',
          boxShadow: '0 0 60px rgba(0,0,0,0.15)',
          position: 'relative',
          fontFamily: `'${gs.fonts.body}', sans-serif`,
        }}
      >
        {visibleBlocks.map((block) => (
          <DynamicBlock
            key={block.id}
            block={block}
            globalStyles={gs}
            weddingData={data}
          />
        ))}

        {/* Music button */}
        <button
          onClick={toggleMusic}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 200,
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: gs.colors.primary,
            color: gs.colors.background,
            border: 'none',
            cursor: 'pointer',
            fontSize: 20,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
          }}
        >
          {isPlaying ? '♫' : '♪'}
        </button>
      </div>
    </div>
  );
}

/**
 * Renders a single block — positioned decorative elements overlay the
 * structural content area.
 */
function DynamicBlock({
  block,
  globalStyles: gs,
  weddingData,
}: {
  block: BlockInstance;
  globalStyles: GlobalStyles;
  weddingData: WeddingData;
}) {
  const isCover = block.blockType.includes('cover');
  const isFooter = block.blockType.includes('footer');
  const bgColor = isCover || isFooter ? gs.colors.primary : 'transparent';
  const textColor = isCover || isFooter ? gs.colors.background : gs.colors.text;

  return (
    <section
      style={{
        position: 'relative',
        minHeight: isCover ? 500 : 200,
        overflow: 'hidden',
        backgroundColor: bgColor,
      }}
    >
      {/* Decorative elements at their absolute positions */}
      {block.elements.map((el) => (
        <DynamicElement key={el.id} element={el} />
      ))}

      {/* Structural content — wedding data driven */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          padding: '60px 24px',
          textAlign: 'center',
          color: textColor,
        }}
      >
        <StructuralContent
          blockType={block.blockType}
          weddingData={weddingData}
          globalStyles={gs}
        />
      </div>
    </section>
  );
}

/**
 * Renders the data-driven structural content for each block type.
 * This is the actual wedding info (names, dates, venues) — not configurable
 * in the builder as they come from the order's WeddingInfo.
 */
function StructuralContent({
  blockType,
  weddingData: d,
  globalStyles: gs,
}: {
  blockType: string;
  weddingData: WeddingData;
  globalStyles: GlobalStyles;
}) {
  const heading: React.CSSProperties = {
    fontFamily: `'${gs.fonts.heading}', serif`,
    fontSize: 36,
    fontWeight: 700,
    fontStyle: 'italic',
    margin: 0,
    lineHeight: 1.2,
  };

  const sub: React.CSSProperties = {
    fontFamily: `'${gs.fonts.heading}', serif`,
    fontSize: 16,
    fontStyle: 'italic',
    opacity: 0.7,
    margin: '8px 0',
  };

  switch (blockType) {
    case 'cover-songphung':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <h1 style={heading}>{d.bride_name}</h1>
          <span style={{ ...sub, fontSize: 22 }}>&amp;</span>
          <h1 style={heading}>{d.groom_name}</h1>
          <p style={{ ...sub, marginTop: 16 }}>{d.wedding_date}</p>
        </div>
      );

    case 'hero-songphung':
      return (
        <div>
          <h1 style={{ ...heading, fontSize: 44, textTransform: 'uppercase' }}>{d.bride_name}</h1>
          <h1 style={{ ...heading, fontSize: 44, textTransform: 'uppercase' }}>{d.groom_name}</h1>
        </div>
      );

    case 'family-default':
      return (
        <div>
          <h2 style={{ ...heading, fontSize: 24, fontStyle: 'normal' }}>Gia Đình</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 60, marginTop: 24 }}>
            <div>
              <p style={{ fontWeight: 600 }}>{d.bride_name}</p>
              <p style={{ fontSize: 13, opacity: 0.7 }}>{d.bride_parent}</p>
            </div>
            <div>
              <p style={{ fontWeight: 600 }}>{d.groom_name}</p>
              <p style={{ fontSize: 13, opacity: 0.7 }}>{d.groom_parent}</p>
            </div>
          </div>
        </div>
      );

    case 'ceremony-default':
      return (
        <div>
          <h2 style={{ ...heading, fontSize: 24, fontStyle: 'normal' }}>Lễ Cưới</h2>
          <p style={{ fontSize: 42, fontWeight: 700, fontFamily: `'${gs.fonts.heading}', serif`, marginTop: 16 }}>
            {d.wedding_time}
          </p>
          <p style={sub}>{d.ceremony_venue || d.reception_venue}</p>
          <p style={{ fontSize: 13, opacity: 0.6 }}>{d.venue_address}</p>
        </div>
      );

    case 'countdown-default':
      return (
        <div>
          <h2 style={{ ...heading, fontSize: 24, fontStyle: 'normal' }}>Đếm Ngược</h2>
          <p style={sub}>Ngày cưới: {d.wedding_date}</p>
        </div>
      );

    case 'gallery-default':
      return (
        <div>
          <h2 style={{ ...heading, fontSize: 24, fontStyle: 'normal' }}>Album Ảnh</h2>
          {d.gallery_urls && d.gallery_urls.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginTop: 16, maxWidth: 400, margin: '16px auto 0' }}>
              {d.gallery_urls.slice(0, 4).map((url, i) => (
                <img key={i} src={url} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 8 }} />
              ))}
            </div>
          )}
        </div>
      );

    case 'wishes-default':
      return (
        <div>
          <h2 style={{ ...heading, fontSize: 24, fontStyle: 'normal' }}>Sổ Lưu Bút</h2>
          {d.wishes && d.wishes.length > 0 && (
            <div style={{ marginTop: 16, maxWidth: 500, margin: '16px auto 0' }}>
              {d.wishes.slice(0, 3).map((w) => (
                <div key={w.id} style={{ padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                  <p style={{ fontWeight: 600, fontSize: 14 }}>{w.guest_name}</p>
                  <p style={{ fontSize: 13, opacity: 0.7 }}>{w.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      );

    case 'bank-default':
      return (
        <div>
          <h2 style={{ ...heading, fontSize: 24, fontStyle: 'normal' }}>Mừng Cưới</h2>
          {d.bank_accounts && d.bank_accounts.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 16, flexWrap: 'wrap' }}>
              {d.bank_accounts.map((acc, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.1)', padding: '12px 20px', borderRadius: 8, fontSize: 13 }}>
                  <div style={{ fontWeight: 600 }}>{acc.bank}</div>
                  <div>{acc.account}</div>
                  <div style={{ opacity: 0.7 }}>{acc.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      );

    case 'footer-default':
      return (
        <p style={{ fontSize: 14, opacity: 0.7 }}>
          Thiết kế bởi juntech.vn
        </p>
      );

    default:
      return null;
  }
}
