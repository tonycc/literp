/**
 * 请求验证中间件
 */

import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { createErrorResponse } from '@zyerp/shared/utils';

// 验证中间件
export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json(createErrorResponse(errorMessage, 'VALIDATION_ERROR'));
    }
    
    next();
  };
};

// 系统设置验证schema
export const updateSettingsSchema = Joi.object({
  siteName: Joi.string().min(1).max(100).optional(),
  siteDescription: Joi.string().max(500).optional().allow(''),
  enableRegistration: Joi.boolean().optional(),
  enableEmailNotification: Joi.boolean().optional(),
  sessionTimeout: Joi.number().integer().min(5).max(1440).optional(),
  maxLoginAttempts: Joi.number().integer().min(1).max(10).optional(),
});