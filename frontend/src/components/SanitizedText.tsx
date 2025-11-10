/**
 * SanitizedText 组件
 * Sanitized Text Component
 *
 * 安全的文本渲染组件，自动转义 XSS
 */

import React from 'react'

export interface SanitizedTextProps {
  text: string
  className?: string
}

/**
 * 简单的 HTML 转义
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

export const SanitizedText: React.FC<SanitizedTextProps> = ({ text, className = '' }) => {
  // 转义 HTML 特殊字符
  const safeText = escapeHtml(text)

  return <span className={className} dangerouslySetInnerHTML={{ __html: safeText }} />
}
