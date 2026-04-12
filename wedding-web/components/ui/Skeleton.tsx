import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
}

export default function Skeleton({
  width = '100%',
  height = '20px',
  rounded = false,
}: SkeletonProps) {
  const style: React.CSSProperties = {
    width,
    height,
    borderRadius: rounded ? '50%' : '8px',
    backgroundColor: '#E5E7EB',
    animation: 'skeleton-pulse 1.5s ease-in-out infinite',
  };

  return (
    <>
      <div style={style} />
    </>
  );
}
