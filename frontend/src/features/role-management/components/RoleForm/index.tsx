/**
 * 角色表单组件
 */

import React, { useEffect, useState } from 'react';
import { Modal, Form, Input } from 'antd';
import type { Role, Permission } from '@zyerp/shared';
import { permissionService } from '../../../permission-management/services/permission.service';
import PermissionTree from '../PermissionTree';
import { useMessage } from '@/shared/hooks/useMessage';

interface RoleFormData {
  name: string;
  description?: string;
  permissionIds: string[];
}

interface RoleFormProps {
  visible: boolean;
  role?: Role | null;
  onCancel: () => void;
  onSubmit: (values: RoleFormData) => Promise<void>;
}

const RoleForm: React.FC<RoleFormProps> = ({
  visible,
  role,
  onCancel,
  onSubmit,
}) => {
  const message = useMessage();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // 获取所有权限
  const fetchPermissions = async () => {
    try {
      const data = await permissionService.getAllPermissions();
      setPermissions(data);
    } catch {
      message.error('获取权限列表失败');
    }
  };

  useEffect(() => {
    if (visible) {
      fetchPermissions();
    }
  }, [visible]);

  useEffect(() => {
    if (visible && role) {
      // 编辑模式
      // 使用setTimeout确保表单已经渲染
      setTimeout(() => {
        form.setFieldsValue({
          name: role.name,
          description: role.description,
        });
      }, 0);
      
      const rolePermissions = role.permissions || [];
      setSelectedPermissions(rolePermissions.map(p => String(p.id)));
    } else if (visible && !role) {
      // 新增模式
      form.resetFields();
      setSelectedPermissions([]);
    }
  }, [visible, role, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const submitData: RoleFormData = {
        ...values,
        permissionIds: selectedPermissions,
      };
      
      await onSubmit(submitData);
      form.resetFields();
      setSelectedPermissions([]);
    } catch {
      // 表单验证失败或提交失败
    } finally {
      setLoading(false);
    }
  };



  // 权限树组件的变更处理
  const handlePermissionTreeChange = (selectedKeys: string[]) => {
    setSelectedPermissions(selectedKeys);
  };

  return (
    <Modal
      title={role ? '编辑角色' : '新增角色'}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={500}
      destroyOnHidden={false}
      forceRender={true}
    >
      <Form
        form={form}
        layout="vertical"
        preserve={false}
      >
        <Form.Item
          name="name"
          label="角色名称"
          rules={[
            { required: true, message: '请输入角色名称' },
            { max: 50, message: '角色名称不能超过50个字符' },
          ]}
        >
          <Input placeholder="请输入角色名称" />
        </Form.Item>

        <Form.Item
          name="description"
          label="角色描述"
          rules={[
            { max: 200, message: '角色描述不能超过200个字符' },
          ]}
        >
          <Input.TextArea 
            placeholder="请输入角色描述" 
            rows={3}
          />
        </Form.Item>

        <Form.Item label="权限配置">
          <PermissionTree
            permissions={permissions}
            selectedPermissions={selectedPermissions}
            onChange={handlePermissionTreeChange}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RoleForm;