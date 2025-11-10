import React from 'react'
import { Result, Button } from 'antd'
import { usePermissions } from '../hooks/usePermissions'

interface PermissionRouteProps {
  children: React.ReactNode
  permission?: string
  userTypes?: string[]
  fallbackPath?: string
}

const PermissionRoute: React.FC<PermissionRouteProps> = ({
  children,
  permission,
  userTypes,
}) => {
  const { hasPermission, userType } = usePermissions()

  // 如果没有权限要求，直接渲染子组件
  if (!permission && !userTypes) {
    return <>{children}</>
  }

  // 检查权限
  if (permission && !hasPermission(permission)) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="抱歉，您没有权限访问此页面。"
        extra={
          <Button type="primary" onClick={() => window.history.back()}>
            返回上一页
          </Button>
        }
      />
    )
  }

  // 检查用户类型
  if (userTypes && userType && !userTypes.includes(userType)) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="抱歉，此功能不适用于您的用户类型。"
        extra={
          <Button type="primary" onClick={() => window.history.back()}>
            返回上一页
          </Button>
        }
      />
    )
  }

  return <>{children}</>
}

export default PermissionRoute