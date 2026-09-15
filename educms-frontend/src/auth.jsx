import { createContext, useContext, useState, useEffect } from 'react';
import api from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('educms_token');
    if (!token) { setLoading(false); return; }
    api.get('/auth/me').then((r) => setUser(r.data.data.user)).catch(() => localStorage.removeItem('educms_token')).finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const r = await api.post('/auth/login', { email, password });
    localStorage.setItem('educms_token', r.data.data.accessToken);
    localStorage.setItem('educms_refresh', r.data.data.refreshToken);
    setUser(r.data.data.user);
    return r.data.data.user;
  };

  const register = async (payload) => {
    const r = await api.post('/auth/register', payload);
    localStorage.setItem('educms_token', r.data.data.accessToken);
    setUser(r.data.data.user);
    return r.data.data.user;
  };

  const logout = () => {
    localStorage.removeItem('educms_token');
    localStorage.removeItem('educms_refresh');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
