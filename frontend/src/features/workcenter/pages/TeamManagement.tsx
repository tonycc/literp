import React, { useState } from 'react';
import { Modal, Form } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import type { WorkcenterInfo, CreateWorkcenterRequest, UpdateWorkcenterRequest } from '@zyerp/shared';
import WorkcenterList from '../components/WorkcenterList';
import WorkcenterForm from '../components/WorkcenterForm';
import { workcenterService } from '../services/workcenter.service';
import { useMessage } from '../../../shared/hooks';

const TeamManagement: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  // 允许新建时仅提供部分初始值（例如仅设置 type）
  const [editingRecord, setEditingRecord] = useState<Partial<WorkcenterInfo> | null>(null);
  const [form] = Form.useForm();
  const messageApi = useMessage();

  // 处理新建车间
  const handleCreate = () => {
    // 使用 initialValues 驱动默认类型为车间，避免在未挂载时操作 form
    setEditingRecord({ type: 'TEAM' });
    setIsModalVisible(true);
  };

  // 处理编辑车间
  const handleEdit = (record: WorkcenterInfo) => {
    setEditingRecord(record);
    setIsModalVisible(true);
  };

  // 处理保存车间
  const handleSave = async (values: CreateWorkcenterRequest | UpdateWorkcenterRequest) => {
    try {
      let response;
      if (editingRecord?.id) {
        // 更新工作中心（明确收窄类型）
        response = await workcenterService.update(editingRecord.id, values as UpdateWorkcenterRequest);
      } else {
        // 创建工作中心（明确收窄类型）
        response = await workcenterService.create(values as CreateWorkcenterRequest);
      }

      if (response.success) {
        messageApi.success(editingRecord?.id ? '更新成功' : '创建成功');
        setIsModalVisible(false);
        // TODO: 刷新列表
      } else {
        messageApi.error(response.message || (editingRecord?.id ? '更新失败' : '创建失败'));
      }
    } catch (error) {
      console.error('保存工作中心失败:', error);
      messageApi.error(editingRecord?.id ? '更新失败' : '创建失败');
    }
  };

  // 处理取消
  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingRecord(null);
  };

  return (
    <PageContainer>
      <WorkcenterList 
        onEdit={handleEdit} 
        onAdd={handleCreate} 
        type="TEAM" // 只显示车间类型
      />
      
      {/* 工作中心表单弹窗 */}
      <Modal
        title={editingRecord?.id ? '编辑车间' : '新建车间'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
        destroyOnClose
      >
        <WorkcenterForm
          form={form}
          initialValues={editingRecord || {}}
          onSubmit={handleSave}
          onCancel={handleCancel}
        />
      </Modal>
    </PageContainer>
  );
};

export default TeamManagement;