import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Space,
  message,
  Popconfirm,
  Tag,
  DatePicker,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { notificationService } from '../services/notification.service';
import type { Announcement, CreateAnnouncementRequest, UpdateAnnouncementRequest } from '@zyerp/shared';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

const AnnouncementManagement: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [form] = Form.useForm();

  // 加载公告列表
  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await notificationService.getAnnouncements({});
      // 后端返回的数据结构是 { data: { announcements: [...], pagination: {...} } }
      const responseData = response as unknown as { data?: { announcements?: Announcement[] } };
      setAnnouncements(responseData.data?.announcements || []);
    } catch {
      message.error('加载公告列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  // 创建公告
  const handleCreate = async (values: CreateAnnouncementRequest) => {
    try {
      await notificationService.createAnnouncement(values);
      message.success('创建公告成功');
      setModalVisible(false);
      form.resetFields();
      loadAnnouncements();
    } catch {
      message.error('创建公告失败');
    }
  };

  // 更新公告
  const handleUpdate = async (values: UpdateAnnouncementRequest) => {
    if (!editingAnnouncement) return;
    
    try {
      await notificationService.updateAnnouncement(editingAnnouncement.id, values);
      message.success('更新公告成功');
      setModalVisible(false);
      setEditingAnnouncement(null);
      form.resetFields();
      loadAnnouncements();
    } catch {
      message.error('更新公告失败');
    }
  };

  // 删除公告
  const handleDelete = async (id: string) => {
    try {
      await notificationService.deleteAnnouncement(id);
      message.success('删除公告成功');
      loadAnnouncements();
    } catch {
      message.error('删除公告失败');
    }
  };

  // 切换公告状态
  const handleToggleStatus = async (announcement: Announcement) => {
    try {
      await notificationService.toggleAnnouncementStatus(announcement.id, !announcement.isActive);
      message.success(`${announcement.isActive ? '禁用' : '启用'}公告成功`);
      loadAnnouncements();
    } catch {
      message.error('切换公告状态失败');
    }
  };

  // 打开创建/编辑模态框
  const openModal = (announcement?: Announcement) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      form.setFieldsValue({
        ...announcement,
        expireAt: announcement.expireAt ? dayjs(announcement.expireAt) : null,
      });
    } else {
      setEditingAnnouncement(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  // 表格列配置
  const columns: ColumnsType<Announcement> = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      width: 300,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeMap = {
          info: { color: 'blue', text: '信息' },
          warning: { color: 'orange', text: '警告' },
          error: { color: 'red', text: '错误' },
          success: { color: 'green', text: '成功' },
        };
        const config = typeMap[type as keyof typeof typeMap] || { color: 'default', text: type };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        const priorityMap = {
          low: { color: 'default', text: '低' },
          medium: { color: 'blue', text: '中' },
          high: { color: 'orange', text: '高' },
          urgent: { color: 'red', text: '紧急' },
        };
        const config = priorityMap[priority as keyof typeof priorityMap] || { color: 'default', text: priority };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean, record: Announcement) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleStatus(record)}
          checkedChildren="启用"
          unCheckedChildren="禁用"
        />
      ),
    },
    {
      title: '过期时间',
      dataIndex: 'expireAt',
      key: 'expireAt',
      render: (expireAt: string) => expireAt ? dayjs(expireAt).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: string) => dayjs(createdAt).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record: Announcement) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个公告吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openModal()}
        >
          创建公告
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={announcements}
        rowKey="id"
        loading={loading}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
      />

      <Modal
        title={editingAnnouncement ? '编辑公告' : '创建公告'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingAnnouncement(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingAnnouncement ? handleUpdate : handleCreate}
        >
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入公告标题' }]}
          >
            <Input placeholder="请输入公告标题" />
          </Form.Item>

          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入公告内容' }]}
          >
            <TextArea rows={4} placeholder="请输入公告内容" />
          </Form.Item>

          <Form.Item
            name="type"
            label="类型"
            rules={[{ required: true, message: '请选择公告类型' }]}
          >
            <Select placeholder="请选择公告类型">
              <Option value="info">信息</Option>
              <Option value="warning">警告</Option>
              <Option value="error">错误</Option>
              <Option value="success">成功</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="priority"
            label="优先级"
            rules={[{ required: true, message: '请选择优先级' }]}
          >
            <Select placeholder="请选择优先级">
              <Option value="low">低</Option>
              <Option value="medium">中</Option>
              <Option value="high">高</Option>
              <Option value="urgent">紧急</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="expireAt"
            label="过期时间"
          >
            <DatePicker
              showTime
              placeholder="请选择过期时间"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="状态"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingAnnouncement ? '更新' : '创建'}
              </Button>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  setEditingAnnouncement(null);
                  form.resetFields();
                }}
              >
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AnnouncementManagement;