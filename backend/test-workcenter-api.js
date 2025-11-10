/**
 * 工作中心API测试脚本
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

async function testWorkcenterAPI() {
  console.log('开始测试工作中心API...');
  
  try {
    // 测试获取工作中心列表
    console.log('1. 测试获取工作中心列表...');
    const listResponse = await axios.get(`${API_BASE_URL}/workcenters`);
    console.log('获取工作中心列表成功:', listResponse.data);
    
    // 测试获取工作中心选项
    console.log('2. 测试获取工作中心选项...');
    const optionsResponse = await axios.get(`${API_BASE_URL}/workcenters/options`);
    console.log('获取工作中心选项成功:', optionsResponse.data);
    
    // 测试创建工作中心
    console.log('3. 测试创建工作中心...');
    const createData = {
      code: 'TEST001',
      name: '测试工作中心',
      type: 'TEAM',
      description: '用于测试的工作中心'
    };
    
    const createResponse = await axios.post(`${API_BASE_URL}/workcenters`, createData);
    console.log('创建工作中心成功:', createResponse.data);
    
    const workcenterId = createResponse.data.data.id;
    
    // 测试获取单个工作中心
    console.log('4. 测试获取单个工作中心...');
    const getResponse = await axios.get(`${API_BASE_URL}/workcenters/${workcenterId}`);
    console.log('获取单个工作中心成功:', getResponse.data);
    
    // 测试更新工作中心
    console.log('5. 测试更新工作中心...');
    const updateData = {
      name: '更新后的测试工作中心',
      description: '更新后的描述'
    };
    
    const updateResponse = await axios.put(`${API_BASE_URL}/workcenters/${workcenterId}`, updateData);
    console.log('更新工作中心成功:', updateResponse.data);
    
    // 测试删除工作中心
    console.log('6. 测试删除工作中心...');
    const deleteResponse = await axios.delete(`${API_BASE_URL}/workcenters/${workcenterId}`);
    console.log('删除工作中心成功:', deleteResponse.data);
    
    console.log('所有测试完成！');
    
  } catch (error) {
    console.error('测试过程中发生错误:', error.response?.data || error.message);
  }
}

// 运行测试
testWorkcenterAPI();