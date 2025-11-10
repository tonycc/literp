import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId?: string;  // HTTP认证中使用的字段
  sub?: string;     // WebSocket认证中的备用字段
  username: string;
  roles: string[];
  permissions?: string[];
}

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

interface NotificationData {
  id: string;
  type: 'message' | 'announcement' | 'system';
  title: string;
  content: string;
  priority?: string;
  senderId?: string;
  senderName?: string;
  createdAt: Date;
  isRead: boolean;
}

class WebSocketService {
  private io: SocketIOServer | null = null;
  private connectedUsers = new Map<string, Set<string>>(); // userId -> Set of socketIds
  private userSockets = new Map<string, AuthenticatedSocket>(); // socketId -> socket

  /**
   * 初始化WebSocket服务
   */
  initialize(server: HttpServer): void {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  /**
   * 设置中间件
   */
  private setupMiddleware(): void {
    if (!this.io) return;

    // JWT认证中间件
    this.io.use((socket: any, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        // 支持多种用户ID字段格式，与HTTP认证保持一致
        socket.userId = String((decoded as any).userId || decoded.sub);
        socket.username = decoded.username;
        
        next();
      } catch (error) {
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  /**
   * 设置事件处理器
   */
  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`用户 ${socket.username} (${socket.userId}) 已连接 WebSocket`);

      // 加入用户房间
      if (socket.userId) {
        socket.join(`user_${socket.userId}`);
        
        // 记录连接
        if (!this.connectedUsers.has(socket.userId)) {
          this.connectedUsers.set(socket.userId, new Set());
        }
        this.connectedUsers.get(socket.userId)!.add(socket.id);
        this.userSockets.set(socket.id, socket);

        // 发送连接成功消息
        socket.emit('connected', {
          message: '实时通知连接成功',
          userId: socket.userId,
          timestamp: new Date().toISOString()
        });
      }

      // 处理断开连接
      socket.on('disconnect', () => {
        console.log(`用户 ${socket.username} (${socket.userId}) 已断开 WebSocket 连接`);
        
        if (socket.userId) {
          const userSockets = this.connectedUsers.get(socket.userId);
          if (userSockets) {
            userSockets.delete(socket.id);
            if (userSockets.size === 0) {
              this.connectedUsers.delete(socket.userId);
            }
          }
        }
        this.userSockets.delete(socket.id);
      });

      // 处理加入特定房间
      socket.on('join_room', (roomName: string) => {
        socket.join(roomName);
        socket.emit('joined_room', { room: roomName });
      });

      // 处理离开特定房间
      socket.on('leave_room', (roomName: string) => {
        socket.leave(roomName);
        socket.emit('left_room', { room: roomName });
      });

      // 处理标记通知已读
      socket.on('mark_notification_read', (notificationId: string) => {
        // 这里可以调用通知服务的标记已读方法
        socket.emit('notification_marked_read', { notificationId });
      });
    });
  }

  /**
   * 向特定用户发送通知
   */
  sendNotificationToUser(userId: string, notification: NotificationData): void {
    if (!this.io) return;

    this.io.to(`user_${userId}`).emit('new_notification', notification);
  }

  /**
   * 向多个用户发送通知
   */
  sendNotificationToUsers(userIds: string[], notification: NotificationData): void {
    if (!this.io) return;

    userIds.forEach(userId => {
      this.sendNotificationToUser(userId, notification);
    });
  }

  /**
   * 向所有在线用户发送公告
   */
  broadcastAnnouncement(announcement: NotificationData): void {
    if (!this.io) return;

    this.io.emit('new_announcement', announcement);
  }

  /**
   * 向特定房间发送消息
   */
  sendToRoom(roomName: string, event: string, data: any): void {
    if (!this.io) return;

    this.io.to(roomName).emit(event, data);
  }

  /**
   * 获取在线用户数量
   */
  getOnlineUserCount(): number {
    return this.connectedUsers.size;
  }

  /**
   * 获取特定用户是否在线
   */
  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  /**
   * 获取所有在线用户ID
   */
  getOnlineUserIds(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  /**
   * 强制断开用户连接
   */
  disconnectUser(userId: string): void {
    const userSockets = this.connectedUsers.get(userId);
    if (userSockets) {
      userSockets.forEach(socketId => {
        const socket = this.userSockets.get(socketId);
        if (socket) {
          socket.disconnect();
        }
      });
    }
  }

  /**
   * 发送系统维护通知
   */
  sendMaintenanceNotification(message: string, disconnectAfter = false): void {
    if (!this.io) return;

    this.io.emit('system_maintenance', {
      message,
      timestamp: new Date().toISOString(),
      disconnectAfter
    });

    if (disconnectAfter) {
      setTimeout(() => {
        this.io?.disconnectSockets();
      }, 5000); // 5秒后断开所有连接
    }
  }

  /**
   * 获取WebSocket服务实例
   */
  getIO(): SocketIOServer | null {
    return this.io;
  }
}

// 导出单例实例
export const webSocketService = new WebSocketService();
export default webSocketService;