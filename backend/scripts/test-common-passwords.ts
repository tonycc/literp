/**
 * 测试常见密码脚本
 */

import bcrypt from 'bcryptjs';

// 常见的默认密码列表
const commonPasswords = [
  'admin',
  'admin123',
  'password',
  '123456',
  '12345678',
  'qwerty',
  'abc123',
  'welcome',
  'demo',
  'test',
  'test123',
  'root',
  'toor',
  'pass',
  'password123',
  'admin@123',
  'Admin@123',
  'P@ssw0rd',
  'P@ssword',
  'Passw0rd'
];

// 种子数据中的加密密码
const hashedPasswords = [
  { username: 'admin', hash: '$2a$12$D5QzXzPr7QRmrWC66cEZcOh/NrG1rAGiN76DLCcAZ45kjhwMsn63a' },
  { username: 'deptmanager', hash: '$2a$12$biUiWKpVVDZ3atEwBPteA.zNo0V6s8yOxGUanFWXapcd/gf6dG7IO' },
  { username: 'testuser', hash: '$2a$12$G0B6RpJVtXGnDeQ0zf2eN.LlITkWoRC9PmxZTWco7.31t5wqUgFvO' }
];

async function testCommonPasswords() {
  console.log('🔍 测试常见密码...\n');
  
  for (const { username, hash } of hashedPasswords) {
    console.log(`👤 测试用户: ${username}`);
    let found = false;
    
    for (const password of commonPasswords) {
      const isMatch = await bcrypt.compare(password, hash);
      if (isMatch) {
        console.log(`  ✅ 找到正确密码: ${password}`);
        found = true;
        break;
      }
    }
    
    if (!found) {
      console.log(`  ❌ 未找到匹配的密码`);
    }
    
    console.log('');
  }
}

testCommonPasswords();