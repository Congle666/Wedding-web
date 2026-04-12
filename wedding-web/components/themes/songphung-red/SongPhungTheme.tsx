'use client';

import { useState, useRef, useCallback, useEffect, type ComponentType } from 'react';
import type { WeddingData } from '@/app/w/[slug]/page';
import type { TemplateConfig, SectionKey } from '@/types/templateConfig';
import { useTemplateConfig, getOrderedVisibleSections } from './useTemplateConfig';
import { EditModeStyles, EditModeBanner } from './editModeHelpers';
import CoverSection from './CoverSection';
import HeroSection from './HeroSection';
import FamilySection from './FamilySection';
import CeremonySection from './CeremonySection';
import CountdownSection from './CountdownSection';
import GallerySection from './GallerySection';
import WishesSection from './WishesSection';
import BankSection from './BankSection';
import FooterSection from './FooterSection';

interface Props {
  data: WeddingData;
  /**
   * Optional: when provided this overrides `data.template_config` completely.
   * Used by the admin builder preview to push live updates via postMessage
   * without mutating the persistent wedding data shape.
   */
  configOverride?: Partial<TemplateConfig> | null;
  /**
   * When true, editable elements get hover outlines + click handlers that
   * post `SLOT_FOCUSED` messages to the parent admin window. Enables direct
   * in-preview editing in the builder.
   */
  editMode?: boolean;
}

type SectionProps = {
  data: WeddingData;
  cfg: TemplateConfig;
  registerParallax?: (el: HTMLElement | null, speed: number, template?: string) => void;
};

// Map of section keys → components. Each section accepts an optional `cfg`
// prop; legacy sections that ignore it still render identically because their
// defaults match `DEFAULT_SONGPHUNG_RED_CONFIG`.
const SECTION_COMPONENTS: Record<SectionKey, ComponentType<any>> = {
  cover: CoverSection,
  hero: HeroSection,
  family: FamilySection,
  ceremony: CeremonySection,
  countdown: CountdownSection,
  gallery: GallerySection,
  wishes: WishesSection,
  bank: BankSection,
  footer: FooterSection,
};

export default function SongPhungTheme({ data, configOverride, editMode = false }: Props) {
  const cfg = useTemplateConfig(configOverride ?? data.template_config);

  const [coverVisible, setCoverVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const musicUrl =
    data.music_url || cfg.assets.global?.music_url || '/themes/songphung-red/music.mp3';

  const handleOpen = useCallback(() => {
    setCoverVisible(false);
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(musicUrl);
        audioRef.current.loop = true;
        audioRef.current.volume = 0.5;
      }
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    } catch {}
  }, [musicUrl]);

  const toggleMusic = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  }, [isPlaying]);

  // Parallax effect - decorative elements move at different speeds
  const parallaxRefs = useRef<{ el: HTMLElement; speed: number; template: string }[]>([]);

  const registerParallax = useCallback(
    (el: HTMLElement | null, speed: number, template = 'translateY({y})') => {
      if (!el) return;
      if (!parallaxRefs.current.find((p) => p.el === el)) {
        parallaxRefs.current.push({ el, speed, template });
      }
    },
    []
  );

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        parallaxRefs.current.forEach((p) => {
          const rect = p.el.getBoundingClientRect();
          if (rect.bottom > -200 && rect.top < window.innerHeight + 200) {
            const y = scrollY * p.speed;
            const maxPx = 80;
            const clamped = Math.max(-maxPx, Math.min(maxPx, y));
            p.el.style.transform = p.template.replace('{y}', `${clamped}px`);
          }
        });
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Dynamically load Google Fonts if the config requests fonts that aren't the defaults.
  useEffect(() => {
    const fonts = [cfg.fonts.heading, cfg.fonts.body].filter(Boolean);
    const toLoad = Array.from(new Set(fonts));
    const linkIds: string[] = [];
    toLoad.forEach((family) => {
      const id = `sp-font-${family.replace(/\s+/g, '-')}`;
      if (document.getElementById(id)) return;
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
        family
      )}:wght@400;500;600;700&display=swap`;
      document.head.appendChild(link);
      linkIds.push(id);
    });
    return () => {
      // Do not cleanup — fonts are cheap, leave cached for navigation.
    };
  }, [cfg.fonts.heading, cfg.fonts.body]);

  // Merge visibility from both wedding-level data.visible_sections (per-order
  // override) and template-level cfg.sections (template baseline).
  const isKeyVisible = (key: SectionKey): boolean => {
    if (data.visible_sections && data.visible_sections[key] === false) return false;
    return cfg.sections[key]?.visible !== false;
  };

  // Always render cover on top (handled by overlay); other sections order via cfg.
  const orderedKeys = getOrderedVisibleSections(cfg).filter(
    (k) => k !== 'cover' && k !== 'footer' && isKeyVisible(k)
  );

  const paperBg = cfg.assets.cover?.paper_bg || '/themes/songphung-red/paper-bg.jpg';

  const cssVars: React.CSSProperties = {
    ['--sp-primary' as any]: cfg.colors.primary,
    ['--sp-bg' as any]: cfg.colors.background,
    ['--sp-text' as any]: cfg.colors.text,
    ['--sp-accent' as any]: cfg.colors.accent,
    ['--sp-font-heading' as any]: `'${cfg.fonts.heading}', serif`,
    ['--sp-font-body' as any]: `'${cfg.fonts.body}', sans-serif`,
    backgroundColor: '#E8D5C4',
    minHeight: '100vh',
  };

  return (
    <div style={cssVars}>
      {editMode && (
        <>
          <EditModeStyles />
          <EditModeBanner />
        </>
      )}
      <div
        style={{
          overflow: 'hidden',
          backgroundColor: cfg.colors.background,
          backgroundImage: `url(${paperBg})`,
          backgroundSize: '800px auto',
          backgroundRepeat: 'repeat',
          maxWidth: 800,
          margin: '0 auto',
          boxShadow: '0 0 60px rgba(0,0,0,0.15)',
          position: 'relative',
        }}
      >
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          html { scroll-behavior: smooth; -webkit-overflow-scrolling: touch; }
          [data-parallax] { will-change: transform; backface-visibility: hidden; }

          @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes floatSlow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
          @keyframes musicPulse { 0%, 100% { transform: scale(1); box-shadow: 0 2px 12px rgba(95,25,29,0.3); } 50% { transform: scale(1.08); box-shadow: 0 2px 20px rgba(95,25,29,0.5); } }
          @keyframes shimmer { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; filter: brightness(1.3); } }
          @keyframes slideInLeft { from { opacity: 0; transform: translateX(-60px); } to { opacity: 1; transform: translateX(0); } }
          @keyframes slideInRight { from { opacity: 0; transform: translateX(60px); } to { opacity: 1; transform: translateX(0); } }

          @media (max-width: 768px) {
            .sp-cover-card { width: 95% !important; max-width: 420px !important; padding: 36px 24px !important; }
            .sp-cover-phoenix-left { width: 160px !important; left: -20px !important; }
            .sp-cover-phoenix-right { width: 150px !important; right: -20px !important; }
            .sp-cover-flower { width: 80px !important; }
            .sp-cover-name { font-size: 32px !important; }
            .sp-cover-amp { font-size: 22px !important; }
            .sp-hero-phoenix-left { width: 42% !important; }
            .sp-hero-phoenix-right { width: 42% !important; }
            .sp-hero-name { font-size: 28px !important; }
            .sp-hero-xi img { width: 180px !important; height: 180px !important; }
            .sp-family-grid { grid-template-columns: 1fr !important; gap: 40px !important; padding: 0 20px !important; }
            .sp-family-divider { display: none !important; }
            .sp-couple-name-large { font-size: 36px !important; }
            .sp-invite-text { font-size: 13px !important; padding: 0 16px !important; }
            .sp-ceremony-detail { padding: 32px 20px !important; }
            .sp-ceremony-time-big { font-size: 40px !important; }
            .sp-gallery-grid { grid-template-columns: repeat(2, 1fr) !important; }
            .sp-bank-grid { grid-template-columns: 1fr !important; }
            .sp-rsvp-form { padding: 24px !important; }
          }

          @media (max-width: 480px) {
            .sp-cover-card { width: 95% !important; padding: 32px 20px !important; }
            .sp-cover-phoenix-left { width: 130px !important; left: -15px !important; }
            .sp-cover-phoenix-right { width: 120px !important; right: -15px !important; }
            .sp-cover-flower { width: 60px !important; }
            .sp-cover-name { font-size: 28px !important; }
            .sp-hero-phoenix-left { width: 48% !important; }
            .sp-hero-phoenix-right { width: 48% !important; }
            .sp-hero-name { font-size: 24px !important; }
            .sp-hero-xi img { width: 140px !important; height: 140px !important; }
            .sp-couple-name-large { font-size: 28px !important; }
            .sp-ceremony-time-big { font-size: 32px !important; }
            .sp-gallery-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }
          }
        `}</style>

        {coverVisible && cfg.sections.cover?.visible !== false && (
          <CoverSection
            groomName={data.groom_name}
            brideName={data.bride_name}
            weddingDate={data.wedding_date}
            guestName={data.guest_name}
            onOpen={handleOpen}
            cfg={cfg}
            editMode={editMode}
          />
        )}

        <div id="invitation-content">
          {orderedKeys.map((key) => {
            const C = SECTION_COMPONENTS[key];
            if (!C) return null;
            // Sections expect specific prop signatures — adapt per key.
            switch (key) {
              case 'hero':
                return (
                  <C
                    key={key}
                    groomName={data.groom_name}
                    brideName={data.bride_name}
                    cfg={cfg}
                    editMode={editMode}
                  />
                );
              case 'family':
                return (
                  <C
                    key={key}
                    groomName={data.groom_name}
                    brideName={data.bride_name}
                    groomParent={data.groom_parent}
                    brideParent={data.bride_parent}
                    groomPhotoUrl={data.groom_photo_url}
                    bridePhotoUrl={data.bride_photo_url}
                    groomAddress={data.groom_address}
                    brideAddress={data.bride_address}
                    registerParallax={registerParallax}
                    cfg={cfg}
                    editMode={editMode}
                  />
                );
              case 'ceremony':
                return (
                  <C
                    key={key}
                    weddingTime={data.wedding_time}
                    weddingDate={data.wedding_date}
                    ceremonyVenue={data.ceremony_venue}
                    receptionVenue={data.reception_venue}
                    venueAddress={data.venue_address}
                    mapsEmbedUrl={data.maps_embed_url}
                    slug={data.slug}
                    ceremonyTime={data.ceremony_time}
                    ceremonyAddress={data.ceremony_address}
                    ceremonyMapsUrl={data.ceremony_maps_url}
                    receptionTime={data.reception_time}
                    receptionAddress={data.reception_address}
                    receptionMapsUrl={data.reception_maps_url}
                    lunarDate={data.lunar_date}
                    registerParallax={registerParallax}
                    cfg={cfg}
                    editMode={editMode}
                  />
                );
              case 'countdown':
                return <C key={key} weddingDate={data.wedding_date} cfg={cfg} editMode={editMode} />;
              case 'gallery':
                return (
                  <C
                    key={key}
                    galleryUrls={
                      data.gallery_urls && data.gallery_urls.length > 0
                        ? data.gallery_urls
                        : cfg.assets.gallery?.images || []
                    }
                    cfg={cfg}
                    editMode={editMode}
                  />
                );
              case 'wishes':
                return <C key={key} wishes={data.wishes} slug={data.slug} cfg={cfg} editMode={editMode} />;
              case 'bank':
                return (
                  <C
                    key={key}
                    bankAccounts={data.bank_accounts}
                    groomName={data.groom_name}
                    brideName={data.bride_name}
                    cfg={cfg}
                    editMode={editMode}
                  />
                );
              default:
                return null;
            }
          })}

          {cfg.sections.footer?.visible !== false && (
            <FooterSection
              groomName={data.groom_name}
              brideName={data.bride_name}
              cfg={cfg}
              editMode={editMode}
            />
          )}
        </div>

        {!coverVisible && (
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
              background: cfg.colors.primary,
              color: cfg.colors.background,
              border: 'none',
              cursor: 'pointer',
              fontFamily: `'${cfg.fonts.body}', sans-serif`,
              fontSize: 20,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: isPlaying ? 'musicPulse 2s ease-in-out infinite' : 'none',
              boxShadow: '0 2px 12px rgba(95,25,29,0.3)',
              transition: 'all 0.3s',
            }}
            title={isPlaying ? 'Tắt nhạc' : 'Bật nhạc'}
          >
            {isPlaying ? '♫' : '♪'}
          </button>
        )}
      </div>
    </div>
  );
}
