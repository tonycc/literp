import { Request, Response } from 'express';
import { dashboardService } from './dashboard.service';
import { createSuccessResponse } from '@zyerp/shared';

export const getStats = async (_req: Request, res: Response) => {
  try {
    const stats = await dashboardService.getStats();
    res.json(createSuccessResponse(stats, '获取统计数据成功'));
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: '获取统计数据失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getSystemStatus = async (_req: Request, res: Response) => {
  try {
    const status = await dashboardService.getSystemStatus();
    res.json(createSuccessResponse(status, '获取系统状态成功'));
  } catch (error) {
    console.error('Error getting system status:', error);
    res.status(500).json({
      success: false,
      message: '获取系统状态失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};