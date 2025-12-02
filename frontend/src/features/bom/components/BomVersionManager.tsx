import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Card,
  Row,
  Col,
  Popconfirm,
  Tag,
  Tooltip,
 
  Timeline,
  Descriptions,
  Alert,
  Typography,
  Badge,
  Drawer
} from 'antd';
import { useMessage } from '@/shared/hooks';
import { 
  BOM_STATUS, 
  BOM_STATUS_MAP, 
  BOM_STATUS_OPTIONS,
  BOM_HISTORY_ACTION
} from '@/shared/constants/bom';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  HistoryOutlined,
  DiffOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;
 

// BOM版本相关类型定义
interface BomVersion {
  id: string;
  bomId: string;
  bomCode: string;
  bomName: string;
  version: string;
  status: 'draft' | 'active' | 'inactive' | 'archived';
  effectiveDate: string;
  expiryDate?: string;
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
  description?: string;
  changeReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  isDefault: boolean;
}

interface BomVersionHistory {
  id: string;
  bomId: string;
  action: 'created' | 'updated' | 'activated' | 'deactivated' | 'archived' | 'copied';
  versionId: string;
  version: string;
  operator: string;
  operatedAt: string;
  description: string;
}

interface BomVersionFormValues {
  bomCode: string;
  bomName: string;
  version: string;
  status: string;
  isDefault: boolean;
  effectiveDate: dayjs.Dayjs;
  expiryDate?: dayjs.Dayjs;
  changeReason: string;
  description?: string;
}

/**
 * BOM版本管理组件
 */
const BomVersionManager: React.FC = () => {
  const [versions, setVersions] = useState<BomVersion[]>([]);
  const [versionHistory, setVersionHistory] = useState<BomVersionHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const message = useMessage();
  
  // 模态框状态
  const [versionModalVisible, setVersionModalVisible] = useState(false);
  const [compareModalVisible, setCompareModalVisible] = useState(false);
  const [historyDrawerVisible, setHistoryDrawerVisible] = useState(false);
  
  // 编辑状态
  const [editingVersion, setEditingVersion] = useState<BomVersion | null>(null);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [currentBomId, setCurrentBomId] = useState<string>('');
  
  // 表单实例
  const [versionForm] = Form.useForm<BomVersionFormValues>();

  // 模拟数据
  const mockVersions: BomVersion[] = [
    {
      id: '1',
      bomId: 'BOM001',
      bomCode: 'BOM001',
      bomName: '产品A物料清单',
      version: 'V1.0',
      status: 'active',
      effectiveDate: '2024-01-01',
      expiryDate: '2024-12-31',
      createdBy: '张三',
      createdAt: '2024-01-01 09:00:00',
      updatedBy: '李四',
      updatedAt: '2024-01-15 14:30:00',
      description: '初始版本',
      changeReason: '新产品上线',
      approvedBy: '王五',
      approvedAt: '2024-01-01 16:00:00',
      isDefault: true
    },
    {
      id: '2',
      bomId: 'BOM001',
      bomCode: 'BOM001',
      bomName: '产品A物料清单',
      version: 'V1.1',
      status: 'draft',
      effectiveDate: '2024-02-01',
      createdBy: '李四',
      createdAt: '2024-01-20 10:00:00',
      description: '优化版本',
      changeReason: '成本优化，替换部分物料',
      isDefault: false
    },
    {
      id: '3',
      bomId: 'BOM002',
      bomCode: 'BOM002',
      bomName: '产品B物料清单',
      version: 'V1.0',
      status: 'inactive',
      effectiveDate: '2023-12-01',
      expiryDate: '2024-01-31',
      createdBy: '赵六',
      createdAt: '2023-12-01 09:00:00',
      description: '已停用版本',
      changeReason: '产品升级',
      isDefault: false
    }
  ];

  const mockVersionHistory: BomVersionHistory[] = [
    {
      id: '1',
      bomId: 'BOM001',
      action: BOM_HISTORY_ACTION.CREATED,
      versionId: '1',
      version: 'V1.0',
      operator: '张三',
      operatedAt: '2024-01-01 09:00:00',
      description: '创建初始版本'
    },
    {
      id: '2',
      bomId: 'BOM001',
      action: BOM_HISTORY_ACTION.ACTIVATED,
      versionId: '1',
      version: 'V1.0',
      operator: '王五',
      operatedAt: '2024-01-01 16:00:00',
      description: '激活版本V1.0'
    },
    {
      id: '3',
      bomId: 'BOM001',
      action: BOM_HISTORY_ACTION.CREATED,
      versionId: '2',
      version: 'V1.1',
      operator: '李四',
      operatedAt: '2024-01-20 10:00:00',
      description: '创建优化版本V1.1'
    }
  ];

  useEffect(() => {
    void loadData();
  }, []); // 空依赖数组是合理的，因为loadData函数在组件内部定义，不会改变

  const loadData = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      setVersions(mockVersions);
      setVersionHistory(mockVersionHistory);
    } catch {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 版本状态渲染
  const renderVersionStatus = (status: string) => {
    const config = BOM_STATUS_MAP[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 版本列定义
  const versionColumns: ColumnsType<BomVersion> = [
    {
      title: 'BOM编码',
      dataIndex: 'bomCode',
      key: 'bomCode',
      width: 120,
      fixed: 'left'
    },
    {
      title: 'BOM名称',
      dataIndex: 'bomName',
      key: 'bomName',
      width: 200
    },
    {
      title: '版本号',
      dataIndex: 'version',
      key: 'version',
      width: 100,
      render: (version: string, record: BomVersion) => (
        <Space>
          <Text strong>{version}</Text>
          {record.isDefault && <Badge status="success" text="默认" />}
        </Space>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: renderVersionStatus
    },
    {
      title: '生效日期',
      dataIndex: 'effectiveDate',
      key: 'effectiveDate',
      width: 120
    },
    {
      title: '失效日期',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 120,
      render: (date: string) => date || '-'
    },
    {
      title: '创建人',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 100
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150
    },
    {
      title: '变更原因',
      dataIndex: 'changeReason',
      key: 'changeReason',
      width: 200,
      ellipsis: true
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewVersion(record)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditVersion(record)}
              disabled={record.status === 'archived'}
            />
          </Tooltip>
          <Tooltip title="复制">
            <Button
              type="link"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => { void handleCopyVersion(record); }}
            />
          </Tooltip>
          <Tooltip title="历史">
            <Button
              type="link"
              size="small"
              icon={<HistoryOutlined />}
              onClick={() => handleViewHistory(record.bomId)}
            />
          </Tooltip>
          {record.status === 'draft' && (
            <Popconfirm
              title="确定删除此版本吗？"
              onConfirm={() => { void handleDeleteVersion(record.id); }}
              okText="确定"
              cancelText="取消"
            >
              <Tooltip title="删除">
                <Button
                  type="link"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  // 版本操作处理
  const handleAddVersion = () => {
    setEditingVersion(null);
    versionForm.resetFields();
    setVersionModalVisible(true);
  };

  const handleEditVersion = (version: BomVersion) => {
    setEditingVersion(version);
    versionForm.setFieldsValue({
      ...version,
      effectiveDate: dayjs(version.effectiveDate),
      expiryDate: version.expiryDate ? dayjs(version.expiryDate) : undefined
    });
    setVersionModalVisible(true);
  };

  const handleViewVersion = (version: BomVersion) => {
    message.info(`查看版本 ${version.version} 详情`);
  };

  const handleCopyVersion = async (version: BomVersion) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newVersion: BomVersion = {
        ...version,
        id: Date.now().toString(),
        version: `${version.version}_Copy`,
        status: 'draft',
        createdBy: '当前用户',
        createdAt: new Date().toISOString(),
        updatedBy: undefined,
        updatedAt: undefined,
        approvedBy: undefined,
        approvedAt: undefined,
        isDefault: false,
        description: `复制自版本 ${version.version}`
      };
      setVersions(prev => [...prev, newVersion]);
      message.success('版本复制成功');
    } catch {
      message.error('版本复制失败');
    }
  };

  const handleDeleteVersion = async (versionId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setVersions(prev => prev.filter(v => v.id !== versionId));
      message.success('删除成功');
    } catch {
      message.error('删除失败');
    }
  };

  const handleSaveVersion = async () => {
    try {
      const values = await versionForm.validateFields();
      await new Promise(resolve => setTimeout(resolve, 500));

      const formattedValues = {
        ...values,
        effectiveDate: values.effectiveDate.format('YYYY-MM-DD'),
        expiryDate: values.expiryDate ? values.expiryDate.format('YYYY-MM-DD') : undefined,
        status: values.status as BomVersion['status']
      };

      if (editingVersion) {
        setVersions(prev => prev.map(v => 
          v.id === editingVersion.id ? { ...v, ...formattedValues } : v
        ));
        message.success('更新成功');
      } else {
        const newVersion: BomVersion = {
          id: Date.now().toString(),
          bomId: 'BOM001',
          createdBy: '当前用户',
          createdAt: new Date().toISOString(),
          ...formattedValues
        };
        setVersions(prev => [...prev, newVersion]);
        message.success('添加成功');
      }

      setVersionModalVisible(false);
    } catch {
      console.error('保存失败');
    }
  };

  // 版本比较
  const handleCompareVersions = () => {
    if (selectedVersions.length !== 2) {
      message.warning('请选择两个版本进行比较');
      return;
    }
    setCompareModalVisible(true);
  };



  // 查看历史
  const handleViewHistory = (bomId: string) => {
    setCurrentBomId(bomId);
    setHistoryDrawerVisible(true);
  };

  // 渲染操作历史图标
  const renderHistoryIcon = (action: string) => {
    const iconMap = {
      [BOM_HISTORY_ACTION.CREATED]: <PlusOutlined style={{ color: '#52c41a' }} />,
      [BOM_HISTORY_ACTION.UPDATED]: <EditOutlined style={{ color: '#1890ff' }} />,
      [BOM_HISTORY_ACTION.ACTIVATED]: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      [BOM_HISTORY_ACTION.DEACTIVATED]: <ClockCircleOutlined style={{ color: '#faad14' }} />,
      [BOM_HISTORY_ACTION.ARCHIVED]: <ExclamationCircleOutlined style={{ color: '#8c8c8c' }} />,
      [BOM_HISTORY_ACTION.COPIED]: <CopyOutlined style={{ color: '#722ed1' }} />
    };
    return iconMap[action as keyof typeof iconMap] || <HistoryOutlined />;
  };

  return (
    <div className="bom-version-manager">
      <Card
        title="BOM版本列表"
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddVersion}
            >
              新增版本
            </Button>
            <Button
              icon={<DiffOutlined />}
              onClick={handleCompareVersions}
              disabled={selectedVersions.length !== 2}
            >
              版本比较
            </Button>
          </Space>
        }
      >
        <Table
          columns={versionColumns}
          dataSource={versions}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1400 }}
          rowSelection={{
            selectedRowKeys: selectedVersions,
            onChange: (selectedRowKeys) => setSelectedVersions(selectedRowKeys as string[]),
            type: 'checkbox'
          }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Card>

      {/* 版本编辑模态框 */}
      <Modal
        title={editingVersion ? '编辑版本' : '新增版本'}
        open={versionModalVisible}
        onOk={() => { void handleSaveVersion(); }}
        onCancel={() => setVersionModalVisible(false)}
        width={800}
        destroyOnHidden
      >
        <Form
          form={versionForm}
          layout="vertical"
          initialValues={{
            status: 'draft',
            isDefault: false
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="bomCode"
                label="BOM编码"
                rules={[{ required: true, message: '请输入BOM编码' }]}
              >
                <Input placeholder="请输入BOM编码" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="bomName"
                label="BOM名称"
                rules={[{ required: true, message: '请输入BOM名称' }]}
              >
                <Input placeholder="请输入BOM名称" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="version"
                label="版本号"
                rules={[{ required: true, message: '请输入版本号' }]}
              >
                <Input placeholder="如：V1.0" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="status"
                label="状态"
                initialValue={BOM_STATUS.DRAFT}
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select>
                  {BOM_STATUS_OPTIONS.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="isDefault"
                label="默认版本"
                valuePropName="checked"
              >
                <input type="checkbox" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="effectiveDate"
                label="生效日期"
                rules={[{ required: true, message: '请选择生效日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="expiryDate"
                label="失效日期"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="changeReason"
            label="变更原因"
            rules={[{ required: true, message: '请输入变更原因' }]}
          >
            <TextArea rows={3} placeholder="请输入变更原因" />
          </Form.Item>

          <Form.Item
            name="description"
            label="版本描述"
          >
            <TextArea rows={3} placeholder="请输入版本描述" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 版本比较模态框 */}
      <Modal
        title="版本比较"
        open={compareModalVisible}
        onCancel={() => setCompareModalVisible(false)}
        width={1000}
        footer={[
          <Button key="close" onClick={() => setCompareModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        <Alert
          message="版本比较功能"
          description="这里将显示两个版本之间的详细差异对比，包括物料变更、数量调整等信息。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Descriptions title="比较结果" bordered>
          <Descriptions.Item label="比较版本">V1.0 vs V1.1</Descriptions.Item>
          <Descriptions.Item label="比较时间">{new Date().toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label="差异项数">3</Descriptions.Item>
        </Descriptions>
      </Modal>

      {/* 历史记录抽屉 */}
      <Drawer
        title="版本操作历史"
        placement="right"
        onClose={() => setHistoryDrawerVisible(false)}
        open={historyDrawerVisible}
        width={500}
      >
        <Timeline>
          {versionHistory
            .filter(item => item.bomId === currentBomId)
            .map(item => (
              <Timeline.Item
                key={item.id}
                dot={renderHistoryIcon(item.action)}
              >
                <div>
                  <Text strong>{item.description}</Text>
                  <br />
                  <Text type="secondary">
                    操作人：{item.operator}
                  </Text>
                  <br />
                  <Text type="secondary">
                    时间：{item.operatedAt}
                  </Text>
                </div>
              </Timeline.Item>
            ))}
        </Timeline>
      </Drawer>
    </div>
  );
};

export default BomVersionManager;