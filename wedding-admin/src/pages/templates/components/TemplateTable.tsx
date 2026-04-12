import { Table, Button, Modal, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import type { Template, PaginatedData } from '../../../types';
import { templateApi } from '../../../api/template.api';
import { formatVND } from '../../../utils/format';
import EmptyState from '../../../components/ui/EmptyState';

interface TemplateTableProps {
  data: PaginatedData<Template> | undefined;
  loading: boolean;
  page: number;
  onPageChange: (page: number) => void;
  onAdd: () => void;
}

const CATEGORY_COLORS: Record<number, { bg: string; color: string }> = {};
const PASTEL_PALETTE = [
  { bg: '#FFF0F0', color: '#8B1A1A' },
  { bg: '#F0F4FF', color: '#1A3A8B' },
  { bg: '#F0FFF4', color: '#1A6B3A' },
  { bg: '#FFFBF0', color: '#8B6A1A' },
  { bg: '#F5F0FF', color: '#5A1A8B' },
  { bg: '#F0FFFF', color: '#1A6B6B' },
];

function getCategoryColor(categoryId: number) {
  if (!CATEGORY_COLORS[categoryId]) {
    const idx = Object.keys(CATEGORY_COLORS).length % PASTEL_PALETTE.length;
    CATEGORY_COLORS[categoryId] = PASTEL_PALETTE[idx];
  }
  return CATEGORY_COLORS[categoryId];
}

export default function TemplateTable({ data, loading, page, onPageChange, onAdd }: TemplateTableProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: (template: Template) =>
      templateApi.update(template.id, {
        category_id: template.category_id,
        name: template.name,
        slug: template.slug,
        thumbnail_url: template.thumbnail_url,
        preview_images: template.preview_images || [],
        price_per_day: template.price_per_day,
        price_per_month: template.price_per_month,
        customizable_fields: template.customizable_fields || [],
        description: template.description,
        has_video: template.has_video,
        is_active: !template.is_active,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Cập nhật trạng thái thành công', { className: 'toast-success' });
    },
    onError: () => {
      toast.error('Cập nhật trạng thái thất bại', { className: 'toast-error' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => templateApi.delete(id),
    onSuccess: () => {
      message.success('Đã xoá mẫu thiệp');
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Xoá mẫu thiệp',
      content: 'Bạn có chắc muốn xoá mẫu thiệp này?',
      okText: 'Xoá',
      cancelText: 'Huỷ',
      okButtonProps: { danger: true },
      onOk: () => deleteMutation.mutateAsync(id),
    });
  };

  const items = data?.items || [];
  const total = data?.total || 0;
  const limit = data?.limit || 10;

  const columns: ColumnsType<Template> = [
    {
      title: 'Mẫu thiệp',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img
            src={record.thumbnail_url || '/placeholder.png'}
            alt={record.name}
            style={{
              width: 64,
              height: 44,
              objectFit: 'cover',
              borderRadius: 6,
              border: '1px solid #E5E5E5',
              flexShrink: 0,
            }}
          />
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontWeight: 600,
                fontSize: 14,
                color: '#1A1A1A',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {record.name}
            </div>
            <div
              style={{
                fontSize: 12,
                color: '#9CA3AF',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {record.slug}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (_, record) => {
        const cat = record.category;
        if (!cat) return '—';
        const clr = getCategoryColor(cat.id);
        return (
          <span
            style={{
              display: 'inline-block',
              padding: '2px 10px',
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 500,
              background: clr.bg,
              color: clr.color,
              whiteSpace: 'nowrap',
            }}
          >
            {cat.name}
          </span>
        );
      },
    },
    {
      title: 'Giá/ngày',
      dataIndex: 'price_per_day',
      key: 'price_per_day',
      align: 'right' as const,
      responsive: ['md'] as ('md')[],
      render: (val: number) => (
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatVND(val)}</span>
      ),
    },
    {
      title: 'Giá/tháng',
      dataIndex: 'price_per_month',
      key: 'price_per_month',
      align: 'right' as const,
      render: (val: number) => (
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatVND(val)}</span>
      ),
    },
    {
      title: 'Lượt xem',
      dataIndex: 'view_count',
      key: 'view_count',
      align: 'right' as const,
      responsive: ['md'] as ('md')[],
      render: (val: number) => (
        <span style={{ fontVariantNumeric: 'tabular-nums', color: '#6B6B6B' }}>{val.toLocaleString('vi-VN')}</span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active: boolean) => {
        const bg = active ? '#ECFDF5' : '#F3F4F6';
        const color = active ? '#065F46' : '#6B7280';
        const label = active ? 'Hiển thị' : 'Đã ẩn';
        return (
          <span
            style={{
              display: 'inline-block',
              padding: '2px 10px',
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 500,
              background: bg,
              color,
            }}
          >
            {label}
          </span>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 12 }}>
          <Button
            type="link"
            style={{ padding: 0, fontSize: 13, color: '#8B1A1A' }}
            onClick={() => navigate(`/templates/edit/${record.id}`)}
          >
            Sửa
          </Button>
          <Button
            type="link"
            style={{ padding: 0, fontSize: 13, color: record.is_active ? '#6B7280' : '#065F46' }}
            loading={toggleMutation.isPending}
            onClick={() => toggleMutation.mutate(record)}
          >
            {record.is_active ? 'Ẩn' : 'Hiện'}
          </Button>
          <span
            onClick={() => handleDelete(record.id)}
            style={{ color: '#991B1B', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
          >
            Xoá
          </span>
        </div>
      ),
    },
  ];

  if (!loading && items.length === 0) {
    return (
      <EmptyState
        title="Chưa có mẫu thiệp nào"
        subtitle="Bắt đầu tạo mẫu thiệp đầu tiên cho hệ thống"
        action={{ label: 'Thêm mẫu mới', onClick: onAdd }}
      />
    );
  }

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div>
      <Table<Template>
        rowKey="id"
        columns={columns}
        dataSource={items}
        loading={loading}
        pagination={{
          current: page,
          pageSize: limit,
          total,
          onChange: onPageChange,
          showSizeChanger: false,
        }}
        scroll={{ x: 700 }}
        style={{ background: '#fff', borderRadius: 12 }}
      />
      {total > 0 && (
        <div style={{ textAlign: 'center', fontSize: 13, color: '#9CA3AF', marginTop: -40, paddingBottom: 12 }}>
          Hiển thị {startItem}-{endItem} trong {total} mẫu
        </div>
      )}
    </div>
  );
}
