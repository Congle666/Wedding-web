'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useIntersection } from '@/lib/hooks/useIntersection';

interface StatItem {
  target: string;
  numericPart: number;
  suffix: string;
  label: string;
}

const STATS: StatItem[] = [
  { target: '500+', numericPart: 500, suffix: '+', label: 'Mẫu thiệp đã thuê' },
  { target: '1.200+', numericPart: 1200, suffix: '+', label: 'Cặp đôi hài lòng' },
  { target: '50+', numericPart: 50, suffix: '+', label: 'Mẫu thiệp đẹp' },
  { target: '99%', numericPart: 99, suffix: '%', label: 'Khách hàng quay lại' },
];

function formatStatNumber(value: number, item: StatItem): string {
  if (item.numericPart >= 1000) {
    return new Intl.NumberFormat('vi-VN').format(value) + item.suffix;
  }
  return value.toString() + item.suffix;
}

function AnimatedNumber({ item, animate }: { item: StatItem; animate: boolean }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!animate) return;

    const duration = 1500;
    const steps = 40;
    const increment = item.numericPart / steps;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      if (step >= steps) {
        setCurrent(item.numericPart);
        clearInterval(timer);
      } else {
        setCurrent(Math.round(increment * step));
      }
    }, interval);

    return () => clearInterval(timer);
  }, [animate, item.numericPart]);

  return <>{formatStatNumber(current, item)}</>;
}

export default function Stats() {
  const [ref, isInView] = useIntersection<HTMLDivElement>({ threshold: 0.3 });

  return (
    <section className="stats" ref={ref as any}>
      <div className="stats__inner">
        {STATS.map((stat, index) => (
          <div className="stats__item" key={index}>
            <span className="stats__number">
              <AnimatedNumber item={stat} animate={isInView} />
            </span>
            <span className="stats__label">{stat.label}</span>
          </div>
        ))}
      </div>

    </section>
  );
}
