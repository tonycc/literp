import React from 'react';
import { 
  ProForm,
  ProFormText,
  ProFormSelect,
  ProFormDigit,
  ProFormSwitch,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Row, Col } from 'antd';
import type { FormInstance } from 'antd';
import type { RoutingWorkcenterInfo, CreateRoutingWorkcenterRequest } from '@zyerp/shared';
import { useMessage } from '@/shared/hooks';

interface RoutingOperationsFormProps {
  form: FormInstance;
  initialValues?: Partial<RoutingWorkcenterInfo>;
  onSubmit?: (values: Omit<CreateRoutingWorkcenterRequest, 'routingId'>) => Promise<void>;
  onCancel?: () => void;
  workcenterOptions?: Array<{value: string, label: string, code: string}>;
  operationOptions?: Array<{value: string, label: string, code: string}>;
}

const RoutingOperationsForm: React.FC<RoutingOperationsFormProps> = ({
  form,
  initialValues,
  onSubmit,
  onCancel,
  workcenterOptions = [],
  operationOptions = []
}) => {
  const message = useMessage();

  // 处理表单提交
  const handleSubmit = async (values: Omit<CreateRoutingWorkcenterRequest, 'routingId'>) => {
    try {
      await onSubmit?.(values);
    } catch (error) {
      console.error('表单提交失败:', error);
      message.error('表单提交失败');
    }
  };

  return (
    <ProForm<Omit<CreateRoutingWorkcenterRequest, 'routingId'>>
      form={form}
      initialValues={initialValues}
      onFinish={handleSubmit}
      layout="horizontal"
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 18 }}
      submitter={{
        render: (_, dom) => (
          <Row justify="end" gutter={16}>
            <Col>
              <a onClick={onCancel}>取消</a>
            </Col>
            <Col>{dom[1]}</Col> {/* 提交按钮 */}
          </Row>
        ),
      }}
    >
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <ProFormDigit
            name="sequence"
            label="序号"
            placeholder="请输入序号"
            rules={[{ required: true, message: '请输入序号' }]}
            fieldProps={{
              min: 1,
              step: 10,
            }}
          />
        </Col>
        <Col xs={24} sm={12}>
          <ProFormText
            name="name"
            label="工序名称"
            placeholder="请输入工序名称"
            rules={[
              { required: true, message: '请输入工序名称' }
            ]}
            fieldProps={{
              maxLength: 50,
              showCount: true
            }}
          />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <ProFormSelect
            name="workcenterId"
            label="工作中心"
            placeholder="请选择工作中心"
            options={workcenterOptions.map(option => ({
              label: `${option.code} - ${option.label}${option.type ? ` (${option.type === 'TEAM' ? '车间' : option.type === 'EQUIPMENT' ? '设备' : '生产线'})` : ''}`,
              value: option.value
            }))}
            rules={[{ required: true, message: '请选择工作中心' }]}
          />
        </Col>
        <Col xs={24} sm={12}>
          <ProFormSelect
            name="operationId"
            label="工序"
            placeholder="请选择工序"
            options={operationOptions.map(option => ({
              label: option.label,
              value: option.value
            }))}
            rules={[{ required: true, message: '请选择工序' }]}
          />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <ProFormSelect
            name="timeMode"
            label="时间模式"
            placeholder="请选择时间模式"
            options={[
              { label: '手动', value: 'manual' },
              { label: '自动', value: 'automatic' },
            ]}
            rules={[{ required: true, message: '请选择时间模式' }]}
            initialValue="manual"
          />
        </Col>
        <Col xs={24} sm={12}>
          <ProFormDigit
            name="timeCycleManual"
            label="手动周期时间(分钟)"
            placeholder="请输入手动周期时间"
            rules={[{ required: true, message: '请输入手动周期时间' }]}
            fieldProps={{
              min: 0,
              precision: 2,
              step: 0.1,
            }}
            initialValue={0}
          />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <ProFormSwitch
            name="batch"
            label="是否批量"
            initialValue={false}
          />
        </Col>
        <Col xs={24} sm={12}>
          <ProFormDigit
            name="batchSize"
            label="批量大小"
            placeholder="请输入批量大小"
            fieldProps={{
              min: 1,
              step: 1,
            }}
            initialValue={1}
          />
        </Col>
      </Row>

      <ProFormTextArea
        name="description"
        label="描述"
        placeholder="请输入描述"
        fieldProps={{
          rows: 3,
          maxLength: 500,
          showCount: true
        }}
      />
    </ProForm>
  );
};

export default RoutingOperationsForm;