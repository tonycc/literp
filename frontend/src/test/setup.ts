/**
 * 前端测试环境设置
 * Frontend Test Setup
 */

import '@testing-library/jest-dom'
import { vi } from 'vitest'

// 模拟 window.matchMedia
Object.defineProperty(globalThis.window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// 模拟 ResizeObserver
Object.defineProperty(globalThis, 'ResizeObserver', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
})

// 模拟 IntersectionObserver
Object.defineProperty(globalThis, 'IntersectionObserver', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
})

// 模拟 URL.createObjectURL
Object.defineProperty(globalThis, 'URL', {
  writable: true,
  value: {
    createObjectURL: vi.fn(() => 'mock-url'),
    revokeObjectURL: vi.fn(),
  },
})

// 忽略未实现的 Web API
Object.defineProperty(globalThis, 'fetch', { writable: true, value: vi.fn() })
vi.spyOn(console, 'warn').mockImplementation(() => {})
