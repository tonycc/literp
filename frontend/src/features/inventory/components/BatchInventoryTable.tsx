import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Tag,
  Button,
  Space,
  Input,
  Select,
  DatePicker,
  Form,
  Row,
  Col,
  Tooltip,
  Modal,
  Descriptions,
  Typography,
  Popconfirm
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useMessage } from '@/shared/hooks/useMessage';
import type {
  BatchInventory,
  BatchInventoryQueryParams
} from '../types';
import {
  BatchStatus,
  BATCH_STATUS_CONFIG
} from '../types';

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface BatchInventoryTableProps {
  productId: string;
  productName?: string;
}

const BatchInventoryTable: React.FC<BatchInventoryTableProps> = ({ 
  productId, 
  productName 
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BatchInventory[]>([]);
  const [total, setTotal] = useState(0);
  const [queryParams, setQueryParams] = useState<BatchInventoryQueryParams>({
    page: 1,
    pageSize: 10,
    productId
  });
  const [selectedBatch, setSelectedBatch] = useState<BatchInventory | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [form] = Form.useForm();
  const message = useMessage();

  // 模拟批次库存数据
  const mockBatchData: BatchInventory[] = [
    {
      id: 'BATCH001',
      productId: productId,
      productCode: 'RAW001',
      productName: productName || '优质钢材',
      warehouseId: 'WH001',
      warehouseName: '主仓库',
      locationId: 'LOC001',
      locationName: 'A区1排1号',
      batchNumber: 'B202401001',
      lotNumber: 'LOT001',
      serialNumber: 'SN001',
      quantity: 50.0,
      availableQuantity: 45.0,
      reservedQuantity: 5.0,
      unitCost: 5200.00,
      totalCost: 260000.00,
      status: BatchStatus.NORMAL,
      productionDate: '2024-01-10',
      expiryDate: '2025-01-10',
      receivedDate: '2024-01-15',
      supplier: '钢材供应商A',
      supplierBatchNumber: 'SUP-B001',
      qualityStatus: 'passed',
      storageConditions: '常温干燥',
      remark: '质量优良',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-20'
    },
    {
      id: 'BATCH002',
      productId: productId,
      productCode: 'RAW001',
      productName: productName || '优质钢材',
      warehouseId: 'WH001',
      warehouseName: '主仓库',
      locationId: 'LOC002',
      locationName: 'A区1排2号',
      batchNumber: 'B202401002',
      lotNumber: 'LOT002',
      quantity: 30.0,
      availableQuantity: 25.0,
      reservedQuantity: 5.0,
      unitCost: 5150.00,
      totalCost: 154500.00,
      status: BatchStatus.EXPIRING_SOON,
      productionDate: '2023-12-15',
      expiryDate: '2024-12-15',
      receivedDate: '2024-01-10',
      supplier: '钢材供应商B',
      supplierBatchNumber: 'SUP-B002',
      qualityStatus: 'passed',
      storageConditions: '常温干燥',
      remark: '即将过期，优先使用',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-18'
    },
    {
      id: 'BATCH003',
      productId: productId,
      productCode: 'RAW001',
      productName: productName || '优质钢材',
      warehouseId: 'WH002',
      warehouseName: '副仓库',
      locationId: 'LOC003',
      locationName: 'B区2排1号',
      batchNumber: 'B202401003',
      quantity: 70.5,
      availableQuantity: 50.0,
      reservedQuantity: 20.5,
      unitCost: 5300.00,
      totalCost: 373650.00,
      status: BatchStatus.RESERVED,
      productionDate: '2024-01-20',
      expiryDate: '2025-01-20',
      receivedDate: '2024-01-22',
      supplier: '钢材供应商A',
      supplierBatchNumber: 'SUP-B003',
      qualityStatus: 'passed',
      storageConditions: '常温干燥',
      remark: '已预留给生产订单PO001',
      createdAt: '2024-01-22',
      updatedAt: '2024-01-22'
    }
  ];

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 根据查询参数过滤数据
      let filteredData = mockBatchData;
      
      if (queryParams.batchNumber) {
        filteredData = filteredData.filter(item => 
          item.batchNumber.toLowerCase().includes(queryParams.batchNumber!.toLowerCase())
        );
      }
      
      if (queryParams.status) {
        filteredData = filteredData.filter(item => item.status === queryParams.status);
      }
      
      if (queryParams.warehouseId) {
        filteredData = filteredData.filter(item => item.warehouseId === queryParams.warehouseId);
      }

      setData(filteredData);
      setTotal(filteredData.length);
    } catch {
      message.error('加载批次库存数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (values: Record<string, unknown>) => {
    const searchParams: BatchInventoryQueryParams = {
      ...queryParams,
      page: 1,
      batchNumber: values.batchNumber as string,
      status: values.status as BatchStatus,
      warehouseId: values.warehouseId as string,
      qualityStatus: values.qualityStatus as 'passed' | 'failed' | 'pending'
    };

    // 处理日期范围
    if (values.dateRange && Array.isArray(values.dateRange)) {
      const range = values.dateRange as unknown[];
      const [start, end] = range;
      if (start && end) {
        searchParams.receivedDateStart = dayjs(start as string | number | Date | dayjs.Dayjs).format('YYYY-MM-DD');
        searchParams.receivedDateEnd = dayjs(end as string | number | Date | dayjs.Dayjs).format('YYYY-MM-DD');
      }
    }

    setQueryParams(searchParams);
  };

 

  const handleViewDetail = (record: BatchInventory) => {
    setSelectedBatch(record);
    setDetailModalVisible(true);
  };

  const handleEdit = (record: BatchInventory) => {
    message.info(`编辑批次: ${record.batchNumber}`);
  };

  const handleDelete = async (record: BatchInventory) => {
    try {
      // 模拟删除操作
      await new Promise(resolve => setTimeout(resolve, 500));
      message.success(`删除批次 ${record.batchNumber} 成功`);
      void loadData();
    } catch {
      message.error('删除失败');
    }
  };

  const columns: ColumnsType<BatchInventory> = [
    {
      title: '批次号',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
      width: 80,
      fixed: 'left'
    },
    {
      title: '仓库/库位',
      key: 'location',
      width: 80,
      render: (_, record) => (
        <div>
          <div>{record.warehouseName}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.locationName}
          </Text>
        </div>
      )
    },
    {
      title: '批次数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      align: 'right',
      render: (value) => `${value} 吨`
    },
    {
      title: '可用数量',
      dataIndex: 'availableQuantity',
      key: 'availableQuantity',
      width: 80,
      align: 'right',
      render: (value) => `${value} 吨`
    },
    {
      title: '预留数量',
      dataIndex: 'reservedQuantity',
      key: 'reservedQuantity',
      width: 80,
      align: 'right',
      render: (value) => `${value} 吨`
    },
    {
      title: '单位成本',
      dataIndex: 'unitCost',
      key: 'unitCost',
      width: 80,
      align: 'right',
      render: (value: number) => `¥${value.toFixed(2)}`
    },
    {
      title: '入库日期',
      dataIndex: 'receivedDate',
      key: 'receivedDate',
      width: 100
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个批次吗？"
            onConfirm={() => { void handleDelete(record); }}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <>
      <Card title="批次库存信息">
        {/* 搜索表单 */}
        <Form
          form={form}
          layout="inline"
          onFinish={handleSearch}
          style={{ marginBottom: '16px' }}
        >
          <Row gutter={[16, 16]} style={{ width: '100%' }}>
            <Col span={6}>
              <Form.Item name="batchNumber" label="批次号">
                <Input placeholder="请输入批次号" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="status" label="批次状态">
                <Select placeholder="请选择状态" allowClear>
                  {Object.entries(BATCH_STATUS_CONFIG).map(([key, config]) => (
                    <Select.Option key={key} value={key}>
                      {config.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="dateRange" label="入库日期">
                <RangePicker />
              </Form.Item>
            </Col>
            <Col span={2}>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                  搜索
                </Button>
               
              </Space>
            </Col>
          </Row>
        </Form>

        {/* 批次库存表格 */}
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            current: queryParams.page,
            pageSize: queryParams.pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: (page: number, pageSize: number) => {
              setQueryParams(prev => ({ ...prev, page, pageSize }));
            }
          }}
          scroll={{ x: 1400 }}
          size="small"
        />
      </Card>

      {/* 批次详情弹窗 */}
      <Modal
        title={`批次详情 - ${selectedBatch?.batchNumber}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedBatch && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="批次号">{selectedBatch.batchNumber}</Descriptions.Item>
            <Descriptions.Item label="批号">{selectedBatch.lotNumber || '-'}</Descriptions.Item>
            <Descriptions.Item label="序列号">{selectedBatch.serialNumber || '-'}</Descriptions.Item>
            <Descriptions.Item label="仓库">{selectedBatch.warehouseName}</Descriptions.Item>
            <Descriptions.Item label="库位">{selectedBatch.locationName}</Descriptions.Item>
            <Descriptions.Item label="批次状态">
              <Tag color={BATCH_STATUS_CONFIG[selectedBatch.status].color}>
                {BATCH_STATUS_CONFIG[selectedBatch.status].label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="批次数量">{selectedBatch.quantity} 吨</Descriptions.Item>
            <Descriptions.Item label="可用数量">{selectedBatch.availableQuantity} 吨</Descriptions.Item>
            <Descriptions.Item label="预留数量">{selectedBatch.reservedQuantity} 吨</Descriptions.Item>
            <Descriptions.Item label="单位成本">¥{selectedBatch.unitCost.toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="总成本">¥{selectedBatch.totalCost.toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="生产日期">{selectedBatch.productionDate || '-'}</Descriptions.Item>
            <Descriptions.Item label="过期日期">{selectedBatch.expiryDate || '-'}</Descriptions.Item>
            <Descriptions.Item label="入库日期">{selectedBatch.receivedDate}</Descriptions.Item>
            <Descriptions.Item label="供应商">{selectedBatch.supplier || '-'}</Descriptions.Item>
            <Descriptions.Item label="供应商批次号">{selectedBatch.supplierBatchNumber || '-'}</Descriptions.Item>
            <Descriptions.Item label="质检状态">
              {selectedBatch.qualityStatus && (
                <Tag color={
                  selectedBatch.qualityStatus === 'passed' ? 'green' :
                  selectedBatch.qualityStatus === 'failed' ? 'red' : 'orange'
                }>
                  {selectedBatch.qualityStatus === 'passed' ? '合格' :
                   selectedBatch.qualityStatus === 'failed' ? '不合格' : '待检'}
                </Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="存储条件" span={2}>
              {selectedBatch.storageConditions || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>
              {selectedBatch.remark || '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </>
  );
};

export default BatchInventoryTable;