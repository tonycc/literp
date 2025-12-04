import React, { useState, useRef } from 'react';
import { useMessage } from '@/shared/hooks/useMessage';
import { supplierPriceService } from '../services/supplier-price.service';
import type { ActionType } from '@ant-design/pro-components';
import SupplierPriceList from '../components/SupplierPriceList';
import type { SupplierPrice } from '@zyerp/shared';
import SupplierPriceForm from '../components/SupplierPriceForm';

interface SupplierPriceManagementProps {
  className?: string;
}

const SupplierPriceManagement: React.FC<SupplierPriceManagementProps> = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editingPrice, setEditingPrice] = useState<SupplierPrice | null>(null);
  const actionRef = useRef<ActionType | undefined>(undefined);
  const message = useMessage();  

  // 表格列定义
  

  // 新增价格
  const handleAdd = () => {
    setEditingPrice(null);
    setFormVisible(true);
  };

  // 编辑价格
  const handleEdit = (record: SupplierPrice) => {
    setEditingPrice(record);
    setFormVisible(true);
  };


  return (
    <div style={{ padding:0 }}>
      <SupplierPriceList
        actionRef={actionRef}
        selectedRowKeys={selectedRowKeys}
        onSelectChange={(keys) => setSelectedRowKeys(keys)}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={async (id) => {
          await supplierPriceService.delete(id)
        }}
      />
      {formVisible && (
        <SupplierPriceForm
          visible={formVisible}
          editingPrice={editingPrice}
          onCancel={() => { setFormVisible(false); setEditingPrice(null); }}
          onSubmit={async (values) => {
            try {
              if (editingPrice?.id) {
                await supplierPriceService.update(editingPrice.id, values as SupplierPrice)
                message.success('更新成功')
              } else {
                await supplierPriceService.create(values as SupplierPrice)
                message.success('创建成功')
              }
              setFormVisible(false)
              setEditingPrice(null)
              await actionRef.current?.reload?.()
            } catch {
              message.error('保存失败')
            }
          }}
        />
      )}
    </div>
  );
};

export default SupplierPriceManagement;