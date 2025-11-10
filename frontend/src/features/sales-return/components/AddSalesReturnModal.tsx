import React, { useState } from 'react';
import { Modal, Form, message } from 'antd';
import SalesReturnForm from './SalesReturnForm';
import type { SalesReturnFormData, SalesReturn, ReturnProduct } from '../types';

interface AddSalesReturnModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: (data: SalesReturnFormData) => void;
  editData?: Partial<SalesReturnFormData>;
}

const AddSalesReturnModal: React.FC<AddSalesReturnModalProps> = ({
  open,
  onCancel,
  onSuccess,
  editData
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 处理确认提交
  const handleOk = async () => {
    try {
      setLoading(true);
      
      // 验证表单
      await form.validateFields();
      
      // 获取表单数据（包含退货产品）
      const extendedForm = form as typeof form & { getFormData?: () => SalesReturnFormData };
      const formData = extendedForm.getFormData?.() || form.getFieldsValue();
      
      // 验证是否选择了原销售单
      if (!formData.originalSalesNumber) {
        message.error('请选择原销售单号');
        return;
      }
      
      // 验证是否有退货产品
      if (!formData.products || formData.products.length === 0) {
        message.error('请选择要退货的产品');
        return;
      }
      
      // 验证退货数量
      const hasValidProducts = formData.products.some((product: ReturnProduct) => product.returnQuantity > 0);
      if (!hasValidProducts) {
        message.error('请输入退货数量');
        return;
      }
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 构造完整的退货单数据
      const returnData: SalesReturn = {
        ...formData,
        id: `return_${Date.now()}`,
        status: 'pending' as const,
        totalAmount: formData.products.reduce((sum: number, product: ReturnProduct) => sum + product.totalAmount, 0),
        products: formData.products.map((product: ReturnProduct, index: number) => ({
          ...product,
          id: `product_${index + 1}`
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      message.success(editData ? '修改退货单成功' : '新增退货单成功');
      onSuccess(returnData);
      handleCancel();
      
    } catch (error) {
      console.error('提交失败:', error);
      if (error instanceof Error) {
        message.error(`提交失败: ${error.message}`);
      } else {
        message.error('提交失败，请重试');
      }
    } finally {
      setLoading(false);
    }
  };

  // 处理取消
  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={editData ? '编辑退货单' : '新增退货单'}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      width={1200}
      style={{ top: 20 }}
      okText="确认"
      cancelText="取消"
      destroyOnHidden
    >
      <SalesReturnForm 
        form={form} 
        editData={editData}
      />
    </Modal>
  );
};

export default AddSalesReturnModal;