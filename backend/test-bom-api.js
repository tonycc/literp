const { BomService } = require('./src/features/business/bom/bom.service');

async function testBomAPI() {
  try {
    console.log('开始测试BOM API...');
    
    const bomService = new BomService();
    
    // 测试getBoms方法
    const query = {
      page: 1,
      pageSize: 20
    };
    
    console.log('调用getBoms方法...');
    const result = await bomService.getBoms(query);
    
    console.log('API结果:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ API调用成功');
      console.log('数据数量:', result.data?.length || 0);
      console.log('分页信息:', result.pagination);
    } else {
      console.log('❌ API调用失败:', result.message);
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testBomAPI();