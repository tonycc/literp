import React, { useEffect } from 'react';
import { Form, Input, Button, Card, Typography } from 'antd';
import { useMessage } from '@/shared/hooks/useMessage';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './index.css';

const { Title } = Typography;

interface AxiosError {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
    status?: number;
  };
  message?: string;
}

interface LoginForm {
  username: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const { login, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const message = useMessage();


  // 如果已经登录，重定向到目标页面或仪表板
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      void navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const onFinish = async (values: LoginForm) => {
    try {
      await login(values.username, values.password);
      //message.success('登录成功');
      // 导航将由useEffect处理
    } catch (error: unknown) {
      let errorMessage = '登录失败，请检查网络连接';
      
      // 类型检查并提取错误消息
      if (error && typeof error === 'object') {
        const axiosError = error as AxiosError;
        
        // 优先根据HTTP状态码判断错误类型
        if (axiosError.response?.status === 401) {
          // 401 未授权错误 - 用户名或密码错误
          errorMessage = '用户名或密码错误';
        } else if (axiosError.response?.status === 400) {
          // 400 请求错误
          errorMessage = '请求参数错误，请检查输入信息';
        } else if (axiosError.response?.status && axiosError.response.status >= 500) {
          // 服务器错误
          errorMessage = '服务器错误，请稍后重试';
        } else if (axiosError.response?.data?.message) {
          // 后端返回的标准错误格式
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.response?.data?.error) {
          // 备用错误格式
          errorMessage = axiosError.response.data.error;
        } else if (axiosError.message) {
          // 网络错误或其他错误
          errorMessage = axiosError.message;
        }
      }
      
      message.error(errorMessage);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <div className="login-header">
          <Title level={2}>ZYERP管理系统</Title>
          <p>欢迎登录</p>
        </div>
        
        <Form<LoginForm>
          name="login"
          onFinish={(values) => { void onFinish(values) }}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入邮箱!' },
              { type: 'email', message: '请输入有效的邮箱地址!' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="邮箱"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              block
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;