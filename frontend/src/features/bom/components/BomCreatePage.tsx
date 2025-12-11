import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Space, 
  InputNumber,
  Row, 
  Col, 
  Select
} from 'antd';
import { 
  ProForm,
  ProFormText,
  ProFormSelect,
  ProFormDigit,
  ProFormDatePicker,
  ProTable,
  ProCard
} from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import type { BomFormData, ProductInfo, MaterialRequirementType, ProductBom, BomItem } from '@zyerp/shared';
import type { RoutingOption } from '@zyerp/shared';
import type { WorkcenterOption } from '@zyerp/shared';
import { MATERIAL_REQUIREMENT_TYPE } from '@/shared/constants/bom';
import { useBom } from '../hooks/useBom';
import { BomService } from '../services/bom.service';
import MaterialSelectModal from './MaterialSelectModal';
import BomItemBatchModal from './BomItemBatchModal';
import { useMessage } from '@/shared/hooks/useMessage';
import { productService } from '../../product/services/product.service';
import { routingService } from '../../routing/services/routing.service';
import dayjs from 'dayjs';
import { useBomItemsSync } from '../hooks/useBomItemsSync';

interface BomCreatePageProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  editing?: ProductBom;
}

const BomCreatePage: React.FC<BomCreatePageProps> = ({ onSuccess, onCancel, editing }) => {
  const [form] = ProForm.useForm<BomFormData>();
  const message = useMessage();
  const { products, units, fetchSelectOptions } = useBom();
  const [routingOptions, setRoutingOptions] = useState<RoutingOption[]>([]);
  const [workcenterOptions, setWorkcenterOptions] = useState<WorkcenterOption[]>([]);
  const [variantOptions, setVariantOptions] = useState<{ label: string; value: string }[]>([]);
  
  // BOM物料项行类型（保留展示字段，同时存储必要ID以便提交）
  type BomItemRow = {
    id?: string;
    key: string;
    materialId: string; // 用于提交
    unitId: string;     // 用于提交
    materialCode: string;
    materialName: string;
    specification: string;
    quantity: number;
    unit: string;
    sequence: number;
    isKey: boolean;
    childBomId?: string; // 子BOM绑定（用于提交）
    scrapRate: number;   // 损耗率 (%)
    fixedScrap: number;  // 固定损耗
  };

  // BOM物料项状态管理
  const [bomItemData, setBomItemData] = useState<BomItemRow[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  
  // 物料选择弹窗状态
  const [materialModalVisible, setMaterialModalVisible] = useState(false);
  const { syncBomItems, toSyncItems } = useBomItemsSync();
  
  // 获取下拉选项数据
  useEffect(() => {
    void fetchSelectOptions();
    // 获取工艺路线数据
    const fetchRoutings = async () => {
      try {
        const res = await routingService.getOptions({ _active: true });
        if (res.success && Array.isArray(res.data)) {
          setRoutingOptions(res.data);
        } else {
          setRoutingOptions([]);
        }
      } catch (error) {
        console.error('获取工艺路线失败:', error);
        message.error('获取工艺路线失败');
        setRoutingOptions([]);
      }
    };
    const fetchWorkcenters = async () => {
      try {
        const res = await routingService.getWorkcenterOptions({ _active: true });
        if (res.success && Array.isArray(res.data)) {
          setWorkcenterOptions(res.data);
        } else {
          setWorkcenterOptions([]);
        }
      } catch (error) {
        console.error('获取工作中心选项失败:', error);
        message.error('获取工作中心选项失败');
        setWorkcenterOptions([]);
      }
    };
    void fetchRoutings();
    void fetchWorkcenters();
  }, [fetchSelectOptions, message]);

  // 编辑模式：预填充表单与加载现有明细
  useEffect(() => {
    const initEdit = async () => {
      if (!editing) return;
      form.setFieldsValue({
        name: editing.name,
        productId: editing.productId,
        baseQuantity: editing.baseQuantity,
        baseUnitId: editing.baseUnitId,
        effectiveDate: editing.effectiveDate,
        expiryDate: editing.expiryDate,
        version: editing.version,
        routingId: editing.routingId,
      });
      try {
        const res = await BomService.getItems(editing.id);
        const list = res.success && Array.isArray(res.data) ? res.data : [];
        const mapped: BomItemRow[] = list.map((it: BomItem, idx: number) => ({
          id: it.id,
          key: it.id || `old_${idx}`,
          materialId: it.materialId,
          unitId: it.unitId,
          materialCode: it.materialCode,
          materialName: it.materialName,
          specification: it.materialSpec || '-',
          quantity: it.quantity,
          unit: it.unitName || '-',
          sequence: typeof it.sequence === 'number' ? it.sequence : (idx + 1) * 10,
          isKey: !!it.isKey,
          childBomId: it.childBomId,
          scrapRate: Number(it.scrapRate) || 0,
          fixedScrap: Number(it.fixedScrap) || 0,
        }));
        setBomItemData(mapped);
      } catch (e) {
        console.error('加载BOM明细失败:', e);
        setBomItemData([]);
      }
    };
    void initEdit();
  }, [editing, form]);

  // 处理产品选择变化
  const handleProductChange = (productId: string) => {
    const selectedProduct = products.find(p => p.id === productId);
    const unitId = selectedProduct?.unitId ?? selectedProduct?.unit?.id;
    if (unitId) {
      // 自动填充基准单位
      form.setFieldsValue({
        baseUnitId: unitId
      });
    }

    // 获取产品变体
    setVariantOptions([]);
    form.setFieldValue('variantId', undefined);
    if (productId) {
      void (async () => {
        try {
          const res = await productService.getProductById(productId);
          if (res.success && res.data && res.data.variants && res.data.variants.length > 0) {
            setVariantOptions(res.data.variants.map(v => ({
              label: `${v.name} ${v.code ? `(${v.code})` : ''}`,
              value: v.id
            })));
          }
        } catch (e) {
          console.error('Failed to fetch variants', e);
        }
      })();
    }
  };

  // 提交表单
  const onFinish = async (values: BomFormData) => {
    try {
      // 验证所有字段
      await form.validateFields();
      
      
      const effectiveDateStr = typeof values.effectiveDate === 'string'
        ? values.effectiveDate
        : dayjs(values.effectiveDate).format('YYYY-MM-DD');
      const expiryDateStr = values.expiryDate
        ? (typeof values.expiryDate === 'string' ? values.expiryDate : dayjs(values.expiryDate).format('YYYY-MM-DD'))
        : undefined;
      const bomData: BomFormData = {
        ...values,
        effectiveDate: effectiveDateStr as unknown as Date,
        expiryDate: expiryDateStr as unknown as Date,
        items: bomItemData.map(item => ({
          materialId: item.materialId,
          materialCode: item.materialCode,
          materialName: item.materialName,
          quantity: item.quantity,
          unitId: item.unitId,
          unit: item.unit,
          sequence: item.sequence,
          requirementType: MATERIAL_REQUIREMENT_TYPE.FIXED as MaterialRequirementType,
          isKey: item.isKey,
          isPhantom: false,
          scrapRate: item.scrapRate,
          fixedScrap: item.fixedScrap,
          childBomId: item.childBomId,
        } as unknown as Omit<BomItem, 'id' | 'bomId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>)),
      };
      if (editing?.id) {
        // 编辑模式：更新BOM并同步物料项
        const upd = await BomService.update(editing.id, bomData);
        if (!upd.success) {
          message.error(upd.message || '更新失败');
          return;
        }
        // 批量同步物料项（事务、幂等）
        const syncItems = toSyncItems(bomItemData.map((row) => ({
          id: row.id,
          materialId: row.materialId,
          quantity: row.quantity,
          unitId: row.unitId,
          sequence: row.sequence,
          isKey: row.isKey,
          isPhantom: false,
          childBomId: row.childBomId,
          requirementType: MATERIAL_REQUIREMENT_TYPE.FIXED as MaterialRequirementType,
          scrapRate: row.scrapRate,
          fixedScrap: row.fixedScrap,
        })));
        const summary = await syncBomItems(editing.id, syncItems);
        if (summary) {
          const s = summary;
          if (s?.deleted || s?.updated || s?.created) {
            message.success(`BOM更新成功：新增${s.created ?? 0}、更新${s.updated ?? 0}、删除${s.deleted ?? 0}、跳过${s.skipped ?? 0}`);
          } else {
            message.success('BOM更新成功，无变更');
          }
        }
        onSuccess?.();
      } else {
        // 创建模式
        const result = await BomService.create(bomData);
        if (result.success) {
          message.success('BOM创建成功');
          onSuccess?.();
        } else {
          message.error(result.message || '创建失败');
        }
      }
    } catch (error) {
      // 兼容后端返回的错误格式
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const errMsg = err.response?.data?.message || err.message || '请求失败';
      console.error('BOM表单提交失败:', error);
      message.error(errMsg);
    }
  };

  // 已移除行级弹窗绑定子BOM逻辑，保留内联选择
  // 批量自动绑定子BOM逻辑已由后端自动处理，前端代码保留但不再调用

  // BOM物料项表格列定义
  const handleChildBomChange = (rowKey: string, value?: string) => {
    setBomItemData(prev => prev.map(item => item.key === rowKey ? { ...item, childBomId: value } : item));
  };

  const ChildBomSelectCell: React.FC<{ materialId: string; value?: string; onChange: (v?: string) => void }> = ({ materialId, value, onChange }) => {
    const [opts, setOpts] = useState<{ label: string; value: string }[]>([]);

    const loadOptions = async () => {
      if (!materialId) {
        setOpts([]);
        return;
      }
      try {
        const res = await BomService.getList({ page: 1, pageSize: 100 });
        const list = res.success && Array.isArray(res.data) ? res.data : [];
        const options = list.filter((b) => b.productId === materialId);
        setOpts(options.map((b) => ({
          value: b.id,
          label: `${b.code} ${b.name}（${b.version}）`,
        })));
      } catch (error) {
        console.error('加载子BOM选项失败:', error);
        message.error('加载子BOM选项失败');
        setOpts([]);
      }
    };

    useEffect(() => {
      void loadOptions();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [materialId]);

    return (
      <Select
        value={value}
        placeholder={materialId ? '选择子BOM' : '请先选择物料'}
        style={{ width: '100%' }}
        options={opts}
        allowClear
        showSearch
        onChange={(val) => {
          const v = typeof val === 'string' ? val : undefined;
          onChange(v);
        }}
      />
    );
  };

  const bomItemColumns: ProColumns<BomItemRow>[] = [
    {
      title: '物料编码',
      dataIndex: 'materialCode',
      width: 120,
    },
    {
      title: '物料名称',
      dataIndex: 'materialName',
      width: 150,
    },
    {
      title: '用量',
      dataIndex: 'quantity',
      width: 100,
      render: (_, record) => (
        <InputNumber
          min={0}
          step={1}
          precision={2}
          value={record.quantity}
          onChange={(value) => handleQuantityChange(record.key, typeof value === 'number' ? value : record.quantity)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: '单位',
      dataIndex: 'unit',
      width: 40,
    },
    {
      title: '损耗率(%)',
      dataIndex: 'scrapRate',
      width: 80,
      render: (_, record) => (
        <InputNumber
          min={0}
          max={100}
          step={0.01}
          precision={2}
          value={record.scrapRate}
          onChange={(value) => handleScrapRateChange(record.key, typeof value === 'number' ? value : record.scrapRate)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: '固定损耗',
      dataIndex: 'fixedScrap',
      width: 80,
      render: (_, record) => (
        <InputNumber
          min={0}
          step={0.01}
          precision={2}
          value={record.fixedScrap}
          onChange={(value) => handleFixedScrapChange(record.key, typeof value === 'number' ? value : record.fixedScrap)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: '子BOM',
      dataIndex: 'childBomId',
      width: 300,
      render: (_, record) => (
        <ChildBomSelectCell
          materialId={record.materialId}
          value={record.childBomId}
          onChange={(v: string | undefined) => handleChildBomChange(record.key, v)}
        />
      ),
    },
   
    {
      title: '操作',
      valueType: 'option',
      width: 20,
      render: (_, record) => [
        <Button 
          key="delete" 
          size="small" 
          type="link" 
          danger
          onClick={() => handleDeleteMaterial(record.key)}
        >
          删除
        </Button>,
      ],
    },
  ];

  // 工序列表表格列定义
  type ProcessRow = {
    key: string;
    sequence: number;
    processName: string;
    workCenter: string;
    estimatedTime: number;
    description: string;
  };

  const processColumns: ProColumns<ProcessRow>[] = [
    {
      title: '序号',
      dataIndex: 'sequence',
      width: 60,
    },
    {
      title: '工序名称',
      dataIndex: 'processName',
      width: 120,
    },
    {
      title: '工作中心',
      dataIndex: 'workCenter',
      width: 120,
    },
    {
      title: '预计时间(分钟)',
      dataIndex: 'estimatedTime',
      width: 100,
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
    },
  ];
  // 处理添加物料项
  const handleAddMaterials = () => {
    setMaterialModalVisible(true);
  };

  // 处理物料选择确认
  const handleMaterialConfirm = (selectedMaterials: ProductInfo[]) => {
    const newItems: BomItemRow[] = selectedMaterials.map((material, index) => ({
      key: `new_${Date.now()}_${index}`,
      materialId: material.id,
      unitId: material.unit?.id ?? material.unitId ?? '',
      materialCode: material.code,
      materialName: material.name,
      specification: material.specification || '-',
      quantity: 1.00,
      unit: material.unit?.name || '-',
      sequence: (bomItemData.length + index + 1) * 10,
      isKey: false,
      childBomId: undefined,
      scrapRate: 0,
      fixedScrap: 0,
    }));
    
    setBomItemData([...bomItemData, ...newItems]);
    message.success(`成功添加 ${selectedMaterials.length} 个物料项`);
  };

  // 处理删除物料项
  const handleDeleteMaterial = (key: string) => {
    setBomItemData(bomItemData.filter(item => item.key !== key));
    message.success('删除成功');
  };

  // 处理编辑物料用量
  const handleQuantityChange = (key: string, value: number) => {
    setBomItemData(prev => prev.map(item => item.key === key ? { ...item, quantity: value } : item));
  };

  const handleScrapRateChange = (key: string, value: number) => {
    setBomItemData(prev => prev.map(item => item.key === key ? { ...item, scrapRate: value } : item));
  };

  const handleFixedScrapChange = (key: string, value: number) => {
    setBomItemData(prev => prev.map(item => item.key === key ? { ...item, fixedScrap: value } : item));
  };

  const handleBatchOk = (values: { scrapRate?: number; fixedScrap?: number }) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先勾选需要修改的行');
      setBatchModalVisible(false);
      return;
    }

    setBomItemData(prev => prev.map(item => {
      if (selectedRowKeys.includes(item.key)) {
        return {
          ...item,
          ...(values.scrapRate !== undefined ? { scrapRate: values.scrapRate } : {}),
          ...(values.fixedScrap !== undefined ? { fixedScrap: values.fixedScrap } : {}),
        };
      }
      return item;
    }));
    message.success('批量设置成功');
    setBatchModalVisible(false);
    setSelectedRowKeys([]);
  };

  const [processData, setProcessData] = useState<ProcessRow[]>([]);

  // 监听工艺路线选择变化并加载工序与工作中心
  const selectedRoutingId: unknown = ProForm.useWatch('routingId', form);

  useEffect(() => {
    const loadRoutingOperations = async (routingId?: string) => {
      if (!routingId) {
        setProcessData([]);
        return;
      }
      try {
        const res = await routingService.getOperations(routingId);
        const ops = res.success && Array.isArray(res.data) ? res.data : [];

        // 映射工序表格行
        const mappedProcesses: ProcessRow[] = ops.map((op) => {
          const wc = workcenterOptions.find((w) => w.value === op.workcenterId);
          return {
            key: op.id,
            sequence: op.sequence,
            processName: op.name,
            workCenter: wc?.label ?? (op.workcenterId ? `#${op.workcenterId.slice(0, 8)}` : '-'),
            estimatedTime: op.timeCycleManual ?? 0,
            description: op.description ?? '',
          };
        });
        setProcessData(mappedProcesses);
      } catch (error) {
        console.error('获取工艺路线工序失败:', error);
        message.error('获取工序失败');
        setProcessData([]);
      }
    };

    const rid = typeof selectedRoutingId === 'string' ? selectedRoutingId : undefined;
    void loadRoutingOperations(rid);
  }, [selectedRoutingId, workcenterOptions, message]);


  return (
    <div style={{ padding: '16px' }}>
      <ProForm<BomFormData>
        form={form}
        onFinish={onFinish}
        layout="vertical"
        submitter={{
          render: (_) => {
            return (
              <Row justify="center" style={{ marginTop: 24 }}>
                <Space size="middle">
                  <Button onClick={onCancel}>
                    取消
                  </Button>
                  <Button type="primary" onClick={() => form.submit()}>
                    {editing ? '保存' : '创建BOM'}
                  </Button>
                </Space>
              </Row>
            );
          },
        }}
      >
        {/* 基本信息区域 */}
        <ProCard title="产品信息" bordered style={{ marginBottom: 12 }} bodyStyle={{ padding: '16px' }}>
          <Row gutter={[16, 8]}>
             <Col xs={24} sm={12} lg={8}>
              <ProFormText
                name="name"
                label="BOM名称"
                placeholder="请输入BOM名称"
                rules={[{ required: true, message: '请输入BOM名称' }]}
              />
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <ProFormSelect
                name="productId"
                label="产品"
                placeholder="请选择产品"
                options={products.map(product => ({
                  value: product.id,
                  label: `${product.name}`
                }))}
                showSearch
                rules={[{ required: true, message: '请选择产品' }]}
                onChange={handleProductChange}
              />
            </Col>
            {variantOptions.length > 0 && (
              <Col xs={24} sm={12} lg={8}>
                <ProFormSelect
                  name="variantId"
                  label="产品变体"
                  placeholder="请选择变体（可选）"
                  options={variantOptions}
                  showSearch
                  allowClear
                />
              </Col>
            )}
            <Col xs={24} sm={12} lg={4}>
              <ProFormDigit
                name="baseQuantity"
                label="基准数量"
                placeholder="请输入基准数量"
                min={0}
                precision={2}
                initialValue={1}
                rules={[{ required: true, message: '请输入基准数量' }]}
              />
            </Col>
            <Col xs={24} sm={12} lg={4}>
              <ProFormSelect
                name="baseUnitId"
                label="基准单位"
                placeholder="请选择基准单位"
                disabled
                options={units.map(unit => ({
                  value: unit.id,
                  label: `${unit.name} (${unit.symbol})`
                }))}
                showSearch
                rules={[{ required: true, message: '请选择基准单位' }]}
              />
            </Col>
           
          </Row>
          
          <Row gutter={[16, 8]}>
            <Col xs={24} sm={12} lg={4}>
              <ProFormDatePicker
                name="effectiveDate"
                label="生效日期"
                placeholder="请选择生效日期"
                rules={[{ required: true, message: '请选择生效日期' }]}
              />
            </Col>
            <Col xs={24} sm={12} lg={4}>
              <ProFormDatePicker
                name="expiryDate"
                label="失效日期"
                placeholder="请选择失效日期"
              />
            </Col>
             <Col xs={24} sm={12} lg={8}>
              <ProFormText
                name="version"
                label="版本"
                placeholder="如：V1.0"
                rules={[{ required: true, message: '请输入版本' }]}
              />
            </Col>
          </Row>     
        </ProCard>

        {/* BOM明细区域 */}
        <ProCard title="BOM明细" bordered style={{ marginBottom: 12 }} bodyStyle={{ padding: '16px' }}>
          <div style={{ marginBottom: 12 }}>
            <Space>
              <Button type="primary" size="middle" onClick={handleAddMaterials}>
                添加物料项
              </Button>
              <Button 
                onClick={() => {
                  if (selectedRowKeys.length === 0) {
                    message.warning('请先勾选需要修改的行');
                    return;
                  }
                  setBatchModalVisible(true);
                }}
              >
                批量设置损耗
              </Button>
            </Space>
          </div>
          
          <ProTable<BomItemRow>
            columns={bomItemColumns}
            dataSource={bomItemData}
            rowKey="key"
            search={false}
            pagination={false}
            toolBarRender={false}
            size="small"
            scroll={{ x: 1000 }}
            rowSelection={{
              selectedRowKeys,
              onChange: (keys) => setSelectedRowKeys(keys as React.Key[]),
            }}
          />
        </ProCard>

        {/* 生产工序信息区域 */}
        <ProCard title="生产工序信息" bordered style={{ marginBottom: 12 }} bodyStyle={{ padding: '16px' }}>
          <Row gutter={[16, 8]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12}>
              <ProFormSelect
                name="routingId"
                placeholder="请选择工艺路线"
                options={routingOptions}
                showSearch
              />
            </Col>
          </Row>
          
          {/* 工序列表 */}
          <div style={{ marginBottom: 16 }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: 14, fontWeight: 500 }}>工序列表</h4>
            <ProTable<ProcessRow>
              columns={processColumns}
              dataSource={processData}
              rowKey="key"
              search={false}
              pagination={false}
              toolBarRender={false}
              size="small"
              scroll={{ x: 600 }}
            />
          </div>
        </ProCard>
      </ProForm>
      
      {/* 物料选择弹窗 */}
      <MaterialSelectModal
        visible={materialModalVisible}
        onCancel={() => setMaterialModalVisible(false)}
        onConfirm={handleMaterialConfirm}
        excludeProductIds={bomItemData.map(item => item.materialId)}
      />

      <BomItemBatchModal
        visible={batchModalVisible}
        onCancel={() => setBatchModalVisible(false)}
        onOk={handleBatchOk}
      />
    </div>
  );
};

export default BomCreatePage;