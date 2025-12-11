import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Tag,
  Modal,
  Select,
  InputNumber,
  DatePicker,
  Alert,
  Typography,
  Form,
} from 'antd';
import { useMessage, useModal } from '@/shared/hooks';
import { BOM_COST_TYPE, BOM_COST_TYPE_MAP } from '@/shared/constants/bom';
import type { ColumnsType } from 'antd/es/table';

// BOM成本相关类型定义（与后端保持一致）
interface BomCostItem {
  id: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  specification?: string;
  unit: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  level: number;
  sequence: number;
  costType?: 'material' | 'labor' | 'overhead';
  supplier?: string;
  lastUpdated?: string;
  children?: BomCostItem[];
}

interface BomCostSummary {
  bomId: string;
  bomCode: string;
  bomName: string;
  baseQuantity: number;
  totalMaterialCost: number;
  totalLaborCost: number;
  totalOverheadCost: number;
  totalCost: number;
  costPerUnit: number;
  profitMargin?: number;
  sellingPrice?: number;
  calculatedAt: Date;
  calculatedBy: string;
  items: BomCostItem[];
}

interface CostAnalysis {
  costByCategory: {
    category: string;
    cost: number;
    percentage: number;
  }[];
  costTrend: {
    date: string;
    cost: number;
  }[];
  topCostItems: {
    item: string;
    cost: number;
    percentage: number;
  }[];
}
import { CalculatorOutlined, ExportOutlined, ReloadOutlined, SettingOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';


interface CalculationFormValues {
  bomId: string;
  version: string;
  calculationDate: dayjs.Dayjs;
  includeLabor?: boolean;
  includeOverhead?: boolean;
}

interface SettingsFormValues {
  includeLabor?: boolean;
  includeOverhead?: boolean;
  laborRate?: number;
  overheadRate?: number;
}

/**
 * BOM成本计算组件
 */

// 模拟数据
const mockCostItems: BomCostItem[] = [
  {
    id: '1',
    materialId: 'mat001',
    materialCode: 'MAT001',
    materialName: '优质钢材',
    specification: 'Q235B',
    unit: 'kg',
    quantity: 10,
    unitCost: 8.5,
    totalCost: 85,
    level: 1,
    sequence: 10,
    costType: BOM_COST_TYPE.MATERIAL,
    supplier: '钢材供应商A',
    lastUpdated: '2024-01-20'
  },
  {
    id: '2',
    materialId: 'mat002',
    materialCode: 'MAT002',
    materialName: '标准螺栓',
    specification: 'M8×20',
    unit: '个',
    quantity: 20,
    unitCost: 0.5,
    totalCost: 10,
    level: 1,
    sequence: 20,
    costType: BOM_COST_TYPE.MATERIAL,
    supplier: '五金供应商B',
    lastUpdated: '2024-01-20'
  },
  {
    id: '3',
    materialId: 'lab001',
    materialCode: 'LAB001',
    materialName: '装配工时',
    specification: '高级技工',
    unit: '小时',
    quantity: 2,
    unitCost: 50,
    totalCost: 100,
    level: 1,
    sequence: 30,
    costType: BOM_COST_TYPE.LABOR,
    lastUpdated: '2024-01-20'
  },
  {
    id: '4',
    materialId: 'oh001',
    materialCode: 'OH001',
    materialName: '制造费用',
    specification: '设备折旧、水电等',
    unit: '项',
    quantity: 1,
    unitCost: 25,
    totalCost: 25,
    level: 1,
    sequence: 40,
    costType: BOM_COST_TYPE.OVERHEAD,
    lastUpdated: '2024-01-20'
  }
];

const mockCostSummary: BomCostSummary = {
  bomId: 'bom001',
  bomCode: 'BOM001',
  bomName: '产品A BOM',
  baseQuantity: 1,
  totalMaterialCost: 95,
  totalLaborCost: 100,
  totalOverheadCost: 25,
  totalCost: 220,
  costPerUnit: 220,
  profitMargin: 20,
  sellingPrice: 264,
  calculatedAt: new Date(),
  calculatedBy: 'admin',
  items: mockCostItems
};

const mockCostAnalysis: CostAnalysis = {
  costByCategory: [
    { category: '原材料', cost: 95, percentage: 43.2 },
    { category: '人工费用', cost: 100, percentage: 45.5 },
    { category: '制造费用', cost: 25, percentage: 11.4 }
  ],
  costTrend: [
    { date: '2024-01-01', cost: 210 },
    { date: '2024-01-05', cost: 215 },
    { date: '2024-01-10', cost: 218 },
    { date: '2024-01-15', cost: 220 },
    { date: '2024-01-20', cost: 220 }
  ],
  topCostItems: [
    { item: '装配工时', cost: 100, percentage: 45.5 },
    { item: '优质钢材', cost: 85, percentage: 38.6 },
    { item: '制造费用', cost: 25, percentage: 11.4 }
  ]
};

const BomCostCalculator: React.FC = () => {
  const [costItems, setCostItems] = useState<BomCostItem[]>([]);
  const [costSummary, setCostSummary] = useState<BomCostSummary | null>(null);
  const [costAnalysis, setCostAnalysis] = useState<CostAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  
  // 模态框状态
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  
  // 表单实例
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const [calculationForm] = Form.useForm<CalculationFormValues>();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const [settingsForm] = Form.useForm<SettingsFormValues>();
  
  // 使用hooks
  const message = useMessage();
  const modal = useModal();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500));
        setCostItems(mockCostItems);
        setCostSummary(mockCostSummary);
        setCostAnalysis(mockCostAnalysis);
      } catch {
        message.error('加载数据失败');
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, [message]);

  // 成本类型渲染
  const renderCostType = (type: string) => {
    const config = BOM_COST_TYPE_MAP[type] || { color: 'default', text: type };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 成本明细列定义
  const costItemColumns: ColumnsType<BomCostItem> = [
    {
      title: '物料编码',
      dataIndex: 'materialCode',
      key: 'materialCode',
      width: 120,
      fixed: 'left'
    },
    {
      title: '物料名称',
      dataIndex: 'materialName',
      key: 'materialName',
      width: 200
    },
    {
      title: '规格',
      dataIndex: 'spec',
      key: 'spec',
      width: 120,
      render: (spec: string) => spec || '-'
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 80
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'right'
    },
    {
      title: '单位成本',
      dataIndex: 'unitCost',
      key: 'unitCost',
      width: 120,
      align: 'right',
      render: (cost: number) => `¥${cost.toFixed(2)}`
    },
    {
      title: '总成本',
      dataIndex: 'totalCost',
      key: 'totalCost',
      width: 120,
      align: 'right',
      render: (cost: number) => (
        <Typography.Text strong style={{ color: '#1890ff' }}>
          ¥{cost.toFixed(2)}
        </Typography.Text>
      )
    },
    {
      title: '成本类型',
      dataIndex: 'costType',
      key: 'costType',
      width: 100,
      render: renderCostType
    }
  ];

  // 成本计算
  const handleCalculateCost = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await calculationForm.validateFields();
      setCalculating(true);
      
      // 模拟计算过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 更新计算结果
      const newSummary = {
        ...mockCostSummary
      };
      setCostSummary(newSummary);
      
      message.success('成本计算完成');
    } catch {
      message.error('成本计算失败');
    } finally {
      setCalculating(false);
    }
  };

  // 重新计算
  const handleRecalculate = () => {
    modal.confirm({
      title: '确认重新计算',
      content: '重新计算将覆盖当前的成本数据，是否继续？',
      onOk: handleCalculateCost
    });
  };

  // 导出成本报告
  const handleExportReport = () => {
    message.success('成本报告导出成功');
  };

 

  return (
    <div className="bom-cost-calculator">
      <Card
        title="成本计算"
        extra={
          <Space>
            <Button
              icon={<SettingOutlined />}
              onClick={() => setSettingsModalVisible(true)}
            >
              计算设置
            </Button>
            <Button
              type="primary"
              icon={<CalculatorOutlined />}
              loading={calculating}
              onClick={() => { void handleCalculateCost(); }}
            >
              开始计算
            </Button>
          </Space>
        }
      >
        <Form
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          form={calculationForm}
          layout="inline"
          initialValues={{
            bomId: 'BOM001',
            version: 'V1.0',
            calculationDate: dayjs(),
            includeLabor: true,
            includeOverhead: true
          }}
        >
          <Form.Item
            name="bomId"
            label="BOM编码"
            rules={[{ required: true, message: '请选择BOM' }]}
          >
            <Select style={{ width: 150 }} placeholder="选择BOM">
              <Select.Option value="BOM001">BOM001</Select.Option>
              <Select.Option value="BOM002">BOM002</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="version"
            label="版本"
            rules={[{ required: true, message: '请选择版本' }]}
          >
            <Select style={{ width: 120 }} placeholder="选择版本">
              <Select.Option value="V1.0">V1.0</Select.Option>
              <Select.Option value="V1.1">V1.1</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="calculationDate"
            label="计算日期"
            rules={[{ required: true, message: '请选择计算日期' }]}
          >
            <DatePicker />
          </Form.Item>
        </Form>

        {calculating && (
          <Alert
            message="正在计算成本..."
            description="请稍候，系统正在分析BOM结构并计算各项成本。"
            type="info"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
      </Card>

      <Card
        title="成本明细"
        style={{ marginTop: 16 }}
        extra={
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRecalculate}
              disabled={calculating}
            >
              重新计算
            </Button>
            <Button
              icon={<ExportOutlined />}
              onClick={handleExportReport}
            >
              导出报告
            </Button>
          </Space>
        }
      >
        <Table
          columns={costItemColumns}
          dataSource={costItems}
          rowKey="id"
          loading={loading || calculating}
          pagination={false}
          summary={(pageData: readonly BomCostItem[]) => {
            const totalCost = pageData.reduce((sum, item) => sum + item.totalCost, 0);
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={6}>
                  <Typography.Text strong>合计</Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <Typography.Text strong style={{ color: '#1890ff' }}>
                    ¥{totalCost.toFixed(2)}
                  </Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} />
              </Table.Summary.Row>
            );
          }}
        />
      </Card>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={8}>
          <Card title="成本汇总" loading={loading}>
            {costSummary && (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Statistic
                  title="总成本"
                  value={costSummary.totalCost}
                  precision={2}
                  prefix="¥"
                  valueStyle={{ color: '#1890ff' }}
                />
                
                <Row gutter={8}>
                  <Col span={12}>
                    <Statistic
                      title="物料成本"
                      value={costSummary.totalMaterialCost}
                      precision={2}
                      prefix="¥"
                      valueStyle={{ fontSize: 14 }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="人工成本"
                      value={costSummary.totalLaborCost}
                      precision={2}
                      prefix="¥"
                      valueStyle={{ fontSize: 14 }}
                    />
                  </Col>
                </Row>

                <Statistic
                  title="制造费用"
                  value={costSummary.totalOverheadCost}
                  precision={2}
                  prefix="¥"
                  valueStyle={{ fontSize: 14 }}
                />

                <div style={{ marginTop: 16 }}>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    利润率：{costSummary.profitMargin}%
                  </Typography.Text>
                  <br />
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    销售价格：¥{costSummary.sellingPrice}
                  </Typography.Text>
                </div>
              </Space>
            )}
          </Card>
        </Col>

        <Col span={8}>
          <Card title="成本占比" style={{ marginTop: 16 }} loading={loading}>
            {costAnalysis && (
              <Space direction="vertical" style={{ width: '100%' }}>
                {costAnalysis.costByCategory.map((item) => (
                  <div key={item.category}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Typography.Text>{item.category}</Typography.Text>
                      <Typography.Text strong>{item.percentage.toFixed(1)}%</Typography.Text>
                    </div>
                    <Progress
                      percent={item.percentage}
                      showInfo={false}
                      strokeColor={
                        item.category === '原材料' ? '#1890ff' :
                        item.category === '人工费用' ? '#52c41a' : '#faad14'
                      }
                    />
                  </div>
                ))}
              </Space>
            )}
          </Card>
        </Col>

        <Col span={8}>
          <Card title="高成本物料" loading={loading}>
            {costAnalysis && (
              <Table
                dataSource={costAnalysis.topCostItems}
                pagination={false}
                size="small"
                columns={[
                  {
                    title: '物料名称',
                    dataIndex: 'item',
                    key: 'item'
                  },
                  {
                    title: '成本',
                    dataIndex: 'cost',
                    key: 'cost',
                    render: (cost: number) => `¥${cost.toFixed(2)}`
                  },
                  {
                    title: '占比',
                    dataIndex: 'percentage',
                    key: 'percentage',
                    render: (percentage: number) => `${percentage.toFixed(1)}%`
                  }
                ]}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* 计算设置模态框 */}
      <Modal
        title="成本计算设置"
        open={settingsModalVisible}
        onOk={() => setSettingsModalVisible(false)}
        onCancel={() => setSettingsModalVisible(false)}
        width={600}
      >
        <Form
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          form={settingsForm}
          layout="vertical"
          initialValues={{
            includeLabor: true,
            includeOverhead: true,
            laborRate: 50,
            overheadRate: 0.15
          }}
        >
          <Form.Item
            name="includeLabor"
            label="包含人工成本"
            valuePropName="checked"
          >
            <input type="checkbox" />
          </Form.Item>

          <Form.Item
            name="laborRate"
            label="人工费率 (元/小时)"
          >
            <InputNumber
              min={0}
              precision={2}
              style={{ width: '100%' }}
              placeholder="人工费率"
            />
          </Form.Item>

          <Form.Item
            name="includeOverhead"
            label="包含制造费用"
            valuePropName="checked"
          >
            <input type="checkbox" />
          </Form.Item>

          <Form.Item
            name="overheadRate"
            label="制造费用率"
          >
            <InputNumber
              min={0}
              max={1}
              step={0.01}
              precision={2}
              style={{ width: '100%' }}
              placeholder="制造费用率"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BomCostCalculator;