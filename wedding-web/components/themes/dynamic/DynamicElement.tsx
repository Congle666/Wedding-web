'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import type { ElementInstance } from '@/types/builderConfig';

interface Props {
  element: ElementInstance;
}

/**
 * Renders a single element at its configured position with framer-motion
 * animations. Public-side renderer — uses next/image for optimization +
 * motion.div for scroll-triggered animations.
 */
export default function DynamicElement({ element }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const { position, style, animation, type, content } = element;

  const motionVariant = getMotionVariant(animation.type);
  const shouldAnimate = animation.type !== 'none';
  const isScrollTriggered = animation.triggerOn === 'scroll';

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${position.x}%`,
    top: `${position.y}%`,
    width: position.width > 0 ? `${position.width}%` : 'auto',
    height: position.height > 0 ? `${position.height}%` : 'auto',
    opacity: shouldAnimate ? undefined : style.opacity,
    zIndex: style.zIndex,
    transform: [
      style.rotation ? `rotate(${style.rotation}deg)` : '',
      style.flipX ? 'scaleX(-1)' : '',
    ]
      .filter(Boolean)
      .join(' ') || undefined,
    pointerEvents: 'none',
  };

  const inner = (
    <>
      {type === 'image' && content && (
        <Image
          src={content}
          alt=""
          width={500}
          height={500}
          style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
          unoptimized={content.startsWith('/uploads/')}
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
          }}
        >
          {content}
        </span>
      )}
      {type === 'shape' && (
        <div style={{ width: '100%', height: '100%', backgroundColor: style.color || '#5F191D' }} />
      )}
      {type === 'divider' && (
        <div style={{ width: '100%', height: 1, backgroundColor: style.color || '#5F191D', opacity: 0.3 }} />
      )}
    </>
  );

  if (!shouldAnimate) {
    return (
      <div ref={ref} style={{ ...containerStyle, opacity: style.opacity }}>
        {inner}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      style={containerStyle}
      initial={motionVariant.initial}
      animate={
        isScrollTriggered
          ? isInView
            ? { ...motionVariant.animate, opacity: style.opacity }
            : motionVariant.initial
          : { ...motionVariant.animate, opacity: style.opacity }
      }
      transition={{
        duration: animation.duration / 1000,
        delay: animation.delay / 1000,
        ease: 'easeOut',
      }}
    >
      {inner}
    </motion.div>
  );
}

function getMotionVariant(type: string) {
  switch (type) {
    case 'fadeIn':
      return { initial: { opacity: 0 }, animate: { opacity: 1 } };
    case 'fadeInUp':
      return { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 } };
    case 'slideInLeft':
      return { initial: { opacity: 0, x: -60 }, animate: { opacity: 1, x: 0 } };
    case 'slideInRight':
      return { initial: { opacity: 0, x: 60 }, animate: { opacity: 1, x: 0 } };
    case 'scaleIn':
      return { initial: { opacity: 0, scale: 0.7 }, animate: { opacity: 1, scale: 1 } };
    case 'parallax':
      return { initial: { opacity: 0 }, animate: { opacity: 1 } };
    default:
      return { initial: { opacity: 1 }, animate: { opacity: 1 } };
  }
}
