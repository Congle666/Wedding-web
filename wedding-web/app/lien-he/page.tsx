'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSending(false);
    setSubmitted(true);
  };

  const contactInfo = [
    { label: 'Địa chỉ', value: '268 Lý Thường Kiệt, Phường 14, Quận 10, TP. Hồ Chí Minh' },
    { label: 'Email', value: 'hello@juntech.vn' },
    { label: 'Hotline', value: '1900 xxxx' },
    { label: 'Giờ làm việc', value: 'Thứ 2 — Thứ 7, 8:00 — 17:30' },
  ];

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    fontSize: '15px',
    fontFamily: 'var(--font-body)',
    border: '1px solid #EDE8E1',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    backgroundColor: '#FFFFFF',
    color: '#1F2937',
    resize: 'vertical',
  };

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
              Liên hệ với JunTech
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '16px',
                color: '#6B7280',
                maxWidth: '500px',
                margin: '0 auto',
              }}
            >
              Chúng tôi luôn sẵn sàng hỗ trợ bạn
            </p>
          </motion.div>
        </div>

        {/* Content */}
        <div
          style={{
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '48px 24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '32px',
            alignItems: 'flex-start',
          }}
        >
          {/* Left: Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card style={{ padding: '32px' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '22px',
                  fontWeight: 600,
                  color: '#1F2937',
                  marginBottom: '28px',
                }}
              >
                Thông tin liên hệ
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {contactInfo.map((item) => (
                  <div key={item.label}>
                    <p
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#8B1A1A',
                        marginBottom: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {item.label}
                    </p>
                    <p
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '15px',
                        color: '#374151',
                        lineHeight: '1.6',
                      }}
                    >
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Right: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card style={{ padding: '32px' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '22px',
                  fontWeight: 600,
                  color: '#1F2937',
                  marginBottom: '28px',
                }}
              >
                Gửi tin nhắn
              </h2>

              {submitted ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '15px',
                      color: '#16A34A',
                      lineHeight: '1.7',
                    }}
                  >
                    Chúng tôi đã nhận tin nhắn của bạn, sẽ phản hồi trong 24 giờ.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', email: '', subject: '', message: '' });
                    }}
                    style={{
                      marginTop: '16px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#8B1A1A',
                    }}
                  >
                    Gửi tin nhắn khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <Input
                    label="Họ tên"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nguyễn Văn A"
                    required
                  />
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    required
                  />
                  <Input
                    label="Chủ đề"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Hỗ trợ thiệp cưới"
                    required
                  />
                  <div style={{ marginBottom: '16px' }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#374151',
                        marginBottom: '6px',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      Nội dung
                    </label>
                    <textarea
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Nội dung tin nhắn của bạn..."
                      required
                      style={textareaStyle}
                      onFocus={(e) => (e.target.style.borderColor = '#8B1A1A')}
                      onBlur={(e) => (e.target.style.borderColor = '#EDE8E1')}
                    />
                  </div>
                  <Button type="submit" variant="primary" fullWidth loading={sending}>
                    Gửi tin nhắn
                  </Button>
                </form>
              )}
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
