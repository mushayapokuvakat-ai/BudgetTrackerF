import { create } from 'zustand';

interface AuthState {
  user: { id: string; fullname: string; email: string; role: string; token: string } | null;
  login: (userData: any) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  login: (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    set({ user: userData });
  },
  logout: () => {
    localStorage.removeItem('user');
    set({ user: null });
  },
}));

export default useAuthStore;
