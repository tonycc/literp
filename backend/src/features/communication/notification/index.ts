// 导出核心服务
export { notificationService } from './core/notification.service';

// 导出路由
export { notificationRoutes } from './core';

// 导出消息服务
export { messageService } from './messaging/message.service';
export { announcementService } from './messaging/announcement.service';

// 导出邮件服务
export { emailService } from './email/email.service';
export { emailQueueService } from './email/email-queue.service';

// 导出WebSocket服务
export { webSocketService } from './websocket/websocket.service';

// 导出类型
export type { CreateNotificationData, NotificationFilters } from './core/notification.service';
export type { CreateMessageData, MessageFilters } from './messaging/message.service';
export type { CreateAnnouncementData, AnnouncementFilters } from './messaging/announcement.service';
export type { EmailConfig, SendEmailData, CreateEmailTemplateData } from './email/email.service';