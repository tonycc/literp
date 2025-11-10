/**
 * Notification Management Feature Module
 * 通知管理功能模块
 */

// Components
export { default as NotificationCenter } from './components/NotificationCenter';
export { default as NotificationButton } from './components/NotificationButton';
export { default as AnnouncementManagement } from './components/AnnouncementManagement';
export { default as MessageManagement } from './components/MessageManagement';

// Pages
export { default as NotificationManagement } from './pages/NotificationManagement';

// Services
export * from './services/notification.service';
export * from './services/websocket.service';

// Types 已统一到 @fennec/shared