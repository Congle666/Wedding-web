import { Switch } from 'antd';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import type { TemplateConfig, SectionKey } from '../../../types/templateConfig';
import { SECTION_META } from './constants';

interface Props {
  config: TemplateConfig;
  selectedSection: SectionKey;
  onSelect: (key: SectionKey) => void;
  onChange: (patch: Partial<TemplateConfig> | ((prev: TemplateConfig) => TemplateConfig)) => void;
}

/**
 * Left-column sidebar listing the 9 theme sections. Admin can:
 *   - click to select (opens the inspector on the right)
 *   - toggle visibility
 *   - drag to reorder
 */
export default function SectionSidebar({ config, selectedSection, onSelect, onChange }: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const orderedKeys: SectionKey[] = (Object.keys(config.sections) as SectionKey[]).sort(
    (a, b) => (config.sections[a]?.order ?? 99) - (config.sections[b]?.order ?? 99)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = orderedKeys.indexOf(active.id as SectionKey);
    const newIdx = orderedKeys.indexOf(over.id as SectionKey);
    const next = arrayMove(orderedKeys, oldIdx, newIdx);
    onChange((prev) => ({
      ...prev,
      sections: next.reduce(
        (acc, key, i) => {
          acc[key] = { ...prev.sections[key], order: i + 1 };
          return acc;
        },
        { ...prev.sections }
      ),
    }));
  };

  const handleToggleVisible = (key: SectionKey, visible: boolean) => {
    onChange((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [key]: { ...prev.sections[key], visible },
      },
    }));
  };

  return (
    <div>
      <h3 style={{ fontSize: 13, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
        Các phần thiệp
      </h3>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={orderedKeys} strategy={verticalListSortingStrategy}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {orderedKeys.map((key) => (
              <SortableItem
                key={key}
                id={key}
                label={SECTION_META[key].label}
                description={SECTION_META[key].description}
                selected={selectedSection === key}
                visible={config.sections[key]?.visible !== false}
                onSelect={() => onSelect(key)}
                onToggleVisible={(v) => handleToggleVisible(key, v)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <p style={{ marginTop: 16, fontSize: 12, color: '#9CA3AF' }}>
        Kéo thả để sắp xếp. Dùng công tắc để ẩn/hiện từng phần.
      </p>
    </div>
  );
}

function SortableItem({
  id,
  label,
  description,
  selected,
  visible,
  onSelect,
  onToggleVisible,
}: {
  id: SectionKey;
  label: string;
  description: string;
  selected: boolean;
  visible: boolean;
  onSelect: () => void;
  onToggleVisible: (v: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    background: selected ? '#FFF5F5' : visible ? '#fff' : '#F9FAFB',
    border: selected ? '1px solid #8B1A1A' : '1px solid #E5E7EB',
    borderRadius: 8,
    padding: '10px 12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  };

  return (
    <div ref={setNodeRef} style={style} onClick={onSelect}>
      <span
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        style={{
          cursor: 'grab',
          color: '#9CA3AF',
          fontSize: 16,
          userSelect: 'none',
          width: 14,
          textAlign: 'center',
        }}
        title="Kéo để sắp xếp"
      >
        ⋮⋮
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: visible ? '#1A1A1A' : '#9CA3AF' }}>
          {label}
        </div>
        <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{description}</div>
      </div>
      <Switch
        size="small"
        checked={visible}
        onClick={(_, e) => e.stopPropagation()}
        onChange={onToggleVisible}
      />
    </div>
  );
}
