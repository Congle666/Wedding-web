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

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Vui lòng nhập email')
    .email('Địa chỉ email không hợp lệ'),
  password: z
    .string()
    .min(1, 'Vui lòng nhập mật khẩu')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type LoginForm = z.infer<typeof loginSchema>;

const cssText = `
  .login-container {
    display: flex;
    min-height: 100vh;
  }
  .login-left {
    display: none;
    width: 45%;
    background-color: #8B1A1A;
    color: #FFFFFF;
    padding: 48px;
    flex-direction: column;
    justify-content: space-between;
  }
  .login-right {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 24px;
    background-color: #FAFAF8;
  }
  .login-form-wrapper {
    width: 100%;
    max-width: 420px;
  }
  .login-logo {
    font-family: var(--font-display);
    font-size: 32px;
    font-weight: 700;
    color: #FFFFFF;
    margin-bottom: 24px;
  }
  .login-tagline {
    font-family: var(--font-body);
    font-size: 18px;
    line-height: 1.6;
    opacity: 0.9;
    margin-bottom: 40px;
  }
  .login-bullet {
    font-family: var(--font-body);
    font-size: 15px;
    line-height: 2;
    opacity: 0.85;
  }
  .login-copyright {
    font-family: var(--font-body);
    font-size: 13px;
    opacity: 0.6;
  }
  .login-title {
    font-family: var(--font-display);
    font-size: 24px;
    font-weight: 600;
    color: #1F2937;
    margin-bottom: 8px;
  }
  .login-subtitle {
    font-family: var(--font-body);
    font-size: 15px;
    color: #6B7280;
    margin-bottom: 32px;
  }
  .login-link-row {
    text-align: center;
    margin-top: 24px;
    font-family: var(--font-body);
    font-size: 14px;
    color: #6B7280;
  }
  .login-link-row a {
    color: #8B1A1A;
    font-weight: 600;
    text-decoration: none;
  }
  .login-link-row a:hover {
    text-decoration: underline;
  }
  @media (min-width: 768px) {
    .login-left {
      display: flex;
    }
    .login-right {
      width: 55%;
    }
  }
`;

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
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
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      await login(data);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssText }} />
      <div className="login-container">
        <div className="login-left">
          <div>
            <div className="login-logo">JunTech</div>
            <div className="login-tagline">
              Nền tảng thiệp cưới online hàng đầu Việt Nam
            </div>
            <div className="login-bullet">
              {'\u2014'} Hàng trăm mẫu thiệp đẹp, chuyên nghiệp<br />
              {'\u2014'} Tùy chỉnh dễ dàng, xuất bản chỉ trong vài phút<br />
              {'\u2014'} Hỗ trợ tên miền riêng cho ngày trọng đại của bạn
            </div>
          </div>
          <div className="login-copyright">
            &copy; 2026 JunTech. Tất cả quyền được bảo lưu.
          </div>
        </div>
        <div className="login-right">
          <div className="login-form-wrapper">
            <h1 className="login-title">Chào mừng trở lại</h1>
            <p className="login-subtitle">Nhập thông tin để đăng nhập</p>
            <form onSubmit={handleSubmit(onSubmit)}>
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
                name="password"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Mật khẩu"
                    type="password"
                    placeholder="Nhập mật khẩu"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    error={errors.password?.message}
                  />
                )}
              />
              <Button
                type="submit"
                fullWidth
                loading={loading}
                style={{ marginTop: '8px' }}
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>
            </form>
            <div className="login-link-row">
              Chưa có tài khoản?{' '}
              <Link href="/dang-ky">Đăng ký miễn phí</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
