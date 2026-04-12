'use client';

import React, { useState } from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  style?: React.CSSProperties;
}

export default function Card({
  children,
  className,
  hover = false,
  style,
}: CardProps) {
  const [hovered, setHovered] = useState(false);

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    border: '1px solid #EDE8E1',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
    overflow: 'hidden',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    ...(hover && hovered
      ? {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
        }
      : {}),
    ...style,
  };

  return (
    <div
      className={className}
      style={cardStyle}
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
    >
      {children}
    </div>
  );
}
