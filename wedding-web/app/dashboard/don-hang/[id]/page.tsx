'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Divider from '@/components/ui/Divider';
import Skeleton from '@/components/ui/Skeleton';
import ImageUpload from '@/components/ui/ImageUpload';
import { useAuthStore } from '@/lib/store/auth.store';
import { orderApi } from '@/lib/api/order.api';
import { formatVND, formatDateShort } from '@/lib/utils/format';

type TabKey = 'info' | 'editor' | 'preview';

interface BankAccount {
  bank: string;
  account: string;
  name: string;
}

interface WeddingFormData {
  groom_name: string;
  bride_name: string;
  groom_parent: string;
  bride_parent: string;
  groom_photo_url: string;
  bride_photo_url: string;
  groom_address: string;
  bride_address: string;
  wedding_date: string;
  lunar_date: string;
  wedding_time: string;
  ceremony_time: string;
  ceremony_venue: string;
  ceremony_address: string;
  ceremony_maps_url: string;
  reception_venue: string;
  reception_time: string;
  reception_address: string;
  reception_maps_url: string;
  venue_address: string;
  maps_embed_url: string;
  music_url: string;
  bank_accounts: BankAccount[];
  guest_book: boolean;
  rsvp: boolean;
}

function getStatusBadge(status: string) {
  const map: Record<string, { label: string; variant: 'primary' | 'success' | 'warning' | 'danger' | 'muted' }> = {
    pending: { label: 'Chờ thanh toán', variant: 'warning' },
    paid: { label: 'Đã thanh toán', variant: 'success' },
    published: { label: 'Đang hoạt động', variant: 'primary' },
    cancelled: { label: 'Đã huỷ', variant: 'danger' },
    expired: { label: 'Hết hạn', variant: 'muted' },
  };
  const info = map[status] || { label: status, variant: 'muted' as const };
  return <Badge variant={info.variant}>{info.label}</Badge>;
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>('info');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!token) {
      router.replace('/dang-nhap');
    }
  }, [token, router]);

  const { data: orderRes, isLoading: orderLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderApi.getById(orderId),
    enabled: !!token && !!orderId,
  });

  const { data: weddingRes, isLoading: weddingLoading } = useQuery({
    queryKey: ['wedding', orderId],
    queryFn: () => orderApi.getWeddingInfo(orderId),
    enabled: !!token && !!orderId,
  });

  const order = (orderRes as any)?.data;
  const weddingInfo = (weddingRes as any)?.data;
  const ext = (order || {}) as Record<string, unknown>;

  const { register, handleSubmit, control, reset, formState: { isDirty } } = useForm<WeddingFormData>({
    defaultValues: {
      groom_name: '',
      bride_name: '',
      groom_parent: '',
      bride_parent: '',
      groom_photo_url: '',
      bride_photo_url: '',
      groom_address: '',
      bride_address: '',
      wedding_date: '',
      lunar_date: '',
      wedding_time: '',
      ceremony_time: '',
      ceremony_venue: '',
      ceremony_address: '',
      ceremony_maps_url: '',
      reception_venue: '',
      reception_time: '',
      reception_address: '',
      reception_maps_url: '',
      venue_address: '',
      maps_embed_url: '',
      music_url: '',
      bank_accounts: [],
      guest_book: false,
      rsvp: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'bank_accounts',
  });

  useEffect(() => {
    if (weddingInfo) {
      const wi = weddingInfo as Record<string, unknown>;
      reset({
        groom_name: (wi.groom_name as string) || '',
        bride_name: (wi.bride_name as string) || '',
        groom_parent: (wi.groom_parent as string) || '',
        bride_parent: (wi.bride_parent as string) || '',
        groom_photo_url: (wi.groom_photo_url as string) || '',
        bride_photo_url: (wi.bride_photo_url as string) || '',
        groom_address: (wi.groom_address as string) || '',
        bride_address: (wi.bride_address as string) || '',
        wedding_date: (wi.wedding_date as string) || '',
        lunar_date: (wi.lunar_date as string) || '',
        wedding_time: (wi.wedding_time as string) || '',
        ceremony_time: (wi.ceremony_time as string) || '',
        ceremony_venue: (wi.ceremony_venue as string) || '',
        ceremony_address: (wi.ceremony_address as string) || '',
        ceremony_maps_url: (wi.ceremony_maps_url as string) || '',
        reception_venue: (wi.reception_venue as string) || '',
        reception_time: (wi.reception_time as string) || '',
        reception_address: (wi.reception_address as string) || '',
        reception_maps_url: (wi.reception_maps_url as string) || '',
        venue_address: (wi.venue_address as string) || '',
        maps_embed_url: (wi.maps_embed_url as string) || '',
        music_url: (wi.music_url as string) || '',
        bank_accounts: (wi.bank_accounts as BankAccount[]) || [],
        guest_book: (wi.guest_book as boolean) || false,
        rsvp: (wi.rsvp as boolean) || false,
      });
    }
  }, [weddingInfo, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: WeddingFormData) =>
      orderApi.updateWeddingInfo(orderId, data as unknown as import('@/lib/api/order.api').WeddingInfo),
    onSuccess: () => {
      toast.success('Cập nhật thành công');
      queryClient.invalidateQueries({ queryKey: ['wedding', orderId] });
    },
    onError: () => {
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    },
  });

  const publishMutation = useMutation({
    mutationFn: () => orderApi.publish(orderId),
    onSuccess: () => {
      toast.success('Thiệp đã được publish thành công');
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
    },
    onError: () => {
      toast.error('Không thể publish thiệp, vui lòng thử lại');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => orderApi.cancel(orderId),
    onSuccess: () => {
      toast.success('Đơn hàng đã được huỷ');
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
    },
    onError: () => {
      toast.error('Không thể huỷ đơn, vui lòng thử lại');
    },
  });

  const onSave = (data: WeddingFormData) => {
    updateMutation.mutate(data);
  };

  const handleCancel = () => {
    if (window.confirm('Bạn có chắc chắn muốn huỷ đơn hàng này?')) {
      cancelMutation.mutate();
    }
  };

  const handlePublish = () => {
    if (window.confirm('Xác nhận publish thiệp cưới?')) {
      publishMutation.mutate();
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success('Đã sao chép link');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!token) return null;

  const containerStyle: React.CSSProperties = {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '40px 24px',
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '10px 20px',
    fontFamily: 'var(--font-body)',
    fontSize: '14px',
    fontWeight: 600,
    color: active ? '#8B1A1A' : '#6B7280',
    borderBottom: active ? '2px solid #8B1A1A' : '2px solid transparent',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottomWidth: '2px',
    borderBottomStyle: 'solid',
    borderBottomColor: active ? '#8B1A1A' : 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  });

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: '14px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '16px',
    display: 'block',
  };

  const infoRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid #F3F4F6',
    fontFamily: 'var(--font-body)',
    fontSize: '14px',
  };

  return (
    <>
      <Header />
      <main style={{ minHeight: '100vh', backgroundColor: '#FAFAF8' }}>
        <div style={containerStyle}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Back link */}
            <button
              onClick={() => router.push('/dashboard/don-hang')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: '#8B1A1A',
                fontWeight: 500,
                padding: 0,
                marginBottom: '24px',
                display: 'block',
              }}
            >
              Quay lại danh sách đơn hàng
            </button>

            {/* Title */}
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '28px',
                fontWeight: 600,
                color: '#1F2937',
                marginBottom: '24px',
              }}
            >
              Chi tiết đơn hàng
            </h1>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid #EDE8E1', marginBottom: '32px' }}>
              <button style={tabStyle(activeTab === 'info')} onClick={() => setActiveTab('info')}>
                Thông tin đơn
              </button>
              <button style={tabStyle(activeTab === 'editor')} onClick={() => setActiveTab('editor')}>
                Chỉnh sửa thiệp
              </button>
              <button style={tabStyle(activeTab === 'preview')} onClick={() => setActiveTab('preview')}>
                Xem thiệp
              </button>
            </div>

            {/* Tab: Order Info */}
            {activeTab === 'info' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {orderLoading ? (
                  <Card style={{ padding: '24px' }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} style={{ marginBottom: '16px' }}>
                        <Skeleton width="100%" height="24px" />
                      </div>
                    ))}
                  </Card>
                ) : order ? (
                  <Card style={{ padding: '32px' }}>
                    <div style={infoRowStyle}>
                      <span style={{ color: '#6B7280' }}>Mã đơn</span>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1F2937' }}>
                        {order.id.slice(0, 8).toUpperCase()}
                      </span>
                    </div>
                    <div style={infoRowStyle}>
                      <span style={{ color: '#6B7280' }}>Trạng thái</span>
                      <span>{getStatusBadge(order.status)}</span>
                    </div>
                    <div style={infoRowStyle}>
                      <span style={{ color: '#6B7280' }}>Gói thuê</span>
                      <span style={{ color: '#1F2937' }}>{(ext.rental_plan as string) || '---'}</span>
                    </div>
                    <div style={infoRowStyle}>
                      <span style={{ color: '#6B7280' }}>Thời gian</span>
                      <span style={{ color: '#1F2937' }}>
                        {(ext.rental_start as string) ? formatDateShort(ext.rental_start as string) : '---'}
                        {' -- '}
                        {(ext.rental_end as string) ? formatDateShort(ext.rental_end as string) : '---'}
                      </span>
                    </div>
                    <div style={infoRowStyle}>
                      <span style={{ color: '#6B7280' }}>Template</span>
                      <span style={{ color: '#1F2937' }}>{(ext.template_name as string) || '---'}</span>
                    </div>
                    <div style={infoRowStyle}>
                      <span style={{ color: '#6B7280' }}>Coupon</span>
                      <span style={{ color: '#1F2937' }}>{(ext.coupon_code as string) || 'Không có'}</span>
                    </div>

                    <Divider />

                    <div style={infoRowStyle}>
                      <span style={{ color: '#6B7280' }}>Tạm tính</span>
                      <span style={{ color: '#1F2937' }}>{formatVND((ext.subtotal as number) || order.total)}</span>
                    </div>
                    <div style={infoRowStyle}>
                      <span style={{ color: '#6B7280' }}>Giảm giá</span>
                      <span style={{ color: '#16A34A' }}>
                        {(ext.discount as number) ? `- ${formatVND(ext.discount as number)}` : formatVND(0)}
                      </span>
                    </div>
                    <div style={{ ...infoRowStyle, borderBottom: 'none' }}>
                      <span style={{ color: '#1F2937', fontWeight: 700, fontSize: '16px' }}>Tổng cộng</span>
                      <span style={{ color: '#8B1A1A', fontWeight: 700, fontSize: '16px' }}>
                        {formatVND(order.total)}
                      </span>
                    </div>

                    {order.status === 'pending' && (
                      <div style={{ marginTop: '24px' }}>
                        <Button
                          variant="outline"
                          onClick={handleCancel}
                          loading={cancelMutation.isPending}
                          style={{ color: '#DC2626', borderColor: '#DC2626' }}
                        >
                          Huỷ đơn
                        </Button>
                      </div>
                    )}
                  </Card>
                ) : (
                  <Card style={{ padding: '32px', textAlign: 'center' }}>
                    <p style={{ fontFamily: 'var(--font-body)', color: '#6B7280' }}>
                      Không tìm thấy đơn hàng
                    </p>
                  </Card>
                )}
              </motion.div>
            )}

            {/* Tab: Wedding Editor */}
            {activeTab === 'editor' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {weddingLoading ? (
                  <Card style={{ padding: '24px' }}>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} style={{ marginBottom: '16px' }}>
                        <Skeleton width="100%" height="48px" />
                      </div>
                    ))}
                  </Card>
                ) : (
                  <form onSubmit={handleSubmit(onSave)}>
                    {/* Bride & Groom */}
                    <Card style={{ padding: '32px', marginBottom: '24px' }}>
                      <h3 style={labelStyle}>Thông tin cô dâu & chú rể</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0 20px' }}>
                        <Input label="Tên chú rể" {...register('groom_name')} placeholder="Nguyễn Văn A" />
                        <Input label="Tên cô dâu" {...register('bride_name')} placeholder="Trần Thị B" />
                        <Input label="Bố mẹ chú rể" {...register('groom_parent')} placeholder="Ông Nguyễn Văn C & Bà Lê Thị D" />
                        <Input label="Bố mẹ cô dâu" {...register('bride_parent')} placeholder="Ông Trần Văn E & Bà Phạm Thị F" />
                        <Controller
                          name="groom_photo_url"
                          control={control}
                          render={({ field }) => (
                            <ImageUpload label="Ảnh chú rể" value={field.value} onChange={field.onChange} placeholder="Tải ảnh chú rể" />
                          )}
                        />
                        <Controller
                          name="bride_photo_url"
                          control={control}
                          render={({ field }) => (
                            <ImageUpload label="Ảnh cô dâu" value={field.value} onChange={field.onChange} placeholder="Tải ảnh cô dâu" />
                          )}
                        />
                        <Input label="Địa chỉ nhà trai" {...register('groom_address')} placeholder="456 Đường ABC, Quận 3" />
                        <Input label="Địa chỉ nhà gái" {...register('bride_address')} placeholder="789 Đường DEF, Quận 5" />
                      </div>
                    </Card>

                    {/* Wedding Date */}
                    <Card style={{ padding: '32px', marginBottom: '24px' }}>
                      <h3 style={labelStyle}>Ngày trọng đại</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0 20px' }}>
                        <Input label="Ngày cưới (dương lịch)" type="date" {...register('wedding_date')} />
                        <Input label="Ngày âm lịch" {...register('lunar_date')} placeholder="15/02/Bính Ngọ" />
                        <Input label="Giờ chính" {...register('wedding_time')} placeholder="09:00" />
                      </div>
                    </Card>

                    {/* Lễ Gia Tiên */}
                    <Card style={{ padding: '32px', marginBottom: '24px' }}>
                      <h3 style={labelStyle}>Lễ Gia Tiên</h3>
                      <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 16 }}>Để trống nếu không tách riêng lễ gia tiên</p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0 20px' }}>
                        <Input label="Giờ lễ gia tiên" {...register('ceremony_time')} placeholder="08:00" />
                        <Input label="Địa điểm" {...register('ceremony_venue')} placeholder="Tư gia nhà gái" />
                      </div>
                      <Input label="Địa chỉ lễ gia tiên" {...register('ceremony_address')} placeholder="789 Đường XYZ" />
                      <Input label="Google Maps lễ gia tiên" {...register('ceremony_maps_url')} placeholder="https://maps.google.com/..." />
                    </Card>

                    {/* Tiệc Cưới */}
                    <Card style={{ padding: '32px', marginBottom: '24px' }}>
                      <h3 style={labelStyle}>Tiệc Cưới</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0 20px' }}>
                        <Input label="Giờ tiệc cưới" {...register('reception_time')} placeholder="17:00" />
                        <Input label="Nhà hàng" {...register('reception_venue')} placeholder="Nhà hàng ABC" />
                      </div>
                      <Input label="Địa chỉ tiệc cưới" {...register('reception_address')} placeholder="123 Đường XYZ, Quận 1" />
                      <Input label="Địa chỉ chung (fallback)" {...register('venue_address')} placeholder="123 Đường XYZ, Quận 1, TP.HCM" />
                      <Input label="Google Maps tiệc cưới" {...register('maps_embed_url')} placeholder="https://www.google.com/maps/embed?..." />
                      <Input label="Google Maps tiệc cưới (link)" {...register('reception_maps_url')} placeholder="https://maps.google.com/..." />
                    </Card>

                    {/* Nhạc nền */}
                    <Card style={{ padding: '32px', marginBottom: '24px' }}>
                      <h3 style={labelStyle}>Nhạc nền</h3>
                      <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 16 }}>Để trống để dùng nhạc mặc định</p>
                      <Input label="URL nhạc nền (MP3)" {...register('music_url')} placeholder="https://example.com/nhac-cuoi.mp3" />
                    </Card>

                    {/* Bank Accounts */}
                    <Card style={{ padding: '32px', marginBottom: '24px' }}>
                      <h3 style={labelStyle}>Số tài khoản nhận mừng</h3>
                      {fields.map((field, index) => (
                        <div
                          key={field.id}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr 1fr auto',
                            gap: '12px',
                            alignItems: 'flex-start',
                            marginBottom: '8px',
                          }}
                        >
                          <Input
                            label={index === 0 ? 'Ngân hàng' : undefined}
                            {...register(`bank_accounts.${index}.bank`)}
                            placeholder="Vietcombank"
                          />
                          <Input
                            label={index === 0 ? 'Số tài khoản' : undefined}
                            {...register(`bank_accounts.${index}.account`)}
                            placeholder="0123456789"
                          />
                          <Input
                            label={index === 0 ? 'Chủ tài khoản' : undefined}
                            {...register(`bank_accounts.${index}.name`)}
                            placeholder="NGUYEN VAN A"
                          />
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            style={{
                              marginTop: index === 0 ? '28px' : '0',
                              background: 'none',
                              border: '1px solid #EDE8E1',
                              borderRadius: '8px',
                              padding: '10px 14px',
                              cursor: 'pointer',
                              fontFamily: 'var(--font-body)',
                              fontSize: '13px',
                              color: '#DC2626',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            Xoá
                          </button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ bank: '', account: '', name: '' })}
                        style={{ marginTop: '8px' }}
                      >
                        Thêm tài khoản
                      </Button>
                    </Card>

                    {/* Settings */}
                    <Card style={{ padding: '32px', marginBottom: '24px' }}>
                      <h3 style={labelStyle}>Cài đặt thêm</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            fontFamily: 'var(--font-body)',
                            fontSize: '14px',
                            color: '#374151',
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="checkbox"
                            {...register('guest_book')}
                            style={{ width: '18px', height: '18px', accentColor: '#8B1A1A' }}
                          />
                          Sổ lưu bút (Guest Book)
                        </label>
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            fontFamily: 'var(--font-body)',
                            fontSize: '14px',
                            color: '#374151',
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="checkbox"
                            {...register('rsvp')}
                            style={{ width: '18px', height: '18px', accentColor: '#8B1A1A' }}
                          />
                          Xác nhận tham dự (RSVP)
                        </label>
                      </div>
                    </Card>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <Button
                        type="submit"
                        variant="primary"
                        loading={updateMutation.isPending}
                        disabled={!isDirty}
                      >
                        Lưu thay đổi
                      </Button>
                      {order?.status === 'paid' && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePublish}
                          loading={publishMutation.isPending}
                        >
                          Publish thiệp
                        </Button>
                      )}
                    </div>
                  </form>
                )}
              </motion.div>
            )}

            {/* Tab: Preview */}
            {activeTab === 'preview' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card style={{ padding: '48px', textAlign: 'center' }}>
                  {order?.status === 'published' ? (
                    <>
                      <p
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '16px',
                          color: '#1F2937',
                          marginBottom: '16px',
                        }}
                      >
                        Thiệp của bạn đã được publish tại:
                      </p>
                      <a
                        href={(ext.published_url as string) || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '16px',
                          fontWeight: 600,
                          color: '#8B1A1A',
                          wordBreak: 'break-all',
                        }}
                      >
                        {(ext.published_url as string) || `juntech.vn/${(ext.custom_domain as string) || orderId}`}
                      </a>
                      <div style={{ marginTop: '24px' }}>
                        <Button
                          variant="outline"
                          onClick={() =>
                            handleCopyLink(
                              (ext.published_url as string) ||
                                `https://juntech.vn/${(ext.custom_domain as string) || orderId}`
                            )
                          }
                        >
                          {copied ? 'Đã sao chép' : 'Sao chép link'}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <p
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '16px',
                        color: '#6B7280',
                      }}
                    >
                      Thiệp chưa được publish. Vui lòng hoàn tất chỉnh sửa và publish thiệp tại tab &quot;Chỉnh sửa thiệp&quot;.
                    </p>
                  )}
                </Card>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
