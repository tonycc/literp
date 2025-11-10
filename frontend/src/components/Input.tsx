/**
 * Input 组件
 * Input Component
 */

import React from 'react'

export interface InputProps {
  id?: string
  type?: 'text' | 'email' | 'password' | 'number'
  placeholder?: string
  defaultValue?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
  className?: string
  'aria-label'?: string
}

export const Input: React.FC<InputProps> = ({
  id,
  type = 'text',
  placeholder,
  defaultValue,
  value,
  onChange,
  disabled,
  className = '',
  'aria-label': ariaLabel,
}) => {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      defaultValue={defaultValue}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`input ${className}`}
      aria-label={ariaLabel}
    />
  )
}
