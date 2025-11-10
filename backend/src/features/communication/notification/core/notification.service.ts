import { PrismaClient } from '@prisma/client';
import { logService } from '../../log';
import { webSocketService } from '../websocket/websocket.service';
import { emailQueueService } from '../email/email-queue.service';
import { EmailPriority } from '../../../../config/email';

const prisma = new PrismaClient();

export interface CreateNotificationData {
  type: string;
  title: string;
  content: string;
  data?: string;
  userId: string;
  senderId?: string;
  senderName?: string;
}

export interface NotificationFilters {
  userId?: string;
  type?: string;
  isRead?: boolean;
  page?: number;
  limit?: number;
}

class NotificationService {
  // 创建通知
  async createNotification(data: CreateNotificationData) {
    try {
      const notification = await prisma.notification.create({
        data: {
          type: data.type,
          title: data.title,
          content: data.content,
          data: data.data,
          userId: data.userId,
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

      await logService.createSystemLog({
        level: 'info',
        message: '创建通知',
        action: '创建通知',
        details: `为用户 ${notification.user.username} 创建通知: ${notification.title}`,
        userId: data.userId,
        ip: '',
      });

      // 实时推送通知
    await webSocketService.sendNotificationToUser(notification.userId, {
      id: notification.id,
      type: notification.type as 'message' | 'announcement' | 'system',
      title: notification.title,
      content: notification.content,
      priority: notification.priority,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
      senderId: data.senderId,
      senderName: data.senderName
    });

    // 如果是重要通知，发送邮件
    if (notification.priority === 'HIGH' || notification.priority === 'URGENT') {
      // 获取用户邮箱
      const user = await prisma.user.findUnique({
        where: { id: notification.userId },
        select: { email: true, username: true }
      });

      if (user?.email) {
         // 查找通知邮件模板
         const template = await prisma.emailTemplate.findFirst({
           where: { name: 'notification', isActive: true }
         });

         await emailQueueService.addToQueue({
           to: user.email,
           subject: `重要通知：${notification.title}`,
           templateId: template?.id,
           templateData: {
             username: user.username,
             title: notification.title,
             content: notification.content,
             senderName: data.senderName || '系统',
             priority: notification.priority
           },
           priority: notification.priority === 'URGENT' ? EmailPriority.URGENT : EmailPriority.HIGH
         });
       }
    }

      return notification;
    } catch (error) {
      console.error('创建通知失败:', error);
      throw new Error('创建通知失败');
    }
  }

  // 批量创建通知
  async createBulkNotifications(notifications: CreateNotificationData[]) {
    try {
      const result = await prisma.notification.createMany({
        data: notifications,
      });

      await logService.createSystemLog({
        level: 'info',
        message: '批量创建通知',
        action: '批量创建通知',
        details: `批量创建 ${result.count} 条通知`,
        userId: '',
        ip: '',
      });

      return result;
    } catch (error) {
      console.error('批量创建通知失败:', error);
      throw new Error('批量创建通知失败');
    }
  }

  // 获取用户通知列表
  async getUserNotifications(filters: NotificationFilters) {
    try {
      const { userId, type, isRead, page = 1, limit = 20 } = filters;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (userId) where.userId = userId;
      if (type) where.type = type;
      if (isRead !== undefined) where.isRead = isRead;

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
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
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take: limit,
        }),
        prisma.notification.count({ where }),
      ]);

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('获取通知列表失败:', error);
      throw new Error('获取通知列表失败');
    }
  }

  // 标记通知为已读
  async markAsRead(notificationId: string, userId: string) {
    try {
      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId: userId,
        },
      });

      if (!notification) {
        throw new Error('通知不存在或无权限');
      }

      const updatedNotification = await prisma.notification.update({
        where: { id: notificationId },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return updatedNotification;
    } catch (error) {
      console.error('标记通知已读失败:', error);
      throw new Error('标记通知已读失败');
    }
  }

  // 批量标记为已读
  async markAllAsRead(userId: string) {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          userId: userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      await logService.createSystemLog({
        level: 'info',
        message: '批量标记通知已读',
        action: '批量标记通知已读',
        details: `用户标记 ${result.count} 条通知为已读`,
        userId: userId,
        ip: '',
      });

      return result;
    } catch (error) {
      console.error('批量标记已读失败:', error);
      throw new Error('批量标记已读失败');
    }
  }

  // 删除通知
  async deleteNotification(notificationId: string, userId: string) {
    try {
      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId: userId,
        },
      });

      if (!notification) {
        throw new Error('通知不存在或无权限');
      }

      await prisma.notification.delete({
        where: { id: notificationId },
      });

      await logService.createSystemLog({
        level: 'info',
        message: '删除通知',
        action: '删除通知',
        details: `删除通知: ${notification.title}`,
        userId: userId,
        ip: '',
      });

      return { success: true };
    } catch (error) {
      console.error('删除通知失败:', error);
      throw new Error('删除通知失败');
    }
  }

  // 获取未读通知数量
  async getUnreadCount(userId: string) {
    try {
      const count = await prisma.notification.count({
        where: {
          userId: userId,
          isRead: false,
        },
      });

      return { count };
    } catch (error) {
      console.error('获取未读通知数量失败:', error);
      throw new Error('获取未读通知数量失败');
    }
  }

  // 清理过期通知
  async cleanupExpiredNotifications(daysOld: number = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await prisma.notification.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
          isRead: true,
        },
      });

      await logService.createSystemLog({
        level: 'info',
        message: '清理过期通知',
        action: '清理过期通知',
        details: `清理了 ${result.count} 条过期通知`,
        userId: '',
        ip: '',
      });

      return result;
    } catch (error) {
      console.error('清理过期通知失败:', error);
      throw new Error('清理过期通知失败');
    }
  }
}

export const notificationService = new NotificationService();