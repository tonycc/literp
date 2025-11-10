/**
 * 重置管理员密码脚本
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetAdminPassword() {
  console.log('🔧 重置管理员密码...');

  try {
    const newPassword = 'admin123'; // 新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新管理员账户密码
    const updatedUser = await prisma.user.update({
      where: { username: 'admin' },
      data: { password: hashedPassword },
      select: { id: true, username: true, email: true }
    });

    console.log('✅ 管理员密码重置成功');
    console.log(`👤 用户名: ${updatedUser.username}`);
    console.log(`📧 邮箱: ${updatedUser.email}`);
    console.log(`🔑 新密码: ${newPassword}`);
    console.log('📋 请使用新密码登录');

  } catch (error) {
    console.error('❌ 重置管理员密码失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();