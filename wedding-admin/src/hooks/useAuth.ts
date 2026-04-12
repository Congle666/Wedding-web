import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { authApi } from '../api/auth.api';
import toast from 'react-hot-toast';
import type { LoginRequest } from '../types';

export function useAuth() {
  const navigate = useNavigate();
  const { setAuth, logout: storeLogout, user, token } = useAuthStore();

  const login = async (data: LoginRequest) => {
    const res = await authApi.login(data);
    if (res.success) {
      if (res.data.user.role !== 'admin') {
        toast.error('Bạn không có quyền truy cập trang quản trị', { className: 'toast-error' });
        return false;
      }
      setAuth(res.data.token, res.data.user);
      toast.success('Đăng nhập thành công', { className: 'toast-success' });
      navigate('/dashboard');
      return true;
    }
    return false;
  };

  const logout = () => {
    storeLogout();
    navigate('/login');
  };

  return { login, logout, user, token, isAuthenticated: !!token };
}
