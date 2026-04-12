'use client';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/lib/store/auth.store';

export function useAuth() {
  const router = useRouter();
  const { setAuth, logout: storeLogout, token, user } = useAuthStore();

  const login = async (data: { email: string; password: string }) => {
    try {
      const response = await authApi.login(data);
      const { token, user } = response.data;
      setAuth(token, user);
      toast.success('Đăng nhập thành công!');
      router.push('/dashboard');
    } catch {
      // Lỗi đã được xử lý bởi axios interceptor
    }
  };

  const register = async (data: { full_name: string; email: string; phone?: string; password: string }) => {
    try {
      await authApi.register(data);
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      router.push('/dang-nhap');
    } catch {
      // Lỗi đã được xử lý bởi axios interceptor
    }
  };

  const logout = () => {
    storeLogout();
    toast.success('Đã đăng xuất.');
    router.push('/dang-nhap');
  };

  return {
    token,
    user,
    isAuthenticated: !!token,
    login,
    register,
    logout,
  };
}
