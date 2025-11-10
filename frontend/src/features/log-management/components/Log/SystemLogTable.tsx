/**
 * 系统日志表格组件
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
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { logService, type SystemLog, type LogQueryParams } from '../../services/log.service';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Text } = Typography;

interface SystemLogTableProps {
  height?: number;
}

export interface SystemLogTableRef {
  refresh: () => void;
}

const SystemLogTable = forwardRef<SystemLogTableRef, SystemLogTableProps>(({ height = 600 }, ref) => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filters, setFilters] = useState<LogQueryParams>({});
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  // 加载日志数据
  const loadLogs = async () => {
    setLoading(true);
    try {
      const response = await logService.getSystemLogs({
        page: current,
        pageSize,
        ...filters,
      });
      setLogs(response.data || []);
      setTotal(response.pagination?.total || 0);
    } catch {
      message.error('加载系统日志失败');
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

  // 处理级别筛选
  const handleLevelFilter = (level: string) => {
    setFilters({ ...filters, level: level || undefined });
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
      const blob = await logService.exportSystemLogs(filters);
      const filename = `system-logs-${dayjs().format('YYYY-MM-DD-HH-mm-ss')}.csv`;
      logService.downloadFile(blob, filename);
      message.success('导出成功');
    } catch {
      message.error('导出失败');
    }
  };

  // 查看详情
  const handleViewDetail = (log: SystemLog) => {
    setSelectedLog(log);
    setDetailVisible(true);
  };

  // 表格列定义
  const columns: ColumnsType<SystemLog> = [
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm:ss'),
      sorter: true,
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      render: (level: string) => {
        const { text, color } = logService.formatLogLevel(level);
        return <Tag color={color}>{text}</Tag>;
      },
      filters: [
        { text: '信息', value: 'info' },
        { text: '警告', value: 'warn' },
        { text: '错误', value: 'error' },
        { text: '调试', value: 'debug' },
      ],
    },
    {
      title: '模块',
      dataIndex: 'module',
      key: 'module',
      width: 100,
      render: (module: string) => module || '-',
    },
    {
      title: '动作',
      dataIndex: 'action',
      key: 'action',
      width: 120,
      render: (action: string) => action || '-',
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message',
      ellipsis: {
        showTitle: false,
      },
      render: (message: string) => (
        <Tooltip title={message}>
          <Text style={{ maxWidth: 300 }}>{message}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
      width: 120,
      render: (ip: string) => ip || '-',
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
          placeholder="搜索日志消息"
          allowClear
          style={{ width: 250 }}
          onSearch={handleSearch}
          enterButton={<SearchOutlined />}
        />
        <Select
          placeholder="选择级别"
          allowClear
          style={{ width: 120 }}
          onChange={handleLevelFilter}
        >
          <Option value="info">信息</Option>
          <Option value="warn">警告</Option>
          <Option value="error">错误</Option>
          <Option value="debug">调试</Option>
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
        title="日志详情"
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
                <Text strong>级别：</Text>
                <Tag color={logService.formatLogLevel(selectedLog.level).color}>
                  {logService.formatLogLevel(selectedLog.level).text}
                </Tag>
              </div>
              <div>
                <Text strong>模块：</Text>
                <Text>{selectedLog.module || '-'}</Text>
              </div>
              <div>
                <Text strong>动作：</Text>
                <Text>{selectedLog.action || '-'}</Text>
              </div>
              <div>
                <Text strong>消息：</Text>
                <Text>{selectedLog.message}</Text>
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
              {selectedLog.details && (
                <div>
                  <Text strong>详细信息：</Text>
                  <pre style={{ 
                    background: '#f5f5f5', 
                    padding: 12, 
                    borderRadius: 4,
                    maxHeight: 300,
                    overflow: 'auto'
                  }}>
                    {JSON.stringify(selectedLog.details, null, 2)}
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

SystemLogTable.displayName = 'SystemLogTable';

export default SystemLogTable;