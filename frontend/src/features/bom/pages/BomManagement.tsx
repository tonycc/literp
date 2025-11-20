import React, { useRef, useState } from 'react';
import { Modal } from 'antd';
import BomList from '../components/BomList';
import BomCreatePage from '../components/BomCreatePage';
import type { ProductBom } from '@zyerp/shared';
import type { ActionType } from '@ant-design/pro-components';

const BomManagement: React.FC = () => {
  const [isFormVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<ProductBom | undefined>(undefined);
  const tableRef = useRef<ActionType>(null);
  const handleCreate = () => {
    setEditing(undefined);
    setFormVisible(true);
  };
  const handleEdit = (_record: ProductBom) => {
    setEditing(_record);
    setFormVisible(true);
  };
  return (
    <>
      <BomList onCreate={handleCreate} onEdit={handleEdit} actionRef={tableRef} />

      <Modal 
        open={isFormVisible} 
        onCancel={() => setFormVisible(false)} 
        title={editing ? '编辑BOM' : '新建BOM'} 
        destroyOnHidden 
        width={980}
        footer={null}
      >
        <BomCreatePage 
          editing={editing} 
          onSuccess={() => { 
            setFormVisible(false); 
            setEditing(undefined); 
            void tableRef.current?.reload?.(); 
          }} 
          onCancel={() => setFormVisible(false)} 
        />
      </Modal>
    </>
  );
};
export default BomManagement;
  
