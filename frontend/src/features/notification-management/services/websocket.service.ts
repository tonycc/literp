/**
 * WebSocket 通知服务
 */

import { io, Socket } from 'socket.io-client';
import type { WebSocketNotification } from '@zyerp/shared';

type NotificationHandler = (notification: WebSocketNotification) => void;
type AnnouncementHandler = (announcement: WebSocketNotification) => void;
type ConnectionHandler = () => void;
type ErrorHandler = (error: Error) => void;

class WebSocketNotificationService {
  private socket: Socket | null = null;
  private isConnected = false;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  // 事件处理器
  private notificationHandlers: NotificationHandler[] = [];
  private announcementHandlers: AnnouncementHandler[] = [];
  private connectionHandlers: ConnectionHandler[] = [];
  private disconnectionHandlers: ConnectionHandler[] = [];
  private errorHandlers: ErrorHandler[] = [];

  /**
   * 连接到WebSocket服务器
   */
  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      console.warn('No access token found, cannot connect to WebSocket');
      return;
    }

    const serverUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3000';
    
    this.socket = io(serverUrl, {
      auth: {
        token,
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.setupEventListeners();
  }

  /**
   * 断开WebSocket连接
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    // 连接成功
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.connectionHandlers.forEach(handler => handler());
    });

    // 连接断开
    this.socket.on('disconnect', (reason: string) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnected = false;
      this.disconnectionHandlers.forEach(handler => handler());
    });

    // 连接错误
    this.socket.on('connect_error', (error: Error) => {
      console.error('WebSocket connection error:', error);
      this.errorHandlers.forEach(handler => handler(error));
    });

    // 认证错误
    this.socket.on('auth_error', (error: string) => {
      console.error('WebSocket authentication error:', error);
      this.errorHandlers.forEach(handler => handler(new Error(error)));
    });

    // 接收通知
    this.socket.on('notification', (notification: WebSocketNotification) => {
      console.log('Received notification:', notification);
      this.notificationHandlers.forEach(handler => handler(notification));
    });

    // 接收公告
    this.socket.on('announcement', (announcement: WebSocketNotification) => {
      console.log('Received announcement:', announcement);
      this.announcementHandlers.forEach(handler => handler(announcement));
    });

    // 重连成功
    this.socket.on('reconnect', (attemptNumber: number) => {
      console.log(`WebSocket reconnected after ${attemptNumber} attempts`);
      this.isConnected = true;
    });

    // 重连失败
    this.socket.on('reconnect_failed', () => {
      console.error('WebSocket reconnection failed');
      this.isConnected = false;
    });
  }

  /**
   * 添加通知处理器
   */
  onNotification(handler: NotificationHandler): () => void {
    this.notificationHandlers.push(handler);
    return () => {
      const index = this.notificationHandlers.indexOf(handler);
      if (index > -1) {
        this.notificationHandlers.splice(index, 1);
      }
    };
  }

  /**
   * 添加公告处理器
   */
  onAnnouncement(handler: AnnouncementHandler): () => void {
    this.announcementHandlers.push(handler);
    return () => {
      const index = this.announcementHandlers.indexOf(handler);
      if (index > -1) {
        this.announcementHandlers.splice(index, 1);
      }
    };
  }

  /**
   * 添加连接处理器
   */
  onConnect(handler: ConnectionHandler): () => void {
    this.connectionHandlers.push(handler);
    return () => {
      const index = this.connectionHandlers.indexOf(handler);
      if (index > -1) {
        this.connectionHandlers.splice(index, 1);
      }
    };
  }

  /**
   * 添加断开连接处理器
   */
  onDisconnect(handler: ConnectionHandler): () => void {
    this.disconnectionHandlers.push(handler);
    return () => {
      const index = this.disconnectionHandlers.indexOf(handler);
      if (index > -1) {
        this.disconnectionHandlers.splice(index, 1);
      }
    };
  }

  /**
   * 添加错误处理器
   */
  onError(handler: ErrorHandler): () => void {
    this.errorHandlers.push(handler);
    return () => {
      const index = this.errorHandlers.indexOf(handler);
      if (index > -1) {
        this.errorHandlers.splice(index, 1);
      }
    };
  }

  /**
   * 获取连接状态
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * 手动重连
   */
  reconnect(): void {
    if (this.socket) {
      this.socket.connect();
    } else {
      this.connect();
    }
  }
}

export const webSocketNotificationService = new WebSocketNotificationService();
export default webSocketNotificationService;