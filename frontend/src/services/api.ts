import axios, { AxiosInstance, AxiosError } from 'axios';
import { message } from 'antd';

const API_BASE_URL = '/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (window.location.pathname !== '/login') {
            message.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
            window.location.href = '/login';
          }
          break;
        case 403:
          message.error('Bạn không có quyền thực hiện thao tác này.');
          break;
        case 404:
          message.error('Không tìm thấy tài nguyên.');
          break;
        case 500:
          message.error('Lỗi server. Vui lòng thử lại sau.');
          break;
        default:
          if (data && typeof data === 'object' && 'message' in data) {
            message.error((data as any).message);
          }
      }
    } else if (error.request) {
      message.error('Không thể kết nối server. Vui lòng kiểm tra kết nối mạng.');
    }
    
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: { email: string; password: string; fullName: string; phone?: string }) => 
    api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) => 
    api.put('/auth/change-password', data),
  getAllUsers: (params?: { page?: number; limit?: number; role?: string; search?: string }) => 
    api.get('/auth/users', { params }),
  createAdmin: (data: any) => api.post('/auth/admin', data),
  updateUser: (id: string, data: any) => api.put(`/auth/users/${id}`, data),
};

// Schools API
export const schoolAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string; isActive?: boolean }) => 
    api.get('/schools', { params }),
  getById: (id: string) => api.get(`/schools/${id}`),
  getActiveRounds: () => api.get('/schools/active-rounds'),
  create: (data: any) => api.post('/schools', data),
  update: (id: string, data: any) => api.put(`/schools/${id}`, data),
  delete: (id: string) => api.delete(`/schools/${id}`),
};

// Majors API
export const majorAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string; schoolId?: string; group?: string }) => 
    api.get('/majors', { params }),
  getById: (id: string) => api.get(`/majors/${id}`),
  getBySchool: (schoolId: string) => api.get(`/majors/school/${schoolId}`),
  getGroups: () => api.get('/majors/groups'),
  create: (data: any) => api.post('/majors', data),
  update: (id: string, data: any) => api.put(`/majors/${id}`, data),
  delete: (id: string) => api.delete(`/majors/${id}`),
};

// Combinations API
export const combinationAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string; majorId?: string; schoolId?: string }) => 
    api.get('/combinations', { params }),
  getById: (id: string) => api.get(`/combinations/${id}`),
  getByMajor: (majorId: string) => api.get(`/combinations/major/${majorId}`),
  create: (data: any) => api.post('/combinations', data),
  update: (id: string, data: any) => api.put(`/combinations/${id}`, data),
  delete: (id: string) => api.delete(`/combinations/${id}`),
};

// Applications API
export const applicationAPI = {
  getMy: (params?: { status?: string }) => api.get('/applications/my', { params }),
  getAll: (params?: { page?: number; limit?: number; status?: string; schoolId?: string; majorId?: string; search?: string }) => 
    api.get('/applications', { params }),
  getById: (id: string) => api.get(`/applications/${id}`),
  create: (data: any) => api.post('/applications', data),
  update: (id: string, data: any) => api.put(`/applications/${id}`, data),
  submit: (id: string) => api.post(`/applications/${id}/submit`),
  delete: (id: string) => api.delete(`/applications/${id}`),
  updateStatus: (id: string, data: { status: string; notes?: string }) => 
    api.put(`/applications/${id}/status`, data),
  getStatistics: (params?: { schoolId?: string; startDate?: string; endDate?: string }) => 
    api.get('/applications/statistics', { params }),
};

// Document API
export const documentAPI = {
  upload: (applicationId: string, documentType: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('applicationId', applicationId);
    formData.append('documentType', documentType);
    return api.post('/applications/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (applicationId: string, documentType: string) => 
    api.delete('/applications/documents', { data: { applicationId, documentType } }),
  verify: (applicationId: string, documentType: string, verified: boolean, notes?: string) => 
    api.put('/applications/documents/verify', { applicationId, documentType, verified, notes }),
};

// Notifications API
export const notificationAPI = {
  getAll: (params?: { page?: number; limit?: number; isRead?: boolean }) => 
    api.get('/notifications', { params }),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
};
