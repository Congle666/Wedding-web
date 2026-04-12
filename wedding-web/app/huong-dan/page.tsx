'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';

type GuideTab = 'start' | 'edit' | 'payment' | 'share';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: Record<GuideTab, FAQItem[]> = {
  start: [
    {
      question: 'Làm thế nào để tạo thiệp cưới trên JunTech?',
      answer:
        'Bạn chỉ cần đăng ký tài khoản, chọn mẫu thiệp yêu thích từ bộ sưu tập, sau đó tiến hành đặt thuê. Sau khi thanh toán thành công, bạn có thể bắt đầu chỉnh sửa nội dung thiệp ngay tại trang quản lý.',
    },
    {
      question: 'Tôi cần chuẩn bị những thông tin gì trước khi tạo thiệp?',
      answer:
        'Bạn nên chuẩn bị sẵn: tên cô dâu và chú rể, tên bố mẹ hai bên, ngày giờ và địa điểm tổ chức lễ cưới và tiệc cưới, số tài khoản ngân hàng nhận mừng (nếu muốn), và ảnh cưới chất lượng cao.',
    },
    {
      question: 'JunTech có hỗ trợ thiệp cưới song ngữ không?',
      answer:
        'Hiện tại JunTech hỗ trợ thiệp cưới bằng tiếng Việt. Chúng tôi đang phát triển tính năng song ngữ Việt - Anh và sẽ ra mắt trong thời gian tới.',
    },
    {
      question: 'Tôi có thể xem trước thiệp trước khi thanh toán không?',
      answer:
        'Có, bạn có thể xem trước bản demo của từng mẫu thiệp trên trang Mẫu thiệp. Sau khi đặt thuê và thanh toán, bạn sẽ chỉnh sửa nội dung thực tế và xem trước thiệp hoàn chỉnh trước khi publish.',
    },
  ],
  edit: [
    {
      question: 'Làm cách nào để chỉnh sửa nội dung thiệp?',
      answer:
        'Sau khi thanh toán, truy cập trang Quản lý, chọn đơn hàng tương ứng, rồi chuyển sang tab "Chỉnh sửa thiệp". Tại đây bạn có thể cập nhật toàn bộ thông tin cô dâu chú rể, địa điểm, ngày giờ, tài khoản nhận mừng và các cài đặt khác.',
    },
    {
      question: 'Tôi có thể thay đổi mẫu thiệp sau khi đã chọn không?',
      answer:
        'Hiện tại, sau khi đặt thuê bạn không thể đổi mẫu thiệp. Vui lòng cân nhắc kỹ trước khi chọn mẫu. Nếu cần hỗ trợ, hãy liên hệ đội ngũ JunTech qua trang Liên hệ.',
    },
    {
      question: 'Thiệp có hỗ trợ nhúng Google Maps không?',
      answer:
        'Có. Trong phần chỉnh sửa thiệp, bạn có thể dán link Google Maps Embed URL vào ô "Google Maps Embed URL". Bản đồ sẽ hiển thị trực tiếp trên thiệp để khách mời dễ dàng tìm đường.',
    },
    {
      question: 'Tôi có thể chỉnh sửa thiệp bao nhiêu lần?',
      answer:
        'Bạn có thể chỉnh sửa thiệp không giới hạn số lần trong suốt thời gian thuê. Mỗi lần lưu thay đổi, nội dung sẽ được cập nhật ngay lập tức trên thiệp đã publish.',
    },
  ],
  payment: [
    {
      question: 'JunTech hỗ trợ những hình thức thanh toán nào?',
      answer:
        'JunTech hỗ trợ thanh toán qua chuyển khoản ngân hàng (quét mã QR), ví điện tử MoMo, ZaloPay, và thẻ tín dụng/ghi nợ quốc tế Visa/Mastercard.',
    },
    {
      question: 'Sau khi thanh toán, bao lâu thì thiệp được kích hoạt?',
      answer:
        'Với chuyển khoản ngân hàng, hệ thống sẽ tự động xác nhận trong vòng 1-5 phút. Với ví điện tử và thẻ quốc tế, thiệp được kích hoạt ngay lập tức sau khi thanh toán thành công.',
    },
    {
      question: 'Tôi có thể huỷ đơn và được hoàn tiền không?',
      answer:
        'Bạn có thể huỷ đơn hàng khi trạng thái còn là "Chờ thanh toán". Nếu đã thanh toán và muốn hoàn tiền, vui lòng liên hệ bộ phận hỗ trợ qua email hello@juntech.vn trong vòng 24 giờ sau khi thanh toán.',
    },
    {
      question: 'Các gói thuê thiệp có thời hạn bao lâu?',
      answer:
        'JunTech cung cấp nhiều gói thuê với thời hạn từ 3 tháng, 6 tháng đến 12 tháng. Bạn có thể gia hạn thêm khi gói thuê sắp hết hạn. Chi tiết giá và thời hạn từng gói được hiển thị khi bạn chọn mẫu thiệp.',
    },
  ],
  share: [
    {
      question: 'Làm thế nào để chia sẻ thiệp cưới cho khách mời?',
      answer:
        'Sau khi publish thiệp, bạn sẽ nhận được một đường link duy nhất (ví dụ: juntech.vn/ten-cua-ban). Bạn có thể sao chép link này và gửi qua Zalo, Messenger, SMS hoặc bất kỳ kênh nào bạn muốn.',
    },
    {
      question: 'Tính năng RSVP hoạt động như thế nào?',
      answer:
        'Khi bật tính năng RSVP, khách mời có thể xác nhận tham dự trực tiếp trên thiệp. Bạn sẽ thấy danh sách khách xác nhận trong trang quản lý, giúp bạn dễ dàng nắm được số lượng khách tham dự.',
    },
    {
      question: 'Sổ lưu bút (Guest Book) là gì?',
      answer:
        'Sổ lưu bút cho phép khách mời gửi lời chúc trực tiếp trên thiệp cưới của bạn. Những lời chúc này sẽ hiển thị trên thiệp và bạn có thể lưu giữ làm kỷ niệm.',
    },
    {
      question: 'Khách mời có cần đăng ký tài khoản để xem thiệp không?',
      answer:
        'Không, khách mời không cần đăng ký tài khoản. Chỉ cần mở đường link thiệp là có thể xem toàn bộ nội dung, gửi lời chúc và xác nhận tham dự.',
    },
  ],
};

const tabLabels: Record<GuideTab, string> = {
  start: 'Bắt đầu',
  edit: 'Chỉnh sửa thiệp',
  payment: 'Thanh toán',
  share: 'Chia sẻ & RSVP',
};

export default function GuidePage() {
  const [activeTab, setActiveTab] = useState<GuideTab>('start');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    const items = faqData[activeTab];
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q)
    );
  }, [activeTab, searchQuery]);

  const toggleItem = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '10px 20px',
    fontFamily: 'var(--font-body)',
    fontSize: '14px',
    fontWeight: 600,
    color: active ? '#8B1A1A' : '#6B7280',
    backgroundColor: active ? '#FFF5F5' : 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap' as const,
  });

  return (
    <>
      <Header />
      <main style={{ minHeight: '100vh', backgroundColor: '#FAFAF8' }}>
        {/* Hero */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #EDE8E1',
            padding: '64px 24px 48px',
            textAlign: 'center',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '40px',
                fontWeight: 600,
                color: '#1F2937',
                marginBottom: '16px',
              }}
            >
              Hướng dẫn sử dụng
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '16px',
                color: '#6B7280',
                marginBottom: '32px',
                maxWidth: '500px',
                margin: '0 auto 32px',
              }}
            >
              Tìm câu trả lời cho mọi thắc mắc về thiệp cưới JunTech
            </p>
            <div style={{ maxWidth: '480px', margin: '0 auto' }}>
              <input
                type="text"
                placeholder="Tìm hướng dẫn..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setExpandedIndex(null);
                }}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  fontSize: '15px',
                  fontFamily: 'var(--font-body)',
                  border: '1px solid #EDE8E1',
                  borderRadius: '12px',
                  outline: 'none',
                  backgroundColor: '#FAFAF8',
                  color: '#1F2937',
                  transition: 'border-color 0.2s ease',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#8B1A1A')}
                onBlur={(e) => (e.target.style.borderColor = '#EDE8E1')}
              />
            </div>
          </motion.div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '32px',
              overflowX: 'auto',
              paddingBottom: '4px',
            }}
          >
            {(Object.keys(tabLabels) as GuideTab[]).map((key) => (
              <button
                key={key}
                style={tabStyle(activeTab === key)}
                onClick={() => {
                  setActiveTab(key);
                  setExpandedIndex(null);
                }}
              >
                {tabLabels[key]}
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredItems.length === 0 ? (
              <Card style={{ padding: '32px', textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: '#6B7280' }}>
                  Không tìm thấy kết quả phù hợp
                </p>
              </Card>
            ) : (
              filteredItems.map((item, index) => (
                <motion.div
                  key={`${activeTab}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card style={{ overflow: 'hidden' }}>
                    <button
                      onClick={() => toggleItem(index)}
                      style={{
                        width: '100%',
                        padding: '20px 24px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        gap: '16px',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '15px',
                          fontWeight: 600,
                          color: '#1F2937',
                          flex: 1,
                        }}
                      >
                        {item.question}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '18px',
                          color: '#8B1A1A',
                          fontWeight: 300,
                          flexShrink: 0,
                          transition: 'transform 0.3s ease',
                          transform: expandedIndex === index ? 'rotate(45deg)' : 'rotate(0deg)',
                        }}
                      >
                        +
                      </span>
                    </button>
                    <AnimatePresence>
                      {expandedIndex === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div
                            style={{
                              padding: '0 24px 20px',
                              fontFamily: 'var(--font-body)',
                              fontSize: '14px',
                              lineHeight: '1.7',
                              color: '#6B7280',
                            }}
                          >
                            {item.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
