/**
 * 服务器入口文件 - 简化版本，无WebSocket和邮件队列
 */

import express from 'express';
import { config, validateConfig } from './src/config';
import { connectDatabase } from './src/config/database';
import {
  corsMiddleware,
  helmetMiddleware,
  rateLimitMiddleware,
  compressionMiddleware,
  requestLogger,
  notFoundHandler,
  globalErrorHandler
} from './src/shared/middleware';
import routes from './src/routes';

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

    // 健康检查路由
    app.get('/api/v1/health', (_req, res) => {
      res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    });

    // 错误处理中间件
    app.use(notFoundHandler);
    app.use(globalErrorHandler);

    // 连接数据库
    await connectDatabase();
    
    // 启动服务器
    app.listen(config.server.port, () => {
      console.log(`🚀 Server is running on port ${config.server.port}`);
      console.log(`📝 Environment: ${config.server.nodeEnv}`);
      console.log(`🔗 API URL: http://localhost:${config.server.port}/api/v1`);
      console.log(`❤️  Health check: http://localhost:${config.server.port}/api/v1/health`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// 启动应用
startServer();