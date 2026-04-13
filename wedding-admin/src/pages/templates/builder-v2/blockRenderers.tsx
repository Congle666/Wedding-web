/**
 * Block renderers — each renders a section block inside the Puck editor canvas.
 * Renders decorative elements from `elements[]` at their configured positions
 * via DynamicElement + structural placeholder content (names, dates, etc.).
 *
 * These are ADMIN-SIDE renderers (no next/image, no framer-motion).
 * Public-side renderers (Phase 08) will add animations + responsive behavior.
 */

import type { ElementInstance, GlobalStyles } from '../../../types/builderConfig';
import { DEFAULT_GLOBAL_STYLES } from '../../../types/builderConfig';
import DynamicElement from './DynamicElement';
import { useBuilderContext } from './BuilderContext';

/** Resolve relative preset URL to absolute for admin thumbnail display */
function resolvePresetUrl(url: string): string {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  const origin = (import.meta.env.VITE_PREVIEW_ORIGIN as string) || 'http://localhost:3001';
  return `${origin}${url}`;
}

interface BlockProps {
  elements?: ElementInstance[];
  settings?: Record<string, any>;
  puck?: { isEditing: boolean };
}

function BlockContainer({
  children,
  elements = [],
  bgColor,
  minH = 200,
  isEditing = false,
  label,
}: {
  children?: React.ReactNode;
  elements: ElementInstance[];
  bgColor: string;
  minH?: number;
  isEditing: boolean;
  label: string;
}) {
  const { selectedElementId, onSelectElement } = useBuilderContext();
  return (
    <div
      style={{
        position: 'relative',
        minHeight: minH,
        background: bgColor,
        overflow: 'hidden',
        fontFamily: "'Be Vietnam Pro', sans-serif",
      }}
    >
      {/* Render all positioned elements */}
      {elements.map((el) => (
        <DynamicElement
          key={el.id}
          element={el}
          resolveUrl={resolvePresetUrl}
          isEditing={isEditing}
          isSelected={selectedElementId === el.id}
          onSelect={onSelectElement}
        />
      ))}

      {/* Structural content (centered) */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: minH,
          padding: 24,
        }}
      >
        {children}
      </div>

      {/* Block type indicator */}
      {isEditing && (
        <div
          style={{
            position: 'absolute',
            bottom: 4,
            right: 8,
            fontSize: 10,
            color: 'rgba(0,0,0,0.25)',
            fontFamily: '-apple-system, sans-serif',
            pointerEvents: 'none',
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}

const titleStyle: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: 28,
  fontWeight: 700,
  color: '#5F191D',
  textAlign: 'center',
};

const subStyle: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: 16,
  fontStyle: 'italic',
  color: '#5F191D',
  opacity: 0.7,
  textAlign: 'center',
};

export function CoverBlockRenderer({ elements = [], settings, puck }: BlockProps) {
  const isEditing = !!puck?.isEditing;
  const { globalStyles: gs } = useBuilderContext();
  const primary = gs.colors.primary;
  const bg = gs.colors.background;
  const fontH = `'${gs.fonts.heading}', serif`;
  return (
    <BlockContainer elements={elements} bgColor={primary} minH={400} isEditing={isEditing} label="cover-songphung">
      <div style={{ ...titleStyle, color: bg, fontSize: 36, fontFamily: fontH }}>Tên Cô Dâu</div>
      <div style={{ color: bg, opacity: 0.6, fontSize: 20, fontFamily: fontH }}>&amp;</div>
      <div style={{ ...titleStyle, color: bg, fontSize: 36, fontFamily: fontH }}>Tên Chú Rể</div>
      <div style={{ ...subStyle, color: bg, marginTop: 12, fontFamily: fontH }}>Trân trọng kính mời</div>
      <div
        style={{
          marginTop: 20,
          padding: '10px 32px',
          background: bg,
          color: primary,
          borderRadius: 25,
          fontFamily: fontH,
          fontSize: 16,
          fontWeight: 600,
        }}
      >
        Mở thiệp
      </div>
    </BlockContainer>
  );
}

export function HeroBlockRenderer({ elements = [], settings, puck }: BlockProps) {
  const isEditing = !!puck?.isEditing;
  const { globalStyles: gs } = useBuilderContext();
  const primary = gs.colors.primary;
  const bg = gs.colors.background;
  const fontH = `'${gs.fonts.heading}', serif`;
  return (
    <BlockContainer elements={elements} bgColor={bg} minH={350} isEditing={isEditing} label="hero-songphung">
      <div style={{ ...titleStyle, color: primary, fontFamily: fontH }}>Tên Cô Dâu</div>
      <div style={{ ...subStyle, fontSize: 20, color: primary }}>&amp;</div>
      <div style={{ ...titleStyle, color: primary, fontFamily: fontH }}>Tên Chú Rể</div>
      <div
        style={{
          marginTop: 16,
          width: '100%',
          height: 100,
          background: primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ color: bg, fontFamily: fontH, fontSize: 14, letterSpacing: 4 }}>
          SAVE THE DATE
        </span>
      </div>
    </BlockContainer>
  );
}

export function FamilyBlockRenderer({ elements = [], settings, puck }: BlockProps) {
  const isEditing = !!puck?.isEditing;
  const { globalStyles: gs } = useBuilderContext();
  const primary = gs.colors.primary;
  return (
    <BlockContainer elements={elements} bgColor="#fff" minH={250} isEditing={isEditing} label="family-default">
      <div style={{ ...titleStyle, color: primary }}>Gia Đình</div>
      <div style={{ display: 'flex', gap: 40, marginTop: 16 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: gs.colors.background, margin: '0 auto 8px', border: `2px solid ${primary}` }} />
          <div style={{ fontSize: 13, color: primary }}>Cô dâu</div>
        </div>
        <div style={{ width: 1, background: primary, opacity: 0.2, minHeight: 60 }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: gs.colors.background, margin: '0 auto 8px', border: `2px solid ${primary}` }} />
          <div style={{ fontSize: 13, color: primary }}>Chú rể</div>
        </div>
      </div>
    </BlockContainer>
  );
}

export function CeremonyBlockRenderer({ elements = [], settings, puck }: BlockProps) {
  const isEditing = !!puck?.isEditing;
  const { globalStyles: gs } = useBuilderContext();
  const primary = gs.colors.primary;
  const fontH = `'${gs.fonts.heading}', serif`;
  return (
    <BlockContainer elements={elements} bgColor={gs.colors.background} minH={280} isEditing={isEditing} label="ceremony-default">
      <div style={{ ...titleStyle, color: primary, fontFamily: fontH }}>Lễ Cưới</div>
      <div style={{ marginTop: 12, textAlign: 'center' }}>
        <div style={{ fontSize: 36, fontWeight: 700, color: primary, fontFamily: fontH }}>10:00</div>
        <div style={{ ...subStyle, marginTop: 4, color: primary }}>Nhà hàng ABC</div>
        <div style={{ ...subStyle, fontSize: 13, color: primary }}>123 Đường XYZ, Quận 1, TP.HCM</div>
      </div>
    </BlockContainer>
  );
}

export function CountdownBlockRenderer({ elements = [], settings, puck }: BlockProps) {
  const isEditing = !!puck?.isEditing;
  const { globalStyles: gs } = useBuilderContext();
  const primary = gs.colors.primary;
  const fontH = `'${gs.fonts.heading}', serif`;
  return (
    <BlockContainer elements={elements} bgColor="#fff" minH={140} isEditing={isEditing} label="countdown-default">
      <div style={{ ...titleStyle, color: primary, fontFamily: fontH }}>Đếm Ngược</div>
      <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
        {['Ngày', 'Giờ', 'Phút', 'Giây'].map((u) => (
          <div key={u} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: primary, fontFamily: fontH }}>00</div>
            <div style={{ fontSize: 11, color: '#9CA3AF' }}>{u}</div>
          </div>
        ))}
      </div>
    </BlockContainer>
  );
}

export function GalleryBlockRenderer({ elements = [], settings, puck }: BlockProps) {
  const isEditing = !!puck?.isEditing;
  const { globalStyles: gs } = useBuilderContext();
  return (
    <BlockContainer elements={elements} bgColor={gs.colors.background} minH={200} isEditing={isEditing} label="gallery-default">
      <div style={{ ...titleStyle, color: gs.colors.primary, fontFamily: `'${gs.fonts.heading}', serif` }}>Album Ảnh</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 80px)', gap: 8, marginTop: 12 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ width: 80, height: 80, background: '#E5E7EB', borderRadius: 6 }} />
        ))}
      </div>
    </BlockContainer>
  );
}

export function WishesBlockRenderer({ elements = [], settings, puck }: BlockProps) {
  const isEditing = !!puck?.isEditing;
  const { globalStyles: gs } = useBuilderContext();
  return (
    <BlockContainer elements={elements} bgColor="#fff" minH={180} isEditing={isEditing} label="wishes-default">
      <div style={{ ...titleStyle, color: gs.colors.primary, fontFamily: `'${gs.fonts.heading}', serif` }}>Sổ Lưu Bút</div>
      <div style={{ ...subStyle, marginTop: 8, color: gs.colors.primary }}>Lời chúc từ khách mời</div>
    </BlockContainer>
  );
}

export function BankBlockRenderer({ elements = [], settings, puck }: BlockProps) {
  const isEditing = !!puck?.isEditing;
  const { globalStyles: gs } = useBuilderContext();
  return (
    <BlockContainer elements={elements} bgColor={gs.colors.background} minH={160} isEditing={isEditing} label="bank-default">
      <div style={{ ...titleStyle, color: gs.colors.primary, fontFamily: `'${gs.fonts.heading}', serif` }}>Mừng Cưới</div>
      <div style={{ ...subStyle, marginTop: 8, color: gs.colors.primary }}>Tài khoản ngân hàng + QR</div>
    </BlockContainer>
  );
}

export function FooterBlockRenderer({ elements = [], settings, puck }: BlockProps) {
  const isEditing = !!puck?.isEditing;
  const { globalStyles: gs } = useBuilderContext();
  return (
    <BlockContainer elements={elements} bgColor={gs.colors.primary} minH={80} isEditing={isEditing} label="footer-default">
      <div style={{ ...subStyle, color: gs.colors.background, fontSize: 14 }}>
        Cảm ơn quý khách · juntech.vn
      </div>
    </BlockContainer>
  );
}
