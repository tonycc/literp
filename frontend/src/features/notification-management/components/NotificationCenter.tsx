/**
 * 通知中心组件 - 使用 Ant Design 设计规范
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  List,
  Input,
  Select,
  Button,
  Badge,
  Tag,
  Space,
  Typography,
  Empty,
  Spin,
  Tooltip,
  Popconfirm,
  Row,
  Col,
  Statistic,
  Divider,
} from 'antd';
import {
  BellOutlined,
  CloseOutlined,
  CheckOutlined,
  DeleteOutlined,
  SearchOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { notificationService } from '../services/notification.service';
import { webSocketNotificationService } from '../services/websocket.service';
import type { 
  Notification, 
  NotificationSearchParams, 
  NotificationStats
} from '@zyerp/shared';

const { Search } = Input;
const { Option } = Select;
const { Text, Paragraph } = Typography;

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  embedded?: boolean; // 是否为嵌入式模式（在页面中使用）
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose, embedded = false }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all');
  const [stats, setStats] = useState<NotificationStats | null>(null);

  // 加载通知列表
  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params: NotificationSearchParams = {
        search: searchTerm || undefined,
        isRead: filterType === 'all' ? undefined : filterType === 'read',
        page: 1,
        limit: 50,
      };
      
      const response = await notificationService.getNotifications(params);
      // 后端返回的数据结构是 { success: true, data: { notifications: [...], pagination: {...} } }
      const responseData = response as unknown as { data?: { notifications?: Notification[] } };
      setNotifications(responseData.data?.notifications || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterType]);

  // 加载统计信息
  const loadStats = useCallback(async () => {
    try {
      const statsData = await notificationService.getNotificationStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load notification stats:', error);
    }
  }, []);

  // 标记为已读
  const markAsRead = async (id: string) => {
    try {
      await notificationService.markNotificationAsRead(id);
      await loadNotifications();
      await loadStats();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // 全部标记为已读
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllNotificationsAsRead();
      await loadNotifications();
      await loadStats();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // 删除通知
  const deleteNotification = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      await loadNotifications();
      await loadStats();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // 处理WebSocket通知
  const handleWebSocketNotification = useCallback(() => {
    loadNotifications();
    loadStats();
  }, [loadNotifications, loadStats]);

  // 初始化
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
      loadStats();
    }
  }, [isOpen, loadNotifications, loadStats]);

  // WebSocket连接
  useEffect(() => {
    if (isOpen) {
      const unsubscribeNotification = webSocketNotificationService.onNotification(handleWebSocketNotification);
      const unsubscribeAnnouncement = webSocketNotificationService.onAnnouncement(handleWebSocketNotification);

      return () => {
        unsubscribeNotification();
        unsubscribeAnnouncement();
      };
    }
  }, [isOpen, handleWebSocketNotification]);

  // 搜索和筛选变化时重新加载
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        loadNotifications();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchTerm, filterType, isOpen, loadNotifications]);

  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
    
    return date.toLocaleDateString('zh-CN');
  };

  // 获取类型文本和颜色
  const getTypeConfig = (type: string) => {
    const typeMap = {
      system: { text: '系统', color: 'blue' },
      user: { text: '用户', color: 'green' },
      announcement: { text: '公告', color: 'orange' },
      message: { text: '消息', color: 'purple' }
    };
    return typeMap[type as keyof typeof typeMap] || { text: type, color: 'default' };
  };

  // 获取优先级配置
  const getPriorityConfig = (priority: string) => {
    const priorityMap = {
      low: { text: '低', color: 'green' },
      medium: { text: '中', color: 'orange' },
      high: { text: '高', color: 'red' },
      urgent: { text: '紧急', color: 'red' }
    };
    return priorityMap[priority as keyof typeof priorityMap] || { text: priority, color: 'default' };
  };

  if (!isOpen) return null;

  // 渲染通知项
  const renderNotificationItem = (item: Notification) => {
    const typeConfig = getTypeConfig(item.type);
    const priorityConfig = getPriorityConfig(item.priority);

    return (
      <List.Item
        key={item.id}
        style={{
          backgroundColor: !item.isRead ? '#f6ffed' : undefined,
          borderLeft: !item.isRead ? '4px solid #52c41a' : undefined,
        }}
        actions={[
          !item.isRead && (
            <Tooltip title="标记为已读">
              <Button
                type="text"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => markAsRead(item.id)}
              />
            </Tooltip>
          ),
          <Popconfirm
            title="确定要删除这条通知吗？"
            onConfirm={() => deleteNotification(item.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                danger
              />
            </Tooltip>
          </Popconfirm>
        ].filter(Boolean)}
      >
        <List.Item.Meta
          avatar={
            <Badge dot={!item.isRead} color="#52c41a">
              <BellOutlined style={{ fontSize: 16, color: '#1890ff' }} />
            </Badge>
          }
          title={
            <Space>
               <Text strong={!item.isRead}>{item.title}</Text>
               <Tag color={typeConfig.color}>
                 {typeConfig.text}
               </Tag>
               <Tag color={priorityConfig.color}>
                 {priorityConfig.text}
               </Tag>
             </Space>
          }
          description={
            <div>
              <Paragraph
                ellipsis={{ rows: 2, expandable: false }}
                style={{ marginBottom: 4, color: '#666' }}
              >
                {item.content}
              </Paragraph>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {formatTime(item.createdAt)}
              </Text>
            </div>
          }
        />
      </List.Item>
    );
  };

  // 内容部分
  const content = (
    <Card
      title={
        <Space>
          <BellOutlined />
          <span>通知中心</span>
        </Space>
      }
      extra={
        !embedded && (
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={onClose}
          />
        )
      }
      bodyStyle={{ padding: 0 }}
      style={{ height: embedded ? '100%' : undefined }}
    >
      {/* 统计信息 */}
      {stats && (
        <div style={{ padding: '16px 24px 0' }}>
          <Row gutter={16}>
            <Col span={8}>
              <Statistic title="总计" value={stats.total} />
            </Col>
            <Col span={8}>
              <Statistic 
                title="未读" 
                value={stats.unread} 
                valueStyle={{ color: stats.unread > 0 ? '#cf1322' : undefined }}
              />
            </Col>
            <Col span={8}>
              <Statistic title="今日" value={stats.today} />
            </Col>
          </Row>
          <Divider />
        </div>
      )}

      {/* 搜索和筛选 */}
      <div style={{ padding: '0 24px 16px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Search
            placeholder="搜索通知..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            prefix={<SearchOutlined />}
            allowClear
          />
          
          <Row gutter={8}>
            <Col flex="auto">
              <Select
                value={filterType}
                onChange={(value) => setFilterType(value)}
                style={{ width: '100%' }}
              >
                <Option value="all">全部</Option>
                <Option value="unread">未读</Option>
                <Option value="read">已读</Option>
              </Select>
            </Col>
            {stats && stats.unread > 0 && (
              <Col>
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={markAllAsRead}
                >
                  全部已读
                </Button>
              </Col>
            )}
          </Row>
        </Space>
      </div>

      {/* 通知列表 */}
      <div style={{ 
        height: embedded ? 'calc(100% - 200px)' : '400px',
        overflow: 'auto'
      }}>
        <Spin spinning={loading}>
          {notifications.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无通知"
              style={{ padding: '40px 0' }}
            />
          ) : (
            <List
              dataSource={notifications}
              renderItem={renderNotificationItem}
              style={{ padding: '0 24px' }}
            />
          )}
        </Spin>
      </div>
    </Card>
  );

  // 根据模式返回不同的容器
  if (embedded) {
    return (
      <div style={{ height: '100%' }}>
        {content}
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <div style={{ width: 400, height: '100%', backgroundColor: '#fff' }}>
        {content}
      </div>
    </div>
  );
};

export default NotificationCenter;