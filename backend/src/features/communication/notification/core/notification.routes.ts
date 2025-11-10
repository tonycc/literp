import { Router } from 'express';
import { authenticateToken, requireRoles } from '../../../../shared/middleware';
import * as notificationController from './notification.controller';

const router = Router();

// 所有通知路由都需要认证
router.use(authenticateToken);

// 通知相关路由
router.get('/', notificationController.getNotifications);
router.patch('/:id/read', notificationController.markNotificationAsRead);
router.patch('/read-all', notificationController.markAllNotificationsAsRead);
router.delete('/:id', notificationController.deleteNotification);
router.get('/unread-count', notificationController.getUnreadNotificationCount);

// 消息相关路由
router.get('/messages', notificationController.getMessages);
router.get('/messages/inbox', notificationController.getInbox);
router.get('/messages/sent', notificationController.getSentMessages);
router.post('/messages', notificationController.sendMessage);
router.patch('/messages/:id/read', notificationController.markMessageAsRead);
router.patch('/messages/read-all', notificationController.markAllMessagesAsRead);
router.delete('/messages/:id', notificationController.deleteMessage);
router.get('/messages/unread-count', notificationController.getUnreadMessageCount);
router.get('/messages/:id', notificationController.getMessageById);

// 公告相关路由
router.get('/announcements', notificationController.getAnnouncements);
router.get('/announcements/:id', notificationController.getAnnouncementById);
router.patch('/announcements/:id/read', notificationController.markAnnouncementAsRead);

// 管理员公告路由 - 需要管理员权限
router.post('/announcements', requireRoles(['系统管理员']), notificationController.createAnnouncement);
router.put('/announcements/:id', requireRoles(['系统管理员']), notificationController.updateAnnouncement);
router.delete('/announcements/:id', requireRoles(['系统管理员']), notificationController.deleteAnnouncement);
router.patch('/announcements/:id/status', requireRoles(['系统管理员']), notificationController.toggleAnnouncementStatus);
router.get('/announcements/stats', requireRoles(['系统管理员']), notificationController.getAnnouncementStats);

export default router;