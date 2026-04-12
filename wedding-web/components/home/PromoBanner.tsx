'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useIntersection } from '@/lib/hooks/useIntersection';
import Button from '@/components/ui/Button';

export default function PromoBanner() {
  const [ref, isInView] = useIntersection<HTMLDivElement>({ threshold: 0.3 });

  return (
    <section className="promo" ref={ref as any}>
      <motion.div
        className="promo__inner"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="promo__heading">
          Bắt đầu tạo thiệp cưới của bạn
        </h2>
        <p className="promo__sub">
          Miễn phí thử nghiệm. Không cần thẻ tín dụng.
        </p>
        <Link href="/mau-thiep" style={{ textDecoration: 'none' }}>
          <Button variant="primary" size="lg">
            Tạo thiệp ngay
          </Button>
        </Link>
      </motion.div>

    </section>
  );
}
