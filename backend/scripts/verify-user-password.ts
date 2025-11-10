/**
 * 验证用户密码脚本
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function verifyUserCredentials(username: string, plainPassword: string) {
  try {
    console.log(`🔍 验证用户 ${username} 的凭据...`);
    
    // 查询用户
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        isActive: true,
      }
    });
    
    if (!user) {
      console.log(`❌ 用户 ${username} 不存在`);
      return false;
    }
    
    if (!user.isActive) {
      console.log(`❌ 用户 ${username} 已停用`);
      return false;
    }
    
    // 验证密码
    const isPasswordValid = await bcrypt.compare(plainPassword, user.password);
    
    if (isPasswordValid) {
      console.log(`✅ 用户 ${username} 凭据验证成功`);
      console.log(`  👤 用户ID: ${user.id}`);
      console.log(`  📧 邮箱: ${user.email}`);
      return true;
    } else {
      console.log(`❌ 用户 ${username} 密码不正确`);
      return false;
    }
    
  } catch (error) {
    console.error('❌ 验证用户凭据失败:', error.message);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// 测试不同账户的默认密码
async function testDefaultCredentials() {
  console.log('🧪 测试默认账户凭据...\n');
  
  // 测试管理员账户
  await verifyUserCredentials('admin', 'admin');
  console.log('');
  
  // 测试部门管理员账户
  await verifyUserCredentials('deptmanager', 'deptmanager');
  console.log('');
  
  // 测试普通用户账户
  await verifyUserCredentials('testuser', 'testuser');
  console.log('');
  
  // 尝试一些常见的默认密码
  console.log('🔍 尝试常见默认密码...');
  await verifyUserCredentials('admin', 'admin123');
  console.log('');
  await verifyUserCredentials('admin', 'password');
  console.log('');
  await verifyUserCredentials('admin', '');
  console.log('');
}

testDefaultCredentials();