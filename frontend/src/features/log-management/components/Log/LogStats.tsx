/**
 * 日志统计组件
 */

import { useState, useEffect, type FC } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Button,
  message,
  Modal,
  Space,
  Typography,
} from 'antd';
import {
  FileTextOutlined,
  AuditOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { logService, type LogStats as LogStatsType } from '../../services/log.service';

const { Text } = Typography;

interface LogStatsProps {
  onRefresh?: () => void;
}

const LogStats: FC<LogStatsProps> = ({ onRefresh }) => {
  const [stats, setStats] = useState<LogStatsType | null>(null);
  const [loading, setLoading] = useState(false);
  const [cleanupLoading, setCleanupLoading] = useState(false);

  // 加载统计数据
  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await logService.getLogStats();
      setStats(data);
    } catch {
      message.error('加载日志统计失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // 刷新统计
  const handleRefresh = () => {
    loadStats();
    onRefresh?.();
  };

  // 清理过期日志
  const handleCleanup = () => {
    Modal.confirm({
      title: '确认清理过期日志',
      content: '此操作将删除30天前的日志记录，是否继续？',
      icon: <ExclamationCircleOutlined />,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        setCleanupLoading(true);
        try {
          await logService.cleanupLogs(30);
          message.success('清理完成');
          loadStats();
          onRefresh?.();
        } catch {
          message.error('清理失败');
        } finally {
          setCleanupLoading(false);
        }
      },
    });
  };

  // 计算级别分布百分比
  const getLevelPercentage = (count: number, total: number) => {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  if (!stats) {
    return (
      <Card loading={loading}>
        <div style={{ height: 200 }} />
      </Card>
    );
  }

  const totalLogs = stats.totalSystemLogs + stats.totalAuditLogs;
  const totalTodayLogs = stats.todaySystemLogs + stats.todayAuditLogs;

  return (
    <div>
      {/* 操作按钮 */}
      <Space style={{ marginBottom: 16 }}>
        <Button
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          loading={loading}
        >
          刷新统计
        </Button>
        <Button
          icon={<DeleteOutlined />}
          onClick={handleCleanup}
          loading={cleanupLoading}
          danger
        >
          清理过期日志
        </Button>
      </Space>

      {/* 总体统计 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总日志数"
              value={totalLogs}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="系统日志"
              value={stats.totalSystemLogs}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="审计日志"
              value={stats.totalAuditLogs}
              prefix={<AuditOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="今日错误"
              value={stats.errorLogsToday}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 今日统计 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} md={8}>
          <Card title="今日日志">
            <Statistic
              title="总计"
              value={totalTodayLogs}
              suffix="条"
            />
            <div style={{ marginTop: 16 }}>
              <Text>系统日志: {stats.todaySystemLogs}</Text>
              <br />
              <Text>审计日志: {stats.todayAuditLogs}</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card title="日志级别分布">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text>信息 ({stats.levelDistribution.info})</Text>
                <Progress
                  percent={getLevelPercentage(
                    stats.levelDistribution.info,
                    stats.totalSystemLogs
                  )}
                  strokeColor="#1890ff"
                  size="small"
                />
              </div>
              <div>
                <Text>警告 ({stats.levelDistribution.warn})</Text>
                <Progress
                  percent={getLevelPercentage(
                    stats.levelDistribution.warn,
                    stats.totalSystemLogs
                  )}
                  strokeColor="#faad14"
                  size="small"
                />
              </div>
              <div>
                <Text>错误 ({stats.levelDistribution.error})</Text>
                <Progress
                  percent={getLevelPercentage(
                    stats.levelDistribution.error,
                    stats.totalSystemLogs
                  )}
                  strokeColor="#ff4d4f"
                  size="small"
                />
              </div>
              <div>
                <Text>调试 ({stats.levelDistribution.debug})</Text>
                <Progress
                  percent={getLevelPercentage(
                    stats.levelDistribution.debug,
                    stats.totalSystemLogs
                  )}
                  strokeColor="#722ed1"
                  size="small"
                />
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={24} md={8}>
          <Card title="操作分布">
            <Space direction="vertical" style={{ width: '100%' }}>
              {Object.entries(stats.actionDistribution)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([action, count]) => (
                  <div key={action}>
                    <Text>{action} ({count})</Text>
                    <Progress
                      percent={getLevelPercentage(count, stats.totalAuditLogs)}
                      strokeColor="#52c41a"
                      size="small"
                    />
                  </div>
                ))}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LogStats;