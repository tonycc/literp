import { useState } from 'react'
import type { Supplier, CreateSupplierData, UpdateSupplierData } from '@zyerp/shared'
import { supplierService } from '../services/supplier.service'
import { useMessage } from '@/shared/hooks/useMessage'
import { useModal } from '@/shared/hooks/useModal'

export const useSupplier = () => {
  const [selectedItems, setSelectedItems] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(false)
  const message = useMessage()
  const modal = useModal()

  const handleCreate = async (data: CreateSupplierData) => {
    setLoading(true)
    try {
      await supplierService.create(data)
      message.success('创建成功')
    } catch {
      message.error('创建失败')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (id: string, data: UpdateSupplierData) => {
    setLoading(true)
    try {
      await supplierService.update(id, data)
      message.success('更新成功')
    } catch {
      message.error('更新失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    modal.confirm({
      title: '确认删除',
      okType: 'danger',
      onOk: async () => {
        setLoading(true)
        try {
          await supplierService.delete(id)
          message.success('删除成功')
        } catch {
          message.error('删除失败')
        } finally {
          setLoading(false)
        }
      },
    })
  }

  const handleRefresh = async () => {}

  return {
    selectedItems,
    loading,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleRefresh,
    setSelectedItems,
    setLoading,
  }
}