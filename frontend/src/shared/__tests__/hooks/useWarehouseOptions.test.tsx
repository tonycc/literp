import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'
import { render, waitFor } from '@testing-library/react'

vi.mock('../../../shared/services/warehouse.service', () => {
  return {
    warehouseService: {
      getOptions: vi.fn(),
    },
  }
})

const mockError = vi.fn()
vi.mock('../../../shared/hooks', () => {
  return {
    useMessage: () => ({ error: mockError }),
  }
})

import { warehouseService } from '../../services/warehouse.service'
import { useWarehouseOptions } from '../../hooks/useWarehouseOptions'
import React from 'react'

const TestComp: React.FC = () => {
  const { options, loading } = useWarehouseOptions({ isActive: true })
  return <div data-testid="state">{loading ? 'loading' : `count:${options.length}`}</div>
}

describe('useWarehouseOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('当服务报错时提示错误并保持选项为空', async () => {
    ;(warehouseService.getOptions as unknown as Mock).mockRejectedValueOnce(new Error('network'))
    const { getByTestId } = render(<TestComp />)
    await waitFor(() => {
      expect(getByTestId('state').textContent).toContain('count:')
    })
    expect(mockError).toHaveBeenCalled()
  })
})