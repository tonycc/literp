import React, { useRef, useState } from 'react';
import type { ActionType } from '@ant-design/pro-components';
import type { SalesReceiptInfo } from '@zyerp/shared';
import { SalesReceiptForm } from '../components/SalesReceiptForm';
import { SalesReceiptList } from '../components/SalesReceiptList';
import { SalesReceiptDetail } from '../components/SalesReceiptDetail';

const SalesReceiptManagement: React.FC = () => {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState<SalesReceiptInfo | null>(null);

  return (
    <>
      <SalesReceiptList
        actionRef={actionRef}
        onCreate={() => {
          setCreateModalVisible(true);
        }}
        onView={(record) => {
          setCurrentReceipt(record);
          setDetailVisible(true);
        }}
      />
      <SalesReceiptForm
        visible={createModalVisible}
        onVisibleChange={setCreateModalVisible}
        onSuccess={() => {
          setCreateModalVisible(false);
          void actionRef.current?.reload();
        }}
      />
      <SalesReceiptDetail
        visible={detailVisible}
        receiptId={currentReceipt?.id}
        onClose={() => {
          setDetailVisible(false);
          setCurrentReceipt(null);
        }}
      />
    </>
  );
};

export default SalesReceiptManagement;
