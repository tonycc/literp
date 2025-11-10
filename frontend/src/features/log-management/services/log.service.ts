/**
 * 日志管理服务
 */

import apiClient from '../../../shared/services/api';
import type { ApiResponse, PaginatedResponse, QueryParams } from '@zyerp/shared';

export interface SystemLog {
  id: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  module?: string;
  action?: string;
  details?: Record<string, unknown>;
  userId?: string;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'VIEW';
  resource: string;
  resourceId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  userId?: string;
  ip?: string;
  userAgent?: string;
  success?: boolean;
  errorMsg?: string;
  createdAt: string;
}

export interface LogStats {
  totalSystemLogs: number;
  totalAuditLogs: number;
  todaySystemLogs: number;
  todayAuditLogs: number;
  errorLogsToday: number;
  levelDistribution: {
    info: number;
    warn: number;
    error: number;
    debug: number;
  };
  actionDistribution: {
    [key: string]: number;
  };
}

export interface LogQueryParams extends QueryParams {
  level?: string;
  action?: string;
  resource?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

class LogService {
  /**
   * 获取系统日志列表
   */
  async getSystemLogs(params?: LogQueryParams): Promise<PaginatedResponse<SystemLog>> {
    const response = await apiClient.get<ApiResponse<{
      data: SystemLog[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>>('/logs/system', {
      params,
    });
    
    // 转换后端数据结构为前端期望的格式
    const backendData = response.data.data!;
    return {
      success: response.data.success,
      data: backendData.data,
      message: response.data.message,
      timestamp: response.data.timestamp,
      pagination: {
        page: backendData.page,
        pageSize: backendData.pageSize,
        total: backendData.total,
      },
    };
  }

  /**
   * 获取审计日志列表
   */
  async getAuditLogs(params?: LogQueryParams): Promise<PaginatedResponse<AuditLog>> {
    const response = await apiClient.get<ApiResponse<{
      data: AuditLog[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>>('/logs/audit', {
      params,
    });
    
    // 转换后端数据结构为前端期望的格式
    const backendData = response.data.data!;
    return {
      success: response.data.success,
      data: backendData.data,
      message: response.data.message,
      timestamp: response.data.timestamp,
      pagination: {
        page: backendData.page,
        pageSize: backendData.pageSize,
        total: backendData.total,
      },
    };
  }

  /**
   * 获取日志统计信息
   */
  async getLogStats(): Promise<LogStats> {
    const response = await apiClient.get<ApiResponse<LogStats>>('/logs/stats');
    return response.data.data!;
  }

  /**
   * 清理过期日志
   */
  async cleanupLogs(days: number = 30): Promise<void> {
    await apiClient.post('/logs/cleanup', { days });
  }

  /**
   * 导出系统日志
   */
  async exportSystemLogs(params?: LogQueryParams): Promise<Blob> {
    const response = await apiClient.get('/logs/system/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * 导出审计日志
   */
  async exportAuditLogs(params?: LogQueryParams): Promise<Blob> {
    const response = await apiClient.get('/logs/audit/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * 格式化日志级别
   */
  formatLogLevel(level: string): { text: string; color: string } {
    const levelMap = {
      info: { text: '信息', color: 'blue' },
      warn: { text: '警告', color: 'orange' },
      error: { text: '错误', color: 'red' },
      debug: { text: '调试', color: 'gray' },
    };
    return levelMap[level as keyof typeof levelMap] || { text: level, color: 'default' };
  }

  /**
   * 格式化审计动作
   */
  formatAuditAction(action: string): { text: string; color: string } {
    const actionMap = {
      CREATE: { text: '创建', color: 'green' },
      UPDATE: { text: '更新', color: 'blue' },
      DELETE: { text: '删除', color: 'red' },
      LOGIN: { text: '登录', color: 'cyan' },
      LOGOUT: { text: '登出', color: 'gray' },
      VIEW: { text: '查看', color: 'default' },
    };
    return actionMap[action as keyof typeof actionMap] || { text: action, color: 'default' };
  }

  /**
   * 格式化资源名称
   */
  formatResourceName(resource: string): string {
    const resourceMap: { [key: string]: string } = {
      user: '用户',
      role: '角色',
      permission: '权限',
      settings: '设置',
      auth: '认证',
      upload: '文件上传',
      log: '日志',
    };
    return resourceMap[resource] || resource;
  }

  /**
   * 下载导出文件
   */
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export const logService = new LogService();