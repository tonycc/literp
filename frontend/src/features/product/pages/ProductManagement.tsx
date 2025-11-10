import React, { useState, useRef } from 'react';
import type { ActionType } from '@ant-design/pro-table';
import type { ProductInfo, ProductFormData } from '@zyerp/shared';
import ProductList from '../components/ProductList';
import ProductForm from '../components/ProductForm';
import ProductDetail from '../components/ProductDetail';
import { useProduct } from '../hooks/useProduct';

const ProductManagement: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductInfo | undefined>();
  const [viewingProductId, setViewingProductId] = useState<string | undefined>();
  const actionRef = useRef<ActionType>(null);
  
  const {
    createProduct,
    updateProduct,
    deleteProduct,
    copyProduct,
    fetchProducts
  } = useProduct();

  // 新增产品
  const handleAdd = () => {
    setEditingProduct(undefined);
    setIsModalVisible(true);
  };

  // 编辑产品
  const handleEdit = (product: ProductInfo) => {
    setEditingProduct(product);
    setIsModalVisible(true);
  };

  // 查看产品详情
  const handleView = (product: ProductInfo) => {
    setViewingProductId(product.id);
    setIsDetailVisible(true);
  };

  // 提交表单
  const handleSubmit = async (values: ProductFormData) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, values);
      } else {
        await createProduct(values);
      }
      
      setIsModalVisible(false);
      setEditingProduct(undefined);
      actionRef.current?.reload(); // 手动刷新 ProTable
    } catch {
      // 操作失败时的错误处理
    }
  };

  // 取消操作
  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingProduct(undefined);
  };

  // 关闭详情页面
  const handleDetailClose = () => {
    setIsDetailVisible(false);
    setViewingProductId(undefined);
  };

  // 删除产品处理
  const handleDelete = async (id: string) => {
    await deleteProduct(id);
    actionRef.current?.reload(); // 手动刷新 ProTable
  };

  // 复制产品处理
  const handleCopy = async (id: string) => {
    await copyProduct(id);
    actionRef.current?.reload(); // 手动刷新 ProTable
  };

  return (
    <div>
      {/* 产品列表 */}
      <ProductList
        actionRef={actionRef}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        onCopy={handleCopy}
        onRefresh={fetchProducts}
      />

      {/* 新增/编辑模态框 */}
      <ProductForm
        product={editingProduct}
        visible={isModalVisible}
        onSave={handleSubmit}
        onCancel={handleCancel}
        loading={false}
      />

      {/* 产品详情模态框 */}
      <ProductDetail
        visible={isDetailVisible}
        productId={viewingProductId}
        onClose={handleDetailClose}
      />
    </div>
  );
};

export default ProductManagement;