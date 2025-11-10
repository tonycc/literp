/**
 * 数据库客户端配置
 */

import { PrismaClient } from '@prisma/client';

// 创建 Prisma 客户端实例
export const prisma = new PrismaClient({
  log: ['error'],
});

// 数据库连接函数
export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// 数据库断开连接函数
export const disconnectDatabase = async () => {
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Database disconnection failed:', error);
  }
};

export default prisma;