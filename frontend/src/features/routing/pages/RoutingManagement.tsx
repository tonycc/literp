import React, { useState } from 'react';
import { Modal, Form, Button } from 'antd';

import type { RoutingInfo, RoutingWorkcenterInfo, RoutingFormData, WorkcenterOption, CreateRoutingWorkcenterRequest, CreateRoutingRequest, UpdateRoutingRequest } from '@zyerp/shared';
import type { OperationOption, OperationInfo } from '@zyerp/shared';
import RoutingList, { type RoutingListRef } from '../components/RoutingList';
import RoutingForm from '../components/RoutingForm';
import RoutingOperationsForm from '../components/RoutingOperationsForm';
import OperationSelectModal from '../components/OperationSelectModal';
import { routingService } from '../services/routing.service';
import { operationService } from '../../operation/services/operation.service';
import { useMessage } from '@/shared/hooks';

// 本地定义：一次性提交/更新工序输入结构（与后端保持字段一致）
type RoutingWorkcenterInputLocal = {
  workcenterId: string;
  operationId: string;
  name: string;
  sequence: number;
  timeMode: string;
  timeCycleManual: number;
  batch: boolean;
  batchSize: number;
  wageRate?: number;
  worksheetType?: string;
  worksheetLink?: string;
  description?: string;
};

const RoutingManagement: React.FC = () => {
  const listRef = React.useRef<RoutingListRef>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RoutingInfo | null>(null);
  const [form] = Form.useForm();
  const [operationsForm] = Form.useForm();
  const [operations, setOperations] = useState<RoutingWorkcenterInfo[]>([]);
  const [workcenterOptions, setWorkcenterOptions] = useState<WorkcenterOption[]>([]);
  const [operationOptions, setOperationOptions] = useState<OperationOption[]>([]);
  const [isOperationsModalVisible, setIsOperationsModalVisible] = useState(false);
  const [isOperationSelectVisible, setIsOperationSelectVisible] = useState(false);
  const [editingOperation, setEditingOperation] = useState<RoutingWorkcenterInfo | null>(null);
  const messageApi = useMessage();

  // 拉取工作中心与工序选项（仅启用项）
  const fetchOptions = async () => {
    try {
      const [wcRes, opRes] = await Promise.all([
        routingService.getWorkcenterOptions({ _active: true }),
        operationService.getOptions({ isActive: true })
      ]);
      setWorkcenterOptions(wcRes.data || []);
      setOperationOptions(opRes.data || []);
    } catch (error) {
      console.error('加载选项失败:', error);
      messageApi.error('加载选项失败');
    }
  };

  // 处理新建工艺路线
  const handleCreate = async () => {
    setEditingRecord(null);
    setOperations([]);
    // 清空主表单，确保新建时输入框为空
    try {
      form.resetFields();
    } catch {
      // 忽略重置异常
    }
    setIsModalVisible(true);
    await fetchOptions();
  };

  // 处理编辑工艺路线
  const handleEdit = async (record: RoutingInfo) => {
    setEditingRecord(record);
    // 获取该工艺路线的工序列表并填充到可编辑列表
    try {
      const opsRes = await routingService.getOperations(record.id);
      setOperations(opsRes.data || []);
    } catch (error) {
      console.error('加载工序列表失败:', error);
      messageApi.error('加载工序列表失败');
      setOperations([]);
    }
    // 预填充主表单为当前记录
    try {
      form.setFieldsValue(record as Partial<RoutingFormData>);
    } catch {
      // 忽略设置异常
    }
    setIsModalVisible(true);
    await fetchOptions();
  };

  // 处理保存工艺路线
  const handleSave = async (values: RoutingFormData) => {
    try {
      // 将当前前端工序状态映射为一次性提交的输入结构（过滤未选择工作中心的工序）
      const validOps = (operations || []).filter(op => !!op.workcenterId && op.workcenterId.trim().length > 0);
      if (operations.length > validOps.length) {
        messageApi.warning('部分工序未选择工作中心，已忽略');
      }

      const operationInputs: RoutingWorkcenterInputLocal[] = validOps.map((op, idx) => ({
        workcenterId: op.workcenterId,
        operationId: op.operationId,
        name: op.name,
        sequence: typeof op.sequence === 'number' ? op.sequence : (idx + 1),
        timeMode: op.timeMode || 'manual',
        timeCycleManual: typeof op.timeCycleManual === 'number' ? op.timeCycleManual : 0,
        batch: !!op.batch,
        batchSize: typeof op.batchSize === 'number' ? op.batchSize : 1,
        wageRate: typeof op.wageRate === 'number' ? op.wageRate : undefined,
        worksheetType: op.worksheetType,
        worksheetLink: op.worksheetLink,
        description: op.description,
      }));

      let response;
      if (editingRecord) {
        // 更新工艺路线
        const payload = { ...values, operations: operationInputs };
        response = await routingService.update(editingRecord.id, payload as unknown as UpdateRoutingRequest);
      } else {
        // 创建工艺路线
        const payload = { ...values, operations: operationInputs };
        response = await routingService.create(payload as unknown as CreateRoutingRequest);
      }

      if (response.success) {
        messageApi.success(editingRecord ? '更新成功' : '创建成功');
        // 刷新列表
        listRef.current?.reload();
        setIsModalVisible(false);
        // TODO: 刷新列表
      } else {
        messageApi.error(response.message || (editingRecord ? '更新失败' : '创建失败'));
      }
    } catch (error) {
      console.error('保存工艺路线失败:', error);
      messageApi.error(editingRecord ? '更新失败' : '创建失败');
    }
  };

  // 处理取消
  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingRecord(null);
    // 关闭时重置表单，避免下次打开残留值
    try {
      form.resetFields();
    } catch {
      // 忽略重置异常
    }
  };

  // 处理添加工序：改造为批量选择流程
  const handleAddOperation = () => {
    setEditingOperation(null);
    setIsOperationSelectVisible(true);
    return Promise.resolve();
  };

  // 处理编辑工序
  const handleEditOperation = async (record: RoutingWorkcenterInfo) => {
    setEditingOperation(record);
    await fetchOptions();
    setIsOperationsModalVisible(true);
  };

  // 处理保存工序
  const handleSaveOperation = (values: Omit<CreateRoutingWorkcenterRequest, 'routingId'>) => {
    try {
      if (editingOperation) {
        // 更新工序
        setOperations(prev => prev.map(op => 
          op.id === editingOperation.id ? { ...op, ...values } : op
        ));
      } else {
        // 添加工序
        const newOperation: RoutingWorkcenterInfo = {
          id: `temp_${Date.now()}`,
          routingId: editingRecord?.id || '',
          workcenterId: values.workcenterId || '', // 确保 workcenterId 不为 undefined
          operationId: values.operationId,
          name: values.name,
          sequence: values.sequence,
          timeMode: values.timeMode,
          timeCycleManual: values.timeCycleManual,
          wageRate: 0,
          batch: values.batch,
          batchSize: values.batchSize,
          worksheetType: values.worksheetType,
          worksheetLink: values.worksheetLink,
          description: values.description || undefined, // 确保 description 为 undefined 而不是空字符串
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setOperations(prev => [...prev, newOperation]);
      }
      
      messageApi.success(editingOperation ? '更新成功' : '添加成功');
      setIsOperationsModalVisible(false);
      return Promise.resolve();
    } catch (error) {
      console.error('保存工序失败:', error);
      messageApi.error(editingOperation ? '更新失败' : '添加失败');
      return Promise.resolve();
    }
  };

  // 处理取消工序操作
  const handleCancelOperation = () => {
    setIsOperationsModalVisible(false);
    setEditingOperation(null);
  };

  // 处理删除工序
  const handleDeleteOperation = (id: string) => {
    setOperations(prev => prev.filter(op => op.id !== id));
    return Promise.resolve();
  };

  // 处理工序拖拽排序
  const handleSortOperations = (sorted: RoutingWorkcenterInfo[]) => {
    // 使用拖拽后的顺序并规范化为递增的 sequence（按 1、2、3）
    setOperations(sorted.map((op, idx) => ({
      ...op,
      sequence: (idx + 1),
    })));
    return Promise.resolve();
  };

  // 下拉选择工作中心（列表内就地修改）
  const handleChangeWorkcenter = (id: string, workcenterId: string) => {
    setOperations(prev => prev.map(op => (
      op.id === id ? { ...op, workcenterId } : op
    )));
  };

  // 选择工序确认：把选中的 OperationInfo 转为 RoutingWorkcenterInfo，并追加到列表
  const handleConfirmSelectOperations = (selectedOps: OperationInfo[]) => {
    if (!selectedOps || selectedOps.length === 0) {
      messageApi.warning('未选择工序');
      return;
    }
    const nextSeqBase = operations.length > 0 ? Math.max(...operations.map(op => op.sequence || 0)) + 1 : 1;
    const now = new Date().toISOString();
    const added: RoutingWorkcenterInfo[] = selectedOps.map((op, idx) => ({
      id: `temp_${Date.now()}_${idx}`,
      routingId: editingRecord?.id || '',
      operationId: op.id,
      name: op.name,
      workcenterId: '',
      sequence: nextSeqBase + idx,
      timeMode: 'manual',
      timeCycleManual: typeof op.standardTime === 'number' ? op.standardTime : 1,
      wageRate: typeof op.wageRate === 'number' ? op.wageRate : 0,
      batch: false,
      batchSize: 1,
      worksheetType: undefined,
      worksheetLink: undefined,
      description: op.description,
      createdAt: now,
      updatedAt: now,
    }));
    setOperations(prev => [...prev, ...added]);
    messageApi.success(`成功添加 ${added.length} 个工序`);
    setIsOperationSelectVisible(false);
  };

  return (
    <div>
      <RoutingList ref={listRef} onEdit={handleEdit} onCreate={handleCreate} />
      {/* 工艺路线表单弹窗 */}
      <Modal
        title={editingRecord ? '编辑工艺路线' : '新建工艺路线'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>取消</Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()}>提交</Button>,
        ]}
        width={800}
        destroyOnClose
      >
        <RoutingForm
          form={form}
          initialValues={editingRecord || {}}
          onSubmit={handleSave}
          operations={operations}
          onAddOperation={handleAddOperation}
          onEditOperation={handleEditOperation}
          onDeleteOperation={handleDeleteOperation}
          onSortOperation={handleSortOperations}
          workcenterOptions={workcenterOptions}
          onChangeWorkcenter={handleChangeWorkcenter}
        />
        
      </Modal>
      
      {/* 工序表单弹窗 */}
      <Modal
        title={editingOperation ? '编辑工序' : '添加工序'}
        open={isOperationsModalVisible}
        onCancel={handleCancelOperation}
        footer={null}
        width={800}
        destroyOnClose
      >
        <RoutingOperationsForm
          form={operationsForm}
          initialValues={editingOperation || {}}
          onSubmit={handleSaveOperation}
          onCancel={handleCancelOperation}
          workcenterOptions={workcenterOptions}
          operationOptions={operationOptions}
        />

      </Modal>

      {/* 工序选择弹窗：用于“添加工序”批量选择 */}
      <OperationSelectModal
        visible={isOperationSelectVisible}
        onCancel={() => setIsOperationSelectVisible(false)}
        onConfirm={handleConfirmSelectOperations}
        excludeOperationIds={operations.map(op => op.operationId)}
      />
    </div>
  );
};

export default RoutingManagement;