import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'

vi.mock('@/features/product/services/product.service', () => {
  return {
    ProductService: class {
      getProductOptions = vi.fn()
    },
  }
})

const mockError = vi.fn()
vi.mock('../../../shared/hooks', () => {
  return {
    useMessage: () => ({ error: mockError }),
  }
})

import { useProductOptions } from '../../hooks/useProductOptions'
import React from 'react'

const TestComp: React.FC = () => {
  const { options, loading } = useProductOptions({ activeOnly: true })
  return <div data-testid="state">{loading ? 'loading' : `count:${options.length}`}</div>
}

describe('useProductOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('当服务报错时提示错误并保持选项为空', async () => {
    const { getByTestId } = render(<TestComp />)
    await waitFor(() => {
      expect(getByTestId('state').textContent).toContain('count:')
    })
    expect(mockError).toHaveBeenCalled()
  })
})
