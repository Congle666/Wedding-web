import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../api/dashboard.api';
import PageHeader from '../../components/ui/PageHeader';
import StatsCards from './components/StatsCards';
import RevenueChart from './components/RevenueChart';
import OrderStatusChart from './components/OrderStatusChart';
import RecentOrders from './components/RecentOrders';
import PendingReviews from './components/PendingReviews';

const PERIODS = [
  { key: 'today', label: 'Hom nay' },
  { key: '7days', label: '7 ngay' },
  { key: 'month', label: 'Thang nay' },
  { key: 'quarter', label: 'Quy nay' },
  { key: 'year', label: 'Nam nay' },
] as const;

const PERIOD_LABELS: Record<string, string> = {
  today: 'Hôm nay',
  '7days': '7 ngày',
  month: 'Tháng này',
  quarter: 'Quý này',
  year: 'Năm nay',
};

export default function DashboardPage() {
  const [period, setPeriod] = useState<string>('today');

  const { data: statsRes, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats', period],
    queryFn: () => dashboardApi.getStats(period),
  });

  const { data: ordersRes, isLoading: ordersLoading } = useQuery({
    queryKey: ['dashboard-orders'],
    queryFn: () => dashboardApi.getOrders({ page: 1, limit: 200 }),
  });

  const { data: reviewsRes, isLoading: reviewsLoading } = useQuery({
    queryKey: ['dashboard-reviews'],
    queryFn: () => dashboardApi.getPendingReviews({ page: 1, limit: 5 }),
  });

  const orders = ordersRes?.data?.items || [];
  const reviews = reviewsRes?.data?.items || [];

  const stats = statsRes?.data || null;

  return (
    <>
      <PageHeader title="Tổng quan" subtitle="Thống kê hoạt động hệ thống" />

      {/* Period tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '1px solid #E8E3DC' }}>
        {PERIODS.map((p) => {
          const active = period === p.key;
          return (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              style={{
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: active ? 600 : 400,
                color: active ? '#8B1A1A' : '#6B6B6B',
                background: 'none',
                border: 'none',
                borderBottom: active ? '2px solid #8B1A1A' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s',
                fontFamily: "'Be Vietnam Pro', sans-serif",
              }}
            >
              {PERIOD_LABELS[p.key] || p.label}
            </button>
          );
        })}
      </div>

      <StatsCards
        stats={stats}
        loading={statsLoading}
        orders={orders}
        period={period}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        <div className="xl:col-span-2">
          <RevenueChart orders={orders} period={period} stats={stats} />
        </div>
        <div>
          <OrderStatusChart orders={orders} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        <div className="xl:col-span-2">
          <RecentOrders orders={orders} />
        </div>
        <div>
          <PendingReviews reviews={reviews} />
        </div>
      </div>
    </>
  );
}
