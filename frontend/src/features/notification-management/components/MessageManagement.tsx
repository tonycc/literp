import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  message,
  Popconfirm,
  Tag,
  Tabs,
  Card,
  Typography,
  Avatar,
} from 'antd';
import {
  PlusOutlined,
  InboxOutlined,
  SendOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { notificationService } from '../services/notification.service';
import type { Message, CreateMessageRequest } from '@zyerp/shared';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const MessageManagement: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [activeTab, setActiveTab] = useState('inbox');
  const [form] = Form.useForm();

  // 加载收件箱消息（接收的消息）
  const loadInboxMessages = async () => {
    setLoading(true);
    try {
      const response = await notificationService.getMessages({});
      // 正确访问嵌套的消息数组
      const responseData = response as unknown as { data?: { messages?: Message[] } };
      setMessages(responseData.data?.messages || []);
    } catch {
      message.error('加载收件箱失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载发件箱消息（发送的消息）
  const loadSentMessages = async () => {
    setLoading(true);
    try {
      const response = await notificationService.getSentMessages({});
      // 正确访问嵌套的消息数组
      const responseData = response as unknown as { data?: { messages?: Message[] } };
      setSentMessages(responseData.data?.messages || []);
    } catch {
      message.error('加载发件箱失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'inbox') {
      loadInboxMessages();
    } else if (activeTab === 'sent') {
      loadSentMessages();
    }
  }, [activeTab]);

  // 发送消息
  const handleSendMessage = async (values: CreateMessageRequest) => {
    try {
      await notificationService.sendMessage(values);
      message.success('发送消息成功');
      setModalVisible(false);
      form.resetFields();
      if (activeTab === 'sent') {
        loadSentMessages();
      }
    } catch {
      message.error('发送消息失败');
    }
  };

  // 标记消息为已读
  const handleMarkAsRead = async (messageId: string) => {
    try {
      await notificationService.markMessageAsRead(messageId);
      message.success('标记已读成功');
      loadInboxMessages();
    } catch {
      message.error('标记已读失败');
    }
  };

  // 删除消息
  const handleDelete = async (messageId: string) => {
    try {
      await notificationService.deleteMessage(messageId);
      message.success('删除消息成功');
      if (activeTab === 'inbox') {
        loadInboxMessages();
      } else {
        loadSentMessages();
      }
    } catch {
      message.error('删除消息失败');
    }
  };

  // 查看消息详情
  const handleViewDetail = async (messageRecord: Message) => {
    setSelectedMessage(messageRecord);
    setDetailModalVisible(true);
    
    // 如果是收件箱中的未读消息，标记为已读
    if (activeTab === 'inbox' && !messageRecord.isRead) {
      await handleMarkAsRead(messageRecord.id);
    }
  };

  // 收件箱表格列定义
  const inboxColumns: ColumnsType<Message> = [
    {
      title: '发送者',
      dataIndex: ['sender', 'username'],
      key: 'sender',
      width: 120,
      render: (username: string) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <span>{username || '系统'}</span>
        </Space>
      ),
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: Message) => (
        <Space>
          <span style={{ fontWeight: record.isRead ? 'normal' : 'bold' }}>
            {title}
          </span>
          {!record.isRead && <Tag color="blue">未读</Tag>}
        </Space>
      ),
    },

    {
      title: '发送时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_, record: Message) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            查看
          </Button>
          {!record.isRead && (
            <Button
              type="link"
              size="small"
              onClick={() => handleMarkAsRead(record.id)}
            >
              标记已读
            </Button>
          )}
          <Popconfirm
            title="确定要删除这条消息吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 发件箱表格列定义
  const sentColumns: ColumnsType<Message> = [
    {
      title: '接收者',
      dataIndex: ['receiver', 'username'],
      key: 'receiver',
      width: 120,
      render: (username: string) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <span>{username}</span>
        </Space>
      ),
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },

    {
      title: '发送时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '状态',
      dataIndex: 'isRead',
      key: 'isRead',
      width: 80,
      render: (isRead: boolean) => (
        <Tag color={isRead ? 'green' : 'orange'}>
          {isRead ? '已读' : '未读'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (_, record: Message) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            查看
          </Button>
          <Popconfirm
            title="确定要删除这条消息吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0 }}>消息管理</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          发送消息
        </Button>
      </div>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'inbox',
              label: (
                <span>
                  <InboxOutlined />
                  收件箱
                </span>
              ),
              children: (
                <Table
                  columns={inboxColumns}
                  dataSource={messages}
                  rowKey="id"
                  loading={loading}
                  pagination={{
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `共 ${total} 条记录`,
                  }}
                />
              ),
            },
            {
              key: 'sent',
              label: (
                <span>
                  <SendOutlined />
                  发件箱
                </span>
              ),
              children: (
                <Table
                  columns={sentColumns}
                  dataSource={sentMessages}
                  rowKey="id"
                  loading={loading}
                  pagination={{
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `共 ${total} 条记录`,
                  }}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* 发送消息模态框 */}
      <Modal
        title="发送消息"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSendMessage}
        >
          <Form.Item
            name="receiverId"
            label="接收者"
            rules={[{ required: true, message: '请选择接收者' }]}
          >
            <Select
              placeholder="请选择接收者"
              showSearch
              filterOption={(input, option) =>
                String(option?.children || '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {/* 这里应该从用户列表API获取数据 */}
              <Option value="user1">用户1</Option>
              <Option value="user2">用户2</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入消息标题' }]}
          >
            <Input placeholder="请输入消息标题" />
          </Form.Item>

          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入消息内容' }]}
          >
            <TextArea rows={4} placeholder="请输入消息内容" />
          </Form.Item>



          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                发送
              </Button>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                }}
              >
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 消息详情模态框 */}
      <Modal
        title="消息详情"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedMessage(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setDetailModalVisible(false);
              setSelectedMessage(null);
            }}
          >
            关闭
          </Button>,
        ]}
        width={600}
      >
        {selectedMessage && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>标题：</Text>
              <Text>{selectedMessage.title}</Text>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>
                {activeTab === 'inbox' ? '发送者：' : '接收者：'}
              </Text>
              <Text>
                {activeTab === 'inbox' 
                  ? (selectedMessage.sender?.username || '系统')
                  : selectedMessage.receiver?.username
                }
              </Text>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>类型：</Text>
              <Tag color="default">
                普通消息
              </Tag>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>发送时间：</Text>
              <Text>{dayjs(selectedMessage.createdAt).format('YYYY-MM-DD HH:mm:ss')}</Text>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>状态：</Text>
              <Tag color={selectedMessage.isRead ? 'green' : 'orange'}>
                {selectedMessage.isRead ? '已读' : '未读'}
              </Tag>
            </div>
            <div>
              <Text strong>内容：</Text>
              <div style={{ 
                marginTop: 8, 
                padding: 12, 
                backgroundColor: '#f5f5f5', 
                borderRadius: 4,
                whiteSpace: 'pre-wrap'
              }}>
                {selectedMessage.content}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MessageManagement;