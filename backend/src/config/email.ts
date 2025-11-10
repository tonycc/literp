/**
 * 邮件配置
 */

export interface EmailConfig {
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  from: {
    name: string;
    address: string;
  };
  templates: {
    baseUrl: string;
  };
}

export const emailConfig: EmailConfig = {
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  },
  from: {
    name: process.env.EMAIL_FROM_NAME || 'Fennec System',
    address: process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER || ''
  },
  templates: {
    baseUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
  }
};

// 验证邮件配置
export const validateEmailConfig = (): boolean => {
  const required = [
    'SMTP_HOST',
    'SMTP_USER',
    'SMTP_PASS'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn(`邮件配置缺少以下环境变量: ${missing.join(', ')}`);
    return false;
  }

  return true;
};

// 邮件模板类型
export enum EmailTemplateType {
  WELCOME = 'welcome',
  PASSWORD_RESET = 'password_reset',
  NOTIFICATION = 'notification',
  ANNOUNCEMENT = 'announcement',
  MESSAGE = 'message',
  SYSTEM_ALERT = 'system_alert'
}

// 邮件优先级
export enum EmailPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}