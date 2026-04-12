'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getThemeComponent } from '@/components/themes/registry';
import type { WeddingData } from '@/app/w/[slug]/page';
import type { TemplateConfig } from '@/types/templateConfig';

// Mock data for preview
const MOCK_DATA: WeddingData = {
  order_id: 'preview',
  slug: 'preview',
  template: { slug: 'preview', category: 'preview', theme_slug: '' },
  groom_name: 'Minh Lên',
  bride_name: 'Thị Nhí',
  groom_parent: 'Con trai Ông Nguyễn Văn A &\nBà Trần Thị B',
  bride_parent: 'Con gái Ông Lê Văn C &\nBà Phạm Thị D',
  groom_address: '456 Đường Nguyễn Huệ, Quận 1, TP.HCM',
  bride_address: '789 Đường Trần Hưng Đạo, Quận 5, TP.HCM',
  wedding_date: '2026-06-15',
  lunar_date: '01/05/Bính Ngọ',
  wedding_time: '09:00',
  ceremony_time: '08:00',
  ceremony_venue: 'Tư Gia Nhà Gái',
  ceremony_address: '789 Đường Trần Hưng Đạo, Quận 5, TP.HCM',
  reception_venue: 'Nhà hàng Tiệc Cưới Hoàng Gia',
  reception_time: '17:00',
  reception_address: '123 Đường Lê Lợi, Quận 1, TP.HCM',
  venue_address: '123 Đường Lê Lợi, Quận 1, TP.HCM',
  maps_embed_url: '',
  gallery_urls: [],
  bank_accounts: [
    { bank: 'Vietcombank', account: '1234567890', name: 'NGUYEN MINH LEN' },
    { bank: 'Techcombank', account: '0987654321', name: 'LE THI NHI' },
  ],
  wishes: [
    { id: '1', guest_name: 'Nguyễn Văn Test', message: 'Chúc hai bạn trăm năm hạnh phúc!', created_at: '2026-04-01T10:00:00Z' },
    { id: '2', guest_name: 'Trần Thị Hương', message: 'Hạnh phúc mãi nhé! Thiệp đẹp quá!', created_at: '2026-04-02T14:30:00Z' },
  ],
  rsvp_count: 42,
  custom_domain: 'preview',
  guest_name: 'Gia đình Anh Mạnh',
};

/**
 * Origins permitted to push config updates into this preview. In development
 * we accept any `localhost` or `127.0.0.1` port so the admin (Vite) can run
 * on any port (3000, 5173, 4173, …) without manual config. Production should
 * tighten this to the explicit admin URL.
 */
function isAdminOriginAllowed(origin: string): boolean {
  if (!origin) return false;
  try {
    const u = new URL(origin);
    return (
      (u.hostname === 'localhost' || u.hostname === '127.0.0.1') &&
      (u.protocol === 'http:' || u.protocol === 'https:')
    );
  } catch {
    return false;
  }
}

export default function ThemePreviewPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const themeSlug = params.theme as string;

  // Defer editMode to after mount to avoid hydration mismatch — server has no
  // access to searchParams (or treats it as empty), so we render editMode=false
  // on the first client paint to match the server HTML, then flip to true in
  // the effect below.
  const [isEditMode, setIsEditMode] = useState(false);
  useEffect(() => {
    setIsEditMode(searchParams?.get('mode') === 'edit');
  }, [searchParams]);

  const [liveConfig, setLiveConfig] = useState<Partial<TemplateConfig> | null>(null);

  // postMessage bridge — admin builder pushes config updates here.
  useEffect(() => {
    if (!isEditMode) return;

    const onMessage = (event: MessageEvent) => {
      // Reject unknown origins (allow any localhost port + same-origin)
      if (!isAdminOriginAllowed(event.origin) && event.origin !== window.location.origin) {
        return;
      }
      const data = event.data;
      if (!data || typeof data !== 'object') return;
      if (data.type === 'TEMPLATE_CONFIG_UPDATE' && data.config) {
        setLiveConfig(data.config as Partial<TemplateConfig>);
      }
    };

    window.addEventListener('message', onMessage);

    // Announce readiness to parent so buffered updates can flush.
    try {
      window.parent?.postMessage({ type: 'PREVIEW_READY' }, '*');
    } catch {}

    return () => window.removeEventListener('message', onMessage);
  }, [isEditMode]);

  const ThemeComponent = getThemeComponent(themeSlug);
  const data: WeddingData = {
    ...MOCK_DATA,
    template: { ...MOCK_DATA.template, theme_slug: themeSlug },
    template_config: liveConfig ?? undefined,
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Be+Vietnam+Pro:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap"
        rel="stylesheet"
      />

      {/* Preview banner — hidden in edit mode so builder gets a clean canvas */}
      {!isEditMode && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
          background: '#1A1A1A', color: '#fff', padding: '8px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
          fontSize: 13, fontFamily: "'Be Vietnam Pro', sans-serif",
        }}>
          <span>Đang xem trước kiểu thiệp: <strong>{themeSlug}</strong></span>
          <span style={{ color: '#C8963C' }}>Đây là dữ liệu mẫu, không phải thiệp thật</span>
        </div>
      )}

      <div style={{ paddingTop: isEditMode ? 0 : 36 }}>
        <ThemeComponent data={data} editMode={isEditMode} />
      </div>
    </>
  );
}
