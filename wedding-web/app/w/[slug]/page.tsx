'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getThemeComponent } from '@/components/themes/registry';
import type { TemplateConfig } from '@/types/templateConfig';
import { isBuilderConfig } from '@/types/builderConfig';
import type { BuilderConfig } from '@/types/builderConfig';
import DynamicThemeRenderer from '@/components/themes/dynamic/DynamicThemeRenderer';

export interface BankAccount {
  bank: string;
  account: string;
  name: string;
}

export interface Wish {
  id: string;
  guest_name: string;
  message: string;
  created_at: string;
}

export interface WeddingData {
  order_id: string;
  slug: string;
  template: { slug: string; category: string; theme_slug: string };
  groom_name: string;
  bride_name: string;
  groom_parent: string;
  bride_parent: string;
  groom_photo_url?: string;
  bride_photo_url?: string;
  groom_address?: string;
  bride_address?: string;
  wedding_date: string;
  lunar_date?: string;
  wedding_time: string;
  ceremony_time?: string;
  ceremony_venue: string;
  ceremony_address?: string;
  ceremony_maps_url?: string;
  reception_venue: string;
  reception_time?: string;
  reception_address?: string;
  reception_maps_url?: string;
  venue_address: string;
  maps_embed_url: string;
  gallery_urls: string[];
  bank_accounts: BankAccount[];
  music_url?: string;
  wishes: Wish[];
  rsvp_count: number;
  custom_domain: string;
  guest_name?: string;
  view_count?: number;
  visible_sections?: Record<string, boolean>;
  /**
   * Full config coming from the backend `templates.customizable_fields`.
   * When null/undefined the theme renderer falls back to
   * `DEFAULT_SONGPHUNG_RED_CONFIG` (backward-compatible with legacy rows).
   */
  template_config?: Partial<TemplateConfig> | null;
}

async function fetchWedding(slug: string, guestSlug?: string): Promise<WeddingData> {
  const params = guestSlug ? `?guest=${encodeURIComponent(guestSlug)}` : '';
  const res = await fetch(`/api/wedding/${slug}${params}`);
  if (!res.ok) throw new Error('Không tìm thấy thiệp cưới');
  const json = await res.json();
  return json.data || json;
}

function LoadingSkeleton() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F5EAE0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
      }}
    >
      <div
        style={{
          width: 60,
          height: 60,
          border: '3px solid #EDE8E1',
          borderTopColor: '#8B1A1A',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <p
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 20,
          color: '#3D1010',
          fontStyle: 'italic',
        }}
      >
        Đang mở thiệp cưới...
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F5EAE0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 24,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: '#8B1A1A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 36,
          color: '#C8963C',
          fontFamily: "'Cormorant Garamond', serif",
        }}
      >
        !
      </div>
      <h2
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 28,
          color: '#3D1010',
        }}
      >
        Không tìm thấy thiệp cưới
      </h2>
      <p
        style={{
          fontFamily: "'Be Vietnam Pro', sans-serif",
          fontSize: 15,
          color: '#6B4C4C',
          maxWidth: 400,
        }}
      >
        {message}
      </p>
    </div>
  );
}

export default function WeddingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const guestSlug = searchParams.get('guest') || undefined;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['wedding', slug, guestSlug],
    queryFn: () => fetchWedding(slug, guestSlug),
    enabled: !!slug,
  });

  useEffect(() => {
    if (data) {
      document.title = `Thiệp Cưới — ${data.groom_name} & ${data.bride_name}`;
    }
  }, [data]);

  if (isLoading) return <LoadingSkeleton />;
  if (isError || !data) return <ErrorState message={(error as Error)?.message || 'Đã xảy ra lỗi'} />;

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Be+Vietnam+Pro:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap"
        rel="stylesheet"
      />
      {(() => {
        // v2.0 BuilderConfig → DynamicThemeRenderer (block-based)
        if (isBuilderConfig(data.template_config)) {
          return <DynamicThemeRenderer data={data} config={data.template_config as BuilderConfig} />;
        }
        // v1.0 or legacy → existing theme components
        const ThemeComponent = getThemeComponent(data.template?.theme_slug);
        return <ThemeComponent data={data} />;
      })()}
    </>
  );
}
