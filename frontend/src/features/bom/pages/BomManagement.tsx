import React, { useState, useEffect } from 'react';
import { Modal, Form } from 'antd';
import type { ProductBom, BomFormData, BomItem } from '@zyerp/shared';

import BomList from '../components/BomList';
import BomForm from '../components/BomForm';
import BomDetail from '../components/BomDetail';
import BomVersionManager from '../components/BomVersionManager';
import BomCostCalculator from '../components/BomCostCalculator';
import BomCreatePage from '../components/BomCreatePage';
import { useBom } from '../hooks/useBom';
import { useMessage } from '../../../shared/hooks';
import { bomService } from '../services/bom.service';

const BomManagement: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [isVersionManagerVisible, setIsVersionManagerVisible] = useState(false);
  const [isCostCalculatorVisible, setIsCostCalculatorVisible] = useState(false);
  const [editingBom, setEditingBom] = useState<ProductBom | null>(null);
  const [viewingBom, setViewingBom] = useState<ProductBom | null>(null);
  const [bomItems, setBomItems] = useState<BomItem[]>([]);
  
  const { 
    boms,
    loading,
    fetchBoms, 
    fetchSelectOptions,
    updateBom,
    deleteBom,
    products,
    units
  } = useBom();
  
  const [form] = Form.useForm();
  const message = useMessage();

  // 初始化加载数据
  useEffect(() => {
    fetchBoms();
    fetchSelectOptions();
  }, [fetchBoms, fetchSelectOptions]);

  // 新增BOM
  const handleAddBom = () => {
    setEditingBom(null);
    setIsModalVisible(true);
  };

  // 编辑BOM
  const handleEditBom = (bom: ProductBom) => {
    setEditingBom(bom);
    form.setFieldsValue({
      ...bom,
      effectiveDate: bom.effectiveDate ? new Date(bom.effectiveDate) : null,
      expiryDate: bom.expiryDate ? new Date(bom.expiryDate) : null,
      baseUnitId: bom.baseUnitId
    });
    setIsModalVisible(true);
  };

  // 查看BOM详情
  const handleViewBom = async (bom: ProductBom) => {
    setViewingBom(bom);
    // 加载BOM物料项
    try {
      const response = await bomService.getBomItemsFlattened(bom.id);
      setBomItems(response.data || []);
    } catch (error) {
      console.error('加载BOM物料项失败:', error);
      setBomItems([]);
    }
    setIsDetailVisible(true);
  };

  // 复制BOM
  const handleCopyBom = (bom: ProductBom) => {
    setEditingBom(null);
    form.setFieldsValue({
      ...bom,
      code: `${bom.code}_COPY`,
      name: `${bom.name}_副本`,
      version: 'V1.0',
      isDefault: false,
      effectiveDate: new Date(),
      expiryDate: undefined
    });
    setIsModalVisible(true);
  };

  // 保存BOM (仅用于编辑模式)
  const handleSaveBom = async () => {
    if (!editingBom) return;
    
    try {
      const values = await form.validateFields();
      const bomData: BomFormData = {
        ...values,
        effectiveDate: values.effectiveDate,
        expiryDate: values.expiryDate
      };

      // 更新BOM
      await updateBom(editingBom.id, bomData);

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败');
    }
  };

  // 删除BOM
  const handleDeleteBom = async (bomId: string) => {
    await deleteBom(bomId);
  };

  // 显示版本管理
  const handleShowVersionManager = () => {
    setIsVersionManagerVisible(true);
  };

  // 显示成本计算
  const handleShowCostCalculator = () => {
    setIsCostCalculatorVisible(true);
  };

  return (
    <div>
      <BomList
        boms={boms}
        loading={loading}
        onEdit={handleEditBom}
        onView={handleViewBom}
        onAdd={handleAddBom}
        onRefresh={fetchBoms}
        onCopy={handleCopyBom}
        onDelete={handleDeleteBom}
        onShowVersionManager={handleShowVersionManager}
        onShowCostCalculator={handleShowCostCalculator}
      />

      {/* BOM编辑模态框 */}
      <Modal
        title={editingBom ? '编辑BOM' : '新建BOM'}
        open={isModalVisible}
        onOk={editingBom ? handleSaveBom : undefined}
        onCancel={() => setIsModalVisible(false)}
        width="80%"
        destroyOnHidden
        footer={editingBom ? undefined : null}
      >
        {editingBom ? (
          <BomForm
            form={form}
            initialValues={editingBom || undefined}
            products={products}
            units={units}
            routings={[]}
          />
        ) : (
          <BomCreatePage
            onSuccess={() => {
              setIsModalVisible(false);
              fetchBoms();
            }}
            onCancel={() => setIsModalVisible(false)}
          />
        )}
      </Modal>

      {/* BOM详情弹窗 */}
      <Modal
        title={`BOM详情 - ${viewingBom?.name || ''}`}
        open={isDetailVisible}
        onCancel={() => setIsDetailVisible(false)}
        width={1200}
        footer={null}
        destroyOnHidden
      >
        {viewingBom && (
          <BomDetail
            bom={viewingBom}
            items={bomItems}
          />
        )}
      </Modal>

      {/* 版本管理模态框 */}
      <Modal
        title="版本管理"
        open={isVersionManagerVisible}
        onCancel={() => setIsVersionManagerVisible(false)}
        width="90%"
        footer={null}
        destroyOnHidden
      >
        <BomVersionManager />
      </Modal>

      {/* 成本计算模态框 */}
      <Modal
        title="成本计算"
        open={isCostCalculatorVisible}
        onCancel={() => setIsCostCalculatorVisible(false)}
        width="90%"
        footer={null}
        destroyOnHidden
      >
        <BomCostCalculator />
      </Modal>
    </div>
  );
};

export default BomManagement;