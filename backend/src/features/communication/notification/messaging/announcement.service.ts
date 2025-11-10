import { PrismaClient } from '@prisma/client';
import { logService } from '../../log';
import { webSocketService } from '../websocket/websocket.service';

const prisma = new PrismaClient();

export interface CreateAnnouncementData {
  title: string;
  content: string;
  type?: string;
  priority?: string;
  publishAt?: Date;
  expireAt?: Date;
  targetUsers?: string[];
}

export interface AnnouncementFilters {
  type?: string;
  priority?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

class AnnouncementService {
  // 创建公告
  async createAnnouncement(data: CreateAnnouncementData, creatorId: string) {
    try {
      const announcement = await prisma.announcement.create({
        data: {
          title: data.title,
          content: data.content,
          type: data.type || 'info',
          priority: data.priority || 'normal',
          publishAt: data.publishAt || new Date(),
          expireAt: data.expireAt,
          targetUsers: data.targetUsers ? JSON.stringify(data.targetUsers) : null
        }
      });

      await logService.createSystemLog({
        level: 'info',
        message: '创建公告',
        action: '创建公告',
        details: `创建公告: ${announcement.title}`,
        userId: creatorId,
        ip: '',
      });

      // 如果公告是活跃状态，广播给所有在线用户
      if (announcement.isActive) {
        webSocketService.broadcastAnnouncement({
          id: announcement.id,
          type: 'announcement',
          title: data.title,
          content: data.content,
          senderId: creatorId,
          senderName: '系统管理员',
          createdAt: announcement.createdAt,
          isRead: false
        });
      }

      return announcement;
    } catch (error) {
      console.error('创建公告失败:', error);
      throw new Error('创建公告失败');
    }
  }

  // 获取公告列表
  async getAnnouncements(filters: AnnouncementFilters) {
    try {
      const { type, priority, isActive, page = 1, limit = 20 } = filters;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (type) where.type = type;
      if (priority) where.priority = priority;
      if (isActive !== undefined) where.isActive = isActive;

      // 只显示已发布且未过期的公告
      const now = new Date();
      where.publishAt = { lte: now };
      where.OR = [
        { expireAt: null },
        { expireAt: { gt: now } },
      ];

      const [announcements, total] = await Promise.all([
        prisma.announcement.findMany({
          where,
          orderBy: [
            { priority: 'desc' },
            { publishAt: 'desc' },
          ],
          skip,
          take: limit,
        }),
        prisma.announcement.count({ where }),
      ]);

      return {
        announcements,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('获取公告列表失败:', error);
      throw new Error('获取公告列表失败');
    }
  }

  // 获取用户的公告（考虑目标用户）
  async getUserAnnouncements(userId: string, filters: AnnouncementFilters) {
    try {
      const { type, priority, page = 1, limit = 20 } = filters;
      const skip = (page - 1) * limit;

      const where: any = {
        isActive: true,
      };

      if (type) where.type = type;
      if (priority) where.priority = priority;

      // 只显示已发布且未过期的公告
      const now = new Date();
      where.publishAt = { lte: now };
      where.OR = [
        { expireAt: null },
        { expireAt: { gt: now } },
      ];

      const [announcements, _total] = await Promise.all([
        prisma.announcement.findMany({
          where,
          include: {
            reads: {
              where: { userId },
              select: { readAt: true },
            },
          },
          orderBy: [
            { priority: 'desc' },
            { publishAt: 'desc' },
          ],
          skip,
          take: limit,
        }),
        prisma.announcement.count({ where }),
      ]);

      // 过滤目标用户
      const filteredAnnouncements = announcements.filter(announcement => {
        if (!announcement.targetUsers) return true; // 全体用户
        
        try {
          const targetUsers = JSON.parse(announcement.targetUsers);
          return targetUsers.includes(userId);
        } catch {
          return true; // 解析失败时默认显示
        }
      });

      return {
        announcements: filteredAnnouncements.map(announcement => ({
          ...announcement,
          isRead: announcement.reads.length > 0,
          readAt: announcement.reads[0]?.readAt || null,
        })),
        pagination: {
          page,
          limit,
          total: filteredAnnouncements.length,
          pages: Math.ceil(filteredAnnouncements.length / limit),
        },
      };
    } catch (error) {
      console.error('获取用户公告失败:', error);
      throw new Error('获取用户公告失败');
    }
  }

  // 标记公告为已读
  async markAnnouncementAsRead(announcementId: string, userId: string) {
    try {
      const announcement = await prisma.announcement.findUnique({
        where: { id: announcementId },
      });

      if (!announcement) {
        throw new Error('公告不存在');
      }

      // 检查是否已读
      const existingRead = await prisma.announcementRead.findUnique({
        where: {
          announcementId_userId: {
            announcementId,
            userId,
          },
        },
      });

      if (existingRead) {
        return existingRead;
      }

      const read = await prisma.announcementRead.create({
        data: {
          announcementId,
          userId,
        },
      });

      return read;
    } catch (error) {
      console.error('标记公告已读失败:', error);
      throw new Error('标记公告已读失败');
    }
  }

  // 更新公告
  async updateAnnouncement(announcementId: string, data: Partial<CreateAnnouncementData>, updaterId: string) {
    try {
      const updateData: any = {};
      
      if (data.title) updateData.title = data.title;
      if (data.content) updateData.content = data.content;
      if (data.type) updateData.type = data.type;
      if (data.priority) updateData.priority = data.priority;
      if (data.publishAt) updateData.publishAt = data.publishAt;
      if (data.expireAt !== undefined) updateData.expireAt = data.expireAt;
      if (data.targetUsers) updateData.targetUsers = JSON.stringify(data.targetUsers);

      const announcement = await prisma.announcement.update({
        where: { id: announcementId },
        data: updateData,
      });

      await logService.createSystemLog({
        level: 'info',
        message: '更新公告',
        action: '更新公告',
        details: `更新公告: ${announcement.title}`,
        userId: updaterId,
        ip: '',
      });

      return announcement;
    } catch (error) {
      console.error('更新公告失败:', error);
      throw new Error('更新公告失败');
    }
  }

  // 删除公告
  async deleteAnnouncement(announcementId: string, deleterId: string) {
    try {
      const announcement = await prisma.announcement.findUnique({
        where: { id: announcementId },
      });

      if (!announcement) {
        throw new Error('公告不存在');
      }

      await prisma.announcement.delete({
        where: { id: announcementId },
      });

      await logService.createSystemLog({
        level: 'info',
        message: '删除公告',
        action: '删除公告',
        details: `删除公告: ${announcement.title}`,
        userId: deleterId,
        ip: '',
      });

      return { success: true };
    } catch (error) {
      console.error('删除公告失败:', error);
      throw new Error('删除公告失败');
    }
  }

  // 启用/禁用公告
  async toggleAnnouncementStatus(announcementId: string, isActive: boolean, operatorId: string) {
    try {
      const announcement = await prisma.announcement.update({
        where: { id: announcementId },
        data: { isActive },
      });

      await logService.createSystemLog({
        level: 'info',
        message: `${isActive ? '启用' : '禁用'}公告`,
        action: `${isActive ? '启用' : '禁用'}公告`,
        details: `${isActive ? '启用' : '禁用'}公告: ${announcement.title}`,
        userId: operatorId,
        ip: '',
      });

      return announcement;
    } catch (error) {
      console.error('切换公告状态失败:', error);
      throw new Error('切换公告状态失败');
    }
  }

  // 获取公告详情
  async getAnnouncementById(announcementId: string, userId?: string) {
    try {
      const announcement = await prisma.announcement.findUnique({
        where: { id: announcementId },
        include: userId ? {
          reads: {
            where: { userId },
            select: { readAt: true },
          },
        } : undefined,
      });

      if (!announcement) {
        throw new Error('公告不存在');
      }

      const result: any = { ...announcement };
      if (userId && (announcement as any).reads) {
        result.isRead = (announcement as any).reads.length > 0;
        result.readAt = (announcement as any).reads[0]?.readAt || null;
      }
      return result;
    } catch (error) {
      console.error('获取公告详情失败:', error);
      throw new Error('获取公告详情失败');
    }
  }

  // 获取公告统计
  async getAnnouncementStats() {
    try {
      const [total, active, expired] = await Promise.all([
        prisma.announcement.count(),
        prisma.announcement.count({
          where: { isActive: true },
        }),
        prisma.announcement.count({
          where: {
            expireAt: {
              lt: new Date(),
            },
          },
        }),
      ]);

      return {
        total,
        active,
        expired,
        inactive: total - active,
      };
    } catch (error) {
      console.error('获取公告统计失败:', error);
      throw new Error('获取公告统计失败');
    }
  }
}

export const announcementService = new AnnouncementService();