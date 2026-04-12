import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Select } from 'antd';
import toast from 'react-hot-toast';
import { orderApi } from '../../api/order.api';
import type { OrderStatus, Payment } from '../../types';
import { ORDER_STATUS_CONFIG } from '../../utils/constants';
import { formatVND, formatDate, formatDateTime, formatShortDate, truncateOrderId } from '../../utils/format';
import PageHeader from '../../components/ui/PageHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import WeddingInfoCard from './components/WeddingInfoCard';
import GuestListCard from './components/GuestListCard';
import OrderStatusTimeline from './components/OrderStatusTimeline';

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Chờ thanh toán' },
  { value: 'paid', label: 'Đã thanh toán' },
  { value: 'published', label: 'Đang hiển thị' },
  { value: 'expired', label: 'Hết hạn' },
  { value: 'cancelled', label: 'Đã huỷ' },
];

const PAYMENT_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Chờ xử lý', color: '#92400E' },
  success: { label: 'Thành công', color: '#065F46' },
  failed: { label: 'Thất bại', color: '#991B1B' },
  refunded: { label: 'Hoàn tiền', color: '#6B7280' },
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newStatus, setNewStatus] = useState<OrderStatus | null>(null);

  const { data: orderData, isLoading: orderLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderApi.getById(id!),
    enabled: !!id,
  });

  const { data: weddingData, isLoading: weddingLoading } = useQuery({
    queryKey: ['wedding-info', id],
    queryFn: () => orderApi.getWeddingInfo(id!),
    enabled: !!id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: OrderStatus) => orderApi.updateStatus(id!, status),
    onSuccess: () => {
      toast.success('Cập nhật trạng thái thành công');
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setNewStatus(null);
    },
    onError: () => {
      toast.error('Cập nhật trạng thái thất bại');
    },
  });

  const order = orderData?.data;
  const weddingInfo = weddingData?.data ?? null;

  if (orderLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 48, color: '#9CA3AF' }}>Đang tải...</div>
    );
  }

  if (!order) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <p style={{ fontSize: 16, color: '#1A1A1A', marginBottom: 8 }}>Không tìm thấy đơn hàng</p>
        <button
          onClick={() => navigate('/orders')}
          style={{
            background: '#8B1A1A',
            color: '#fff',
            border: 'none',
            padding: '8px 20px',
            borderRadius: 8,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const templateName = order.order_items?.[0]?.template?.name || '--';
  const payments: Payment[] = (order as unknown as { payments?: Payment[] }).payments ?? [];

  return (
    <div>
      <PageHeader
        title={`Chi tiết đơn ${truncateOrderId(order.id)}`}
        extra={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <StatusBadge status={order.status} />
            <button
              onClick={() => navigate('/orders')}
              style={{
                background: '#fff',
                color: '#374151',
                border: '1px solid #D1D5DB',
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: 14,
                cursor: 'pointer',
                fontWeight: 500,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#8B1A1A')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#D1D5DB')}
            >
              Quay lại
            </button>
          </div>
        }
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 24,
        }}
        className="order-detail-grid"
      >
        {/* Inline responsive style */}
        <style>{`
          @media (min-width: 768px) {
            .order-detail-grid {
              grid-template-columns: 1fr 380px !important;
            }
          }
        `}</style>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Card
            title={
              <span style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 600 }}>
                Thông tin đơn hàng
              </span>
            }
            style={{ borderRadius: 8 }}
          >
            <DescRow label="Mã đơn hàng" value={
              <span style={{ fontFamily: "'Courier New', monospace", fontWeight: 600 }}>
                {order.id}
              </span>
            } />
            <DescRow label="Khách hàng" value={order.user?.full_name || '--'} />
            <DescRow label="Email" value={order.user?.email || '--'} />
            <DescRow label="Số điện thoại" value={order.user?.phone || '--'} />
            <DescRow label="Mẫu thiệp" value={templateName} />
            <DescRow label="Gói thuê" value={order.package_type === 'monthly' ? 'Theo tháng' : 'Theo ngày'} />
            <DescRow label="Thời gian thuê" value={
              order.rental_start && order.rental_end
                ? `${formatShortDate(order.rental_start)} - ${formatShortDate(order.rental_end)} (${order.duration_days} ngày)`
                : '--'
            } />
            <DescRow label="Tạm tính" value={formatVND(order.subtotal)} />
            {order.discount > 0 && (
              <DescRow label="Giảm giá" value={
                <span style={{ color: '#065F46' }}>-{formatVND(order.discount)}</span>
              } />
            )}
            {order.coupon && (
              <DescRow label="Mã giảm giá" value={order.coupon.code} />
            )}
            <DescRow label="Tổng tiền" value={
              <span style={{ fontWeight: 700, fontSize: 16, color: '#8B1A1A', fontVariantNumeric: 'tabular-nums' }}>
                {formatVND(order.total)}
              </span>
            } />
            {order.custom_domain && (
              <DescRow label="Tên miền riêng" value={order.custom_domain} />
            )}
            <DescRow label="Ngày tạo" value={formatDateTime(order.created_at)} />
            <DescRow label="Cập nhật cuối" value={formatDateTime(order.updated_at)} />
          </Card>

          <WeddingInfoCard weddingInfo={weddingInfo} loading={weddingLoading} />

          <GuestListCard orderId={id!} customDomain={order?.custom_domain} />
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Card
            title={
              <span style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 600 }}>
                Trạng thái & Hành động
              </span>
            }
            style={{ borderRadius: 8 }}
          >
            <OrderStatusTimeline currentStatus={order.status} />

            <div style={{ marginTop: 24, borderTop: '1px solid #F3F4F6', paddingTop: 16 }}>
              <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 8 }}>
                Cập nhật trạng thái
              </div>
              <Select
                value={newStatus ?? order.status}
                onChange={(value) => setNewStatus(value)}
                options={STATUS_OPTIONS}
                style={{ width: '100%', marginBottom: 12 }}
              />
              <button
                onClick={() => {
                  if (newStatus && newStatus !== order.status) {
                    updateStatusMutation.mutate(newStatus);
                  }
                }}
                disabled={!newStatus || newStatus === order.status || updateStatusMutation.isPending}
                style={{
                  width: '100%',
                  padding: '10px 0',
                  background:
                    !newStatus || newStatus === order.status
                      ? '#D1D5DB'
                      : '#8B1A1A',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor:
                    !newStatus || newStatus === order.status
                      ? 'not-allowed'
                      : 'pointer',
                }}
              >
                {updateStatusMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật'}
              </button>

              {/* Nút kích hoạt miễn phí - chuyển pending → paid → published */}
              {(order.status === 'pending' || order.status === 'paid') && (
                <button
                  onClick={async () => {
                    try {
                      if (order.status === 'pending') {
                        await orderApi.updateStatus(id!, 'paid');
                      }
                      await orderApi.updateStatus(id!, 'published');
                      toast.success('Đã kích hoạt miễn phí thành công!');
                      queryClient.invalidateQueries({ queryKey: ['order', id] });
                      queryClient.invalidateQueries({ queryKey: ['orders'] });
                    } catch {
                      toast.error('Lỗi kích hoạt');
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 0',
                    marginTop: 8,
                    background: '#065F46',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  ⚡ Kích hoạt miễn phí
                </button>
              )}
            </div>

            {order.published_url && (
              <div style={{ marginTop: 16, borderTop: '1px solid #F3F4F6', paddingTop: 16 }}>
                <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 4 }}>
                  Đường dẫn thiệp cưới
                </div>
                <a
                  href={order.published_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#8B1A1A',
                    fontSize: 14,
                    fontWeight: 500,
                    wordBreak: 'break-all',
                  }}
                >
                  {order.published_url}
                </a>
              </div>
            )}
          </Card>

          <Card
            title={
              <span style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 600 }}>
                Lịch sử thanh toán
              </span>
            }
            style={{ borderRadius: 8 }}
          >
            {payments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: '#9CA3AF', fontSize: 14 }}>
                Chưa có thanh toán
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {payments.map((payment) => {
                  const statusConfig = PAYMENT_STATUS_LABELS[payment.status] ?? {
                    label: payment.status,
                    color: '#6B7280',
                  };
                  return (
                    <div
                      key={payment.id}
                      style={{
                        padding: '12px 16px',
                        background: '#F9FAFB',
                        borderRadius: 8,
                        fontSize: 13,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 4,
                        }}
                      >
                        <span style={{ fontWeight: 600, color: '#1A1A1A', fontVariantNumeric: 'tabular-nums' }}>
                          {formatVND(payment.amount)}
                        </span>
                        <span style={{ color: statusConfig.color, fontWeight: 500 }}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <div style={{ color: '#6B7280', fontSize: 12 }}>
                        {payment.provider} | {payment.method}
                        {payment.transaction_id && ` | ${payment.transaction_id}`}
                      </div>
                      <div style={{ color: '#9CA3AF', fontSize: 12, marginTop: 2 }}>
                        {payment.paid_at
                          ? formatDateTime(payment.paid_at)
                          : formatDateTime(payment.created_at)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function DescRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        padding: '10px 0',
        borderBottom: '1px solid #F3F4F6',
        fontSize: 14,
      }}
    >
      <div
        style={{
          width: 160,
          flexShrink: 0,
          color: '#6B7280',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {label}
      </div>
      <div style={{ flex: 1, color: '#1A1A1A' }}>{value}</div>
    </div>
  );
}
