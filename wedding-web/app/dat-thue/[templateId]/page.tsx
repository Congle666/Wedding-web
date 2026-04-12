'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import OrderSummary from '@/components/order/OrderSummary';
import CouponInput from '@/components/order/CouponInput';
import { templateApi, Template } from '@/lib/api/template.api';
import { orderApi } from '@/lib/api/order.api';
import { useAuthStore } from '@/lib/store/auth.store';
import { formatVND } from '@/lib/utils/format';

type PackageType = 'daily' | 'monthly';
type PaymentMethod = 'vnpay' | 'momo' | 'zalopay' | 'bank_transfer';

const cssText = `
  .order-page {
    background-color: #FAFAF8;
    min-height: 100vh;
  }
  .order-breadcrumb {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px 24px 0;
    font-family: var(--font-body);
    font-size: 14px;
    color: #9CA3AF;
  }
  .order-breadcrumb a {
    color: #9CA3AF;
    text-decoration: none;
  }
  .order-breadcrumb a:hover {
    color: #8B1A1A;
  }
  .order-breadcrumb-sep {
    margin: 0 8px;
  }
  .order-breadcrumb-current {
    color: #374151;
    font-weight: 500;
  }
  .order-layout {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .order-left {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .order-right {
    width: 100%;
  }
  .order-sticky {
    position: static;
  }
  .order-card-header {
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 600;
    color: #1F2937;
    margin-bottom: 20px;
  }
  .order-radio-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;
  }
  .order-radio-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px;
    border: 1px solid #EDE8E1;
    border-radius: 10px;
    cursor: pointer;
    transition: border-color 0.2s ease;
    font-family: var(--font-body);
    font-size: 14px;
    color: #374151;
  }
  .order-radio-item:hover {
    border-color: #8B1A1A;
  }
  .order-radio-item.active {
    border-color: #8B1A1A;
    background-color: #FFF5F5;
  }
  .order-radio-item input[type="radio"] {
    accent-color: #8B1A1A;
    width: 16px;
    height: 16px;
  }
  .order-radio-label-main {
    font-weight: 500;
  }
  .order-radio-label-sub {
    font-size: 13px;
    color: #6B7280;
    margin-left: 4px;
  }
  .order-subdomain-row {
    display: flex;
    align-items: center;
  }
  .order-subdomain-prefix {
    font-family: var(--font-body);
    font-size: 14px;
    color: #6B7280;
    background-color: #F3F4F6;
    padding: 12px;
    border: 1px solid #EDE8E1;
    border-right: none;
    border-radius: 8px 0 0 8px;
    white-space: nowrap;
    height: 46px;
    display: flex;
    align-items: center;
  }
  .order-subdomain-input {
    flex: 1;
    padding: 12px;
    font-size: 15px;
    font-family: var(--font-body);
    border: 1px solid #EDE8E1;
    border-left: none;
    border-radius: 0 8px 8px 0;
    outline: none;
    background-color: #FFFFFF;
    color: #1F2937;
    height: 46px;
  }
  .order-subdomain-input:focus {
    border-color: #8B1A1A;
  }
  .order-template-info {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    padding: 12px;
    background-color: #FAFAF8;
    border-radius: 8px;
    border: 1px solid #EDE8E1;
  }
  .order-template-thumb {
    width: 64px;
    height: 48px;
    object-fit: cover;
    border-radius: 6px;
    border: 1px solid #EDE8E1;
  }
  .order-template-name {
    font-family: var(--font-body);
    font-size: 15px;
    font-weight: 500;
    color: #1F2937;
  }
  .order-section-label {
    font-family: var(--font-body);
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 6px;
    display: block;
  }
  .order-date-input {
    width: 100%;
    max-width: 240px;
    padding: 12px;
    font-size: 15px;
    font-family: var(--font-body);
    border: 1px solid #EDE8E1;
    border-radius: 8px;
    outline: none;
    background-color: #FFFFFF;
    color: #1F2937;
    margin-bottom: 20px;
  }
  .order-date-input:focus {
    border-color: #8B1A1A;
  }
  .order-field-error {
    font-family: var(--font-body);
    font-size: 13px;
    color: #EF4444;
    margin-top: 4px;
  }
  .order-loading-text {
    text-align: center;
    padding: 80px 24px;
    font-family: var(--font-body);
    font-size: 16px;
    color: #6B7280;
  }
  @media (min-width: 768px) {
    .order-layout {
      flex-direction: row;
    }
    .order-left {
      width: 58%;
    }
    .order-right {
      width: 42%;
    }
    .order-sticky {
      position: sticky;
      top: 24px;
    }
  }
`;

export default function OrderPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.templateId as string;
  const token = useAuthStore((s) => s.token);

  // Auth guard
  useEffect(() => {
    if (!token) {
      router.push('/dang-nhap');
    }
  }, [token, router]);

  // Form state
  const [packageType, setPackageType] = useState<PackageType>('monthly');
  const [durationDays, setDurationDays] = useState(30);
  const [rentalStart, setRentalStart] = useState<Date | null>(null);
  const [subdomain, setSubdomain] = useState('');
  const [subdomainError, setSubdomainError] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('vnpay');

  // Fetch template
  const { data: templateData, isLoading: templateLoading } = useQuery({
    queryKey: ['template', templateId],
    queryFn: async () => {
      const res = await templateApi.list();
      const items = (res as any).data?.items ?? [];
      const found = items.find((t: Template) => t.id === templateId);
      return found || null;
    },
    enabled: !!token,
  });

  const template = templateData ?? null;

  const pricePerDay = template?.price_per_day ?? 0;
  const pricePerMonth = template?.price_per_month ?? pricePerDay * 30;
  const isFree = template?.is_free || (pricePerDay === 0 && pricePerMonth === 0);

  // When package type changes, adjust duration
  useEffect(() => {
    if (packageType === 'monthly') {
      setDurationDays(30);
    } else {
      setDurationDays((prev) => (prev < 7 ? 7 : prev));
    }
  }, [packageType]);

  // Subdomain validation
  const handleSubdomainChange = (value: string) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSubdomain(sanitized);
    if (sanitized && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(sanitized)) {
      setSubdomainError('Chỉ được dùng chữ thường, số và dấu gạch ngang');
    } else {
      setSubdomainError('');
    }
  };

  // Order mutation
  const createOrder = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      orderApi.create(data as any),
    onSuccess: (res: any) => {
      toast.success('Đặt thuê thành công!');
      router.push(`/dashboard/don-hang/${res?.data?.id || ''}`);
    },
    onError: () => {
      toast.error('Đặt thuê thất bại. Vui lòng thử lại.');
    },
  });

  const handleSubmit = () => {
    if (!rentalStart) {
      toast.error('Vui lòng chọn ngày bắt đầu');
      return;
    }
    if (!subdomain) {
      toast.error('Vui lòng nhập tên miền phụ');
      return;
    }
    if (subdomainError) {
      toast.error('Tên miền phụ không hợp lệ');
      return;
    }

    createOrder.mutate({
      items: [{ template_id: templateId }],
      package_type: packageType,
      duration_days: durationDays,
      rental_start: rentalStart.toISOString().split('T')[0],
      custom_domain: subdomain,
      coupon_code: couponCode || undefined,
    } as any);
  };

  const paymentOptions: { value: PaymentMethod; label: string }[] = [
    { value: 'vnpay', label: 'VNPay' },
    { value: 'momo', label: 'MoMo' },
    { value: 'zalopay', label: 'ZaloPay' },
    { value: 'bank_transfer', label: 'Chuyển khoản ngân hàng' },
  ];

  if (!token) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssText }} />
      <div className="order-page">
        <Header />
        <nav className="order-breadcrumb">
          <Link href="/">Trang chủ</Link>
          <span className="order-breadcrumb-sep">/</span>
          <Link href="/mau-thiep">Mẫu thiệp</Link>
          <span className="order-breadcrumb-sep">/</span>
          <span className="order-breadcrumb-current">Đặt thuê</span>
        </nav>

        {templateLoading ? (
          <div className="order-loading-text">
            Đang tải thông tin mẫu thiệp...
          </div>
        ) : (
          <div className="order-layout">
            <div className="order-left">
              {/* Card 1: Package info */}
              <Card style={{ padding: '24px' }}>
                <h3 className="order-card-header">1. Thông tin gói thuê</h3>

                {template && (
                  <div className="order-template-info">
                    <img
                      src={template.thumbnail_url}
                      alt={template.name}
                      className="order-template-thumb"
                    />
                    <span className="order-template-name">{template.name}</span>
                  </div>
                )}

                <label className="order-section-label">Gói thuê</label>
                <div className="order-radio-group">
                  <label
                    className={`order-radio-item${packageType === 'monthly' ? ' active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="packageType"
                      checked={packageType === 'monthly'}
                      onChange={() => setPackageType('monthly')}
                    />
                    <div>
                      <span className="order-radio-label-main">Theo tháng</span>
                      <span className="order-radio-label-sub">
                        {'\u2014'} {formatVND(pricePerMonth)}/tháng
                      </span>
                    </div>
                  </label>
                  <label
                    className={`order-radio-item${packageType === 'daily' ? ' active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="packageType"
                      checked={packageType === 'daily'}
                      onChange={() => setPackageType('daily')}
                    />
                    <div>
                      <span className="order-radio-label-main">Theo ngày</span>
                      <span className="order-radio-label-sub">
                        {'\u2014'} {formatVND(pricePerDay)}/ngày
                      </span>
                    </div>
                  </label>
                </div>

                {packageType === 'daily' && (
                  <Input
                    label="Số ngày thuê (tối thiểu 7)"
                    type="number"
                    value={durationDays.toString()}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setDurationDays(isNaN(val) ? 7 : Math.max(7, val));
                    }}
                    name="durationDays"
                    style={{ maxWidth: '200px' }}
                  />
                )}

                <label className="order-section-label">Ngày bắt đầu</label>
                <input
                  type="date"
                  className="order-date-input"
                  value={
                    rentalStart
                      ? rentalStart.toISOString().split('T')[0]
                      : ''
                  }
                  onChange={(e) => {
                    setRentalStart(
                      e.target.value ? new Date(e.target.value) : null
                    );
                  }}
                  min={new Date().toISOString().split('T')[0]}
                />

                <label className="order-section-label">Tên miền phụ</label>
                <div className="order-subdomain-row">
                  <span className="order-subdomain-prefix">juntech.vn/</span>
                  <input
                    type="text"
                    className="order-subdomain-input"
                    placeholder="ten-cua-ban"
                    value={subdomain}
                    onChange={(e) => handleSubdomainChange(e.target.value)}
                  />
                </div>
                {subdomainError && (
                  <p className="order-field-error">{subdomainError}</p>
                )}
              </Card>

              {/* Card 2: Coupon */}
              <Card style={{ padding: '24px' }}>
                <h3 className="order-card-header">2. Mã giảm giá</h3>
                <CouponInput
                  onApply={(discount) => {
                    setCouponDiscount(discount);
                  }}
                  onClear={() => {
                    setCouponDiscount(0);
                    setCouponCode('');
                  }}
                />
              </Card>

              {/* Card 3: Payment method - ẩn nếu miễn phí */}
              {!isFree && (
                <Card style={{ padding: '24px' }}>
                  <h3 className="order-card-header">3. Phương thức thanh toán</h3>
                  <div className="order-radio-group">
                    {paymentOptions.map((opt) => (
                      <label
                        key={opt.value}
                        className={`order-radio-item${paymentMethod === opt.value ? ' active' : ''}`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === opt.value}
                          onChange={() => setPaymentMethod(opt.value)}
                        />
                        <span className="order-radio-label-main">
                          {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </Card>
              )}

              {isFree && (
                <Card style={{ padding: '24px', background: '#F0FFF4', border: '1px solid #BBF7D0' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>🎁</div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: '#065F46', marginBottom: 8 }}>
                      Mẫu thiệp miễn phí
                    </h3>
                    <p style={{ fontSize: 14, color: '#065F46', opacity: 0.8 }}>
                      Bạn không cần thanh toán. Đơn sẽ được kích hoạt ngay sau khi tạo.
                    </p>
                  </div>
                </Card>
              )}
            </div>

            <div className="order-right">
              <div className="order-sticky">
                <OrderSummary
                  templateName={template?.name ?? 'Đang tải...'}
                  thumbnailUrl={template?.thumbnail_url ?? ''}
                  packageType={packageType}
                  durationDays={durationDays}
                  rentalStart={rentalStart}
                  pricePerDay={pricePerDay}
                  pricePerMonth={pricePerMonth}
                  couponDiscount={couponDiscount}
                  customDomain={subdomain}
                />
                <div style={{ marginTop: '16px' }}>
                  <Button
                    fullWidth
                    size="lg"
                    onClick={handleSubmit}
                    loading={createOrder.isPending}
                  >
                    {createOrder.isPending
                      ? 'Đang xử lý...'
                      : isFree ? '🎁 Tạo thiệp miễn phí' : 'Xác nhận đặt thuê'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        <Footer />
      </div>
    </>
  );
}
