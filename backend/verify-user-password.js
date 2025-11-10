const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function verifyAndResetPassword() {
  try {
    console.log('开始验证用户密码...');
    
    // 查找测试用户
    const user = await prisma.user.findUnique({
      where: { username: 'testuser' },
      select: { id: true, username: true, password: true, isActive: true }
    });
    
    if (!user) {
      console.log('❌ 用户不存在');
      return;
    }
    
    console.log('✅ 找到用户:', user.username);
    console.log('用户状态:', user.isActive ? '激活' : '未激活');
    console.log('密码哈希:', user.password);
    
    // 验证当前密码
    const isValidPassword = await bcrypt.compare('test123', user.password);
    console.log('密码验证结果:', isValidPassword ? '✅ 正确' : '❌ 错误');
    
    if (!isValidPassword) {
      console.log('重新设置密码...');
      const newHashedPassword = await bcrypt.hash('test123', 10);
      
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          password: newHashedPassword,
          isActive: true
        }
      });
      
      console.log('✅ 密码重置成功!');
      console.log('新密码哈希:', newHashedPassword);
    }
    
  } catch (error) {
    console.error('❌ 操作失败:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

verifyAndResetPassword();