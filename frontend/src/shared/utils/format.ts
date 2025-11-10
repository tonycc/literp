/**
 * 格式化工具函数
 */

/**
 * 格式化日期
 * @param date 日期字符串或Date对象
 * @param format 格式类型：'date' | 'datetime' | 'time'
 * @returns 格式化后的日期字符串
 */
export const formatDate = (
  date: string | Date | null | undefined,
  format: 'date' | 'datetime' | 'time' = 'date'
): string => {
  if (!date) return '-';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return '-';
    }

    switch (format) {
      case 'date':
        return dateObj.toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
      case 'datetime':
        return dateObj.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      case 'time':
        return dateObj.toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit'
        });
      default:
        return dateObj.toLocaleDateString('zh-CN');
    }
  } catch (error) {
    console.error('日期格式化错误:', error);
    return '-';
  }
};

/**
 * 格式化货币
 * @param value 数值
 * @param currency 货币符号，默认¥
 * @param precision 小数位数，默认2
 * @returns 格式化后的货币字符串
 */
export const formatCurrency = (
  value: number | null | undefined,
  currency: string = '¥',
  precision: number = 2
): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '-';
  }

  return `${currency}${value.toFixed(precision)}`;
};

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小字符串
 */
export const formatFileSize = (bytes: number | null | undefined): string => {
  if (bytes === null || bytes === undefined || bytes === 0) {
    return '0 B';
  }

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 格式化数字（添加千分位分隔符）
 * @param value 数值
 * @param precision 小数位数
 * @returns 格式化后的数字字符串
 */
export const formatNumber = (
  value: number | null | undefined,
  precision: number = 0
): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '-';
  }

  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  });
};

/**
 * 截断文本
 * @param text 原始文本
 * @param maxLength 最大长度
 * @param suffix 后缀，默认...
 * @returns 截断后的文本
 */
export const truncateText = (
  text: string | null | undefined,
  maxLength: number = 50,
  suffix: string = '...'
): string => {
  if (!text) return '-';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + suffix;
};

/**
 * 首字母大写
 * @param text 文本
 * @returns 首字母大写的文本
 */
export const capitalize = (text: string | null | undefined): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * 驼峰命名转短横线命名
 * @param text 驼峰命名字符串
 * @returns 短横线命名字符串
 */
export const camelToKebab = (text: string): string => {
  return text.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
};

/**
 * 短横线命名转驼峰命名
 * @param text 短横线命名字符串
 * @returns 驼峰命名字符串
 */
export const kebabToCamel = (text: string): string => {
  return text.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
};
