import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Drawer, Form, Input, InputNumber, Select, Switch, Space, Tooltip } from 'antd';
import toast from 'react-hot-toast';
import { Puck, type Data } from '@measured/puck';
import '@measured/puck/puck.css';

import {
  type BuilderConfig,
  type BlockInstance,
  type GlobalStyles,
  createEmptyBuilderConfig,
  DEFAULT_GLOBAL_STYLES,
  isBuilderConfig,
  BLOCK_TYPE_META,
} from '../../../types/builderConfig';
import { puckConfig } from './puckConfig';
import { templateApi } from '../../../api/template.api';
import api from '../../../api/axios';
import { slugify } from '../../../utils/format';
import GlobalStylesPanel from './GlobalStylesPanel';
import PresetPicker from './PresetPicker';
import { BuilderProvider } from './BuilderContext';

/**
 * Builder V2 — Puck-powered hybrid section-block editor.
 *
 * Admin drags section blocks from the left sidebar into the canvas center.
 * Within each block, elements can be repositioned (Phase 04).
 * Right panel shows Puck's component inspector + global styles.
 *
 * Route bindings:
 *   /templates/new/builder-v2        → create mode
 *   /templates/edit/:id/builder-v2   → edit mode
 */
export default function BuilderV2Page() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [metaOpen, setMetaOpen] = useState(false);
  const [meta, setMeta] = useState({
    name: '',
    slug: '',
    category_id: undefined as number | undefined,
    description: '',
    price_per_day: 0,
    price_per_month: 0,
    is_free: false,
    is_active: true,
    thumbnail_url: '',
  });

  const [globalStyles, setGlobalStyles] = useState<GlobalStyles>(DEFAULT_GLOBAL_STYLES);

  // Categories for metadata drawer
  const { data: categoriesRes } = useQuery({
    queryKey: ['template-categories'],
    queryFn: () => templateApi.getCategories(),
  });
  const categories = categoriesRes?.data || [];

  // Edit mode: fetch existing template
  const { data: templateRes, isLoading } = useQuery({
    queryKey: ['template', id],
    queryFn: () => templateApi.getById(id!),
    enabled: isEdit,
  });

  // Convert BuilderConfig blocks → Puck Data format
  const builderConfigToPuckData = useCallback((config: BuilderConfig): Data => {
    return {
      root: { props: {} },
      content: config.blocks.map((block) => ({
        type: block.blockType,
        props: {
          id: block.id,
          elements: block.elements,
          settings: block.settings,
        },
      })),
    };
  }, []);

  // Convert Puck Data → BuilderConfig blocks
  const puckDataToBlocks = useCallback((data: Data): BlockInstance[] => {
    return data.content.map((item: any, i: number) => ({
      id: item.props?.id || `block-${Date.now()}-${i}`,
      blockType: item.type,
      visible: true,
      elements: item.props?.elements || [],
      settings: item.props?.settings || {},
    }));
  }, []);

  // Initial Puck data — empty canvas or loaded from DB
  const [initialPuckData, setInitialPuckData] = useState<Data>({
    root: { props: {} },
    content: [],
  });

  // Hydrate from DB when editing
  useEffect(() => {
    if (!templateRes?.data) return;
    const t = templateRes.data;
    setMeta({
      name: t.name || '',
      slug: t.slug || '',
      category_id: t.category_id,
      description: t.description || '',
      price_per_day: Number(t.price_per_day) || 0,
      price_per_month: Number(t.price_per_month) || 0,
      is_free: !!t.is_free,
      is_active: t.is_active !== false,
      thumbnail_url: t.thumbnail_url || '',
    });
    const cf = t.customizable_fields;
    if (cf && isBuilderConfig(cf)) {
      setInitialPuckData(builderConfigToPuckData(cf));
      setGlobalStyles(cf.globalStyles || DEFAULT_GLOBAL_STYLES);
    }
  }, [templateRes, builderConfigToPuckData]);

  // Whether the preset picker has been dismissed (create mode only).
  const [editorReady, setEditorReady] = useState(isEdit);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Ref to latest Puck data (updated on every Puck onChange)
  const [latestPuckData, setLatestPuckData] = useState<Data>(initialPuckData);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const builderConfig: BuilderConfig = {
        version: '2.0',
        blocks: puckDataToBlocks(latestPuckData),
        globalStyles,
      };
      const payload: any = {
        category_id: meta.category_id,
        name: meta.name,
        slug: meta.slug || slugify(meta.name),
        thumbnail_url: meta.thumbnail_url,
        preview_images: [],
        price_per_day: meta.is_free ? 0 : meta.price_per_day,
        price_per_month: meta.is_free ? 0 : meta.price_per_month,
        description: meta.description,
        html_content: '',
        theme_slug: 'dynamic-v2',
        is_free: meta.is_free,
        has_video: false,
        is_active: meta.is_active,
        customizable_fields: builderConfig,
      };
      if (isEdit) {
        return api.put(`/admin/templates/${id}`, payload).then((r: any) => r.data);
      }
      return api.post('/admin/templates', payload).then((r: any) => r.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast.success(isEdit ? 'Đã cập nhật mẫu thiệp' : 'Đã tạo mẫu thiệp mới');
      navigate('/templates');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Lưu thất bại');
    },
  });

  const handleSave = () => {
    if (!meta.name.trim() || !meta.category_id) {
      setMetaOpen(true);
      toast.error('Vui lòng điền tên và danh mục');
      return;
    }
    saveMutation.mutate();
  };

  if (isEdit && isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
        Đang tải...
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        background: '#FAFAFA',
        zIndex: 1000,
      }}
    >
      {/* Header */}
      <div
        style={{
          flex: '0 0 auto',
          height: 56,
          background: '#fff',
          borderBottom: '1px solid #E5E7EB',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Space size={12}>
          <Button size="small" onClick={() => navigate('/templates')}>
            ← Quay lại
          </Button>
          <strong style={{ fontSize: 15 }}>
            Builder V2 {meta.name ? `— ${meta.name}` : ''}
          </strong>
        </Space>
        <Space size={8}>
          <Button size="small" onClick={() => setMetaOpen(true)}>
            Thông tin
          </Button>
          <Button
            type="primary"
            size="small"
            loading={saveMutation.isPending}
            onClick={handleSave}
            style={{ background: '#8B1A1A', borderColor: '#8B1A1A' }}
          >
            {isEdit ? 'Lưu' : 'Tạo mẫu thiệp'}
          </Button>
        </Space>
      </div>

      {/* Content area */}
      <div style={{ flex: '1 1 auto', minHeight: 0, overflow: 'hidden' }}>
        {!editorReady ? (
          /* Preset picker — shown first in create mode */
          <PresetPicker
            onStartBlank={() => {
              setEditorReady(true);
            }}
            onSelectPreset={(config) => {
              setInitialPuckData(builderConfigToPuckData(config));
              setGlobalStyles(config.globalStyles);
              setEditorReady(true);
            }}
          />
        ) : (
          /* Puck Editor wrapped in BuilderProvider for context */
          <BuilderProvider
            value={{
              globalStyles,
              selectedElementId,
              onSelectElement: setSelectedElementId,
            }}
          >
            <Puck
              config={puckConfig}
              data={initialPuckData}
              onChange={(data) => setLatestPuckData(data)}
              overrides={{
                // Append GlobalStylesPanel below Puck's default fields
                fields: ({ children }: any) => (
                  <div>
                    {children}
                    <div style={{ borderTop: '1px solid #E5E7EB', marginTop: 8 }}>
                      <GlobalStylesPanel
                        globalStyles={globalStyles}
                        onChange={setGlobalStyles}
                      />
                    </div>
                  </div>
                ),
              }}
            />
          </BuilderProvider>
        )}
      </div>

      {/* Metadata drawer */}
      <Drawer
        title="Thông tin mẫu thiệp"
        placement="right"
        width={400}
        open={metaOpen}
        onClose={() => setMetaOpen(false)}
      >
        <Form layout="vertical">
          <Form.Item label="Tên mẫu thiệp" required>
            <Input
              value={meta.name}
              onChange={(e) => {
                const name = e.target.value;
                setMeta((m) => ({ ...m, name, slug: m.slug || slugify(name) }));
              }}
            />
          </Form.Item>
          <Form.Item label="Slug" required>
            <Input
              value={meta.slug}
              onChange={(e) => setMeta((m) => ({ ...m, slug: e.target.value }))}
            />
          </Form.Item>
          <Form.Item label="Danh mục" required>
            <Select
              value={meta.category_id}
              onChange={(v) => setMeta((m) => ({ ...m, category_id: v }))}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              placeholder="Chọn danh mục"
            />
          </Form.Item>
          <Form.Item label="Mô tả">
            <Input.TextArea
              rows={3}
              value={meta.description}
              onChange={(e) => setMeta((m) => ({ ...m, description: e.target.value }))}
            />
          </Form.Item>
          <Form.Item label="Ảnh đại diện (URL)">
            <Input
              value={meta.thumbnail_url}
              onChange={(e) => setMeta((m) => ({ ...m, thumbnail_url: e.target.value }))}
              placeholder="/uploads/..."
            />
          </Form.Item>
          <Form.Item>
            <label style={{ display: 'flex', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={meta.is_free}
                onChange={(e) => setMeta((m) => ({ ...m, is_free: e.target.checked }))}
              />
              <span>Miễn phí</span>
            </label>
          </Form.Item>
          {!meta.is_free && (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Form.Item label="Giá/ngày (VND)">
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  step={10000}
                  value={meta.price_per_day}
                  onChange={(v) => setMeta((m) => ({ ...m, price_per_day: Number(v) || 0 }))}
                />
              </Form.Item>
              <Form.Item label="Giá/tháng (VND)">
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  step={10000}
                  value={meta.price_per_month}
                  onChange={(v) => setMeta((m) => ({ ...m, price_per_month: Number(v) || 0 }))}
                />
              </Form.Item>
            </Space>
          )}
          <Form.Item label="Hiển thị">
            <Switch
              checked={meta.is_active}
              onChange={(v) => setMeta((m) => ({ ...m, is_active: v }))}
            />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
