'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Send, Bot, User, Loader2, Calculator, Globe, Brain, Sparkles, Plus, MessageCircle, AlertCircle, Wifi, WifiOff, ArrowUp, ChevronDown, Zap, Star, Code, Search } from 'lucide-react'
import { apiClient, type AgentInfo, type ChatResponse } from '../lib/api'
import { AgentLoading, LoadingSpinner, ChatSkeleton } from '../components/loading'
import { ErrorBoundary, SimpleErrorFallback } from '../components/error-boundary'

interface Message {
  type: 'user' | 'agent'
  content: string
  timestamp: string
  tools_used?: boolean
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

export default function ChatPage() {
  const [agents, setAgents] = useState<AgentInfo[]>([])
  const [selectedAgent, setSelectedAgent] = useState<AgentInfo | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingAgent, setIsCreatingAgent] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [showAgentSelector, setShowAgentSelector] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    fetchAgents()
    
    // Check online status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchAgents = async () => {
    try {
      setConnectionError(null)
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
      
      // Ensure we have exactly the 3 agent types we want
      const desiredTypes = ['math', 'intelligent', 'autonomous']
      const filteredAgents = uniqueAgents.filter(agent => desiredTypes.includes(agent.agent_type))
      
      setAgents(filteredAgents)
      
      // If we don't have all 3 agent types, create missing ones
      if (filteredAgents.length < 3) {
        console.log(`Only ${filteredAgents.length}/3 agents found, creating missing agents`)
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
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      if (errorMessage.includes('timeout') || errorMessage.includes('NetworkError')) {
        setConnectionError('Connection timeout. Please check your internet connection.')
      } else if (errorMessage.includes('Failed to fetch')) {
        setConnectionError('Cannot connect to server. Make sure the backend is running on port 8002.')
      } else {
        setConnectionError(errorMessage)
      }
      
      // Create demo agents if backend is not available
      await createDemoAgents()
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
      
      if (promises.length > 0) {
        await Promise.all(promises)
      }
      
      await fetchAgents()
    } catch (error) {
      console.error('Error creating demo agents:', error)
      // Fallback to static agents - only the 3 unique types
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

    try {
      const response = await apiClient.chatWithAgent(selectedAgent.id, currentMessage)
      
      const agentMessage: Message = {
        type: 'agent',
        content: response.response,
        timestamp: new Date().toISOString(),
        tools_used: response.tools_used,
      }
      setMessages(prev => [...prev, agentMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      
      const errorString = error instanceof Error ? error.message : 'Unknown error'
      
      // Check if it's an "Agent not found" error
      if (errorString.includes('Agent not found') || errorString.includes('404')) {
        console.log('Agent not found - refreshing agents list')
        // Refresh agents and try to select a new one
        await fetchAgents()
        
        const errorMessage: Message = {
          type: 'agent',
          content: 'The selected agent is no longer available. I\'ve refreshed the agents list. Please select an agent from the dropdown above and try again.',
          timestamp: new Date().toISOString(),
        }
        setMessages(prev => [...prev, errorMessage])
      } else {
        const errorMessage: Message = {
          type: 'agent',
          content: 'I apologize, but I encountered an error processing your message. This might be because the backend service is not running. Please make sure the FastAPI server is running on port 8002.',
          timestamp: new Date().toISOString(),
        }
        setMessages(prev => [...prev, errorMessage])
      }
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
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  // Helper function to get ordered and unique agents
  const getOrderedUniqueAgents = (agentList: AgentInfo[]) => {
    const agentTypeOrder = ['math', 'intelligent', 'autonomous']
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
      <div className="flex h-screen bg-background">
        {/* Main Chat Area - Full Screen Like ChatGPT */}
        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="flex items-center justify-between p-4 border-b border-border/20 bg-background/95 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              {selectedAgent && (
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getAgentColor(selectedAgent.agent_type)} flex items-center justify-center`}>
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
              {/* Agent Selector Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAgentSelector(!showAgentSelector)}
                className="flex items-center gap-2"
              >
                <Brain className="h-4 w-4" />
                Agents
                <ChevronDown className={`h-3 w-3 transition-transform ${showAgentSelector ? 'rotate-180' : ''}`} />
              </Button>
              
              {/* Connection Status */}
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs ${
                !isOnline ? 'bg-red-100 text-red-700' : connectionError ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
              }`}>
                {!isOnline ? <WifiOff className="h-3 w-3" /> : <Wifi className="h-3 w-3" />}
                {!isOnline ? 'Offline' : connectionError ? 'Server Issue' : 'Connected'}
              </div>
            </div>
          </header>

          {/* Agent Selector Dropdown */}
          {showAgentSelector && (
            <div className="border-b border-border/20 bg-muted/20 p-4">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Select an AI Agent
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {getOrderedUniqueAgents(agents).map((agent) => {
                    const IconComponent = getAgentIcon(agent.agent_type)
                    const isSelected = selectedAgent?.id === agent.id
                    
                    return (
                      <Card
                        key={agent.id}
                        className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                          isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => {
                          setSelectedAgent(agent)
                          setShowAgentSelector(false)
                          setTimeout(() => inputRef.current?.focus(), 100)
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getAgentColor(agent.agent_type)} flex items-center justify-center`}>
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
                
                {getOrderedUniqueAgents(agents).length > 0 && getOrderedUniqueAgents(agents).length < 3 && (
                  <div className="text-center py-4 mt-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                      {3 - getOrderedUniqueAgents(agents).length} agent(s) missing
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

          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto p-4 space-y-6">
              {/* Welcome State */}
              {messages.length === 0 && (
                <div className="text-center py-12">
                  {selectedAgent ? (
                    <div className="space-y-6">
                      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getAgentColor(selectedAgent.agent_type)} flex items-center justify-center mx-auto shadow-lg`}>
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
                            <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => {
                              setInputMessage("Calculate 15 * 24")
                              setTimeout(() => inputRef.current?.focus(), 100)
                            }}>
                              <Calculator className="h-5 w-5 text-blue-500 mb-2" />
                              <p className="text-sm font-medium">Math Problems</p>
                              <p className="text-xs text-muted-foreground">Calculate 15 × 24</p>
                            </Card>
                            <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => {
                              setInputMessage("What's the square root of 144?")
                              setTimeout(() => inputRef.current?.focus(), 100)
                            }}>
                              <Code className="h-5 w-5 text-purple-500 mb-2" />
                              <p className="text-sm font-medium">Square Roots</p>
                              <p className="text-xs text-muted-foreground">√144 = ?</p>
                            </Card>
                            <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => {
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
                            <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => {
                              setInputMessage("What's the weather in Tokyo?")
                              setTimeout(() => inputRef.current?.focus(), 100)
                            }}>
                              <Globe className="h-5 w-5 text-blue-500 mb-2" />
                              <p className="text-sm font-medium">Weather Info</p>
                              <p className="text-xs text-muted-foreground">Tokyo weather</p>
                            </Card>
                            <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => {
                              setInputMessage("Search for latest AI news")
                              setTimeout(() => inputRef.current?.focus(), 100)
                            }}>
                              <Search className="h-5 w-5 text-purple-500 mb-2" />
                              <p className="text-sm font-medium">Web Search</p>
                              <p className="text-xs text-muted-foreground">Latest AI news</p>
                            </Card>
                            <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => {
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
                            <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => {
                              setInputMessage("Help me plan a project")
                              setTimeout(() => inputRef.current?.focus(), 100)
                            }}>
                              <Brain className="h-5 w-5 text-purple-500 mb-2" />
                              <p className="text-sm font-medium">Project Planning</p>
                              <p className="text-xs text-muted-foreground">Strategic thinking</p>
                            </Card>
                            <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => {
                              setInputMessage("Analyze this business idea")
                              setTimeout(() => inputRef.current?.focus(), 100)
                            }}>
                              <Star className="h-5 w-5 text-yellow-500 mb-2" />
                              <p className="text-sm font-medium">Analysis</p>
                              <p className="text-xs text-muted-foreground">Deep insights</p>
                            </Card>
                            <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => {
                              setInputMessage("What should I consider for launching a startup?")
                              setTimeout(() => inputRef.current?.focus(), 100)
                            }}>
                              <Zap className="h-5 w-5 text-orange-500 mb-2" />
                              <p className="text-sm font-medium">Research</p>
                              <p className="text-xs text-muted-foreground">Comprehensive research</p>
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
                  className={`flex gap-4 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
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
                        ? 'bg-primary text-primary-foreground rounded-2xl'
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
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="h-2 w-2 bg-primary rounded-full animate-bounce delay-100"></div>
                        <div className="h-2 w-2 bg-primary rounded-full animate-bounce delay-200"></div>
                      </div>
                      <span className="text-[15px] text-muted-foreground font-normal">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area - Fixed at Bottom */}
          <div className="border-t border-border/20 p-4 bg-background">
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
                    className="w-full resize-none border border-border rounded-2xl px-4 py-3 pr-12 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 max-h-32"
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
                    className="absolute right-2 bottom-2 w-8 h-8 p-0 rounded-lg"
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