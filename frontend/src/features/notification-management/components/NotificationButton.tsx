/**
 * 通知按钮组件
 */

import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { notificationService } from '../services/notification.service';
import { webSocketNotificationService } from '../services/websocket.service';
import NotificationCenter from './NotificationCenter';
import type { NotificationStats, WebSocketNotification } from '@zyerp/shared';

const NotificationButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState<NotificationStats | null>(null);

  // 加载统计信息
  const loadStats = async () => {
    try {
      const statsData = await notificationService.getNotificationStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load notification stats:', error);
    }
  };

  // 处理WebSocket通知
  const handleWebSocketNotification = (notification: WebSocketNotification) => {
    // 更新统计信息
    loadStats();

    // 显示浏览器通知
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.content,
        icon: '/favicon.ico',
      });
    }
  };

  // 初始化
  useEffect(() => {
    loadStats();

    // 连接WebSocket
    webSocketNotificationService.connect();
    const unsubscribeNotification = webSocketNotificationService.onNotification(handleWebSocketNotification);
    const unsubscribeAnnouncement = webSocketNotificationService.onAnnouncement(handleWebSocketNotification);

    // 请求浏览器通知权限
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      unsubscribeNotification();
      unsubscribeAnnouncement();
    };
  }, []);

  const toggleNotificationCenter = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        onClick={toggleNotificationCenter}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        title="通知中心"
      >
        <Bell className="w-6 h-6" />
        {stats && stats.unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {stats.unread > 99 ? '99+' : stats.unread}
          </span>
        )}
      </button>

      <NotificationCenter 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
};

export default NotificationButton;