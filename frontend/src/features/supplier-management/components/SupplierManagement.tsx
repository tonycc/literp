import React, { useState, useRef, useEffect } from 'react';
import { Button, Space, Tag, Tooltip, Row, Col, Modal } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExportOutlined,
  ImportOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useMessage } from '@/shared/hooks/useMessage';
import { useModal } from '@/shared/hooks/useModal';
import type { Supplier, CreateSupplierData } from '@zyerp/shared';
import { SupplierStatus } from '@zyerp/shared';
import { SUPPLIER_STATUS_VALUE_ENUM_PRO } from '@/shared/constants/supplier';
import { getDict } from '@/shared/services/dictionary.service';
import { supplierService } from '../services/supplier.service';
import { useSupplier } from '../hooks/useSupplier';
// 迁移到共享类型，移除本地类型与枚举
import SupplierForm from './SupplierFormPro';

const SupplierManagement: React.FC = () => {
  // 状态管理
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [categoryValueEnum, setCategoryValueEnum] = useState<Record<string, { text: string; status?: string }>>({});
  
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

  useEffect(() => {
    void getDict('supplier_category').then((res) => {
      setCategoryValueEnum(res.valueEnum);
    });
  }, []);

  // 状态渲染函数
  const renderStatus = (status: SupplierStatus) => {
    const statusConfig = {
      [SupplierStatus.ACTIVE]: { color: 'green', text: '启用' },
      [SupplierStatus.INACTIVE]: { color: 'gray', text: '停用' },
      
    };
    
    const config = statusConfig[status] || { color: 'default', text: '未知' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const renderCategory = (category: string) => {
    const item = categoryValueEnum[category];
    const statusColorMap: Record<string, string> = {
      Success: 'green',
      Processing: 'blue',
      Error: 'red',
      Warning: 'orange',
      Default: 'default',
    };
    const color = item?.status ? statusColorMap[item.status] : 'default';
    return <Tag color={color}>{item?.text || category}</Tag>;
  };

  // 表格列定义
  const columns: ProColumns<Supplier>[] = [
    {
      title: '供应商编码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      fixed: 'left',
      hideInSearch: true
    },
    {
      title: '供应商名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      fixed: 'left',
      render: (_, record: Supplier) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.name}</div>
          {record.shortName && (
            <div style={{ fontSize: '12px', color: '#666' }}>{record.shortName}</div>
          )}
        </div>
      )
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      valueType: 'select',
      valueEnum: categoryValueEnum,
      render: (_, record: Supplier) => renderCategory(record.category)
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      valueType: 'select',
      valueEnum: SUPPLIER_STATUS_VALUE_ENUM_PRO,
      render: (_, record: Supplier) => renderStatus(record.status)
    },
    {
      title: '联系人',
      dataIndex: 'contactName',
      key: 'contactPerson',
      width: 100,
      hideInSearch: true
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'contactPhone',
      width: 120,
      hideInSearch: true
    },
    
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      hideInSearch: true,
      render: (_, record: Supplier) => new Date(record.createdAt).toLocaleString()
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: 200,
      render: (_, record: Supplier) => [
        <Tooltip key="view" title="查看详情">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewSupplier(record)}
          />
        </Tooltip>,
        <Tooltip key="edit" title="编辑">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditSupplier(record)}
          />
        </Tooltip>,
        <Tooltip key="delete" title="删除">
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => void handleDeleteSupplier(record.id)}
          />
        </Tooltip>
      ]
    }
  ];

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

  // 处理表格选择
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    }
  };

  return (
    <div style={{ padding: '0' }}>
      <ProTable<Supplier>
        headerTitle="供应商管理"
        columns={columns}
        actionRef={actionRef}
        rowKey="id"
        rowSelection={rowSelection}
        scroll={{ x: 1500 }}
        request={async (params) => {
          const resp = await supplierService.getList(params)
          return {
            data: resp.data,
            success: resp.success,
            total: resp.total,
          }
        }}
        search={{
          labelWidth: 'auto',
          span: 6,
          defaultCollapsed: false,
          collapsed: true,
        }}
        toolBarRender={() => [
          <Button
            key="import"
            icon={<ImportOutlined />}
            onClick={() => handleImportSuppliers()}
          >
            导入供应商
          </Button>,
          <Button
            key="export"
            icon={<ExportOutlined />}
            onClick={() => handleExportSuppliers()}
          >
            导出供应商
          </Button>,
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleAddSupplier()}
          >
            新增供应商
          </Button>
        ]}
        tableAlertRender={({ selectedRowKeys, onCleanSelected }) => (
          <Space size={24}>
            <span>
              已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项
              <a style={{ marginLeft: 8 }} onClick={onCleanSelected}>
                取消选择
              </a>
            </span>
          </Space>
        )}
        tableAlertOptionRender={({ selectedRowKeys }) => (
          <Space size={16}>
            <Button
              size="small"
              onClick={() => void handleBatchStatusChange(SupplierStatus.ACTIVE)}
              disabled={selectedRowKeys.length === 0}
            >
              批量启用
            </Button>
            <Button
              size="small"
              onClick={() => void handleBatchStatusChange(SupplierStatus.INACTIVE)}
              disabled={selectedRowKeys.length === 0}
            >
              批量停用
            </Button>
            <Button
              size="small"
              danger
              onClick={() => void handleBatchDelete()}
              disabled={selectedRowKeys.length === 0}
            >
              批量删除
            </Button>
          </Space>
        )}
        onSubmit={(params) => {
          // ProTable的搜索提交处理
          console.log('搜索参数:', params);
        }}
        onReset={() => {
          // ProTable的重置处理
          console.log('重置搜索');
        }}
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
                <p><strong>分类：</strong>{renderCategory(viewingSupplier.category)}</p>
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
