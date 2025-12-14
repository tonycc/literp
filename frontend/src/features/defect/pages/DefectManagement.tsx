import React, { useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import type { ActionType } from '@ant-design/pro-components';
import { DefectService } from '../services/defect.service';
import type { Defect } from '../services/defect.service';
import { useMessage } from '@/shared/hooks';
import { DefectList } from '../components/DefectList';
import { DefectForm } from '../components/DefectForm';

const DefectManagement: React.FC = () => {
  const actionRef = useRef<ActionType | undefined>(undefined);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentDefect, setCurrentDefect] = useState<Defect | null>(null);
  const message = useMessage();

  const handleAdd = () => {
    setCurrentDefect(null);
    setModalVisible(true);
  };

  const handleEdit = (record: Defect) => {
    setCurrentDefect(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await DefectService.delete(id);
      message.success('删除成功');
      void actionRef.current?.reload();
    } catch (error) {
      console.error(error);
    }
  };

  const handleFinish = async (values: Partial<Defect>) => {
    try {
      if (currentDefect) {
        await DefectService.update(currentDefect.id, values);
        message.success('更新成功');
      } else {
        await DefectService.create(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      void actionRef.current?.reload();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <PageContainer>
      <DefectList
        actionRef={actionRef}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <DefectForm
        open={modalVisible}
        onOpenChange={setModalVisible}
        values={currentDefect}
        onSubmit={handleFinish}
      />
    </PageContainer>
  );
};

export default DefectManagement;
