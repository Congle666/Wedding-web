import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { User } from '../../../types';
import { formatShortDate } from '../../../utils/format';
import { PROVIDER_LABELS } from '../../../utils/constants';
import { getInitials } from '../../../utils/helpers';

interface UserWithOrderCount extends User {
  order_count: number;
}

interface UserTableProps {
  users: UserWithOrderCount[];
  loading: boolean;
}

export default function UserTable({ users, loading }: UserTableProps) {
  const columns: ColumnsType<UserWithOrderCount> = [
    {
      title: 'Người dùng',
      key: 'user',
      render: (_: unknown, record: UserWithOrderCount) => (
        <div className="flex items-center gap-3">
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#8B1A1A',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {getInitials(record.full_name)}
          </div>
          <div>
            <span style={{ fontWeight: 500, fontSize: 14, color: '#1A1A1A' }}>
              {record.full_name}
            </span>
            <br />
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>{record.email}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Đăng ký qua',
      dataIndex: 'provider',
      key: 'provider',
      width: 130,
      responsive: ['md'],
      render: (provider: string) => (
        <span style={{ fontSize: 13 }}>{PROVIDER_LABELS[provider] || provider}</span>
      ),
    },
    {
      title: 'Số đơn',
      dataIndex: 'order_count',
      key: 'order_count',
      width: 90,
      responsive: ['md'],
      align: 'center',
      render: (count: number) => (
        <span style={{ fontSize: 14, fontWeight: 500 }}>{count}</span>
      ),
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 140,
      render: (date: string) => (
        <span style={{ fontSize: 13, color: '#6B6B6B' }}>{formatShortDate(date)}</span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_verified',
      key: 'is_verified',
      width: 130,
      render: (verified: boolean) =>
        verified ? (
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              padding: '2px 10px',
              borderRadius: 4,
              color: '#065F46',
              background: '#ECFDF5',
            }}
          >
            Đã xác minh
          </span>
        ) : (
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              padding: '2px 10px',
              borderRadius: 4,
              color: '#92400E',
              background: '#FEF3C7',
            }}
          >
            Chưa xác minh
          </span>
        ),
    },
  ];

  return (
    <Table<UserWithOrderCount>
      columns={columns}
      dataSource={users}
      rowKey="id"
      loading={loading}
      pagination={{ pageSize: 10, showSizeChanger: false }}
      scroll={{ x: 700 }}
      locale={{ emptyText: 'Chưa có tài khoản nào' }}
      style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E3DC' }}
    />
  );
}
