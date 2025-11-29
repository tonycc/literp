/**
 * 角色表单组件
 */

import React, { useEffect, useState } from 'react';
import { Modal } from 'antd';
import { ProForm, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import type { Role, Permission } from '@zyerp/shared';

import { permissionService } from '../../permission-management/services/permission.service';
import PermissionTree from './PermissionTree';
import { useMessage } from '@/shared/hooks/useMessage';

export interface RoleFormData {
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
  const formRef = React.useRef<ProFormInstance<RoleFormData> | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // 获取所有权限
  const fetchPermissions = React.useCallback(async () => {
    try {
      const data = await permissionService.getAllPermissions();
      setPermissions(data);
    } catch {
      message.error('获取权限列表失败');
    }
  }, [message]);

  useEffect(() => {
    if (visible) {
      void fetchPermissions();
    }
  }, [visible, fetchPermissions]);

  useEffect(() => {
    if (visible) {
      const rolePermissions = role?.permissions || [];
      setSelectedPermissions(rolePermissions.map(p => String(p.id)));
    }
  }, [visible, role]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await formRef.current?.validateFields?.();
      
      if (!values) return;

      const submitData: RoleFormData = {
        name: values.name,
        description: values.description,
        permissionIds: selectedPermissions,
      };
      
      await onSubmit(submitData);
      formRef.current?.resetFields?.();
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
      onOk={() => { void handleSubmit(); }}
      confirmLoading={loading}
      width={500}
      destroyOnClose
    >
      <ProForm<RoleFormData>
        name="roleForm"
        formRef={formRef}
        initialValues={{ name: role?.name ?? '', description: role?.description ?? '' }}
        layout="vertical"
        submitter={false}
      >
        <ProFormText
          name="name"
          label="角色名称"
          rules={[{ required: true, message: '请输入角色名称' }, { max: 50 }]}
        />
        <ProFormTextArea
          name="description"
          label="角色描述"
          fieldProps={{ rows: 3 }}
          rules={[{ max: 200 }]}
        />
        <PermissionTree
          permissions={permissions}
          selectedPermissions={selectedPermissions}
          onChange={handlePermissionTreeChange}
        />
      </ProForm>
    </Modal>
  );
};

export default RoleForm;
