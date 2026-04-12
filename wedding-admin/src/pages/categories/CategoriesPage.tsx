import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Modal, message, Input, InputNumber, Switch } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { templateApi } from '../../api/template.api';
import PageHeader from '../../components/ui/PageHeader';
import type { TemplateCategory } from '../../types';

interface CategoryFormState {
  visible: boolean;
  editingId: number | null;
  name: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  sort_order: number;
  is_active: boolean;
}

const initialForm: CategoryFormState = {
  visible: false,
  editingId: null,
  name: '',
  slug: '',
  description: '',
  thumbnail_url: '',
  sort_order: 0,
  is_active: true,
};

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CategoryFormState>(initialForm);

  const { data: categoriesRes, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => templateApi.getCategories(),
  });

  const categories = categoriesRes?.data || [];

  const createMutation = useMutation({
    mutationFn: (data: Partial<TemplateCategory>) => templateApi.createCategory(data),
    onSuccess: () => {
      message.success('Tạo danh mục thành công');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setForm(initialForm);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TemplateCategory> }) => templateApi.updateCategory(id, data),
    onSuccess: () => {
      message.success('Cập nhật danh mục thành công');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setForm(initialForm);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => templateApi.deleteCategory(id),
    onSuccess: () => {
      message.success('Đã xoá danh mục');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Xoá danh mục',
      content: 'Bạn có chắc muốn xoá danh mục này? Các mẫu thiệp thuộc danh mục sẽ bị ảnh hưởng.',
      okText: 'Xoá',
      cancelText: 'Huỷ',
      okButtonProps: { danger: true },
      onOk: () => deleteMutation.mutateAsync(id),
    });
  };

  const handleEdit = (record: TemplateCategory) => {
    setForm({
      visible: true,
      editingId: record.id,
      name: record.name,
      slug: record.slug,
      description: record.description || '',
      thumbnail_url: record.thumbnail_url || '',
      sort_order: record.sort_order,
      is_active: record.is_active,
    });
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      message.warning('Vui lòng nhập tên danh mục');
      return;
    }
    const payload = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      description: form.description,
      thumbnail_url: form.thumbnail_url,
      sort_order: form.sort_order,
      is_active: form.is_active,
    };
    if (form.editingId) {
      updateMutation.mutate({ id: form.editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const columns: ColumnsType<TemplateCategory> = [
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <span style={{ fontWeight: 600, fontSize: 14, color: '#1A1A1A' }}>{name}</span>
      ),
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      render: (slug: string) => (
        <span style={{ fontSize: 13, color: '#6B6B6B', fontFamily: 'monospace' }}>{slug}</span>
      ),
    },
    {
      title: 'Thứ tự',
      dataIndex: 'sort_order',
      key: 'sort_order',
      width: 100,
      align: 'center' as const,
      render: (val: number) => (
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{val}</span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 120,
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
      width: 120,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 12 }}>
          <span
            onClick={() => handleEdit(record)}
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
    <>
      <PageHeader
        title="Danh mục"
        subtitle="Quản lý danh mục mẫu thiệp"
        onAdd={() => setForm({ ...initialForm, visible: true })}
        addText="Thêm danh mục"
      />

      <Table<TemplateCategory>
        rowKey="id"
        columns={columns}
        dataSource={categories}
        loading={isLoading}
        pagination={{ pageSize: 20, showSizeChanger: false }}
        scroll={{ x: 600 }}
        style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8E3DC' }}
        locale={{ emptyText: 'Chưa có danh mục nào' }}
      />

      <Modal
        open={form.visible}
        title={form.editingId ? 'Sửa danh mục' : 'Thêm danh mục'}
        okText={form.editingId ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Huỷ"
        onCancel={() => setForm(initialForm)}
        onOk={handleSave}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 12 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4, display: 'block' }}>
              Tên danh mục
            </label>
            <Input
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                setForm((f) => ({
                  ...f,
                  name,
                  slug: f.editingId ? f.slug : slugify(name),
                }));
              }}
              placeholder="Nhập tên danh mục"
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4, display: 'block' }}>
              Slug
            </label>
            <Input
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="slug-danh-muc"
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4, display: 'block' }}>
              Mô tả
            </label>
            <Input.TextArea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Mô tả danh mục"
              rows={2}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4, display: 'block' }}>
              URL ảnh đại diện
            </label>
            <Input
              value={form.thumbnail_url}
              onChange={(e) => setForm((f) => ({ ...f, thumbnail_url: e.target.value }))}
              placeholder="https://..."
            />
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4, display: 'block' }}>
                Thứ tự sắp xếp
              </label>
              <InputNumber
                value={form.sort_order}
                onChange={(val) => setForm((f) => ({ ...f, sort_order: val ?? 0 }))}
                min={0}
                style={{ width: 120 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4, display: 'block' }}>
                Hiển thị
              </label>
              <Switch
                checked={form.is_active}
                onChange={(checked) => setForm((f) => ({ ...f, is_active: checked }))}
              />
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
