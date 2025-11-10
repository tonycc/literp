import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';
import OperationList from '../components/OperationList';
import OperationForm from '../components/OperationForm';
import OperationDetail from '../components/OperationDetail';
import { useOperation } from '../hooks/useOperation';
import type { OperationInfo, OperationFormData } from '@zyerp/shared';
import { Form } from 'antd';

const OperationManagement: React.FC = () => {
  // 状态管理
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [editingOperation, setEditingOperation] = useState<OperationInfo | undefined>();
  const [viewingOperation, setViewingOperation] = useState<OperationInfo | undefined>();
  const [form] = Form.useForm();

  // 使用业务逻辑hook
  const {
    operations,
    loading,
    total,
    page,
    pageSize,
    fetchOperations,
    createOperation,
    updateOperation,
    deleteOperation,
    handlePageChange,
  } = useOperation();

  // 初始化加载数据
  useEffect(() => {
    fetchOperations();
  }, [fetchOperations]);

  // 处理新增工序
  const handleAddOperation = () => {
    setEditingOperation(undefined);
    setIsModalVisible(true);
  };

  // 处理编辑工序
  const handleEditOperation = (operation: OperationInfo) => {
    setEditingOperation(operation);
    form.setFieldsValue(operation);
    setIsModalVisible(true);
  };

  // 处理查看工序详情
  const handleViewOperation = async (operation: OperationInfo) => {
    setViewingOperation(operation);
    setIsDetailVisible(true);
  };

  // 处理表单提交
  const handleSubmit = async (values: OperationFormData) => {
    try {
      if (editingOperation) {
        // 更新工序
        const result = await updateOperation(editingOperation.id, values);
        if (result) {
          setIsModalVisible(false);
          form.resetFields();
          fetchOperations();
        }
      } else {
        // 创建工序
        const result = await createOperation(values);
        if (result) {
          setIsModalVisible(false);
          form.resetFields();
          fetchOperations();
        }
      }
    } catch (error) {
      console.error('操作失败:', error);
    }
  };

  // 处理删除工序
  const handleDeleteOperation = async (id: string) => {
    await deleteOperation(id);
    fetchOperations();
  };

  // 处理刷新
  const handleRefresh = () => {
    fetchOperations();
  };

  return (
    <div>
      <OperationList
        operations={operations}
        loading={loading}
        total={total}
        page={page}
        pageSize={pageSize}
        onAdd={handleAddOperation}
        onEdit={handleEditOperation}
        onView={handleViewOperation}
        onDelete={handleDeleteOperation}
        onPageChange={handlePageChange}
        onRefresh={handleRefresh}
      />

      {/* 工序编辑/新增模态框 */}
      <Modal
        title={editingOperation ? '编辑工序' : '新增工序'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
        destroyOnHidden
      >
        <OperationForm
          form={form}
          initialValues={editingOperation}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalVisible(false);
            form.resetFields();
          }}
        />
      </Modal>

      {/* 工序详情弹窗 */}
      <Modal
        title="工序详情"
        open={isDetailVisible}
        onCancel={() => setIsDetailVisible(false)}
        width={800}
        footer={null}
        destroyOnHidden
      >
        {viewingOperation && (
          <OperationDetail
            operation={viewingOperation}
          />
        )}
      </Modal>
    </div>
  );
};

export default OperationManagement;