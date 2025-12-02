import React, { useCallback, useState, useRef } from 'react'
import { ProTable } from '@ant-design/pro-components'
import type { ProColumns, ActionType } from '@ant-design/pro-components'
import { Button, Modal, Tag } from 'antd'
import { useMessage } from '@/shared/hooks'
import { AttributesService, type AttributeInfo } from '../services/attributes.service'
import { normalizeTableParams } from '@/shared/utils/normalizeTableParams'
import AttributeForm, { type AttributeFormValues } from './AttributeForm'


const AttributeList: React.FC = () => {
  const message = useMessage()
  const actionRef = useRef<ActionType | undefined>(undefined)
  const [openEdit, setOpenEdit] = useState(false)
  const [editing, setEditing] = useState<AttributeInfo | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const columns: ProColumns<AttributeInfo>[] = [
    { title: '序号', dataIndex: 'index', valueType: 'indexBorder', width: 48 },
    { title: '属性名称', dataIndex: 'name' },
    { title: '属性值', dataIndex: 'values', render: (_, record) => {
      const list = Array.isArray(record.values) ? Array.from(new Set(record.values)) : []
      return list.length > 0 ? list.map((v, i) => <Tag key={`${record.id}-${v}-${i}`}>{v}</Tag>) : '-'
    } },
    { title: '值数量', dataIndex: 'valuesCount', render: (_, record) => Array.isArray(record.values) ? String(record.values.length) : '0' },
    { title: '全局', dataIndex: 'isGlobal', valueType: 'switch' },
    { title: '启用', dataIndex: 'isActive', valueType: 'switch' },
   
    {
      title: '操作', valueType: 'option', render: (_, record) => [
        <a key="edit" onClick={() => { setEditing(record); setOpenEdit(true) }}>编辑</a>,
        <a key="delete" onClick={() => { void (async () => {
          const res = await AttributesService.deleteAttribute(record.id)
          if (res.success) { message.success('删除成功'); setReloadKey((k) => k + 1) } else message.error(res.message || '删除失败')
        })() }}>删除</a>
      ]
    }
  ]

  const request = useCallback(async (params: import('@/shared/utils/normalizeTableParams').TableParams) => {
    const base = normalizeTableParams(params)
    const resp = await AttributesService.getAttributes({ page: base.page, pageSize: base.pageSize, keyword: params.keyword as string | undefined })
    return { data: resp.data, success: resp.success, total: resp.total }
  }, [])

  return (
    <>
      <ProTable<AttributeInfo>
        actionRef={actionRef}
        columns={columns}
        request={request}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        pagination={{ showSizeChanger: true }}
        toolBarRender={() => [
          <Button key="add" type="primary" onClick={() => { setEditing(null); setOpenEdit(true) }}>新增属性</Button>
        ]}
        params={{ reloadKey }}
      />
      <Modal title={editing ? '编辑属性' : '新增属性'} open={openEdit} footer={null} onCancel={() => setOpenEdit(false)} destroyOnHidden width={800}>
        <AttributeForm
          initialValues={editing || { isActive: true, isGlobal: true, sortOrder: 0 }}
          onSubmit={async (vals: AttributeFormValues) => {
            let success = false
            let msg = ''
            
            if (editing) {
              const res = await AttributesService.updateAttribute(editing.id, vals)
              success = res.success
              msg = res.message || ''
            } else {
              const res = await AttributesService.createAttribute(vals)
              success = res.success
              msg = res.message || ''
            }
            
            if (success) { 
              message.success('保存成功')
              setOpenEdit(false)
              setReloadKey((k) => k + 1) 
            } else {
              message.error(msg || '保存失败')
            }
          }}
        />
      </Modal>
    </>
  )
}

export default AttributeList
