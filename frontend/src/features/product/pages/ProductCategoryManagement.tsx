import React, { useState } from 'react';
import { Modal } from 'antd';
import type { ProductCategoryInfo, ProductCategoryFormData } from '@zyerp/shared';
import ProductCategoryList from '../components/ProductCategoryList';
import ProductCategoryForm from '../components/ProductCategoryForm';
import { useProductCategory } from '../hooks/useProductCategory';

const ProductCategoryManagement: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategoryInfo | undefined>();
  
  const { 
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    fetchCategories
  } = useProductCategory();

  // 新增产品类目
  const handleAdd = () => {
    setEditingCategory(undefined);
    setIsModalVisible(true);
  };

  // 编辑产品类目
  const handleEdit = (category: ProductCategoryInfo) => {
    setEditingCategory(category);
    setIsModalVisible(true);
  };

  // 提交表单
  const handleSubmit = async (values: ProductCategoryFormData) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, values);
      } else {
        await createCategory(values);
      }
      
      setIsModalVisible(false);
      setEditingCategory(undefined);
      // 不再需要手动刷新，ProTable会自动刷新
    } catch {
      // 操作失败时的错误处理
    }
  };

  // 删除产品类目
  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      // 不再需要手动刷新，ProTable会自动刷新
    } catch {
      // 删除失败时的错误处理
    }
  };

  // 切换状态
  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      await toggleCategoryStatus(id, isActive);
      // 不再需要手动刷新，ProTable会自动刷新
    } catch {
      // 状态切换失败时的错误处理
    }
  };

  // 取消操作
  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingCategory(undefined);
  };

  return (
    <div>

      {/* 产品类型列表 */}
      <ProductCategoryList
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        onRefresh={fetchCategories}
      />

      {/* 新增/编辑模态框 */}
      <Modal
        title={editingCategory ? '编辑产品类目' : '新增产品类目'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
        destroyOnHidden
      >
        <ProductCategoryForm
          initialValues={editingCategory}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={false}
          mode={editingCategory ? 'edit' : 'create'}
        />
      </Modal>
    </div>
  );
};

export default ProductCategoryManagement;