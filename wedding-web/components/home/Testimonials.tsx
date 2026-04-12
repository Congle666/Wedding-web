'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useIntersection } from '@/lib/hooks/useIntersection';
import SectionTitle from '@/components/ui/SectionTitle';
import Card from '@/components/ui/Card';

interface MockReview {
  id: string;
  name: string;
  templateName: string;
  rating: number;
  comment: string;
  date: string;
}

const MOCK_REVIEWS: MockReview[] = [
  {
    id: '1',
    name: 'Nguyễn Minh Anh',
    templateName: 'Hạnh Phúc Vàng',
    rating: 5,
    comment:
      'Thiệp đẹp lắm, bạn bè ai cũng khen. Giao diện dễ sử dụng, chỉ mất vài phút là xong. Rất hài lòng với dịch vụ của JunTech.',
    date: '15 tháng 2, 2026',
  },
  {
    id: '2',
    name: 'Trần Đức Huy',
    templateName: 'Mùa Thu Lá Bay',
    rating: 5,
    comment:
      'Mình đã thử nhiều nền tảng nhưng JunTech là tốt nhất. Mẫu thiệp tinh tế, hỗ trợ nhanh, giá cả hợp lý. Chắc chắn sẽ giới thiệu cho bạn bè.',
    date: '28 tháng 1, 2026',
  },
  {
    id: '3',
    name: 'Phạm Thuỳ Linh',
    templateName: 'Tình Yêu Vĩnh Cửu',
    rating: 5,
    comment:
      'Thiệp cưới online tiện lợi hơn mình tưởng rất nhiều. Khách mời phản hồi tích cực, ai cũng thích trang thiệp. Cảm ơn JunTech rất nhiều.',
    date: '10 tháng 3, 2026',
  },
  {
    id: '4',
    name: 'Lê Hoàng Nam',
    templateName: 'Ngày Hạnh Phúc',
    rating: 5,
    comment:
      'Tiết kiệm được rất nhiều chi phí so với in thiệp truyền thống mà lại đẹp và chuyên nghiệp hơn. Tuỳ chỉnh linh hoạt, đáng đồng tiền.',
    date: '5 tháng 3, 2026',
  },
];

export default function Testimonials() {
  const [ref, isInView] = useIntersection<HTMLDivElement>({ threshold: 0.15 });

  return (
    <section className="testimonials" ref={ref as any}>
      <div className="testimonials__inner">
        <SectionTitle
          label="ĐÁNH GIÁ"
          title="Khách hàng nói gì về JunTech"
        />

        <div className="testimonials__grid">
          {MOCK_REVIEWS.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card style={{ padding: '28px', height: '100%' }}>
                <div className="testimonials__header">
                  <span className="testimonials__name">{review.name}</span>
                  <span className="testimonials__template">
                    đã thuê mẫu {review.templateName}
                  </span>
                </div>
                <span className="testimonials__rating">
                  {review.rating} / 5 sao
                </span>
                <p className="testimonials__comment">
                  {review.comment}
                </p>
                <span className="testimonials__date">{review.date}</span>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

    </section>
  );
}
