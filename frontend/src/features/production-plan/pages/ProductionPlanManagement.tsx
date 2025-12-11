import React, { useEffect, useMemo, useState } from 'react';
import {ProTable, ProForm, ProFormSwitch, ProFormSelect, ProFormText, ProFormDatePicker } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { Tabs, Drawer, Button, Alert, Tree, Row, Col, Card } from 'antd';
import { useMessage } from '@/shared/hooks';
import { useModal } from '@/shared/hooks';
import { salesOrderService } from '@/features/sales-order/services/sales-order.service';
import { useProductionPlan } from '../hooks/useProductionPlan';
import { BomService } from '@/features/bom/services/bom.service';
import type { ProductionPlanProductPlan } from '@zyerp/shared';
import type { RoutingWorkcenterInfo } from '@zyerp/shared';
import type { SalesOrder } from '@zyerp/shared';
import type { SalesOrderItem, BomTreeNode, MaterialRequirement } from '@zyerp/shared';
import { MaterialRequirementList } from '../components/MaterialRequirementList';
import { warehouseService } from '@/shared/services/warehouse.service';
import { getUsers } from '@/shared/services';
import dayjs from 'dayjs';
import { productionPlanService } from '../services/production-plan.service';

interface ProductionPlanFormValues {
  salesOrderId?: string;
  includeRouting?: boolean;
  includeChildProducts?: boolean;
  expandMaterialsRecursively?: boolean;
  warehouseId?: string;
  selectedItemIds?: string;
  name?: string;
  plannedStart?: string;
  plannedFinish?: string;
  finishedWarehouseId?: string;
  issueWarehouseId?: string;
  ownerId?: string;
}

export const ProductionPlanManagement: React.FC = () => {
  const message = useMessage();
  const modal = useModal();
  const { previewResult, selectedItems, loading, handleRefresh } = useProductionPlan();
  const [form] = ProForm.useForm<ProductionPlanFormValues>();
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>(undefined);
  const [includeRouting, setIncludeRouting] = useState<boolean>(true);
  const [includeChildProducts, setIncludeChildProducts] = useState<boolean>(true);
  const [expandMaterialsRecursively, setExpandMaterialsRecursively] = useState<boolean>(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | undefined>(undefined);
  const [,setSelectedWarehouseName] = useState<string | undefined>(undefined);
  const [orderInfo, setOrderInfo] = useState<SalesOrder | null>(null);
  const [routingVisible, setRoutingVisible] = useState(false);
  const [currentProductPlan, setCurrentProductPlan] = useState<ProductionPlanProductPlan | null>(null);
  const [purchaseOnly, setPurchaseOnly] = useState(false);
  const [outsourceOnly, setOutsourceOnly] = useState(false);
  const [orderItems, setOrderItems] = useState<SalesOrderItem[]>([]);
  const [selectedItemRowKeys, setSelectedItemRowKeys] = useState<React.Key[]>([]);
  const [bomTreeVisible, setBomTreeVisible] = useState(false);
  const [bomTree, setBomTree] = useState<BomTreeNode | null>(null);

  // 右侧产品计划列定义
  const productPlanColumns: ProColumns<ProductionPlanProductPlan>[] = useMemo(() => ([
    { title: '产品编码', dataIndex: 'productCode', ellipsis: true },
    { title: '产品名称', dataIndex: 'productName', ellipsis: true, render: (_, r) => (<span style={{ marginLeft: r.parentProductId ? 16 : 0 }}>{r.productName}</span>) },
    { title: '来源', dataIndex: 'source', width: 100, render: (_, r) => (r.source === 'bom' ? 'BOM' : r.source === 'child_bom' ? '子BOM' : r.source === 'bom_child' ? 'BOM+子BOM' : '-') },
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
        <Button key="view-bom" type="link" disabled={!record.bomId} onClick={() => {
          void (async () => {
            try {
              if (!record.bomId) return;
              const resp = await BomService.getTree(record.bomId);
              if (resp.success) {
                setBomTree(resp.data as BomTreeNode);
                setBomTreeVisible(true);
              } else {
                message.error(resp.message || '加载BOM树失败');
              }
            } catch {
              message.error('加载BOM树失败');
            }
          })();
        }}>
          查看BOM树
        </Button>,
      ],
    },
  ]), [message]);

  

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
        const selectedIds = selectedItemRowKeys.map(String);
        await handleRefresh({
          salesOrderId: selectedOrderId,
          includeRouting,
          includeChildProducts,
          expandMaterialsRecursively,
          warehouseId: selectedWarehouseId,
          selectedItemIds: selectedIds.length > 0 ? selectedIds : undefined,
        });
      } catch {
        message.error('生成生产计划预览失败');
      }
    };
    void run();
  }, [selectedOrderId, includeRouting, includeChildProducts, expandMaterialsRecursively, selectedWarehouseId, selectedItemRowKeys, handleRefresh, message]);

  useEffect(() => {
    const loadOrderInfo = async () => {
      if (!selectedOrderId) { setOrderInfo(null); return; }
      try {
        const resp = await salesOrderService.getById(selectedOrderId);
        setOrderInfo(resp.data || null);
      } catch { message.error('加载销售订单信息失败'); }
    };
    void loadOrderInfo();
  }, [selectedOrderId, message]);

  useEffect(() => {
    const loadOrderItems = async () => {
      setOrderItems([]);
      setSelectedItemRowKeys([]);
      form.setFieldsValue({ selectedItemIds: undefined });
      if (!selectedOrderId) { return; }
      try {
        const resp = await salesOrderService.getItems(selectedOrderId);
        setOrderItems(resp.data || []);
      } catch { message.error('加载订单产品失败'); }
    };
    void loadOrderItems();
  }, [selectedOrderId, message, form]);

  return (
    <>
      <ProForm<ProductionPlanFormValues>
        layout="vertical"
        submitter={false}
        form={form}
        onFinish={async (values: ProductionPlanFormValues) => {
          const resp = await productionPlanService.create({
            salesOrderId: String(values.salesOrderId),
            warehouseId: values.warehouseId ? String(values.warehouseId) : undefined,
            includeRouting,
            includeChildProducts,
            expandMaterialsRecursively,
            selectedItemIds: selectedItemRowKeys.length ? selectedItemRowKeys.map(String) : undefined,
            name: String(values.name),
            plannedStart: values.plannedStart && typeof values.plannedStart !== 'string' ? dayjs(values.plannedStart).format('YYYY-MM-DD') : String(values.plannedStart),
            plannedFinish: values.plannedFinish && typeof values.plannedFinish !== 'string' ? dayjs(values.plannedFinish).format('YYYY-MM-DD') : String(values.plannedFinish),
            finishedWarehouseId: String(values.finishedWarehouseId),
            issueWarehouseId: String(values.issueWarehouseId),
            ownerId: String(values.ownerId),
          })
          if (resp.success) {
            message.success('生产计划已保存')
            return true
          }
          message.error(resp.message || '保存生产计划失败')
          return false
        }}
      >
      <Card title="销售订单信息" style={{ marginBottom: 12 }}>
        <Row gutter={16}>
          <Col span={6}>
            <ProFormSelect
              name="salesOrderId"
              label="销售订单"
              placeholder="请选择销售订单"
              rules={[{ required: true, message: '请选择销售订单' }]}
              request={async () => {
                const resp = await salesOrderService.getSalesOrders({ page: 1, pageSize: 50 });
                return (resp.data || []).map((o) => ({
                  label: `${o.orderNo || '-'} - ${o.customerName ?? '-'}`,
                  value: o.id,
                      }));
                    }}
                    fieldProps={{
                      onChange: (val: string) => {
                        setSelectedOrderId(val);
                        setSelectedItemRowKeys([]);
                        form.setFieldsValue({ selectedItemIds: undefined });
                      }
                    }}
              />
          </Col>
          <Col span={6}>
            <ProFormSelect
              name="selectedItemIds"
              label="订单产品"
              placeholder="请选择参与计算的订单产品"
              options={(orderItems || []).map((it) => ({
                label: `${it.product?.name ?? '-'}${it.product?.code ? ` (${it.product?.code})` : ''} ×${it.quantity}${it.unit?.name ? ` ${it.unit?.name}` : ''}`,
                value: it.id,
              }))}
              fieldProps={{
                showSearch: true,
                optionFilterProp: 'label',
                onChange: (val: string) => {
                  setSelectedItemRowKeys(val ? [val] : []);
                },
                allowClear: true,
              }}
            />
          </Col>
          <Col span={6}>
            <ProFormSelect
                    name="warehouseId"
                    label="库存计算仓库"
                    placeholder="可选，优先按该仓库维度聚合库存"
                    request={async () => {
                      const opts = await warehouseService.getOptions({ isActive: true });
                      return (opts || []).map((w) => ({ label: w.label, value: w.value }));
                    }}
                    fieldProps={{
                      onChange: (val: string) => {
                        setSelectedWarehouseId(val);
                        void (async () => {
                          try {
                            const info = await warehouseService.getWarehouseById(val);
                            setSelectedWarehouseName(info.name);
                          } catch {
                            setSelectedWarehouseName(undefined);
                          }
                        })();
                      }
                    }}
                  />
          </Col>
          
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={4}>
            <strong>订单编号：</strong>{orderInfo?.orderNo ?? '-'}
          </Col>
          <Col span={4}>
            <strong>客户：</strong>{orderInfo?.customerName ?? '-'}
          </Col>
          <Col span={4}>  
            <strong>下单日期：</strong>{orderInfo?.orderDate ?? '-'}
          </Col>
          <Col span={4}>  
            <strong>订单交付日期：</strong>{orderInfo?.deliveryDate ?? '-'}
          </Col>
          <Col span={4}>  
            <strong>销售负责人：</strong>{orderInfo?.salesManager ?? '-'}
          </Col>
          <Col span={4}>  
            <strong>状态：</strong>{orderInfo?.status ?? '-'}
          </Col>
        </Row>
      </Card>
      <Card title="生产计划信息" style={{ marginBottom: 12 }}>
        <Row gutter={16}>
          <Col span={4}>
            <ProFormText name="name" label="生产计划名称" rules={[{ required: true, message: '请输入生产计划名称' }]} placeholder="请输入名称" />
          </Col>
          <Col span={4}>
            <ProFormSelect
              name="ownerId"
              label="生产计划负责人"
              placeholder="请选择负责人"
              rules={[{ required: true, message: '请选择生产计划负责人' }]}
              request={async () => {
                const users = await getUsers({ page: 1, pageSize: 50 });
                return (users.data || []).map((u) => ({
                  label: `${u.username}${u.email ? ` (${u.email})` : ''}`,
                  value: u.id,
                }));
              }}
            />
          </Col>
          <Col span={4}>
            <ProFormDatePicker name="plannedStart" label="计划开始日期" width="100%" rules={[{ required: true, message: '请选择计划开始日期' }]} fieldProps={{ format: 'YYYY-MM-DD' }} />
          </Col>
          <Col span={4}>
            <ProFormDatePicker name="plannedFinish" label="计划完工日期" width="100%" rules={[{ required: true, message: '请选择计划完工日期' }]} fieldProps={{ format: 'YYYY-MM-DD' }} />
          </Col>
          <Col span={4}>
            <ProFormSelect
              name="finishedWarehouseId"
              label="成品入库仓库"
              placeholder="请选择成品入库仓库"
              request={async () => {
                const opts = await warehouseService.getOptions({ isActive: true });
                return (opts || []).map((w) => ({ label: w.label, value: w.value }));
              }}
            />
          </Col>
          <Col span={4}>
            <ProFormSelect
              name="issueWarehouseId"
              label="领料仓库"
              placeholder="请选择领料仓库"
              request={async () => {
                const opts = await warehouseService.getOptions({ isActive: true });
                return (opts || []).map((w) => ({ label: w.label, value: w.value }));
              }}
            />
          </Col>
        </Row>
       
      </Card>
      </ProForm>
      <Tabs
        tabBarExtraContent={(
          <ProForm<{ includeRouting?: boolean; includeChildProducts?: boolean; expandMaterialsRecursively?: boolean }>
            layout="inline"
            submitter={false}
          >
            <Row gutter={[16, 0]}>
              <Col>
                <ProFormSwitch
                  name="includeRouting"
                  label="包含工艺路线"
                  initialValue={includeRouting}
                  fieldProps={{ checked: includeRouting, onChange: setIncludeRouting }}
                />
              </Col>
              <Col>
                <ProFormSwitch
                  name="includeChildProducts"
                  label="包含子BOM产品"
                  initialValue={includeChildProducts}
                  fieldProps={{ checked: includeChildProducts, onChange: setIncludeChildProducts }}
                />
              </Col>
              <Col>
                <ProFormSwitch
                  name="expandMaterialsRecursively"
                  label="递归展开物料"
                  initialValue={expandMaterialsRecursively}
                  fieldProps={{ checked: expandMaterialsRecursively, onChange: setExpandMaterialsRecursively }}
                />
              </Col>
              <Col>
                <Button
                  type="primary"
                  onClick={() => {
                    form.submit()
                  }}
                >
                  保存生产计划
                </Button>
              </Col>
            </Row>
          </ProForm>
        )}
        items={[
          {
            key: 'products',
            label: '生产计划明细',
            children: (
              <ProTable<ProductionPlanProductPlan>
                search={false}
                loading={loading}
                columns={productPlanColumns}
                dataSource={(function buildTree(rows: ProductionPlanProductPlan[]) {
                  type Row = ProductionPlanProductPlan & { children?: Row[] };
                  const parents: Map<string, Row> = new Map();
                  const children: Row[] = [];
                  for (const r of rows || []) {
                    if (r.parentProductId) {
                      children.push({ ...r });
                    } else {
                      parents.set(r.productId, { ...r, children: [] });
                    }
                  }
                  for (const c of children) {
                    const p = parents.get(String(c.parentProductId));
                    if (p) {
                      (p.children as Row[]).push(c);
                    } else {
                      parents.set(c.productId + ':orphan', { ...c });
                    }
                  }
                  return Array.from(parents.values());
                })(previewResult?.products || [])}
                pagination={false}
                rowKey={(r: ProductionPlanProductPlan) => {
                  return r.productId + (r.parentProductId ? `:${r.parentProductId}` : '');
                }}
                expandable={{ defaultExpandAllRows: true }}
              />
            ),
          },
          {
            key: 'materials',
            label: '需求物料明细',
            children: (
              <Row gutter={[16, 16]}>
                {previewResult?.notes && (
                  <Col span={24}>
                    <Alert
                      type="info"
                      message="预览说明"
                      description={previewResult.notes}
                      showIcon
                    />
                  </Col>
                )}
                <Col span={24}>
                  <ProForm<{ purchaseOnly?: boolean; outsourceOnly?: boolean }> layout="inline" submitter={false}>
                    <Row gutter={[16, 0]}>
                      <Col>
                        <ProFormSwitch name="purchaseOnly" label="仅显示需采购" initialValue={purchaseOnly} fieldProps={{ checked: purchaseOnly, onChange: setPurchaseOnly }} />
                      </Col>
                      <Col>
                        <ProFormSwitch name="outsourceOnly" label="仅显示需外协" initialValue={outsourceOnly} fieldProps={{ checked: outsourceOnly, onChange: setOutsourceOnly }} />
                      </Col>
                    </Row>
                  </ProForm>
                </Col>
                <Col span={24}>
                  <MaterialRequirementList
                    data={filteredMaterials}
                    loading={loading}
                    localeEmptyText={previewResult?.notes || '暂无物料需求，请为相关产品设置默认BOM并添加物料项'}
                    onPurchaseSuggestion={(record: MaterialRequirement) => {
                      modal.confirm({
                        title: '创建采购建议',
                        content: `为物料 ${record.materialCode} 创建采购建议（缺口：${record.shortageQuantity}）？`,
                        onOk: () => message.success('已添加到采购建议清单'),
                      });
                    }}
                    onOutsourceSuggestion={(record: MaterialRequirement) => {
                      modal.confirm({
                        title: '创建外协建议',
                        content: `为物料 ${record.materialCode} 创建外协建议（缺口：${record.shortageQuantity}）？`,
                        onOk: () => message.success('已添加到外协建议清单'),
                      });
                    }}
                  />
                </Col>
              </Row>
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
          rowKey={(r: RoutingWorkcenterInfo) => String(r.id)}
          search={false}
          pagination={false}
          toolBarRender={false}
          dataSource={currentProductPlan?.operations || []}
          columns={[
            { title: '序号', dataIndex: 'sequence', valueType: 'digit', width: 80 },
            { title: '工序名称', dataIndex: 'name', ellipsis: true },
            { title: '时间模式', dataIndex: 'timeMode', width: 120 },
            { title: '周期(手动)', dataIndex: 'timeCycleManual', valueType: 'digit', width: 120 },
            { title: '批次', dataIndex: 'batch', width: 80, render: (_, r: RoutingWorkcenterInfo) => (r.batch ? '是' : '否') },
            { title: '批次容量', dataIndex: 'batchSize', valueType: 'digit', width: 100 },
            { title: '工资率', dataIndex: 'wageRate', valueType: 'digit', width: 100 },
          ]}
        />
      </Drawer>
      <Drawer
        title={bomTree ? `BOM树：${bomTree.code} - ${bomTree.name}` : 'BOM树'}
        open={bomTreeVisible}
        onClose={() => setBomTreeVisible(false)}
        width={520}
      >
        {bomTree ? (
          <Tree
            treeData={(function toTreeData(node: BomTreeNode) {
              type AntTreeNode = { key: string; title: string; children?: AntTreeNode[] };
              const build = (n: BomTreeNode): AntTreeNode => ({
                key: n.id,
                title: `${n.code} ${n.name} ×${n.quantity}${n.unit ? ` (${n.unit})` : ''}${n.isPhantom ? ' [虚拟件]' : ''}`,
                children: (n.children || []).map(build),
              });
              return [build(node)];
            })(bomTree)}
          />
        ) : (
          <Alert type="info" message="暂无BOM树数据" />
        )}
      </Drawer>
    </>
  );
};

export default ProductionPlanManagement;