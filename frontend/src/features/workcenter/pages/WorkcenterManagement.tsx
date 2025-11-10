import React from 'react';
import { Modal } from 'antd';
import WorkcenterList from '../components/WorkcenterList';
import WorkcenterForm from '../components/WorkcenterForm';
import { useWorkcenter } from '../hooks/useWorkcenter';

const WorkcenterManagement: React.FC = () => {
  const {
    form,
    actionRef,
    isModalVisible,
    editingRecord,
    loading,
    handleCreate,
    handleEdit,
    handleSave,
    handleCancel,
  } = useWorkcenter();

  return (
    <>
      <WorkcenterList
        actionRef={actionRef}
        onEdit={handleEdit}
        onAdd={handleCreate}
      />

      {/* 工作中心表单弹窗 */}
      <Modal
        title={editingRecord ? '编辑工作中心' : '新建工作中心'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
        destroyOnClose
      >
        <WorkcenterForm
          form={form}
          initialValues={editingRecord || {}}
          onSubmit={handleSave}
          onCancel={handleCancel}
          loading={loading}
        />
      </Modal>
    </>
  );
};

export default WorkcenterManagement;