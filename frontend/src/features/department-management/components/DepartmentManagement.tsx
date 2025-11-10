/**
 * 部门管理主页面
 */

import React, { useState } from 'react';
import { Tabs, Modal, Button, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { DepartmentList } from './DepartmentList';
import { DepartmentForm } from './DepartmentForm';
import { DepartmentTree } from './DepartmentTree';
import { useDepartmentActions } from '../hooks/useDepartments';
import type { Department, CreateDepartmentData, UpdateDepartmentData } from '@fennec/shared';

export const DepartmentManagement: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  const { createDepartment, updateDepartment, loading } = useDepartmentActions();

  // 处理新增部门
  const handleAdd = () => {
    setEditingDepartment(undefined);
    setIsModalVisible(true);
  };

  // 处理编辑部门
  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setIsModalVisible(true);
  };

  // 处理表单提交
  const handleSubmit = async (data: CreateDepartmentData | UpdateDepartmentData) => {
    try {
      if (editingDepartment) {
        await updateDepartment(String(editingDepartment.id), data as UpdateDepartmentData);
      } else {
        await createDepartment(data as CreateDepartmentData);
      }
      setIsModalVisible(false);
      setEditingDepartment(undefined);
      setRefreshKey(prev => prev + 1); // 触发刷新
    } catch {
      // 错误已在 hook 中处理
    }
  };

  // 处理取消
  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingDepartment(undefined);
  };

  const tabItems = [
    {
      key: 'list',
      label: '部门列表',
      children: (
        <DepartmentList
          onEdit={handleEdit}
          key={`list-${refreshKey}`}
        />
      ),
    },
    {
      key: 'tree',
      label: '部门结构',
      children: (
        <DepartmentTree
          key={`tree-${refreshKey}`}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: 0 }}>
      <Card>
         <Tabs
        defaultActiveKey="list"
        items={tabItems}
        size="large"
        tabBarExtraContent={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            新增部门
          </Button>
        }
       />
      </Card>

      {/* 部门表单弹窗 */}
      <Modal
        title={editingDepartment ? '编辑部门' : '新增部门'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
        destroyOnHidden
      >
        <DepartmentForm
          department={editingDepartment}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      </Modal>
    </div>
  );
};

export default DepartmentManagement;