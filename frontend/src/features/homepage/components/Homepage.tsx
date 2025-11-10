import React from 'react';
import { Card, Row, Col, Statistic, Button, Space, Typography } from 'antd';
import {
  ShoppingCartOutlined,
  InboxOutlined,
  UserOutlined,
  FileTextOutlined,
  BarChartOutlined,
  TeamOutlined,
  SettingOutlined,
  ClusterOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './Homepage.css';

const { Title, Text } = Typography;

const Homepage: React.FC = () => {
  const navigate = useNavigate();

  // 快捷操作配置
  const quickActions = [
    {
      title: '新建生产工单',
      icon: <ClusterOutlined />,
      path: '/production-order',
      color: '#1890ff',
      description: '创建新的生产工单'
    },
    {
      title: '新建采购订单',
      icon: <ShoppingCartOutlined />,
      path: '/purchase-order',
      color: '#52c41a',
      description: '创建新的采购订单'
    },
    {
      title: '新建销售订单',
      icon: <FileTextOutlined />,
      path: '/sales-order',
      color: '#fa8c16',
      description: '创建新的销售订单'
    },
    {
      title: '库存管理',
      icon: <InboxOutlined />,
      path: '/inventory',
      color: '#722ed1',
      description: '查看和管理库存信息'
    },
    {
      title: '产品管理',
      icon: <ShoppingOutlined />,
      path: '/products',
      color: '#eb2f96',
      description: '管理产品信息和规格'
    },
    {
      title: '用户管理',
      icon: <UserOutlined />,
      path: '/users',
      color: '#13c2c2',
      description: '管理系统用户和权限'
    },
  ];

  // 统计数据（模拟数据）
  const statisticsData = [
    {
      title: '今日生产工单',
      value: 28,
      suffix: '个',
      prefix: <ClusterOutlined style={{ color: '#1890ff' }} />,
      valueStyle: { color: '#1890ff' },
    },
    {
      title: '待处理采购订单',
      value: 15,
      suffix: '个',
      prefix: <ShoppingCartOutlined style={{ color: '#52c41a' }} />,
      valueStyle: { color: '#52c41a' },
    },
    {
      title: '库存预警',
      value: 7,
      suffix: '项',
      prefix: <InboxOutlined style={{ color: '#fa8c16' }} />,
      valueStyle: { color: '#fa8c16' },
    },
    {
      title: '在线用户',
      value: 12,
      suffix: '人',
      prefix: <UserOutlined style={{ color: '#722ed1' }} />,
      valueStyle: { color: '#722ed1' },
    },
  ];

  // 最近活动数据（模拟数据）
  const recentActivities = [
    { time: '10:30', action: '张三创建了生产工单', type: 'production', id: 'PO-2024-001' },
    { time: '09:45', action: '李四完成了采购入库', type: 'purchase', id: 'PR-2024-015' },
    { time: '09:20', action: '王五更新了产品信息', type: 'product', id: 'PROD-001' },
    { time: '08:55', action: '赵六处理了销售订单', type: 'sales', id: 'SO-2024-032' },
    { time: '08:30', action: '系统自动备份完成', type: 'system', id: 'BACKUP-001' },
  ];

  const handleQuickAction = (path: string) => {
    navigate(path);
  };

  return (
    <div className="homepage-container">
      {/* 统计数据区域 */}
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        {statisticsData.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                suffix={stat.suffix}
                prefix={stat.prefix}
                valueStyle={stat.valueStyle}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* 主要内容区域 */}
      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        {/* 快捷操作 */}
        <Col xs={24} lg={16}>
          <Card title="快捷操作" extra={<SettingOutlined />}>
            <Row gutter={[16, 16]}>
              {quickActions.map((action, index) => (
                <Col xs={24} sm={12} lg={8} key={index}>
                  <Card
                    hoverable
                    className="quick-action-card"
                    onClick={() => handleQuickAction(action.path)}
                    style={{ borderColor: action.color }}
                  >
                    <div className="quick-action-content">
                      <div 
                        className="quick-action-icon"
                        style={{ backgroundColor: `${action.color}15`, color: action.color }}
                      >
                        {action.icon}
                      </div>
                      <div className="quick-action-text">
                        <Title level={5} style={{ margin: 0, color: action.color }}>
                          {action.title}
                        </Title>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {action.description}
                        </Text>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* 最近活动 */}
        <Col xs={24} lg={8}>
          <Card title="最近活动" extra={<TeamOutlined />}>
            <div className="recent-activities">
              {recentActivities.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-time">{activity.time}</div>
                  <div className="activity-content">
                    <Text>{activity.action}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {activity.id}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 系统状态区域 */}
      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="系统状态">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="系统运行时间"
                  value="15天 8小时"
                  prefix={<SettingOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="数据库状态"
                  value="正常"
                  prefix={<BarChartOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="快速导航">
            <Space wrap>
              <Button 
                type="primary" 
                icon={<ClusterOutlined />}
                onClick={() => navigate('/production-management')}
              >
                生产管理
              </Button>
              <Button 
                icon={<ShoppingCartOutlined />}
                onClick={() => navigate('/purchase-management')}
              >
                采购管理
              </Button>
              <Button 
                icon={<FileTextOutlined />}
                onClick={() => navigate('/sales-management')}
              >
                销售管理
              </Button>
              <Button 
                icon={<InboxOutlined />}
                onClick={() => navigate('/inventory-management')}
              >
                库存管理
              </Button>
              <Button 
                icon={<ShoppingOutlined />}
                onClick={() => navigate('/base-data')}
              >
                基础资料
              </Button>
              <Button 
                icon={<SettingOutlined />}
                onClick={() => navigate('/system')}
              >
                系统管理
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Homepage;