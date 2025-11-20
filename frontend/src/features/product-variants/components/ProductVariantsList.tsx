import React, { useState, useRef } from 'react';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { ProductVariantsService } from '../services/product-variants.service';
import type { VariantInfo } from '@zyerp/shared';
import { useProductAttributeLines } from '../hooks/useProductAttributeLines';
import { Button, Tag, Tooltip } from 'antd';
import { useMessage, useModal } from '@/shared/hooks'
import VariantForm from './VariantForm';
import { formatCurrency } from '@/shared/utils/format';
import VariantStockAdjustModal from './VariantStockAdjustModal';
import { normalizeTableParams } from '@/shared/utils/normalizeTableParams';
import VariantImagePanel from './VariantImagePanel';

interface ProductVariantsListProps { productId: string }

const ProductVariantsList: React.FC<ProductVariantsListProps> = ({ productId }) => {
  const hookData = useProductAttributeLines(productId)
  const message = useMessage()
  const modal = useModal()
  const deleteVariant = (variantId: string) => {
    modal.confirm({
      title: '确认删除该变体？',
      content: '删除后不可恢复，是否继续？',
      onOk: async () => {
        const res = await ProductVariantsService.deleteVariant(productId, variantId)
        if (res?.success) {
          message.success('删除成功')
          actionRef.current?.reload()
        } else {
          message.error(res?.message || '删除失败')
        }
      }
    })
  }
  const attributes: Array<{ attributeName: string; values: string[]; source?: 'product' | 'global' }> = (hookData?.attributes || []) as Array<{ attributeName: string; values: string[]; source?: 'product' | 'global' }>
  const dynamicFilterColumns: ProColumns<VariantInfo>[] = attributes.map((a) => ({
    title: a.attributeName,
    dataIndex: `attr_${a.attributeName}`,
    key: `attr_${a.attributeName}`,
    valueType: 'select',
    request: async () => (a.values || []).map((v) => ({ label: v, value: v })),
    hideInTable: true,
  }))
  const [editing, setEditing] = useState<VariantInfo | undefined>(undefined);
  const [formVisible, setFormVisible] = useState(false);
  const actionRef = useRef<ActionType>(null);
  const [stockVariantId, setStockVariantId] = useState<string | undefined>(undefined);
  const [stockVisible, setStockVisible] = useState(false);
  const [imageVariantId, setImageVariantId] = useState<string | undefined>(undefined);
  const [imageVisible, setImageVisible] = useState(false);
  const columns: ProColumns<VariantInfo>[] = [
    {
      title: '变体编码',
      dataIndex: 'code',
      key: 'code',
      width: 180,
      ellipsis: true,
      copyable: true,
      fixed: 'left',
    },
    {
      title: '变体名称',
      dataIndex: 'name',
      key: 'name',
      width: 220,
      ellipsis: true,
      fixed: 'left',
    },
    {
      title: '属性集',
      dataIndex: 'variantAttributes',
      key: 'variantAttributes',
      render: (_, record) => {
        const text = (record.variantAttributes || []).map((a) => `${a.name}=${a.value}`).join(' | ');
        return text ? <Tooltip title={text}>{text}</Tooltip> : '-'
      },
      ellipsis: true,
      width: 260,
    },
    {
      title: '条码',
      dataIndex: 'barcode',
      key: 'barcode',
      render: (_, record) => record.barcode || '-',
      ellipsis: true,
      width: 160,
    },
    {
      title: '二维码',
      dataIndex: 'qrCode',
      key: 'qrCode',
      render: (_, record) => record.qrCode || '-',
      ellipsis: true,
      width: 160,
    },
    {
      title: '标准价',
      dataIndex: 'standardPrice',
      key: 'standardPrice',
      render: (_, record) => (record.standardPrice != null ? formatCurrency(record.standardPrice) : '-'),
      align: 'right',
      width: 120,
    },
    {
      title: '销售价',
      dataIndex: 'salePrice',
      key: 'salePrice',
      render: (_, record) => (record.salePrice != null ? formatCurrency(record.salePrice) : '-'),
      align: 'right',
      width: 120,
    },
    {
      title: '采购价',
      dataIndex: 'purchasePrice',
      key: 'purchasePrice',
      render: (_, record) => (record.purchasePrice != null ? formatCurrency(record.purchasePrice) : '-'),
      align: 'right',
      width: 120,
    },
    {
      title: '当前库存',
      dataIndex: 'currentStock',
      key: 'currentStock',
      render: (_, record) => (record.currentStock != null ? record.currentStock : '-'),
      align: 'right',
      width: 110,
    },
    {
      title: '预留库存',
      dataIndex: 'reservedStock',
      key: 'reservedStock',
      render: (_, record) => (record.reservedStock != null ? record.reservedStock : '-'),
      align: 'right',
      width: 110,
    },
    {
      title: '可用库存',
      dataIndex: 'availableStock',
      key: 'availableStock',
      render: (_, record) => {
        const cur = record.currentStock ?? null
        const res = record.reservedStock ?? null
        const avail = record.availableStock ?? (cur != null && res != null ? Math.max(0, cur - res) : null)
        return avail != null ? avail : '-'
      },
      align: 'right',
      width: 110,
    },
    {
      title: '库存状态',
      dataIndex: 'inventoryStatus',
      key: 'inventoryStatus',
      render: (_, record) => {
        const cur = record.currentStock
        const safety = record.safetyStock
        const max = record.maxStock
        let status: string | null = null
        if (cur == null) status = null
        else if (cur <= 0) status = '缺货'
        else if (typeof safety === 'number' && cur < safety) status = '低库存'
        else if (typeof max === 'number' && cur > max) status = '超库存'
        else status = '正常'
        const color = status === '缺货' ? 'error' : status === '低库存' ? 'warning' : status === '超库存' ? 'processing' : 'success'
        return status ? <Tag color={color}>{status}</Tag> : '-'
      },
      width: 110,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (_, record) => (
        <div style={{ display: 'inline-flex', columnGap: 2}}>
          <Button type="link" size='small' onClick={() => { setEditing(record); setFormVisible(true); }}>编辑</Button>
          <Button type="link" size='small' onClick={() => { deleteVariant(record.id); }}>删除</Button>
          <Button type="link" size='small' onClick={() => { setStockVariantId(record.id); setStockVisible(true); }}>库存调整</Button>
        </div>
      ),
      fixed: 'right',
      width: 150,
    },
    ...dynamicFilterColumns,
    // Add other columns as needed
  ];

  return (
    <>
    <ProTable<VariantInfo>
      columns={columns}
      actionRef={actionRef}
      request={async (params) => {
        const listParams = normalizeTableParams(params as Record<string, unknown>)
        const res = await ProductVariantsService.getVariants(productId, listParams)
        return res as unknown as { data: VariantInfo[]; success: boolean; total: number }
      }}
      rowKey="id"
      search={{ labelWidth: 'auto' }}
      headerTitle="产品变体"
      options={{ density: true, fullScreen: true, reload: true, setting: { listsHeight: 400 } }}
      scroll={{ x: 1500 }}
      sticky
      toolBarRender={() => [
        <Button key="add" type="primary" onClick={() => { setEditing(undefined); setFormVisible(true); }}>
          新增变体
        </Button>
      ]}
    />
    {formVisible && (
      <VariantForm
        productId={productId}
        variant={editing}
        visible={formVisible}
        onClose={() => { setFormVisible(false); setEditing(undefined); }}
        onUpdated={() => { actionRef.current?.reload(); }}
      />
    )}
    {stockVariantId && (
      <VariantStockAdjustModal
        productId={productId}
        variantId={stockVariantId}
        visible={stockVisible}
        onClose={() => { setStockVisible(false); setStockVariantId(undefined); }}
        onUpdated={() => { actionRef.current?.reload(); }}
      />
    )}
    {imageVariantId && (
      <VariantImagePanel
        productId={productId}
        variantId={imageVariantId}
        visible={imageVisible}
        onClose={() => { setImageVisible(false); setImageVariantId(undefined); }}
      />
    )}
  </>
  );
};

export default ProductVariantsList;
