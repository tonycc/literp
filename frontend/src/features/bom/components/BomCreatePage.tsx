import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Button, 
  Space, 
  InputNumber,
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
import { Row, Col, Select } from 'antd';
import type { BomFormData, BomItemFormData, ProductInfo, MaterialRequirementType } from '@zyerp/shared';
import type { RoutingOption } from '@zyerp/shared';
import type { WorkcenterOption } from '@zyerp/shared';
import { useBom } from '../hooks/useBom';
import { bomService } from '../services/bom.service';
import MaterialSelectModal from './MaterialSelectModal';
import { useMessage, useModal } from '../../../shared/hooks';
import { routingService } from '../../routing/services/routing.service';

interface BomCreatePageProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const BomCreatePage: React.FC<BomCreatePageProps> = ({ onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const message = useMessage();
  const { products, units, fetchSelectOptions } = useBom();
  const [routingOptions, setRoutingOptions] = useState<RoutingOption[]>([]);
  const [workcenterOptions, setWorkcenterOptions] = useState<WorkcenterOption[]>([]);
  
  // BOM物料项行类型（保留展示字段，同时存储必要ID以便提交）
  type BomItemRow = {
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
  };

  // BOM物料项状态管理
  const [bomItemData, setBomItemData] = useState<BomItemRow[]>([]);
  
  // 物料选择弹窗状态
  const [materialModalVisible, setMaterialModalVisible] = useState(false);
  const modal = useModal();
  
  // 获取下拉选项数据
  useEffect(() => {
    fetchSelectOptions();
    // 获取工艺路线数据
    const fetchRoutings = async () => {
      try {
        const res = await routingService.getOptions({ _active: true });
        setRoutingOptions(res.data || []);
      } catch (error) {
        console.error('获取工艺路线失败:', error);
        message.error('获取工艺路线失败');
        setRoutingOptions([]);
      }
    };
    const fetchWorkcenters = async () => {
      try {
        const res = await routingService.getWorkcenterOptions({ _active: true });
        setWorkcenterOptions(res.data || []);
      } catch (error) {
        console.error('获取工作中心选项失败:', error);
        message.error('获取工作中心选项失败');
        setWorkcenterOptions([]);
      }
    };
    fetchRoutings();
    fetchWorkcenters();
  }, [fetchSelectOptions]);

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
  };

  // 提交表单
  const onFinish = async (values: BomFormData) => {
    try {
      // 验证所有字段
      await form.validateFields();
      
      // 构造BOM数据
      const bomData: BomFormData = {
        ...values,
        effectiveDate: values.effectiveDate,
        expiryDate: values.expiryDate
      };

      // 调用API创建BOM
      const result = await bomService.createBom(bomData);
      if (result.success) {
        const bomId = result.data?.id;

        if (!bomId) {
          message.warning('BOM创建成功，但未返回标识');
          onSuccess?.();
          return;
        }

        // 若存在物料明细，则逐项创建
        if (bomItemData.length > 0) {
          const payloads: BomItemFormData[] = bomItemData.map((row) => ({
            materialId: row.materialId,
            quantity: row.quantity,
            unitId: row.unitId,
            sequence: row.sequence,
            requirementType: 'fixed' as MaterialRequirementType,
            isKey: row.isKey,
            isPhantom: false,
            childBomId: row.childBomId,
          }));

          const creations = await Promise.allSettled(
            payloads.map((p) => bomService.addBomItem(bomId, p))
          );

          const successCount = creations.filter((r) => r.status === 'fulfilled' && r.value?.success).length;
          const failedCount = creations.length - successCount;

          if (failedCount === 0) {
            message.success(`BOM创建成功，已添加 ${successCount} 条明细`);
          } else if (successCount > 0) {
            message.warning(`BOM创建成功，但有 ${failedCount} 条明细添加失败`);
          } else {
            message.warning('BOM创建成功，但所有明细添加失败');
          }

          // 创建后批量自动绑定子BOM（用户确认）
          modal.confirm({
            title: '批量自动绑定子BOM',
            content: '是否批量为物料自动绑定子BOM？（仅绑定启用的候选项）',
            onOk: async () => {
              await autoBindChildBoms(bomId!);
            },
          });
        } else {
          message.success('BOM创建成功');
        }

        onSuccess?.();
      } else {
        message.error(result.message || '创建失败');
      }
    } catch (error) {
      console.error('创建BOM失败:', error);
      message.error('创建BOM失败');
    }
  };

  // 已移除行级弹窗绑定子BOM逻辑，保留内联选择

  // 批量自动绑定子BOM
  const autoBindChildBoms = async (bomId: string) => {
    try {
      const itemsRes = await bomService.getBomItems(bomId);
      const items = itemsRes.data || [];
      let successCount = 0;
      let skipCount = 0;
      let failCount = 0;

      for (const item of items) {
        // 已绑定或无法识别的情况跳过
        if (!item.materialId || item.childBomId) {
          skipCount++;
          continue;
        }
        // 拉取该物料对应产品的启用子BOM候选
        try {
          const optionsRes = await bomService.getBomOptions({ _productId: item.materialId, activeOnly: true });
          const options = optionsRes.data || [];
          const target = options[0];

          if (!target || target.id === bomId) {
            // 无候选或自引用，跳过
            skipCount++;
            continue;
          }

          const upd = await bomService.updateBomItem(item.id, { childBomId: target.id } as BomItemFormData);
          if (upd.success) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (e) {
          console.error('自动绑定子BOM失败:', e);
          failCount++;
        }
      }

      message.success(`自动绑定完成：成功${successCount}，跳过${skipCount}，失败${failCount}`);
    } catch (error) {
      console.error('批量自动绑定子BOM整体流程失败:', error);
      message.error('批量自动绑定失败');
    }
  };

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
        const res = await bomService.getBomOptions({ _productId: materialId, activeOnly: true });
        const options = Array.isArray(res.data) ? res.data : [];
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
      loadOptions();
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
      title: '规格',
      dataIndex: 'specification',
      width: 100,
    },
    {
      title: '用量',
      dataIndex: 'quantity',
      width: 120,
      render: (_, record) => (
        <InputNumber
          min={0}
          step={0.01}
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
      width: 60,
    },
    {
      title: '子BOM',
      dataIndex: 'childBomId',
      width: 120,
      render: (_, record) => (
        <ChildBomSelectCell
          materialId={record.materialId}
          value={record.childBomId}
          onChange={(v) => handleChildBomChange(record.key, v)}
        />
      ),
    },
    {
      title: '关键物料',
      dataIndex: 'isKey',
      width: 80,
      render: (_, record) => (record.isKey ? '是' : '否'),
    },
    {
      title: '操作',
      valueType: 'option',
      width: 120,
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

  const [processData, setProcessData] = useState<ProcessRow[]>([]);

  // 监听工艺路线选择变化并加载工序与工作中心
  const selectedRoutingId = Form.useWatch('routingId', form);

  useEffect(() => {
    const loadRoutingOperations = async (routingId?: string) => {
      if (!routingId) {
        setProcessData([]);
        return;
      }
      try {
        const res = await routingService.getOperations(routingId);
        const ops = res.data || [];

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

    loadRoutingOperations(selectedRoutingId);
  }, [selectedRoutingId, workcenterOptions]);


  return (
    <div style={{ padding: '16px' }}>
      <ProForm
        form={form}
        onFinish={onFinish}
        layout="vertical"
        submitter={{
          render: (props) => {
            return (
              <Row justify="center" style={{ marginTop: 24 }}>
                <Space size="middle">
                  <Button onClick={onCancel}>
                    取消
                  </Button>
                  <Button type="primary" onClick={() => props.form?.submit?.()}>
                    创建BOM
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
            </Space>
          </div>
          
          <ProTable
            columns={bomItemColumns}
            dataSource={bomItemData}
            rowKey="key"
            search={false}
            pagination={false}
            toolBarRender={false}
            size="small"
            scroll={{ x: 800 }}
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
            <ProTable
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
    </div>
  );
};

export default BomCreatePage;