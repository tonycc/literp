import React from 'react';
import { Modal } from 'antd';
import ProductVariantsList from '@/features/product-variants/components/ProductVariantsList';

interface ProductVariantsModalProps {
  productId: string;
  productName: string;
  visible: boolean;
  onClose: () => void;
}

const ProductVariantsModal: React.FC<ProductVariantsModalProps> = ({
  productId,
  productName,
  visible,
  onClose
}) => {
  return (
    <Modal
      title={`${productName} - 变体管理`}
      open={visible}
      onCancel={onClose}
      width={1200}
      footer={null}
      destroyOnHidden
    >
      <ProductVariantsList productId={productId} />
    </Modal>
  );
};

export default ProductVariantsModal;