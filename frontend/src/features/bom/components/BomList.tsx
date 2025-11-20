import React, { useRef } from 'react';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { normalizeTableParams } from '@/shared/utils/normalizeTableParams';
import type { ProductBom } from '@zyerp/shared';
import { BomService } from '../services/bom.service';
import { Button, Space, Tag, Modal, Descriptions, Table, Spin, Tabs } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { BomItem, RoutingWorkcenterInfo, User } from '@zyerp/shared';
import routingService from '@/features/routing/services/routing.service';
import { useMessage, useModal } from '@/shared/hooks';
import userService from '@/features/user-management/services/user.service';
import dayjs from 'dayjs';

type ProductBomDetail = ProductBom & { baseUnitName?: string; routingName?: string; createdBy?: string; updatedBy?: string };

interface BomListProps {
  onCreate?: () => void;
  onEdit?: (record: ProductBom) => void;
  actionRef?: React.MutableRefObject<ActionType | undefined | null>;
}

const BomList: React.FC<BomListProps> = ({ onCreate, onEdit, actionRef: externalRef }) => {
  const innerRef = useRef<ActionType>(null);
  const actionRef = externalRef ?? innerRef;
  const message = useMessage();
  const modal = useModal();
  const [detailVisible, setDetailVisible] = React.useState(false);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [detail, setDetail] = React.useState<ProductBomDetail | null>(null);
  const [detailItems, setDetailItems] = React.useState<BomItem[]>([]);
  const [ops, setOps] = React.useState<RoutingWorkcenterInfo[]>([]);
  const [creatorName, setCreatorName] = React.useState<string>('');
  const [updaterName, setUpdaterName] = React.useState<string>('');

  const statusTextMap: Record<NonNullable<ProductBom['status']>, string> = {
    draft: '草稿',
    active: '启用',
    inactive: '停用',
    archived: '归档',
  };

  const requirementTypeTextMap: Record<NonNullable<BomItem['requirementType']>, string> = {
    fixed: '固定',
    variable: '可变',
    optional: '可选',
  };

  const timeModeTextMap: Partial<Record<NonNullable<RoutingWorkcenterInfo['timeMode']>, string>> = {
    manual: '手动',
    auto: '自动',
    fixed: '固定',
    variable: '可变',
    cycle: '周期',
  };

  const handleView = async (record: ProductBom) => {
    setDetailVisible(true);
    setDetailLoading(true);
    try {
      const info = await BomService.getById(record.id);
      if (info.success) setDetail(info.data as ProductBomDetail);
      const itemsResp = await BomService.getItems(record.id);
      const list = Array.isArray(itemsResp.data) ? itemsResp.data : [];
      setDetailItems(list);
      const bomDetail: ProductBomDetail | undefined = info.data as ProductBomDetail | undefined;
      const createdBy = bomDetail?.createdBy;
      const updatedBy = bomDetail?.updatedBy;
      if (createdBy) {
        try {
          const u: User = await userService.getUserById(createdBy);
          setCreatorName(u.username || u.email || createdBy);
        } catch {
          setCreatorName(createdBy);
        }
      } else {
        setCreatorName('');
      }
      if (updatedBy) {
        try {
          const u2: User = await userService.getUserById(updatedBy);
          setUpdaterName(u2.username || u2.email || updatedBy);
        } catch {
          setUpdaterName(updatedBy);
        }
      } else {
        setUpdaterName('');
      }
      const rid = (info.data as ProductBom | undefined)?.routingId as string | undefined;
      if (rid) {
        try {
          const rops = await routingService.getOperations(rid);
          setOps(rops.data || []);
        } catch {
          setOps([]);
        }
      } else {
        setOps([]);
      }
    } catch {
      message.error('加载BOM详情失败');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = (record: ProductBom) => {
    modal.confirm({
      title: '确认删除',
      content: `确定删除 ${record.code} - ${record.name} 吗？`,
      onOk: async () => {
        const res = await BomService.delete(record.id);
        if (res.success) {
          message.success('删除成功');
          actionRef.current?.reload();
        } else {
          message.error(res.message || '删除失败');
        }
      }
    });
  };

  const columns: ProColumns<ProductBom>[] = [
    { title: '编码', dataIndex: 'code', key: 'code', width: 300 },
    { title: 'BOM名称', dataIndex: 'name', key: 'name' ,width: 300},
    { title: '产品名称', dataIndex: 'productName', key: 'productName', render: (_, r) => r.productName || '-' , width: 300},
    { title: '变体', dataIndex: 'variantId', key: 'variantId', render: (_, r) => r.variantId ? <Tag color="blue">变体级</Tag> : <Tag>产品级</Tag> ,width: 100},
    { title: '版本', dataIndex: 'version', key: 'version' ,width: 100},
    { title: '子BOM个数', dataIndex: 'childBomCount', key: 'childBomCount', width: 120, render: (_, r) => r.childBomCount ?? 0 },
    { title: '默认', dataIndex: 'isDefault', key: 'isDefault', render: (_, r) => r.isDefault ? <Tag color="green">默认</Tag> : '-' ,width: 100},  
    { 
      title: '状态', dataIndex: 'status', key: 'status', valueType: 'select', width: 100,
      valueEnum: {
        draft: { text: '草稿', status: 'Default' },
        active: { text: '启用', status: 'Success' },
        inactive: { text: '停用', status: 'Default' },
        archived: { text: '归档', status: 'Processing' },
      }
    },
    {
      title:'创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 200, 
      render: (_, r) => r.createdAt ? dayjs(r.createdAt).format('YYYY-MM-DD HH:mm') : '-'
    },
    {
      title:'更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 200, 
      render: (_, r) => r.updatedAt ? dayjs(r.updatedAt).format('YYYY-MM-DD HH:mm') : '-'
    },
    {
      title: '操作', valueType: 'option', key: 'option', width: 100,
      render: (_: unknown, record: ProductBom) => (
        <Space>
          <Button type="link" onClick={() => handleView(record)}>详情</Button>
          <Button type="link" onClick={() => onEdit?.(record)}>编辑</Button>
          <Button type="link" danger onClick={() => handleDelete(record)}>删除</Button>
        </Space>
      )
      
    }
  ];

  return (
    <>
    <ProTable<ProductBom>
      columns={columns}
      actionRef={actionRef}
      request={async (params) => {
        const raw = params as Record<string, unknown>
        const base = normalizeTableParams(raw)
        const keyword = typeof raw.keyword === 'string' ? raw.keyword : undefined
        const res = await BomService.getList({ page: base.page, pageSize: base.pageSize, keyword })
        return { data: res.data, success: res.success, total: res.total }
      }}
      rowKey="id"
      search={{ labelWidth: 'auto' }}
      headerTitle="BOM 列表"
      toolBarRender={() => [
        <Button key="create" type="primary" onClick={onCreate}>新建BOM</Button>
      ]}
      options={{ setting: { listsHeight: 420 } }}
    />
    <Modal
      key="bom-detail-modal"
      open={detailVisible}
      onCancel={() => setDetailVisible(false)}
      footer={null}
      width={900}
      title="BOM 详情"
      destroyOnHidden
    >
      <Tabs
        items={[
          {
            key: 'basic',
            label: '基础信息',
            children: (
              <Spin spinning={detailLoading}>
                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label="编码">{detail?.code || '-'}</Descriptions.Item>
                  <Descriptions.Item label="名称">{detail?.name || '-'}</Descriptions.Item>
                  <Descriptions.Item label="产品">{detail?.productName || '-'}</Descriptions.Item>
                  <Descriptions.Item label="版本">{detail?.version || '-'}</Descriptions.Item>
                  <Descriptions.Item label="类型">{detail?.type || '-'}</Descriptions.Item>
                  <Descriptions.Item label="默认">{detail?.isDefault ? '是' : '否'}</Descriptions.Item>
                  <Descriptions.Item label="基准数量">{detail?.baseQuantity ?? '-'}</Descriptions.Item>
                  <Descriptions.Item label="基准单位">{detail?.baseUnitName || '-'}</Descriptions.Item>
                  <Descriptions.Item label="工艺路线">{detail?.routingName || '-'}</Descriptions.Item>
                  <Descriptions.Item label="生效日期">{detail?.effectiveDate ? dayjs(detail.effectiveDate).format('YYYY-MM-DD HH:mm') : '-'}</Descriptions.Item>
                  <Descriptions.Item label="失效日期">{detail?.expiryDate ? dayjs(detail.expiryDate).format('YYYY-MM-DD HH:mm') : '-'}</Descriptions.Item>
                  <Descriptions.Item label="状态">{detail?.status ? (statusTextMap[detail.status] || detail.status) : '-'}</Descriptions.Item>
                  <Descriptions.Item label="创建人">{creatorName || detail?.createdBy || '-'}</Descriptions.Item>
                  <Descriptions.Item label="更新人">{updaterName || detail?.updatedBy || '-'}</Descriptions.Item>
                  <Descriptions.Item label="描述" span={2}>{detail?.description || '-'}</Descriptions.Item>
                </Descriptions>
              </Spin>
            )
          },
          {
            key: 'items',
            label: '物料清单',
            children: (
              <Table<BomItem>
                size="small"
                bordered
                rowKey="id"
                dataSource={detailItems}
                pagination={false}
                columns={[
                  { title: '物料编码', dataIndex: 'materialCode', width: 140 },
                  { title: '物料名称', dataIndex: 'materialName' },
                  { title: '用量', dataIndex: 'quantity', width: 100 },
                  { title: '单位', dataIndex: 'unitName', width: 100 },
                  { title: '需求类型', dataIndex: 'requirementType', width: 120, render: (v: BomItem['requirementType']) => v ? (requirementTypeTextMap[v] || v) : '-' },
                  { title: '关键料', dataIndex: 'isKey', width: 100, render: (v: boolean) => (v ? '是' : '否') },
                ] as ColumnsType<BomItem>}
              />
            )
          },
          {
            key: 'routing',
            label: '工艺路线',
            children: (
              <Table<RoutingWorkcenterInfo>
                size="small"
                bordered
                rowKey="id"
                dataSource={ops}
                pagination={false}
                columns={[
                  { title: '工序序号', dataIndex: 'sequence', width: 100 },
                  { title: '工序名称', dataIndex: 'name' },
                  { title: '时间模式', dataIndex: 'timeMode', width: 120, render: (v: RoutingWorkcenterInfo['timeMode']) => v ? (timeModeTextMap[v] || v) : '-' },
                  { title: '周期(分)', dataIndex: 'timeCycleManual', width: 120 },
                ] as ColumnsType<RoutingWorkcenterInfo>}
              />
            )
          }
        ]}
      />
    </Modal>
    </>
  )
}

export default BomList;
