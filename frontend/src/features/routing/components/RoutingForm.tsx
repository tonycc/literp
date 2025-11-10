import React from 'react';
import { 
  ProForm,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Row, Col } from 'antd';
import type { FormInstance } from 'antd';
import type { RoutingInfo, RoutingWorkcenterInfo, RoutingFormData, WorkcenterOption } from '@zyerp/shared';
import { routingService } from '../services/routing.service';
import { useMessage } from '../../../shared/hooks';
import RoutingOperationsList from './RoutingOperationsList';

interface RoutingFormProps {
  form: FormInstance;
  initialValues?: Partial<RoutingInfo>;
  onSubmit?: (values: RoutingFormData) => void;
  // 下方工序列表相关 props（由页面层传入以保持状态统一）
  operations?: RoutingWorkcenterInfo[];
  onAddOperation?: () => void;
  onEditOperation?: (record: RoutingWorkcenterInfo) => void;
  onDeleteOperation?: (id: string) => void;
  onSortOperation?: (data: RoutingWorkcenterInfo[]) => void;
  workcenterOptions?: WorkcenterOption[];
  onChangeWorkcenter?: (id: string, workcenterId: string) => void;
}

const RoutingForm: React.FC<RoutingFormProps> = ({
  form,
  initialValues,
  onSubmit,
  operations = [],
  onAddOperation,
  onEditOperation,
  onDeleteOperation,
  onSortOperation,
  workcenterOptions = [],
  onChangeWorkcenter,
}) => {
  const message = useMessage();

  // 验证工艺路线编码唯一性
  const validateRoutingCode = async (_rule: unknown, value: string) => {
    if (!value) {
      return Promise.resolve();
    }
    
    try {
      const response = await routingService.validateCode({
        code: value,
        excludeId: initialValues?.id
      });
      
      if (response.success && response.data?.isValid && response.data?.isUnique) {
        return Promise.resolve();
      } else {
        return Promise.reject(new Error(response.data?.message || '工艺路线编码已存在'));
      }
    } catch (error) {
      console.error('验证工艺路线编码失败:', error);
      return Promise.reject(new Error('验证工艺路线编码失败'));
    }
  };

  // 处理表单提交
  const handleSubmit = async (values: RoutingFormData) => {
    try {
      await onSubmit?.(values);
    } catch (error) {
      console.error('表单提交失败:', error);
      message.error('表单提交失败');
    }
  };

  return (
    <>
    <ProForm
      form={form}
      initialValues={initialValues}
      onFinish={handleSubmit}
      layout="vertical"
      submitter={false}
    >
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <ProFormText
            name="code"
            label="工艺路线编码"
            placeholder="请输入工艺路线编码"
            rules={[
              { required: true, message: '请输入工艺路线编码' },
              { pattern: /^[A-Z0-9_]+$/, message: '编码只能包含大写字母、数字和下划线' },
              { validator: validateRoutingCode }
            ]}
            fieldProps={{
              maxLength: 20,
              showCount: true
            }}
          />
        </Col>
        <Col xs={24} sm={12}>
          <ProFormText
            name="name"
            label="工艺路线名称"
            placeholder="请输入工艺路线名称"
            rules={[
              { required: true, message: '请输入工艺路线名称' }
            ]}
            fieldProps={{
              maxLength: 50,
              showCount: true
            }}
          />
        </Col>
      </Row>

      <ProFormTextArea
        name="description"
        label="描述"
        placeholder="请输入工艺路线描述"
        fieldProps={{
          rows: 3,
          maxLength: 500,
          showCount: true
        }}
      />
    </ProForm>
    {/* 下方：工序列表 */}
    <div style={{ marginTop: 24 }}>
      <RoutingOperationsList
        dataSource={operations}
        onAdd={onAddOperation}
        onEdit={onEditOperation}
        onDelete={onDeleteOperation}
        onSort={onSortOperation}
        workcenterOptions={workcenterOptions}
        onChangeWorkcenter={onChangeWorkcenter}
      />
    </div>
    </>
  );
};

export default RoutingForm;