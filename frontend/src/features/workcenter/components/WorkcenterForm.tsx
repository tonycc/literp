import React, { useEffect, useState } from 'react';
import {
  ProForm,
  ProFormText,
  ProFormTextArea,
  ProFormSelect,

  ProFormDigit,
} from '@ant-design/pro-components';
import { Row, Col } from 'antd';
import type { FormInstance } from 'antd';
import type {
  WorkcenterInfo,
  CreateWorkcenterRequest,
  UpdateWorkcenterRequest,
  User,
} from '@zyerp/shared';
import { workcenterService } from '../services/workcenter.service';
import { useMessage } from '../../../shared/hooks';
import { getUsers } from '@/shared/services';

interface WorkcenterFormProps {
  form?: FormInstance;
  initialValues?: Partial<WorkcenterInfo> | null;
  onCancel?: () => void;
  loading?: boolean;
  onSubmit?: (values: CreateWorkcenterRequest | UpdateWorkcenterRequest) => Promise<void>;
}

const WorkcenterForm: React.FC<WorkcenterFormProps> = ({
  form,
  initialValues,
  onSubmit,
  loading,
}) => {
  const message = useMessage();
  const [workcenterType, setWorkcenterType] = useState<string | undefined>(
    initialValues?.type,
  );

  // 同步初始值到表单（包括默认值），确保新建/编辑时初始数据正确
  useEffect(() => {
    if (!form) return;
    const defaults: Partial<WorkcenterInfo> = {
      active: true,
      capacity: 1,
      costsHour: 0,
    };
    // 重置并设置初始值（编辑优先）
    form.resetFields();
    form.setFieldsValue({
      ...defaults,
      ...(initialValues || {}),
    });
  }, [form, initialValues]);

  // 跟随初始值的类型变化，确保联动区域正确显示
  useEffect(() => {
    setWorkcenterType(initialValues?.type);
  }, [initialValues?.type]);

  // 验证工作中心编码唯一性
  const validateWorkcenterCode = async (_rule: unknown, value: string) => {
    if (!value) {
      return Promise.resolve();
    }
    
    try {
      const response = await workcenterService.validateCode({
        code: value,
        excludeId: initialValues?.id
      });
      
      if (response.success && response.data?.isValid && response.data?.isUnique) {
        return Promise.resolve();
      } else {
        return Promise.reject(new Error(response.data?.message || '工作中心编码已存在'));
      }
    } catch (error) {
      console.error('验证工作中心编码失败:', error);
      return Promise.reject(new Error('验证工作中心编码失败'));
    }
  };

  // 处理表单提交
  const handleSubmit = async (values: CreateWorkcenterRequest | UpdateWorkcenterRequest) => {
    try {
      await onSubmit?.(values);
    } catch (error) {
      console.error('表单提交失败:', error);
      message.error('表单提交失败');
    }
  };

  return (
    <ProForm
      form={form}
      onFinish={handleSubmit}
      layout="vertical"
      onValuesChange={(_, values) => {
        if (values.type) {
          setWorkcenterType(values.type);
        }
      }}
      submitter={{
        submitButtonProps: {
          loading: !!loading,
        },
      }}
    >
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <ProFormText
            name="code"
            label="工作中心编码"
            placeholder="请输入工作中心编码"
            rules={[
              { required: true, message: '请输入工作中心编码' },
              { pattern: /^[A-Z0-9_]+$/, message: '编码只能包含大写字母、数字和下划线' },
              { validator: validateWorkcenterCode }
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
            label="工作中心名称"
            placeholder="请输入工作中心名称"
            rules={[
              { required: true, message: '请输入工作中心名称' }
            ]}
            fieldProps={{
              maxLength: 50,
              showCount: true
            }}
          />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <ProFormSelect
            name="type"
            label="工作中心类型"
            placeholder="请选择工作中心类型"
            options={[
              {label:'请选择',value:''},
              { label: '车间', value: 'TEAM' },
              { label: '设备', value: 'EQUIPMENT' },
              { label: '生产线', value: 'PRODUCTION_LINE' },
              { label: '外协', value: 'OUTSOURCING' },
            ]}
            rules={[{ required: true, message: '请选择工作中心类型' }]}
          />
        </Col>
         <Col xs={24} sm={8}>
          <ProFormDigit
            name="costsHour"
            label="每小时成本"
            placeholder="请输入每小时成本"
            fieldProps={{
              min: 0,
              precision: 2,
              step: 0.01,
            }}
          />
        </Col>
         <Col xs={24} sm={8}>
          <ProFormDigit
            name="capacity"
            label="产能"
            placeholder="请输入产能"
            fieldProps={{
              min: 1,
              step: 1,
            }}
          />
        </Col>
      </Row>
      {/* 车间特有字段 */}
      {workcenterType === 'TEAM' && (
        <>
          <Row gutter={16}>
             <Col xs={24} sm={12}>
              <ProFormSelect
                name="managerId"
                label="车间负责人"
                request={async () => {
                  // 补充必填参数 page，满足 PaginationParams 类型要求
                  const res = await getUsers({ page: 1, pageSize: 999 });
                  return (
                    res.data?.map((user: User) => ({
                      label: user.username,
                      value: user.id,
                    })) || []
                  );
                }}
              />
            </Col>
            <Col xs={24} sm={12}>
              <ProFormDigit
                name="teamSize"
                label="车间人数"
                placeholder="请输入车间人数"
                fieldProps={{
                  min: 1,
                  step: 1,
                }}
              />
            </Col>
          </Row>
        </>
      )}

      {/* 设备特有字段 */}
      {workcenterType === 'EQUIPMENT' && (
        <>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <ProFormText
                name="equipmentId"
                label="设备ID"
                placeholder="请输入设备ID"
              />
            </Col>
            <Col xs={24} sm={12}>
              <ProFormDigit
                name="maintenanceCycle"
                label="维护周期(小时)"
                placeholder="请输入维护周期"
                fieldProps={{
                  min: 1,
                  step: 1,
                }}
              />
            </Col>
          </Row>
        </>
      )}

      <ProFormTextArea
        name="description"
        label="描述"
        placeholder="请输入工作中心描述"
        fieldProps={{
          rows: 3,
          maxLength: 500,
          showCount: true
        }}
      />
    </ProForm>
  );
};

export default WorkcenterForm;