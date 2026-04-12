'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import Divider from '@/components/ui/Divider';
import { templateApi } from '@/lib/api/template.api';
import { formatVND } from '@/lib/utils/format';
import { calculateSavings } from '@/lib/utils/helpers';

type TabKey = 'description' | 'features' | 'reviews';

export default function TemplateDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState<TabKey>('description');
  const [pricePlan, setPricePlan] = useState<'daily' | 'monthly'>('daily');
  const [days, setDays] = useState(7);
  const [mainImage, setMainImage] = useState<string | null>(null);

  const { data: template, isLoading } = useQuery({
    queryKey: ['template', slug],
    queryFn: () => templateApi.getBySlug(slug).then((res: any) => res.data),
    enabled: !!slug,
  });

  const savings = useMemo(() => {
    if (!template?.price_per_day || !template?.price_per_month) return 0;
    return calculateSavings(template.price_per_day, template.price_per_month);
  }, [template]);

  const calculatedTotal = useMemo(() => {
    if (!template) return 0;
    if (pricePlan === 'monthly') return template.price_per_month ?? 0;
    return template.price_per_day * days;
  }, [template, pricePlan, days]);

  const displayImage = mainImage ?? template?.thumbnail_url ?? null;

  /* ───── styles ───── */

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px 24px 64px',
    flex: 1,
  };

  const layoutStyle: React.CSSProperties = {
    display: 'flex',
    gap: '40px',
    alignItems: 'flex-start',
  };

  const leftColStyle: React.CSSProperties = {
    flex: '0 0 60%',
    maxWidth: '60%',
  };

  const rightColStyle: React.CSSProperties = {
    flex: '0 0 calc(40% - 40px)',
    position: 'sticky',
    top: '100px',
  };

  const mainImageWrapperStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    paddingBottom: '62.5%', /* 16:10 */
    backgroundColor: '#F3F4F6',
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '16px',
  };

  const thumbRowStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  };

  const thumbItemStyle = (active: boolean): React.CSSProperties => ({
    position: 'relative',
    width: '72px',
    height: '54px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: active ? '2px solid #8B1A1A' : '2px solid transparent',
    cursor: 'pointer',
    flexShrink: 0,
    backgroundColor: '#F3F4F6',
  });

  const videoBadgeStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: '#FFFFFF',
    fontSize: '12px',
    fontWeight: 600,
    fontFamily: 'var(--font-body)',
    borderRadius: '6px',
    marginBottom: '20px',
  };

  const tabRowStyle: React.CSSProperties = {
    display: 'flex',
    gap: '0',
    borderBottom: '2px solid #EDE8E1',
    marginBottom: '24px',
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: 'var(--font-body)',
    color: active ? '#8B1A1A' : '#9CA3AF',
    borderBottom: active ? '2px solid #8B1A1A' : '2px solid transparent',
    marginBottom: '-2px',
    background: 'none',
    border: 'none',
    borderBottomStyle: 'solid',
    borderBottomWidth: '2px',
    borderBottomColor: active ? '#8B1A1A' : 'transparent',
    cursor: 'pointer',
  });

  const descTextStyle: React.CSSProperties = {
    fontSize: '15px',
    fontFamily: 'var(--font-body)',
    color: '#4B5563',
    lineHeight: 1.8,
    whiteSpace: 'pre-line',
  };

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: 'var(--font-body)',
    fontSize: '14px',
  };

  const thStyle: React.CSSProperties = {
    textAlign: 'left',
    padding: '10px 12px',
    backgroundColor: '#F9FAFB',
    borderBottom: '1px solid #EDE8E1',
    fontWeight: 600,
    color: '#374151',
  };

  const tdStyle: React.CSSProperties = {
    padding: '10px 12px',
    borderBottom: '1px solid #EDE8E1',
    color: '#4B5563',
  };

  const cardPadding: React.CSSProperties = {
    padding: '24px',
  };

  const cardTitleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 700,
    fontFamily: 'var(--font-body)',
    color: '#1F2937',
    margin: '0 0 4px 0',
  };

  const priceOptionStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 16px',
    border: active ? '2px solid #8B1A1A' : '2px solid #E5E7EB',
    borderRadius: '10px',
    cursor: 'pointer',
    marginBottom: '8px',
    backgroundColor: active ? '#FFF5F5' : '#FFFFFF',
    transition: 'border-color 0.2s ease',
  });

  const radioInputStyle: React.CSSProperties = {
    width: '18px',
    height: '18px',
    accentColor: '#8B1A1A',
    margin: 0,
  };

  const priceOptionLabelStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: 'var(--font-body)',
    color: '#1F2937',
    flex: 1,
  };

  const priceOptionValueStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 700,
    fontFamily: 'var(--font-body)',
    color: '#8B1A1A',
  };

  const savingsBadgeStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 700,
    fontFamily: 'var(--font-body)',
    color: '#166534',
    backgroundColor: '#F0FDF4',
    padding: '2px 8px',
    borderRadius: '10px',
    marginLeft: '6px',
  };

  const daysInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'var(--font-body)',
    outline: 'none',
    marginTop: '12px',
    marginBottom: '4px',
  };

  const totalRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '16px 0',
    fontFamily: 'var(--font-body)',
  };

  const supportCardStyle: React.CSSProperties = {
    padding: '24px',
    fontFamily: 'var(--font-body)',
  };

  const supportTitleStyle: React.CSSProperties = {
    fontSize: '15px',
    fontWeight: 600,
    color: '#1F2937',
    margin: '0 0 12px 0',
  };

  const supportLineStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#6B7280',
    margin: '0 0 6px 0',
  };

  const breadcrumbStyle: React.CSSProperties = {
    fontSize: '13px',
    fontFamily: 'var(--font-body)',
    color: '#9CA3AF',
    marginBottom: '24px',
  };

  const breadcrumbLinkStyle: React.CSSProperties = {
    color: '#8B1A1A',
    textDecoration: 'none',
  };

  /* ───── loading skeleton ───── */

  if (isLoading) {
    return (
      <div style={pageStyle}>
        <Header />
        <div style={containerStyle}>
          <style>{`
            @media (max-width: 768px) {
              .tpl-detail-layout { flex-direction: column !important; }
              .tpl-detail-left, .tpl-detail-right {
                flex: 1 1 100% !important;
                max-width: 100% !important;
                position: static !important;
              }
            }
          `}</style>
          <div style={{ marginBottom: '24px' }}>
            <Skeleton width="200px" height="14px" />
          </div>
          <div className="tpl-detail-layout" style={layoutStyle}>
            <div className="tpl-detail-left" style={leftColStyle}>
              <div style={{ ...mainImageWrapperStyle, paddingBottom: 0, height: '400px' }}>
                <Skeleton width="100%" height="100%" />
              </div>
              <div style={{ display: 'flex', gap: '8px', margin: '16px 0' }}>
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} width="72px" height="54px" />
                ))}
              </div>
              <Skeleton width="100%" height="42px" />
              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Skeleton width="100%" height="16px" />
                <Skeleton width="90%" height="16px" />
                <Skeleton width="75%" height="16px" />
                <Skeleton width="85%" height="16px" />
              </div>
            </div>
            <div className="tpl-detail-right" style={rightColStyle}>
              <Card>
                <div style={cardPadding}>
                  <Skeleton width="70%" height="20px" />
                  <div style={{ marginTop: '12px' }}><Skeleton width="50%" height="16px" /></div>
                  <div style={{ marginTop: '16px' }}><Skeleton width="100%" height="56px" /></div>
                  <div style={{ marginTop: '8px' }}><Skeleton width="100%" height="56px" /></div>
                  <div style={{ marginTop: '16px' }}><Skeleton width="100%" height="42px" /></div>
                </div>
              </Card>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!template) {
    return (
      <div style={pageStyle}>
        <Header />
        <div style={{ ...containerStyle, textAlign: 'center', padding: '100px 24px' }}>
          <p style={{ fontSize: '18px', fontFamily: 'var(--font-body)', color: '#6B7280' }}>
            Không tìm thấy mẫu thiệp này.
          </p>
          <Link href="/mau-thiep" style={{ color: '#8B1A1A', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px' }}>
            Quay lại danh sách mẫu thiệp
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const TABS: { key: TabKey; label: string }[] = [
    { key: 'description', label: 'Mô tả' },
    { key: 'features', label: 'Tính năng' },
    { key: 'reviews', label: 'Đánh giá' },
  ];

  return (
    <div style={pageStyle}>
      <Header />

      <style>{`
        @media (max-width: 768px) {
          .tpl-detail-layout { flex-direction: column !important; }
          .tpl-detail-left, .tpl-detail-right {
            flex: 1 1 100% !important;
            max-width: 100% !important;
            position: static !important;
          }
        }
      `}</style>

      <div style={containerStyle}>
        {/* Breadcrumb */}
        <nav style={breadcrumbStyle}>
          <Link href="/" style={breadcrumbLinkStyle}>Trang chủ</Link>
          {' / '}
          <Link href="/mau-thiep" style={breadcrumbLinkStyle}>Mẫu thiệp</Link>
          {' / '}
          <span style={{ color: '#4B5563' }}>{template.name}</span>
        </nav>

        <div className="tpl-detail-layout" style={layoutStyle}>
          {/* ───── Left column ───── */}
          <div className="tpl-detail-left" style={leftColStyle}>
            {/* Main image */}
            <div style={mainImageWrapperStyle}>
              {displayImage && (
                <Image
                  src={displayImage}
                  alt={template.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 60vw"
                  style={{ objectFit: 'cover' }}
                  priority
                />
              )}
            </div>

            {/* Preview thumbnails */}
            {template.preview_images && template.preview_images.length > 0 && (
              <div style={thumbRowStyle}>
                <div
                  style={thumbItemStyle(displayImage === template.thumbnail_url || mainImage === null)}
                  onClick={() => setMainImage(null)}
                >
                  {template.thumbnail_url && (
                    <Image
                      src={template.thumbnail_url}
                      alt={`${template.name} — ảnh chính`}
                      fill
                      sizes="72px"
                      style={{ objectFit: 'cover' }}
                    />
                  )}
                </div>
                {template.preview_images.map((img: string, i: number) => (
                  <div
                    key={i}
                    style={thumbItemStyle(mainImage === img)}
                    onClick={() => setMainImage(img)}
                  >
                    <Image
                      src={img}
                      alt={`${template.name} — ảnh ${i + 1}`}
                      fill
                      sizes="72px"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Video badge */}
            {template.has_video && (
              <span style={videoBadgeStyle}>Có video intro</span>
            )}

            {/* Tabs */}
            <div style={tabRowStyle}>
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  style={tabStyle(activeTab === tab.key)}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content: Mô tả */}
            {activeTab === 'description' && (
              <div style={descTextStyle}>
                {template.description || 'Chưa có mô tả cho mẫu thiệp này.'}
              </div>
            )}

            {/* Tab content: Tính năng */}
            {activeTab === 'features' && (
              <>
                {template.customizable_fields && template.customizable_fields.length > 0 ? (
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th style={thStyle}>Trường</th>
                        <th style={thStyle}>Loại</th>
                        <th style={thStyle}>Mô tả</th>
                      </tr>
                    </thead>
                    <tbody>
                      {template.customizable_fields.map((field: any, i: number) => (
                        <tr key={i}>
                          <td style={tdStyle}>{field.name}</td>
                          <td style={tdStyle}>{field.type}</td>
                          <td style={tdStyle}>{field.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ ...descTextStyle, color: '#9CA3AF' }}>
                    Thông tin tính năng đang được cập nhật.
                  </p>
                )}
              </>
            )}

            {/* Tab content: Đánh giá */}
            {activeTab === 'reviews' && (
              <p style={{ ...descTextStyle, color: '#9CA3AF' }}>
                Chưa có đánh giá nào.
              </p>
            )}
          </div>

          {/* ───── Right column ───── */}
          <div className="tpl-detail-right" style={rightColStyle}>
            {/* Pricing card */}
            <Card>
              <div style={cardPadding}>
                <p style={{ fontSize: '13px', fontFamily: 'var(--font-body)', color: '#9CA3AF', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                  Thuê mẫu thiệp này
                </p>
                <h2 style={cardTitleStyle}>{template.name}</h2>
                {template.category && (
                  <div style={{ marginBottom: '20px', marginTop: '8px' }}>
                    <Badge variant="primary">{template.category?.name || template.category}</Badge>
                  </div>
                )}

                {/* Price options */}
                <label style={priceOptionStyle(pricePlan === 'daily')}>
                  <input
                    type="radio"
                    name="pricePlan"
                    checked={pricePlan === 'daily'}
                    onChange={() => setPricePlan('daily')}
                    style={radioInputStyle}
                  />
                  <span style={priceOptionLabelStyle}>Gói ngày</span>
                  <span style={priceOptionValueStyle}>
                    {template.is_free || template.price_per_day === 0 ? 'Miễn phí' : `${formatVND(template.price_per_day)} / ngày`}
                  </span>
                </label>

                {template.price_per_month != null && template.price_per_month > 0 && (
                  <label style={priceOptionStyle(pricePlan === 'monthly')}>
                    <input
                      type="radio"
                      name="pricePlan"
                      checked={pricePlan === 'monthly'}
                      onChange={() => setPricePlan('monthly')}
                      style={radioInputStyle}
                    />
                    <span style={priceOptionLabelStyle}>
                      Gói tháng
                      {savings > 0 && (
                        <span style={savingsBadgeStyle}>
                          Tiết kiệm {savings}%
                        </span>
                      )}
                    </span>
                    <span style={priceOptionValueStyle}>
                      {formatVND(template.price_per_month)} / tháng
                    </span>
                  </label>
                )}

                {/* Days input (daily only) */}
                {pricePlan === 'daily' && (
                  <>
                    <input
                      type="number"
                      min={7}
                      value={days}
                      onChange={(e) => setDays(Math.max(7, Number(e.target.value)))}
                      style={daysInputStyle}
                      placeholder="Số ngày thuê (tối thiểu 7)"
                    />
                    <p style={{ fontSize: '12px', fontFamily: 'var(--font-body)', color: '#9CA3AF', margin: '0 0 0 2px' }}>
                      Tối thiểu 7 ngày
                    </p>
                  </>
                )}

                {/* Total */}
                <div style={totalRowStyle}>
                  <span style={{ fontSize: '14px', color: '#6B7280' }}>Tạm tính</span>
                  <span style={{ fontSize: '20px', fontWeight: 700, color: '#8B1A1A' }}>
                    {formatVND(calculatedTotal)}
                  </span>
                </div>

                {/* CTA buttons */}
                <Link href={`/dat-thue/${template.id}`} style={{ textDecoration: 'none' }}>
                  <Button variant="primary" size="lg" fullWidth>
                    {template.is_free || (template.price_per_day === 0 && template.price_per_month === 0)
                      ? '🎁 Tạo thiệp miễn phí'
                      : 'Thuê ngay'}
                  </Button>
                </Link>

                <Divider text="hoặc" />

                <Link href={`/w/preview/${(template as any).theme_slug || 'songphung-red'}`} target="_blank" style={{ textDecoration: 'none' }}>
                  <Button variant="outline" size="md" fullWidth>
                    Xem trước thiệp demo
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Support card */}
            <div style={{ marginTop: '16px' }}>
              <Card>
                <div style={supportCardStyle}>
                  <p style={supportTitleStyle}>Cần tư vấn? Liên hệ JunTech</p>
                  <p style={supportLineStyle}>hello@juntech.vn</p>
                  <p style={supportLineStyle}>1900 xxxx</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
