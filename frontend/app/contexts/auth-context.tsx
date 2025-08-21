'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// User type
export interface User {
  id: number
  email: string
  username: string
  full_name?: string
  is_active: boolean
  created_at: string
  last_login?: string
}

// Auth context type
interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

// Login credentials type
interface LoginCredentials {
  email?: string
  username?: string
  password: string
}

// Register data type
interface RegisterData {
  email: string
  username: string
  password: string
  full_name?: string
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = user !== null

  // Initialize auth state
  useEffect(() => {
    // Check for stored user data
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user')
        const storedToken = localStorage.getItem('auth_token')
        
        if (storedUser && storedToken) {
          const userData = JSON.parse(storedUser)
          setUser(userData)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        // Clear invalid stored data
        localStorage.removeItem('user')
        localStorage.removeItem('auth_token')
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  // Login function
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true)
    
    try {
      // For demo purposes, we'll create a mock user
      // In production, this would make an API call to authenticate
      const mockUser: User = {
        id: 1,
        email: credentials.email || 'demo@example.com',
        username: credentials.username || 'demo_user',
        full_name: 'Demo User',
        is_active: true,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      }

      // Store user data and token
      localStorage.setItem('user', JSON.stringify(mockUser))
      localStorage.setItem('auth_token', 'demo_token_' + Date.now())
      
      setUser(mockUser)
    } catch (error) {
      console.error('Login error:', error)
      throw new Error('Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  // Register function
  const register = async (userData: RegisterData) => {
    setIsLoading(true)
    
    try {
      // For demo purposes, we'll create a mock user
      // In production, this would make an API call to register
      const mockUser: User = {
        id: Math.floor(Math.random() * 1000),
        email: userData.email,
        username: userData.username,
        full_name: userData.full_name,
        is_active: true,
        created_at: new Date().toISOString()
      }

      // Store user data and token
      localStorage.setItem('user', JSON.stringify(mockUser))
      localStorage.setItem('auth_token', 'demo_token_' + Date.now())
      
      setUser(mockUser)
    } catch (error) {
      console.error('Register error:', error)
      throw new Error('Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    try {
      localStorage.removeItem('user')
      localStorage.removeItem('auth_token')
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Update user function
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Protected route component
interface ProtectedRouteProps {
  children: ReactNode
  fallback?: ReactNode
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-muted-foreground mb-6">You need to sign in to access this page.</p>
          <a 
            href="/auth" 
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
          >
            Sign In
          </a>
        </div>
      </div>
    )
  }

  return <>{children}</>
}