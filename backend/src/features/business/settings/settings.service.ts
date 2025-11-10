/**
 * 系统设置服务
 */

import { SystemSettings } from '@prisma/client';
import { prisma } from '../../../config/database';
import { AppError } from '../../../shared/middleware/error';

export interface UpdateSettingsData {
  siteName?: string;
  siteDescription?: string;
  enableRegistration?: boolean;
  enableEmailNotification?: boolean;
  sessionTimeout?: number;
  maxLoginAttempts?: number;
}

class SettingsService {
  /**
   * 获取系统设置
   */
  async getSettings(): Promise<SystemSettings> {
    // 尝试获取现有设置
    let settings = await prisma.systemSettings.findFirst();
    
    // 如果没有设置记录，创建默认设置
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          siteName: 'Fennec 管理系统',
          siteDescription: '基于 React 19 的现代化管理系统',
          enableRegistration: false,
          enableEmailNotification: true,
          sessionTimeout: 30,
          maxLoginAttempts: 5,
        },
      });
    }
    
    return settings;
  }

  /**
   * 更新系统设置
   */
  async updateSettings(data: UpdateSettingsData): Promise<SystemSettings> {
    // 验证数据
    if (data.sessionTimeout && (data.sessionTimeout < 5 || data.sessionTimeout > 1440)) {
      throw new AppError('会话超时时间必须在5-1440分钟之间', 400);
    }
    
    if (data.maxLoginAttempts && (data.maxLoginAttempts < 1 || data.maxLoginAttempts > 10)) {
      throw new AppError('最大登录尝试次数必须在1-10次之间', 400);
    }

    // 获取现有设置
    let settings = await this.getSettings();
    
    // 更新设置
    settings = await prisma.systemSettings.update({
      where: { id: settings.id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
    
    return settings;
  }

  /**
   * 重置为默认设置
   */
  async resetSettings(): Promise<SystemSettings> {
    // 获取现有设置
    let settings = await this.getSettings();
    
    // 重置为默认值
    settings = await prisma.systemSettings.update({
      where: { id: settings.id },
      data: {
        siteName: 'Fennec 管理系统',
        siteDescription: '基于 React 19 的现代化管理系统',
        enableRegistration: false,
        enableEmailNotification: true,
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        updatedAt: new Date(),
      },
    });
    
    return settings;
  }
}

export const settingsService = new SettingsService();