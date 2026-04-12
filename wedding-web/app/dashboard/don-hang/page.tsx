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

export default function OrdersPage() {
  const router = useRouter();
  const { token } = useAuthStore();

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

  if (!token) return null;

  const containerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 24px',
  };

  return (
    <>
      <Header />
      <main style={{ minHeight: '100vh', backgroundColor: '#FAFAF8' }}>
        <div style={containerStyle}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ marginBottom: '32px' }}
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
              Đơn hàng của tôi
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: '#6B7280' }}>
              Quản lý tất cả đơn hàng của bạn
            </p>
          </motion.div>

          {isLoading ? (
            <div style={{ display: 'grid', gap: '16px' }}>
              {[1, 2, 3].map((i) => (
                <Card key={i} style={{ padding: '24px' }}>
                  <Skeleton width="40%" height="20px" />
                  <div style={{ marginTop: '12px' }}><Skeleton width="60%" height="16px" /></div>
                  <div style={{ marginTop: '8px' }}><Skeleton width="30%" height="16px" /></div>
                </Card>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card style={{ padding: '48px', textAlign: 'center' }}>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '16px',
                    color: '#6B7280',
                    marginBottom: '20px',
                  }}
                >
                  Chưa có đơn hàng nào
                </p>
                <Link href="/mau-thiep" style={{ textDecoration: 'none' }}>
                  <Button variant="primary">Xem mẫu thiệp</Button>
                </Link>
              </Card>
            </motion.div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {orders.map((order, index) => {
                const templateName = order.order_items?.[0]?.template?.name || 'Mẫu thiệp';
                const rentalPlan = order.package_type === 'monthly' ? 'Theo tháng' : 'Theo ngày';

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card hover style={{ padding: '24px' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          flexWrap: 'wrap',
                          gap: '16px',
                        }}
                      >
                        <div style={{ flex: 1, minWidth: '200px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                            <span
                              style={{
                                fontFamily: 'monospace',
                                fontSize: '13px',
                                color: '#6B7280',
                                backgroundColor: '#F3F4F6',
                                padding: '2px 8px',
                                borderRadius: '4px',
                              }}
                            >
                              {order.id.slice(0, 8).toUpperCase()}
                            </span>
                            {getStatusBadge(order.status)}
                          </div>
                          <h3
                            style={{
                              fontFamily: 'var(--font-display)',
                              fontSize: '18px',
                              fontWeight: 600,
                              color: '#1F2937',
                              marginBottom: '8px',
                            }}
                          >
                            {templateName}
                          </h3>
                          <div
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '16px',
                              fontFamily: 'var(--font-body)',
                              fontSize: '14px',
                              color: '#6B7280',
                            }}
                          >
                            <span>Ngày tạo: {formatDateShort(order.created_at)}</span>
                            <span>Gói thuê: {rentalPlan}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                          <p
                            style={{
                              fontFamily: 'var(--font-body)',
                              fontSize: '18px',
                              fontWeight: 700,
                              color: '#1F2937',
                            }}
                          >
                            {formatVND(order.total)}
                          </p>
                          <Link href={`/dashboard/don-hang/${order.id}`} style={{ textDecoration: 'none' }}>
                            <Button variant="outline" size="sm">Xem chi tiết</Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
