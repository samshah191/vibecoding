import axios from 'axios';
import { User, App, AppGenerationRequest, APIResponse, ConversationalGenerationRequest, ConversationalGenerationResponse } from '../types';
import demoAPI, { DEMO_MODE } from './demoAPI';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string): Promise<APIResponse<{ user: User; token: string }>> => {
    if (DEMO_MODE) {
      return demoAPI.authAPI.login(email, password);
    }
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (email: string, password: string, name?: string): Promise<APIResponse<{ user: User; token: string }>> => {
    if (DEMO_MODE) {
      return demoAPI.authAPI.register(email, password, name);
    }
    const response = await api.post('/auth/register', { email, password, name });
    return response.data;
  },

  getProfile: async (): Promise<APIResponse<{ user: User }>> => {
    if (DEMO_MODE) {
      return demoAPI.authAPI.getProfile();
    }
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Apps API
export const appsAPI = {
  getAll: async (): Promise<APIResponse<App[]>> => {
    if (DEMO_MODE) {
      return demoAPI.appsAPI.getAll();
    }
    const response = await api.get('/apps');
    return response.data;
  },

  getById: async (appId: string): Promise<APIResponse<App>> => {
    if (DEMO_MODE) {
      return demoAPI.appsAPI.getById(appId);
    }
    const response = await api.get(`/apps/${appId}`);
    return response.data;
  },

  update: async (appId: string, data: Partial<App>): Promise<APIResponse<App>> => {
    if (DEMO_MODE) {
      return demoAPI.appsAPI.update(appId, data);
    }
    const response = await api.put(`/apps/${appId}`, data);
    return response.data;
  },

  delete: async (appId: string): Promise<APIResponse> => {
    if (DEMO_MODE) {
      return demoAPI.appsAPI.delete(appId);
    }
    const response = await api.delete(`/apps/${appId}`);
    return response.data;
  },

  togglePublish: async (appId: string): Promise<APIResponse<App>> => {
    if (DEMO_MODE) {
      return demoAPI.appsAPI.togglePublish(appId);
    }
    const response = await api.post(`/apps/${appId}/publish`);
    return response.data;
  },
};

// AI API
export const aiAPI = {
  generateApp: async (request: AppGenerationRequest): Promise<APIResponse<App>> => {
    if (DEMO_MODE) {
      return demoAPI.aiAPI.generateApp(request);
    }
    const response = await api.post('/ai/generate', request);
    return response.data;
  },

  generateConversationalApp: async (request: ConversationalGenerationRequest): Promise<ConversationalGenerationResponse> => {
    if (DEMO_MODE) {
      return demoAPI.aiAPI.generateConversationalApp(request);
    }
    const response = await api.post('/ai/generate-conversational', request);
    return response.data;
  },

  getGenerationProgress: async (appId: string): Promise<APIResponse> => {
    if (DEMO_MODE) {
      return demoAPI.aiAPI.getGenerationProgress(appId);
    }
    const response = await api.get(`/ai/generate/${appId}/progress`);
    return response.data;
  },
};

export default api;
