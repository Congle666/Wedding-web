import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatVND, formatCompactNumber } from '../../../utils/format';
import type { Order } from '../../../types';

interface RevenueChartProps {
  orders: Order[];
  period: string;
  stats?: { chart_data?: { date: string; revenue: number }[] } | null;
}

function buildChartData(orders: Order[], period: string): { date: string; fullDate: string; revenue: number }[] {
  const now = new Date();

  if (period === 'today') {
    // 24 hours
    return Array.from({ length: 24 }, (_, i) => {
      const label = `${String(i).padStart(2, '0')}:00`;
      const today = now.toISOString().split('T')[0];
      const revenue = orders
        .filter((o) => o.created_at.startsWith(today) && new Date(o.created_at).getHours() === i && o.status !== 'cancelled')
        .reduce((s, o) => s + o.total, 0);
      return { date: label, fullDate: `${today} ${label}`, revenue };
    });
  }

  if (period === '7days') {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const label = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      const revenue = orders
        .filter((o) => o.created_at.startsWith(dateStr) && o.status !== 'cancelled')
        .reduce((s, o) => s + o.total, 0);
      return { date: label, fullDate: dateStr, revenue };
    });
  }

  if (period === 'month') {
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentDay = now.getDate();
    const days = Math.min(daysInMonth, currentDay);
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth(), i + 1);
      const dateStr = d.toISOString().split('T')[0];
      const label = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      const revenue = orders
        .filter((o) => o.created_at.startsWith(dateStr) && o.status !== 'cancelled')
        .reduce((s, o) => s + o.total, 0);
      return { date: label, fullDate: dateStr, revenue };
    });
  }

  if (period === 'quarter') {
    const qMonth = Math.floor(now.getMonth() / 3) * 3;
    const months: { date: string; fullDate: string; revenue: number }[] = [];
    for (let m = qMonth; m <= now.getMonth(); m++) {
      const monthStr = `${now.getFullYear()}-${String(m + 1).padStart(2, '0')}`;
      const label = `Tháng ${m + 1}`;
      const revenue = orders
        .filter((o) => o.created_at.startsWith(monthStr) && o.status !== 'cancelled')
        .reduce((s, o) => s + o.total, 0);
      months.push({ date: label, fullDate: monthStr, revenue });
    }
    return months;
  }

  // year
  return Array.from({ length: now.getMonth() + 1 }, (_, i) => {
    const monthStr = `${now.getFullYear()}-${String(i + 1).padStart(2, '0')}`;
    const label = `Th${i + 1}`;
    const revenue = orders
      .filter((o) => o.created_at.startsWith(monthStr) && o.status !== 'cancelled')
      .reduce((s, o) => s + o.total, 0);
    return { date: label, fullDate: `Tháng ${i + 1}/${now.getFullYear()}`, revenue };
  });
}

const PERIOD_TITLES: Record<string, string> = {
  today: 'Doanh thu hôm nay',
  '7days': 'Doanh thu 7 ngày qua',
  month: 'Doanh thu tháng này',
  quarter: 'Doanh thu quý này',
  year: 'Doanh thu năm nay',
};

export default function RevenueChart({ orders, period, stats }: RevenueChartProps) {
  const chartData = stats?.chart_data || buildChartData(orders, period);
  const hasData = chartData.some((d: { revenue: number }) => d.revenue > 0);

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #E8E3DC', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 20, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
        {PERIOD_TITLES[period] || 'Doanh thu'}
      </p>
      {hasData ? (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E3DC" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} tickFormatter={(v) => formatCompactNumber(v)} />
            <Tooltip
              formatter={(value: number) => [formatVND(value), 'Doanh thu']}
              labelFormatter={(label: string, payload: Array<{ payload?: { fullDate?: string } }>) => {
                const fullDate = payload?.[0]?.payload?.fullDate;
                return fullDate || label;
              }}
              contentStyle={{ borderRadius: 8, border: '1px solid #E8E3DC', fontSize: 13 }}
            />
            <Area type="monotone" dataKey="revenue" stroke="#8B1A1A" strokeWidth={2} fill="#8B1A1A" fillOpacity={0.08} />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#9CA3AF', fontSize: 14 }}>Chưa có dữ liệu doanh thu</p>
        </div>
      )}
    </div>
  );
}
