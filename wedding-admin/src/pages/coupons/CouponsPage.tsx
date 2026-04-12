import { useState } from 'react';
import { Table, Modal, Form, Input, InputNumber, Select, Switch, DatePicker, message, Space } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import api from '../../api/axios';
import PageHeader from '../../components/ui/PageHeader';
import { formatVND, formatShortDate } from '../../utils/format';

interface Coupon {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  min_order: number;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

const couponApi = {
  list: (params?: { page?: number; limit?: number }) =>
    api.get('/admin/coupons', { params }).then((r) => r.data),
  create: (data: Record<string, unknown>) =>
    api.post('/admin/coupons', data).then((r) => r.data),
  update: (id: string, data: Record<string, unknown>) =>
    api.put('/admin/coupons/' + id, data).then((r) => r.data),
  delete: (id: string) =>
    api.delete('/admin/coupons/' + id).then((r) => r.data),
};

export default function CouponsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [form] = Form.useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['coupons', page],
    queryFn: () => couponApi.list({ page, limit: 10 }),
  });

  const coupons: Coupon[] = (data as any)?.data?.items ?? [];
  const total = (data as any)?.data?.total ?? 0;

  const createMutation = useMutation({
    mutationFn: (d: Record<string, unknown>) => couponApi.create(d),
    onSuccess: () => {
      message.success('Đã tạo mã giảm giá');
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      setModalOpen(false);
      form.resetFields();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data: d }: { id: string; data: Record<string, unknown> }) => couponApi.update(id, d),
    onSuccess: () => {
      message.success('Đã cập nhật mã giảm giá');
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      setModalOpen(false);
      setEditingCoupon(null);
      form.resetFields();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => couponApi.delete(id),
    onSuccess: () => {
      message.success('Đã xoá mã giảm giá');
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });

  const handleAdd = () => {
    setEditingCoupon(null);
    form.resetFields();
    form.setFieldsValue({ type: 'percent', is_active: true });
    setModalOpen(true);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    form.setFieldsValue({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      min_order: coupon.min_order,
      max_uses: coupon.max_uses,
      is_active: coupon.is_active,
      expires_at: coupon.expires_at ? dayjs(coupon.expires_at) : null,
    });
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Xoá mã giảm giá',
      content: 'Bạn có chắc muốn xoá mã giảm giá này?',
      okText: 'Xoá',
      cancelText: 'Huỷ',
      okButtonProps: { danger: true },
      onOk: () => deleteMutation.mutateAsync(id),
    });
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const d: Record<string, unknown> = {
        code: values.code,
        type: values.type,
        value: values.value,
        min_order: values.min_order || 0,
        max_uses: values.max_uses || null,
        is_active: values.is_active ?? true,
        expires_at: values.expires_at ? values.expires_at.format('YYYY-MM-DD') : '',
      };

      if (editingCoupon) {
        updateMutation.mutate({ id: editingCoupon.id, data: d });
      } else {
        createMutation.mutate(d);
      }
    });
  };

  const columns = [
    {
      title: 'Mã',
      dataIndex: 'code',
      render: (code: string) => <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#8B1A1A' }}>{code}</span>,
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      render: (t: string) => t === 'percent' ? 'Phần trăm' : 'Cố định',
    },
    {
      title: 'Giá trị',
      dataIndex: 'value',
      render: (v: number, record: Coupon) =>
        record.type === 'percent' ? `${v}%` : formatVND(v),
    },
    {
      title: 'Đơn tối thiểu',
      dataIndex: 'min_order',
      render: (v: number) => formatVND(v),
    },
    {
      title: 'Sử dụng',
      render: (_: unknown, record: Coupon) =>
        `${record.used_count}${record.max_uses ? ' / ' + record.max_uses : ''}`,
    },
    {
      title: 'Hết hạn',
      dataIndex: 'expires_at',
      render: (d: string | null) => d ? formatShortDate(d) : 'Không giới hạn',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      render: (v: boolean) => (
        <span style={{
          padding: '2px 10px',
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 500,
          color: v ? '#065F46' : '#374151',
          background: v ? '#ECFDF5' : '#F3F4F6',
        }}>
          {v ? 'Đang hoạt động' : 'Đã tắt'}
        </span>
      ),
    },
    {
      title: 'Thao tác',
      render: (_: unknown, record: Coupon) => (
        <div style={{ display: 'flex', gap: 12 }}>
          <span onClick={() => handleEdit(record)} style={{ color: '#8B1A1A', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            Sửa
          </span>
          <span onClick={() => handleDelete(record.id)} style={{ color: '#991B1B', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            Xoá
          </span>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Mã giảm giá"
        subtitle={`Tổng cộng ${total} mã`}
        onAdd={handleAdd}
        addText="Thêm mã giảm giá"
      />

      <Table
        dataSource={coupons}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: page,
          total,
          pageSize: 10,
          onChange: setPage,
          showTotal: (t) => `Tổng ${t} mã`,
        }}
      />

      <Modal
        title={editingCoupon ? 'Sửa mã giảm giá' : 'Thêm mã giảm giá'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditingCoupon(null); }}
        onOk={handleSubmit}
        okText={editingCoupon ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Huỷ"
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okButtonProps={{ style: { background: '#8B1A1A', borderColor: '#8B1A1A' } }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="code" label="Mã giảm giá" rules={[{ required: true, message: 'Bắt buộc' }]}>
            <Input placeholder="VD: WEDDING2026" style={{ textTransform: 'uppercase' }} />
          </Form.Item>
          <Space style={{ width: '100%' }} size="large">
            <Form.Item name="type" label="Loại giảm giá" rules={[{ required: true }]}>
              <Select style={{ width: 160 }} options={[
                { value: 'percent', label: 'Phần trăm (%)' },
                { value: 'fixed', label: 'Cố định (VNĐ)' },
              ]} />
            </Form.Item>
            <Form.Item name="value" label="Giá trị" rules={[{ required: true, message: 'Bắt buộc' }]}>
              <InputNumber min={0} style={{ width: 160 }} />
            </Form.Item>
          </Space>
          <Space style={{ width: '100%' }} size="large">
            <Form.Item name="min_order" label="Đơn tối thiểu (VNĐ)">
              <InputNumber min={0} style={{ width: 160 }} />
            </Form.Item>
            <Form.Item name="max_uses" label="Số lần sử dụng tối đa">
              <InputNumber min={0} style={{ width: 160 }} placeholder="Không giới hạn" />
            </Form.Item>
          </Space>
          <Form.Item name="expires_at" label="Ngày hết hạn">
            <DatePicker format="DD/MM/YYYY" placeholder="Chọn ngày" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="is_active" label="Trạng thái" valuePropName="checked">
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
