/**
 * 服务器入口文件
 */

import express from 'express';
import { createServer } from 'http';
import { config, validateConfig } from './config';
import { connectDatabase } from './config/database';
import {
  corsMiddleware,
  helmetMiddleware,
  rateLimitMiddleware,
  compressionMiddleware,
  requestLogger,
  notFoundHandler,
  globalErrorHandler
} from './shared/middleware';
import routes from './routes';
import { webSocketService } from './features/communication/notification/websocket/websocket.service';
import { emailQueueService } from './features/communication/notification/email/email-queue.service';

const startServer = async () => {
  try {
    // 验证配置
    validateConfig();

    // 创建 Express 应用
    const app = express();

    // 基础中间件
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // 安全中间件
    app.use(corsMiddleware);
    app.use(helmetMiddleware);
    app.use(rateLimitMiddleware);
    app.use(compressionMiddleware);

    // 请求日志（仅开发环境）
    if (config.server.nodeEnv === 'development') {
      app.use(requestLogger);
    }

    // API 路由
    app.use('/api/v1', routes);

    // 错误处理中间件
    app.use(notFoundHandler);
    app.use(globalErrorHandler);

    // 连接数据库
    await connectDatabase();
    
    // 创建HTTP服务器
    const server = createServer(app);
    
    // 初始化WebSocket服务
    webSocketService.initialize(server);
    
    // 启动邮件队列处理器
    emailQueueService.start();
    
    // 启动服务器
    server.listen(config.server.port, () => {
      console.log(`🚀 Server is running on port ${config.server.port}`);
      console.log(`📝 Environment: ${config.server.nodeEnv}`);
      console.log(`🔗 API URL: http://localhost:${config.server.port}/api/v1`);
      console.log(`❤️  Health check: http://localhost:${config.server.port}/api/v1/health`);
      console.log(`🔌 WebSocket server initialized for real-time notifications`);
      console.log(`📧 Email queue processor started`);
    });

    // 优雅关闭
    const gracefulShutdown = (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('Server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// 启动应用
startServer();