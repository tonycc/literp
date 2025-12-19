import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  DatePicker,
  Tag,
  Tooltip,
  Modal,
  Form,
  Row,
  Col,
  Divider,
  Badge,
  Dropdown,
  Menu
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  MoreOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TablePaginationConfig } from 'antd/es/table';
import dayjs from 'dayjs';
import { useMessage, useModal } from '@/shared/hooks';
import type {
  OutboundOrder,
  OutboundOrderQueryParams,
} from '../types';
import {
  OutboundType,
  OutboundOrderStatus,
  OUTBOUND_TYPE_CONFIG,
  OUTBOUND_ORDER_STATUS_CONFIG
} from '../types';
import { ProductType } from '@zyerp/shared';

const { RangePicker } = DatePicker;

interface OutboundOrderListProps {
  className?: string;
}

const OutboundOrderList: React.FC<OutboundOrderListProps> = ({ className }) => {
  const message = useMessage();
  const modal = useModal();

  // 状态管理
  const [data, setData] = useState<OutboundOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<OutboundOrder | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [queryParams, setQueryParams] = useState<OutboundOrderQueryParams>({
    page: 1,
    pageSize: 20
  });

  // 表单实例
  const [searchForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // 模拟数据
  const mockData: OutboundOrder[] = [
    {
      id: '1',
      orderNumber: 'OUT202401001',
      productId: 'P001',
      productCode: 'RAW001',
      productName: '优质钢材',
      productType: ProductType.RAW_MATERIAL,
      specification: 'Q235B 20*100*6000',
      unit: '根',
      warehouseId: 'WH001',
      warehouseName: '原材料仓库',
      locationId: 'LOC001',
      locationName: 'A区-01',
      batchNumber: 'B20240101001',
      outboundType: OutboundType.PRODUCTION,
      requestedQuantity: 100,
      actualQuantity: 95,
      unitPrice: 850.00,
      totalAmount: 80750.00,
      applicant: '张三',
      applicantId: 'U001',
      recipient: '李四',
      recipientId: 'U002',
      department: '生产部',
      purpose: '生产订单PO20240101使用',
      status: OutboundOrderStatus.SHIPPED,
      priority: 'high',
      requestDate: '2024-01-15 09:00:00',
      approvedDate: '2024-01-15 10:30:00',
      approver: '王五',
      approverId: 'U003',
      pickedDate: '2024-01-15 14:00:00',
      picker: '赵六',
      pickerId: 'U004',
      shippedDate: '2024-01-15 16:30:00',
      shipper: '钱七',
      shipperId: 'U005',
      expectedDate: '2024-01-15 16:00:00',
      actualDate: '2024-01-15 16:30:00',
      relatedOrderId: 'PO20240101',
      relatedOrderNumber: 'PO20240101',
      remark: '紧急生产需求',
      attachments: [],
      createdAt: '2024-01-15 09:00:00',
      updatedAt: '2024-01-15 16:30:00'
    },
    {
      id: '2',
      orderNumber: 'OUT202401002',
      productId: 'P002',
      productCode: 'FIN001',
      productName: '精密轴承',
      productType: ProductType.FINISHED_PRODUCT,
      specification: '6205-2RS',
      unit: '个',
      warehouseId: 'WH002',
      warehouseName: '成品仓库',
      locationId: 'LOC002',
      locationName: 'B区-05',
      batchNumber: 'B20240102001',
      outboundType: OutboundType.SALES,
      requestedQuantity: 500,
      actualQuantity: 500,
      unitPrice: 25.50,
      totalAmount: 12750.00,
      applicant: '孙八',
      applicantId: 'U006',
      recipient: '周九',
      recipientId: 'U007',
      department: '销售部',
      purpose: '客户订单SO20240102',
      status: OutboundOrderStatus.PICKING,
      priority: 'normal',
      requestDate: '2024-01-16 08:30:00',
      approvedDate: '2024-01-16 09:15:00',
      approver: '吴十',
      approverId: 'U008',
      pickedDate: undefined,
      picker: undefined,
      pickerId: undefined,
      shippedDate: undefined,
      shipper: undefined,
      shipperId: undefined,
      expectedDate: '2024-01-17 10:00:00',
      actualDate: undefined,
      relatedOrderId: 'SO20240102',
      relatedOrderNumber: 'SO20240102',
      remark: '客户要求按时交付',
      attachments: [],
      createdAt: '2024-01-16 08:30:00',
      updatedAt: '2024-01-16 09:15:00'
    },
    {
      id: '3',
      orderNumber: 'OUT202401003',
      productId: 'P003',
      productCode: 'SEM001',
      productName: '电子元件',
      productType: ProductType.SEMI_FINISHED_PRODUCT,
      specification: 'IC-74HC595',
      unit: '片',
      warehouseId: 'WH003',
      warehouseName: '半成品仓库',
      locationId: 'LOC003',
      locationName: 'C区-12',
      batchNumber: 'B20240103001',
      outboundType: OutboundType.RESEARCH,
      requestedQuantity: 50,
      actualQuantity: 0,
      unitPrice: 12.80,
      totalAmount: 0,
      applicant: '郑十一',
      applicantId: 'U009',
      recipient: '刘十二',
      recipientId: 'U010',
      department: '研发部',
      purpose: '新产品研发测试',
      status: OutboundOrderStatus.PENDING,
      priority: 'low',
      requestDate: '2024-01-17 14:20:00',
      approvedDate: undefined,
      approver: undefined,
      approverId: undefined,
      pickedDate: undefined,
      picker: undefined,
      pickerId: undefined,
      shippedDate: undefined,
      shipper: undefined,
      shipperId: undefined,
      expectedDate: '2024-01-18 16:00:00',
      actualDate: undefined,
      relatedOrderId: 'RD20240103',
      relatedOrderNumber: 'RD20240103',
      remark: '研发项目急需',
      attachments: [],
      createdAt: '2024-01-17 14:20:00',
      updatedAt: '2024-01-17 14:20:00'
    }
  ];



  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      setData(mockData);
    } catch {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEditFinish = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      message.success('保存成功');
      setEditModalVisible(false);
      void loadData();
    } catch {
      message.error('保存失败');
    }
  };

  // 初始化加载
  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  // 搜索处理
  const handleSearch = (values: Record<string, unknown>) => {
    const newQueryParams: OutboundOrderQueryParams = {
      ...queryParams,
      page: 1,
      ...values
    };
    
    // 处理日期范围
    if (values.requestDateRange) {
      const dateRange = values.requestDateRange as [dayjs.Dayjs | null, dayjs.Dayjs | null];
      newQueryParams.requestDateStart = dateRange[0]?.format('YYYY-MM-DD');
      newQueryParams.requestDateEnd = dateRange[1]?.format('YYYY-MM-DD');
    }
    if (values.expectedDateRange) {
      const dateRange = values.expectedDateRange as [dayjs.Dayjs | null, dayjs.Dayjs | null];
      newQueryParams.expectedDateStart = dateRange[0]?.format('YYYY-MM-DD');
      newQueryParams.expectedDateEnd = dateRange[1]?.format('YYYY-MM-DD');
    }
    
    // 删除不需要的字段
    const cleanParams = { ...newQueryParams };
    delete (cleanParams as Record<string, unknown>).requestDateRange;
    delete (cleanParams as Record<string, unknown>).expectedDateRange;
    
    setQueryParams(cleanParams);
  };

  // 重置搜索
  const handleReset = () => {
    searchForm.resetFields();
    setQueryParams({
      page: 1,
      pageSize: 20
    });
  };

  // 查看详情
  const handleViewDetail = (record: OutboundOrder) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  // 编辑出库单
  const handleEdit = (record: OutboundOrder) => {
    setSelectedRecord(record);
    editForm.setFieldsValue({
      ...record,
      requestDate: dayjs(record.requestDate),
      expectedDate: record.expectedDate ? dayjs(record.expectedDate) : undefined
    });
    setEditModalVisible(true);
  };

  // 删除出库单
  const handleDelete = (record: OutboundOrder) => {
    modal.confirm({
      title: '确认删除',
      content: `确定要删除出库单 ${record.orderNumber} 吗？`,
      onOk: async () => {
        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 500));
          message.success('删除成功');
          void loadData();
        } catch {
          message.error('删除失败');
        }
      }
    });
  };

  // 审核出库单
  const handleApprove = (record: OutboundOrder) => {
    modal.confirm({
      title: '确认审核',
      content: `确定要审核通过出库单 ${record.orderNumber} 吗？`,
      onOk: async () => {
        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 500));
          message.success('审核成功');
          void loadData();
        } catch {
          message.error('审核失败');
        }
      }
    });
  };

  // 拒绝出库单
  const handleReject = (record: OutboundOrder) => {
    modal.confirm({
      title: '确认拒绝',
      content: `确定要拒绝出库单 ${record.orderNumber} 吗？`,
      onOk: async () => {
        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 500));
          message.success('拒绝成功');
          void loadData();
        } catch {
          message.error('拒绝失败');
        }
      }
    });
  };

  // 操作菜单
  const getActionMenu = (record: OutboundOrder) => (
    <Menu>
      <Menu.Item key="view" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
        查看详情
      </Menu.Item>
      {record.status === OutboundOrderStatus.PENDING && (
        <>
          <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Menu.Item>
          <Menu.Item key="approve" icon={<CheckOutlined />} onClick={() => handleApprove(record)}>
            审核通过
          </Menu.Item>
          <Menu.Item key="reject" icon={<CloseOutlined />} onClick={() => handleReject(record)}>
            拒绝
          </Menu.Item>
        </>
      )}
      <Menu.Divider />
      <Menu.Item key="export" icon={<DownloadOutlined />}>
        导出单据
      </Menu.Item>
      <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => handleDelete(record)}>
        删除
      </Menu.Item>
    </Menu>
  );

  // 表格列定义
  const columns: ColumnsType<OutboundOrder> = [
    {
      title: '出库单编号',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 140,
      fixed: 'left',
      render: (text: string, record: OutboundOrder) => (
        <Button type="link" onClick={() => handleViewDetail(record)}>
          {text}
        </Button>
      )
    },
    {
      title: '物料名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 150,
      render: (text: string, record: OutboundOrder) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.productCode}</div>
        </div>
      )
    },
    {
      title: '物料批次号',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
      width: 130
    },
    {
      title: '出库类型',
      dataIndex: 'outboundType',
      key: 'outboundType',
      width: 100,
      render: (type: OutboundType) => {
        const config = OUTBOUND_TYPE_CONFIG[type];
        return (
          <Tag color={config.color} style={{ 
            backgroundColor: config.bgColor,
            borderColor: config.borderColor,
            color: '#000'
          }}>
            {config.label}
          </Tag>
        );
      }
    },
    {
      title: '申请数量',
      dataIndex: 'requestedQuantity',
      key: 'requestedQuantity',
      width: 100,
      align: 'right',
      render: (value: number, record: OutboundOrder) => (
        <div>
          <div>{value.toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.unit}</div>
        </div>
      )
    },
    {
      title: '出库数量',
      dataIndex: 'actualQuantity',
      key: 'actualQuantity',
      width: 100,
      align: 'right',
      render: (value: number, record: OutboundOrder) => (
        <div>
          <div style={{ 
            color: value === record.requestedQuantity ? '#52c41a' : 
                   value > 0 ? '#fa8c16' : '#666'
          }}>
            {value.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.unit}</div>
        </div>
      )
    },
    {
      title: '领料人',
      dataIndex: 'recipient',
      key: 'recipient',
      width: 100,
      render: (text: string, record: OutboundOrder) => (
        <div>
          <div>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.department}</div>
        </div>
      )
    },
    {
      title: '申请时间',
      dataIndex: 'requestDate',
      key: 'requestDate',
      width: 120,
      render: (text: string) => dayjs(text).format('MM-DD HH:mm')
    },
    {
      title: '用途',
      dataIndex: 'purpose',
      key: 'purpose',
      width: 150,
      ellipsis: {
        showTitle: false
      },
      render: (text: string) => (
        <Tooltip title={text}>
          {text}
        </Tooltip>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: OutboundOrderStatus) => {
        const config = OUTBOUND_ORDER_STATUS_CONFIG[status];
        return (
          <Badge 
            color={config.color}
            text={config.label}
          />
        );
      }
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 120,
      ellipsis: {
        showTitle: false
      },
      render: (text: string) => (
        <Tooltip title={text}>
          {text || '-'}
        </Tooltip>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      fixed: 'right',
      render: (_, record: OutboundOrder) => (
        <Dropdown overlay={getActionMenu(record)} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      )
    }
  ];

  // 分页配置
  const paginationConfig: TablePaginationConfig = {
    current: queryParams.page,
    pageSize: queryParams.pageSize,
    total: data.length,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number, range: [number, number]) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
    onChange: (page: number, pageSize: number) => {
      setQueryParams(prev => ({ ...prev, page, pageSize }));
    }
  };

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    }
  };

  return (
    <div className={className}>

      {/* 搜索表单 */}
      <Card style={{ marginBottom: 16 }}>
        <Form
          form={searchForm}
          layout="inline"
          onFinish={handleSearch}
          style={{ marginBottom: 16 }}
        >
          <Form.Item name="orderNumber" label="出库单编号">
            <Input placeholder="请输入出库单编号" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="productName" label="物料名称">
            <Input placeholder="请输入物料名称" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="batchNumber" label="批次号">
            <Input placeholder="请输入批次号" style={{ width: 120 }} />
          </Form.Item>
          <Form.Item name="outboundType" label="出库类型">
            <Select placeholder="请选择出库类型" style={{ width: 120 }} allowClear>
              {Object.entries(OUTBOUND_TYPE_CONFIG).map(([key, config]) => (
                <Select.Option key={key} value={key}>{config.label}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          
          <Form.Item name="requestDateRange" label="申请时间">
            <RangePicker style={{ width: 240 }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                搜索
              </Button>
              <Button onClick={handleReset}>重置</Button>
              <Button type="primary">新建出库单</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* 操作栏 */}
      <Card>
        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={paginationConfig}
          rowSelection={rowSelection}
          scroll={{ x: 1600 }}
          size="small"
        />
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title="出库单详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedRecord && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <p><strong>出库单编号：</strong>{selectedRecord.orderNumber}</p>
                <p><strong>物料名称：</strong>{selectedRecord.productName}</p>
                <p><strong>物料编码：</strong>{selectedRecord.productCode}</p>
                <p><strong>规格型号：</strong>{selectedRecord.specification}</p>
                <p><strong>批次号：</strong>{selectedRecord.batchNumber}</p>
                <p><strong>出库类型：</strong>
                  <Tag color={OUTBOUND_TYPE_CONFIG[selectedRecord.outboundType].color}>
                    {OUTBOUND_TYPE_CONFIG[selectedRecord.outboundType].label}
                  </Tag>
                </p>
                <p><strong>申请数量：</strong>{selectedRecord.requestedQuantity} {selectedRecord.unit}</p>
                <p><strong>出库数量：</strong>{selectedRecord.actualQuantity} {selectedRecord.unit}</p>
              </Col>
              <Col span={12}>
                <p><strong>申请人：</strong>{selectedRecord.applicant}</p>
                <p><strong>领料人：</strong>{selectedRecord.recipient}</p>
                <p><strong>申请部门：</strong>{selectedRecord.department}</p>
                <p><strong>用途：</strong>{selectedRecord.purpose}</p>
                <p><strong>状态：</strong>
                  <Badge 
                    color={OUTBOUND_ORDER_STATUS_CONFIG[selectedRecord.status].color}
                    text={OUTBOUND_ORDER_STATUS_CONFIG[selectedRecord.status].label}
                  />
                </p>
                <p><strong>申请时间：</strong>{selectedRecord.requestDate}</p>
                <p><strong>预计出库时间：</strong>{selectedRecord.expectedDate || '-'}</p>
                <p><strong>实际出库时间：</strong>{selectedRecord.actualDate || '-'}</p>
              </Col>
            </Row>
            <Divider />
            <p><strong>备注：</strong>{selectedRecord.remark || '-'}</p>
          </div>
        )}
      </Modal>

      {/* 编辑弹窗 */}
      <Modal
        title="编辑出库单"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={() => editForm.submit()}
        width={800}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={() => {
            void handleEditFinish();
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="requestedQuantity" label="申请数量" rules={[{ required: true }]}>
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="expectedDate" label="预计出库时间">
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="priority" label="优先级" rules={[{ required: true }]}>
                <Select>
                  <Select.Option value="low">低</Select.Option>
                  <Select.Option value="normal">普通</Select.Option>
                  <Select.Option value="high">高</Select.Option>
                  <Select.Option value="urgent">紧急</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="purpose" label="用途" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OutboundOrderList;
