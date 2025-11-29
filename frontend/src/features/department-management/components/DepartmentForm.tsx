/**
 * 部门表单组件
 */

import React, { useEffect } from 'react';
import { ProForm, ProFormText, ProFormTreeSelect, ProFormSwitch, ProFormSelect } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { Row, Col } from 'antd';
import { useDepartmentTree } from '../hooks/useDepartments';
import type { Department, CreateDepartmentData, UpdateDepartmentData } from '@zyerp/shared';
import { getUsers } from '@/shared/services';

interface TreeSelectNode {
  title: string;
  value: string;
  key: string;
  disabled?: boolean;
  children?: TreeSelectNode[];
}

interface DepartmentFormProps {
  department?: Department;
  onSubmit: (data: CreateDepartmentData | UpdateDepartmentData) => Promise<void>;
  onCancel: (_onCancel: () => void) => void;
  loading?: boolean;
  formRef?: React.MutableRefObject<ProFormInstance<DepartmentFormValues> | undefined>;
}

export type DepartmentFormValues = {
  name: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
  managerId?: string;
};

export const DepartmentForm: React.FC<DepartmentFormProps> = ({ department, onSubmit, onCancel: _onCancel, loading: _loading = false, formRef }) => {
  const { tree, loading: treeLoading } = useDepartmentTree();

  useEffect(() => { /* 依赖 ProForm 的 initialValues，无需手动 setFields */ }, [department]);

  // 处理表单提交
  const handleSubmit = async (values: DepartmentFormValues) => {
    const formData: CreateDepartmentData | UpdateDepartmentData = {
      name: values.name,
      description: values.description,
      parentId: values.parentId || undefined,
      managerId: values.managerId || undefined,
      ...(department ? { isActive: !!values.isActive } : { isActive: values.isActive ?? true })
    };
    await onSubmit(formData);
  };

  // 转换部门树数据为TreeSelect需要的格式
  const convertTreeData = (nodes: Department[]): TreeSelectNode[] => {
    return nodes.map(node => ({
      title: node.name,
      value: String(node.id),
      key: String(node.id),
      disabled: department?.id === node.id, // 禁止选择自己作为父部门
      children: node.children ? convertTreeData(node.children) : undefined,
    }));
  };

  const treeData = convertTreeData(tree);

  return (
    
      <ProForm<DepartmentFormValues>
        name="departmentForm"
        formRef={formRef}
        initialValues={{
          name: department?.name ?? '',
          description: department?.description ?? '',
          parentId: department?.parentId ? String(department.parentId) : undefined,
          isActive: department ? department.isActive : true,
          managerId: department?.managerId ? String(department.managerId) : undefined,
        }}
        onFinish={async (v) => { await handleSubmit(v) }}
        layout="vertical"
      >
        <Row gutter={16}>
          <Col span={12}>
            <ProFormText name="name" label="部门名称" rules={[{ required: true, message: '请输入部门名称' }, { max: 50 }]} />
          </Col>
          <Col span={12}>
            <ProFormTreeSelect
              name="parentId"
              label="上级部门"
              fieldProps={{
                allowClear: true,
                showSearch: true,
                treeNodeFilterProp: 'title',
                loading: treeLoading,
                treeData: treeData,
              }}
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <ProFormSelect
              name="managerId"
              label="负责人"
              placeholder="请选择部门负责人"
              fieldProps={{
                showSearch: true,
                filterOption: (input, option) => {
                  let label = '';
                  if (typeof option === 'object' && option) {
                    const opt = option as { label?: unknown };
                    if (typeof opt.label === 'string') {
                      label = opt.label;
                    }
                  }
                  return label.toLowerCase().includes(input.toLowerCase());
                },
              }}
              request={async () => {
                const res = await getUsers({ page: 1, pageSize: 200 });
                const opts: Array<{ label: string; value: string }> = (res.data || []).map((u) => ({ label: u.username, value: String(u.id) }));
                return opts;
              }}
            />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <ProFormText name="description" label="部门描述" />
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <ProFormSwitch name="isActive" label="状态" />
          </Col>
        </Row>
      </ProForm>
  );
};
