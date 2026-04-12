'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useIntersection } from '@/lib/hooks/useIntersection';
import SectionTitle from '@/components/ui/SectionTitle';

const STEPS = [
  {
    number: '01',
    title: 'Chọn mẫu thiệp',
    description:
      'Duyệt qua bộ sưu tập hơn 50 mẫu thiệp được thiết kế chuyên nghiệp. Lọc theo phong cách, màu sắc hoặc chủ đề yêu thích của bạn.',
  },
  {
    number: '02',
    title: 'Điền thông tin & thanh toán',
    description:
      'Nhập thông tin lễ cưới, hình ảnh cặp đôi và tuỳ chỉnh nội dung theo ý muốn. Thanh toán nhanh chóng, an toàn qua nhiều hình thức.',
  },
  {
    number: '03',
    title: 'Chia sẻ đến mọi người',
    description:
      'Nhận đường dẫn thiệp cưới riêng và gửi đến bạn bè, người thân qua tin nhắn, mạng xã hội hoặc email chỉ trong vài giây.',
  },
];

export default function HowItWorks() {
  const [ref, isInView] = useIntersection<HTMLDivElement>({ threshold: 0.2 });

  return (
    <section className="how" id="how-it-works" ref={ref as any}>
      <div className="how__inner">
        <SectionTitle
          label="CÁCH THỨC HOẠT ĐỘNG"
          title="Chỉ 3 bước đơn giản"
        />

        <div className="how__steps">
          {STEPS.map((step, index) => (
            <React.Fragment key={index}>
              {index > 0 && <div className="how__connector" />}
              <motion.div
                className="how__step"
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                <span className="how__step-number">{step.number}</span>
                <h3 className="how__step-title">{step.title}</h3>
                <p className="how__step-desc">{step.description}</p>
              </motion.div>
            </React.Fragment>
          ))}
        </div>
      </div>

    </section>
  );
}
