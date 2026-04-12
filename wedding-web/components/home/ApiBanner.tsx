'use client';

import { useQuery } from '@tanstack/react-query';
import { bannerApi } from '@/lib/api/banner.api';

interface ApiBannerProps {
  position: string;
}

export default function ApiBanner({ position }: ApiBannerProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['banners', position],
    queryFn: () => bannerApi.list(position),
  });

  const banners = (data as any)?.data ?? [];

  if (isLoading) {
    return (
      <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: '16px 24px' }}>
        <div style={{ width: '100%', height: 200, background: '#F3F4F6', borderRadius: 12, animation: 'skeleton-pulse 1.5s ease-in-out infinite' }} />
      </div>
    );
  }

  if (!banners.length) return null;

  return (
    <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: '16px 24px' }}>
      {banners.map((banner: any) => (
        <a
          key={banner.id}
          href={banner.link_url || '#'}
          target={banner.link_target || '_self'}
          rel="noopener noreferrer"
          style={{ display: 'block', textDecoration: 'none', marginBottom: 16 }}
        >
          <img
            src={banner.image_url}
            alt={banner.title}
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: 12,
              objectFit: 'cover',
              maxHeight: 400,
            }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </a>
      ))}
    </div>
  );
}
