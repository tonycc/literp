/**
 * API 性能监控中间件
 * API Performance Monitoring Middleware
 *
 * 监控 API 响应时间、吞吐量、错误率
 */

import { Request, Response, NextFunction } from 'express'
import { v4 as uuidv4 } from 'uuid'

// 性能指标接口
export interface PerformanceMetrics {
  requestId: string
  method: string
  url: string
  statusCode: number
  responseTime: number // ms
  timestamp: Date
  userAgent?: string
  ip?: string
}

// 性能统计
class PerformanceStats {
  private metrics: PerformanceMetrics[] = []
  private slowQueries: PerformanceMetrics[] = []
  private maxMetrics = 1000 // 保留最近 1000 条记录

  addMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric)

    // 保留慢查询 (>200ms)
    if (metric.responseTime > 200) {
      this.slowQueries.push(metric)
      if (this.slowQueries.length > 100) {
        this.slowQueries.shift()
      }
    }

    // 限制总记录数
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift()
    }
  }

  getMetrics() {
    return this.metrics
  }

  getSlowQueries() {
    return this.slowQueries
  }

  getStats() {
    if (this.metrics.length === 0) {
      return {
        total: 0,
        averageResponseTime: 0,
        p50: 0,
        p90: 0,
        p95: 0,
        p99: 0,
        errorRate: 0,
      }
    }

    const responseTimes = this.metrics.map((m) => m.responseTime).sort((a, b) => a - b)
    const errors = this.metrics.filter((m) => m.statusCode >= 400)

    return {
      total: this.metrics.length,
      averageResponseTime: responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length,
      p50: responseTimes[Math.floor(responseTimes.length * 0.5)],
      p90: responseTimes[Math.floor(responseTimes.length * 0.9)],
      p95: responseTimes[Math.floor(responseTimes.length * 0.95)],
      p99: responseTimes[Math.floor(responseTimes.length * 0.99)],
      errorRate: (errors.length / this.metrics.length) * 100,
    }
  }

  getMetricsByRoute() {
    const routeStats = new Map<string, {
      count: number
      averageTime: number
      errors: number
    }>()

    this.metrics.forEach((metric) => {
      const route = metric.url
      const existing = routeStats.get(route) || { count: 0, averageTime: 0, errors: 0 }

      existing.count++
      existing.averageTime = (existing.averageTime + metric.responseTime) / 2
      if (metric.statusCode >= 400) {
        existing.errors++
      }

      routeStats.set(route, existing)
    })

    return Object.fromEntries(routeStats)
  }
}

// 全局性能统计实例
export const performanceStats = new PerformanceStats()

/**
 * 性能监控中间件
 */
export function performanceMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestId = req.headers['x-request-id'] as string || uuidv4()
  const startTime = Date.now()

  // 在响应头中添加请求 ID
  res.setHeader('X-Request-ID', requestId)

  // 记录请求开始
  performance.mark(`request-${requestId}-start`)

  // 响应完成时记录性能
  res.on('finish', () => {
    const responseTime = Date.now() - startTime
    const metric: PerformanceMetrics = {
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime,
      timestamp: new Date(),
      userAgent: req.get('user-agent'),
      ip: req.ip,
    }

    performance.mark(`request-${requestId}-end`)
    performance.measure(
      `request-${requestId}`,
      `request-${requestId}-start`,
      `request-${requestId}-end`
    )

    // 添加到统计
    performanceStats.addMetric(metric)

    // 慢查询警告
    if (responseTime > 200) {
      console.warn(
        `🐌 Slow API: ${req.method} ${req.originalUrl} took ${responseTime}ms (Status: ${res.statusCode})`
      )
    }

    // 错误警告
    if (res.statusCode >= 500) {
      console.error(
        `❌ Server Error: ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Time: ${responseTime}ms`
      )
    }
  })

  next()
}

/**
 * 获取性能统计
 */
export function getPerformanceStats(req: Request, res: Response) {
  const stats = performanceStats.getStats()
  const routeStats = performanceStats.getMetricsByRoute()
  const slowQueries = performanceStats.getSlowQueries().slice(-10) // 最近 10 个慢查询

  res.json({
    success: true,
    data: {
      overview: stats,
      routes: routeStats,
      slowQueries: slowQueries.map((q) => ({
        method: q.method,
        url: q.url,
        responseTime: q.responseTime,
        statusCode: q.statusCode,
        timestamp: q.timestamp,
      })),
    },
  })
}

/**
 * 内存使用监控
 */
export function getMemoryUsage(req: Request, res: Response) {
  const memUsage = process.memoryUsage()

  res.json({
    success: true,
    data: {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)} MB`,
      arrayBuffers: `${Math.round((memUsage as any).arrayBuffers / 1024 / 1024 || 0)} MB`,
    },
  })
}

/**
 * CPU 使用监控
 */
export function getCpuUsage(req: Request, res: Response) {
  const startUsage = process.cpuUsage()
  const startTime = Date.now()

  // 等待一段时间以收集 CPU 使用数据
  setTimeout(() => {
    const endUsage = process.cpuUsage(startUsage)
    const endTime = Date.now()

    const cpuPercent = (endUsage.user + endUsage.system) / ((endTime - startTime) * 1000) * 100

    res.json({
      success: true,
      data: {
        user: endUsage.user,
        system: endUsage.system,
        cpuPercent: Math.round(cpuPercent * 100) / 100,
      },
    })
  }, 100)
}

/**
 * 健康检查端点
 */
export function healthCheck(req: Request, res: Response) {
  const health = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
  }

  res.json(health)
}

/**
 * 性能测试端点
 */
export function performanceTest(req: Request, res: Response) {
  const iterations = parseInt(req.query.iterations as string) || 1000
  const startTime = Date.now()

  // 执行 CPU 密集型任务
  for (let i = 0; i < iterations; i++) {
    Math.sqrt(i) * Math.random()
  }

  const duration = Date.now() - startTime

  res.json({
    success: true,
    data: {
      iterations,
      duration,
      averageTime: duration / iterations,
    },
  })
}
