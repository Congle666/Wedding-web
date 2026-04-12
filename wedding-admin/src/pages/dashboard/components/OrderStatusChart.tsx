import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { Order, OrderStatus } from '../../../types';

interface OrderStatusChartProps {
  orders: Order[];
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: 'Chờ TT', color: '#FCD34D' },
  paid: { label: 'Đã TT', color: '#93C5FD' },
  published: { label: 'Đang hiển', color: '#6EE7B7' },
  expired: { label: 'Hết hạn', color: '#D1D5DB' },
  cancelled: { label: 'Đã huỷ', color: '#FCA5A5' },
};

const ALL_STATUSES: OrderStatus[] = ['pending', 'paid', 'published', 'expired', 'cancelled'];

export default function OrderStatusChart({ orders }: OrderStatusChartProps) {
  const total = orders.length;

  const data = ALL_STATUSES.map((status) => {
    const count = orders.filter((o) => o.status === status).length;
    return {
      name: STATUS_CONFIG[status].label,
      value: count,
      color: STATUS_CONFIG[status].color,
      status,
    };
  }).filter((d) => d.value > 0);

  if (total === 0) {
    return (
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #E8E3DC', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', height: '100%' }}>
        <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 20, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
          Phân bổ trạng thái đơn
        </p>
        <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#9CA3AF', fontSize: 14 }}>Chưa có dữ liệu</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #E8E3DC', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', height: '100%' }}>
      <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 16, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
        Phân bổ trạng thái đơn
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ position: 'relative', width: 180, height: 180, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [`${value} đơn`, name]}
                contentStyle={{ borderRadius: 8, border: '1px solid #E8E3DC', fontSize: 13 }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center text */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            <p style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1A', lineHeight: 1, fontFamily: "'Be Vietnam Pro', sans-serif" }}>
              {total}
            </p>
            <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>đơn</p>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          {data.map((item) => (
            <div key={item.status} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: item.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 13, color: '#6B6B6B', whiteSpace: 'nowrap' }}>
                {item.name} ({item.value})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
