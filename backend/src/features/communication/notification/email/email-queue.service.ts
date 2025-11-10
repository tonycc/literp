import { PrismaClient } from '@prisma/client';
import { emailService } from './email.service';
import { EmailPriority } from '../../../../config/email';

const prisma = new PrismaClient();



class EmailQueueService {
  private isProcessing = false;
  private processingInterval: NodeJS.Timeout | null = null;

  /**
   * 启动邮件队列处理器
   */
  start(): void {
    if (this.processingInterval) {
      return;
    }

    console.log('📧 启动邮件队列处理器');
    
    // 每30秒处理一次队列
    this.processingInterval = setInterval(() => {
      this.processQueue();
    }, 30000);

    // 立即处理一次
    this.processQueue();
  }

  /**
   * 停止邮件队列处理器
   */
  stop(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      console.log('📧 邮件队列处理器已停止');
    }
  }

  /**
   * 添加邮件到队列
   */
  async addToQueue(emailData: {
    to: string;
    subject: string;
    content?: string;
    templateId?: string;
    templateData?: any;
    priority?: EmailPriority;
    scheduledAt?: Date;
    maxRetries?: number;
  }): Promise<string> {
    try {
      const queueItem = await prisma.emailQueue.create({
        data: {
          to: emailData.to,
          subject: emailData.subject,
          content: emailData.content || '',
          templateId: emailData.templateId,
          templateData: emailData.templateData ? JSON.stringify(emailData.templateData) : null,
          priority: emailData.priority || EmailPriority.NORMAL,
          scheduledAt: emailData.scheduledAt || new Date(),
          maxRetries: emailData.maxRetries || 3,
          currentRetries: 0,
          status: 'pending'
        }
      });

      console.log(`📧 邮件已添加到队列: ${queueItem.id}`);
      
      // 如果是高优先级或紧急邮件，立即处理
      if (emailData.priority === EmailPriority.HIGH || emailData.priority === EmailPriority.URGENT) {
        setTimeout(() => this.processQueue(), 1000);
      }

      return queueItem.id;
    } catch (error) {
      console.error('添加邮件到队列失败:', error);
      throw error;
    }
  }

  /**
   * 处理邮件队列
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      // 获取待处理的邮件，按优先级和计划时间排序
      const pendingEmails = await prisma.emailQueue.findMany({
        where: {
          status: 'pending',
          scheduledAt: {
            lte: new Date()
          }
        },
        orderBy: [
          { priority: 'desc' },
          { scheduledAt: 'asc' }
        ],
        take: 10 // 每次处理最多10封邮件
      });

      if (pendingEmails.length === 0) {
        return;
      }

      console.log(`📧 处理 ${pendingEmails.length} 封待发送邮件`);

      for (const email of pendingEmails) {
        await this.processEmail(email);
      }
    } catch (error) {
      console.error('处理邮件队列失败:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * 处理单个邮件
   */
  private async processEmail(email: any): Promise<void> {
    try {
      // 更新状态为处理中
      await prisma.emailQueue.update({
        where: { id: email.id },
        data: { status: 'processing' }
      });

      let emailContent = email.content;
      
      // 如果有模板，使用模板生成内容
      if (email.templateId) {
        const templateData = email.templateData ? JSON.parse(email.templateData) : {};
        const template = await emailService.getEmailTemplate(email.templateId);
        if (template) {
          emailContent = (emailService as any).replaceVariables(template.content, templateData);
        }
      }

      // 发送邮件
      await emailService.sendEmail({
        to: email.to,
        subject: email.subject,
        content: emailContent
      });

      // 更新状态为已发送
      await prisma.emailQueue.update({
        where: { id: email.id },
        data: { 
          status: 'sent',
          sentAt: new Date()
        }
      });

      console.log(`📧 邮件发送成功: ${email.id} -> ${email.to}`);

    } catch (error) {
      console.error(`📧 邮件发送失败: ${email.id}`, error);
      
      const newRetryCount = email.currentRetries + 1;
      
      if (newRetryCount >= email.maxRetries) {
        // 达到最大重试次数，标记为失败
        await prisma.emailQueue.update({
          where: { id: email.id },
          data: { 
            status: 'failed',
            currentRetries: newRetryCount,
            error: error instanceof Error ? error.message : String(error)
          }
        });
      } else {
        // 重新排队，延迟发送
        const nextRetryAt = new Date();
        nextRetryAt.setMinutes(nextRetryAt.getMinutes() + Math.pow(2, newRetryCount) * 5); // 指数退避

        await prisma.emailQueue.update({
          where: { id: email.id },
          data: { 
            status: 'pending',
            currentRetries: newRetryCount,
            scheduledAt: nextRetryAt,
            error: error instanceof Error ? error.message : String(error)
          }
        });
      }
    }
  }

  /**
   * 获取队列统计信息
   */
  async getQueueStats(): Promise<{
    pending: number;
    processing: number;
    sent: number;
    failed: number;
    total: number;
  }> {
    const stats = await prisma.emailQueue.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    const result = {
      pending: 0,
      processing: 0,
      sent: 0,
      failed: 0,
      total: 0
    };

    stats.forEach((stat: any) => {
      result[stat.status as keyof typeof result] = stat._count.id;
      result.total += stat._count.id;
    });

    return result;
  }

  /**
   * 清理已发送的邮件记录（保留最近30天）
   */
  async cleanupSentEmails(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await prisma.emailQueue.deleteMany({
      where: {
        status: 'sent',
        sentAt: {
          lt: thirtyDaysAgo
        }
      }
    });

    console.log(`📧 清理了 ${result.count} 条已发送邮件记录`);
    return result.count;
  }

  /**
   * 重试失败的邮件
   */
  async retryFailedEmails(emailIds?: string[]): Promise<number> {
    const where = emailIds 
      ? { id: { in: emailIds }, status: 'failed' }
      : { status: 'failed' };

    const result = await prisma.emailQueue.updateMany({
      where,
      data: {
        status: 'pending',
        scheduledAt: new Date(),
        error: null
      }
    });

    console.log(`📧 重新排队了 ${result.count} 封失败邮件`);
    return result.count;
  }
}

// 导出单例实例
export const emailQueueService = new EmailQueueService();
export default emailQueueService;