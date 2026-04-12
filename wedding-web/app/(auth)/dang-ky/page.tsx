'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/lib/hooks/useAuth';

const registerSchema = z
  .object({
    full_name: z.string().min(1, 'Vui lòng nhập họ và tên'),
    email: z
      .string()
      .min(1, 'Vui lòng nhập email')
      .email('Địa chỉ email không hợp lệ'),
    phone: z.string().optional(),
    password: z
      .string()
      .min(1, 'Vui lòng nhập mật khẩu')
      .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
    agreeTerms: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })
  .refine((data) => data.agreeTerms === true, {
    message: 'Bạn cần đồng ý với Điều khoản dịch vụ',
    path: ['agreeTerms'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

const cssText = `
  .register-container {
    display: flex;
    min-height: 100vh;
  }
  .register-left {
    display: none;
    width: 45%;
    background-color: #8B1A1A;
    color: #FFFFFF;
    padding: 48px;
    flex-direction: column;
    justify-content: space-between;
  }
  .register-right {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 24px;
    background-color: #FAFAF8;
  }
  .register-form-wrapper {
    width: 100%;
    max-width: 420px;
  }
  .register-logo {
    font-family: var(--font-display);
    font-size: 32px;
    font-weight: 700;
    color: #FFFFFF;
    margin-bottom: 24px;
  }
  .register-tagline {
    font-family: var(--font-body);
    font-size: 18px;
    line-height: 1.6;
    opacity: 0.9;
    margin-bottom: 40px;
  }
  .register-bullet {
    font-family: var(--font-body);
    font-size: 15px;
    line-height: 2;
    opacity: 0.85;
  }
  .register-copyright {
    font-family: var(--font-body);
    font-size: 13px;
    opacity: 0.6;
  }
  .register-title {
    font-family: var(--font-display);
    font-size: 24px;
    font-weight: 600;
    color: #1F2937;
    margin-bottom: 8px;
  }
  .register-subtitle {
    font-family: var(--font-body);
    font-size: 15px;
    color: #6B7280;
    margin-bottom: 32px;
  }
  .register-link-row {
    text-align: center;
    margin-top: 24px;
    font-family: var(--font-body);
    font-size: 14px;
    color: #6B7280;
  }
  .register-link-row a {
    color: #8B1A1A;
    font-weight: 600;
    text-decoration: none;
  }
  .register-link-row a:hover {
    text-decoration: underline;
  }
  .register-checkbox-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 16px;
  }
  .register-checkbox-row input[type="checkbox"] {
    margin-top: 3px;
    width: 16px;
    height: 16px;
    accent-color: #8B1A1A;
    cursor: pointer;
  }
  .register-checkbox-label {
    font-family: var(--font-body);
    font-size: 14px;
    color: #374151;
    cursor: pointer;
  }
  .register-checkbox-label a {
    color: #8B1A1A;
    font-weight: 600;
    text-decoration: none;
  }
  .register-checkbox-label a:hover {
    text-decoration: underline;
  }
  .register-checkbox-error {
    font-family: var(--font-body);
    font-size: 13px;
    color: #EF4444;
    margin-top: -8px;
    margin-bottom: 16px;
  }
  @media (min-width: 768px) {
    .register-left {
      display: flex;
    }
    .register-right {
      width: 55%;
    }
  }
`;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      await registerUser({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone || '',
        password: data.password,
      });
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssText }} />
      <div className="register-container">
        <div className="register-left">
          <div>
            <div className="register-logo">JunTech</div>
            <div className="register-tagline">
              Nền tảng thiệp cưới online hàng đầu Việt Nam
            </div>
            <div className="register-bullet">
              {'\u2014'} Hàng trăm mẫu thiệp đẹp, chuyên nghiệp<br />
              {'\u2014'} Tùy chỉnh dễ dàng, xuất bản chỉ trong vài phút<br />
              {'\u2014'} Hỗ trợ tên miền riêng cho ngày trọng đại của bạn
            </div>
          </div>
          <div className="register-copyright">
            &copy; 2026 JunTech. Tất cả quyền được bảo lưu.
          </div>
        </div>
        <div className="register-right">
          <div className="register-form-wrapper">
            <h1 className="register-title">Tạo tài khoản JunTech</h1>
            <p className="register-subtitle">
              Đăng ký để bắt đầu tạo thiệp cưới online
            </p>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Controller
                name="full_name"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Họ và tên"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    error={errors.full_name?.message}
                  />
                )}
              />
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Email"
                    type="email"
                    placeholder="email@example.com"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    error={errors.email?.message}
                  />
                )}
              />
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Số điện thoại (không bắt buộc)"
                    type="tel"
                    placeholder="0912 345 678"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    error={errors.phone?.message}
                  />
                )}
              />
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Mật khẩu"
                    type="password"
                    placeholder="Ít nhất 6 ký tự"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    error={errors.password?.message}
                  />
                )}
              />
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Xác nhận mật khẩu"
                    type="password"
                    placeholder="Nhập lại mật khẩu"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    error={errors.confirmPassword?.message}
                  />
                )}
              />
              <Controller
                name="agreeTerms"
                control={control}
                render={({ field }) => (
                  <div className="register-checkbox-row">
                    <input
                      type="checkbox"
                      id="agreeTerms"
                      checked={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                    <label htmlFor="agreeTerms" className="register-checkbox-label">
                      Tôi đồng ý với{' '}
                      <Link href="/dieu-khoan" target="_blank">
                        Điều khoản dịch vụ
                      </Link>
                    </label>
                  </div>
                )}
              />
              {errors.agreeTerms && (
                <p className="register-checkbox-error">
                  {errors.agreeTerms.message}
                </p>
              )}
              <Button
                type="submit"
                fullWidth
                loading={loading}
                style={{ marginTop: '8px' }}
              >
                {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
              </Button>
            </form>
            <div className="register-link-row">
              Đã có tài khoản?{' '}
              <Link href="/dang-nhap">Đăng nhập</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
