import StatCard from '../../../components/ui/StatCard';
import { formatVND, formatNumber } from '../../../utils/format';
import type { Order } from '../../../types';

interface DashboardStats {
  orders_count?: number;
  revenue?: number;
  new_users?: number;
  pending_reviews?: number;
  orders_trend?: number;
  revenue_trend?: number;
  users_trend?: number;
}

interface StatsCardsProps {
  stats: DashboardStats | null;
  loading: boolean;
  orders: Order[];
  period: string;
}

function computeLocalStats(orders: Order[], period: string) {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const thisMonth = now.toISOString().slice(0, 7);

  let filteredOrders: Order[];
  if (period === 'today') {
    filteredOrders = orders.filter((o) => o.created_at.startsWith(today));
  } else if (period === '7days') {
    const d7 = new Date();
    d7.setDate(d7.getDate() - 7);
    filteredOrders = orders.filter((o) => new Date(o.created_at) >= d7);
  } else if (period === 'month') {
    filteredOrders = orders.filter((o) => o.created_at.startsWith(thisMonth));
  } else if (period === 'quarter') {
    const qMonth = Math.floor(now.getMonth() / 3) * 3;
    const qStart = new Date(now.getFullYear(), qMonth, 1);
    filteredOrders = orders.filter((o) => new Date(o.created_at) >= qStart);
  } else {
    const yearStr = String(now.getFullYear());
    filteredOrders = orders.filter((o) => o.created_at.startsWith(yearStr));
  }

  const ordersCount = filteredOrders.length;
  const revenue = filteredOrders
    .filter((o) => o.status !== 'cancelled')
    .reduce((s, o) => s + o.total, 0);
  const pendingReviews = 0;

  return { ordersCount, revenue, pendingReviews };
}

export default function StatsCards({ stats, loading, orders, period }: StatsCardsProps) {
  // If API stats available, use them. Otherwise compute locally from orders.
  const local = computeLocalStats(orders, period);

  const ordersCount = stats?.orders_count ?? local.ordersCount;
  const revenue = stats?.revenue ?? local.revenue;
  const newUsers = stats?.new_users ?? 0;
  const pendingReviews = stats?.pending_reviews ?? local.pendingReviews;

  const ordersTrend = stats?.orders_trend;
  const revenueTrend = stats?.revenue_trend;
  const usersTrend = stats?.users_trend;

  const trendText = (val: number | undefined) => {
    if (val === undefined || val === 0) return undefined;
    return `${val > 0 ? '+' : ''}${val}% so với kỳ trước`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      <StatCard
        label="Đơn hàng"
        value={formatNumber(ordersCount)}
        trend={trendText(ordersTrend)}
        trendUp={ordersTrend !== undefined ? ordersTrend > 0 : undefined}
        loading={loading}
      />
      <StatCard
        label="Doanh thu"
        value={formatVND(revenue)}
        trend={trendText(revenueTrend)}
        trendUp={revenueTrend !== undefined ? revenueTrend > 0 : undefined}
        loading={loading}
      />
      <StatCard
        label="Người dùng mới"
        value={formatNumber(newUsers)}
        trend={trendText(usersTrend)}
        trendUp={usersTrend !== undefined ? usersTrend > 0 : undefined}
        loading={loading}
      />
      <StatCard
        label="Chờ duyệt"
        value={formatNumber(pendingReviews)}
        danger={pendingReviews > 0}
        loading={loading}
      />
    </div>
  );
}
