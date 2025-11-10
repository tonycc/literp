/**
 * 通知管理服务
 */

import apiClient from '../../../shared/services/api';
import type { ApiResponse, PaginatedResponse } from '@zyerp/shared';
import type {
  Notification,
  Message,
  Announcement,
  NotificationSearchParams,
  MessageSearchParams,
  AnnouncementSearchParams,
  CreateMessageRequest,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
  NotificationStats,
} from '@zyerp/shared';

class NotificationService {
  private readonly baseUrl = '/notifications';

  /**
   * 获取通知列表
   */
  async getNotifications(params?: NotificationSearchParams): Promise<PaginatedResponse<Notification>> {
    const response = await apiClient.get<PaginatedResponse<Notification>>(this.baseUrl, {
      params,
    });
    return response.data;
  }

  /**
   * 获取消息列表（收件箱）
   */
  async getMessages(params?: MessageSearchParams): Promise<PaginatedResponse<Message>> {
    const response = await apiClient.get<PaginatedResponse<Message>>(this.baseUrl, {
      params,
    });
    return response.data;
  }

  /**
   * 获取发件箱消息列表
   */
  async getSentMessages(params?: MessageSearchParams): Promise<PaginatedResponse<Message>> {
    const response = await apiClient.get<PaginatedResponse<Message>>(this.baseUrl, {
      params,
    });
    return response.data;
  }

  /**
   * 获取公告列表
   */
  async getAnnouncements(params?: AnnouncementSearchParams): Promise<PaginatedResponse<Announcement>> {
    const response = await apiClient.get<PaginatedResponse<Announcement>>('/announcements', {
      params,
    });
    return response.data;
  }

  /**
   * 获取通知统计
   */
  async getNotificationStats(): Promise<NotificationStats> {
    // 后端未提供 /notifications/stats；直接使用未读计数构造统计
    const unreadResp = await apiClient.get<ApiResponse<{ count: number }>>(`${this.baseUrl}/unread-count`);
    // 后端返回的是 { count: number } 对象，需要提取 count 值
    const unreadData = unreadResp.data.data;
    const unread = typeof unreadData === 'object' && unreadData && 'count' in unreadData 
      ? unreadData.count 
      : typeof unreadData === 'number' 
        ? unreadData 
        : 0;
    
    const stats: NotificationStats = {
      total: 0,
      unread,
      read: 0,
      today: 0,
      byType: { message: 0, announcement: 0, system: 0 },
      byPriority: { LOW: 0, MEDIUM: 0, HIGH: 0, URGENT: 0 },
    };
    return stats;
  }

  /**
   * 标记通知为已读
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    await apiClient.patch(`${this.baseUrl}/${notificationId}/read`);
  }

  /**
   * 批量标记通知为已读
   */
  async markMultipleAsRead(notificationIds: string[]): Promise<void> {
    await apiClient.patch(`${this.baseUrl}/batch-read`, {
      notificationIds,
    });
  }

  /**
   * 标记所有通知为已读
   */
  async markAllNotificationsAsRead(): Promise<void> {
    await apiClient.patch(`${this.baseUrl}/read-all`);
  }

  /**
   * 删除通知
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${notificationId}`);
  }

  /**
   * 批量删除通知
   */
  async deleteMultipleNotifications(notificationIds: string[]): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/batch-delete`, {
      data: { notificationIds },
    });
  }

  /**
   * 发送消息
   */
  async sendMessage(data: CreateMessageRequest): Promise<Message> {
    const response = await apiClient.post<ApiResponse<Message>>(`${this.baseUrl}/messages`, data);
    return response.data.data!;
  }

  /**
   * 标记消息为已读
   */
  async markMessageAsRead(messageId: string): Promise<void> {
    await apiClient.patch(`${this.baseUrl}/messages/${messageId}/read`);
  }

  /**
   * 删除消息
   */
  async deleteMessage(messageId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/messages/${messageId}`);
  }

  /**
   * 创建公告
   */
  async createAnnouncement(data: CreateAnnouncementRequest): Promise<Announcement> {
    const response = await apiClient.post<ApiResponse<Announcement>>('/announcements', data);
    return response.data.data!;
  }

  /**
   * 更新公告
   */
  async updateAnnouncement(announcementId: string, data: UpdateAnnouncementRequest): Promise<Announcement> {
    const response = await apiClient.put<ApiResponse<Announcement>>(`/announcements/${announcementId}`, data);
    return response.data.data!;
  }

  /**
   * 删除公告
   */
  async deleteAnnouncement(announcementId: string): Promise<void> {
    await apiClient.delete(`/announcements/${announcementId}`);
  }

  /**
   * 获取公告详情
   */
  async getAnnouncementById(announcementId: string): Promise<Announcement> {
    const response = await apiClient.get<ApiResponse<Announcement>>(`/announcements/${announcementId}`);
    return response.data.data!;
  }

  /**
   * 标记公告为已读
   */
  async markAnnouncementAsRead(announcementId: string): Promise<void> {
    await apiClient.patch(`/announcements/${announcementId}/read`);
  }

  /**
   * 激活/停用公告
   */
  async toggleAnnouncementStatus(announcementId: string, isActive: boolean): Promise<Announcement> {
    const response = await apiClient.patch<ApiResponse<Announcement>>(`/announcements/${announcementId}/status`, {
      isActive,
    });
    return response.data.data!;
  }
}

export const notificationService = new NotificationService();
export default notificationService;