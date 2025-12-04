import React, { useState, useRef } from 'react';
import { Modal } from 'antd';
import type { ActionType } from '@ant-design/pro-components';
import { useCustomerPriceList } from '../hooks/useCustomerPriceList';
import CustomerPriceListList from '../components/CustomerPriceListList';
import CustomerPriceListForm from '../components/CustomerPriceListForm';
import { customerPriceListService } from '../services/customer-price-list.service';
import type { UpdateCustomerPriceListData, CreateCustomerPriceListData } from '../types';

const CustomerPriceListPage: React.FC = () => {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentId, setCurrentId] = useState<string | undefined>(undefined);
  const [initialValues, setInitialValues] = useState<UpdateCustomerPriceListData | undefined>(undefined);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const { 
    loading, 
    handleCreate, 
    handleUpdate, 
    handleDelete, 
    handleBatchDelete 
  } = useCustomerPriceList(() => { void actionRef.current?.reload(); });

  const handleAdd = () => {
    setCurrentId(undefined);
    setInitialValues(undefined);
    setModalVisible(true);
  };

  const handleEdit = async (id: string) => {
    try {
      const res = await customerPriceListService.getById(id);
      if (res.success && res.data) {
        setCurrentId(id);
        setInitialValues(res.data as unknown as UpdateCustomerPriceListData);
        setModalVisible(true);
      }
    } catch (error) {
      console.error('Failed to fetch customer price list detail', error);
    }
  };

  const handleSubmit = async (values: CreateCustomerPriceListData | UpdateCustomerPriceListData) => {
    let success = false;
    if (currentId) {
      success = await handleUpdate(currentId, values as UpdateCustomerPriceListData);
    } else {
      success = await handleCreate(values as CreateCustomerPriceListData);
    }

    if (success) {
      setModalVisible(false);
    }
  };

  return (
    <>
      <CustomerPriceListList
        actionRef={actionRef}
        onAdd={handleAdd}
        onEdit={(id) => { void handleEdit(id); }}
        onDelete={handleDelete}
        onBatchDelete={(ids) => { void handleBatchDelete(ids); }}
        selectedRowKeys={selectedRowKeys}
        onSelectChange={(keys) => setSelectedRowKeys(keys)}
      />
      <Modal
        title={currentId ? '编辑客户价格表' : '新增客户价格表'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <CustomerPriceListForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </Modal>
    </>
  );
};

export default CustomerPriceListPage;
