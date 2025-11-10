import React, { useState, useEffect } from 'react';
import {
  Button,
  Space,
  Tag,
  Rate,
  Tooltip,
  Modal,
  Row,
  Col
} from 'antd';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExportOutlined,
  ImportOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useMessage } from '../../../shared/hooks/useMessage';
import type {
  Supplier,
  SupplierQueryParams,
  SupplierFormData
} from '../types';
import {
  SupplierStatus,
  SupplierType,
  SupplierLevel
} from '../types';
import SupplierForm from './SupplierForm';

const SupplierManagement: React.FC = () => {
  // 状态管理
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [queryParams, setQueryParams] = useState<SupplierQueryParams>({
    page: 1,
    pageSize: 10
  });
  
  // 弹窗状态
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // 使用 message hook
  const message = useMessage();

  // 模拟数据
  const mockSuppliers: Supplier[] = [
    {
      id: '1',
      code: 'SUP001',
      name: '深圳市科技有限公司',
      shortName: '深圳科技',
      type: SupplierType.MANUFACTURER,
      level: SupplierLevel.A,
      status: SupplierStatus.ACTIVE,
      contactPerson: '张经理',
      contactPhone: '13800138001',
      contactEmail: 'zhang@example.com',
      website: 'www.example.com',
      address: '深圳市南山区科技园',
      city: '深圳',
      province: '广东',
      country: '中国',
      postalCode: '518000',
      taxNumber: '91440300123456789X',
      bankName: '中国银行',
      bankAccount: '1234567890123456',
      paymentTerms: '月结30天',
      creditLimit: 1000000,
      mainProducts: '电子元器件',
      businessScope: '电子产品研发、生产、销售',
      certifications: ['ISO9001', 'ISO14001'],
      qualityRating: 4.5,
      deliveryRating: 4.2,
      serviceRating: 4.8,
      overallRating: 4.5,
      remark: '优质供应商',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15'),
      createdBy: 'admin',
      updatedBy: 'admin'
    },
    {
      id: '2',
      code: 'SUP002',
      name: '上海物流配送有限公司',
      shortName: '上海物流',
      type: SupplierType.SERVICE_PROVIDER,
      level: SupplierLevel.B,
      status: SupplierStatus.ACTIVE,
      contactPerson: '李主管',
      contactPhone: '13800138002',
      contactEmail: 'li@logistics.com',
      address: '上海市浦东新区物流园区',
      city: '上海',
      province: '上海',
      country: '中国',
      postalCode: '200000',
      mainProducts: '物流配送服务',
      businessScope: '货物运输、仓储、配送',
      qualityRating: 4.0,
      deliveryRating: 4.5,
      serviceRating: 4.2,
      overallRating: 4.2,
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-20'),
      createdBy: 'admin',
      updatedBy: 'admin'
    }
  ];

  // 初始化数据
  useEffect(() => {
    loadSuppliers();
  }, [queryParams]);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 直接设置模拟数据，ProTable会自动处理搜索和筛选
      setSuppliers(mockSuppliers);
    } catch {
      message.error('加载供应商列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 状态渲染函数
  const renderStatus = (status: SupplierStatus) => {
    const statusConfig = {
      [SupplierStatus.ACTIVE]: { color: 'green', text: '启用' },
      [SupplierStatus.INACTIVE]: { color: 'gray', text: '停用' },
      [SupplierStatus.SUSPENDED]: { color: 'orange', text: '暂停' },
      [SupplierStatus.BLACKLISTED]: { color: 'red', text: '黑名单' }
    };
    
    const config = statusConfig[status] || { color: 'default', text: '未知' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 供应商类型渲染函数
  const renderType = (type: SupplierType) => {
    const typeConfig = {
      [SupplierType.MANUFACTURER]: { color: 'blue', text: '制造商' },
      [SupplierType.DISTRIBUTOR]: { color: 'green', text: '分销商' },
      [SupplierType.SERVICE_PROVIDER]: { color: 'orange', text: '服务商' },
      [SupplierType.TRADING_COMPANY]: { color: 'purple', text: '贸易公司' }
    };
    
    const config = typeConfig[type] || { color: 'default', text: '未知' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 供应商等级渲染函数
  const renderLevel = (level: SupplierLevel) => {
    const levelConfig = {
      [SupplierLevel.A]: { color: 'gold', text: 'A级' },
      [SupplierLevel.B]: { color: 'lime', text: 'B级' },
      [SupplierLevel.C]: { color: 'orange', text: 'C级' },
      [SupplierLevel.D]: { color: 'red', text: 'D级' }
    };
    
    const config = levelConfig[level] || { color: 'default', text: '未知' };
    return <Tag color={config.color}>{config.text}</Tag>;
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
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      valueType: 'select',
      valueEnum: {
        [SupplierType.MANUFACTURER]: { text: '制造商', status: 'Default' },
        [SupplierType.DISTRIBUTOR]: { text: '分销商', status: 'Success' },
        [SupplierType.SERVICE_PROVIDER]: { text: '服务商', status: 'Warning' },
        [SupplierType.TRADING_COMPANY]: { text: '贸易公司', status: 'Processing' }
      },
      render: (_, record: Supplier) => renderType(record.type)
    },
    {
      title: '等级',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      valueType: 'select',
      valueEnum: {
        [SupplierLevel.A]: { text: 'A级', status: 'Success' },
        [SupplierLevel.B]: { text: 'B级', status: 'Default' },
        [SupplierLevel.C]: { text: 'C级', status: 'Warning' },
        [SupplierLevel.D]: { text: 'D级', status: 'Error' }
      },
      render: (_, record: Supplier) => renderLevel(record.level)
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      valueType: 'select',
      valueEnum: {
        [SupplierStatus.ACTIVE]: { text: '启用', status: 'Success' },
        [SupplierStatus.INACTIVE]: { text: '停用', status: 'Default' },
        [SupplierStatus.SUSPENDED]: { text: '暂停', status: 'Warning' },
        [SupplierStatus.BLACKLISTED]: { text: '黑名单', status: 'Error' }
      },
      render: (_, record: Supplier) => renderStatus(record.status)
    },
    {
      title: '联系人',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
      width: 100,
      hideInSearch: true
    },
    {
      title: '联系电话',
      dataIndex: 'contactPhone',
      key: 'contactPhone',
      width: 120,
      hideInSearch: true
    },
    {
      title: '所在城市',
      dataIndex: 'city',
      key: 'city',
      width: 100,
      hideInSearch: true
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      valueType: 'dateRange',
      hideInSearch: true,
      render: (_, record: Supplier) => record.createdAt.toLocaleDateString()
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
            onClick={() => handleDeleteSupplier(record.id)}
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
  const handleSaveSupplier = async (formData: SupplierFormData) => {
    try {
      if (editingSupplier) {
        // 编辑模式
        const updatedSupplier: Supplier = {
          ...editingSupplier,
          ...formData,
          updatedAt: new Date()
        };
        setSuppliers(prev => prev.map(s => s.id === editingSupplier.id ? updatedSupplier : s));
        message.success('供应商信息更新成功');
      } else {
        // 新增模式
        const newSupplier: Supplier = {
          id: Date.now().toString(),
          ...formData,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: '当前用户',
          updatedBy: '当前用户'
        };
        setSuppliers(prev => [newSupplier, ...prev]);
        message.success('供应商添加成功');
      }
      setFormModalVisible(false);
      setEditingSupplier(null);
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
  const handleDeleteSupplier = async (supplierId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个供应商吗？删除后无法恢复。',
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 500));
          setSuppliers(prev => prev.filter(supplier => supplier.id !== supplierId));
          message.success('删除成功');
        } catch {
          message.error('删除失败');
        }
      }
    });
  };

  // 处理批量状态变更
  const handleBatchStatusChange = async (status: SupplierStatus) => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      setSuppliers(prev => 
        prev.map(supplier => 
          selectedRowKeys.includes(supplier.id) 
            ? { ...supplier, status }
            : supplier
        )
      );
      setSelectedRowKeys([]);
      message.success(`批量${status === SupplierStatus.ACTIVE ? '启用' : '停用'}成功`);
    } catch {
      message.error('操作失败');
    }
  };

  // 处理批量删除
  const handleBatchDelete = async () => {
    Modal.confirm({
      title: '确认批量删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个供应商吗？删除后无法恢复。`,
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 500));
          setSuppliers(prev => prev.filter(supplier => !selectedRowKeys.includes(supplier.id)));
          setSelectedRowKeys([]);
          message.success('批量删除成功');
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
        dataSource={suppliers}
        rowKey="id"
        loading={loading}
        rowSelection={rowSelection}
        scroll={{ x: 1500 }}
        pagination={{
          current: queryParams.page,
          pageSize: queryParams.pageSize,
          total: suppliers.length,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          onChange: (page, pageSize) => {
            setQueryParams(prev => ({ ...prev, page, pageSize }));
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
            onClick={handleImportSuppliers}
          >
            导入供应商
          </Button>,
          <Button
            key="export"
            icon={<ExportOutlined />}
            onClick={handleExportSuppliers}
          >
            导出供应商
          </Button>,
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddSupplier}
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
              onClick={() => handleBatchStatusChange(SupplierStatus.ACTIVE)}
              disabled={selectedRowKeys.length === 0}
            >
              批量启用
            </Button>
            <Button
              size="small"
              onClick={() => handleBatchStatusChange(SupplierStatus.INACTIVE)}
              disabled={selectedRowKeys.length === 0}
            >
              批量停用
            </Button>
            <Button
              size="small"
              danger
              onClick={handleBatchDelete}
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
                <p><strong>类型：</strong>{renderType(viewingSupplier.type)}</p>
                <p><strong>等级：</strong>{renderLevel(viewingSupplier.level)}</p>
                <p><strong>状态：</strong>{renderStatus(viewingSupplier.status)}</p>
              </Col>
              <Col span={12}>
                <p><strong>联系人：</strong>{viewingSupplier.contactPerson}</p>
                <p><strong>联系电话：</strong>{viewingSupplier.contactPhone}</p>
                <p><strong>邮箱：</strong>{viewingSupplier.contactEmail}</p>
                <p><strong>网站：</strong>{viewingSupplier.website || '-'}</p>
                <p><strong>地址：</strong>{viewingSupplier.address}</p>
                <p><strong>城市：</strong>{viewingSupplier.city}</p>
              </Col>
            </Row>
            {viewingSupplier.overallRating && (
              <Row>
                <Col span={24}>
                  <p><strong>综合评分：</strong><Rate disabled value={viewingSupplier.overallRating} allowHalf /></p>
                </Col>
              </Row>
            )}
            {viewingSupplier.remark && (
              <Row>
                <Col span={24}>
                  <p><strong>备注：</strong>{viewingSupplier.remark}</p>
                </Col>
              </Row>
            )}
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