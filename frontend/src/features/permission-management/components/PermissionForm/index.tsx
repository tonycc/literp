import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import type { Permission } from '@zyerp/shared';

interface PermissionFormProps {
  visible: boolean;
  permission?: Permission | null;
  onCancel: () => void;
  onSubmit: (values: PermissionFormData) => void;
}

interface PermissionFormData {
  name: string;
  code: string;
  resource: string;
  action: string;
  description?: string;
}

const { Option } = Select;

const PermissionForm: React.FC<PermissionFormProps> = ({
  visible,
  permission,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (permission) {
        // 编辑模式，填充表单
        form.setFieldsValue({
          name: permission.name,
          code: permission.code,
          resource: permission.resource,
          action: permission.action,
          description: permission.description,
        });
      } else {
        // 新增模式，重置表单
        form.resetFields();
      }
    }
  }, [visible, permission, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch {
      message.error('请检查表单输入');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={permission ? '编辑权限' : '新增权限'}
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText="确定"
      cancelText="取消"
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          name: '',
          code: '',
          resource: '',
          action: '',
          description: '',
        }}
      >
        <Form.Item
          label="权限名称"
          name="name"
          rules={[
            { required: true, message: '请输入权限名称' },
            { max: 50, message: '权限名称不能超过50个字符' },
          ]}
        >
          <Input placeholder="请输入权限名称" />
        </Form.Item>

        <Form.Item
          label="权限代码"
          name="code"
          rules={[
            { required: true, message: '请输入权限代码' },
            { pattern: /^[A-Z_]+$/, message: '权限代码只能包含大写字母和下划线' },
            { max: 50, message: '权限代码不能超过50个字符' },
          ]}
        >
          <Input placeholder="请输入权限代码，如：USER_READ" />
        </Form.Item>

        <Form.Item
          label="资源"
          name="resource"
          rules={[
            { required: true, message: '请选择资源' },
          ]}
        >
          <Select placeholder="请选择资源">
            <Option value="user">用户</Option>
            <Option value="role">角色</Option>
            <Option value="permission">权限</Option>
            <Option value="system">系统</Option>
            <Option value="dashboard">仪表板</Option>
            <Option value="file">文件</Option>
            <Option value="log">日志</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="操作"
          name="action"
          rules={[
            { required: true, message: '请选择操作' },
          ]}
        >
          <Select placeholder="请选择操作">
            <Option value="read">查看</Option>
            <Option value="write">编辑</Option>
            <Option value="create">创建</Option>
            <Option value="delete">删除</Option>
            <Option value="manage">管理</Option>
            <Option value="export">导出</Option>
            <Option value="import">导入</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="描述"
          name="description"
          rules={[
            { max: 200, message: '描述不能超过200个字符' },
          ]}
        >
          <Input.TextArea 
            placeholder="请输入权限描述" 
            rows={3}
            showCount
            maxLength={200}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PermissionForm;