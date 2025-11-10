import { PrismaClient } from '@prisma/client';
import os from 'os';

const prisma = new PrismaClient();

export interface DashboardStats {
  totalUsers: number;
  totalRoles: number;
  totalPermissions: number;
  todayLogins: number;
  activeUsers: number;
}

export interface SystemStatus {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  uptime: number;
}

export class DashboardService {
  async getStats(): Promise<DashboardStats> {
    try {
      // 获取用户总数
      const totalUsers = await prisma.user.count();
      
      // 获取角色总数
      const totalRoles = await prisma.role.count();
      
      // 获取权限总数
      const totalPermissions = await prisma.permission.count();
      
      // 获取今日登录数（这里简化处理，实际应该根据登录日志统计）
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayLogins = await prisma.user.count({
        where: {
          lastLoginAt: {
            gte: today
          }
        }
      });
      
      // 获取活跃用户数（最近7天登录的用户）
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const activeUsers = await prisma.user.count({
        where: {
          lastLoginAt: {
            gte: sevenDaysAgo
          }
        }
      });

      return {
        totalUsers,
        totalRoles,
        totalPermissions,
        todayLogins,
        activeUsers
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw new Error('Failed to get dashboard statistics');
    }
  }

  async getSystemStatus(): Promise<SystemStatus> {
    try {
      // CPU使用率（简化计算）
      const cpus = os.cpus();
      let totalIdle = 0;
      let totalTick = 0;
      
      cpus.forEach(cpu => {
        for (const type in cpu.times) {
          totalTick += cpu.times[type as keyof typeof cpu.times];
        }
        totalIdle += cpu.times.idle;
      });
      
      const cpuUsage = Math.round(100 - (totalIdle / totalTick) * 100);
      
      // 内存使用率
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const memoryUsage = Math.round(((totalMemory - freeMemory) / totalMemory) * 100);
      
      // 磁盘使用率（简化处理，实际应该检查具体磁盘）
      let diskUsage = 0;
      try {
        // 这里简化处理，实际应该使用更准确的磁盘空间检查
        diskUsage = Math.floor(Math.random() * 30) + 20; // 模拟20-50%的使用率
      } catch (error) {
        diskUsage = 25; // 默认值
      }
      
      // 系统运行时间（秒）
      const uptime = os.uptime();

      return {
        cpuUsage,
        memoryUsage,
        diskUsage,
        uptime
      };
    } catch (error) {
      console.error('Error getting system status:', error);
      throw new Error('Failed to get system status');
    }
  }
}

export const dashboardService = new DashboardService();