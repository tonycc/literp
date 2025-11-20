/**
 * API 服务配置
 */

import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
// 注意：避免在非 React 上下文中使用 antd 的 message 静态方法

// API 基础配置
// 统一默认端口为后端配置的 3000，避免本地未设置环境变量时导致网络错误
const RAW_API_BASE_URL = (import.meta as unknown as { env?: Record<string, unknown> }).env?.VITE_API_BASE_URL;
const API_BASE_URL: string = typeof RAW_API_BASE_URL === 'string' && RAW_API_BASE_URL.length > 0
  ? RAW_API_BASE_URL
  : 'http://localhost:3000/api/v1';

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 添加认证 token
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error instanceof Error ? error : new Error('Request failed'));
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const { response, config } = error;
    
    const url = typeof config?.url === 'string' ? config.url : undefined;
    if (response) {
      switch (response.status) {
        case 401:
          // 如果是登录请求失败，不要强制跳转，让登录页面处理错误
          if (url && url.includes('/auth/login')) {
            // 登录失败，不清除 token，让登录组件处理
            break;
          }
          
          // 其他 401 错误，清除 token 并跳转到登录页
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          
          // 避免在登录页面时重复跳转
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          break;
        case 429: {
          const hasConfig = !!config;
          if (!hasConfig) break;
          let retryCount = 0;
          const cfg = config as InternalAxiosRequestConfig & { __retryCount?: number };
          retryCount = cfg.__retryCount ?? 0;
          if (retryCount < 3) {
            const next: InternalAxiosRequestConfig & { __retryCount?: number } = { ...(cfg as InternalAxiosRequestConfig) };
            next.__retryCount = retryCount + 1;
            const base = 1000 * (2 ** retryCount);
            const jitter = Math.floor(Math.random() * 250);
            const delay = Math.min(base + jitter, 4000);
            await new Promise((r) => setTimeout(r, delay));
            return apiClient(next);
          }
          break;
        }
        case 403:
          // 不在拦截器中处理，让调用方处理
          break;
        case 404:
          // 对通知统计接口的预期 404 进行静默处理（前端有回退逻辑）
          if (url && url.includes('/notifications/stats')) {
            // do nothing; service will fallback to /notifications/unread-count
            break;
          }
          // 不在拦截器中处理，让调用方处理
          break;
        case 500:
          // 不在拦截器中处理，让调用方处理
          break;
        default:
          // 不在拦截器中处理，让调用方处理
          break;
      }
    }
    // 不在拦截器中处理错误，让调用方处理
    return Promise.reject(error instanceof Error ? error : new Error('Request failed'));
  }
);

export default apiClient;