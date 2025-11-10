/**
 * 系统设置控制器
 */

import { Request, Response, NextFunction } from 'express';
import { createSuccessResponse } from '@zyerp/shared';
import { settingsService, UpdateSettingsData } from './settings.service';

/**
 * 获取系统设置
 */
export const getSettings = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const settings = await settingsService.getSettings();
    res.json(createSuccessResponse(settings));
  } catch (error) {
    next(error);
  }
};

/**
 * 更新系统设置
 */
export const updateSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data: UpdateSettingsData = req.body;
    const settings = await settingsService.updateSettings(data);
    res.json(createSuccessResponse(settings, '设置更新成功'));
  } catch (error) {
    next(error);
  }
};

/**
 * 重置系统设置
 */
export const resetSettings = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const settings = await settingsService.resetSettings();
    res.json(createSuccessResponse(settings, '设置已重置为默认值'));
  } catch (error) {
    next(error);
  }
};