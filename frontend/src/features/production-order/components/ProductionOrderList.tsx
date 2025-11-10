import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  DatePicker,
  Modal,
  Form,
  Row,
  Col,
  Divider,
  message,
  Badge,
  Dropdown,
  Progress
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  StopOutlined,
  MoreOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { ProductionOrderForm, type ProductionOrderFormData } from './ProductionOrderForm';
import type { ColumnsType } from 'antd/es/table';
import type { TablePaginationConfig } from 'antd/es/table';
import dayjs from 'dayjs';
import type {
  ProductionOrder,
  ProductionOrderQueryParams,
  ProductionOrderStatistics,
} from '../types';
import {
  ProductionOrderStatus,
  PRODUCTION_ORDER_STATUS_CONFIG,
} from '../types';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface ProductionOrderListProps {
  className?: string;
}

const ProductionOrderList: React.FC<ProductionOrderListProps> = ({ className }) => {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [addForm] = Form.useForm();
  
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ProductionOrder[]>([]);
  const [statistics, setStatistics] = useState<ProductionOrderStatistics>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    paused: 0,
    todayCreated: 0,
    overdueCount: 0
  });
  const [queryParams, setQueryParams] = useState<ProductionOrderQueryParams>({
    page: 1,
    pageSize: 10
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [detailVisible, setDetailVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [addVisible, setAddVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<ProductionOrder | null>(null);

  // 模拟数据 - 使用项目中已有的产品信息
  const mockData: ProductionOrder[] = [
    {
      id: '1',
      orderNumber: 'PO202401001',
      productInfo: {
        id: 'FP001',
        code: 'FP001',
        name: '机械零件A',
        specification: '精密加工，表面镀锌',
        unit: '个',
        category: '机械零件'
      },
      salesOrder: {
        id: 'SO202401001',
        orderNumber: 'SO202401001',
        customerName: '华为技术有限公司',
        orderDate: '2024-01-15'
      },
      customerName: '华为技术有限公司',
      plannedQuantity: 1000,
      producedQuantity: 650,
      status: ProductionOrderStatus.IN_PROGRESS,
      plannedStartDate: '2024-01-20',
      plannedEndDate: '2024-01-30',
      expectedDeliveryDate: '2024-02-05',
      actualStartDate: '2024-01-20',
      createdAt: '2024-01-15 09:00:00',
      updatedAt: '2024-01-25 14:30:00',
      createdBy: '张三',
      remark: '紧急订单，优先生产'
    },
    {
      id: '2',
      orderNumber: 'PO202401002',
      productInfo: {
        id: 'P002',
        code: 'P002',
        name: '工业控制器',
        specification: 'S7-1200',
        unit: '台',
        category: '工业设备'
      },
      salesOrder: {
        id: 'SO202401002',
        orderNumber: 'SO202401002',
        customerName: '北京科技有限公司',
        orderDate: '2024-01-16'
      },
      customerName: '北京科技有限公司',
      plannedQuantity: 500,
      producedQuantity: 0,
      status: ProductionOrderStatus.PENDING,
      plannedStartDate: '2024-01-25',
      plannedEndDate: '2024-02-05',
      expectedDeliveryDate: '2024-02-10',
      createdAt: '2024-01-16 10:30:00',
      updatedAt: '2024-01-16 10:30:00',
      createdBy: '李四'
    },
    {
      id: '3',
      orderNumber: 'PO202401003',
      productInfo: {
        id: 'FP002',
        code: 'FP002',
        name: '精密齿轮',
        specification: '高精度齿轮，模数2.5',
        unit: '个',
        category: '机械零件'
      },
      salesOrder: {
        id: 'SO202401003',
        orderNumber: 'SO202401003',
        customerName: '上海制造有限公司',
        orderDate: '2024-01-18'
      },
      customerName: '上海制造有限公司',
      plannedQuantity: 800,
      producedQuantity: 800,
      status: ProductionOrderStatus.COMPLETED,
      plannedStartDate: '2024-01-10',
      plannedEndDate: '2024-01-20',
      expectedDeliveryDate: '2024-01-25',
      actualStartDate: '2024-01-10',
      actualEndDate: '2024-01-19',
      createdAt: '2024-01-08 14:00:00',
      updatedAt: '2024-01-19 16:45:00',
      createdBy: '王五',
      remark: '提前完成'
    },
    {
      id: '4',
      orderNumber: 'PO202401004',
      productInfo: {
        id: 'FP003',
        code: 'FP003',
        name: '液压缸体',
        specification: '耐压25MPa，行程200mm',
        unit: '台',
        category: '液压设备'
      },
      salesOrder: {
        id: 'SO202401004',
        orderNumber: 'SO202401004',
        customerName: '深圳电子有限公司',
        orderDate: '2024-01-20'
      },
      customerName: '深圳电子有限公司',
      plannedQuantity: 80,
      producedQuantity: 30,
      status: ProductionOrderStatus.PAUSED,
      plannedStartDate: '2024-01-30',
      plannedEndDate: '2024-02-28',
      expectedDeliveryDate: '2024-03-05',
      actualStartDate: '2024-01-30',
      createdAt: '2024-01-20 08:00:00',
      updatedAt: '2024-02-05 15:30:00',
      createdBy: '周八',
      remark: '设备故障，暂停生产'
    },
    {
      id: '5',
      orderNumber: 'PO202401005',
      productInfo: {
        id: 'P001',
        code: 'P001',
        name: '智能传感器',
        specification: 'HW-S100',
        unit: '个',
        category: '传感器'
      },
      salesOrder: {
        id: 'SO202401005',
        orderNumber: 'SO202401005',
        customerName: '百度在线网络技术有限公司',
        orderDate: '2024-01-22'
      },
      customerName: '百度在线网络技术有限公司',
      plannedQuantity: 300,
      producedQuantity: 75,
      status: ProductionOrderStatus.IN_PROGRESS,
      plannedStartDate: '2024-02-10',
      plannedEndDate: '2024-03-10',
      expectedDeliveryDate: '2024-03-15',
      actualStartDate: '2024-02-10',
      createdAt: '2024-01-22 11:00:00',
      updatedAt: '2024-02-15 09:30:00',
      createdBy: '郑十',
      remark: '紧急项目，24小时生产'
    }
  ];

  // 数据加载
  const loadData = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟筛选和分页
      let filteredData = [...mockData];
      
      // 应用筛选条件
      if (queryParams.orderNumber) {
        filteredData = filteredData.filter(item => 
          item.orderNumber.toLowerCase().includes(queryParams.orderNumber!.toLowerCase())
        );
      }
      if (queryParams.productName) {
        filteredData = filteredData.filter(item => 
          item.productInfo.name.toLowerCase().includes(queryParams.productName!.toLowerCase())
        );
      }
      if (queryParams.customerName) {
        filteredData = filteredData.filter(item => 
          item.customerName.toLowerCase().includes(queryParams.customerName!.toLowerCase())
        );
      }
      if (queryParams.status) {
        filteredData = filteredData.filter(item => item.status === queryParams.status);
      }
      

      // 模拟分页
      const startIndex = ((queryParams.page || 1) - 1) * (queryParams.pageSize || 10);
      const endIndex = startIndex + (queryParams.pageSize || 10);
      const paginatedData = filteredData.slice(startIndex, endIndex);

      setData(paginatedData);
      
      // 更新统计信息
      const newStatistics: ProductionOrderStatistics = {
        total: filteredData.length,
        pending: filteredData.filter(item => item.status === ProductionOrderStatus.PENDING).length,
        inProgress: filteredData.filter(item => item.status === ProductionOrderStatus.IN_PROGRESS).length,
        completed: filteredData.filter(item => item.status === ProductionOrderStatus.COMPLETED).length,
        cancelled: filteredData.filter(item => item.status === ProductionOrderStatus.CANCELLED).length,
        paused: filteredData.filter(item => item.status === ProductionOrderStatus.PAUSED).length,
        todayCreated: filteredData.filter(item => 
          dayjs(item.createdAt).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')
        ).length,
        overdueCount: filteredData.filter(item => 
          item.status !== ProductionOrderStatus.COMPLETED && 
          dayjs(item.plannedEndDate).isBefore(dayjs(), 'day')
        ).length
      };
      setStatistics(newStatistics);
    } catch {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 搜索处理
  const handleSearch = (values: Record<string, unknown>) => {
    const newQueryParams: ProductionOrderQueryParams = {
      ...queryParams,
      page: 1
    };
    
    // 复制基本字段
    Object.keys(values).forEach(key => {
      if (key !== 'plannedDateRange' && key !== 'createdDateRange' && values[key] !== undefined) {
        (newQueryParams as Record<string, unknown>)[key] = values[key];
      }
    });
    
    // 处理日期范围
    if (values.plannedDateRange) {
      const dateRange = values.plannedDateRange as [dayjs.Dayjs | null, dayjs.Dayjs | null];
      newQueryParams.plannedStartDate = dateRange[0]?.format('YYYY-MM-DD');
      newQueryParams.plannedEndDate = dateRange[1]?.format('YYYY-MM-DD');
    }
    if (values.createdDateRange) {
      const dateRange = values.createdDateRange as [dayjs.Dayjs | null, dayjs.Dayjs | null];
      newQueryParams.createdAtStart = dateRange[0]?.format('YYYY-MM-DD');
      newQueryParams.createdAtEnd = dateRange[1]?.format('YYYY-MM-DD');
    }
    
    setQueryParams(newQueryParams);
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
  const handleViewDetail = (record: ProductionOrder) => {
    setCurrentRecord(record);
    setDetailVisible(true);
  };

  // 编辑
  const handleEdit = (record: ProductionOrder) => {
    setCurrentRecord(record);
    editForm.setFieldsValue({
      ...record,
      plannedStartDate: dayjs(record.plannedStartDate),
      plannedEndDate: dayjs(record.plannedEndDate)
    });
    setEditVisible(true);
  };

  // 删除
  const handleDelete = (record: ProductionOrder) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除工单 ${record.orderNumber} 吗？`,
      onOk: async () => {
        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 1000));
          message.success('删除成功');
          loadData();
        } catch {
          message.error('删除失败');
        }
      }
    });
  };

  // 开始生产
  const handleStart = (record: ProductionOrder) => {
    Modal.confirm({
      title: '确认开始生产',
      content: `确定要开始生产工单 ${record.orderNumber} 吗？`,
      onOk: async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          message.success('已开始生产');
          loadData();
        } catch {
          message.error('操作失败');
        }
      }
    });
  };

  // 暂停生产
  const handlePause = (record: ProductionOrder) => {
    Modal.confirm({
      title: '确认暂停生产',
      content: `确定要暂停生产工单 ${record.orderNumber} 吗？`,
      onOk: async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          message.success('已暂停生产');
          loadData();
        } catch {
          message.error('操作失败');
        }
      }
    });
  };

  // 完成生产
  const handleComplete = (record: ProductionOrder) => {
    Modal.confirm({
      title: '确认完成生产',
      content: `确定要完成生产工单 ${record.orderNumber} 吗？`,
      onOk: async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          message.success('生产已完成');
          loadData();
        } catch {
          message.error('操作失败');
        }
      }
    });
  };

  // 取消生产
  const handleCancel = (record: ProductionOrder) => {
    Modal.confirm({
      title: '确认取消生产',
      content: `确定要取消生产工单 ${record.orderNumber} 吗？`,
      onOk: async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          message.success('生产已取消');
          loadData();
        } catch {
          message.error('操作失败');
        }
      }
    });
  };

  // 新建工单
  const handleAddProductionOrder = () => {
    setAddVisible(true);
    addForm.resetFields();
  };

  // 处理新建工单提交
  const handleAddSubmit = async (values: ProductionOrderFormData) => {
    try {
      setLoading(true);
      
      // 这里应该调用API创建生产工单
      console.log('新建生产工单:', values);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('生产工单创建成功');
      setAddVisible(false);
      addForm.resetFields();
      
      // 刷新列表数据
      await loadData();
    } catch (error) {
      console.error('创建生产工单失败:', error);
      message.error('创建生产工单失败');
    } finally {
      setLoading(false);
    }
  };

  // 取消新建工单
  const handleAddCancel = () => {
    setAddVisible(false);
    addForm.resetFields();
  };





  // 表格列定义
  const columns: ColumnsType<ProductionOrder> = [
    {
      title: '工单号',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 140,
      fixed: 'left',
      render: (text: string, record: ProductionOrder) => (
        <Button type="link" onClick={() => handleViewDetail(record)}>
          {text}
        </Button>
      )
    },
    {
      title: '产品信息',
      key: 'productInfo',
      width: 200,
      render: (_, record: ProductionOrder) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.productInfo.name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.productInfo.code} | {record.productInfo.specification}
          </div>
        </div>
      )
    },
    {
      title: '销售订单',
      key: 'salesOrder',
      width: 140,
      render: (_, record: ProductionOrder) => (
        record.salesOrder ? (
          <div>
            <div>{record.salesOrder.orderNumber}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {record.salesOrder.orderDate}
            </div>
          </div>
        ) : (
          <span style={{ color: '#999' }}>-</span>
        )
      )
    },
    {
      title: '客户名称',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 150,
      ellipsis: true
    },
    {
      title: '计划数量',
      dataIndex: 'plannedQuantity',
      key: 'plannedQuantity',
      width: 100,
      align: 'right',
      render: (value: number, record: ProductionOrder) => (
        `${value} ${record.productInfo.unit}`
      )
    },
    {
      title: '生产数量',
      dataIndex: 'producedQuantity',
      key: 'producedQuantity',
      width: 100,
      align: 'right',
      render: (value: number, record: ProductionOrder) => (
        `${value} ${record.productInfo.unit}`
      )
    },
    {
      title: '生产进度',
      key: 'progress',
      width: 120,
      render: (_, record: ProductionOrder) => {
        const percent = Math.round((record.producedQuantity / record.plannedQuantity) * 100);
        return (
          <Progress 
            percent={percent} 
            size="small" 
            status={record.status === ProductionOrderStatus.COMPLETED ? 'success' : 'active'}
          />
        );
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: ProductionOrderStatus) => {
        const config = PRODUCTION_ORDER_STATUS_CONFIG[status];
        return (
          <Badge 
            status={config.badge as 'success' | 'processing' | 'default' | 'error' | 'warning'} 
            text={config.text}
          />
        );
      }
    },
    {
      title:'期望交付日期',
      dataIndex: 'expectedDeliveryDate',
      key: 'expectedDeliveryDate',
      width: 120,
      sorter: true
    },
    {
      title: '计划生产日期',
      key: 'plannedTime',
      width: 120,
      render: (_, record: ProductionOrder) => (
        <div>
          <div>开始: {record.plannedStartDate}</div>
          <div>结束: {record.plannedEndDate}</div>
        </div>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      sorter: true
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record: ProductionOrder) => {
        const menuItems = [
          {
            key: 'view',
            icon: <EyeOutlined />,
            label: '查看详情',
            onClick: () => handleViewDetail(record)
          },
          {
            key: 'edit',
            icon: <EditOutlined />,
            label: '编辑',
            onClick: () => handleEdit(record)
          }
        ];

        // 根据状态添加不同的操作
        if (record.status === ProductionOrderStatus.PENDING) {
          menuItems.push({
            key: 'start',
            icon: <PlayCircleOutlined />,
            label: '开始生产',
            onClick: () => handleStart(record)
          });
        } else if (record.status === ProductionOrderStatus.IN_PROGRESS) {
          menuItems.push(
            {
              key: 'pause',
              icon: <PauseCircleOutlined />,
              label: '暂停生产',
              onClick: () => handlePause(record)
            },
            {
              key: 'complete',
              icon: <CheckCircleOutlined />,
              label: '完成生产',
              onClick: () => handleComplete(record)
            }
          );
        } else if (record.status === ProductionOrderStatus.PAUSED) {
          menuItems.push({
            key: 'start',
            icon: <PlayCircleOutlined />,
            label: '继续生产',
            onClick: () => handleStart(record)
          });
        }

        if (record.status !== ProductionOrderStatus.COMPLETED) {
          menuItems.push({
            key: 'cancel',
            icon: <StopOutlined />,
            label: '取消生产',
            onClick: () => handleCancel(record)
          });
        }

        menuItems.push({
          key: 'delete',
          icon: <DeleteOutlined />,
          label: '删除',
          onClick: () => handleDelete(record)
        });

        return (
          <Dropdown
            menu={{
              items: menuItems
            }}
            trigger={['click']}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        );
      }
    }
  ];



  // 分页配置
  const paginationConfig: TablePaginationConfig = {
    current: queryParams.page,
    pageSize: queryParams.pageSize,
    total: statistics.total,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
    onChange: (page, pageSize) => {
      setQueryParams(prev => ({ ...prev, page, pageSize }));
    },
    onShowSizeChange: (current, size) => {
      setQueryParams(prev => ({ ...prev, page: 1, pageSize: size }));
    }
  };

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
    onSelectAll: (selected: boolean, selectedRows: ProductionOrder[], changeRows: ProductionOrder[]) => {
      console.log('onSelectAll', selected, selectedRows, changeRows);
    }
  };

  // 编辑表单提交
  const onFinish = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('保存成功');
      setEditVisible(false);
      loadData();
    } catch {
      message.error('保存失败');
    }
  };

  // 初始化加载
  useEffect(() => {
    loadData();
  }, [queryParams]);

  return (
    <div className={className}>
      {/* 搜索表单 */}
      <Card style={{ marginBottom: 16 }}>
        <Form
          form={form}
          layout="inline"
          onFinish={handleSearch}
          style={{ marginBottom: 16 }}
        >
          <Form.Item name="orderNumber" label="工单号">
            <Input placeholder="请输入工单号" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="productName" label="产品名称">
            <Input placeholder="请输入产品名称" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="customerName" label="客户名称">
            <Input placeholder="请输入客户名称" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择状态" style={{ width: 120 }} allowClear>
              {Object.entries(PRODUCTION_ORDER_STATUS_CONFIG).map(([key, config]) => (
                <Option key={key} value={key}>{config.text}</Option>
              ))}
            </Select>
          </Form.Item>
         
          <Form.Item name="plannedDateRange" label="计划时间">
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
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddProductionOrder}>
              新建工单
            </Button>
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
          scroll={{ x: 1800 }}
          size="middle"
        />
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title="生产工单详情"
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
                <p><strong>工单号:</strong> {currentRecord.orderNumber}</p>
                <p><strong>产品名称:</strong> {currentRecord.productInfo.name}</p>
                <p><strong>产品编码:</strong> {currentRecord.productInfo.code}</p>
                <p><strong>规格:</strong> {currentRecord.productInfo.specification}</p>
                <p><strong>客户名称:</strong> {currentRecord.customerName}</p>
                <p><strong>计划数量:</strong> {currentRecord.plannedQuantity} {currentRecord.productInfo.unit}</p>
                <p><strong>生产数量:</strong> {currentRecord.producedQuantity} {currentRecord.productInfo.unit}</p>
              </Col>
              <Col span={12}>
                <p><strong>状态:</strong> 
                  <Badge 
                    status={PRODUCTION_ORDER_STATUS_CONFIG[currentRecord.status].badge as 'success' | 'processing' | 'default' | 'error' | 'warning'} 
                    text={PRODUCTION_ORDER_STATUS_CONFIG[currentRecord.status].text}
                    style={{ marginLeft: 8 }}
                  />
                </p>
               
                <p><strong>计划开始时间:</strong> {currentRecord.plannedStartDate}</p>
                <p><strong>计划结束时间:</strong> {currentRecord.plannedEndDate}</p>
                {currentRecord.actualStartDate && (
                  <p><strong>实际开始时间:</strong> {currentRecord.actualStartDate}</p>
                )}
                {currentRecord.actualEndDate && (
                  <p><strong>实际结束时间:</strong> {currentRecord.actualEndDate}</p>
                )}
                <p><strong>创建时间:</strong> {currentRecord.createdAt}</p>
                <p><strong>创建人:</strong> {currentRecord.createdBy}</p>
              </Col>
            </Row>
            {currentRecord.salesOrder && (
              <>
                <Divider>销售订单信息</Divider>
                <Row gutter={16}>
                  <Col span={12}>
                    <p><strong>销售订单号:</strong> {currentRecord.salesOrder.orderNumber}</p>
                    <p><strong>订单日期:</strong> {currentRecord.salesOrder.orderDate}</p>
                  </Col>
                </Row>
              </>
            )}
            {currentRecord.remark && (
              <>
                <Divider>备注</Divider>
                <p>{currentRecord.remark}</p>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* 编辑弹窗 */}
      <Modal
        title="编辑生产工单"
        open={editVisible}
        onCancel={() => setEditVisible(false)}
        onOk={onFinish}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={onFinish}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="orderNumber" label="工单号" rules={[{ required: true }]}>
                <Input disabled />
              </Form.Item>
            </Col>
           
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="plannedQuantity" label="计划数量" rules={[{ required: true }]}>
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="producedQuantity" label="生产数量">
                <Input type="number" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="plannedStartDate" label="计划开始时间" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="plannedEndDate" label="计划结束时间" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 新建工单弹窗 */}
      <Modal
        title="新建生产工单"
        open={addVisible}
        onCancel={handleAddCancel}
        footer={null}
        width={800}
        destroyOnHidden
      >
        <ProductionOrderForm
          form={addForm}
          onSubmit={handleAddSubmit}
        />
      </Modal>
    </div>
  );
};

export default ProductionOrderList;