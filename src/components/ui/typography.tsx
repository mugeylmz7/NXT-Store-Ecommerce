import React from 'react'

interface TypographyProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'muted'
  children: React.ReactNode
  className?: string
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  children,
  className = '',
}) => {
  switch (variant) {
    case 'h1':
      return <h1 className={`text-3xl font-bold tracking-tight ${className}`}>{children}</h1>
    case 'h2':
      return <h2 className={`text-2xl font-semibold tracking-tight ${className}`}>{children}</h2>
    case 'h3':
      return <h3 className={`text-xl font-medium ${className}`}>{children}</h3>
    case 'muted':
      return <p className={`text-sm text-gray-500 ${className}`}>{children}</p>
    case 'body':
    default:
      return <p className={`text-base text-gray-800 ${className}`}>{children}</p>
  }
}