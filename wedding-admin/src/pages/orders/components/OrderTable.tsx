import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import type { Order } from '../../../types';
import StatusBadge from '../../../components/ui/StatusBadge';
import EmptyState from '../../../components/ui/EmptyState';
import { formatVND, formatShortDate, truncateOrderId } from '../../../utils/format';

interface OrderTableProps {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  onPageChange: (page: number, pageSize: number) => void;
}

export default function OrderTable({
  orders,
  total,
  page,
  limit,
  loading,
  onPageChange,
}: OrderTableProps) {
  const navigate = useNavigate();

  const columns: ColumnsType<Order> = [
    {
      title: 'Mã đơn',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id: string) => (
        <span
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/orders/${id}`);
          }}
          style={{
            fontFamily: "'Courier New', Courier, monospace",
            color: '#8B1A1A',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {truncateOrderId(id)}
        </span>
      ),
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      width: 200,
      render: (_: unknown, record: Order) => (
        <div>
          <div style={{ fontWeight: 500, color: '#1A1A1A', fontSize: 14 }}>
            {record.user?.full_name || '--'}
          </div>
          <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
            {record.user?.email || '--'}
          </div>
        </div>
      ),
    },
    {
      title: 'Mẫu thiệp',
      key: 'template',
      width: 160,
      responsive: ['md'] as const,
      render: (_: unknown, record: Order) => {
        const item = record.order_items?.[0];
        return (
          <span style={{ fontSize: 14, color: '#374151' }}>
            {item?.template?.name || '--'}
          </span>
        );
      },
    },
    {
      title: 'Thời gian thuê',
      key: 'rental',
      width: 180,
      responsive: ['lg'] as const,
      render: (_: unknown, record: Order) => {
        if (!record.rental_start || !record.rental_end) {
          return <span style={{ color: '#9CA3AF' }}>--</span>;
        }
        return (
          <span style={{ fontSize: 13, color: '#374151' }}>
            {formatShortDate(record.rental_start)} - {formatShortDate(record.rental_end)}
          </span>
        );
      },
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      width: 140,
      align: 'right',
      render: (total: number) => (
        <span
          style={{
            fontWeight: 600,
            color: '#1A1A1A',
            fontVariantNumeric: 'tabular-nums',
            fontSize: 14,
          }}
        >
          {formatVND(total)}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: Order['status']) => <StatusBadge status={status} />,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_: unknown, record: Order) => (
        <span
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/orders/${record.id}`);
          }}
          style={{
            color: '#8B1A1A',
            fontSize: 13,
            cursor: 'pointer',
            fontWeight: 500,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.textDecoration = 'underline';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.textDecoration = 'none';
          }}
        >
          Xem chi tiết
        </span>
      ),
    },
  ];

  if (!loading && orders.length === 0) {
    return <EmptyState title="Không có đơn hàng nào" subtitle="Chưa có đơn hàng phù hợp với bộ lọc" />;
  }

  return (
    <Table<Order>
      columns={columns}
      dataSource={orders}
      rowKey="id"
      loading={loading}
      onRow={(record) => ({
        onClick: () => navigate(`/orders/${record.id}`),
        style: { cursor: 'pointer' },
      })}
      pagination={{
        current: page,
        pageSize: limit,
        total,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50'],
        onChange: onPageChange,
        showTotal: (t) => `Tổng ${t} đơn hàng`,
      }}
      scroll={{ x: 800 }}
      style={{ background: '#fff', borderRadius: 8 }}
    />
  );
}
