import { useNavigate } from 'react-router-dom';
import StatusBadge from '../../../components/ui/StatusBadge';
import { formatVND, truncateOrderId } from '../../../utils/format';
import type { Order } from '../../../types';

interface RecentOrdersProps {
  orders: Order[];
}

export default function RecentOrders({ orders }: RecentOrdersProps) {
  const navigate = useNavigate();
  const recent = orders.slice(0, 5);

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #E8E3DC', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center justify-between mb-4">
        <p style={{ fontSize: 16, fontWeight: 500, fontFamily: "'Be Vietnam Pro', sans-serif" }}>Đơn hàng mới</p>
        <span onClick={() => navigate('/orders')} style={{ fontSize: 13, color: '#8B1A1A', cursor: 'pointer', fontWeight: 500 }}>
          Xem tất cả
        </span>
      </div>

      {recent.length === 0 ? (
        <p style={{ color: '#9CA3AF', fontSize: 14, textAlign: 'center', padding: 24 }}>Chưa có đơn hàng</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E8E3DC' }}>
                <th style={{ textAlign: 'left', padding: '8px 8px', fontSize: 12, fontWeight: 500, color: '#6B6B6B' }}>Mã đơn</th>
                <th style={{ textAlign: 'left', padding: '8px 8px', fontSize: 12, fontWeight: 500, color: '#6B6B6B' }}>Mẫu thiệp</th>
                <th style={{ textAlign: 'right', padding: '8px 8px', fontSize: 12, fontWeight: 500, color: '#6B6B6B' }}>Tổng tiền</th>
                <th style={{ textAlign: 'center', padding: '8px 8px', fontSize: 12, fontWeight: 500, color: '#6B6B6B' }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  style={{ borderBottom: '1px solid #F3F4F6', cursor: 'pointer' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#FAFAF9')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '10px 8px', fontFamily: 'monospace', fontSize: 13, color: '#8B1A1A', fontWeight: 500 }}>
                    {truncateOrderId(order.id)}
                  </td>
                  <td style={{ padding: '10px 8px', maxWidth: 160 }} className="truncate">
                    {order.order_items?.[0]?.template?.name || '\u2014'}
                  </td>
                  <td className="tabular-nums" style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>
                    {formatVND(order.total)}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
