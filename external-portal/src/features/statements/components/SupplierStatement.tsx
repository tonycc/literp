import React, { useState, useMemo } from 'react';
import {
  Card,
  Table,
  Button,
  DatePicker,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  message,
  Tooltip,
  Modal,
} from 'antd';
import {
  DownloadOutlined,
  EyeOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

// 对账单数据类型
interface StatementItem {
  id: string;
  statementNo: string;
  period: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  orderCount: number;
  status: 'pending' | 'partial' | 'paid';
  createDate: string;
  dueDate: string;
  orders: PurchaseOrderItem[];
}

interface PurchaseOrderItem {
  id: string;
  orderNo: string;
  orderDate: string;
  amount: number;
  status: string;
  description: string;
}

// 模拟对账单数据
const mockStatements: StatementItem[] = [
  {
    id: '1',
    statementNo: 'ST202412001',
    period: '2024年12月',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    totalAmount: 156800.00,
    paidAmount: 100000.00,
    unpaidAmount: 56800.00,
    orderCount: 8,
    status: 'partial',
    createDate: '2024-12-31',
    dueDate: '2025-01-15',
    orders: [
      {
        id: '1',
        orderNo: 'PO202412001',
        orderDate: '2024-12-05',
        amount: 25600.00,
        status: '已完成',
        description: '电子元器件采购'
      },
      {
        id: '2',
        orderNo: 'PO202412008',
        orderDate: '2024-12-15',
        amount: 31200.00,
        status: '已完成',
        description: '传感器模块采购'
      }
    ]
  },
  {
    id: '2',
    statementNo: 'ST202411001',
    period: '2024年11月',
    startDate: '2024-11-01',
    endDate: '2024-11-30',
    totalAmount: 234500.00,
    paidAmount: 234500.00,
    unpaidAmount: 0,
    orderCount: 12,
    status: 'paid',
    createDate: '2024-11-30',
    dueDate: '2024-12-15',
    orders: [
      {
        id: '3',
        orderNo: 'PO202411003',
        orderDate: '2024-11-08',
        amount: 45600.00,
        status: '已完成',
        description: '工业控制器采购'
      },
      {
        id: '4',
        orderNo: 'PO202411015',
        orderDate: '2024-11-22',
        amount: 67800.00,
        status: '已完成',
        description: '自动化设备采购'
      }
    ]
  },
  {
    id: '3',
    statementNo: 'ST202410001',
    period: '2024年10月',
    startDate: '2024-10-01',
    endDate: '2024-10-31',
    totalAmount: 189300.00,
    paidAmount: 189300.00,
    unpaidAmount: 0,
    orderCount: 9,
    status: 'paid',
    createDate: '2024-10-31',
    dueDate: '2024-11-15',
    orders: [
      {
        id: '5',
        orderNo: 'PO202410005',
        orderDate: '2024-10-12',
        amount: 38900.00,
        status: '已完成',
        description: '机械零件采购'
      }
    ]
  }
];

const SupplierStatement: React.FC = () => {
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedStatement, setSelectedStatement] = useState<StatementItem | null>(null);

  // 根据选择的时间范围过滤对账单
  const filteredStatements = useMemo(() => {
    if (!selectedPeriod) return mockStatements;
    
    const [start, end] = selectedPeriod;
    if (!start || !end) return mockStatements;
    
    return mockStatements.filter(statement => {
      const statementDate = dayjs(statement.createDate);
      return statementDate.isAfter(start.subtract(1, 'day')) && 
             statementDate.isBefore(end.add(1, 'day'));
    });
  }, [selectedPeriod]);

  // 统计数据
  const statistics = useMemo(() => {
    const total = filteredStatements.reduce((sum, item) => sum + item.totalAmount, 0);
    const paid = filteredStatements.reduce((sum, item) => sum + item.paidAmount, 0);
    const unpaid = filteredStatements.reduce((sum, item) => sum + item.unpaidAmount, 0);
    const count = filteredStatements.length;

    return { total, paid, unpaid, count };
  }, [filteredStatements]);

  // 状态标签渲染
  const renderStatus = (status: string) => {
    const statusMap = {
      pending: { color: 'orange', text: t('statements.status.pending') },
      partial: { color: 'blue', text: t('statements.status.partial') },
      paid: { color: 'green', text: t('statements.status.paid') }
    };
    const config = statusMap[status as keyof typeof statusMap];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 下载对账单
  const handleDownload = (statement: StatementItem) => {
    // 模拟下载功能
    message.success(t('statements.downloadSuccess', { statementNo: statement.statementNo }));
    
    // 实际项目中这里会调用后端API下载PDF文件
    const link = document.createElement('a');
    link.href = '#'; // 这里应该是实际的下载链接
    link.download = `${statement.statementNo}.pdf`;
    // link.click();
  };

  // 查看详情
  const handleViewDetail = (statement: StatementItem) => {
    setSelectedStatement(statement);
    setDetailModalVisible(true);
  };

  // 表格列定义
  const columns: ColumnsType<StatementItem> = [
    {
      title: t('statements.table.statementNo'),
      dataIndex: 'statementNo',
      key: 'statementNo',
      width: 140,
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: t('statements.table.period'),
      dataIndex: 'period',
      key: 'period',
      width: 120,
    },
    {
      title: t('statements.table.dateRange'),
      key: 'dateRange',
      width: 200,
      render: (_, record) => (
        <span>
          {record.startDate} {t('common.to')} {record.endDate}
        </span>
      )
    },
    {
      title: t('statements.table.orderCount'),
      dataIndex: 'orderCount',
      key: 'orderCount',
      width: 100,
      render: (count) => <Text>{count} {t('statements.table.orders')}</Text>
    },
    {
      title: t('statements.table.totalAmount'),
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      render: (amount) => <Text strong>¥{amount.toLocaleString()}</Text>
    },
    {
      title: t('statements.table.paidAmount'),
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      width: 120,
      render: (amount) => <Text type="success">¥{amount.toLocaleString()}</Text>
    },
    {
      title: t('statements.table.unpaidAmount'),
      dataIndex: 'unpaidAmount',
      key: 'unpaidAmount',
      width: 120,
      render: (amount) => (
        <Text type={amount > 0 ? "warning" : "secondary"}>
          ¥{amount.toLocaleString()}
        </Text>
      )
    },
    {
      title: t('statements.table.status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: renderStatus
    },
    {
      title: t('statements.table.dueDate'),
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 120,
    },
    {
      title: t('statements.table.actions'),
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title={t('statements.actions.viewDetail')}>
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title={t('statements.actions.download')}>
            <Button 
              type="text" 
              icon={<DownloadOutlined />} 
              onClick={() => handleDownload(record)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  // 订单详情表格列
  const orderColumns: ColumnsType<PurchaseOrderItem> = [
    {
      title: t('statements.orderDetail.orderNo'),
      dataIndex: 'orderNo',
      key: 'orderNo',
    },
    {
      title: t('statements.orderDetail.orderDate'),
      dataIndex: 'orderDate',
      key: 'orderDate',
    },
    {
      title: t('statements.orderDetail.description'),
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: t('statements.orderDetail.amount'),
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `¥${amount.toLocaleString()}`
    },
    {
      title: t('statements.orderDetail.status'),
      dataIndex: 'status',
      key: 'status',
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        {/* 统计卡片 */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic
                title={t('statements.stats.totalCount')}
                value={statistics.count}
                suffix={t('statements.stats.countSuffix')}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title={t('statements.stats.totalAmount')}
                value={statistics.total}
                precision={2}
                prefix="¥"
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title={t('statements.stats.paidAmount')}
                value={statistics.paid}
                precision={2}
                prefix="¥"
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title={t('statements.stats.unpaidAmount')}
                value={statistics.unpaid}
                precision={2}
                prefix="¥"
                valueStyle={{ color: statistics.unpaid > 0 ? '#faad14' : '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 筛选条件 */}
        <Card size="small" style={{ marginBottom: '16px' }}>
          <Row align="middle" gutter={16}>
            <Col>
              <CalendarOutlined style={{ marginRight: '8px' }} />
              <Text strong>{t('statements.filter.title')}：</Text>
            </Col>
            <Col>
              <RangePicker
                value={selectedPeriod}
                onChange={setSelectedPeriod}
                placeholder={[t('statements.filter.startDate'), t('statements.filter.endDate')]}
                allowClear
              />
            </Col>
            <Col>
              <Button 
                onClick={() => setSelectedPeriod(null)}
                disabled={!selectedPeriod}
              >
                {t('statements.filter.clear')}
              </Button>
            </Col>
          </Row>
        </Card>

        {/* 对账单列表 */}
        <Table
          columns={columns}
          dataSource={filteredStatements}
          rowKey="id"
          pagination={{
            total: filteredStatements.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => t('statements.pagination.total', { total })
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 对账单详情弹窗 */}
      <Modal
        title={t('statements.modal.title', { statementNo: selectedStatement?.statementNo })}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            {t('common.close')}
          </Button>,
          <Button 
            key="download" 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={() => selectedStatement && handleDownload(selectedStatement)}
          >
            {t('statements.actions.download')}
          </Button>
        ]}
        width={800}
      >
        {selectedStatement && (
          <div>
            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col span={12}>
                <Text strong>{t('statements.modal.period')}：</Text> {selectedStatement.period}
              </Col>
              <Col span={12}>
                <Text strong>{t('statements.modal.status')}：</Text> {renderStatus(selectedStatement.status)}
              </Col>
            </Row>
            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col span={12}>
                <Text strong>{t('statements.modal.totalAmount')}：</Text> ¥{selectedStatement.totalAmount.toLocaleString()}
              </Col>
              <Col span={12}>
                <Text strong>{t('statements.modal.dueDate')}：</Text> {selectedStatement.dueDate}
              </Col>
            </Row>
            
            <Title level={5} style={{ marginTop: '24px', marginBottom: '16px' }}>
              {t('statements.modal.orderDetails')}
            </Title>
            <Table
              columns={orderColumns}
              dataSource={selectedStatement.orders}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SupplierStatement;