import React, { useRef, useEffect } from 'react';
import { ModalForm, ProFormText, ProFormSelect, ProFormTextArea } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import type { Permission } from '@zyerp/shared';
import { PERMISSION_RESOURCE_OPTIONS, PERMISSION_ACTION_OPTIONS } from '../constants/permission';
import type { CreatePermissionData } from '../services/permission.service';

interface PermissionFormProps {
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  initialValues?: Permission | null;
  onFinish: (values: CreatePermissionData) => Promise<boolean | void>;
}

const PermissionForm: React.FC<PermissionFormProps> = ({
  visible,
  onVisibleChange,
  initialValues,
  onFinish,
}) => {
  const formRef = useRef<ProFormInstance<CreatePermissionData> | undefined>(undefined);

  // 当 visible 或 initialValues 变化时重置/设置表单
  useEffect(() => {
    if (visible) {
      if (initialValues) {
        formRef.current?.setFieldsValue(initialValues);
      } else {
        formRef.current?.resetFields();
      }
    }
  }, [visible, initialValues]);

  return (
    <ModalForm<CreatePermissionData>
      title={initialValues ? '编辑权限' : '新增权限'}
      open={visible}
      onOpenChange={onVisibleChange}
      formRef={formRef}
      onFinish={onFinish}
      modalProps={{
        destroyOnClose: true,
        okText: '确定',
        cancelText: '取消',
      }}
      layout="horizontal"
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 18 }}
    >
      <ProFormText
        name="name"
        label="权限名称"
        rules={[
          { required: true, message: '请输入权限名称' },
          { max: 50, message: '权限名称不能超过50个字符' },
        ]}
        placeholder="请输入权限名称"
      />

      <ProFormText
        name="code"
        label="权限代码"
        rules={[
          { required: true, message: '请输入权限代码' },
          { pattern: /^[a-zA-Z0-9_:]+$/, message: '权限代码只能包含字母、数字、下划线和冒号' },
          { max: 50, message: '权限代码不能超过50个字符' },
        ]}
        placeholder="请输入权限代码，如：user:read"
        disabled={!!initialValues} // 代码通常不允许修改
      />

      <ProFormSelect
        name="resource"
        label="资源"
        rules={[{ required: true, message: '请选择资源' }]}
        options={PERMISSION_RESOURCE_OPTIONS}
        placeholder="请选择资源"
      />

      <ProFormSelect
        name="action"
        label="操作"
        rules={[{ required: true, message: '请选择操作' }]}
        options={PERMISSION_ACTION_OPTIONS}
        placeholder="请选择操作"
      />

      <ProFormTextArea
        name="description"
        label="描述"
        rules={[{ max: 200, message: '描述不能超过200个字符' }]}
        placeholder="请输入权限描述"
        fieldProps={{
          showCount: true,
          maxLength: 200,
          rows: 3,
        }}
      />
    </ModalForm>
  );
};

export default PermissionForm;
