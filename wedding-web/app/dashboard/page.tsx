'use client';

import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { useAuthStore } from '@/lib/store/auth.store';
import { orderApi, Order } from '@/lib/api/order.api';
import { formatVND, formatDateShort } from '@/lib/utils/format';

function getStatusBadge(status: string) {
  const map: Record<string, { label: string; variant: 'primary' | 'success' | 'warning' | 'danger' | 'muted' }> = {
    pending: { label: 'Chờ thanh toán', variant: 'warning' },
    paid: { label: 'Đã thanh toán', variant: 'success' },
    published: { label: 'Đang hoạt động', variant: 'primary' },
    cancelled: { label: 'Đã huỷ', variant: 'danger' },
    expired: { label: 'Hết hạn', variant: 'muted' },
  };
  const info = map[status] || { label: status, variant: 'muted' as const };
  return <Badge variant={info.variant}>{info.label}</Badge>;
}

function getDaysRemaining(rentalEnd: string): number {
  const now = new Date();
  const end = new Date(rentalEnd);
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

function getProgressColor(percent: number): string {
  if (percent > 50) return '#16A34A';
  if (percent >= 20) return '#EAB308';
  return '#DC2626';
}

export default function DashboardPage() {
  const router = useRouter();
  const { token, user } = useAuthStore();

  useEffect(() => {
    if (!token) {
      router.replace('/dang-nhap');
    }
  }, [token, router]);

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderApi.list(),
    enabled: !!token,
  });

  const orders: Order[] = useMemo(() => {
    const items = (ordersData as any)?.data?.items;
    if (!Array.isArray(items)) return [];
    return items;
  }, [ordersData]);

  const publishedOrders = useMemo(
    () => orders.filter((o) => o.status === 'published'),
    [orders]
  );

  const expiringOrders = useMemo(
    () =>
      orders.filter((o) => {
        if (o.status !== 'published') return false;
        const rental_end = (o as any).rental_end as string | undefined;
        if (!rental_end) return false;
        return getDaysRemaining(rental_end) <= 7;
      }),
    [orders]
  );

  const totalSpent = useMemo(
    () => orders.reduce((sum, o) => sum + (o.total || 0), 0),
    [orders]
  );

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5),
    [orders]
  );

  if (!token) return null;

  const containerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 24px',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: '22px',
    fontWeight: 600,
    color: '#1F2937',
    marginBottom: '20px',
  };

  return (
    <>
      <Header />
      <main style={{ minHeight: '100vh', backgroundColor: '#FAFAF8' }}>
        <div style={containerStyle}>
          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ marginBottom: '40px' }}
          >
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '28px',
                fontWeight: 600,
                color: '#1F2937',
                marginBottom: '8px',
              }}
            >
              Xin chào, {user?.full_name || 'bạn'}
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '15px',
                color: '#6B7280',
              }}
            >
              Quản lý thiệp cưới của bạn tại đây
            </p>
          </motion.div>

          {/* Stat Cards */}
          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '48px' }}>
              {[1, 2, 3].map((i) => (
                <Card key={i} style={{ padding: '24px' }}>
                  <Skeleton width="60%" height="16px" />
                  <div style={{ marginTop: '12px' }}>
                    <Skeleton width="40%" height="32px" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '20px',
                marginBottom: '48px',
              }}
            >
              <Card style={{ padding: '24px' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>
                  Thiệp đang chạy
                </p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 700, color: '#8B1A1A' }}>
                  {publishedOrders.length}
                </p>
              </Card>
              <Card style={{ padding: '24px' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>
                  Thiệp sắp hết hạn
                </p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 700, color: '#EAB308' }}>
                  {expiringOrders.length}
                </p>
              </Card>
              <Card style={{ padding: '24px' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>
                  Tổng đã chi
                </p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 700, color: '#1F2937' }}>
                  {formatVND(totalSpent)}
                </p>
              </Card>
            </motion.div>
          )}

          {/* Active Invitations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            style={{ marginBottom: '48px' }}
          >
            <h2 style={sectionTitleStyle}>Thiệp đang hoạt động</h2>

            {isLoading ? (
              <div style={{ display: 'grid', gap: '16px' }}>
                {[1, 2].map((i) => (
                  <Card key={i} style={{ padding: '24px' }}>
                    <Skeleton width="50%" height="20px" />
                    <div style={{ marginTop: '12px' }}><Skeleton width="70%" height="16px" /></div>
                    <div style={{ marginTop: '12px' }}><Skeleton width="100%" height="8px" /></div>
                  </Card>
                ))}
              </div>
            ) : publishedOrders.length === 0 ? (
              <Card style={{ padding: '48px', textAlign: 'center' }}>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '16px',
                    color: '#6B7280',
                    marginBottom: '20px',
                  }}
                >
                  Bạn chưa có thiệp nào. Tạo thiệp đầu tiên!
                </p>
                <Link href="/mau-thiep" style={{ textDecoration: 'none' }}>
                  <Button variant="primary">Xem mẫu thiệp</Button>
                </Link>
              </Card>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {publishedOrders.map((order) => {
                  const ext = order as any;
                  const templateName = (ext.template_name as string) || 'Mẫu thiệp';
                  const customDomain = (ext.custom_domain as string) || '';
                  const rentalEnd = (ext.rental_end as string) || '';
                  const rentalStart = (ext.rental_start as string) || order.created_at;
                  const daysRemaining = rentalEnd ? getDaysRemaining(rentalEnd) : 0;
                  const totalDays = rentalEnd && rentalStart
                    ? Math.max(1, Math.ceil((new Date(rentalEnd).getTime() - new Date(rentalStart).getTime()) / (1000 * 60 * 60 * 24)))
                    : 1;
                  const percent = Math.round((daysRemaining / totalDays) * 100);

                  return (
                    <Card key={order.id} style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 600, color: '#1F2937', marginBottom: '6px' }}>
                            {templateName}
                          </h3>
                          {customDomain && (
                            <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: '#8B1A1A', marginBottom: '8px' }}>
                              juntech.vn/{customDomain}
                            </p>
                          )}
                          {rentalEnd && (
                            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#6B7280' }}>
                              Còn {daysRemaining} ngày (hết hạn {formatDateShort(rentalEnd)})
                            </p>
                          )}
                          {/* Progress bar */}
                          {rentalEnd && (
                            <div style={{ marginTop: '12px', width: '100%', maxWidth: '300px' }}>
                              <div style={{ height: '6px', backgroundColor: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
                                <div
                                  style={{
                                    height: '100%',
                                    width: `${Math.min(100, percent)}%`,
                                    backgroundColor: getProgressColor(percent),
                                    borderRadius: '3px',
                                    transition: 'width 0.5s ease',
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <Link href={`/dashboard/don-hang/${order.id}`} style={{ textDecoration: 'none' }}>
                            <Button variant="outline" size="sm">Chỉnh sửa thiệp</Button>
                          </Link>
                          <Button variant="ghost" size="sm" disabled>Gia hạn</Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <h2 style={sectionTitleStyle}>Đơn hàng gần đây</h2>

            {isLoading ? (
              <Card style={{ padding: '24px' }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{ marginBottom: '16px' }}>
                    <Skeleton width="100%" height="40px" />
                  </div>
                ))}
              </Card>
            ) : recentOrders.length === 0 ? (
              <Card style={{ padding: '32px', textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: '#6B7280' }}>
                  Chưa có đơn hàng nào
                </p>
              </Card>
            ) : (
              <Card style={{ overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-body)', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #EDE8E1' }}>
                      {['Mã đơn', 'Template', 'Ngày', 'Tiền', 'Trạng thái'].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: '14px 16px',
                            textAlign: 'left',
                            fontWeight: 600,
                            color: '#6B7280',
                            fontSize: '13px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => {
                      const ext = order as any;
                      const templateName = (ext.template_name as string) || '---';
                      return (
                        <tr key={order.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                          <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '13px', color: '#374151' }}>
                            {order.id.slice(0, 8).toUpperCase()}
                          </td>
                          <td style={{ padding: '12px 16px', color: '#1F2937' }}>{templateName}</td>
                          <td style={{ padding: '12px 16px', color: '#6B7280', whiteSpace: 'nowrap' }}>
                            {formatDateShort(order.created_at)}
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1F2937', whiteSpace: 'nowrap' }}>
                            {formatVND(order.total)}
                          </td>
                          <td style={{ padding: '12px 16px' }}>{getStatusBadge(order.status)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Card>
            )}

            {orders.length > 0 && (
              <div style={{ marginTop: '16px', textAlign: 'right' }}>
                <Link
                  href="/dashboard/don-hang"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#8B1A1A',
                    textDecoration: 'none',
                  }}
                >
                  Xem tất cả đơn hàng
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
