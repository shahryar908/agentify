'use client'

import React from 'react'
import { Loader2, Brain, Zap, Sparkles } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  )
}

interface LoadingCardProps {
  title?: string
  description?: string
  className?: string
}

export function LoadingCard({ 
  title = 'Loading...', 
  description = 'Please wait while we process your request',
  className = '' 
}: LoadingCardProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <LoadingSpinner size="lg" className="text-primary" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full animate-pulse" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-sm">{description}</p>
    </div>
  )
}

export function LoadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-muted rounded ${className}`} />
  )
}

interface ChatLoadingProps {
  message?: string
}

export function ChatLoading({ message = 'AI is thinking...' }: ChatLoadingProps) {
  return (
    <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
      <div className="flex gap-1">
        <div className="h-2 w-2 bg-primary rounded-full animate-bounce" />
        <div className="h-2 w-2 bg-primary rounded-full animate-bounce delay-100" />
        <div className="h-2 w-2 bg-primary rounded-full animate-bounce delay-200" />
      </div>
      <span className="text-sm text-muted-foreground">{message}</span>
    </div>
  )
}

interface AgentLoadingProps {
  agentType?: 'math' | 'intelligent' | 'autonomous'
}

export function AgentLoading({ agentType = 'intelligent' }: AgentLoadingProps) {
  const getIcon = () => {
    switch (agentType) {
      case 'math':
        return Brain
      case 'intelligent':
        return Zap
      case 'autonomous':
        return Sparkles
      default:
        return Brain
    }
  }

  const Icon = getIcon()

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center animate-pulse">
          <Icon className="h-10 w-10 text-primary" />
        </div>
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-500 rounded-2xl blur opacity-25 animate-pulse" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Setting up your agent...</h3>
      <p className="text-muted-foreground mb-4">
        We&apos;re configuring the {agentType} agent with all its capabilities.
      </p>
      <div className="flex items-center gap-2 text-sm text-primary">
        <LoadingSpinner size="sm" />
        <span>This usually takes a few seconds</span>
      </div>
    </div>
  )
}

interface PageLoadingProps {
  title?: string
  description?: string
}

export function PageLoading({ 
  title = 'Loading page...', 
  description = 'Please wait while we load the content' 
}: PageLoadingProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
      <div className="text-center max-w-md">
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
            <div className="relative">
              <LoadingSpinner size="lg" className="text-primary" />
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
            </div>
          </div>
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-500 rounded-3xl blur opacity-25 animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold mb-3">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

// Skeleton components for different layouts
export function CardSkeleton() {
  return (
    <div className="p-6 border rounded-xl bg-card">
      <div className="space-y-4">
        <LoadingSkeleton className="h-4 w-3/4" />
        <LoadingSkeleton className="h-4 w-1/2" />
        <LoadingSkeleton className="h-8 w-full" />
        <div className="flex gap-2">
          <LoadingSkeleton className="h-6 w-16" />
          <LoadingSkeleton className="h-6 w-20" />
        </div>
      </div>
    </div>
  )
}

export function ChatSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className={`flex gap-4 ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}>
          <LoadingSkeleton className="w-10 h-10 rounded-full flex-shrink-0" />
          <div className="flex-1 max-w-xs">
            <LoadingSkeleton className="h-16 w-full rounded-2xl" />
          </div>
        </div>
      ))}
    </div>
  )
}