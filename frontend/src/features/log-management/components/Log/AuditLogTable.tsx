/**
 * 审计日志表格组件
 */

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  Table,
  Card,
  Space,
  Button,
  Input,
  Select,
  DatePicker,
  Tag,
  Tooltip,
  message,
  Modal,
  Typography,
} from 'antd';
import {
  SearchOutlined,
  DownloadOutlined,
  ReloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { logService, type AuditLog, type LogQueryParams } from '../../services/log.service';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Text } = Typography;

interface AuditLogTableProps {
  height?: number;
}

export interface AuditLogTableRef {
  refresh: () => void;
}

const AuditLogTable = forwardRef<AuditLogTableRef, AuditLogTableProps>(({ height = 600 }, ref) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filters, setFilters] = useState<LogQueryParams>({});
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  // 加载日志数据
  const loadLogs = async () => {
    setLoading(true);
    try {
      const response = await logService.getAuditLogs({
        page: current,
        pageSize,
        ...filters,
      });
      setLogs(response.data || []);
      setTotal(response.pagination?.total || 0);
    } catch {
      message.error('加载审计日志失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [current, pageSize, filters]);

  // 暴露refresh方法给父组件
  useImperativeHandle(ref, () => ({
    refresh: loadLogs,
  }));

  // 处理搜索
  const handleSearch = (value: string) => {
    setFilters({ ...filters, search: value });
    setCurrent(1);
  };

  // 处理动作筛选
  const handleActionFilter = (action: string) => {
    setFilters({ ...filters, action: action || undefined });
    setCurrent(1);
  };

  // 处理资源筛选
  const handleResourceFilter = (resource: string) => {
    setFilters({ ...filters, resource: resource || undefined });
    setCurrent(1);
  };

  // 处理日期范围筛选
  const handleDateRangeFilter = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      setFilters({
        ...filters,
        startDate: dates[0].format('YYYY-MM-DD'),
        endDate: dates[1].format('YYYY-MM-DD'),
      });
    } else {
      const { startDate, endDate, ...rest } = filters;
      // 移除startDate和endDate
      void startDate;
      void endDate;
      setFilters(rest);
    }
    setCurrent(1);
  };

  // 导出日志
  const handleExport = async () => {
    try {
      const blob = await logService.exportAuditLogs(filters);
      const filename = `audit-logs-${dayjs().format('YYYY-MM-DD-HH-mm-ss')}.csv`;
      logService.downloadFile(blob, filename);
      message.success('导出成功');
    } catch {
      message.error('导出失败');
    }
  };

  // 查看详情
  const handleViewDetail = (log: AuditLog) => {
    setSelectedLog(log);
    setDetailVisible(true);
  };

  // 表格列定义
  const columns: ColumnsType<AuditLog> = [
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm:ss'),
      sorter: true,
    },
    {
      title: '动作',
      dataIndex: 'action',
      key: 'action',
      width: 100,
      render: (action: string) => {
        const { text, color } = logService.formatAuditAction(action);
        return <Tag color={color}>{text}</Tag>;
      },
      filters: [
        { text: '创建', value: 'CREATE' },
        { text: '更新', value: 'UPDATE' },
        { text: '删除', value: 'DELETE' },
        { text: '登录', value: 'LOGIN' },
        { text: '登出', value: 'LOGOUT' },
        { text: '查看', value: 'VIEW' },
      ],
    },
    {
      title: '资源',
      dataIndex: 'resource',
      key: 'resource',
      width: 100,
      render: (resource: string) => logService.formatResourceName(resource),
    },
    {
      title: '资源ID',
      dataIndex: 'resourceId',
      key: 'resourceId',
      width: 120,
      render: (resourceId: string) => resourceId || '-',
    },
    {
      title: '状态',
      dataIndex: 'success',
      key: 'success',
      width: 80,
      render: (success: boolean) => (
        success ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            成功
          </Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="error">
            失败
          </Tag>
        )
      ),
      filters: [
        { text: '成功', value: true },
        { text: '失败', value: false },
      ],
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
      width: 120,
      render: (ip: string) => ip || '-',
    },
    {
      title: '错误信息',
      dataIndex: 'errorMsg',
      key: 'errorMsg',
      ellipsis: {
        showTitle: false,
      },
      render: (errorMsg: string) => (
        errorMsg ? (
          <Tooltip title={errorMsg}>
            <Text type="danger" style={{ maxWidth: 200 }}>{errorMsg}</Text>
          </Tooltip>
        ) : '-'
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          详情
        </Button>
      ),
    },
  ];

  return (
    <Card>
      {/* 筛选工具栏 */}
      <Space style={{ marginBottom: 16 }} wrap>
        <Input.Search
          placeholder="搜索审计日志"
          allowClear
          style={{ width: 250 }}
          onSearch={handleSearch}
          enterButton={<SearchOutlined />}
        />
        <Select
          placeholder="选择动作"
          allowClear
          style={{ width: 120 }}
          onChange={handleActionFilter}
        >
          <Option value="CREATE">创建</Option>
          <Option value="UPDATE">更新</Option>
          <Option value="DELETE">删除</Option>
          <Option value="LOGIN">登录</Option>
          <Option value="LOGOUT">登出</Option>
          <Option value="VIEW">查看</Option>
        </Select>
        <Select
          placeholder="选择资源"
          allowClear
          style={{ width: 120 }}
          onChange={handleResourceFilter}
        >
          <Option value="user">用户</Option>
          <Option value="role">角色</Option>
          <Option value="permission">权限</Option>
          <Option value="settings">设置</Option>
          <Option value="auth">认证</Option>
          <Option value="upload">文件上传</Option>
        </Select>
        <RangePicker
          placeholder={['开始日期', '结束日期']}
          onChange={handleDateRangeFilter}
        />
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleExport}
        >
          导出
        </Button>
        <Button
          icon={<ReloadOutlined />}
          onClick={loadLogs}
        >
          刷新
        </Button>
      </Space>

      {/* 日志表格 */}
      <Table
        columns={columns}
        dataSource={logs}
        rowKey="id"
        loading={loading}
        scroll={{ y: height - 200 }}
        pagination={{
          current,
          pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          onChange: (page, size) => {
            setCurrent(page);
            setPageSize(size);
          },
        }}
      />

      {/* 详情弹窗 */}
      <Modal
        title="审计日志详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={800}
      >
        {selectedLog && (
          <div>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <Text strong>时间：</Text>
                <Text>{dayjs(selectedLog.createdAt).format('YYYY-MM-DD HH:mm:ss')}</Text>
              </div>
              <div>
                <Text strong>动作：</Text>
                <Tag color={logService.formatAuditAction(selectedLog.action).color}>
                  {logService.formatAuditAction(selectedLog.action).text}
                </Tag>
              </div>
              <div>
                <Text strong>资源：</Text>
                <Text>{logService.formatResourceName(selectedLog.resource)}</Text>
              </div>
              <div>
                <Text strong>资源ID：</Text>
                <Text>{selectedLog.resourceId || '-'}</Text>
              </div>
              <div>
                <Text strong>状态：</Text>
                {selectedLog.success ? (
                  <Tag icon={<CheckCircleOutlined />} color="success">
                    成功
                  </Tag>
                ) : (
                  <Tag icon={<CloseCircleOutlined />} color="error">
                    失败
                  </Tag>
                )}
              </div>
              <div>
                <Text strong>IP地址：</Text>
                <Text>{selectedLog.ip || '-'}</Text>
              </div>
              <div>
                <Text strong>用户代理：</Text>
                <Text style={{ wordBreak: 'break-all' }}>
                  {selectedLog.userAgent || '-'}
                </Text>
              </div>
              {selectedLog.errorMsg && (
                <div>
                  <Text strong>错误信息：</Text>
                  <Text type="danger">{selectedLog.errorMsg}</Text>
                </div>
              )}
              {selectedLog.oldValues && (
                <div>
                  <Text strong>原始值：</Text>
                  <pre style={{ 
                    background: '#f5f5f5', 
                    padding: 12, 
                    borderRadius: 4,
                    maxHeight: 200,
                    overflow: 'auto'
                  }}>
                    {JSON.stringify(selectedLog.oldValues, null, 2)}
                  </pre>
                </div>
              )}
              {selectedLog.newValues && (
                <div>
                  <Text strong>新值：</Text>
                  <pre style={{ 
                    background: '#f5f5f5', 
                    padding: 12, 
                    borderRadius: 4,
                    maxHeight: 200,
                    overflow: 'auto'
                  }}>
                    {JSON.stringify(selectedLog.newValues, null, 2)}
                  </pre>
                </div>
              )}
            </Space>
          </div>
        )}
      </Modal>
    </Card>
  );
});

AuditLogTable.displayName = 'AuditLogTable';

export default AuditLogTable;