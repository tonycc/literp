import React from 'react';
import InventoryList from '../components/InventoryList';
import { useInventory } from '../hooks/useInventory';
import { useModal } from '@/shared/hooks/useModal';

const InventoryManagementPage: React.FC = () => {
  const {
    selectedItems,
    setSelectedItems,
    handleRefresh,
  } = useInventory();
  const modal = useModal();

  return (
        <InventoryList
          onAdd={() => modal.info({ title: '新增库存', content: '功能待实现' })}
          onEdit={(item) => modal.info({ title: '编辑库存', content: `编辑 ${item.productName} 功能待实现` })}
          onView={(item) => modal.info({ title: '查看详情', content: `查看 ${item.productName} 功能待实现` })}
          onDelete={async () => Promise.resolve()}
          onRefresh={handleRefresh}
          selectedRowKeys={selectedItems.map((i) => i.id)}
          onSelectChange={(_keys, rows) => setSelectedItems(rows)}
        />
  );
};

export default InventoryManagementPage;