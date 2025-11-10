import React from 'react'
import { Card, Tag, Descriptions, Alert, Space, Typography, Divider } from 'antd'
import { UserOutlined, SafetyOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { usePermissions, PERMISSIONS } from '../../../shared/hooks/usePermissions'
import { useAuth } from '../../auth/hooks/useAuth'

const { Title, Text } = Typography

const PermissionDemo: React.FC = () => {
  const { user } = useAuth()
  const { 
    userType, 
    hasPermission, 
    userPermissions
  } = usePermissions()

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case 'supplier':
        return 'blue'
      case 'customer':
        return 'green'
      default:
        return 'default'
    }
  }

  const getUserTypeName = (type: string) => {
    switch (type) {
      case 'supplier':
        return '供应商'
      case 'customer':
        return '客户'
      default:
        return '未知'
    }
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <SafetyOutlined /> 权限管理演示
      </Title>
      
      <Alert
        message="权限系统说明"
        description="本系统根据用户类型（供应商/客户）自动分配不同的菜单权限。供应商可以查看采购订单，客户可以查看订单信息，两者都可以查看库存、个人资料和财务信息。"
        type="info"
        showIcon
        style={{ marginBottom: '24px' }}
      />

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 当前用户信息 */}
        <Card title={<><UserOutlined /> 当前用户信息</>}>
          <Descriptions column={2}>
            <Descriptions.Item label="用户名">
              {user?.username || '未登录'}
            </Descriptions.Item>
            <Descriptions.Item label="公司名称">
              {user?.companyName || '未设置'}
            </Descriptions.Item>
            <Descriptions.Item label="联系人">
              {user?.contactPerson || '未设置'}
            </Descriptions.Item>
            <Descriptions.Item label="用户类型">
              <Tag color={getUserTypeColor(userType || '')}>
                {getUserTypeName(userType || '')}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 用户权限信息 */}
        <Card title="当前用户权限">
          <Space wrap>
            {userPermissions.map(permission => (
              <Tag key={permission} color="green" icon={<CheckCircleOutlined />}>
                {permission}
              </Tag>
            ))}
          </Space>
          {userPermissions.length === 0 && (
            <Text type="secondary">当前用户没有任何权限</Text>
          )}
        </Card>

        {/* 系统权限配置 */}
        <Card title="系统权限配置">
          <Space direction="vertical" style={{ width: '100%' }}>
            {PERMISSIONS.map(permission => (
              <Card 
                key={permission.key} 
                size="small" 
                style={{ marginBottom: '8px' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Space>
                    <Text strong>{permission.name}</Text>
                    <Tag color={hasPermission(permission.key) ? 'green' : 'red'}>
                      {hasPermission(permission.key) ? (
                        <><CheckCircleOutlined /> 有权限</>
                      ) : (
                        <><CloseCircleOutlined /> 无权限</>
                      )}
                    </Tag>
                  </Space>
                  <Text type="secondary">{permission.description}</Text>
                  <div>
                    <Text type="secondary">适用用户类型：</Text>
                    <Space>
                      {permission.userTypes.map(type => (
                        <Tag key={type} color={getUserTypeColor(type)}>
                          {getUserTypeName(type)}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                </Space>
              </Card>
            ))}
          </Space>
        </Card>

        {/* 测试账号信息 */}
        <Card title="测试账号信息">
          <Alert
            message="可用测试账号"
            description={
              <div>
                <Divider orientation="left">供应商账号</Divider>
                <ul>
                  <li>用户名: supplier@demo.com, 密码: 123456</li>
                  <li>用户名: supplier2@demo.com, 密码: 123456</li>
                  <li>用户名: supplier3@demo.com, 密码: 123456</li>
                </ul>
                <Divider orientation="left">客户账号</Divider>
                <ul>
                  <li>用户名: customer@demo.com, 密码: 123456</li>
                  <li>用户名: customer2@demo.com, 密码: 123456</li>
                </ul>
              </div>
            }
            type="info"
          />
        </Card>
      </Space>
    </div>
  )
}

export default PermissionDemo