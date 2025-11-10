import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Form,
  Input,
  Button,
  DatePicker,
  Space,
  Tag,
  Modal,
  Descriptions,
  message,
  Tooltip
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  ProductionInboundStatus
} from '../types';
import type {
  ProductionInboundRecord,
  ProductionInboundQueryParams,
} from '../types';

const { RangePicker } = DatePicker;

interface ProductionInboundListProps {
  onAdd?: () => void;
}

const ProductionInboundList: React.FC<ProductionInboundListProps> = ({ onAdd }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<ProductionInboundRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [queryParams, setQueryParams] = useState<ProductionInboundQueryParams>({
    page: 1,
    pageSize: 10
  });
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<ProductionInboundRecord | null>(null);

  // 模拟数据
  const mockData: ProductionInboundRecord[] = [
    {
      id: '1',
      inboundNumber: 'PI202401001',
      productionOrderId: 'PO202401001',
      productionOrderNumber: 'PO202401001',
      productInfo: {
        id: 'P001',
        code: 'P001',
        name: '智能手机',
        specification: '6.1寸 128GB',
        unit: '台',
        category: '电子产品'
      },
      inboundQuantity: 100,
      qualifiedQuantity: 98,
      defectiveQuantity: 2,
      batchNumber: 'B202401001',
      warehouseId: 'W001',
      warehouseName: '成品仓库',
      locationId: 'L001',
      locationName: 'A区-01',
      status: ProductionInboundStatus.COMPLETED,
      operatorId: 'U001',
      operatorName: '张三',
      qualityInspectorId: 'U002',
      qualityInspectorName: '李四',
      inboundDate: '2024-01-15',
      remarks: '质检合格，正常入库',
      createdAt: '2024-01-15 10:30:00',
      updatedAt: '2024-01-15 10:30:00',
      createdBy: '张三',
      updatedBy: '张三'
    },
    {
      id: '2',
      inboundNumber: 'PI202401002',
      productionOrderId: 'PO202401002',
      productionOrderNumber: 'PO202401002',
      productInfo: {
        id: 'P002',
        code: 'P002',
        name: '平板电脑',
        specification: '10.1寸 256GB',
        unit: '台',
        category: '电子产品'
      },
      inboundQuantity: 50,
      qualifiedQuantity: 50,
      defectiveQuantity: 0,
      batchNumber: 'B202401002',
      warehouseId: 'W001',
      warehouseName: '成品仓库',
      locationId: 'L002',
      locationName: 'A区-02',
      status: ProductionInboundStatus.PENDING,
      operatorId: 'U003',
      operatorName: '王五',
      qualityInspectorId: 'U002',
      qualityInspectorName: '李四',
      inboundDate: '2024-01-16',
      remarks: '待入库',
      createdAt: '2024-01-16 09:00:00',
      updatedAt: '2024-01-16 09:00:00',
      createdBy: '王五',
      updatedBy: '王五'
    }
  ];

  // 获取数据
  const fetchData = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      setDataSource(mockData);
      setTotal(mockData.length);
    } catch {
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [queryParams]);

  // 搜索处理
  const handleSearch = (values: SearchFormValues) => {
    const searchParams: ProductionInboundQueryParams = {
      ...queryParams,
      page: 1,
      ...values
    };

    if (values.dateRange) {
      searchParams.startDate = values.dateRange[0]?.format('YYYY-MM-DD');
      searchParams.endDate = values.dateRange[1]?.format('YYYY-MM-DD');
    }

    setQueryParams(searchParams);
  };

  // 重置搜索
  const handleReset = () => {
    form.resetFields();
    setQueryParams({
      page: 1,
      pageSize: 10
    });
  };

  // 查看详情
  const handleViewDetail = (record: ProductionInboundRecord) => {
    setCurrentRecord(record);
    setDetailVisible(true);
  };

  // 状态标签渲染
  const renderStatusTag = (status: ProductionInboundStatus) => {
    const statusConfig = {
      [ProductionInboundStatus.PENDING]: { color: 'orange', text: '待入库' },
      [ProductionInboundStatus.COMPLETED]: { color: 'green', text: '已入库' },
      [ProductionInboundStatus.CANCELLED]: { color: 'red', text: '已取消' }
    };

    const config = statusConfig[status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 表格列定义
  const columns: ColumnsType<ProductionInboundRecord> = [
    {
      title: '入库单号',
      dataIndex: 'inboundNumber',
      key: 'inboundNumber',
      width: 120,
      fixed: 'left'
    },
    {
      title: '生产订单号',
      dataIndex: 'productionOrderNumber',
      key: 'productionOrderNumber',
      width: 120
    },
    {
      title: '产品信息',
      key: 'productInfo',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.productInfo.name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.productInfo.code} | {record.productInfo.specification}
          </div>
        </div>
      )
    },
    {
      title: '批次号',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
      width: 120
    },
    {
      title: '入库数量',
      dataIndex: 'inboundQuantity',
      key: 'inboundQuantity',
      width: 100,
      align: 'right',
      render: (value, record) => (
        <div>
          <div>{value} {record.productInfo.unit}</div>
        </div>
      )
    },
    {
      title: '仓库/库位',
      key: 'warehouse',
      width: 150,
      render: (_, record) => (
        <div>
          <div>{record.warehouseName}</div>
          {record.locationName && (
            <div style={{ fontSize: '12px', color: '#666' }}>{record.locationName}</div>
          )}
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: renderStatusTag
    },
    {
      title: '操作员',
      dataIndex: 'operatorName',
      key: 'operatorName',
      width: 100
    },
    {
      title: '入库日期',
      dataIndex: 'inboundDate',
      key: 'inboundDate',
      width: 120,
      render: (value) => dayjs(value).format('YYYY-MM-DD')
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
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div>
      {/* 搜索表单 */}
      <Card style={{ marginBottom: 16 }}>
        <Form
          form={form}
          layout="inline"
          onFinish={handleSearch}
          style={{ marginBottom: 16 }}
        >
          <Form.Item name="inboundNumber" label="入库单号">
            <Input placeholder="请输入入库单号" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="productionOrderNumber" label="生产订单号">
            <Input placeholder="请输入生产订单号" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="productName" label="产品名称">
            <Input placeholder="请输入产品名称" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="batchNumber" label="批次号">
            <Input placeholder="请输入批次号" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="dateRange" label="入库日期">
            <RangePicker style={{ width: 240 }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                搜索
              </Button>
              <Button onClick={handleReset} icon={<ReloadOutlined />}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* 数据表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            current: queryParams.page,
            pageSize: queryParams.pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`,
            onChange: (page, pageSize) => {
              setQueryParams(prev => ({ ...prev, page, pageSize }));
            }
          }}
        />
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title="生产入库详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={800}
      >
        {currentRecord && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="入库单号">
              {currentRecord.inboundNumber}
            </Descriptions.Item>
            <Descriptions.Item label="生产订单号">
              {currentRecord.productionOrderNumber}
            </Descriptions.Item>
            <Descriptions.Item label="产品编码">
              {currentRecord.productInfo.code}
            </Descriptions.Item>
            <Descriptions.Item label="产品名称">
              {currentRecord.productInfo.name}
            </Descriptions.Item>
            <Descriptions.Item label="规格型号">
              {currentRecord.productInfo.specification}
            </Descriptions.Item>
            <Descriptions.Item label="单位">
              {currentRecord.productInfo.unit}
            </Descriptions.Item>
            <Descriptions.Item label="批次号">
              {currentRecord.batchNumber}
            </Descriptions.Item>
            <Descriptions.Item label="入库数量">
              {currentRecord.inboundQuantity} {currentRecord.productInfo.unit}
            </Descriptions.Item>
            <Descriptions.Item label="合格数量">
              <span style={{ color: '#52c41a' }}>
                {currentRecord.qualifiedQuantity} {currentRecord.productInfo.unit}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="不合格数量">
              <span style={{ color: '#ff4d4f' }}>
                {currentRecord.defectiveQuantity} {currentRecord.productInfo.unit}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="仓库">
              {currentRecord.warehouseName}
            </Descriptions.Item>
            <Descriptions.Item label="库位">
              {currentRecord.locationName || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              {renderStatusTag(currentRecord.status)}
            </Descriptions.Item>
            <Descriptions.Item label="操作员">
              {currentRecord.operatorName}
            </Descriptions.Item>
            <Descriptions.Item label="质检员">
              {currentRecord.qualityInspectorName || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="入库日期">
              {dayjs(currentRecord.inboundDate).format('YYYY-MM-DD')}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {currentRecord.createdAt}
            </Descriptions.Item>
            <Descriptions.Item label="创建人">
              {currentRecord.createdBy}
            </Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>
              {currentRecord.remarks || '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default ProductionInboundList;

interface SearchFormValues {
  inboundNumber?: string;
  productionOrderNumber?: string;
  productName?: string;
  batchNumber?: string;
  status?: ProductionInboundStatus;
  dateRange?: [dayjs.Dayjs, dayjs.Dayjs];
}