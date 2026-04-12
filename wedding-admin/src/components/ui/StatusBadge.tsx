import type { OrderStatus } from '../../types';
import { ORDER_STATUS_CONFIG } from '../../utils/constants';

interface StatusBadgeProps {
  status: OrderStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = ORDER_STATUS_CONFIG[status];
  if (!config) return <span>{status}</span>;

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 500,
        color: config.text,
        background: config.bg,
        border: `1px solid ${config.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      {config.label}
    </span>
  );
}
