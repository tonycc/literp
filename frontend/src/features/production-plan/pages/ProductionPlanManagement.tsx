import React, { useEffect, useMemo, useState } from 'react';
import { ProCard, ProTable, ProForm, ProFormSwitch, ProFormSelect, ProDescriptions } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { Tabs, Drawer, Button, Alert } from 'antd';
import { useMessage } from '@/shared/hooks';
import { useModal } from '@/shared/hooks';
import { salesOrderService } from '@/features/sales-order/services/sales-order.service';
import { useProductionPlan } from '../hooks/useProductionPlan';
import type { MaterialRequirement, ProductionPlanProductPlan } from '@zyerp/shared';
import type { RoutingWorkcenterInfo } from '@zyerp/shared';
import type { SalesOrder } from '@/features/sales-order';

export const ProductionPlanManagement: React.FC = () => {
  const message = useMessage();
  const modal = useModal();
  const { previewResult, selectedItems, loading, handleRefresh } = useProductionPlan();
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>(undefined);
  const [includeRouting, setIncludeRouting] = useState<boolean>(true);
  const [orderInfo, setOrderInfo] = useState<SalesOrder | null>(null);
  const [routingVisible, setRoutingVisible] = useState(false);
  const [currentProductPlan, setCurrentProductPlan] = useState<ProductionPlanProductPlan | null>(null);
  const [purchaseOnly, setPurchaseOnly] = useState(false);
  const [outsourceOnly, setOutsourceOnly] = useState(false);

  // 右侧产品计划列定义
  const productPlanColumns: ProColumns<ProductionPlanProductPlan>[] = useMemo(() => ([
    { title: '产品编码', dataIndex: 'productCode', ellipsis: true },
    { title: '产品名称', dataIndex: 'productName', ellipsis: true },
    { title: '数量', dataIndex: 'quantity', valueType: 'digit', width: 100 },
    { title: '单位', dataIndex: 'unit', width: 80 },
    { title: 'BOM版本', dataIndex: 'bomCode', width: 120 },
    { title: '工艺路线', dataIndex: 'routingCode', width: 120 },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
        <Button key="view-routing" type="link" onClick={() => { setCurrentProductPlan(record); setRoutingVisible(true); }}>
          查看工艺路线
        </Button>,
      ],
    },
  ]), []);

  // 右侧物料需求列定义
  const materialColumns: ProColumns<MaterialRequirement>[] = useMemo(() => ([
    { title: '物料编码', dataIndex: 'materialCode', ellipsis: true },
    { title: '物料名称', dataIndex: 'materialName', ellipsis: true },
    { title: '规格', dataIndex: 'specification', ellipsis: true },
    { title: '单位', dataIndex: 'unit', width: 80 },
    { title: '需求数量', dataIndex: 'requiredQuantity', valueType: 'digit', width: 120 },
    { title: '可用库存', dataIndex: 'availableStock', valueType: 'digit', width: 120 },
    { title: '缺口数量', dataIndex: 'shortageQuantity', valueType: 'digit', width: 120 },
    {
      title: '需采购',
      dataIndex: 'needPurchase',
      valueType: 'text',
      width: 100,
      render: (_, record) => (Number(record.shortageQuantity) > 0 ? '需要' : '不需要'),
    },
    {
      title: '需外协',
      dataIndex: 'needOutsource',
      valueType: 'text',
      width: 100,
      render: (_, record) => (record.needOutsource ? '需要' : '不需要'),
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
        <Button key="po" type="link" disabled={!(Number(record.shortageQuantity) > 0)} onClick={() => {
          modal.confirm({
            title: '创建采购建议',
            content: `为物料 ${record.materialCode} 创建采购建议（缺口：${record.shortageQuantity}）？`,
            onOk: () => message.success('已添加到采购建议清单'),
          });
        }}>采购建议</Button>,
        <Button key="outs" type="link" disabled={!(record.needOutsource && Number(record.shortageQuantity) > 0)} onClick={() => {
          modal.confirm({
            title: '创建外协建议',
            content: `为物料 ${record.materialCode} 创建外协建议（缺口：${record.shortageQuantity}）？`,
            onOk: () => message.success('已添加到外协建议清单'),
          });
        }}>外协建议</Button>,
      ],
    },
  ]), []);

  const filteredMaterials = useMemo(() => {
    let list = selectedItems || [];
    if (purchaseOnly) list = list.filter(it => Number(it.shortageQuantity) > 0);
    if (outsourceOnly) list = list.filter(it => Boolean(it.needOutsource) && Number(it.shortageQuantity) > 0);
    return list;
  }, [selectedItems, purchaseOnly, outsourceOnly]);

  // 根据选中订单生成预览
  useEffect(() => {
    const run = async () => {
      if (!selectedOrderId) return;
      try {
        await handleRefresh({ salesOrderId: selectedOrderId, includeRouting });
      } catch {
        message.error('生成生产计划预览失败');
      }
    };
    run();
  }, [selectedOrderId, includeRouting]);

  useEffect(() => {
    const loadOrderInfo = async () => {
      if (!selectedOrderId) { setOrderInfo(null); return; }
      try {
        const resp = await salesOrderService.getById(selectedOrderId);
        setOrderInfo(resp.data ?? null);
      } catch { message.error('加载销售订单信息失败'); }
    };
    loadOrderInfo();
  }, [selectedOrderId]);

  return (
    <>
      <ProCard title="销售订单信息">
        <ProForm
          layout="horizontal"
          submitter={false}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
        >
          <ProFormSelect
            name="salesOrderId"
            label="销售订单"
            placeholder="请选择销售订单"
            rules={[{ required: true, message: '请选择销售订单' }]}
            request={async () => {
              const resp = await salesOrderService.getSalesOrders({ page: 1, pageSize: 50 });
              return (resp.data || []).map((o) => ({
                label: `${o.id} - ${o.customerName ?? '-'}`,
                value: o.id,
              }));
            }}
            fieldProps={{ onChange: (val: string) => setSelectedOrderId(val) }}
          />
          <ProFormSwitch
            name="includeRouting"
            label="包含工艺路线"
            initialValue={includeRouting}
            fieldProps={{ checked: includeRouting, onChange: setIncludeRouting }}
          />
        </ProForm>
        <div style={{ marginTop: 8 }}>
          <ProDescriptions column={2} bordered size="small" title="订单基础信息">
            <ProDescriptions.Item label="订单ID">{orderInfo?.id ?? '-'}</ProDescriptions.Item>
            <ProDescriptions.Item label="客户">{orderInfo?.customerName ?? '-'}</ProDescriptions.Item>
            <ProDescriptions.Item label="下单日期">{orderInfo?.orderDate ?? '-'}</ProDescriptions.Item>
            <ProDescriptions.Item label="状态">{orderInfo?.status ?? '-'}</ProDescriptions.Item>
          </ProDescriptions>
        </div>
      </ProCard>

      <div style={{ height: 12 }} />

      <ProCard title="生产计划信息">
        <div style={{ display: 'flex', gap: 24, padding: '8px 0', alignItems: 'center' }}>
          <div>订单ID：{selectedOrderId || '-'}</div>
          <div>产品数：{(previewResult?.products || []).length}</div>
          <div>物料需求数：{(previewResult?.materialRequirements || []).length}</div>
          <div>需采购物料数：{(previewResult?.materialRequirements || []).filter(it => Number(it.shortageQuantity) > 0).length}</div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <Button
              type="primary"
              onClick={() => {
                modal.confirm({
                  title: '生成生产订单',
                  content: `将根据计划产品(${(previewResult?.products || []).length}项)生成生产订单草稿，是否继续？`,
                  onOk: () => message.success('已生成生产订单草稿（示例）'),
                });
              }}
            >生成生产订单</Button>
            <Button
              onClick={() => {
                const needCount = (previewResult?.materialRequirements || []).filter(it => Number(it.shortageQuantity) > 0).length;
                modal.confirm({
                  title: '生成采购建议',
                  content: `将为 ${needCount} 个物料生成采购建议，是否继续？`,
                  onOk: () => message.success('已生成采购建议（示例）'),
                });
              }}
            >生成采购建议</Button>
            <Button
              onClick={() => {
                const outsourceCount = (previewResult?.materialRequirements || []).filter(it => Boolean(it.needOutsource) && Number(it.shortageQuantity) > 0).length;
                modal.confirm({
                  title: '生成外协建议',
                  content: `将为需外协的 ${outsourceCount} 个物料生成外协建议，是否继续？`,
                  onOk: () => message.success('已生成外协建议（示例）'),
                });
              }}
            >生成外协建议</Button>
          </div>
        </div>
      </ProCard>

      <div style={{ height: 12 }} />

      <Tabs
        items={[
          {
            key: 'products',
            label: '生产计划明细（产品）',
            children: (
              <ProTable<ProductionPlanProductPlan>
                rowKey={(r) => r.productId}
                headerTitle="产品计划"
                search={false}
                loading={loading}
                columns={productPlanColumns}
                dataSource={previewResult?.products || []}
                pagination={false}
              />
            ),
          },
          {
            key: 'materials',
            label: '需求物料明细',
            children: (
              <>
                {previewResult?.notes && (
                  <Alert
                    style={{ marginBottom: 8 }}
                    type="info"
                    message="预览说明"
                    description={previewResult.notes}
                    showIcon
                  />
                )}
                <div style={{ marginBottom: 8, display: 'flex', gap: 12 }}>
                  <ProForm layout="inline" submitter={false}>
                    <ProFormSwitch name="purchaseOnly" label="仅显示需采购" initialValue={purchaseOnly} fieldProps={{ checked: purchaseOnly, onChange: setPurchaseOnly }} />
                    <ProFormSwitch name="outsourceOnly" label="仅显示需外协" initialValue={outsourceOnly} fieldProps={{ checked: outsourceOnly, onChange: setOutsourceOnly }} />
                  </ProForm>
                </div>
                <ProTable<MaterialRequirement>
                  rowKey={(r) => r.materialId}
                  headerTitle="物料需求"
                  search={false}
                  loading={loading}
                  columns={materialColumns}
                  dataSource={filteredMaterials}
                  locale={{
                    emptyText: previewResult?.notes || '暂无物料需求，请为相关产品设置默认BOM并添加物料项',
                  }}
                  pagination={{
                    showSizeChanger: true,
                    showQuickJumper: true,
                  }}
                />
              </>
            ),
          },
        ]}
      />
      <Drawer
        title={currentProductPlan ? `工艺路线：${currentProductPlan.routingCode || '-'}` : '工艺路线'}
        open={routingVisible}
        onClose={() => setRoutingVisible(false)}
        width={720}
      >
        <ProTable<RoutingWorkcenterInfo>
          rowKey={(r) => r.id}
          search={false}
          pagination={false}
          toolBarRender={false}
          dataSource={currentProductPlan?.operations || []}
          columns={[
            { title: '序号', dataIndex: 'sequence', valueType: 'digit', width: 80 },
            { title: '工序名称', dataIndex: 'name', ellipsis: true },
            { title: '时间模式', dataIndex: 'timeMode', width: 120 },
            { title: '周期(手动)', dataIndex: 'timeCycleManual', valueType: 'digit', width: 120 },
            { title: '批次', dataIndex: 'batch', width: 80, render: (_, r) => (r.batch ? '是' : '否') },
            { title: '批次容量', dataIndex: 'batchSize', valueType: 'digit', width: 100 },
            { title: '工资率', dataIndex: 'wageRate', valueType: 'digit', width: 100 },
          ]}
        />
      </Drawer>
    </>
  );
};

export default ProductionPlanManagement;