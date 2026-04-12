import { useCallback } from 'react';
import type { OrderStatus } from '../../../types';
import SearchInput from '../../../components/ui/SearchInput';

interface StatusTab {
  key: string;
  label: string;
}

const STATUS_TABS: StatusTab[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ TT' },
  { key: 'paid', label: 'Đã TT' },
  { key: 'published', label: 'Đang chạy' },
  { key: 'expired', label: 'Hết hạn' },
  { key: 'cancelled', label: 'Đã huỷ' },
];

interface OrderFilterProps {
  onSearch: (value: string) => void;
  onStatusChange: (status: string) => void;
  selectedStatus: string;
  statusCounts: Record<string, number>;
}

export default function OrderFilter({
  onSearch,
  onStatusChange,
  selectedStatus,
  statusCounts,
}: OrderFilterProps) {
  const handleSearch = useCallback(
    (value: string) => {
      onSearch(value);
    },
    [onSearch],
  );

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <SearchInput
          placeholder="Mã đơn hoặc email khách hàng..."
          onSearch={handleSearch}
          style={{ width: 320 }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          gap: 0,
          borderBottom: '1px solid #E5E7EB',
          overflowX: 'auto',
        }}
      >
        {STATUS_TABS.map((tab) => {
          const isActive = selectedStatus === tab.key;
          const count = tab.key === 'all'
            ? Object.values(statusCounts).reduce((s, c) => s + c, 0)
            : statusCounts[tab.key as OrderStatus] ?? 0;

          return (
            <button
              key={tab.key}
              onClick={() => onStatusChange(tab.key)}
              style={{
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                fontFamily: "'Inter', sans-serif",
                color: isActive ? '#8B1A1A' : '#6B7280',
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '2px solid #8B1A1A' : '2px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'color 0.15s, border-color 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = '#8B1A1A';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = '#6B7280';
                }
              }}
            >
              {tab.label}
              <span
                style={{
                  marginLeft: 6,
                  fontSize: 12,
                  color: isActive ? '#8B1A1A' : '#9CA3AF',
                  fontWeight: 400,
                }}
              >
                ({count})
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
