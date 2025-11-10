/**
 * 日志控制器
 */

import { Request, Response } from 'express';
import { createSuccessResponse } from '@zyerp/shared';
import { logService, type LogQueryOptions } from './log.service';

/**
 * 获取系统日志
 */
export const getSystemLogs = async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      pageSize = '20',
      level,
      action,
      userId,
      startDate,
      endDate,
      search,
    } = req.query;

    const options: LogQueryOptions = {
      page: parseInt(page as string),
      pageSize: parseInt(pageSize as string),
      level: level as string,
      action: action as string,
      userId: userId as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      search: search as string,
    };

    const result = await logService.getSystemLogs(options);
    res.json(createSuccessResponse(result, '获取系统日志成功'));
  } catch (error) {
    console.error('获取系统日志失败:', error);
    res.status(500).json({
      success: false,
      message: '获取系统日志失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
};

/**
 * 获取审计日志
 */
export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      pageSize = '20',
      action,
      resource,
      userId,
      startDate,
      endDate,
      search,
    } = req.query;

    const options: LogQueryOptions = {
      page: parseInt(page as string),
      pageSize: parseInt(pageSize as string),
      action: action as string,
      resource: resource as string,
      userId: userId as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      search: search as string,
    };

    const result = await logService.getAuditLogs(options);
    res.json(createSuccessResponse(result, '获取审计日志成功'));
  } catch (error) {
    console.error('获取审计日志失败:', error);
    res.status(500).json({
      success: false,
      message: '获取审计日志失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
};

/**
 * 获取日志统计信息
 */
export const getLogStats = async (_req: Request, res: Response) => {
  try {
    const stats = await logService.getLogStats();
    res.json(createSuccessResponse(stats, '获取日志统计成功'));
  } catch (error) {
    console.error('获取日志统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取日志统计失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
};

/**
 * 清理过期日志
 */
export const cleanupLogs = async (req: Request, res: Response) => {
  try {
    const { daysToKeep = 90 } = req.body;
    const result = await logService.cleanupLogs(parseInt(daysToKeep));
    res.json(createSuccessResponse(result, '清理过期日志成功'));
  } catch (error) {
    console.error('清理过期日志失败:', error);
    res.status(500).json({
      success: false,
      message: '清理过期日志失败',
      error: error instanceof Error ? error.message : '未知错误',
    });
  }
};