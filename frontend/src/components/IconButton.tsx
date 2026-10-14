import type { ReactNode } from 'react'

interface IconButtonProps {
  label: string
  onClick?: () => void
  disabled?: boolean
  variant?: 'default' | 'danger'
  type?: 'button' | 'submit'
  children: ReactNode
}

export function IconButton({
  label,
  onClick,
  disabled,
  variant = 'default',
  type = 'button',
  children,
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={`icon-btn ${variant === 'danger' ? 'icon-btn-danger' : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      data-tooltip={label}
    >
      {children}
    </button>
  )
}
