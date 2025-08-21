"use client"
import React, { useState } from 'react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { AlertTriangle, RefreshCw, Wifi, WifiOff, Server, Shield, Clock } from 'lucide-react'
import { ApiError, NetworkError, TimeoutError } from '../lib/api'

interface ErrorRecoveryProps {
  error: Error | ApiError | NetworkError | TimeoutError
  onRetry: () => void
  onReset?: () => void
  className?: string
}

export const ErrorRecovery: React.FC<ErrorRecoveryProps> = ({
  error,
  onRetry,
  onReset,
  className = ''
}) => {
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      onRetry()
    } finally {
      setIsRetrying(false)
    }
  }

  const getErrorIcon = () => {
    if (error instanceof NetworkError) return WifiOff
    if (error instanceof TimeoutError) return Clock
    if (error instanceof ApiError && error.statusCode === 401) return Shield
    if (error instanceof ApiError && error.statusCode >= 500) return Server
    return AlertTriangle
  }

  const getErrorMessage = () => {
    if (error instanceof NetworkError) {
      return {
        title: 'Connection Failed',
        message: 'Unable to connect to the server. Please check your internet connection.',
        suggestions: [
          'Check your internet connection',
          'Make sure the backend server is running',
          'Try refreshing the page'
        ]
      }
    }

    if (error instanceof TimeoutError) {
      return {
        title: 'Request Timeout',
        message: 'The request took too long to complete.',
        suggestions: [
          'Check your internet speed',
          'The server might be overloaded',
          'Try again in a few moments'
        ]
      }
    }

    if (error instanceof ApiError) {
      switch (error.statusCode) {
        case 401:
          return {
            title: 'Authentication Required',
            message: 'Please log in to continue.',
            suggestions: [
              'Click the login button',
              'Check if your session has expired',
              'Clear browser cache if issues persist'
            ]
          }
        case 403:
          return {
            title: 'Access Denied',
            message: "You don't have permission to perform this action.",
            suggestions: [
              'Make sure you own this agent',
              "Check if you're logged in with the correct account",
              'Contact support if you believe this is an error'
            ]
          }
        case 404:
          return {
            title: 'Not Found',
            message: 'The requested resource could not be found.',
            suggestions: [
              'The agent might have been deleted',
              'Check the URL is correct',
              'Try refreshing the agents list'
            ]
          }
        case 429:
          return {
            title: 'Too Many Requests',
            message: "You're sending requests too quickly.",
            suggestions: [
              'Wait a few seconds before trying again',
              'Avoid rapid clicking',
              'The limit will reset automatically'
            ]
          }
        case 500:
        case 502:
        case 503:
          return {
            title: 'Server Error',
            message: 'Something went wrong on our end.',
            suggestions: [
              'Try again in a few moments',
              'The issue is temporary',
              'Our team has been notified'
            ]
          }
        default:
          return {
            title: 'Request Failed',
            message: error.message,
            suggestions: [
              'Check your input data',
              'Try again with different parameters',
              'Contact support if the problem persists'
            ]
          }
      }
    }

    return {
      title: 'Something Went Wrong',
      message: error.message || 'An unexpected error occurred.',
      suggestions: [
        'Try refreshing the page',
        'Check your internet connection',
        'Contact support if the problem persists'
      ]
    }
  }

  const ErrorIcon = getErrorIcon()
  const errorInfo = getErrorMessage()

  return (
    <Card className={`p-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-full">
          <ErrorIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
            {errorInfo.title}
          </h3>
          <p className="text-red-700 dark:text-red-200 mb-4">
            {errorInfo.message}
          </p>
          <div className="mb-4">
            <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
              Suggestions:
            </p>
            <ul className="text-sm text-red-600 dark:text-red-300 space-y-1">
              {errorInfo.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-red-500 rounded-full" />
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </>
              )}
            </Button>
            {onReset && (
              <Button
                onClick={onReset}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>
      {error instanceof ApiError && error.details && (
        <details className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 rounded text-sm">
          <summary className="cursor-pointer font-medium text-red-800 dark:text-red-200">
            Technical Details
          </summary>
          <pre className="mt-2 text-red-600 dark:text-red-300 overflow-auto text-xs">
            {JSON.stringify(error.details, null, 2)}
          </pre>
        </details>
      )}
    </Card>
  )
}

// Specialized error components
export const NetworkErrorCard: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <Card className="p-8 text-center bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
    <WifiOff className="h-16 w-16 mx-auto mb-4 text-orange-500" />
    <h3 className="text-xl font-semibold text-orange-900 dark:text-orange-100 mb-2">
      Connection Lost
    </h3>
    <p className="text-orange-700 dark:text-orange-200 mb-4">
      Unable to connect to the server. Please check your internet connection.
    </p>
    <Button onClick={onRetry} className="bg-orange-600 hover:bg-orange-700 text-white">
      <Wifi className="h-4 w-4 mr-2" />
      Reconnect
    </Button>
  </Card>
)

export const AuthenticationErrorCard: React.FC<{ onLogin: () => void }> = ({ onLogin }) => (
  <Card className="p-8 text-center bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
    <Shield className="h-16 w-16 mx-auto mb-4 text-blue-500" />
    <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2">
      Authentication Required
    </h3>
    <p className="text-blue-700 dark:text-blue-200 mb-4">
      Please log in to access this feature.
    </p>
    <Button onClick={onLogin} className="bg-blue-600 hover:bg-blue-700 text-white">
      <Shield className="h-4 w-4 mr-2" />
      Log In
      </Button>
      </Card>)