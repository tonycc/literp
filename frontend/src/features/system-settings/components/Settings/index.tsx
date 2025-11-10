import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Switch, Button, Space, Divider, message, Spin } from 'antd';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import { settingsService, type UpdateSettingsData } from '../../services/settings.service';

interface SettingsForm {
  siteName: string;
  siteDescription: string;
  enableRegistration: boolean;
  enableEmailNotification: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
}

const Settings: React.FC = () => {
  const [form] = Form.useForm<SettingsForm>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);


  // 加载设置数据
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const data = await settingsService.getSettings();
        form.setFieldsValue({
          siteName: data.siteName,
          siteDescription: data.siteDescription,
          enableRegistration: data.enableRegistration,
          enableEmailNotification: data.enableEmailNotification,
          sessionTimeout: data.sessionTimeout,
          maxLoginAttempts: data.maxLoginAttempts,
        });
      } catch (error) {
         console.error('加载设置失败:', error);
         message.error('加载设置失败');
       } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [form]);

  const onFinish = async (values: SettingsForm) => {
    setSaving(true);
    try {
      const updateData: UpdateSettingsData = {
        siteName: values.siteName,
        siteDescription: values.siteDescription,
        enableRegistration: values.enableRegistration,
        enableEmailNotification: values.enableEmailNotification,
        sessionTimeout: values.sessionTimeout,
        maxLoginAttempts: values.maxLoginAttempts,
      };
      
      await settingsService.updateSettings(updateData);
      message.success('设置保存成功');
    } catch (error) {
       console.error('保存设置失败:', error);
       message.error('保存设置失败');
     } finally {
      setSaving(false);
    }
  };

  const onReset = async () => {
    try {
      const defaultSettings = await settingsService.resetSettings();
      form.setFieldsValue({
        siteName: defaultSettings.siteName,
        siteDescription: defaultSettings.siteDescription,
        enableRegistration: defaultSettings.enableRegistration,
        enableEmailNotification: defaultSettings.enableEmailNotification,
        sessionTimeout: defaultSettings.sessionTimeout,
        maxLoginAttempts: defaultSettings.maxLoginAttempts,
      });
      message.success('设置已重置为默认值');
    } catch (error) {
       console.error('重置设置失败:', error);
       message.error('重置设置失败');
     }
  };

  if (loading) {
    return (
      <div style={{ padding: 0, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 0 }}>
      <Card title="系统设置">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Divider orientation="left">基础设置</Divider>
          
          <Form.Item
            label="站点名称"
            name="siteName"
            rules={[{ required: true, message: '请输入站点名称' }]}
          >
            <Input placeholder="请输入站点名称" />
          </Form.Item>

          <Form.Item
            label="站点描述"
            name="siteDescription"
          >
            <Input.TextArea 
              placeholder="请输入站点描述" 
              rows={3}
            />
          </Form.Item>

          <Divider orientation="left">功能设置</Divider>

          <Form.Item
            label="允许用户注册"
            name="enableRegistration"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            label="启用邮件通知"
            name="enableEmailNotification"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Divider orientation="left">安全设置</Divider>

          <Form.Item
            label="会话超时时间（分钟）"
            name="sessionTimeout"
            rules={[{ required: true, message: '请输入会话超时时间' }]}
          >
            <Input type="number" placeholder="请输入会话超时时间" />
          </Form.Item>

          <Form.Item
            label="最大登录尝试次数"
            name="maxLoginAttempts"
            rules={[{ required: true, message: '请输入最大登录尝试次数' }]}
          >
            <Input type="number" placeholder="请输入最大登录尝试次数" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SaveOutlined />}
                loading={saving}
              >
                保存设置
              </Button>
              <Button 
                onClick={onReset} 
                icon={<ReloadOutlined />}
                disabled={saving}
              >
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Settings;