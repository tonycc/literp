/**
 * Notification Types (shared)
 * 通知相关的共享类型定义
 */

export interface Notification {
  id: string;
  type: 'message' | 'announcement' | 'system';
  title: string;
  content: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  isRead: boolean;
  readAt?: string;
  userId: string;
  senderId?: string;
  senderName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  title: string;
  content: string;
  senderId: string;
  receiverId: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: string;
    username: string;
  };
  receiver?: {
    id: string;
    username: string;
  };
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  isActive: boolean;
  publishAt: string;
  expireAt?: string;
  targetUsers?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSearchParams {
  page?: number;
  limit?: number;
  type?: string;
  priority?: string;
  isRead?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface MessageSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  isRead?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AnnouncementSearchParams {
  page?: number;
  limit?: number;
  type?: string;
  priority?: string;
  isActive?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateMessageRequest {
  title: string;
  content: string;
  receiverId: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  type: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  publishAt: string;
  expireAt?: string;
  targetUsers?: string;
}

export interface UpdateAnnouncementRequest {
  title?: string;
  content?: string;
  type?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  isActive?: boolean;
  publishAt?: string;
  expireAt?: string;
  targetUsers?: string;
}

export interface WebSocketNotification {
  id: string;
  type: 'message' | 'announcement' | 'system';
  title: string;
  content: string;
  data?: Record<string, unknown>;
  userId: string;
  createdAt: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  today: number;
  byType: {
    message: number;
    announcement: number;
    system: number;
  };
  byPriority: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    URGENT: number;
  };
}