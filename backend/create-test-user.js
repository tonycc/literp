const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('开始创建测试用户...');
    
    // 检查是否已存在测试用户
    const existingUser = await prisma.user.findUnique({
      where: { username: 'testuser' }
    });
    
    if (existingUser) {
      console.log('✅ 测试用户已存在');
      console.log('用户ID:', existingUser.id);
      console.log('用户名:', existingUser.username);
      return existingUser;
    }
    
    // 创建密码哈希
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    // 创建测试用户
    const testUser = await prisma.user.create({
      data: {
        username: 'testuser',
        email: 'test@example.com',
        password: hashedPassword,
        name: '测试用户',
        isActive: true,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    console.log('✅ 测试用户创建成功!');
    console.log('用户ID:', testUser.id);
    console.log('用户名:', testUser.username);
    console.log('邮箱:', testUser.email);
    
    return testUser;
    
  } catch (error) {
    console.error('❌ 创建测试用户失败:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();