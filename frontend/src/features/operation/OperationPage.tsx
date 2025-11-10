/**
 * Operation 页面组件
 * Operation Page Component
 */

import React, { useEffect } from 'react'
import { useOperation } from '@/hooks/useOperation'

export const OperationPage: React.FC = () => {
  const { operations, loading, error, fetchOperations } = useOperation()

  useEffect(() => {
    fetchOperations()
  }, [fetchOperations])

  if (loading && operations.length === 0) {
    return <div data-testid="loading">加载中...</div>
  }

  if (error) {
    return <div data-testid="error">加载失败: {error}</div>
  }

  return (
    <div>
      <h1>操作管理</h1>
      {operations.map((operation) => (
        <div key={operation.id} data-testid={`operation-${operation.id}`}>
          <h3>{operation.name}</h3>
          <p>类型: {operation.type}</p>
          <p>代码: {operation.code}</p>
          {operation.description && <p>{operation.description}</p>}
        </div>
      ))}
    </div>
  )
}
