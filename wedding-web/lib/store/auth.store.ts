import { create } from 'zustand';

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role?: string;
  avatar_url?: string;
  provider?: string;
  is_verified?: boolean;
}

interface AuthState {
  token: string | null;
  user: User | null;
  hydrated: boolean;
  hydrate: () => void;
  setAuth: (token: string, user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

// Always start with null to avoid hydration mismatch.
// Call hydrate() once on client mount to load from localStorage.
export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  hydrated: false,

  hydrate: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    let user: User | null = null;
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try { user = JSON.parse(storedUser); } catch { user = null; }
    }
    set({ token, user, hydrated: true });
  },

  setAuth: (token, user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    set({ token, user });
  },

  setUser: (user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
    set({ user });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    set({ token: null, user: null });
  },
}));
