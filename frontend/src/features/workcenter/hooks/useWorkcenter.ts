import { useRef, useState } from 'react';
import { Form } from 'antd';
import type { ActionType } from '@ant-design/pro-table';
import type {
  CreateWorkcenterRequest,
  UpdateWorkcenterRequest,
  WorkcenterInfo,
} from '@zyerp/shared';
import { workcenterService } from '../services/workcenter.service';
import { useMessage } from '../../../shared/hooks/useMessage';

export const useWorkcenter = () => {
  const [form] = Form.useForm();
  const message = useMessage();
  // 初始化 ref 以满足 React 19 类型对 initialValue 的要求
  const actionRef = useRef<ActionType | undefined>(undefined);

  const [isModalVisible, setIsModalVisible] = useState(false);
  // 允许在新建时仅传入部分初始值（例如 type），编辑时为完整记录
  const [editingRecord, setEditingRecord] = useState<Partial<WorkcenterInfo> | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  const handleCreate = (type?: string) => {
    // 使用 initialValues 驱动表单初始值，避免在未挂载时操作 form 实例
    setEditingRecord(type ? { type } : {});
    setIsModalVisible(true);
  };

  const handleEdit = (record: WorkcenterInfo) => {
    // 先设置编辑记录后打开弹窗，避免在未挂载时操作 form 实例
    setEditingRecord(record);
    setIsModalVisible(true);
  };

  const handleSave = async (
    values: CreateWorkcenterRequest | UpdateWorkcenterRequest,
  ) => {
    setLoading(true);
    try {
      if (editingRecord?.id) {
        await workcenterService.update(
          editingRecord.id,
          values as UpdateWorkcenterRequest,
        );
        message.success('更新成功');
      } else {
        await workcenterService.create(values as CreateWorkcenterRequest);
        message.success('创建成功');
      }
      setIsModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return {
    form,
    isModalVisible,
    editingRecord,
    loading,
    actionRef,
    handleCreate,
    handleEdit,
    handleSave,
    handleCancel,
  };
};