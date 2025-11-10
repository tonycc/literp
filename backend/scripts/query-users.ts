/**
 * 查询用户信息脚本
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getUserInfo() {
  try {
    console.log('🔍 查询用户信息...');
    
    // 查询所有用户
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        isActive: true,
      }
    });
    
    console.log('📋 用户列表:');
    users.forEach(user => {
      console.log(`  👤 用户名: ${user.username}, 邮箱: ${user.email}, 激活状态: ${user.isActive ? '✅' : '❌'}`);
    });
    
  } catch (error) {
    console.error('❌ 查询用户信息失败:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

getUserInfo();