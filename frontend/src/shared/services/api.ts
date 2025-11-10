/**
 * API 服务配置
 */

import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
// 注意：避免在非 React 上下文中使用 antd 的 message 静态方法

// API 基础配置
// 统一默认端口为后端配置的 3000，避免本地未设置环境变量时导致网络错误
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// 创建 axios 实例
const apiClient: AxiosInstance = axios.create({
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
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const { response, config } = error;
    
    if (response) {
      switch (response.status) {
        case 401:
          // 如果是登录请求失败，不要强制跳转，让登录页面处理错误
          if (config?.url?.includes('/auth/login')) {
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
        case 403:
          // 不在拦截器中处理，让调用方处理
          break;
        case 404:
          // 对通知统计接口的预期 404 进行静默处理（前端有回退逻辑）
          if (config?.url?.includes('/notifications/stats')) {
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
    return Promise.reject(error);
  }
);

export default apiClient;