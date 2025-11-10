/**
 * 日志管理页面（features 模块内）
 */

import { useState, useRef } from 'react';
import { Card, Tabs, Space } from 'antd';
import { FileTextOutlined, AuditOutlined, BarChartOutlined } from '@ant-design/icons';
import SystemLogTable, { type SystemLogTableRef } from '../components/Log/SystemLogTable';
import AuditLogTable, { type AuditLogTableRef } from '../components/Log/AuditLogTable';
import LogStats from '../components/Log/LogStats';

const LogManagement = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const systemLogRef = useRef<SystemLogTableRef>(null);
  const auditLogRef = useRef<AuditLogTableRef>(null);

  // 刷新所有日志表格
  const handleRefreshAll = () => {
    systemLogRef.current?.refresh();
    auditLogRef.current?.refresh();
  };

  const tabItems = [
    {
      key: 'stats',
      label: (
        <Space>
          <BarChartOutlined />
          统计概览
        </Space>
      ),
      children: <LogStats onRefresh={handleRefreshAll} />,
    },
    {
      key: 'system',
      label: (
        <Space>
          <FileTextOutlined />
          系统日志
        </Space>
      ),
      children: <SystemLogTable ref={systemLogRef} />,
    },
    {
      key: 'audit',
      label: (
        <Space>
          <AuditOutlined />
          审计日志
        </Space>
      ),
      children: <AuditLogTable ref={auditLogRef} />,
    },
  ];

  return (
    <div style={{ padding: 0 }}>
     
      
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
        />
      </Card>
    </div>
  );
};

export default LogManagement;