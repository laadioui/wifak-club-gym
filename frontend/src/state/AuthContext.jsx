import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('wifak_user') || 'null'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const login = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login/', payload);
      localStorage.setItem('wifak_access', data.access);
      localStorage.setItem('wifak_refresh', data.refresh);
      localStorage.setItem('wifak_user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register-client/', payload);
    localStorage.setItem('wifak_access', data.access);
    localStorage.setItem('wifak_refresh', data.refresh);
    localStorage.setItem('wifak_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('wifak_access');
    localStorage.removeItem('wifak_refresh');
    localStorage.removeItem('wifak_user');
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
