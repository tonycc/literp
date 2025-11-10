/**
 * 日志服务
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface SystemLogData {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  module?: string;
  action?: string;
  details?: any;
  userId?: string;
  ip?: string;
  userAgent?: string;
}

export interface AuditLogData {
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'VIEW';
  resource: string;
  resourceId?: string;
  oldValues?: any;
  newValues?: any;
  userId?: string;
  ip?: string;
  userAgent?: string;
  success?: boolean;
  errorMsg?: string;
}

export interface LogQueryOptions {
  page?: number;
  pageSize?: number;
  level?: string;
  action?: string;
  resource?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface LogQueryResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class LogService {
  /**
   * 记录系统日志
   */
  async createSystemLog(logData: SystemLogData) {
    try {
      const log = await prisma.systemLog.create({
        data: {
          level: logData.level,
          message: logData.message,
          module: logData.module,
          action: logData.action,
          details: logData.details ? JSON.stringify(logData.details) : null,
          userId: logData.userId,
          ip: logData.ip,
          userAgent: logData.userAgent,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      });

      return log;
    } catch (error) {
      console.error('创建系统日志失败:', error);
      throw error;
    }
  }

  /**
   * 记录审计日志
   */
  async createAuditLog(logData: AuditLogData) {
    try {
      const log = await prisma.auditLog.create({
        data: {
          action: logData.action,
          resource: logData.resource,
          resourceId: logData.resourceId,
          oldValues: logData.oldValues ? JSON.stringify(logData.oldValues) : null,
          newValues: logData.newValues ? JSON.stringify(logData.newValues) : null,
          userId: logData.userId,
          ip: logData.ip,
          userAgent: logData.userAgent,
          success: logData.success ?? true,
          errorMsg: logData.errorMsg,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      });

      return log;
    } catch (error) {
      console.error('创建审计日志失败:', error);
      throw error;
    }
  }

  /**
   * 查询系统日志
   */
  async getSystemLogs(options: LogQueryOptions = {}): Promise<LogQueryResult<any>> {
    const {
      page = 1,
      pageSize = 20,
      level,
      action,
      userId,
      startDate,
      endDate,
      search,
    } = options;

    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where: any = {};

    if (level) {
      where.level = level;
    }

    if (action) {
      where.action = { contains: action };
    }

    if (userId) {
      where.userId = userId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    if (search) {
      where.OR = [
        { message: { contains: search } },
        { module: { contains: search } },
        { action: { contains: search } },
      ];
    }

    try {
      const [logs, total] = await Promise.all([
        prisma.systemLog.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: pageSize,
        }),
        prisma.systemLog.count({ where }),
      ]);

      // 解析JSON字段
      const processedLogs = logs.map(log => ({
        ...log,
        details: log.details ? JSON.parse(log.details) : null,
      }));

      return {
        data: processedLogs,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    } catch (error) {
      console.error('查询系统日志失败:', error);
      throw error;
    }
  }

  /**
   * 查询审计日志
   */
  async getAuditLogs(options: LogQueryOptions = {}): Promise<LogQueryResult<any>> {
    const {
      page = 1,
      pageSize = 20,
      action,
      resource,
      userId,
      startDate,
      endDate,
      search,
    } = options;

    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where: any = {};

    if (action) {
      where.action = action;
    }

    if (resource) {
      where.resource = resource;
    }

    if (userId) {
      where.userId = userId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    if (search) {
      where.OR = [
        { resource: { contains: search } },
        { resourceId: { contains: search } },
        { errorMsg: { contains: search } },
      ];
    }

    try {
      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: pageSize,
        }),
        prisma.auditLog.count({ where }),
      ]);

      // 解析JSON字段
      const processedLogs = logs.map(log => ({
        ...log,
        oldValues: log.oldValues ? JSON.parse(log.oldValues) : null,
        newValues: log.newValues ? JSON.parse(log.newValues) : null,
      }));

      return {
        data: processedLogs,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    } catch (error) {
      console.error('查询审计日志失败:', error);
      throw error;
    }
  }

  /**
   * 删除过期日志
   */
  async cleanupLogs(daysToKeep: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    try {
      const [systemLogsDeleted, auditLogsDeleted] = await Promise.all([
        prisma.systemLog.deleteMany({
          where: {
            createdAt: {
              lt: cutoffDate,
            },
          },
        }),
        prisma.auditLog.deleteMany({
          where: {
            createdAt: {
              lt: cutoffDate,
            },
          },
        }),
      ]);

      return {
        systemLogsDeleted: systemLogsDeleted.count,
        auditLogsDeleted: auditLogsDeleted.count,
      };
    } catch (error) {
      console.error('清理过期日志失败:', error);
      throw error;
    }
  }

  /**
   * 获取日志统计信息
   */
  async getLogStats() {
    try {
      const [
        totalSystemLogs,
        totalAuditLogs,
        todaySystemLogs,
        todayAuditLogs,
        errorLogsToday,
        levelDistribution,
        actionDistribution,
      ] = await Promise.all([
        prisma.systemLog.count(),
        prisma.auditLog.count(),
        prisma.systemLog.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
        prisma.auditLog.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
        prisma.systemLog.count({
          where: {
            level: 'error',
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 最近24小时
            },
          },
        }),
        // 获取日志级别分布
        prisma.systemLog.groupBy({
          by: ['level'],
          _count: {
            level: true,
          },
        }),
        // 获取操作分布
        prisma.auditLog.groupBy({
          by: ['action'],
          _count: {
            action: true,
          },
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 最近7天
            },
          },
          orderBy: {
            _count: {
              action: 'desc',
            },
          },
          take: 10,
        }),
      ]);

      // 构建级别分布对象
      const levelDistributionMap = {
        info: 0,
        warn: 0,
        error: 0,
        debug: 0,
      };
      
      levelDistribution.forEach(item => {
        if (item.level in levelDistributionMap) {
          levelDistributionMap[item.level as keyof typeof levelDistributionMap] = item._count.level;
        }
      });

      // 构建操作分布对象
      const actionDistributionMap: { [key: string]: number } = {};
      actionDistribution.forEach(item => {
        actionDistributionMap[item.action] = item._count.action;
      });

      return {
        totalSystemLogs,
        totalAuditLogs,
        todaySystemLogs,
        todayAuditLogs,
        errorLogsToday,
        levelDistribution: levelDistributionMap,
        actionDistribution: actionDistributionMap,
      };
    } catch (error) {
      console.error('获取日志统计失败:', error);
      throw error;
    }
  }
}

export const logService = new LogService();