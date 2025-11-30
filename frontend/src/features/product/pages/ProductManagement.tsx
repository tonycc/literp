import React, { useState, useRef } from 'react';
import type { ActionType } from '@ant-design/pro-components';
import { useMessage } from '@/shared/hooks';
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
    createProductWithVariants,
    updateProduct, 
    deleteProduct, 
    copyProduct, 
    fetchProducts, 
    loading
  } = useProduct();
  const message = useMessage();

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
  type ExtendedProductFormData = Omit<ProductFormData, 'categoryId'> & { categoryCode?: string; singleAttributeId?: string; singleAttributeName?: string; singleAttributeValue?: string };
  const handleSubmit = async (values: ExtendedProductFormData): Promise<void> => {
    try {
      const { categoryCode, singleAttributeName, singleAttributeValue, ...baseData } = values;
      const productData: ProductFormData = { ...baseData, categoryId: categoryCode as string };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        message.success('产品更新成功');
      } else {
        const hasVariantAttrs = !!(singleAttributeName && singleAttributeValue);
        if (hasVariantAttrs) {
          const variantGenerateAttributes = [{ attributeName: singleAttributeName, values: [singleAttributeValue] }];
          const attributeLines = [{ attributeName: singleAttributeName, values: [singleAttributeValue] }];
          await createProductWithVariants({ ...productData, variantGenerateAttributes, attributeLines });
          message.success('产品及变体创建成功');
        } else {
          await createProduct(productData);
          message.success('产品创建成功');
        }
      }
      setIsModalVisible(false);
      setEditingProduct(undefined);
      await actionRef.current?.reload();
    } catch (error) {
      console.error('产品保存失败:', error);
      message.error('操作失败，请重试');
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
    await actionRef.current?.reload(); // 手动刷新 ProTable
  };

  // 复制产品处理
  const handleCopy = async (id: string) => {
    await copyProduct(id);
    await actionRef.current?.reload(); // 手动刷新 ProTable
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
        onRefresh={() => { void fetchProducts(); }}
        
      />

      {/* 新增/编辑模态框 */}
      <ProductForm
        product={editingProduct}
        visible={isModalVisible}
        onSave={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
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
