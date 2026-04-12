import { Button } from 'antd';
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
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ImageUpload from '../../../components/ui/ImageUpload';
import type { TemplateConfig } from '../../../types/templateConfig';

interface Props {
  config: TemplateConfig;
  onChange: (patch: Partial<TemplateConfig> | ((prev: TemplateConfig) => TemplateConfig)) => void;
}

/**
 * Manages the gallery image array stored at `cfg.assets.gallery.images`.
 * Supports add, remove, drag-to-reorder via @dnd-kit/sortable.
 */
export default function GallerySlotEditor({ config, onChange }: Props) {
  const images: string[] = config.assets.gallery?.images || [];
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const setImages = (next: string[]) => {
    onChange((prev) => ({
      ...prev,
      assets: {
        ...prev.assets,
        gallery: { ...(prev.assets.gallery || {}), images: next },
      },
    }));
  };

  const handleAdd = (url: string) => {
    if (!url) return;
    setImages([...images, url]);
  };

  const handleRemove = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = Number(active.id);
    const to = Number(over.id);
    setImages(arrayMove(images, from, to));
  };

  return (
    <div>
      <div style={{ fontSize: 13, color: '#6B6B6B', marginBottom: 8 }}>
        Ảnh mẫu cho phần Thư viện ảnh. Khách hàng có thể thay ảnh của họ sau
        khi đặt mua — đây là ảnh placeholder mà admin thấy trước.
      </div>

      {images.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={images.map((_, i) => String(i))} strategy={rectSortingStrategy}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                gap: 8,
                marginBottom: 12,
              }}
            >
              {images.map((url, i) => (
                <SortableThumb key={i} id={String(i)} url={url} onRemove={() => handleRemove(i)} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <div style={{ marginTop: 4 }}>
        <ImageUpload
          value=""
          onChange={handleAdd}
          hint="Thêm ảnh mới — kéo thả hoặc bấm để chọn"
        />
      </div>

      {images.length > 0 && (
        <Button
          danger
          type="text"
          size="small"
          onClick={() => setImages([])}
          style={{ marginTop: 8 }}
        >
          Xoá toàn bộ ảnh mẫu
        </Button>
      )}
    </div>
  );
}

function SortableThumb({
  id,
  url,
  onRemove,
}: {
  id: string;
  url: string;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative',
    aspectRatio: '1 / 1',
    borderRadius: 6,
    overflow: 'hidden',
    border: '1px solid #E5E7EB',
    cursor: 'grab',
    background: '#F9FAFB',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <img
        src={url}
        alt=""
        style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
      />
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: 4,
          right: 4,
          width: 20,
          height: 20,
          borderRadius: 4,
          background: 'rgba(0,0,0,0.65)',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          fontSize: 11,
          lineHeight: '20px',
          padding: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}
