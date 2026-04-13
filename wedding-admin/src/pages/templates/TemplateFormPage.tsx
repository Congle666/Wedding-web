import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Form, Input, InputNumber, Select, Switch, Button, Space } from 'antd';
import toast from 'react-hot-toast';
import PageHeader from '../../components/ui/PageHeader';
import ImageUpload from '../../components/ui/ImageUpload';
import CustomFieldEditor from './components/CustomFieldEditor';
import { templateApi } from '../../api/template.api';
import api from '../../api/axios';
import type { TemplateFormData } from '../../api/template.api';
import type { CustomizableField } from '../../types';
import { slugify, formatVND } from '../../utils/format';

export default function TemplateFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<TemplateFormData>();
  const [customFields, setCustomFields] = useState<CustomizableField[]>([]);
  const [thumbnailPreview, setThumbnailPreview] = useState('');

  const { data: categoriesRes } = useQuery({
    queryKey: ['template-categories'],
    queryFn: () => templateApi.getCategories(),
  });

  const { data: themesRes } = useQuery({
    queryKey: ['themes'],
    queryFn: () => api.get('/admin/themes').then((r: any) => r.data),
  });

  const { data: templateRes, isLoading: templateLoading } = useQuery({
    queryKey: ['template', id],
    queryFn: () => templateApi.getById(id!),
    enabled: isEdit,
  });

  const categories = categoriesRes?.data || [];
  const themes = (themesRes as any)?.data || [];
  const template = templateRes?.data;

  useEffect(() => {
    if (template) {
      form.setFieldsValue({
        name: template.name,
        slug: template.slug,
        category_id: template.category_id,
        description: template.description,
        price_per_day: template.price_per_day,
        price_per_month: template.price_per_month,
        thumbnail_url: template.thumbnail_url,
        has_video: template.has_video,
        is_active: template.is_active,
        theme_slug: (template as any).theme_slug || 'songphung-red',
      });
      setCustomFields(template.customizable_fields || []);
      setThumbnailPreview(template.thumbnail_url || '');
    }
  }, [template, form]);

  const createMutation = useMutation({
    mutationFn: (data: TemplateFormData) => templateApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success('Tạo mẫu thiệp thành công', { className: 'toast-success' });
      navigate('/templates');
    },
    onError: () => {
      toast.error('Tạo mẫu thiệp thất bại', { className: 'toast-error' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: TemplateFormData) => templateApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['template', id] });
      toast.success('Cập nhật mẫu thiệp thành công', { className: 'toast-success' });
      navigate('/templates');
    },
    onError: () => {
      toast.error('Cập nhật mẫu thiệp thất bại', { className: 'toast-error' });
    },
  });

  const saving = createMutation.isPending || updateMutation.isPending;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (!isEdit || !template?.slug) {
      form.setFieldValue('slug', slugify(name));
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setThumbnailPreview(e.target.value);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload: any = {
        ...values,
        customizable_fields: customFields,
        preview_images: [],
        has_video: values.has_video ?? false,
        is_active: values.is_active ?? true,
        theme_slug: values.theme_slug || 'songphung-red',
      };
      if (isEdit) {
        updateMutation.mutate(payload);
      } else {
        createMutation.mutate(payload);
      }
    } catch {
      // validation errors shown by antd
    }
  };

  const pricePerDay = Form.useWatch('price_per_day', form) || 0;
  const pricePerMonth = Form.useWatch('price_per_month', form) || 0;
  const isFreeWatch = Form.useWatch('is_free' as any, form) || false;

  const savingsText = useMemo(() => {
    if (pricePerDay <= 0 || pricePerMonth <= 0) return null;
    const monthlyFromDaily = pricePerDay * 30;
    if (monthlyFromDaily <= pricePerMonth) return null;
    const saved = monthlyFromDaily - pricePerMonth;
    const pct = Math.round((saved / monthlyFromDaily) * 100);
    return `Tiết kiệm ${formatVND(saved)} (${pct}%) so với thuê theo ngày`;
  }, [pricePerDay, pricePerMonth]);

  if (isEdit && templateLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 48, color: '#9CA3AF' }}>
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 80 }}>
      <PageHeader
        title={isEdit ? 'Chỉnh sửa mẫu thiệp' : 'Thêm mẫu thiệp mới'}
        extra={
          <button
            onClick={() =>
              navigate(isEdit ? `/templates/edit/${id}/builder` : '/templates/new/builder')
            }
            style={{
              background: '#8B1A1A',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Mở Builder kéo thả →
          </button>
        }
      />

      <Form
        form={form}
        layout="vertical"
        initialValues={{ is_active: true, has_video: false }}
        requiredMark={false}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 20,
          }}
          className="template-form-grid"
        >
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, gridColumn: '1' }}>
            <Card
              title={
                <span style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 600 }}>
                  Thông tin cơ bản
                </span>
              }
              styles={{ body: { padding: 20 } }}
              style={{ borderRadius: 12 }}
            >
              <Form.Item
                label="Tên mẫu thiệp"
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập tên mẫu thiệp' }]}
              >
                <Input placeholder="Nhập tên mẫu thiệp" onChange={handleNameChange} />
              </Form.Item>

              <Form.Item
                label="Slug"
                name="slug"
                rules={[{ required: true, message: 'Vui lòng nhập slug' }]}
              >
                <Input placeholder="slug-tu-dong" />
              </Form.Item>

              <Form.Item
                label="Danh mục"
                name="category_id"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
              >
                <Select
                  placeholder="Chọn danh mục"
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
                />
              </Form.Item>

              <Form.Item label="Mô tả" name="description">
                <Input.TextArea rows={4} placeholder="Mô tả mẫu thiệp..." />
              </Form.Item>
            </Card>

            <Card
              title={
                <span style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 600 }}>
                  Giá thuê
                </span>
              }
              styles={{ body: { padding: 20 } }}
              style={{ borderRadius: 12 }}
            >
              <Form.Item name="is_free" valuePropName="checked" style={{ marginBottom: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" onChange={(e) => {
                    form.setFieldValue('is_free' as any, e.target.checked);
                    if (e.target.checked) {
                      form.setFieldsValue({ price_per_day: 0, price_per_month: 0 });
                    }
                  }} checked={isFreeWatch} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#065F46' }}>🎁 Miễn phí (không cần thanh toán)</span>
                </label>
              </Form.Item>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Form.Item
                  label="Giá theo ngày"
                  name="price_per_day"
                  rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    step={10000}
                    disabled={isFreeWatch}
                    formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(val) => Number(val?.replace(/,/g, '') || 0) as any}
                    addonAfter="VND"
                  />
                </Form.Item>

                <Form.Item
                  label="Giá theo tháng"
                  name="price_per_month"
                  rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    step={10000}
                    disabled={isFreeWatch}
                    formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(val) => Number(val?.replace(/,/g, '') || 0) as any}
                    addonAfter="VND"
                  />
                </Form.Item>
              </div>

              {savingsText && (
                <div
                  style={{
                    background: '#F0FFF4',
                    color: '#065F46',
                    padding: '8px 12px',
                    borderRadius: 8,
                    fontSize: 13,
                  }}
                >
                  {savingsText}
                </div>
              )}
            </Card>

            <Card
              title={
                <span style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 600 }}>
                  Kiểu thiệp cưới
                </span>
              }
              styles={{ body: { padding: 20 } }}
              style={{ borderRadius: 12 }}
            >
              <p style={{ fontSize: 13, color: '#6B6B6B', marginBottom: 16 }}>
                Chọn kiểu thiệp hiển thị cho khách hàng. Mỗi kiểu có phong cách thiết kế khác nhau.
              </p>

              <Form.Item
                name="theme_slug"
                rules={[{ required: true, message: 'Vui lòng chọn kiểu thiệp' }]}
              >
                <Select
                  placeholder="Chọn kiểu thiệp"
                  options={themes.map((t: any) => ({
                    value: t.slug,
                    label: t.name + (t.description ? ' — ' + t.description : ''),
                  }))}
                  size="large"
                />
              </Form.Item>
            </Card>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Card
              title={
                <span style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 600 }}>
                  Ảnh đại diện mẫu thiệp
                </span>
              }
              styles={{ body: { padding: 20 } }}
              style={{ borderRadius: 12 }}
            >
              <p style={{ fontSize: 13, color: '#6B6B6B', marginBottom: 12 }}>
                Ảnh hiển thị trong danh sách mẫu thiệp. Khách hàng sẽ thấy ảnh này khi duyệt chọn mẫu.
              </p>
              <ImageUpload
                value={thumbnailPreview}
                onChange={(url) => {
                  form.setFieldValue('thumbnail_url', url);
                  setThumbnailPreview(url);
                }}
                hint="JPG, PNG, WebP. Tối đa 5MB. Tỷ lệ 4:3 đẹp nhất"
              />
              <Form.Item name="thumbnail_url" hidden>
                <Input />
              </Form.Item>
            </Card>

            <Card
              title={
                <span style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 600 }}>
                  Cài đặt
                </span>
              }
              styles={{ body: { padding: 20 } }}
              style={{ borderRadius: 12 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <span style={{ fontSize: 14, color: '#1A1A1A' }}>Có video giới thiệu</span>
                  <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Đánh dấu mẫu thiệp này có video demo</p>
                </div>
                <Form.Item name="has_video" valuePropName="checked" noStyle>
                  <Switch />
                </Form.Item>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: 14, color: '#1A1A1A' }}>Hiển thị cho khách hàng</span>
                  <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Tắt nếu muốn ẩn mẫu thiệp</p>
                </div>
                <Form.Item name="is_active" valuePropName="checked" noStyle>
                  <Switch />
                </Form.Item>
              </div>
            </Card>
          </div>
        </div>
      </Form>

      {/* Sticky footer */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#fff',
          borderTop: '1px solid #E5E7EB',
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'flex-end',
          zIndex: 100,
        }}
      >
        <Space size={12}>
          <Button
            onClick={() => navigate('/templates')}
            style={{
              borderColor: '#D1D5DB',
              color: '#374151',
              borderRadius: 8,
              height: 40,
              padding: '0 24px',
            }}
          >
            Huỷ
          </Button>
          <Button
            type="primary"
            loading={saving}
            onClick={handleSubmit}
            style={{
              background: '#8B1A1A',
              borderColor: '#8B1A1A',
              borderRadius: 8,
              height: 40,
              padding: '0 24px',
            }}
          >
            Lưu mẫu thiệp
          </Button>
        </Space>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .template-form-grid {
            grid-template-columns: 2fr 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
