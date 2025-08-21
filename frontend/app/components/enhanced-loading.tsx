'use client'

import React, { useState, useEffect } from 'react'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '../lib/utils'

// ================= Progress Bar =================
interface ProgressBarProps {
  value: number
  max?: number
  className?: string
  showPercentage?: boolean
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  className,
  showPercentage = false
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className={cn('w-full bg-muted rounded-full h-2', className)}>
      <div
        className="bg-gradient-to-r from-primary to-purple-500 h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${percentage}%` }}
      />
      {showPercentage && (
        <div className="text-xs text-center mt-1">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  )
}

// ================= Step-by-Step Loading =================
interface Step {
  id: string
  label: string
  status: 'pending' | 'loading' | 'completed' | 'error'
  description?: string
}

interface StepLoadingProps {
  steps: Step[]
  className?: string
}

export const StepLoading: React.FC<StepLoadingProps> = ({ steps, className }) => {
  return (
    <div className={cn('space-y-4', className)}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1

        return (
          <div key={step.id} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center',
                  {
                    'bg-muted text-muted-foreground': step.status === 'pending',
                    'bg-primary text-primary-foreground': step.status === 'loading',
                    'bg-green-500 text-white': step.status === 'completed',
                    'bg-red-500 text-white': step.status === 'error'
                  }
                )}
              >
                {step.status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
                {step.status === 'completed' && <CheckCircle className="w-4 h-4" />}
                {step.status === 'error' && <AlertCircle className="w-4 h-4" />}
                {step.status === 'pending' && (
                  <span className="text-xs font-medium">{index + 1}</span>
                )}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    'w-px h-8 mt-2',
                    step.status === 'completed' ? 'bg-green-300' : 'bg-muted'
                  )}
                />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4
                className={cn('font-medium', {
                  'text-muted-foreground': step.status === 'pending',
                  'text-foreground': step.status === 'loading',
                  'text-green-700 dark:text-green-300': step.status === 'completed',
                  'text-red-700 dark:text-red-300': step.status === 'error'
                })}
              >
                {step.label}
              </h4>
              {step.description && (
                <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ================= Animated Loading =================
interface AnimatedLoadingProps {
  type?: 'dots' | 'pulse' | 'wave' | 'bars'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const AnimatedLoading: React.FC<AnimatedLoadingProps> = ({
  type = 'dots',
  size = 'md',
  className
}) => {
  const sizeClasses: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  }

  const gapClasses: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'gap-1',
    md: 'gap-2',
    lg: 'gap-3'
  }

  if (type === 'dots') {
    return (
      <div className={cn('flex items-center', gapClasses[size], className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn('bg-primary rounded-full animate-bounce', sizeClasses[size])}
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    )
  }

  if (type === 'pulse') {
    return (
      <div className={cn('animate-pulse', className)}>
        <div
          className={cn(
            'bg-primary rounded-full',
            size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8'
          )}
        />
      </div>
    )
  }

  if (type === 'wave') {
    return (
      <div className={cn('flex items-end', gapClasses[size], className)}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn('bg-primary animate-pulse', sizeClasses[size])}
            style={{
              animationDelay: `${i * 0.1}s`,
              height: `${0.5 + Math.sin(i) * 0.3}rem`
            }}
          />
        ))}
      </div>
    )
  }

  if (type === 'bars') {
    return (
      <div className={cn('flex items-center', gapClasses[size], className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="bg-primary animate-pulse"
            style={{
              width: size === 'sm' ? '2px' : size === 'md' ? '3px' : '4px',
              height: size === 'sm' ? '12px' : size === 'md' ? '16px' : '20px',
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>
    )
  }

  return null
}

// ================= Smart Loading =================
interface SmartLoadingProps {
  isLoading: boolean
  loadingStages?: {
    initial: string
    extended: string
    timeout: string
  }
  timeouts?: {
    extended: number
    timeout: number
  }
  children?: React.ReactNode
}

export const SmartLoading: React.FC<SmartLoadingProps> = ({
  isLoading,
  loadingStages = {
    initial: 'Loading...',
    extended: 'This is taking longer than usual...',
    timeout: 'Something might be wrong. Please try refreshing.'
  },
  timeouts = {
    extended: 5000, // 5 seconds
    timeout: 15000 // 15 seconds
  },
  children
}) => {
  const [stage, setStage] = useState<'initial' | 'extended' | 'timeout'>('initial')

  useEffect(() => {
    if (!isLoading) {
      setStage('initial')
      return
    }

    const extendedTimer = setTimeout(() => {
      setStage('extended')
    }, timeouts.extended)

    const timeoutTimer = setTimeout(() => {
      setStage('timeout')
    }, timeouts.timeout)

    return () => {
      clearTimeout(extendedTimer)
      clearTimeout(timeoutTimer)
    }
  }, [isLoading, timeouts.extended, timeouts.timeout])

  if (!isLoading) {
    return <>{children}</>
  }

  const getMessage = () => {
    switch (stage) {
      case 'extended':
        return loadingStages.extended
      case 'timeout':
        return loadingStages.timeout
      default:
        return loadingStages.initial
    }
  }

  const getVariant = () => {
    switch (stage) {
      case 'extended':
        return 'text-yellow-600'
      case 'timeout':
        return 'text-red-600'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <AnimatedLoading type="dots" size="lg" />
      <p className={cn('text-sm text-center', getVariant())}>{getMessage()}</p>
      {stage === 'timeout' && (
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Refresh Page
        </button>
      )}
    </div>
  )
}
