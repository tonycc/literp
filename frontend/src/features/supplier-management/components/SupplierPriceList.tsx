import React, { useEffect, useRef, useState } from 'react'
import { Button, Space, Tag, Tooltip } from 'antd'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { ProTable } from '@ant-design/pro-components'
import type { SupplierPrice, User } from '@zyerp/shared'
import { SUPPLIER_VAT_RATE_VALUE_ENUM_PRO } from '@/shared/constants/supplier'
import { supplierService } from '../services/supplier.service'
import { supplierPriceService } from '../services/supplier-price.service'
import { ProductService } from '@/features/product/services'
import { useMessage } from '@/shared/hooks/useMessage'
import { useModal } from '@/shared/hooks/useModal'
import { getUsers } from '@/shared/services/user.service'
import dayjs from 'dayjs'
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons'

interface SupplierPriceListProps {
  actionRef?: React.MutableRefObject<ActionType | undefined>
  selectedRowKeys: React.Key[]
  onSelectChange: (keys: React.Key[]) => void
  onAdd: () => void
  onEdit: (record: SupplierPrice) => void
  onDelete: (id: string) => Promise<void>
}

const SupplierPriceList: React.FC<SupplierPriceListProps> = ({ actionRef, selectedRowKeys, onSelectChange, onAdd, onEdit, onDelete }) => {
  const localActionRef = useRef<ActionType | undefined>(undefined)
  const tableActionRef = actionRef ?? localActionRef
  const message = useMessage()
  const modal = useModal()
  const [supplierDict, setSupplierDict] = useState<Record<string, string>>({})
  const [userDict, setUserDict] = useState<Record<string, string>>({})
  const productService = new ProductService()

  useEffect(() => {
    void (async () => {
      try {
        const [supplierResp, userResp] = await Promise.all([
          supplierService.getList({ current: 1, pageSize: 500 }),
          getUsers({ page: 1, pageSize: 500 }),
        ])
        const sDict: Record<string, string> = {}
        ;(supplierResp.data || []).forEach((s) => {
          sDict[s.id] = s.name
        })
        setSupplierDict(sDict)

        const uDict: Record<string, string> = {}
        ;(userResp.data || []).forEach((u: User) => {
          if (u?.id) {
            const key = String(u.id)
            const name = (u.username || u.email || key)
            uDict[key] = name
          }
        })
        setUserDict(uDict)
      } catch (error) {
        console.error('Failed to load dictionary data:', error)
      }
    })()
  }, [])

  const columns: ProColumns<SupplierPrice>[] = [
    {
      title: '产品信息',
      key: 'product',
      width: 300,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.productName}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>编码: {record.productCode}</div>
        </div>
      ),
      
    },
    {
      title: '供应商',
      dataIndex: 'supplierId',
      key: 'supplierId',
      width: 150,
      render: (_, record) => (
        <Tooltip title={supplierDict[record.supplierId] || record.supplierId}>
          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '130px' }}>
            {supplierDict[record.supplierId] || record.supplierId}
          </div>
        </Tooltip>
      ),
      valueType: 'select',
      request: async () => {
        const resp = await supplierService.getList({ current: 1, pageSize: 200 })
        return (resp.data || []).map((s) => ({ label: s.name, value: s.id }))
      },
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
      align: 'center',
      search: false,
    },
    {
      title: '含税单价',
      dataIndex: 'taxInclusivePrice',
      key: 'taxInclusivePrice',
      width: 120,
      align: 'right',
      render: (_, record) => <span style={{ color: '#f50', fontWeight: 'bold' }}>¥{record.taxInclusivePrice.toFixed(2)}</span>,
      search: false,
    },
    {
      title: '税率',
      dataIndex: 'vatRate',
      key: 'vatRate',
      width: 80,
      align: 'center',
      render: (_, record) => <Tag color="blue">{(record.vatRate * 100).toFixed(0)}%</Tag>,
      valueType: 'select',
      valueEnum: SUPPLIER_VAT_RATE_VALUE_ENUM_PRO,
      search: false,
    },
    {
      title: '不含税单价',
      dataIndex: 'taxExclusivePrice',
      key: 'taxExclusivePrice',
      width: 120,
      align: 'right',
      render: (_, record) => `¥${record.taxExclusivePrice.toFixed(2)}`,
      search: false,
    },
    {
      title: '税额',
      dataIndex: 'taxAmount',
      key: 'taxAmount',
      width: 100,
      align: 'right',
      render: (_, record) => {
        const ex = record.taxExclusivePrice ?? Number((record.taxInclusivePrice / (1 + record.vatRate)).toFixed(2))
        const tax = Number((record.taxInclusivePrice - ex).toFixed(2))
        return `¥${tax.toFixed(2)}`
      },
      search: false,
    },
    {
      title: '产品名称',
      dataIndex: 'productName',
      key: 'productName',
      hideInTable: true,
      valueType: 'select',
      request: async () => {
        const resp = await productService.getProductOptions({ activeOnly: true })
        const list = resp.data || []
        return list.map((p) => ({ label: p.name, value: p.name }))
      },
    },
    {
      title: '产品编码',
      dataIndex: 'productCode',
      key: 'productCode',
      hideInTable: true,
      valueType: 'select',
      request: async () => {
        const resp = await productService.getProductOptions({ activeOnly: true })
        const list = resp.data || []
        return list.map((p) => ({ label: p.code, value: p.code }))
      },
    },
    {
      title: '采购负责人',
      dataIndex: 'purchaseManager',
      key: 'purchaseManager',
      width: 120,
      render: (_, record) => (
        <Space>
          <UserOutlined />
          {record.purchaseManager}
        </Space>
      ),
      search: true,
    },
    {
      title: '创建人',
      key: 'createdBy',
      width: 150,
      render: (_, record) => (
        <div>{userDict[String(record.createdBy)] || String(record.createdBy)}</div>
      ),
      search: false,
    },
    {
      title:'创建日期',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (_, record) => record.createdAt ? dayjs(record.createdAt).format('YYYY-MM-DD') : '',
      search: false,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      valueType: 'option',
      render: (_, record) => [
        <Tooltip title="编辑" key="edit">
          <Button type="link" icon={<EditOutlined />} onClick={() => onEdit(record)} />
        </Tooltip>,
        <Tooltip title="删除" key="delete">
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() =>
              void modal.confirm({
                title: '确定要删除这条价格记录吗？',
                content: '删除后无法恢复，请确认操作。',
                okText: '确定',
                cancelText: '取消',
                onOk: async () => {
                  try {
                    await onDelete(record.id)
                    message.success('删除成功')
                    await tableActionRef.current?.reload?.()
                  } catch {
                    message.error('删除失败')
                  }
                },
              })
            }
          />
        </Tooltip>,
      ],
    },
  ]

  return (
    <ProTable<SupplierPrice>
      headerTitle="供应商价格表"
      columns={columns}
      request={async (params) => {
      const resp = await supplierPriceService.getList(params)
        return { data: resp.data, success: resp.success, total: resp.total }
      }}
      rowKey="id"
      actionRef={tableActionRef}
      scroll={{ x: 1400 }}
      rowSelection={{ selectedRowKeys, onChange: onSelectChange }}
      pagination={{
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
      }}
      search={{ labelWidth: 'auto', span: 4, defaultCollapsed: false }}
      toolBarRender={() => [
        <Button key="add" type="primary" icon={<PlusOutlined />} onClick={onAdd}>
          新增产品价格
        </Button>,
      ]}
      options={{ setting: { listsHeight: 400 }, fullScreen: false, reload: true, density: false }}
    />
  )
}

export default SupplierPriceList