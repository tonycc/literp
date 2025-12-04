import React, { useState, useRef } from 'react';
import { Button, Row, Col, Modal, Tag } from 'antd';
import type { ActionType } from '@ant-design/pro-components';
import { useMessage } from '@/shared/hooks/useMessage';
import { useModal } from '@/shared/hooks/useModal';
import type { Supplier, CreateSupplierData } from '@zyerp/shared';
import { SupplierStatus } from '@zyerp/shared';
import { supplierService } from '../services/supplier.service';
import { useSupplier } from '../hooks/useSupplier';
import SupplierForm from '../components/SupplierForm';
import SupplierList from '../components/SupplierList';

const SupplierManagement: React.FC = () => {
  // 状态管理
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  
  // 弹窗状态
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const actionRef = useRef<ActionType | undefined>(undefined);

  // 使用 message hook
  const message = useMessage();
  const modal = useModal();
  const { handleCreate, handleUpdate, handleDelete } = useSupplier();

  const renderStatus = (status: SupplierStatus) => {
    const statusConfig = {
      [SupplierStatus.ACTIVE]: { color: 'green', text: '启用' },
      [SupplierStatus.INACTIVE]: { color: 'gray', text: '停用' },
    };
    
    const config = statusConfig[status] || { color: 'default', text: '未知' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 处理新增供应商
  const handleAddSupplier = () => {
    setEditingSupplier(null);
    setFormModalVisible(true);
  };

  // 处理编辑供应商
  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormModalVisible(true);
  };

  // 保存供应商
  const handleSaveSupplier = async (formData: CreateSupplierData) => {
    try {
      if (editingSupplier?.id) {
        // 编辑模式
        await handleUpdate(editingSupplier.id, { id: editingSupplier.id, ...formData })
      } else {
        // 新增模式
        await handleCreate(formData)
      }
      setFormModalVisible(false);
      setEditingSupplier(null);
      await actionRef.current?.reload?.();
    } catch {
      message.error('操作失败，请重试');
    }
  };

  // 处理查看供应商详情
  const handleViewSupplier = (supplier: Supplier) => {
    setViewingSupplier(supplier);
    setViewModalVisible(true);
  };

  // 处理删除供应商
  const handleDeleteSupplier = (supplierId: string) => {
    modal.confirm({
      title: '确认删除',
      content: '确定要删除这个供应商吗？删除后无法恢复。',
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          await handleDelete(String(supplierId))
          message.success('删除成功');
          await actionRef.current?.reload?.();
        } catch {
          message.error('删除失败');
        }
      }
    });
  };

  // 处理批量状态变更
  const handleBatchStatusChange = async (status: SupplierStatus) => {
    try {
      await Promise.all(selectedRowKeys.map(async (id) => supplierService.update(String(id), { id: String(id), status })))
      setSelectedRowKeys([]);
      message.success(`批量${status === SupplierStatus.ACTIVE ? '启用' : '停用'}成功`);
      await actionRef.current?.reload?.();
    } catch {
      message.error('操作失败');
    }
  };

  // 处理批量删除
  const handleBatchDelete = () => {
    modal.confirm({
      title: '确认批量删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个供应商吗？删除后无法恢复。`,
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          await Promise.all(selectedRowKeys.map(async (id) => supplierService.delete(String(id))))
          setSelectedRowKeys([]);
          message.success('批量删除成功');
          await actionRef.current?.reload?.();
        } catch {
          message.error('删除失败');
        }
      }
    });
  };

  // 处理导入供应商
  const handleImportSuppliers = () => {
    message.info('导入功能开发中...');
  };

  // 处理导出供应商
  const handleExportSuppliers = () => {
    message.info('导出功能开发中...');
  };

  return (
    <div style={{ padding: '0' }}>
      <SupplierList
        actionRef={actionRef}
        selectedRowKeys={selectedRowKeys}
        onSelectChange={setSelectedRowKeys}
        onAdd={handleAddSupplier}
        onEdit={handleEditSupplier}
        onView={handleViewSupplier}
        onDelete={(id) => void handleDeleteSupplier(id)}
        onBatchStatusChange={(status) => void handleBatchStatusChange(status)}
        onBatchDelete={() => void handleBatchDelete()}
        onImport={handleImportSuppliers}
        onExport={handleExportSuppliers}
      />

      {/* 查看详情弹窗 */}
      <Modal
        title="供应商详情"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {viewingSupplier && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <p><strong>供应商编码：</strong>{viewingSupplier.code}</p>
                <p><strong>供应商名称：</strong>{viewingSupplier.name}</p>
                <p><strong>简称：</strong>{viewingSupplier.shortName || '-'}</p>
                <p><strong>状态：</strong>{renderStatus(viewingSupplier.status)}</p>
                <p><strong>分类：</strong><Tag>{viewingSupplier.category}</Tag></p>
              </Col>
              <Col span={12}>
                <p><strong>联系人：</strong>{viewingSupplier.contactName || '-'}</p>
                <p><strong>联系电话：</strong>{viewingSupplier.phone || '-'}</p>
                <p><strong>邮箱：</strong>{viewingSupplier.email || '-'}</p>
                <p><strong>地址：</strong>{viewingSupplier.address || '-'}</p>
                <p><strong>注册资本：</strong>{viewingSupplier.registeredCapital ?? '-'}</p>
                <p><strong>信用等级：</strong>{viewingSupplier.creditLevel ?? '-'}</p>
              </Col>
            </Row>
            {viewingSupplier.remark && (
              <Row>
                <Col span={24}>
                  <p><strong>备注：</strong>{viewingSupplier.remark}</p>
                </Col>
              </Row>
            )}
            <Row>
              <Col span={12}>
                <p><strong>创建时间：</strong>{new Date(viewingSupplier.createdAt).toLocaleString()}</p>
              </Col>
              <Col span={12}>
                <p><strong>更新时间：</strong>{new Date(viewingSupplier.updatedAt).toLocaleString()}</p>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* 新增/编辑供应商表单 */}
      <SupplierForm
        visible={formModalVisible}
        editingSupplier={editingSupplier}
        onSubmit={handleSaveSupplier}
        onCancel={() => {
          setFormModalVisible(false);
          setEditingSupplier(null);
        }}
      />
    </div>
  );
};

export default SupplierManagement;
