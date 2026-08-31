import type { CSSProperties, ReactNode } from 'react'

/** Weiße Karte mit Standard-Radius und -Schatten */
export default function Card({
  children,
  className = '',
  style,
}: {
  children: ReactNode
  className?: string
  style?: CSSProperties
}) {
  return (
    <div className={`rounded-card bg-surface-card shadow-card ${className}`} style={style}>
      {children}
    </div>
  )
}
