import axios from 'axios';
import type { CreateShareRequest, ViewShareRequest, Share } from '../types';

// In production (Docker), nginx proxies /api to backend
// In development, directly connect to backend server
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3501';

export const api = axios.create({
  baseURL: API_URL,
});

// 重新导出类型
export type { CreateShareRequest, ViewShareRequest, Share };

// 设置认证token
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('adminToken', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('adminToken');
  }
};

// 从localStorage恢复token
const savedToken = localStorage.getItem('adminToken');
if (savedToken) {
  setAuthToken(savedToken);
}

export const sharesApi = {
  create: async (data: CreateShareRequest) => {
    const response = await api.post('/api/shares', data);
    return response.data;
  },

  view: async (id: string, password?: string) => {
    const response = await api.post(`/api/shares/${id}/view`, { password });
    return response.data;
  },

  list: async () => {
    const response = await api.get<Share[]>('/api/shares');
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/api/shares/${id}`);
    return response.data;
  },

  cleanExpired: async () => {
    const response = await api.post('/api/shares/clean-expired');
    return response.data;
  },
};

export const adminApi = {
  login: async (password: string) => {
    const response = await api.post('/api/admin/login', { password });
    return response.data;
  },
};
