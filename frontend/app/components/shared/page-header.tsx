import React from 'react'
import { Badge } from '../ui/badge'

interface PageHeaderProps {
  badge?: {
    icon: React.ComponentType<{ className?: string }>
    text: string
  }
  title: string
  subtitle: string
  gradientFrom?: string
  gradientTo?: string
}

export function PageHeader({ 
  badge, 
  title, 
  subtitle, 
  gradientFrom = "primary", 
  gradientTo = "purple-500" 
}: PageHeaderProps) {
  return (
    <div className="text-center mb-12">
      {badge && (
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
          <badge.icon className="h-4 w-4" />
          {badge.text}
        </div>
      )}
      
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
        <span className="block">{title}</span>
        <span className={`block bg-gradient-to-r from-${gradientFrom} to-${gradientTo} bg-clip-text text-transparent`}>
          {subtitle}
        </span>
      </h1>
    </div>
  )
}