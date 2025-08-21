'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { useAuth } from '../contexts/auth-context'
import { Bot, Mail, User, Lock, Eye, EyeOff, Sparkles, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface LoginData {
  email: string
  password: string
}

interface RegisterData {
  email: string
  username: string
  password: string
  confirmPassword: string
  full_name: string
}

export default function AuthPage() {
  const router = useRouter()
  const { login, register, isLoading } = useAuth()
  
  const [loginData, setLoginData] = useState<LoginData>({
    email: '',
    password: ''
  })
  
  const [registerData, setRegisterData] = useState<RegisterData>({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    full_name: ''
  })
  
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    try {
      await login({
        email: loginData.email,
        password: loginData.password
      })
      setSuccess('Login successful! Redirecting...')
      setTimeout(() => {
        router.push('/chat')
      }, 1000)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed')
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (registerData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }
    
    try {
      await register({
        email: registerData.email,
        username: registerData.username,
        password: registerData.password,
        full_name: registerData.full_name
      })
      setSuccess('Registration successful! Redirecting...')
      setTimeout(() => {
        router.push('/chat')
      }, 1000)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed')
    }
  }

  const handleDemoLogin = async () => {
    setError('')
    setSuccess('')
    
    try {
      await login({
        email: 'demo@example.com',
        password: 'demo123'
      })
      setSuccess('Demo login successful! Redirecting...')
      setTimeout(() => {
        router.push('/chat')
      }, 1000)
    } catch {
      setError('Demo login failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/5 flex items-center justify-center p-4 relative">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/[0.03] via-purple-500/[0.03] to-pink-500/[0.03]" />
      </div>
      
      <div className="relative w-full max-w-lg">
        {/* Back to Home Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all duration-300 mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Home</span>
        </Link>
        
        <Card className="p-10 border-0 shadow-2xl shadow-black/10 bg-gradient-to-br from-white via-white to-gray-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/50 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/[0.02] via-purple-500/[0.02] to-pink-500/[0.02]" />
          <div className="relative">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-500/30">
                <Bot className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-gray-900 via-blue-700 to-purple-700 dark:from-white dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent">
                Welcome Back
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Sign in to access your AI assistant platform and unlock powerful capabilities
              </p>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-8 p-4 bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="mb-8 p-4 bg-green-50 dark:bg-green-950/30 border-2 border-green-200 dark:border-green-800 rounded-xl">
                <p className="text-green-700 dark:text-green-300 font-medium">{success}</p>
              </div>
            )}

            {/* Demo Login Button */}
            <div className="mb-8">
              <Button 
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                <Sparkles className="h-5 w-5 mr-3" />
                Try Demo (No Registration Required)
              </Button>
              <p className="text-center text-sm text-muted-foreground mt-3">
                Instant access - no personal information needed
              </p>
            </div>
            
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/40"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-background text-muted-foreground font-medium">Or continue with account</span>
              </div>
            </div>

            {/* Auth Tabs */}
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/30 p-1 rounded-xl">
                <TabsTrigger value="login" className="h-10 font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-md rounded-lg">Sign In</TabsTrigger>
                <TabsTrigger value="register" className="h-10 font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-md rounded-lg">Sign Up</TabsTrigger>
              </TabsList>
            
              <TabsContent value="login" className="mt-6">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="login-email" className="text-base font-semibold text-gray-900 dark:text-white">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email address"
                        value={loginData.email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                        className="h-14 pl-12 text-base border-2 border-gray-200 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-500 bg-white/50 dark:bg-gray-900/50 rounded-xl"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="login-password" className="text-base font-semibold text-gray-900 dark:text-white">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                        className="h-14 pl-12 pr-12 text-base border-2 border-gray-200 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-500 bg-white/50 dark:bg-gray-900/50 rounded-xl"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-300 hover:-translate-y-0.5 mt-8" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In to Your Account'}
                  </Button>
                </form>
              </TabsContent>
            
              <TabsContent value="register" className="mt-6">
                <form onSubmit={handleRegister} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-3">
                      <Label htmlFor="register-name" className="text-base font-semibold text-gray-900 dark:text-white">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="register-name"
                          type="text"
                          placeholder="Your full name"
                          value={registerData.full_name}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, full_name: e.target.value }))}
                          className="h-14 pl-12 text-base border-2 border-gray-200 dark:border-gray-700 focus:border-purple-400 dark:focus:border-purple-500 bg-white/50 dark:bg-gray-900/50 rounded-xl"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="register-username" className="text-base font-semibold text-gray-900 dark:text-white">Username</Label>
                      <div className="relative">
                        <User className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="register-username"
                          type="text"
                          placeholder="Choose username"
                          value={registerData.username}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, username: e.target.value }))}
                          className="h-14 pl-12 text-base border-2 border-gray-200 dark:border-gray-700 focus:border-purple-400 dark:focus:border-purple-500 bg-white/50 dark:bg-gray-900/50 rounded-xl"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="register-email" className="text-base font-semibold text-gray-900 dark:text-white">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="Enter your email address"
                        value={registerData.email}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                        className="h-14 pl-12 text-base border-2 border-gray-200 dark:border-gray-700 focus:border-purple-400 dark:focus:border-purple-500 bg-white/50 dark:bg-gray-900/50 rounded-xl"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-3">
                      <Label htmlFor="register-password" className="text-base font-semibold text-gray-900 dark:text-white">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="register-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create password"
                          value={registerData.password}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                          className="h-14 pl-12 pr-12 text-base border-2 border-gray-200 dark:border-gray-700 focus:border-purple-400 dark:focus:border-purple-500 bg-white/50 dark:bg-gray-900/50 rounded-xl"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="register-confirm-password" className="text-base font-semibold text-gray-900 dark:text-white">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="register-confirm-password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm password"
                          value={registerData.confirmPassword}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="h-14 pl-12 pr-12 text-base border-2 border-gray-200 dark:border-gray-700 focus:border-purple-400 dark:focus:border-purple-500 bg-white/50 dark:bg-gray-900/50 rounded-xl"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-0.5 mt-8" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Your Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            
            {/* Footer */}
            <div className="mt-10 text-center">
              <p className="text-muted-foreground leading-relaxed">
                By continuing, you agree to our{' '}
                <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium">
                  Terms of Service
                </span>{' '}
                and{' '}
                <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium">
                  Privacy Policy
                </span>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}