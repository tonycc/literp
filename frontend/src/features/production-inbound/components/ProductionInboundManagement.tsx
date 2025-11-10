import React, { useState } from 'react';
import { Modal, message } from 'antd';
import ProductionInboundList from './ProductionInboundList';
import ProductionInboundForm from './ProductionInboundForm';
import type { ProductionInboundFormData } from '../types';

const ProductionInboundManagement: React.FC = () => {
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // 显示新增弹窗
  const handleAdd = () => {
    setAddModalVisible(true);
  };

  // 关闭新增弹窗
  const handleAddCancel = () => {
    setAddModalVisible(false);
  };

  // 提交新增表单
  const handleAddSubmit = async (data: ProductionInboundFormData) => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('新增生产入库记录:', data);
      message.success('生产入库记录创建成功');
      setAddModalVisible(false);
      
      // 这里可以触发列表刷新
      // 实际项目中可以通过状态管理或回调函数来刷新列表
    } catch {
      message.error('创建失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ProductionInboundList onAdd={handleAdd} />
      
      <Modal
        title="新增生产入库"
        open={addModalVisible}
        onCancel={handleAddCancel}
        footer={null}
        width={900}
        destroyOnHidden
      >
        <ProductionInboundForm
          onSubmit={handleAddSubmit}
          onCancel={handleAddCancel}
          loading={loading}
        />
      </Modal>
    </div>
  );
};

export default ProductionInboundManagement;