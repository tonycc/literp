import React from 'react';
import { 
  ProForm,
  ProFormText,
  ProFormTextArea,
  ProFormDigit,
  ProFormSelect,
} from '@ant-design/pro-components';
import { Row, Col } from 'antd';
import type { FormInstance } from 'antd';
import type { OperationFormData, OperationInfo } from '@zyerp/shared';
import { operationService } from '../services/operation.service';
import { DefectService } from '../../defect/services/defect.service';
import { useMessage } from '@/shared/hooks';

interface OperationFormProps {
  form: FormInstance<OperationFormData>;
  initialValues?: Partial<OperationInfo>;
  onSubmit?: (values: OperationFormData) => Promise<void> | void;
  onCancel?: () => void;
}

const OperationForm: React.FC<OperationFormProps> = ({
  form,
  initialValues,
  onSubmit,
  onCancel
}) => {
  const message = useMessage();

  // 验证工序编码唯一性
  const validateOperationCode = async (_rule: unknown, value: string) => {
    if (!value) {
      return Promise.resolve();
    }
    
    try {
      const response = await operationService.validateCode({
        code: value,
        excludeId: initialValues?.id
      });
      
      if (response.success && response.data?.isValid && response.data?.isUnique) {
        return Promise.resolve();
      } else {
        return Promise.reject(new Error(response.data?.message || '工序编码已存在'));
      }
    } catch (error) {
      console.error('验证工序编码失败:', error);
      return Promise.reject(new Error('验证工序编码失败'));
    }
  };

  // 验证工序名称唯一性
  const validateOperationName = async (_rule: unknown, value: string) => {
    if (!value) {
      return Promise.resolve();
    }

    // 检查是否包含换行符或回车
    if (/\r|\n/.test(value)) {
      return Promise.reject(new Error('工序名称必须为一行（不允许回车或换行）'));
    }

    // 可选：去除首尾空格后再检查是否为空
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return Promise.reject(new Error('工序名称不能为空或仅包含空格'));
    }

    // 验证工序名称唯一性
    try {
      const response = await operationService.validateName({
        name: value,
        excludeId: initialValues?.id
      });
      
      if (response.success && response.data?.isValid && response.data?.isUnique) {
        return Promise.resolve();
      } else {
        return Promise.reject(new Error(response.data?.message || '工序名称已存在'));
      }
    } catch (error) {
      console.error('验证工序名称失败:', error);
      return Promise.reject(new Error('验证工序名称失败'));
    }
  };

  // 处理表单提交
  const handleSubmit = async (values: OperationFormData) => {
    try {
      await onSubmit?.(values);
    } catch (error) {
      console.error('表单提交失败:', error);
      message.error('表单提交失败');
    }
  };

  return (
    <ProForm<OperationFormData>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      form={form}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
      initialValues={initialValues as any}
      onFinish={handleSubmit}
      layout="vertical"
      submitter={{
        render: (_, dom) => (
          <Row justify="end" gutter={16}>
            <Col>
              <a onClick={onCancel}>取消</a>
            </Col>
            <Col>
              {dom[1]}
            </Col> {/* 提交按钮 */}
          </Row>
        ),
      }}
    >
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <ProFormText
            name="code"
            label="工序编码"
            placeholder="请输入工序编码"
            rules={[
              { required: true, message: '请输入工序编码' },
              { pattern: /^[A-Z0-9_]+$/, message: '编码只能包含大写字母、数字和下划线' },
              { validator: validateOperationCode }
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
            label="工序名称"
            placeholder="请输入工序名称"
            rules={[
              { required: true, message: '请输入工序名称' },
              { validator: validateOperationName }
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
          <ProFormDigit
            name="standardTime"
            label="标准工时(分钟)"
            placeholder="请输入标准工时"
            initialValue={10}
            min={0}
            precision={2}
            fieldProps={{
              step: 0.1
            }}
          />
        </Col>
         <Col xs={24} sm={8}>
          <ProFormDigit
            name="wageRate"
            label="工价"
            placeholder="请输入工价"
            initialValue={0.0}
            min={0}
            precision={2}
            fieldProps={{
              step: 0.01,
              addonAfter: '元/件'
            }}
          />
        </Col>
      
      </Row>

      <ProFormSelect
        name="defectIds"
        label="不良品项"
        placeholder="请选择不良品项"
        mode="multiple"
        request={async () => {
          try {
            const response = await DefectService.getActiveList();
            
            if (response.success && response.data) {
              return response.data.map(item => ({
                label: `${item.code} - ${item.name}`,
                value: item.id
              }));
            }
            return [];
          } catch (error) {
            console.error('获取不良品项失败:', error);
            return [];
          }
        }}
        fieldProps={{
          maxTagCount: 'responsive',
        }}
      />

      <ProFormTextArea
        name="description"
        label="描述"
        placeholder="请输入工序描述"
        fieldProps={{
          rows: 3,
          maxLength: 500,
          showCount: true
        }}
      />
    </ProForm>
  );
};

export default OperationForm;