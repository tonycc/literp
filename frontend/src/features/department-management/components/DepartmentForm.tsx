/**
 * 部门表单组件
 */

import React, { useEffect } from 'react';
import {
  Form,
  Input,
  TreeSelect,
  Switch,
  Button,
  Space,
  Card,
  Typography,
} from 'antd';
import { useDepartmentTree } from '../hooks/useDepartments';
import type { Department, CreateDepartmentData, UpdateDepartmentData } from '@zyerp/shared';

const { Title } = Typography;

interface TreeSelectNode {
  title: string;
  value: string;
  key: string;
  disabled?: boolean;
  children?: TreeSelectNode[];
}
const { TextArea } = Input;

interface DepartmentFormProps {
  department?: Department;
  onSubmit: (data: CreateDepartmentData | UpdateDepartmentData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const DepartmentForm: React.FC<DepartmentFormProps> = ({
  department,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const { tree, loading: treeLoading } = useDepartmentTree();

  // 初始化表单数据
  useEffect(() => {
    if (department) {
      form.setFieldsValue({
        name: department.name,
        description: department.description,
        parentId: department.parentId,
      });
    } else {
      form.resetFields();
    }
  }, [department, form]);

  // 处理表单提交
  const handleSubmit = async (values: {
    name: string;
    description?: string;
    parentId?: string;
    status?: boolean;
  }) => {
    const formData = {
      name: values.name,
      description: values.description,
      parentId: values.parentId || undefined,
      ...(department && { status: values.status ? 'active' as const : 'inactive' as const }),
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
    <Card>
      <Title level={4} style={{ marginBottom: 24 }}>
        {department ? '编辑部门' : '新增部门'}
      </Title>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          label="部门名称"
          name="name"
          rules={[
            { required: true, message: '请输入部门名称' },
            { max: 50, message: '部门名称不能超过50个字符' },
          ]}
        >
          <Input placeholder="请输入部门名称" />
        </Form.Item>

        <Form.Item
          label="上级部门"
          name="parentId"
          help="不选择则为顶级部门"
        >
          <TreeSelect
            placeholder="请选择上级部门"
            allowClear
            treeData={treeData}
            loading={treeLoading}
            showSearch
            treeNodeFilterProp="title"
            styles={{
              popup: {
                root: { maxHeight: 400, overflow: 'auto' }
              }
            }}
          />
        </Form.Item>

        <Form.Item
          label="部门描述"
          name="description"
          rules={[
            { max: 200, message: '部门描述不能超过200个字符' },
          ]}
        >
          <TextArea
            placeholder="请输入部门描述"
            rows={4}
            showCount
            maxLength={200}
          />
        </Form.Item>

        {department && (
          <Form.Item
            label="状态"
            name="status"
            valuePropName="checked"
          >
            <Switch
              checkedChildren="启用"
              unCheckedChildren="禁用"
            />
          </Form.Item>
        )}

        <Form.Item style={{ marginBottom: 0 }}>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
            >
              {department ? '更新' : '创建'}
            </Button>
            <Button onClick={onCancel}>
              取消
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};