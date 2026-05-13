import { User } from '@/models';

export const authService = {
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  setToken: (token: string): void => {
    localStorage.setItem('token', token);
  },

  removeToken: (): void => {
    localStorage.removeItem('token');
  },

  getUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  setUser: (user: User): void => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  removeUser: (): void => {
    localStorage.removeItem('user');
  },

  isAuthenticated: (): boolean => {
    return !!authService.getToken();
  },

  isAdmin: (): boolean => {
    const user = authService.getUser();
    return user?.role === 'admin';
  },

  isCandidate: (): boolean => {
    const user = authService.getUser();
    return user?.role === 'candidate';
  },

  logout: (): void => {
    authService.removeToken();
    authService.removeUser();
    window.location.href = '/login';
  },

  login: (token: string, user: User): void => {
    authService.setToken(token);
    authService.setUser(user);
  },
};

export default authService;
