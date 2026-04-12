import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Drawer, Form, Input, InputNumber, Select, Switch, Space, Tooltip } from 'antd';
import toast from 'react-hot-toast';

import {
  DEFAULT_SONGPHUNG_RED_CONFIG,
  type TemplateConfig,
  type SectionKey,
} from '../../../types/templateConfig';
import { templateApi } from '../../../api/template.api';
import api from '../../../api/axios';
import { slugify } from '../../../utils/format';

import PreviewFrame, {
  type PreviewFrameHandle,
  type SlotFocusEvent,
  type PresetDropEvent,
  type TextEditEvent,
} from './PreviewFrame';
import SectionSidebar from './SectionSidebar';
import InspectorPanel from './InspectorPanel';
import { useDebouncedEffect } from './useDebounced';
import type { TemplateMetadata } from './types';

/**
 * Builder page for creating / editing a wedding invitation template visually.
 *
 * Route bindings:
 *   /templates/new/builder        → create mode
 *   /templates/edit/:id/builder   → edit mode (fetches template by id)
 *
 * Owns the single `TemplateConfig` state. Every mutation flows through
 * `updateConfig` which pushes a debounced update to the iframe preview via
 * `PreviewFrame` imperative handle.
 */
export default function TemplateBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const previewRef = useRef<PreviewFrameHandle | null>(null);

  // Full TemplateConfig state — single source of truth for the builder.
  const [config, setConfig] = useState<TemplateConfig>(() => DEFAULT_SONGPHUNG_RED_CONFIG);
  const [selectedSection, setSelectedSection] = useState<SectionKey>('cover');
  // Lifted from AssetSlotEditor so iframe SLOT_FOCUSED events can drive it.
  const [activeSlotKey, setActiveSlotKey] = useState<string>('phoenix_left');
  const [metaOpen, setMetaOpen] = useState(false);
  const [meta, setMeta] = useState<TemplateMetadata>({
    name: '',
    slug: '',
    category_id: undefined,
    description: '',
    price_per_day: 0,
    price_per_month: 0,
    is_free: false,
    is_active: true,
    thumbnail_url: '',
  });

  // Load categories for metadata drawer
  const { data: categoriesRes } = useQuery({
    queryKey: ['template-categories'],
    queryFn: () => templateApi.getCategories(),
  });
  const categories = categoriesRes?.data || [];

  // Edit mode: fetch the template and hydrate state.
  const { data: templateRes, isLoading: templateLoading } = useQuery({
    queryKey: ['template', id],
    queryFn: () => templateApi.getById(id!),
    enabled: isEdit,
  });

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
    // customizable_fields may be a TemplateConfig object OR a legacy array.
    // Only treat it as TemplateConfig when it's an object with the `version` field.
    const cf = t.customizable_fields;
    if (cf && typeof cf === 'object' && !Array.isArray(cf) && (cf as any).version) {
      setConfig({ ...DEFAULT_SONGPHUNG_RED_CONFIG, ...(cf as Partial<TemplateConfig>) } as TemplateConfig);
    }
  }, [templateRes]);

  // Debounced push to iframe preview on every config change.
  useDebouncedEffect(config, 120, (c) => {
    previewRef.current?.pushConfig(c);
  });

  const updateConfig = useCallback((patch: Partial<TemplateConfig> | ((prev: TemplateConfig) => TemplateConfig)) => {
    setConfig((prev) => {
      if (typeof patch === 'function') return patch(prev);
      return { ...prev, ...patch };
    });
  }, []);

  // Iframe → admin: user clicked an editable element in the preview.
  // Switch the inspector to that section + slot so right panel reflects it.
  const handleIframeSlotFocus = useCallback((e: SlotFocusEvent) => {
    if (e.section in (DEFAULT_SONGPHUNG_RED_CONFIG.sections as Record<string, unknown>)) {
      setSelectedSection(e.section as SectionKey);
    }
    setActiveSlotKey(e.slot);
    // Toast nudge so the admin understands what to do next.
    toast(
      `Đã chọn "${e.slot}" — chọn ảnh từ thư viện bên phải hoặc kéo thả vào preview`,
      { icon: '👉', duration: 3000 }
    );
  }, []);

  // Iframe → admin: user dropped a preset thumbnail directly onto an element
  // inside the preview. Apply the URL straight to that section/slot.
  const handleIframePresetDrop = useCallback((e: PresetDropEvent) => {
    setConfig((prev) => {
      const sectionAssets = (prev.assets as any)[e.section] || {};
      return {
        ...prev,
        assets: {
          ...prev.assets,
          [e.section]: { ...sectionAssets, [e.slot]: e.url },
        },
      };
    });
    // Also focus the slot in the inspector so admin sees what changed.
    if (e.section in (DEFAULT_SONGPHUNG_RED_CONFIG.sections as Record<string, unknown>)) {
      setSelectedSection(e.section as SectionKey);
    }
    setActiveSlotKey(e.slot);
    toast.success('Đã đổi ảnh trong xem trước');
  }, []);

  // Iframe → admin: user committed an inline text edit (blur/Enter).
  // Persist into cfg.text_samples[section][slot].
  const handleIframeTextEdit = useCallback((e: TextEditEvent) => {
    setConfig((prev) => {
      const sectionText = (prev.text_samples as any)[e.section] || {};
      return {
        ...prev,
        text_samples: {
          ...prev.text_samples,
          [e.section]: { ...sectionText, [e.slot]: e.value },
        },
      };
    });
  }, []);

  // Save mutation — writes the full `customizable_fields` JSON via admin API.
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        category_id: meta.category_id,
        name: meta.name,
        slug: meta.slug,
        thumbnail_url: meta.thumbnail_url,
        preview_images: [],
        price_per_day: meta.is_free ? 0 : meta.price_per_day,
        price_per_month: meta.is_free ? 0 : meta.price_per_month,
        description: meta.description,
        html_content: '',
        theme_slug: 'songphung-red',
        is_free: meta.is_free,
        has_video: false,
        is_active: meta.is_active,
        customizable_fields: config,
      };
      if (isEdit) {
        return api.put(`/admin/templates/${id}`, payload).then((r: any) => r.data);
      }
      return api.post('/admin/templates', payload).then((r: any) => r.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      if (isEdit) queryClient.invalidateQueries({ queryKey: ['template', id] });
      toast.success(isEdit ? 'Đã cập nhật mẫu thiệp' : 'Đã tạo mẫu thiệp mới');
      navigate('/templates');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Lưu mẫu thiệp thất bại';
      toast.error(msg);
    },
  });

  const handleSave = () => {
    if (!meta.name.trim() || !meta.category_id) {
      setMetaOpen(true);
      toast.error('Vui lòng điền tên và danh mục trước khi lưu');
      return;
    }
    if (!meta.slug) setMeta((m) => ({ ...m, slug: slugify(meta.name) }));
    saveMutation.mutate();
  };

  // Duplicate action — only visible in edit mode
  const handleDuplicate = () => {
    const ts = Date.now();
    setMeta((m) => ({
      ...m,
      name: `${m.name} (copy)`,
      slug: `${m.slug || slugify(m.name)}-copy-${ts}`,
    }));
    navigate('/templates/new/builder', { replace: true });
    toast.success('Đã nhân bản cấu hình — bấm Lưu để tạo mẫu mới');
  };

  const loading = isEdit && templateLoading;

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
          height: 60,
          background: '#fff',
          borderBottom: '1px solid #E5E7EB',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <Space size={12}>
          <Button onClick={() => navigate('/templates')}>Quay lại</Button>
          <strong style={{ fontSize: 16 }}>
            {isEdit ? 'Chỉnh sửa mẫu thiệp' : 'Tạo mẫu thiệp mới'}
            {meta.name ? ` — ${meta.name}` : ''}
          </strong>
        </Space>
        <Space size={8}>
          <Button onClick={() => setMetaOpen(true)}>Thông tin mẫu</Button>
          {isEdit && (
            <Tooltip title="Tạo một mẫu mới dựa trên cấu hình hiện tại">
              <Button onClick={handleDuplicate}>Nhân bản</Button>
            </Tooltip>
          )}
          <Button
            type="primary"
            loading={saveMutation.isPending}
            onClick={handleSave}
            style={{ background: '#8B1A1A', borderColor: '#8B1A1A' }}
          >
            {isEdit ? 'Lưu thay đổi' : 'Tạo mẫu thiệp'}
          </Button>
        </Space>
      </div>

      {/* Body — 3 columns */}
      <div
        style={{
          flex: '1 1 auto',
          display: 'grid',
          gridTemplateColumns: '260px 1fr 340px',
          gap: 12,
          padding: 12,
          minHeight: 0,
        }}
      >
        {/* Left sidebar — sections */}
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            padding: 12,
            overflow: 'auto',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          <SectionSidebar
            config={config}
            selectedSection={selectedSection}
            onSelect={setSelectedSection}
            onChange={updateConfig}
          />
        </div>

        {/* Center — iframe preview */}
        <div style={{ minWidth: 0, minHeight: 0 }}>
          {loading ? (
            <div
              style={{
                height: '100%',
                background: '#fff',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9CA3AF',
              }}
            >
              Đang tải mẫu thiệp...
            </div>
          ) : (
            <PreviewFrame
              ref={previewRef}
              themeSlug="songphung-red"
              onSlotFocus={handleIframeSlotFocus}
              onPresetDrop={handleIframePresetDrop}
              onTextEdit={handleIframeTextEdit}
            />
          )}
        </div>

        {/* Right — inspector */}
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            padding: 16,
            overflow: 'auto',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          <InspectorPanel
            section={selectedSection}
            config={config}
            onChange={updateConfig}
            activeSlotKey={activeSlotKey}
            onActiveSlotChange={setActiveSlotKey}
          />
        </div>
      </div>

      {/* Metadata drawer */}
      <Drawer
        title="Thông tin mẫu thiệp"
        placement="right"
        width={420}
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
              placeholder="Nhập tên mẫu thiệp"
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
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={meta.is_free}
                onChange={(e) => setMeta((m) => ({ ...m, is_free: e.target.checked }))}
              />
              <span>Miễn phí (không cần thanh toán)</span>
            </label>
          </Form.Item>
          {!meta.is_free && (
            <>
              <Form.Item label="Giá theo ngày (VND)">
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  step={10000}
                  value={meta.price_per_day}
                  onChange={(v) => setMeta((m) => ({ ...m, price_per_day: Number(v) || 0 }))}
                />
              </Form.Item>
              <Form.Item label="Giá theo tháng (VND)">
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  step={10000}
                  value={meta.price_per_month}
                  onChange={(v) => setMeta((m) => ({ ...m, price_per_month: Number(v) || 0 }))}
                />
              </Form.Item>
            </>
          )}
          <Form.Item label="Hiển thị cho khách hàng">
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
