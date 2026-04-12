'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { templateApi } from '@/lib/api/template.api';
import { formatVND } from '@/lib/utils/format';
import SectionTitle from '@/components/ui/SectionTitle';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';

export default function FeaturedTemplates() {
  const { data, isLoading } = useQuery({
    queryKey: ['templates', 'featured'],
    queryFn: () => templateApi.list({ sort: 'popular', limit: 6 }),
    select: (res) => res.data,
  });

  const templates = (data as any)?.items ?? [];

  return (
    <section className="featured">
      <div className="featured__inner">
        <SectionTitle
          label="MẪU THIỆP NỔI BẬT"
          title="Được yêu thích nhất tháng này"
        />

        <div className="featured__grid">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="featured__skeleton-card">
                  <div style={{ paddingBottom: '75%', position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: 0 }}>
                      <Skeleton width="100%" height="100%" />
                    </div>
                  </div>
                  <div style={{ padding: '16px' }}>
                    <Skeleton width="70%" height="18px" />
                    <div style={{ marginTop: '8px' }}>
                      <Skeleton width="40%" height="12px" />
                    </div>
                    <div style={{ marginTop: '12px' }}>
                      <Skeleton width="50%" height="14px" />
                    </div>
                  </div>
                </div>
              ))
            : templates.map((template: any, index: number) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                >
                  <Link
                    href={`/mau-thiep/${template.slug}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <Card hover>
                      <div className="featured__thumb">
                        {template.thumbnail_url ? (
                          <img
                            src={template.thumbnail_url}
                            alt={template.name}
                            className="featured__thumb-img"
                          />
                        ) : null}
                      </div>
                      <div className="featured__info">
                        <h3 className="featured__name">{template.name}</h3>
                        <span className="featured__category">
                          {template.category_id}
                        </span>
                        <span className="featured__price">
                          từ {formatVND(template.price_per_day)} / ngày
                        </span>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
        </div>

        <div className="featured__cta">
          <Link href="/mau-thiep" style={{ textDecoration: 'none' }}>
            <Button variant="outline" size="md">
              Xem tất cả mẫu thiệp
            </Button>
          </Link>
        </div>
      </div>

    </section>
  );
}
