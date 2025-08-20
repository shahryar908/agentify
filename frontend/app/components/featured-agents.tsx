'use client'

import { memo, useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageSquare, ArrowRight, Calculator, Globe, Brain, Zap } from "lucide-react"
import { apiClient, type AgentInfo } from "@/lib/api"

export const FeaturedAgents = memo(function FeaturedAgents() {
  const [agents, setAgents] = useState<AgentInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    try {
      const agentsData = await apiClient.getAgents()
      setAgents(agentsData)
    } catch (error) {
      console.error('Error fetching agents:', error)
      // Fallback to default agents if backend is not available
      setAgents([
        {
          id: 'math-agent',
          name: 'Math Agent',
          description: 'Specialized in mathematical calculations, equations, and complex arithmetic operations.',
          agent_type: 'math',
          tools: ['add_numbers', 'multiply_numbers', 'divide_numbers', 'subtract_numbers', 'calculate_power', 'calculate_square_root']
        },
        {
          id: 'intelligent-agent',
          name: 'Intelligent Web Agent',
          description: 'Advanced agent with web search, weather forecasting, and news retrieval capabilities.',
          agent_type: 'intelligent',
          tools: ['search_web', 'get_weather', 'get_latest_news', 'fetch_web_content', 'get_current_datetime']
        },
        {
          id: 'autonomous-agent',
          name: 'Autonomous Agent',
          description: 'Autonomous planning agent with advanced reasoning and decision-making capabilities.',
          agent_type: 'autonomous',
          tools: ['search_web', 'get_weather', 'analyze_weather', 'check_air_quality', 'get_time', 'search_news']
        }
      ])
    } finally {
      setIsLoading(false)
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
        return MessageSquare
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

  const getAgentBorder = (type: string) => {
    switch (type) {
      case 'math':
        return 'border-blue-200 dark:border-blue-800'
      case 'intelligent':
        return 'border-green-200 dark:border-green-800'
      case 'autonomous':
        return 'border-purple-200 dark:border-purple-800'
      default:
        return 'border-gray-200 dark:border-gray-700'
    }
  }

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <div className="h-10 bg-muted rounded w-1/3 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-muted rounded w-2/3 mx-auto animate-pulse"></div>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 bg-muted rounded-2xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      
      <div className="container relative">
        <div className="text-center mb-16">
          {/* Section Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            Featured Agents
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Meet Your AI
            <span className="bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent"> Workforce</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover specialized AI agents designed for specific domains. Each agent comes with unique capabilities 
            and tools tailored for optimal performance.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent, index) => {
            const IconComponent = getAgentIcon(agent.agent_type)
            return (
              <div
                key={agent.id}
                className={`group relative bg-card/50 backdrop-blur-sm border ${getAgentBorder(agent.agent_type)} rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in-up`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Glow Effect */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${getAgentColor(agent.agent_type)} rounded-2xl blur opacity-0 group-hover:opacity-25 transition-opacity duration-300`} />
                
                {/* Content */}
                <div className="relative">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getAgentColor(agent.agent_type)} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  
                  {/* Header */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {agent.name}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {agent.description}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-3 bg-muted/50 rounded-xl">
                      <div className="text-2xl font-bold text-primary">{agent.tools.length}</div>
                      <div className="text-xs text-muted-foreground">Tools</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-xl">
                      <div className="text-2xl font-bold text-purple-500 capitalize">{agent.agent_type}</div>
                      <div className="text-xs text-muted-foreground">Type</div>
                    </div>
                  </div>

                  {/* Tools Preview */}
                  <div className="mb-6">
                    <div className="text-sm font-medium text-muted-foreground mb-2">Featured Tools:</div>
                    <div className="flex flex-wrap gap-2">
                      {agent.tools.slice(0, 3).map((tool, toolIndex) => (
                        <span
                          key={toolIndex}
                          className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md font-medium"
                        >
                          {tool.replace(/_/g, ' ')}
                        </span>
                      ))}
                      {agent.tools.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{agent.tools.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Link href="/chat" className="flex-1">
                      <Button className="w-full group/btn" size="lg">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Try Agent
                        <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Link href="/blogs">
                      <Button variant="outline" size="lg" className="aspect-square p-0">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-cyan-500/10 rounded-3xl p-8 border border-primary/20">
            <h3 className="text-2xl font-bold mb-4">Ready to Build Your Own Agent?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Start with our pre-built agents or create custom ones tailored to your specific needs. 
              The possibilities are endless.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/chat">
                <Button size="lg" className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90">
                  Start Building
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="/blogs">
                <Button variant="outline" size="lg">
                  View Documentation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
})
