import React from 'react'
import { Form, Input, Button, Card, Typography, message, Checkbox, Select, Divider, Space, Tag } from 'antd'
import { UserOutlined, LockOutlined, ExperimentOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { SupplierLoginForm } from '../types'
import { useAuth } from '../hooks/useAuth'
import { allDemoAccounts } from '../data/demoAccounts'
import './LoginPage.css'

const { Title, Text } = Typography

const LoginPage: React.FC = () => {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const { login, loading } = useAuth()

  // 选择demo账号
  const handleDemoAccountSelect = (accountId: string) => {
    const account = allDemoAccounts.find(acc => acc.id === accountId)
    if (account) {
      form.setFieldsValue({
        username: account.username,
        password: account.password
      })
      message.info(`已选择${account.type === 'supplier' ? '供应商' : '客户'}账号：${account.displayName}`)
    }
  }

  const handleLogin = async (values: SupplierLoginForm) => {
    try {
      await login(values)
      message.success('登录成功')
      navigate('/orders')
    } catch (error) {
      message.error(error instanceof Error ? error.message : '登录失败')
    }
  }

  return (
    <div className="login-container">
      <Card className="login-card">
        <div className="login-header">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <Title level={4} style={{ margin: 0, color: '#1f2937' }}>
                ZYERP系统
              </Title>
            </div>
          </div>
          <p style={{ color: '#6b7280', margin: 0, fontSize: 14 }}>
            欢迎使用ZYERP系统
          </p>
        </div>

        <Form
          form={form}
          name="supplier-login"
          onFinish={handleLogin}
          autoComplete="off"
          layout="vertical"
          size="large"
          className="login-form"
        >
          {/* Demo账号选择 */}
          <Card 
            size="small" 
            style={{ marginBottom: 16, backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ExperimentOutlined style={{ color: '#52c41a' }} />
                <Typography.Text strong style={{ color: '#52c41a' }}>
                  快速体验 Demo 账号
                </Typography.Text>
              </div>
              <Select
                placeholder="选择一个demo账号快速登录"
                style={{ width: '100%' }}
                onChange={handleDemoAccountSelect}
                options={allDemoAccounts.map(account => ({
                  value: account.id,
                  label: (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{account.displayName}</span>
                      <Tag color={account.type === 'supplier' ? 'blue' : 'green'}>
                        {account.type === 'supplier' ? '供应商' : '客户'}
                      </Tag>
                    </div>
                  )
                }))}
              />
            </Space>
          </Card>

          <Divider>或手动输入</Divider>

          <Form.Item
            label="邮箱/手机号"
            name="username"
            rules={[
              { required: true, message: '请输入邮箱或手机号!' },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  
                  // 邮箱格式验证
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  // 手机号格式验证（中国大陆）
                  const phoneRegex = /^1[3-9]\d{9}$/;
                  
                  if (emailRegex.test(value) || phoneRegex.test(value)) {
                    return Promise.resolve();
                  }
                  
                  return Promise.reject(new Error('请输入正确的邮箱或手机号格式!'));
                }
              }
            ]}
          >
            <Input 
              prefix={<UserOutlined style={{ color: '#9ca3af' }} />} 
              placeholder="请输入邮箱或手机号" 
            />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[
              { required: true, message: '请输入密码!' },
              { min: 6, message: '密码至少6位!' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined style={{ color: '#9ca3af' }} />} 
              placeholder="请输入密码" 
            />
          </Form.Item>

          <Form.Item name="remember" valuePropName="checked" style={{ marginBottom: 24 }}>
            <Checkbox>记住登录状态</Checkbox>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            如有问题，请联系系统管理员
          </Text>
        </div>
      </Card>
    </div>
  )
}

export default LoginPage