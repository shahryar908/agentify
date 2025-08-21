'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Send, Bot, User, Loader2, Calculator, Globe, Brain, Sparkles, Plus, MessageCircle, AlertCircle, Wifi, WifiOff, ArrowUp, ChevronDown, Zap, Star, Code, Search, LogOut, Settings, GraduationCap } from 'lucide-react'
import { apiClient, type AgentInfo, type ChatResponse, type StreamingChatChunk, ApiError, NetworkError, TimeoutError } from '../lib/api'
import { AgentLoading, LoadingSpinner, ChatSkeleton } from '../components/loading'
import { ErrorBoundary, SimpleErrorFallback } from '../components/error-boundary'
import { useAuth, ProtectedRoute } from '../contexts/auth-context'
import { ErrorRecovery, NetworkErrorCard, AuthenticationErrorCard } from '../components/error-recovery'
import Link from 'next/link'

interface Message {
  type: 'user' | 'agent' | 'streaming'
  content: string
  timestamp: string
  tools_used?: boolean
  streaming_complete?: boolean
  stream_data?: any
}

// Component to format agent responses with better structure
const FormattedAgentResponse: React.FC<{ content: string }> = ({ content }) => {
  // Check if content contains search results pattern
  const isSearchResults = content.includes('**Result') && content.includes('Source:')
  
  if (isSearchResults) {
    // Parse search results and format them nicely
    const parts = content.split('**Result')
    const intro = parts[0].trim()
    const results = parts.slice(1)
    
    return (
      <div>
        {intro && <p className="mb-4">{intro}</p>}
        <div className="space-y-4">
          {results.map((result, index) => {
            const lines = result.split('\n').filter(line => line.trim())
            if (lines.length < 3) return null
            
            // Extract title, source, description, URL
            const titleMatch = lines[0].match(/^\d+:\s*(.+)\*\*$/)
            const title = titleMatch ? titleMatch[1] : lines[0]
            
            let source = ''
            let description = ''
            let url = ''
            
            lines.forEach(line => {
              if (line.startsWith('Source:')) {
                source = line.replace('Source:', '').trim()
              } else if (line.startsWith('Description:')) {
                description = line.replace('Description:', '').trim()
              } else if (line.startsWith('URL:')) {
                url = line.replace('URL:', '').trim()
              }
            })
            
            return (
              <div key={index} className="search-result-card rounded-lg p-4">
                <h3 className="search-result-title">
                  {title}
                </h3>
                <p className="search-result-source">
                  📍 {source}
                </p>
                {description && (
                  <p className="search-result-description">
                    {description}
                  </p>
                )}
                {url && (
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="search-result-url"
                  >
                    🔗 {url}
                  </a>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
  
  // For other content types, format basic markdown-like patterns
  const formatContent = (text: string) => {
    // Split by double newlines to create paragraphs
    const paragraphs = text.split('\n\n').filter(p => p.trim())
    
    return paragraphs.map((paragraph, index) => {
      // Handle Sources section specially
      if (paragraph.startsWith('Sources:') || paragraph.includes('Sources:\n')) {
        const sourceLines = paragraph.split('\n').filter(line => line.trim())
        const sources = sourceLines.slice(1) // Skip "Sources:" line
        
        return (
          <div key={index} className="mt-6 pt-4 border-t border-border/30">
            <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Sources</h4>
            <div className="space-y-1">
              {sources.map((source, i) => (
                <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                  📰 {source}
                </p>
              ))}
            </div>
          </div>
        )
      }
      // Handle headers
      if (paragraph.startsWith('# ')) {
        return <h1 key={index} className="text-xl font-semibold mb-3 mt-6 first:mt-0">{paragraph.slice(2)}</h1>
      }
      if (paragraph.startsWith('## ')) {
        return <h2 key={index} className="text-lg font-semibold mb-2 mt-5 first:mt-0">{paragraph.slice(3)}</h2>
      }
      if (paragraph.startsWith('### ')) {
        return <h3 key={index} className="text-base font-semibold mb-2 mt-4 first:mt-0">{paragraph.slice(4)}</h3>
      }
      
      // Handle lists
      if (paragraph.includes('\n- ') || paragraph.includes('\n* ')) {
        const items = paragraph.split('\n').filter(line => line.startsWith('- ') || line.startsWith('* '))
        return (
          <ul key={index} className="list-disc list-inside space-y-1 mb-4">
            {items.map((item, i) => (
              <li key={i} className="leading-relaxed">{item.slice(2)}</li>
            ))}
          </ul>
        )
      }
      
      // Handle numbered lists
      if (/^\d+\./.test(paragraph.trim())) {
        const items = paragraph.split('\n').filter(line => /^\d+\./.test(line.trim()))
        return (
          <ol key={index} className="list-decimal list-inside space-y-1 mb-4">
            {items.map((item, i) => (
              <li key={i} className="leading-relaxed">{item.replace(/^\d+\.\s*/, '')}</li>
            ))}
          </ol>
        )
      }
      
      // Regular paragraphs with bold/italic formatting
      let formatted = paragraph
      // Bold: **text** or __text__
      formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      formatted = formatted.replace(/__(.*?)__/g, '<strong>$1</strong>')
      // Italic: *text* or _text_
      formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>')
      formatted = formatted.replace(/_(.*?)_/g, '<em>$1</em>')
      
      return (
        <p 
          key={index} 
          className="mb-4 leading-relaxed last:mb-0"
          dangerouslySetInnerHTML={{ __html: formatted }}
        />
      )
    })
  }
  
  return <div>{formatContent(content)}</div>
}

function ChatPageContent() {
  const { user, logout } = useAuth()
  const [agents, setAgents] = useState<AgentInfo[]>([])
  const [selectedAgent, setSelectedAgent] = useState<AgentInfo | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingAgent, setIsCreatingAgent] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [showAgentSelector, setShowAgentSelector] = useState(false)
  const [chatHistory, setChatHistory] = useState<Record<string, Message[]>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    fetchAgents()
    loadChatHistory()
    
    // Check online status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Save chat history before page unload
    const handleBeforeUnload = () => {
      saveChatHistory()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      saveChatHistory() // Save on component unmount
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadChatHistory = () => {
    try {
      const saved = localStorage.getItem(`chat_history_${user?.id}`)
      if (saved) {
        setChatHistory(JSON.parse(saved))
      }
    } catch (error) {
      console.warn('Failed to load chat history:', error)
    }
  }
  
  const saveChatHistory = () => {
    try {
      localStorage.setItem(`chat_history_${user?.id}`, JSON.stringify(chatHistory))
    } catch (error) {
      console.warn('Failed to save chat history:', error)
    }
  }
  
  // Load messages for selected agent
  useEffect(() => {
    if (selectedAgent?.id && chatHistory[selectedAgent.id]) {
      setMessages(chatHistory[selectedAgent.id])
    } else {
      setMessages([])
    }
  }, [selectedAgent, chatHistory])
  
  // Save messages when they change
  useEffect(() => {
    if (selectedAgent?.id && messages.length > 0) {
      setChatHistory(prev => ({
        ...prev,
        [selectedAgent.id]: messages
      }))
    }
  }, [messages, selectedAgent])

  const fetchAgents = async () => {
    try {
      setError(null)
      const agentsData = await apiClient.getAgents()
      
      // Filter to only keep unique agent types (latest one of each type)
      const uniqueAgents = agentsData.reduce((acc: AgentInfo[], current: AgentInfo) => {
        const existingIndex = acc.findIndex(agent => agent.agent_type === current.agent_type)
        if (existingIndex >= 0) {
          // Replace with current agent (assuming it's more recent)
          acc[existingIndex] = current
        } else {
          acc.push(current)
        }
        return acc
      }, [])
      
      // Ensure we have exactly the 4 agent types we want
      const desiredTypes = ['math', 'intelligent', 'autonomous', 'researcher']
      const filteredAgents = uniqueAgents.filter(agent => desiredTypes.includes(agent.agent_type))
      
      setAgents(filteredAgents)
      
      // If we don't have all 4 agent types, create missing ones
      if (filteredAgents.length < 4) {
        console.log(`Only ${filteredAgents.length}/4 agents found, creating missing agents`)
        await createDemoAgents()
        return // createDemoAgents will call fetchAgents again
      }
      
      // Check if currently selected agent still exists, if not select a new one
      if (selectedAgent && !filteredAgents.find(agent => agent.id === selectedAgent.id)) {
        console.log('Currently selected agent no longer exists, selecting new agent')
        setSelectedAgent(filteredAgents[0] || null)
      }
      
      // Auto-select first agent if available and none selected
      if (filteredAgents.length > 0 && !selectedAgent) {
        setSelectedAgent(filteredAgents[0])
      }
    } catch (error) {
      console.error('Error fetching agents:', error)
      setError(error as Error)
      
      // Try to create demo agents if backend is not available
      if (error instanceof NetworkError || error instanceof ApiError) {
        await createDemoAgents()
      }
    } finally {
      setIsInitialLoading(false)
    }
  }

  const createDemoAgents = async () => {
    try {
      setIsCreatingAgent(true)
      
      // Check if we already have the 3 unique agents
      const currentAgents = await apiClient.getAgents()
      const uniqueTypes = new Set(currentAgents.map(agent => agent.agent_type))
      
      // Only create missing agent types
      const promises = []
      
      if (!uniqueTypes.has('math')) {
        promises.push(apiClient.createSampleAgent())
      }
      
      if (!uniqueTypes.has('intelligent')) {
        promises.push(apiClient.createIntelligentAgent())
      }
      
      if (!uniqueTypes.has('autonomous')) {
        promises.push(apiClient.createAutonomousAgent())
      }
      
      if (!uniqueTypes.has('researcher')) {
        promises.push(apiClient.createResearcherAgent())
      }
      
      if (promises.length > 0) {
        await Promise.all(promises)
      }
      
      await fetchAgents()
    } catch (error) {
      console.error('Error creating demo agents:', error)
      // Fallback to static agents - only the 4 unique types
      const fallbackAgents = [
        {
          id: 'math-agent',
          name: 'Math Agent',
          description: 'Specialized in mathematical calculations and operations with 6 tools',
          agent_type: 'math',
          tools: ['add_numbers', 'subtract_numbers', 'multiply_numbers', 'divide_numbers', 'calculate_power', 'calculate_sqrt']
        },
        {
          id: 'intelligent-agent',
          name: 'Intelligent Web Agent',
          description: 'Advanced agent with web search, weather, and news capabilities',
          agent_type: 'intelligent',
          tools: ['search_web', 'get_weather', 'get_latest_news', 'get_datetime']
        },
        {
          id: 'autonomous-agent',
          name: 'Autonomous Research Agent',
          description: 'Advanced autonomous agent with Google Custom Search API and multi-step reasoning capabilities',
          agent_type: 'autonomous',
          tools: ['search_web', 'get_weather', 'analyze_weather', 'check_air_quality', 'get_time', 'search_news']
        },
        {
          id: 'researcher-agent',
          name: 'AI Research Agent',
          description: 'Academic research agent that searches papers, analyzes literature, and generates research proposals with PDF output',
          agent_type: 'researcher',
          tools: ['research_topic', 'search_papers']
        }
      ]
      setAgents(fallbackAgents)
      if (!selectedAgent) setSelectedAgent(fallbackAgents[0])
    } finally {
      setIsCreatingAgent(false)
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedAgent || isLoading) return

    const userMessage: Message = {
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    const currentMessage = inputMessage
    setInputMessage('')
    setIsLoading(true)
    setError(null)

    try {
      // Check if this is a researcher agent and the message suggests research
      const isResearchQuery = selectedAgent.agent_type === 'researcher' && 
        (currentMessage.toLowerCase().includes('research') || 
         currentMessage.toLowerCase().includes('papers') ||
         currentMessage.toLowerCase().includes('study') ||
         currentMessage.toLowerCase().includes('analyze') ||
         currentMessage.toLowerCase().includes('find papers'))

      if (isResearchQuery) {
        // Use streaming for research queries
        let streamingMessage: Message = {
          type: 'streaming',
          content: '',
          timestamp: new Date().toISOString(),
          streaming_complete: false
        }
        
        setMessages(prev => [...prev, streamingMessage])
        let messageIndex = -1

        try {
          for await (const chunk of apiClient.chatWithAgentStream(selectedAgent.id, currentMessage)) {
            if (chunk.content) {
              setMessages(prev => {
                const newMessages = [...prev]
                if (messageIndex === -1) {
                  messageIndex = newMessages.length - 1
                }
                
                if (chunk.type === 'content') {
                  // Append to existing content
                  newMessages[messageIndex] = {
                    ...newMessages[messageIndex],
                    content: newMessages[messageIndex].content + chunk.content
                  }
                } else {
                  // For progress, success, error types, append as new lines
                  const separator = newMessages[messageIndex].content ? '\n\n' : ''
                  newMessages[messageIndex] = {
                    ...newMessages[messageIndex],
                    content: newMessages[messageIndex].content + separator + chunk.content
                  }
                }
                
                return newMessages
              })
            }
          }
          
          // Mark streaming as complete
          setMessages(prev => {
            const newMessages = [...prev]
            if (messageIndex >= 0) {
              newMessages[messageIndex] = {
                ...newMessages[messageIndex],
                type: 'agent',
                streaming_complete: true
              }
            }
            return newMessages
          })
          
        } catch (streamError) {
          // Fallback to regular chat if streaming fails
          console.log('Streaming failed, falling back to regular chat:', streamError)
          const response = await apiClient.chatWithAgent(selectedAgent.id, currentMessage)
          
          setMessages(prev => {
            const newMessages = [...prev]
            if (messageIndex >= 0) {
              newMessages[messageIndex] = {
                type: 'agent',
                content: response.response,
                timestamp: new Date().toISOString(),
                tools_used: response.tools_used,
                streaming_complete: true
              }
            }
            return newMessages
          })
        }
      } else {
        // Use regular chat for non-research queries
        const response = await apiClient.chatWithAgent(selectedAgent.id, currentMessage)
        
        const agentMessage: Message = {
          type: 'agent',
          content: response.response,
          timestamp: new Date().toISOString(),
          tools_used: response.tools_used,
        }
        setMessages(prev => [...prev, agentMessage])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      
      let errorMessage: Message
      
      if (error instanceof ApiError && error.statusCode === 404) {
        // Agent not found - refresh agents list
        await fetchAgents()
        errorMessage = {
          type: 'agent',
          content: 'The selected agent is no longer available. I\'ve refreshed the agents list. Please select an agent from the dropdown above and try again.',
          timestamp: new Date().toISOString(),
        }
      } else if (error instanceof ApiError && error.statusCode === 401) {
        errorMessage = {
          type: 'agent',
          content: 'Your session has expired. Please log in again to continue chatting.',
          timestamp: new Date().toISOString(),
        }
      } else if (error instanceof NetworkError) {
        errorMessage = {
          type: 'agent',
          content: 'Connection failed. Please check your internet connection and try again.',
          timestamp: new Date().toISOString(),
        }
      } else if (error instanceof TimeoutError) {
        errorMessage = {
          type: 'agent',
          content: 'Request timed out. The agent might be busy. Please try again.',
          timestamp: new Date().toISOString(),
        }
      } else {
        errorMessage = {
          type: 'agent',
          content: 'I encountered an error processing your message. Please try again or contact support if the problem persists.',
          timestamp: new Date().toISOString(),
        }
      }
      
      setMessages(prev => [...prev, errorMessage])
      setError(error as Error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'math':
        return Calculator
      case 'intelligent':
        return Globe
      case 'autonomous':
        return Brain
      case 'researcher':
        return GraduationCap
      default:
        return Bot
    }
  }

  const getAgentColor = (type: string) => {
    switch (type) {
      case 'math':
        return 'from-blue-500 to-cyan-500'
      case 'intelligent':
        return 'from-green-500 to-emerald-500'
      case 'autonomous':
        return 'from-purple-500 to-pink-500'
      case 'researcher':
        return 'from-orange-500 to-red-500'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  // Helper function to get ordered and unique agents
  const getOrderedUniqueAgents = (agentList: AgentInfo[]) => {
    const agentTypeOrder = ['math', 'intelligent', 'autonomous', 'researcher']
    const uniqueAgentMap = new Map<string, AgentInfo>()
    
    // Keep only the latest agent of each type
    agentList.forEach(agent => {
      if (agentTypeOrder.includes(agent.agent_type)) {
        uniqueAgentMap.set(agent.agent_type, agent)
      }
    })
    
    // Return agents in the desired order
    return agentTypeOrder
      .map(type => uniqueAgentMap.get(type))
      .filter((agent): agent is AgentInfo => agent !== undefined)
  }

  const clearChat = () => {
    setMessages([])
  }

  // Show loading state on initial load
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="relative container py-8">
          <AgentLoading agentType="intelligent" />
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary fallback={SimpleErrorFallback}>
      <div className="flex h-screen bg-gradient-to-br from-background via-background to-muted/10">
        {/* Main Chat Area - Full Screen Like ChatGPT */}
        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="flex items-center justify-between p-4 border-b border-border/30 bg-gradient-to-r from-background/95 via-background/98 to-muted/5 backdrop-blur-md shadow-sm">
            <div className="flex items-center gap-3">
              {selectedAgent && (
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${getAgentColor(selectedAgent.agent_type)} flex items-center justify-center shadow-lg ring-2 ring-white/20 dark:ring-black/20`}>
                  {React.createElement(getAgentIcon(selectedAgent.agent_type), { className: "h-4 w-4 text-white" })}
                </div>
              )}
              <div>
                <h1 className="text-lg font-semibold">
                  {selectedAgent ? selectedAgent.name : 'AI Agents Chat'}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {selectedAgent ? selectedAgent.description : 'Choose an agent to start chatting'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* User Info */}
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <span>Welcome, {user?.full_name || user?.username}</span>
              </div>
              
              {/* Agent Selector Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAgentSelector(!showAgentSelector)}
                className="flex items-center gap-2 bg-gradient-to-r from-background to-muted/30 border-border/50 hover:border-primary/30 hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/10 transition-all duration-200"
              >
                <Brain className="h-4 w-4" />
                Agents
                <ChevronDown className={`h-3 w-3 transition-transform ${showAgentSelector ? 'rotate-180' : ''}`} />
              </Button>
              
              {/* Settings */}
              <Link href="/auth">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
              
              {/* Logout */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={logout}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
              
              {/* Connection Status */}
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs ${
                !isOnline ? 'bg-red-100 text-red-700' : error ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
              }`}>
                {!isOnline ? <WifiOff className="h-3 w-3" /> : <Wifi className="h-3 w-3" />}
                {!isOnline ? 'Offline' : error ? 'Issues' : 'Connected'}
              </div>
            </div>
          </header>

          {/* Agent Selector Dropdown */}
          {showAgentSelector && (
            <div className="border-b border-border/30 bg-gradient-to-br from-muted/30 via-muted/20 to-background/50 backdrop-blur-sm p-4">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Select an AI Agent
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {getOrderedUniqueAgents(agents).map((agent) => {
                    const IconComponent = getAgentIcon(agent.agent_type)
                    const isSelected = selectedAgent?.id === agent.id
                    
                    return (
                      <Card
                        key={agent.id}
                        className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 ${
                          isSelected ? 'ring-2 ring-primary bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20' : 'hover:bg-gradient-to-br hover:from-muted/50 hover:to-background/80 hover:border-primary/20'
                        }`}
                        onClick={() => {
                          setSelectedAgent(agent)
                          setShowAgentSelector(false)
                          setTimeout(() => inputRef.current?.focus(), 100)
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAgentColor(agent.agent_type)} flex items-center justify-center shadow-lg ring-2 ring-white/20 dark:ring-black/20`}>
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{agent.name}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2">{agent.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {agent.agent_type}
                              </Badge>
                              <span className="text-xs text-primary">{agent.tools.length} tools</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
                
                {getOrderedUniqueAgents(agents).length === 0 && (
                  <div className="text-center py-8">
                    <Button onClick={createDemoAgents} disabled={isCreatingAgent} className="mx-auto">
                      <Plus className="h-4 w-4 mr-2" />
                      {isCreatingAgent ? 'Creating...' : 'Create Demo Agents'}
                    </Button>
                  </div>
                )}
                
                {getOrderedUniqueAgents(agents).length > 0 && getOrderedUniqueAgents(agents).length < 4 && (
                  <div className="text-center py-4 mt-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                      {4 - getOrderedUniqueAgents(agents).length} agent(s) missing
                    </p>
                    <Button onClick={createDemoAgents} disabled={isCreatingAgent} size="sm" variant="outline">
                      <Plus className="h-3 w-3 mr-1" />
                      {isCreatingAgent ? 'Creating...' : 'Complete Setup'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Recovery */}
          {error && (
            <div className="p-4 border-b border-border/20">
              <div className="max-w-4xl mx-auto">
                <ErrorRecovery 
                  error={error}
                  onRetry={() => {
                    setError(null)
                    fetchAgents()
                  }}
                  onReset={() => {
                    setError(null)
                    setMessages([])
                    setSelectedAgent(null)
                  }}
                />
              </div>
            </div>
          )}

          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto p-4 space-y-6">
              {/* Welcome State */}
              {messages.length === 0 && (
                <div className="text-center py-12">
                  {selectedAgent ? (
                    <div className="space-y-6">
                      <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${getAgentColor(selectedAgent.agent_type)} flex items-center justify-center mx-auto shadow-2xl ring-4 ring-white/20 dark:ring-black/20 animate-pulse`}>
                        {React.createElement(getAgentIcon(selectedAgent.agent_type), { className: "h-10 w-10 text-white" })}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold mb-2">Hello! I'm {selectedAgent.name}</h2>
                        <p className="text-muted-foreground max-w-md mx-auto mb-6">{selectedAgent.description}</p>
                      </div>
                      
                      {/* Suggested Questions */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
                        {selectedAgent.agent_type === 'math' && (
                          <>
                            <Card className="p-4 hover:bg-gradient-to-br hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-950/30 dark:hover:to-cyan-950/30 cursor-pointer transition-all duration-300 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800" onClick={() => {
                              setInputMessage("Calculate 15 * 24")
                              setTimeout(() => inputRef.current?.focus(), 100)
                            }}>
                              <Calculator className="h-5 w-5 text-blue-500 mb-2" />
                              <p className="text-sm font-medium">Math Problems</p>
                              <p className="text-xs text-muted-foreground">Calculate 15 × 24</p>
                            </Card>
                            <Card className="p-4 hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-950/30 dark:hover:to-pink-950/30 cursor-pointer transition-all duration-300 hover:shadow-md hover:border-purple-200 dark:hover:border-purple-800" onClick={() => {
                              setInputMessage("What's the square root of 144?")
                              setTimeout(() => inputRef.current?.focus(), 100)
                            }}>
                              <Code className="h-5 w-5 text-purple-500 mb-2" />
                              <p className="text-sm font-medium">Square Roots</p>
                              <p className="text-xs text-muted-foreground">√144 = ?</p>
                            </Card>
                            <Card className="p-4 hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-950/30 dark:hover:to-emerald-950/30 cursor-pointer transition-all duration-300 hover:shadow-md hover:border-green-200 dark:hover:border-green-800" onClick={() => {
                              setInputMessage("Add 25 and 37")
                              setTimeout(() => inputRef.current?.focus(), 100)
                            }}>
                              <Plus className="h-5 w-5 text-green-500 mb-2" />
                              <p className="text-sm font-medium">Basic Operations</p>
                              <p className="text-xs text-muted-foreground">25 + 37</p>
                            </Card>
                          </>
                        )}
                        {selectedAgent.agent_type === 'intelligent' && (
                          <>
                            <Card className="p-4 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-950/30 dark:hover:to-indigo-950/30 cursor-pointer transition-all duration-300 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800" onClick={() => {
                              setInputMessage("What's the weather in Tokyo?")
                              setTimeout(() => inputRef.current?.focus(), 100)
                            }}>
                              <Globe className="h-5 w-5 text-blue-500 mb-2" />
                              <p className="text-sm font-medium">Weather Info</p>
                              <p className="text-xs text-muted-foreground">Tokyo weather</p>
                            </Card>
                            <Card className="p-4 hover:bg-gradient-to-br hover:from-purple-50 hover:to-violet-50 dark:hover:from-purple-950/30 dark:hover:to-violet-950/30 cursor-pointer transition-all duration-300 hover:shadow-md hover:border-purple-200 dark:hover:border-purple-800" onClick={() => {
                              setInputMessage("Search for latest AI news")
                              setTimeout(() => inputRef.current?.focus(), 100)
                            }}>
                              <Search className="h-5 w-5 text-purple-500 mb-2" />
                              <p className="text-sm font-medium">Web Search</p>
                              <p className="text-xs text-muted-foreground">Latest AI news</p>
                            </Card>
                            <Card className="p-4 hover:bg-gradient-to-br hover:from-green-50 hover:to-teal-50 dark:hover:from-green-950/30 dark:hover:to-teal-950/30 cursor-pointer transition-all duration-300 hover:shadow-md hover:border-green-200 dark:hover:border-green-800" onClick={() => {
                              setInputMessage("Tell me about today's headlines")
                              setTimeout(() => inputRef.current?.focus(), 100)
                            }}>
                              <MessageCircle className="h-5 w-5 text-green-500 mb-2" />
                              <p className="text-sm font-medium">News Headlines</p>
                              <p className="text-xs text-muted-foreground">Today's news</p>
                            </Card>
                          </>
                        )}
                        {selectedAgent.agent_type === 'autonomous' && (
                          <>
                            <Card className="p-4 hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-950/30 dark:hover:to-pink-950/30 cursor-pointer transition-all duration-300 hover:shadow-md hover:border-purple-200 dark:hover:border-purple-800" onClick={() => {
                              setInputMessage("Help me plan a project")
                              setTimeout(() => inputRef.current?.focus(), 100)
                            }}>
                              <Brain className="h-5 w-5 text-purple-500 mb-2" />
                              <p className="text-sm font-medium">Project Planning</p>
                              <p className="text-xs text-muted-foreground">Strategic thinking</p>
                            </Card>
                            <Card className="p-4 hover:bg-gradient-to-br hover:from-yellow-50 hover:to-amber-50 dark:hover:from-yellow-950/30 dark:hover:to-amber-950/30 cursor-pointer transition-all duration-300 hover:shadow-md hover:border-yellow-200 dark:hover:border-yellow-800" onClick={() => {
                              setInputMessage("Analyze this business idea")
                              setTimeout(() => inputRef.current?.focus(), 100)
                            }}>
                              <Star className="h-5 w-5 text-yellow-500 mb-2" />
                              <p className="text-sm font-medium">Analysis</p>
                              <p className="text-xs text-muted-foreground">Deep insights</p>
                            </Card>
                            <Card className="p-4 hover:bg-gradient-to-br hover:from-orange-50 hover:to-red-50 dark:hover:from-orange-950/30 dark:hover:to-red-950/30 cursor-pointer transition-all duration-300 hover:shadow-md hover:border-orange-200 dark:hover:border-orange-800" onClick={() => {
                              setInputMessage("What should I consider for launching a startup?")
                              setTimeout(() => inputRef.current?.focus(), 100)
                            }}>
                              <Zap className="h-5 w-5 text-orange-500 mb-2" />
                              <p className="text-sm font-medium">Research</p>
                              <p className="text-xs text-muted-foreground">Comprehensive research</p>
                            </Card>
                          </>
                        )}
                        {selectedAgent.agent_type === 'researcher' && (
                          <>
                            <Card className="p-4 hover:bg-gradient-to-br hover:from-orange-50 hover:to-red-50 dark:hover:from-orange-950/30 dark:hover:to-red-950/30 cursor-pointer transition-all duration-300 hover:shadow-md hover:border-orange-200 dark:hover:border-orange-800" onClick={() => {
                              setInputMessage("Research machine learning algorithms")
                              setTimeout(() => inputRef.current?.focus(), 100)
                            }}>
                              <GraduationCap className="h-5 w-5 text-orange-500 mb-2" />
                              <p className="text-sm font-medium">Full Research</p>
                              <p className="text-xs text-muted-foreground">Complete research workflow</p>
                            </Card>
                            <Card className="p-4 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-950/30 dark:hover:to-indigo-950/30 cursor-pointer transition-all duration-300 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800" onClick={() => {
                              setInputMessage("Find papers on neural networks")
                              setTimeout(() => inputRef.current?.focus(), 100)
                            }}>
                              <Search className="h-5 w-5 text-blue-500 mb-2" />
                              <p className="text-sm font-medium">Paper Search</p>
                              <p className="text-xs text-muted-foreground">Find academic papers</p>
                            </Card>
                            <Card className="p-4 hover:bg-gradient-to-br hover:from-purple-50 hover:to-violet-50 dark:hover:from-purple-950/30 dark:hover:to-violet-950/30 cursor-pointer transition-all duration-300 hover:shadow-md hover:border-purple-200 dark:hover:border-purple-800" onClick={() => {
                              setInputMessage("Analyze literature on artificial intelligence")
                              setTimeout(() => inputRef.current?.focus(), 100)
                            }}>
                              <Code className="h-5 w-5 text-purple-500 mb-2" />
                              <p className="text-sm font-medium">Literature Analysis</p>
                              <p className="text-xs text-muted-foreground">Academic analysis</p>
                            </Card>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Bot className="h-16 w-16 mx-auto text-muted-foreground" />
                      <div>
                        <h2 className="text-2xl font-bold mb-2">Welcome to AI Agents Chat</h2>
                        <p className="text-muted-foreground max-w-md mx-auto mb-4">
                          Choose an AI agent above to start your conversation. Each agent has unique capabilities and tools.
                        </p>
                        <Button onClick={() => setShowAgentSelector(true)} size="lg">
                          <Sparkles className="h-4 w-4 mr-2" />
                          Choose an Agent
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Chat Messages */}
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-4 animate-message-fade-in ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : selectedAgent 
                        ? `bg-gradient-to-br ${getAgentColor(selectedAgent.agent_type)}`
                        : 'bg-muted'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      selectedAgent ? 
                        React.createElement(getAgentIcon(selectedAgent.agent_type), { className: "h-4 w-4 text-white" }) : 
                        <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className={`max-w-4xl ${message.type === 'user' ? 'ml-auto' : 'mr-auto'}`}>
                    <div className={`px-6 py-4 ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-2xl shadow-lg'
                        : 'bg-transparent'
                    }`}>
                      <div className={`${
                        message.type === 'user' 
                          ? 'text-sm leading-relaxed whitespace-pre-wrap font-medium' 
                          : 'prose-chat'
                      }`}>
                        {message.type === 'agent' ? (
                          <FormattedAgentResponse content={message.content} />
                        ) : (
                          message.content
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1 px-1">
                      <p className="text-xs text-muted-foreground">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                      {message.tools_used && (
                        <Badge variant="secondary" className="text-xs">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Tools Used
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading State */}
              {isLoading && (
                <div className="flex gap-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    selectedAgent ? `bg-gradient-to-br ${getAgentColor(selectedAgent.agent_type)}` : 'bg-muted'
                  }`}>
                    {selectedAgent ? 
                      React.createElement(getAgentIcon(selectedAgent.agent_type), { className: "h-4 w-4 text-white" }) : 
                      <Bot className="h-4 w-4 text-white" />
                    }
                  </div>
                  <div className="bg-transparent px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <div className="h-2 w-2 bg-primary rounded-full animate-typing-dots"></div>
                        <div className="h-2 w-2 bg-primary rounded-full animate-typing-dots" style={{animationDelay: '0.2s'}}></div>
                        <div className="h-2 w-2 bg-primary rounded-full animate-typing-dots" style={{animationDelay: '0.4s'}}></div>
                      </div>
                      <span className="text-[15px] text-muted-foreground font-normal animate-pulse">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area - Fixed at Bottom */}
          <div className="border-t border-border/30 p-4 bg-gradient-to-r from-background/95 via-background to-muted/5 backdrop-blur-md">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={selectedAgent ? `Message ${selectedAgent.name}...` : 'Choose an agent first...'}
                    disabled={!selectedAgent || isLoading}
                    className="w-full resize-none border border-border/50 rounded-2xl px-4 py-3 pr-12 bg-gradient-to-r from-background to-muted/10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 focus:bg-background disabled:opacity-50 max-h-32 transition-all duration-200 shadow-sm hover:shadow-md"
                    rows={1}
                    style={{ minHeight: '48px' }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement
                      target.style.height = 'auto'
                      target.style.height = Math.min(target.scrollHeight, 128) + 'px'
                    }}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!selectedAgent || !inputMessage.trim() || isLoading}
                    size="sm"
                    className="absolute right-2 bottom-2 w-8 h-8 p-0 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowUp className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Press Enter to send • Shift+Enter for new line
              </p>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

// Export with authentication protection
export default function ChatPage() {
  return (
    <ProtectedRoute fallback={
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <AuthenticationErrorCard onLogin={() => window.location.href = '/auth'} />
      </div>
    }>
      <ChatPageContent />
    </ProtectedRoute>
  )
}