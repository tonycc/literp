/**
 * Express 应用主文件
 */

import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { config, validateConfig } from './config';
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
import { swaggerSpec } from './docs/swagger';

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

// 请求日志
if (config.server.nodeEnv === 'development') {
  app.use(requestLogger);
}

// API 路由
app.use('/api/v1', routes);

// Swagger API 文档
if (config.server.nodeEnv === 'development') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// 404 处理
app.use(notFoundHandler);

// 全局错误处理
app.use(globalErrorHandler);

// 启动服务器


export default app;