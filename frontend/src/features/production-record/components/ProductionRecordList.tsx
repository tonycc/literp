import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  DatePicker,
  Modal,
  Form,
  Row,
  Col,
  message,
  Badge,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { TablePaginationConfig } from 'antd/es/table';
import dayjs from 'dayjs';
import type {
  ProductionRecord,
  ProductionRecordQueryParams,
  ProductionRecordStatistics,
} from '../types';
import {
  ProductionRecordStatus,
  PRODUCTION_RECORD_STATUS_CONFIG
} from '../types';

const { RangePicker } = DatePicker;

interface ProductionRecordListProps {
  className?: string;
}

const ProductionRecordList: React.FC<ProductionRecordListProps> = ({ className }) => {
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ProductionRecord[]>([]);
  const [statistics, setStatistics] = useState<ProductionRecordStatistics>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    todayCreated: 0,
    todayCompleted: 0
  });
  const [queryParams, setQueryParams] = useState<ProductionRecordQueryParams>({
    page: 1,
    pageSize: 10
  });
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<ProductionRecord | null>(null);

  const [form] = Form.useForm();

  // 模拟数据
  const mockData: ProductionRecord[] = [
    {
      id: '1',
      recordNumber: 'PR202401001',
      batchNumber: 'B202401001',
      productionOrderNumber: 'PO202401001',
      productName: '智能手机外壳',
      materialInfo: {
        id: 'M001',
        code: 'ABS001',
        name: 'ABS塑料',
        specification: '高强度',
        unit: 'kg'
      },
      materialQuantity: 50,
      productionQuantity: 100,
      materialEmployee: {
        id: 'E001',
        name: '张三',
        employeeNumber: 'EMP001'
      },
      productionEmployee: {
        id: 'E002',
        name: '李四',
        employeeNumber: 'EMP002'
      },
      materialTime: '2024-01-15 09:00:00',
      completionTime: '2024-01-15 17:30:00',
      status: ProductionRecordStatus.COMPLETED,
      createdAt: '2024-01-15 08:30:00',
      updatedAt: '2024-01-15 17:30:00',
      createdBy: '系统管理员'
    },
    {
      id: '2',
      recordNumber: 'PR202401002',
      batchNumber: 'B202401002',
      productionOrderNumber: 'PO202401002',
      productName: '电路板组件',
      materialInfo: {
        id: 'M002',
        code: 'PCB001',
        name: 'PCB板',
        specification: '双面板',
        unit: '片'
      },
      materialQuantity: 200,
      productionQuantity: 200,
      materialEmployee: {
        id: 'E003',
        name: '王五',
        employeeNumber: 'EMP003'
      },
      productionEmployee: {
        id: 'E004',
        name: '赵六',
        employeeNumber: 'EMP004'
      },
      materialTime: '2024-01-16 08:30:00',
      completionTime: undefined,
      status: ProductionRecordStatus.IN_PROGRESS,
      createdAt: '2024-01-16 08:00:00',
      updatedAt: '2024-01-16 08:30:00',
      createdBy: '系统管理员'
    },
    {
      id: '3',
      recordNumber: 'PR202401003',
      batchNumber: 'B202401003',
      productionOrderNumber: 'PO202401003',
      productName: '金属支架',
      materialInfo: {
        id: 'M003',
        code: 'AL001',
        name: '铝合金',
        specification: '6061-T6',
        unit: 'kg'
      },
      materialQuantity: 30,
      productionQuantity: 80,
      materialEmployee: {
        id: 'E005',
        name: '孙七',
        employeeNumber: 'EMP005'
      },
      productionEmployee: {
        id: 'E006',
        name: '周八',
        employeeNumber: 'EMP006'
      },
      materialTime: '2024-01-17 09:15:00',
      completionTime: undefined,
      status: ProductionRecordStatus.PENDING,
      createdAt: '2024-01-17 09:00:00',
      updatedAt: '2024-01-17 09:15:00',
      createdBy: '系统管理员'
    }
  ];

  // 模拟统计数据
  const mockStatistics: ProductionRecordStatistics = {
    total: 3,
    pending: 1,
    inProgress: 1,
    completed: 1,
    cancelled: 0,
    todayCreated: 2,
    todayCompleted: 1
  };

  // 数据加载
  const loadData = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      setData(mockData);
      setStatistics(mockStatistics);
    } catch (error) {
      console.error('加载数据失败:', error);
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 搜索处理
  const handleSearch = (values: ProductionRecordQueryParams) => {
    setQueryParams({
      ...queryParams,
      page: 1,
      ...values
    });
  };

  useEffect(() => {
    loadData();
  }, [queryParams]);

  // 重置搜索
  const handleReset = () => {
    form.resetFields();
    setQueryParams({
      page: 1,
      pageSize: 10
    });
  };

  // 查看详情
  const handleDetail = (record: ProductionRecord) => {
    setCurrentRecord(record);
    setDetailVisible(true);
  };

  // 表格分页配置
  const pagination: TablePaginationConfig = {
    current: queryParams.page || 1,
    pageSize: queryParams.pageSize || 10,
    total: statistics.total,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
    onChange: (page, pageSize) => {
      setQueryParams({
        ...queryParams,
        page,
        pageSize
      });
    }
  };

  // 表格列定义
  const columns: ColumnsType<ProductionRecord> = [
    {
      title: '生产记录编号',
      dataIndex: 'recordNumber',
      key: 'recordNumber',
      width: 150,
      fixed: 'left'
    },
    {
      title: '产品批次号',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
      width: 120
    },
    {
      title: '生产工单编号',
      dataIndex: 'productionOrderNumber',
      key: 'productionOrderNumber',
      width: 150
    },
    {
      title: '产品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 150
    },
    {
      title: '领取物料',
      key: 'materialInfo',
      width: 150,
      render: (_, record: ProductionRecord) => (
        <div>
          <div>{record.materialInfo.name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.materialInfo.specification}
          </div>
        </div>
      )
    },
    {
      title: '领取数量',
      dataIndex: 'materialQuantity',
      key: 'materialQuantity',
      width: 100,
      align: 'right',
      render: (value: number, record: ProductionRecord) => (
        `${value} ${record.materialInfo.unit}`
      )
    },
    {
      title: '生产数量',
      dataIndex: 'productionQuantity',
      key: 'productionQuantity',
      width: 100,
      align: 'right',
      render: (value: number) => (
        `${value} 个`
      )
    },
    {
      title: '领料员工',
      key: 'materialEmployee',
      width: 120,
      render: (_, record: ProductionRecord) => (
        <div>
          <div>{record.materialEmployee.name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.materialEmployee.employeeNumber}
          </div>
        </div>
      )
    },
    {
      title: '生产员工',
      key: 'productionEmployee',
      width: 120,
      render: (_, record: ProductionRecord) => (
        <div>
          <div>{record.productionEmployee.name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.productionEmployee.employeeNumber}
          </div>
        </div>
      )
    },
    {
      title: '领料时间',
      dataIndex: 'materialTime',
      key: 'materialTime',
      width: 150,
      render: (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '完工时间',
      dataIndex: 'completionTime',
      key: 'completionTime',
      width: 150,
      render: (value: string) => value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: ProductionRecordStatus) => {
        const config = PRODUCTION_RECORD_STATUS_CONFIG[status];
        return <Badge status={config.badge as 'success' | 'processing' | 'default' | 'error' | 'warning'} text={config.text} />;
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record: ProductionRecord) => (
        <Button 
          type="link" 
          size="small" 
          icon={<EyeOutlined />}
          onClick={() => handleDetail(record)}
        >
          详情
        </Button>
      )
    }
  ];

  return (
    <div className={className}>
      <Card>
        {/* 搜索表单 */}
        <Form
          form={form}
          layout="inline"
          onFinish={handleSearch}
          style={{ marginBottom: 16 }}
        >
          <Form.Item name="recordNumber" label="生产记录编号">
            <Input placeholder="请输入生产记录编号" />
          </Form.Item>
         
          <Form.Item name="productionOrderNumber" label="生产工单编号">
            <Input placeholder="请输入生产工单编号" />
          </Form.Item>
          <Form.Item name="productName" label="产品名称">
            <Input placeholder="请输入产品名称" />
          </Form.Item>
          
          <Form.Item name="dateRange" label="时间范围">
            <RangePicker />
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

        {/* 数据表格 */}
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          scroll={{ x: 1500 }}
        />
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title="生产记录详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {currentRecord && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <p><strong>生产记录编号：</strong>{currentRecord.recordNumber}</p>
                <p><strong>产品批次号：</strong>{currentRecord.batchNumber}</p>
                <p><strong>生产工单编号：</strong>{currentRecord.productionOrderNumber}</p>
                <p><strong>产品名称：</strong>{currentRecord.productName}</p>
                <p><strong>领取物料：</strong>{currentRecord.materialInfo.name} ({currentRecord.materialInfo.specification})</p>
                <p><strong>领取数量：</strong>{currentRecord.materialQuantity} {currentRecord.materialInfo.unit}</p>
              </Col>
              <Col span={12}>
                <p><strong>生产数量：</strong>{currentRecord.productionQuantity} 个</p>
                <p><strong>领料员工：</strong>{currentRecord.materialEmployee.name} ({currentRecord.materialEmployee.employeeNumber})</p>
                <p><strong>生产员工：</strong>{currentRecord.productionEmployee.name} ({currentRecord.productionEmployee.employeeNumber})</p>
                <p><strong>领料时间：</strong>{dayjs(currentRecord.materialTime).format('YYYY-MM-DD HH:mm:ss')}</p>
                <p><strong>完工时间：</strong>{currentRecord.completionTime ? dayjs(currentRecord.completionTime).format('YYYY-MM-DD HH:mm:ss') : '未完工'}</p>
                <p><strong>状态：</strong><Badge status={PRODUCTION_RECORD_STATUS_CONFIG[currentRecord.status].badge as 'success' | 'processing' | 'default' | 'error' | 'warning'} text={PRODUCTION_RECORD_STATUS_CONFIG[currentRecord.status].text} /></p>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProductionRecordList;