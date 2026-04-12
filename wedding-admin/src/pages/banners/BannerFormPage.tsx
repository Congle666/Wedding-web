import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, Form, Input, InputNumber, Select, Switch, DatePicker, Radio, Space, Image } from 'antd';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { bannerApi } from '../../api/banner.api';
import type { BannerFormData } from '../../api/banner.api';
import type { Banner, BannerPosition } from '../../types';
import { BANNER_POSITION_LABELS } from '../../utils/constants';
import PageHeader from '../../components/ui/PageHeader';
import ImageUpload from '../../components/ui/ImageUpload';

const { RangePicker } = DatePicker;

const positionOptions = Object.entries(BANNER_POSITION_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export default function BannerFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const isEdit = Boolean(id);

  const { data: bannersRes } = useQuery({
    queryKey: ['banners'],
    queryFn: () => bannerApi.list(),
    enabled: isEdit,
  });

  const existingBanner = bannersRes?.data?.find((b: Banner) => b.id === Number(id));

  useEffect(() => {
    if (existingBanner) {
      form.setFieldsValue({
        title: existingBanner.title,
        link_url: existingBanner.link_url,
        link_target: existingBanner.link_target || '_self',
        image_url: existingBanner.image_url,
        image_mobile_url: existingBanner.image_mobile_url,
        position: existingBanner.position,
        sort_order: existingBanner.sort_order,
        is_active: existingBanner.is_active,
        date_range:
          existingBanner.started_at || existingBanner.ended_at
            ? [
                existingBanner.started_at ? dayjs(existingBanner.started_at) : null,
                existingBanner.ended_at ? dayjs(existingBanner.ended_at) : null,
              ]
            : undefined,
      });
    }
  }, [existingBanner, form]);

  const createMutation = useMutation({
    mutationFn: (data: BannerFormData) => bannerApi.create(data),
    onSuccess: () => {
      toast.success('Tạo banner thành công');
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      navigate('/banners');
    },
    onError: () => {
      toast.error('Không thể tạo banner');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: BannerFormData) => bannerApi.update(Number(id), data),
    onSuccess: () => {
      toast.success('Cập nhật banner thành công');
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      navigate('/banners');
    },
    onError: () => {
      toast.error('Không thể cập nhật banner');
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (values: Record<string, unknown>) => {
    const dateRange = values.date_range as [dayjs.Dayjs | null, dayjs.Dayjs | null] | undefined;
    const formData: BannerFormData = {
      title: values.title as string,
      link_url: (values.link_url as string) || '',
      link_target: (values.link_target as '_self' | '_blank') || '_self',
      image_url: values.image_url as string,
      image_mobile_url: (values.image_mobile_url as string) || '',
      position: values.position as BannerPosition,
      sort_order: (values.sort_order as number) || 0,
      is_active: (values.is_active as boolean) ?? true,
      started_at: dateRange?.[0]?.toISOString(),
      ended_at: dateRange?.[1]?.toISOString(),
    };

    if (isEdit) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const imageUrl = Form.useWatch('image_url', form);
  const imageMobileUrl = Form.useWatch('image_mobile_url', form);

  return (
    <>
      <PageHeader title={isEdit ? 'Chỉnh sửa banner' : 'Thêm banner mới'} />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ link_target: '_self', sort_order: 0, is_active: true }}
        style={{ maxWidth: 800 }}
      >
        <Card
          title={<span style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 500 }}>Nội dung</span>}
          style={{ marginBottom: 16, borderRadius: 12, border: '1px solid #E8E3DC' }}
        >
          <Form.Item
            label="Tiêu đề"
            name="title"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder="Nhập tiêu đề banner" />
          </Form.Item>

          <Form.Item label="Đường dẫn liên kết" name="link_url">
            <Input placeholder="https://example.com" />
          </Form.Item>

          <Form.Item label="Mở liên kết" name="link_target">
            <Radio.Group>
              <Radio value="_self">Cùng tab</Radio>
              <Radio value="_blank">Tab mới</Radio>
            </Radio.Group>
          </Form.Item>
        </Card>

        <Card
          title={<span style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 500 }}>Hình ảnh</span>}
          style={{ marginBottom: 16, borderRadius: 12, border: '1px solid #E8E3DC' }}
        >
          <Form.Item
            label="Ảnh desktop"
            name="image_url"
            rules={[{ required: true, message: 'Vui lòng chọn ảnh' }]}
          >
            <ImageUpload
              value={imageUrl}
              onChange={(url) => form.setFieldValue('image_url', url)}
              hint="Kích thước đề xuất: 1920x480px. JPG, PNG, WebP. Tối đa 5MB"
            />
          </Form.Item>

          <Form.Item label="Ảnh mobile (tuỳ chọn)" name="image_mobile_url">
            <ImageUpload
              value={imageMobileUrl}
              onChange={(url) => form.setFieldValue('image_mobile_url', url)}
              hint="Kích thước đề xuất: 768x400px. Nếu không chọn sẽ dùng ảnh desktop"
            />
          </Form.Item>
        </Card>

        <Card
          title={<span style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 500 }}>Cài đặt hiển thị</span>}
          style={{ marginBottom: 16, borderRadius: 12, border: '1px solid #E8E3DC' }}
        >
          <Form.Item
            label="Vị trí hiển thị"
            name="position"
            rules={[{ required: true, message: 'Vui lòng chọn vị trí' }]}
          >
            <Select placeholder="Chọn vị trí" options={positionOptions} />
          </Form.Item>

          <Form.Item label="Thứ tự sắp xếp" name="sort_order">
            <InputNumber min={0} max={999} style={{ width: 120 }} />
          </Form.Item>

          <Form.Item label="Từ ngày - Đến ngày" name="date_range">
            <RangePicker
              format="DD/MM/YYYY"
              placeholder={['Từ ngày', 'Đến ngày']}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item label="Kích hoạt" name="is_active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Card>

        <div className="flex items-center gap-3" style={{ marginBottom: 24 }}>
          <button
            type="button"
            onClick={() => navigate('/banners')}
            style={{
              background: '#fff',
              color: '#374151',
              border: '1px solid #D1D5DB',
              padding: '10px 24px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Huỷ
          </button>
          <button
            type="submit"
            disabled={isPending}
            style={{
              background: '#8B1A1A',
              color: '#fff',
              border: 'none',
              padding: '10px 24px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              cursor: isPending ? 'not-allowed' : 'pointer',
              opacity: isPending ? 0.6 : 1,
            }}
          >
            {isPending ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </Form>
    </>
  );
}
