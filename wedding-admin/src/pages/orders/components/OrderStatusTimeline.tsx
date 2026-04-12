import type { OrderStatus } from '../../../types';

interface OrderStatusTimelineProps {
  currentStatus: OrderStatus;
}

interface TimelineStep {
  key: OrderStatus;
  label: string;
}

const TIMELINE_STEPS: TimelineStep[] = [
  { key: 'pending', label: 'Tạo đơn' },
  { key: 'paid', label: 'Thanh toán' },
  { key: 'published', label: 'Đang chạy' },
  { key: 'expired', label: 'Hết hạn' },
];

const STATUS_ORDER: Record<string, number> = {
  pending: 0,
  paid: 1,
  published: 2,
  expired: 3,
  cancelled: -1,
};

function getStepState(
  stepIndex: number,
  currentStatus: OrderStatus,
): 'completed' | 'current' | 'future' {
  if (currentStatus === 'cancelled') {
    if (stepIndex === 0) return 'completed';
    return 'future';
  }

  const currentIndex = STATUS_ORDER[currentStatus] ?? 0;

  if (stepIndex < currentIndex) return 'completed';
  if (stepIndex === currentIndex) return 'current';
  return 'future';
}

const STATE_COLORS = {
  completed: '#065F46',
  current: '#8B1A1A',
  future: '#9CA3AF',
};

export default function OrderStatusTimeline({ currentStatus }: OrderStatusTimelineProps) {
  const isCancelled = currentStatus === 'cancelled';

  return (
    <div style={{ padding: '4px 0' }}>
      {TIMELINE_STEPS.map((step, index) => {
        const state = getStepState(index, currentStatus);
        const color = STATE_COLORS[state];
        const isLast = index === TIMELINE_STEPS.length - 1;

        return (
          <div key={step.key} style={{ display: 'flex', gap: 12 }}>
            {/* Dot and line column */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: 16,
              }}
            >
              {/* Dot */}
              <div
                style={{
                  width: state === 'current' ? 12 : 10,
                  height: state === 'current' ? 12 : 10,
                  borderRadius: '50%',
                  background: state === 'future' ? '#fff' : color,
                  border: `2px solid ${color}`,
                  flexShrink: 0,
                  marginTop: 4,
                }}
              />
              {/* Line */}
              {!isLast && (
                <div
                  style={{
                    width: 2,
                    flex: 1,
                    minHeight: 28,
                    background:
                      state === 'completed'
                        ? '#065F46'
                        : '#E5E7EB',
                  }}
                />
              )}
            </div>

            {/* Label column */}
            <div style={{ paddingBottom: isLast ? 0 : 20 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: state === 'current' ? 600 : 400,
                  color,
                  fontFamily: "'Inter', sans-serif",
                  lineHeight: '20px',
                }}
              >
                {step.label}
              </div>
              {state === 'current' && (
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                  Bước hiện tại
                </div>
              )}
            </div>
          </div>
        );
      })}

      {isCancelled && (
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: 16,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: '#991B1B',
                border: '2px solid #991B1B',
                flexShrink: 0,
                marginTop: 4,
              }}
            />
          </div>
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#991B1B',
                fontFamily: "'Inter', sans-serif",
                lineHeight: '20px',
              }}
            >
              Đã huỷ
            </div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
              Đơn hàng đã bị huỷ
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
