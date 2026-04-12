/**
 * Renders a single ElementInstance at its position within a block container.
 * Used inside block renderers in both the Puck editor canvas and (via shared
 * code) the public DynamicThemeRenderer.
 *
 * Position values are percentages of the parent block container:
 *   x, y    = left, top offset
 *   width   = element width (0 = auto-size)
 *   height  = element height (0 = auto-size)
 */

import type { ElementInstance } from '../../../types/builderConfig';

interface Props {
  element: ElementInstance;
  /** Resolve relative URLs (e.g. /themes/...) to absolute for admin preview */
  resolveUrl?: (url: string) => string;
  /** Called when element is clicked in editor mode */
  onSelect?: (elementId: string) => void;
  /** Highlight when selected in editor */
  isSelected?: boolean;
  /** Enable editing affordances (outline, click) */
  isEditing?: boolean;
}

export default function DynamicElement({
  element,
  resolveUrl,
  onSelect,
  isSelected = false,
  isEditing = false,
}: Props) {
  const { position, style, type, content } = element;

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${position.x}%`,
    top: `${position.y}%`,
    width: position.width > 0 ? `${position.width}%` : 'auto',
    height: position.height > 0 ? `${position.height}%` : 'auto',
    opacity: style.opacity,
    zIndex: style.zIndex,
    transform: [
      style.rotation ? `rotate(${style.rotation}deg)` : '',
      style.flipX ? 'scaleX(-1)' : '',
    ]
      .filter(Boolean)
      .join(' ') || undefined,
    pointerEvents: isEditing ? 'auto' : 'none',
    cursor: isEditing ? 'pointer' : 'default',
    outline: isSelected
      ? '2px solid #8B1A1A'
      : isEditing
      ? '1px dashed transparent'
      : 'none',
    outlineOffset: 2,
    transition: 'outline-color 0.15s',
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isEditing || !onSelect) return;
    e.stopPropagation();
    onSelect(element.id);
  };

  const resolvedContent = resolveUrl && content ? resolveUrl(content) : content;

  return (
    <div
      style={containerStyle}
      onClick={handleClick}
      className={isEditing ? 'builder-element' : undefined}
      data-element-id={element.id}
      data-element-type={type}
      title={isEditing ? `${type}: ${element.category || element.id}` : undefined}
    >
      {type === 'image' && resolvedContent && (
        <img
          src={resolvedContent}
          alt=""
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />
      )}
      {type === 'text' && (
        <span
          style={{
            color: style.color || '#2C1810',
            fontSize: style.fontSize || 16,
            fontFamily: style.fontFamily || "'Cormorant Garamond', serif",
            fontWeight: style.fontWeight || 400,
            fontStyle: style.fontStyle || 'normal',
            whiteSpace: 'nowrap',
            userSelect: isEditing ? 'text' : 'none',
          }}
        >
          {content}
        </span>
      )}
      {type === 'shape' && (
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: style.color || '#5F191D',
            borderRadius: 2,
          }}
        />
      )}
      {type === 'divider' && (
        <div
          style={{
            width: '100%',
            height: 1,
            backgroundColor: style.color || '#5F191D',
            opacity: 0.3,
          }}
        />
      )}
    </div>
  );
}
