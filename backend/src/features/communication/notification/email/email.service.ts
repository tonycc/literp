import { PrismaClient } from '@prisma/client';
import { logService } from '../../log';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface SendEmailData {
  to: string | string[];
  subject: string;
  content: string;
  templateId?: string;
  variables?: Record<string, any>;
}

export interface CreateEmailTemplateData {
  name: string;
  subject: string;
  content: string;
  variables?: string[];
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  // 初始化邮件传输器
  async initializeTransporter(config: EmailConfig) {
    try {
      this.transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: config.auth,
      });

      // 验证连接
      if (this.transporter) {
        await this.transporter.verify();
      }
      
      await logService.createSystemLog({
        level: 'info',
        message: '邮件服务初始化成功',
        action: '初始化邮件服务',
        details: `邮件服务器: ${config.host}:${config.port}`,
        userId: '',
        ip: '',
      });

      return true;
    } catch (error) {
      console.error('邮件服务初始化失败:', error);
      
      await logService.createSystemLog({
        level: 'error',
        message: '邮件服务初始化失败',
        action: '初始化邮件服务',
        details: `错误: ${error}`,
        userId: '',
        ip: '',
      });

      throw new Error('邮件服务初始化失败');
    }
  }

  // 发送邮件
  async sendEmail(data: SendEmailData) {
    try {
      if (!this.transporter) {
        throw new Error('邮件服务未初始化');
      }

      let content = data.content;
      let subject = data.subject;

      // 如果使用模板
      if (data.templateId) {
        const template = await this.getEmailTemplate(data.templateId);
        content = this.replaceVariables(template.content, data.variables || {});
        subject = this.replaceVariables(template.subject, data.variables || {});
      }

      const recipients = Array.isArray(data.to) ? data.to : [data.to];
      const results = [];

      for (const recipient of recipients) {
        try {
          const info = await this.transporter.sendMail({
            to: recipient,
            subject,
            html: content,
          });

          // 记录发送成功
          await prisma.emailLog.create({
            data: {
              to: recipient,
              subject,
              content,
              templateId: data.templateId,
              status: 'sent',
              sentAt: new Date(),
            },
          });

          results.push({
            to: recipient,
            status: 'sent',
            messageId: info.messageId,
          });

        } catch (error) {
          // 记录发送失败
          await prisma.emailLog.create({
            data: {
              to: recipient,
              subject,
              content,
              templateId: data.templateId,
              status: 'failed',
              error: String(error),
            },
          });

          results.push({
            to: recipient,
            status: 'failed',
            error: String(error),
          });
        }
      }

      await logService.createSystemLog({
        level: 'info',
        message: '发送邮件',
        action: '发送邮件',
        details: `发送邮件给 ${recipients.length} 个收件人`,
        userId: '',
        ip: '',
      });

      return results;
    } catch (error) {
      console.error('发送邮件失败:', error);
      throw new Error('发送邮件失败');
    }
  }

  // 创建邮件模板
  async createEmailTemplate(data: CreateEmailTemplateData, creatorId: string) {
    try {
      const template = await prisma.emailTemplate.create({
        data: {
          name: data.name,
          subject: data.subject,
          content: data.content,
          variables: data.variables ? JSON.stringify(data.variables) : null,
        },
      });

      await logService.createSystemLog({
        level: 'info',
        message: '创建邮件模板',
        action: '创建邮件模板',
        details: `创建邮件模板: ${template.name}`,
        userId: creatorId,
        ip: '',
      });

      return template;
    } catch (error) {
      console.error('创建邮件模板失败:', error);
      throw new Error('创建邮件模板失败');
    }
  }

  // 获取邮件模板
  async getEmailTemplate(templateId: string) {
    try {
      const template = await prisma.emailTemplate.findUnique({
        where: { id: templateId },
      });

      if (!template) {
        throw new Error('邮件模板不存在');
      }

      return template;
    } catch (error) {
      console.error('获取邮件模板失败:', error);
      throw new Error('获取邮件模板失败');
    }
  }

  // 获取邮件模板列表
  async getEmailTemplates(page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;

      const [templates, total] = await Promise.all([
        prisma.emailTemplate.findMany({
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.emailTemplate.count(),
      ]);

      return {
        templates,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('获取邮件模板列表失败:', error);
      throw new Error('获取邮件模板列表失败');
    }
  }

  // 更新邮件模板
  async updateEmailTemplate(templateId: string, data: Partial<CreateEmailTemplateData>, updaterId: string) {
    try {
      const updateData: any = {};
      
      if (data.name) updateData.name = data.name;
      if (data.subject) updateData.subject = data.subject;
      if (data.content) updateData.content = data.content;
      if (data.variables) updateData.variables = JSON.stringify(data.variables);

      const template = await prisma.emailTemplate.update({
        where: { id: templateId },
        data: updateData,
      });

      await logService.createSystemLog({
        level: 'info',
        message: '更新邮件模板',
        action: '更新邮件模板',
        details: `更新邮件模板: ${template.name}`,
        userId: updaterId,
        ip: '',
      });

      return template;
    } catch (error) {
      console.error('更新邮件模板失败:', error);
      throw new Error('更新邮件模板失败');
    }
  }

  // 删除邮件模板
  async deleteEmailTemplate(templateId: string, deleterId: string) {
    try {
      const template = await prisma.emailTemplate.findUnique({
        where: { id: templateId },
      });

      if (!template) {
        throw new Error('邮件模板不存在');
      }

      await prisma.emailTemplate.delete({
        where: { id: templateId },
      });

      await logService.createSystemLog({
        level: 'info',
        message: '删除邮件模板',
        action: '删除邮件模板',
        details: `删除邮件模板: ${template.name}`,
        userId: deleterId,
        ip: '',
      });

      return { success: true };
    } catch (error) {
      console.error('删除邮件模板失败:', error);
      throw new Error('删除邮件模板失败');
    }
  }

  // 获取邮件发送记录
  async getEmailLogs(page: number = 1, limit: number = 20, status?: string) {
    try {
      const skip = (page - 1) * limit;
      const where: any = {};
      
      if (status) where.status = status;

      const [logs, total] = await Promise.all([
        prisma.emailLog.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.emailLog.count({ where }),
      ]);

      return {
        logs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('获取邮件记录失败:', error);
      throw new Error('获取邮件记录失败');
    }
  }

  // 替换模板变量
  private replaceVariables(template: string, variables: Record<string, any>): string {
    let result = template;
    
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, String(variables[key]));
    });

    return result;
  }

  // 获取邮件统计
  async getEmailStats() {
    try {
      const [total, sent, failed, pending] = await Promise.all([
        prisma.emailLog.count(),
        prisma.emailLog.count({ where: { status: 'sent' } }),
        prisma.emailLog.count({ where: { status: 'failed' } }),
        prisma.emailLog.count({ where: { status: 'pending' } }),
      ]);

      return {
        total,
        sent,
        failed,
        pending,
        successRate: total > 0 ? (sent / total * 100).toFixed(2) : '0',
      };
    } catch (error) {
      console.error('获取邮件统计失败:', error);
      throw new Error('获取邮件统计失败');
    }
  }
}

export const emailService = new EmailService();