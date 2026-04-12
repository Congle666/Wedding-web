import { Table, Image, Modal, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Banner } from '../../../types';
import { bannerApi } from '../../../api/banner.api';
import { formatShortDate, formatCompactNumber } from '../../../utils/format';
import { BANNER_POSITION_LABELS } from '../../../utils/constants';
import { getBannerDisplayStatus } from '../../../utils/helpers';

interface BannerTableProps {
  banners: Banner[];
  loading: boolean;
}

export default function BannerTable({ banners, loading }: BannerTableProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: number) => bannerApi.delete(id),
    onSuccess: () => {
      message.success('Đã xoá banner');
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
  });

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Xoá banner',
      content: 'Bạn có chắc muốn xoá banner này?',
      okText: 'Xoá',
      cancelText: 'Huỷ',
      okButtonProps: { danger: true },
      onOk: () => deleteMutation.mutateAsync(id),
    });
  };

  const columns: ColumnsType<Banner> = [
    {
      title: 'Ảnh',
      dataIndex: 'image_url',
      key: 'image',
      width: 100,
      render: (url: string) => (
        <Image
          src={url}
          alt="Banner"
          width={80}
          height={50}
          style={{ borderRadius: 6, objectFit: 'cover' }}
          preview={{ mask: 'Xem' }}
          fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjNGNEY2Ii8+PC9zdmc+"
        />
      ),
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: Banner) => (
        <div>
          <span style={{ fontWeight: 600, fontSize: 14, color: '#1A1A1A' }}>{title}</span>
          <br />
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>
            {BANNER_POSITION_LABELS[record.position] || record.position}
          </span>
        </div>
      ),
    },
    {
      title: 'Vị trí',
      dataIndex: 'position',
      key: 'position',
      width: 150,
      render: (position: Banner['position']) => {
        const label = BANNER_POSITION_LABELS[position] || position;
        return (
          <span
            style={{
              fontSize: 12,
              padding: '2px 8px',
              borderRadius: 4,
              background: '#F3F4F6',
              color: '#374151',
            }}
          >
            {label}
          </span>
        );
      },
    },
    {
      title: 'Thời gian',
      key: 'time',
      width: 160,
      render: (_: unknown, record: Banner) => {
        if (!record.started_at && !record.ended_at) {
          return <span style={{ fontSize: 13, color: '#9CA3AF' }}>Không giới hạn</span>;
        }
        const start = record.started_at ? formatShortDate(record.started_at) : '...';
        const end = record.ended_at ? formatShortDate(record.ended_at) : '...';
        return <span style={{ fontSize: 13 }}>{start} - {end}</span>;
      },
    },
    {
      title: 'Hiệu quả',
      key: 'stats',
      width: 180,
      render: (_: unknown, record: Banner) => (
        <span style={{ fontSize: 13, color: '#6B6B6B' }}>
          {formatCompactNumber(record.view_count)} lượt xem · {formatCompactNumber(record.click_count)} click
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 130,
      render: (_: unknown, record: Banner) => {
        const status = getBannerDisplayStatus(record);
        return (
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              padding: '2px 10px',
              borderRadius: 4,
              color: status.color,
              background: status.color === '#065F46' ? '#ECFDF5'
                : status.color === '#92400E' ? '#FEF3C7'
                : status.color === '#374151' ? '#F3F4F6'
                : '#F3F4F6',
            }}
          >
            {status.label}
          </span>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 80,
      render: (_: unknown, record: Banner) => (
        <div style={{ display: 'flex', gap: 12 }}>
          <span
            onClick={() => navigate(`/banners/edit/${record.id}`)}
            style={{ color: '#8B1A1A', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
          >
            Sửa
          </span>
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

  return (
    <Table<Banner>
      columns={columns}
      dataSource={banners}
      rowKey="id"
      loading={loading}
      pagination={{ pageSize: 10, showSizeChanger: false }}
      scroll={{ x: 900 }}
      locale={{ emptyText: 'Chưa có banner nào' }}
      style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E3DC' }}
    />
  );
}
