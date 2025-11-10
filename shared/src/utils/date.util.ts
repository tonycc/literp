/**
 * 日期工具函数
 * Date Utilities
 */

/**
 * 格式化日期
 * @param date 日期或日期字符串
 * @param format 格式化模式，默认为 'YYYY-MM-DD'
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | string, format: string = 'YYYY-MM-DD'): string {
  const d = new Date(date)
  if (isNaN(d.getTime())) {
    return ''
  }

  // 相对时间格式化
  if (format === 'relative') {
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))

    if (diffMins < 1) {
      return '刚刚'
    } else if (diffMins < 60) {
      return `${diffMins}分钟前`
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60)
      return `${hours}小时前`
    } else {
      const days = Math.floor(diffMins / 1440)
      return `${days}天前`
    }
  }

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 解析日期字符串
 * @param dateStr 日期字符串
 * @returns 解析后的 Date 对象或 null
 */
export function parseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) {
    return null
  }

  const date = new Date(dateStr)
  return isNaN(date.getTime()) ? null : date
}

/**
 * 验证日期是否有效
 * @param date 日期对象
 * @returns 是否有效
 */
export function isValidDate(date: Date | null | undefined): boolean {
  return date instanceof Date && !isNaN(date.getTime())
}

/**
 * 增加天数
 * @param date 基准日期
 * @param days 要增加的天数（负数表示减少）
 * @returns 新的日期对象
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * 计算两个日期之间的天数差
 * @param date1 第一个日期
 * @param date2 第二个日期
 * @returns 天数差（可为负数）
 */
export function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000
  return Math.round((date2.getTime() - date1.getTime()) / oneDay)
}
