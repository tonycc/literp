import { PrismaClient } from '@prisma/client';
import { logService } from '../../log';
import { webSocketService } from '../websocket/websocket.service';

const prisma = new PrismaClient();

export interface CreateMessageData {
  title: string;
  content: string;
  type?: string;
  senderId?: string;
  receiverId: string;
}

export interface MessageFilters {
  senderId?: string;
  receiverId?: string;
  type?: string;
  isRead?: boolean;
  page?: number;
  limit?: number;
}

class MessageService {
  // 发送消息
  async sendMessage(data: CreateMessageData) {
    try {
      const message = await prisma.message.create({
        data: {
          title: data.title,
          content: data.content,
          type: data.type || 'normal',
          senderId: data.senderId,
          receiverId: data.receiverId,
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          receiver: {
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
        message: '发送消息',
        action: '发送消息',
        details: `${data.senderId ? `用户 ${message.sender?.username}` : '系统'} 向用户 ${message.receiver.username} 发送消息: ${message.title}`,
        userId: data.senderId || '',
        ip: '',
      });

      // 实时推送消息给接收者
      webSocketService.sendNotificationToUser(data.receiverId, {
        id: message.id,
        type: 'message',
        title: data.title,
        content: data.content,
        senderId: data.senderId,
        senderName: message.sender?.username,
        createdAt: message.createdAt,
        isRead: false
      });

      return message;
    } catch (error) {
      console.error('发送消息失败:', error);
      throw new Error('发送消息失败');
    }
  }

  // 批量发送消息
  async sendBulkMessages(messages: CreateMessageData[]) {
    try {
      const result = await prisma.message.createMany({
        data: messages.map(msg => ({
          title: msg.title,
          content: msg.content,
          type: msg.type || 'normal',
          senderId: msg.senderId,
          receiverId: msg.receiverId,
        })),
      });

      await logService.createSystemLog({
        level: 'info',
        message: '批量发送消息',
        action: '批量发送消息',
        details: `批量发送 ${result.count} 条消息`,
        userId: '',
        ip: '',
      });

      return result;
    } catch (error) {
      console.error('批量发送消息失败:', error);
      throw new Error('批量发送消息失败');
    }
  }

  // 获取消息列表
  async getMessages(filters: MessageFilters) {
    try {
      const { senderId, receiverId, type, isRead, page = 1, limit = 20 } = filters;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (senderId) where.senderId = senderId;
      if (receiverId) where.receiverId = receiverId;
      if (type) where.type = type;
      if (isRead !== undefined) where.isRead = isRead;

      const [messages, total] = await Promise.all([
        prisma.message.findMany({
          where,
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
            receiver: {
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
        prisma.message.count({ where }),
      ]);

      return {
        messages,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('获取消息列表失败:', error);
      throw new Error('获取消息列表失败');
    }
  }

  // 获取用户收件箱
  async getInbox(userId: string, page: number = 1, limit: number = 20) {
    return this.getMessages({
      receiverId: userId,
      page,
      limit,
    });
  }

  // 获取用户发件箱
  async getSentMessages(userId: string, page: number = 1, limit: number = 20) {
    return this.getMessages({
      senderId: userId,
      page,
      limit,
    });
  }

  // 标记消息为已读
  async markAsRead(messageId: string, userId: string) {
    try {
      const message = await prisma.message.findFirst({
        where: {
          id: messageId,
          receiverId: userId,
        },
      });

      if (!message) {
        throw new Error('消息不存在或无权限');
      }

      const updatedMessage = await prisma.message.update({
        where: { id: messageId },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return updatedMessage;
    } catch (error) {
      console.error('标记消息已读失败:', error);
      throw new Error('标记消息已读失败');
    }
  }

  // 批量标记为已读
  async markAllAsRead(userId: string) {
    try {
      const result = await prisma.message.updateMany({
        where: {
          receiverId: userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      await logService.createSystemLog({
        level: 'info',
        message: '批量标记消息已读',
        action: '批量标记消息已读',
        details: `用户标记 ${result.count} 条消息为已读`,
        userId: userId,
        ip: '',
      });

      return result;
    } catch (error) {
      console.error('批量标记已读失败:', error);
      throw new Error('批量标记已读失败');
    }
  }

  // 删除消息
  async deleteMessage(messageId: string, userId: string) {
    try {
      const message = await prisma.message.findFirst({
        where: {
          id: messageId,
          OR: [
            { senderId: userId },
            { receiverId: userId },
          ],
        },
      });

      if (!message) {
        throw new Error('消息不存在或无权限');
      }

      await prisma.message.delete({
        where: { id: messageId },
      });

      await logService.createSystemLog({
        level: 'info',
        message: '删除消息',
        action: '删除消息',
        details: `删除消息: ${message.title}`,
        userId: userId,
        ip: '',
      });

      return { success: true };
    } catch (error) {
      console.error('删除消息失败:', error);
      throw new Error('删除消息失败');
    }
  }

  // 获取未读消息数量
  async getUnreadCount(userId: string) {
    try {
      const count = await prisma.message.count({
        where: {
          receiverId: userId,
          isRead: false,
        },
      });

      return { count };
    } catch (error) {
      console.error('获取未读消息数量失败:', error);
      throw new Error('获取未读消息数量失败');
    }
  }

  // 获取消息详情
  async getMessageById(messageId: string, userId: string) {
    try {
      const message = await prisma.message.findFirst({
        where: {
          id: messageId,
          OR: [
            { senderId: userId },
            { receiverId: userId },
          ],
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          receiver: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      });

      if (!message) {
        throw new Error('消息不存在或无权限');
      }

      return message;
    } catch (error) {
      console.error('获取消息详情失败:', error);
      throw new Error('获取消息详情失败');
    }
  }
}

export const messageService = new MessageService();