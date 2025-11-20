import React from 'react';
import {
  Table,
  Card,
  Row,
  Col,
  Tag
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ProductBom, BomItem, BomStatus } from '@zyerp/shared';

interface BomDetailProps {
  bom: ProductBom;
  items: BomItem[];
}

const BomDetail: React.FC<BomDetailProps> = ({ bom, items }) => {
  // 金额类型兼容（number、string、具备 toNumber 的对象、null/undefined）
  type MoneyLike = number | string | { toNumber: () => number } | null | undefined;
  // 类型守卫：判断对象是否具备 toNumber 方法
  const hasToNumber = (v: unknown): v is { toNumber: () => number } => {
    if (typeof v !== 'object' || v === null) return false;
    const obj = v as { toNumber?: unknown };
    return 'toNumber' in obj && typeof obj.toNumber === 'function';
  };
  // 金额格式化，兼容 number、string、Decimal 等类型
  const formatMoney = (value: MoneyLike) => {
    if (value === null || value === undefined) return '-';
    let num: number;
    if (typeof value === 'number') {
      num = value;
    } else if (hasToNumber(value)) {
      try {
        num = value.toNumber();
      } catch {
        return '-';
      }
    } else if (typeof value === 'string') {
      num = Number(value);
    } else {
      return '-';
    }
    if (!Number.isFinite(num)) return '-';
    return `¥${num.toFixed(2)}`;
  };

  // 需求类型映射定义
 

  // BOM状态标签映射定义
  const STATUS_MAP: Record<BomStatus, { color: string; text: string }> = {
    draft: { color: 'orange', text: '草稿' },
    active: { color: 'green', text: '启用' },
    inactive: { color: 'red', text: '停用' },
    archived: { color: 'default', text: '归档' }
  };
  // BOM物料项列定义
  const itemColumns: ColumnsType<BomItem> = [
    {
      title: '层级',
      dataIndex: 'level',
      key: 'level',
      width: 60,
      render: (level: number | undefined) => {
        const safeLevel = typeof level === 'number' && Number.isFinite(level) ? level : 1;
        return `L${safeLevel}`;
      }
    },
    {
      title: '物料编码',
      dataIndex: 'materialCode',
      key: 'materialCode',
      width: 120
    },
    {
      title: '物料名称',
      dataIndex: 'materialName',
      key: 'materialName',
      width: 200
    },
    {
      title: '规格',
      dataIndex: 'materialSpec',
      key: 'materialSpec',
      width: 120
    },
    {
      title: '用量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      render: (quantity: number, record) => `${quantity} ${record.unitName}`
    },
    {
      title: '关键物料',
      dataIndex: 'isKey',
      key: 'isKey',
      width: 80,
      render: (isKey: boolean) => (
        <Tag color={isKey ? 'red' : 'default'}>
          {isKey ? '是' : '否'}
        </Tag>
      )
    },
    {
      title: '单位成本',
      dataIndex: 'unitCost',
      key: 'unitCost',
      width: 100,
      render: (cost?: number) => formatMoney(cost)
    },
    {
      title: '总成本',
      dataIndex: 'totalCost',
      key: 'totalCost',
      width: 100,
      render: (cost?: number) => formatMoney(cost)
    }
  ];

  return (
    <div>
      {/* BOM基本信息 */}
      <Card title="基本信息" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <div><strong>BOM编码:</strong> {bom.code}</div>
          </Col>
          <Col span={6}>
            <div><strong>版本:</strong> {bom.version}</div>
          </Col>
          <Col span={6}>
            <div>
              <strong>状态:</strong>{' '}
              <Tag color={STATUS_MAP[bom.status].color}>{STATUS_MAP[bom.status].text}</Tag>
            </div>
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={6}>
            <div><strong>产品编码:</strong> {bom.productCode}</div>
          </Col>
          <Col span={6}>
            <div><strong>产品名称:</strong> {bom.productName}</div>
          </Col>
          <Col span={6}>
            <div><strong>基础数量:</strong> {bom.baseQuantity} {bom.baseUnitName}</div>
          </Col>
          <Col span={6}>
            <div><strong>是否默认:</strong> {bom.isDefault ? '是' : '否'}</div>
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={6}>
            <div><strong>生效日期:</strong> {bom.effectiveDate ? new Date(bom.effectiveDate).toLocaleDateString() : '-'}</div>
          </Col>
          <Col span={6}>
            <div><strong>失效日期:</strong> {bom.expiryDate ? new Date(bom.expiryDate).toLocaleDateString() : '无'}</div>
          </Col>
        </Row>
        {bom.description && (
          <Row style={{ marginTop: 16 }}>
            <Col span={24}>
              <div><strong>描述:</strong> {bom.description}</div>
            </Col>
          </Row>
        )}
      </Card>

      {/* 物料结构 */}
      <Card title="物料结构">
        <Table
          columns={itemColumns}
          dataSource={items}
          rowKey="id"
          pagination={false}
          size="small"
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default BomDetail;