/**
 * Web Vitals 性能监控工具
 * Web Vitals Performance Monitoring
 *
 * 监控并报告 Core Web Vitals 指标
 */

export interface WebVitalsMetrics {
  // Core Web Vitals
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift

  // 其他重要指标
  fcp?: number // First Contentful Paint
  ttfb?: number // Time to First Byte
  dcl?: number // DOM Content Loaded
  load?: number // Load Event
}

// 性能指标阈值
export const PERFORMANCE_THRESHOLDS = {
  LCP_GOOD: 2500, // 2.5秒
  LCP_POOR: 4000,
  FID_GOOD: 100, // 100ms
  FID_POOR: 300,
  CLS_GOOD: 0.1,
  CLS_POOR: 0.25,
  FCP_GOOD: 1800, // 1.8秒
  FCP_POOR: 3000,
  TTFB_GOOD: 800, // 800ms
  TTFB_POOR: 1800,
}

// 性能等级
export type PerformanceRating = 'good' | 'needs-improvement' | 'poor'

/**
 * 评估性能指标
 */
function getRating(value: number, thresholds: { good: number; poor: number }): PerformanceRating {
  if (value <= thresholds.good) {
    return 'good'
  } else if (value <= thresholds.poor) {
    return 'needs-improvement'
  } else {
    return 'poor'
  }
}

/**
 * 格式化字节大小
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * 获取网络信息
 */
function getNetworkInfo() {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return null
  }

  const connection = (navigator as any).connection
  return {
    downlink: connection.downlink, // Mbps
    effectiveType: connection.effectiveType, // 4g, 3g, 2g, slow-2g
    rtt: connection.rtt, // ms
    saveData: connection.saveData, // boolean
  }
}

/**
 * 记录性能指标
 */
function logMetric(name: string, value: number, rating: PerformanceRating) {
  const emoji = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌'
  console.log(`${emoji} ${name}: ${Math.round(value)}ms (${rating})`)
}

/**
 * 报告性能指标到服务器
 */
async function reportToServer(metrics: WebVitalsMetrics) {
  try {
    await fetch('/api/performance/metrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...metrics,
        url: window.location.href,
        userAgent: navigator.userAgent,
        network: getNetworkInfo(),
        timestamp: new Date().toISOString(),
      }),
      keepalive: true, // 即使页面卸载也发送
    })
  } catch (error) {
    // 静默失败，不影响用户体验
    console.debug('Failed to report performance metrics:', error)
  }
}

/**
 * 监控 Core Web Vitals
 */
export function measurePerformance() {
  if (typeof window === 'undefined' || !window.PerformanceObserver) {
    return
  }

  const metrics: WebVitalsMetrics = {}

  // 监控 LCP
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1] as any
      metrics.lcp = lastEntry.startTime

      const rating = getRating(metrics.lcp, {
        good: PERFORMANCE_THRESHOLDS.LCP_GOOD,
        poor: PERFORMANCE_THRESHOLDS.LCP_POOR,
      })
      logMetric('LCP', metrics.lcp, rating)
    })
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
  } catch (error) {
    console.debug('LCP observer not supported:', error)
  }

  // 监控 FID
  try {
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        metrics.fid = entry.processingStart - entry.startTime

        const rating = getRating(metrics.fid, {
          good: PERFORMANCE_THRESHOLDS.FID_GOOD,
          poor: PERFORMANCE_THRESHOLDS.FID_POOR,
        })
        logMetric('FID', metrics.fid, rating)
      })
    })
    fidObserver.observe({ type: 'first-input', buffered: true })
  } catch (error) {
    console.debug('FID observer not supported:', error)
  }

  // 监控 CLS
  try {
    let clsValue = 0
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
          metrics.cls = clsValue

          const rating = getRating(metrics.cls, {
            good: PERFORMANCE_THRESHOLDS.CLS_GOOD,
            poor: PERFORMANCE_THRESHOLDS.CLS_POOR,
          })
          logMetric('CLS', metrics.cls, rating)
        }
      })
    })
    clsObserver.observe({ type: 'layout-shift', buffered: true })
  } catch (error) {
    console.debug('CLS observer not supported:', error)
  }

  // 监控 FCP
  try {
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          metrics.fcp = entry.startTime

          const rating = getRating(metrics.fcp, {
            good: PERFORMANCE_THRESHOLDS.FCP_GOOD,
            poor: PERFORMANCE_THRESHOLDS.FCP_POOR,
          })
          logMetric('FCP', metrics.fcp, rating)
        }
      })
    })
    fcpObserver.observe({ type: 'paint', buffered: true })
  } catch (error) {
    console.debug('FCP observer not supported:', error)
  }

  // 页面卸载时报告所有指标
  window.addEventListener('pagehide', () => {
    reportToServer(metrics)
  })

  // 页面隐藏时也报告
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      reportToServer(metrics)
    }
  })
}

/**
 * 测量自定义性能
 */
export function measureCustom(name: string) {
  return {
    start: () => {
      performance.mark(`${name}-start`)
    },
    end: () => {
      performance.mark(`${name}-end`)
      performance.measure(name, `${name}-start`, `${name}-end`)

      const measure = performance.getEntriesByName(name, 'measure')[0]
      console.log(`⏱️  ${name}: ${Math.round(measure.duration)}ms`)

      return measure.duration
    },
  }
}

/**
 * 获取资源加载性能
 */
export function getResourceTiming() {
  const resources = performance.getEntriesByType('resource')
  return resources.map((resource) => ({
    name: resource.name,
    type: (resource as any).initiatorType,
    size: (resource as any).transferSize,
    duration: resource.duration,
    cached: (resource as any).transferSize === 0,
  }))
}

/**
 * 生成性能报告
 */
export function generatePerformanceReport() {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  const resources = getResourceTiming()

  return {
    // 导航时序
    dns: navigation.domainLookupEnd - navigation.domainLookupStart,
    tcp: navigation.connectEnd - navigation.connectStart,
    tls: navigation.connectEnd - navigation.secureConnectionStart,
    ttfb: navigation.responseStart - navigation.requestStart,
    download: navigation.responseEnd - navigation.responseStart,
    dom: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    load: navigation.loadEventEnd - navigation.loadEventStart,

    // 资源统计
    resources: {
      total: resources.length,
      byType: resources.reduce((acc, r) => {
        acc[r.type] = (acc[r.type] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      totalSize: resources.reduce((sum, r) => sum + (r.size || 0), 0),
      totalDuration: resources.reduce((sum, r) => sum + r.duration, 0),
    },

    // 网络信息
    network: getNetworkInfo(),
  }
}

/**
 * 导出性能数据
 */
export function exportPerformanceData() {
  const report = generatePerformanceReport()
  const blob = new Blob([JSON.stringify(report, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `performance-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}
