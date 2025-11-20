import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'
import { render, waitFor } from '@testing-library/react'

vi.mock('../../../shared/services/unit.service', () => {
  return {
    unitService: {
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

import { unitService } from '../../services/unit.service'
import { useUnitOptions } from '../../hooks/useUnitOptions'
import React from 'react'

const TestComp: React.FC = () => {
  const { options, loading } = useUnitOptions({ isActive: true })
  return <div data-testid="state">{loading ? 'loading' : `count:${options.length}`}</div>
}

describe('useUnitOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('当服务报错时提示错误并保持选项为空', async () => {
    ;(unitService.getOptions as unknown as Mock).mockRejectedValueOnce(new Error('network'))
    const { getByTestId } = render(<TestComp />)
    await waitFor(() => {
      expect(getByTestId('state').textContent).toContain('count:')
    })
    expect(mockError).toHaveBeenCalled()
  })
})
