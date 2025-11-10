/**
 * useOperation Hook
 * Operation data management hook
 */

import { useState, useCallback } from 'react'

export interface Operation {
  id: string
  name: string
  code: string
  type: 'create' | 'update' | 'delete' | 'view'
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface UseOperationReturn {
  operations: Operation[]
  loading: boolean
  error: string | null
  fetchOperations: () => Promise<void>
  createOperation: (data: Omit<Operation, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateOperation: (id: string, data: Partial<Operation>) => Promise<void>
  deleteOperation: (id: string) => Promise<void>
  setFilter: (filter: { type?: string }) => void
  filteredOperations: Operation[]
  filter: { type?: string }
}

export function useOperation(): UseOperationReturn {
  const [operations, setOperations] = useState<Operation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<{ type?: string }>({})

  const fetchOperations = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/operations')
      const data = await response.json()
      if (data.success) {
        setOperations(data.data)
      } else {
        setError(data.error || 'Failed to fetch operations')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  const createOperation = useCallback(async (data: Omit<Operation, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      if (result.success) {
        setOperations((prev) => [...prev, result.data])
      } else {
        setError(result.error || 'Failed to create operation')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  const updateOperation = useCallback(async (id: string, data: Partial<Operation>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/operations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      if (result.success) {
        setOperations((prev) =>
          prev.map((op) => (op.id === id ? { ...op, ...result.data } : op))
        )
      } else {
        setError(result.error || 'Failed to update operation')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteOperation = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/operations/${id}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      if (result.success) {
        setOperations((prev) => prev.filter((op) => op.id !== id))
      } else {
        setError(result.error || 'Failed to delete operation')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  const filteredOperations = operations.filter((op) => {
    if (filter.type && op.type !== filter.type) {
      return false
    }
    return true
  })

  return {
    operations,
    loading,
    error,
    fetchOperations,
    createOperation,
    updateOperation,
    deleteOperation,
    setFilter,
    filteredOperations,
    filter,
  }
}
