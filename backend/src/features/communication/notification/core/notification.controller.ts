import { Request, Response } from 'express'
import { notificationService } from './notification.service'
import { messageService, announcementService } from '../messaging'

// 通知相关控制器
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = String(req.user?.sub);
    const { type, isRead, page, limit } = req.query;

    const filters = {
      userId,
      type: type as string,
      isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    };

    const result = await notificationService.getUserNotifications(filters);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('获取通知列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取通知列表失败',
    });
  }
};

export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = String(req.user?.sub);

    const notification = await notificationService.markAsRead(id, userId);
    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error('标记通知已读失败:', error);
    res.status(500).json({
      success: false,
      message: '标记通知已读失败',
    });
  }
};

export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
  try {
    const userId = String(req.user?.sub);

    const result = await notificationService.markAllAsRead(userId);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('批量标记已读失败:', error);
    res.status(500).json({
      success: false,
      message: '批量标记已读失败',
    });
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = String(req.user?.sub);

    const result = await notificationService.deleteNotification(id, userId);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('删除通知失败:', error);
    res.status(500).json({
      success: false,
      message: '删除通知失败',
    });
  }
};

export const getUnreadNotificationCount = async (req: Request, res: Response) => {
  try {
    const userId = String(req.user?.sub);

    const result = await notificationService.getUnreadCount(userId);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('获取未读通知数量失败:', error);
    res.status(500).json({
      success: false,
      message: '获取未读通知数量失败',
    });
  }
};

// 消息相关控制器
export const getMessages = async (req: Request, res: Response) => {
  try {
    const userId = String(req.user?.sub);
    const { type, isRead, page, limit } = req.query;

    const filters = {
      receiverId: userId,
      type: type as string,
      isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    };

    const result = await messageService.getMessages(filters);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('获取消息列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取消息列表失败',
    });
  }
};

export const getInbox = async (req: Request, res: Response) => {
  try {
    const userId = String(req.user?.sub);
    const { page, limit } = req.query;

    const result = await messageService.getInbox(
      userId,
      page ? parseInt(page as string) : 1,
      limit ? parseInt(limit as string) : 20
    );
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('获取收件箱失败:', error);
    res.status(500).json({
      success: false,
      message: '获取收件箱失败',
    });
  }
};

export const getSentMessages = async (req: Request, res: Response) => {
  try {
    const userId = String(req.user?.sub);
    const { page, limit } = req.query;

    const result = await messageService.getSentMessages(
      userId,
      page ? parseInt(page as string) : 1,
      limit ? parseInt(limit as string) : 20
    );
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('获取发件箱失败:', error);
    res.status(500).json({
      success: false,
      message: '获取发件箱失败',
    });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const senderId = String(req.user?.sub);
    const { title, content, type, receiverId } = req.body;

    const message = await messageService.sendMessage({
      title,
      content,
      type,
      senderId,
      receiverId,
    });

    res.json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('发送消息失败:', error);
    res.status(500).json({
      success: false,
      message: '发送消息失败',
    });
  }
};

export const markMessageAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = String(req.user?.sub);

    const message = await messageService.markAsRead(id, userId);
    res.json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('标记消息已读失败:', error);
    res.status(500).json({
      success: false,
      message: '标记消息已读失败',
    });
  }
};

export const markAllMessagesAsRead = async (req: Request, res: Response) => {
  try {
    const userId = String(req.user?.sub);

    const result = await messageService.markAllAsRead(userId);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('批量标记消息已读失败:', error);
    res.status(500).json({
      success: false,
      message: '批量标记消息已读失败',
    });
  }
};

export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = String(req.user?.sub);

    const result = await messageService.deleteMessage(id, userId);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('删除消息失败:', error);
    res.status(500).json({
      success: false,
      message: '删除消息失败',
    });
  }
};

export const getUnreadMessageCount = async (req: Request, res: Response) => {
  try {
    const userId = String(req.user?.sub);

    const result = await messageService.getUnreadCount(userId);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('获取未读消息数量失败:', error);
    res.status(500).json({
      success: false,
      message: '获取未读消息数量失败',
    });
  }
};

export const getMessageById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = String(req.user?.sub);

    const message = await messageService.getMessageById(id, userId);
    res.json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('获取消息详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取消息详情失败',
    });
  }
};

// 公告相关控制器
export const getAnnouncements = async (req: Request, res: Response) => {
  try {
    const userId = String(req.user?.sub);
    const { type, priority, page, limit } = req.query;

    const filters = {
      type: type as string,
      priority: priority as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    };

    const result = await announcementService.getUserAnnouncements(userId, filters);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('获取公告列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取公告列表失败',
    });
  }
};

export const getAnnouncementById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = String(req.user?.sub);

    const announcement = await announcementService.getAnnouncementById(id, userId);
    res.json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    console.error('获取公告详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取公告详情失败',
    });
  }
};

export const markAnnouncementAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = String(req.user?.sub);

    const result = await announcementService.markAnnouncementAsRead(id, userId);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('标记公告已读失败:', error);
    res.status(500).json({
      success: false,
      message: '标记公告已读失败',
    });
  }
};

// 管理员公告控制器
export const createAnnouncement = async (req: Request, res: Response) => {
  try {
    const creatorId = String(req.user?.sub);
    const { title, content, type, priority, publishAt, expireAt, targetUsers } = req.body;

    const announcement = await announcementService.createAnnouncement({
      title,
      content,
      type,
      priority,
      publishAt: publishAt ? new Date(publishAt) : undefined,
      expireAt: expireAt ? new Date(expireAt) : undefined,
      targetUsers,
    }, creatorId);

    res.json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    console.error('创建公告失败:', error);
    res.status(500).json({
      success: false,
      message: '创建公告失败',
    });
  }
};

export const updateAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updaterId = String(req.user?.sub);
    const { title, content, type, priority, publishAt, expireAt, targetUsers } = req.body;

    const announcement = await announcementService.updateAnnouncement(id, {
      title,
      content,
      type,
      priority,
      publishAt: publishAt ? new Date(publishAt) : undefined,
      expireAt: expireAt ? new Date(expireAt) : undefined,
      targetUsers,
    }, updaterId);

    res.json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    console.error('更新公告失败:', error);
    res.status(500).json({
      success: false,
      message: '更新公告失败',
    });
  }
};

export const deleteAnnouncement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleterId = String(req.user?.sub);

    const result = await announcementService.deleteAnnouncement(id, deleterId);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('删除公告失败:', error);
    res.status(500).json({
      success: false,
      message: '删除公告失败',
    });
  }
};

export const toggleAnnouncementStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const operatorId = String(req.user?.sub);
    const { isActive } = req.body;

    const announcement = await announcementService.toggleAnnouncementStatus(id, isActive, operatorId);
    res.json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    console.error('切换公告状态失败:', error);
    res.status(500).json({
      success: false,
      message: '切换公告状态失败',
    });
  }
};

export const getAnnouncementStats = async (_req: Request, res: Response) => {
  try {
    const stats = await announcementService.getAnnouncementStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('获取公告统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取公告统计失败',
    });
  }
};