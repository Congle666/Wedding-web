import { useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Tag, Space, Popconfirm, message, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined, CopyOutlined, EditOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '../../../api/order.api';
import type { Guest } from '../../../types';

interface Props {
  orderId: string;
  customDomain?: string;
}

export default function GuestListCard({ orderId, customDomain }: Props) {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [form] = Form.useForm();

  const { data: guestsRes, isLoading } = useQuery({
    queryKey: ['guests', orderId],
    queryFn: () => orderApi.getGuests(orderId),
    enabled: !!orderId,
  });

  const guests = (guestsRes as any)?.data || [];

  const createMutation = useMutation({
    mutationFn: (data: { name: string; phone?: string; group_name?: string; side?: string; notes?: string }) =>
      orderApi.createGuest(orderId, data),
    onSuccess: () => {
      message.success('Thêm khách mời thành công');
      queryClient.invalidateQueries({ queryKey: ['guests', orderId] });
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: () => message.error('Lỗi thêm khách mời'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ guestId, data }: { guestId: string; data: Partial<Guest> }) =>
      orderApi.updateGuest(orderId, guestId, data),
    onSuccess: () => {
      message.success('Cập nhật thành công');
      queryClient.invalidateQueries({ queryKey: ['guests', orderId] });
      setIsModalOpen(false);
      setEditingGuest(null);
      form.resetFields();
    },
    onError: () => message.error('Lỗi cập nhật'),
  });

  const deleteMutation = useMutation({
    mutationFn: (guestId: string) => orderApi.deleteGuest(orderId, guestId),
    onSuccess: () => {
      message.success('Đã xóa khách mời');
      queryClient.invalidateQueries({ queryKey: ['guests', orderId] });
    },
    onError: () => message.error('Lỗi xóa khách mời'),
  });

  const handleSubmit = (values: any) => {
    if (editingGuest) {
      updateMutation.mutate({ guestId: editingGuest.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleEdit = (guest: Guest) => {
    setEditingGuest(guest);
    form.setFieldsValue({
      name: guest.name,
      phone: guest.phone,
      group_name: guest.group_name,
      side: guest.side,
      notes: guest.notes,
    });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingGuest(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const getGuestLink = (guest: Guest) => {
    const base = customDomain || orderId;
    return `/w/${base}?guest=${guest.slug}`;
  };

  const copyLink = (guest: Guest) => {
    const link = `${window.location.origin}${getGuestLink(guest)}`;
    navigator.clipboard.writeText(link);
    message.success(`Đã copy link cho ${guest.name}`);
  };

  const copyAllLinks = () => {
    const links = guests.map((g: Guest) =>
      `${g.name}: ${window.location.origin}/w/${customDomain || orderId}?guest=${g.slug}`
    ).join('\n');
    navigator.clipboard.writeText(links);
    message.success(`Đã copy ${guests.length} link`);
  };

  const sideMap: Record<string, { label: string; color: string }> = {
    groom: { label: 'Nhà trai', color: 'blue' },
    bride: { label: 'Nhà gái', color: 'pink' },
    both: { label: 'Chung', color: 'default' },
  };

  const columns = [
    {
      title: 'Tên khách',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Guest) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          {record.group_name && <div style={{ fontSize: 12, color: '#9CA3AF' }}>{record.group_name}</div>}
        </div>
      ),
    },
    {
      title: 'Phía',
      dataIndex: 'side',
      key: 'side',
      width: 90,
      render: (side: string) => {
        const info = sideMap[side] || sideMap.both;
        return <Tag color={info.color}>{info.label}</Tag>;
      },
    },
    {
      title: 'SĐT',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
      render: (phone: string) => phone || '--',
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      width: 150,
      render: (slug: string) => (
        <code style={{ fontSize: 12, background: '#F3F4F6', padding: '2px 6px', borderRadius: 4 }}>{slug}</code>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 140,
      render: (_: unknown, record: Guest) => (
        <Space size="small">
          <Tooltip title="Copy link">
            <Button size="small" icon={<CopyOutlined />} onClick={() => copyLink(record)} />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Popconfirm title="Xóa khách mời này?" onConfirm={() => deleteMutation.mutate(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card
        title={<span style={{ fontWeight: 600 }}>Danh sách khách mời ({guests.length})</span>}
        extra={
          <Space>
            {guests.length > 0 && (
              <Button size="small" icon={<CopyOutlined />} onClick={copyAllLinks}>
                Copy tất cả link
              </Button>
            )}
            <Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleAdd}
              style={{ background: '#8B1A1A', borderColor: '#8B1A1A' }}>
              Thêm khách
            </Button>
          </Space>
        }
        style={{ borderRadius: 8 }}
      >
        <Table
          columns={columns}
          dataSource={guests}
          rowKey="id"
          loading={isLoading}
          pagination={guests.length > 10 ? { pageSize: 10 } : false}
          size="small"
          locale={{ emptyText: 'Chưa có khách mời' }}
        />
      </Card>

      <Modal
        title={editingGuest ? 'Sửa khách mời' : 'Thêm khách mời'}
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); setEditingGuest(null); form.resetFields(); }}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText={editingGuest ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
        okButtonProps={{ style: { background: '#8B1A1A', borderColor: '#8B1A1A' } }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ side: 'both' }}>
          <Form.Item name="name" label="Tên khách mời" rules={[{ required: true, message: 'Nhập tên khách' }]}>
            <Input placeholder="Gia đình Anh Mạnh" />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại">
            <Input placeholder="0901234567" />
          </Form.Item>
          <Form.Item name="group_name" label="Nhóm">
            <Input placeholder="Bạn bè, Đồng nghiệp, Họ hàng..." />
          </Form.Item>
          <Form.Item name="side" label="Phía">
            <Select options={[
              { value: 'both', label: 'Chung' },
              { value: 'groom', label: 'Nhà trai' },
              { value: 'bride', label: 'Nhà gái' },
            ]} />
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea rows={2} placeholder="Ghi chú thêm..." />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
