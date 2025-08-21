'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { cn } from '../../lib/utils'

interface A11yContextType {
  reducedMotion: boolean
  highContrast: boolean
  fontSize: 'small' | 'medium' | 'large'
  screenReaderOnly: boolean
  keyboardNavigation: boolean
}

const A11yContext = createContext<A11yContextType | undefined>(undefined)

export const useAccessibility = () => {
  const context = useContext(A11yContext)
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider')
  }
  return context
}

interface AccessibilityProviderProps {
  children: React.ReactNode
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [reducedMotion, setReducedMotion] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [screenReaderOnly, setScreenReaderOnly] = useState(false)
  const [keyboardNavigation, setKeyboardNavigation] = useState(false)

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(motionQuery.matches)
    motionQuery.addEventListener('change', (e) => setReducedMotion(e.matches))

    const contrastQuery = window.matchMedia('(prefers-contrast: high)')
    setHighContrast(contrastQuery.matches)
    contrastQuery.addEventListener('change', (e) => setHighContrast(e.matches))

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setKeyboardNavigation(true)
      }
    }

    const handleMouseDown = () => {
      setKeyboardNavigation(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)

    const checkScreenReader = () => {
      const hasScreenReader = (
        window.navigator.userAgent.includes('NVDA') ||
        window.navigator.userAgent.includes('JAWS') ||
        (window.speechSynthesis?.getVoices().length || 0) > 0
      )
      setScreenReaderOnly(hasScreenReader)
    }

    checkScreenReader()

    return () => {
      motionQuery.removeEventListener('change', (e) => setReducedMotion(e.matches))
      contrastQuery.removeEventListener('change', (e) => setHighContrast(e.matches))
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  const value = {
    reducedMotion,
    highContrast,
    fontSize,
    screenReaderOnly,
    keyboardNavigation
  }

  return (
    <A11yContext.Provider value={value}>
      {children}
    </A11yContext.Provider>
  )
}

export const ScreenReaderOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <span className="sr-only">
      {children}
    </span>
  )
}