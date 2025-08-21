'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { 
  Search, Download, FileText, Brain, Sparkles, CheckCircle, 
  Clock, AlertCircle, Loader2, ArrowRight, Play, Pause,
  BookOpen, ExternalLink, Share2, Copy, RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { apiClient, type StreamingChatChunk, type AgentInfo } from '../lib/api'

interface ResearchStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'error'
  progress?: number
  details?: string
}

interface GeneratedPaper {
  id: string
  title: string
  authors: string[]
  abstract: string
  sections: string[]
  generatedAt: string
  downloadUrl?: string
  status: 'generating' | 'ready' | 'error'
}

const initialSteps: ResearchStep[] = [
  {
    id: 'search',
    title: 'Searching Academic Archives',
    description: 'Querying arXiv, PubMed, and other academic databases for relevant papers',
    status: 'pending'
  },
  {
    id: 'analyze',
    title: 'Analyzing Research Papers',
    description: 'Extracting key insights, methodologies, and findings from relevant papers',
    status: 'pending'
  },
  {
    id: 'gaps',
    title: 'Identifying Research Gaps',
    description: 'Finding underexplored areas and potential research opportunities',
    status: 'pending'
  },
  {
    id: 'generate',
    title: 'Generating Research Paper',
    description: 'Creating comprehensive research paper with citations and methodology',
    status: 'pending'
  },
  {
    id: 'format',
    title: 'Formatting PDF Document',
    description: 'Converting to professional academic PDF format with proper citations',
    status: 'pending'
  }
]

export default function ResearchPage() {
  const [topic, setTopic] = useState('')
  const [steps, setSteps] = useState<ResearchStep[]>(initialSteps)
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentPaper, setCurrentPaper] = useState<GeneratedPaper | null>(null)
  const [recentPapers, setRecentPapers] = useState<GeneratedPaper[]>([])
  const [error, setError] = useState<string | null>(null)
  const [researchAgent, setResearchAgent] = useState<AgentInfo | null>(null)

  useEffect(() => {
    // Load recent papers from localStorage
    const saved = localStorage.getItem('recent_research_papers')
    if (saved) {
      try {
        setRecentPapers(JSON.parse(saved))
      } catch (e) {
        console.warn('Failed to load recent papers:', e)
      }
    }

    // Initialize research agent
    initializeResearchAgent()
  }, [])

  const initializeResearchAgent = async () => {
    try {
      // Get available agents from backend
      const agents = await apiClient.getAgents()
      console.log('Available agents:', agents)
      
      if (agents.length === 0) {
        console.log('No agents available from API, creating fallback agent for research')
        // Create a fallback agent for research functionality
        const fallbackAgent = {
          id: 'research-fallback',
          name: 'AI Research Assistant',
          agent_type: 'intelligent',
          description: 'Intelligent agent configured for research tasks',
          created_at: new Date().toISOString()
        }
        setResearchAgent(fallbackAgent)
        return
      }
      
      // Prefer research agent, then intelligent, then any available agent
      let researcherAgent = agents.find(agent => agent.agent_type === 'researcher') ||
                            agents.find(agent => agent.agent_type === 'intelligent') ||
                            agents.find(agent => agent.agent_type === 'autonomous') ||
                            agents[0]
      
      if (researcherAgent) {
        console.log('Using agent for research:', researcherAgent.name, 'Type:', researcherAgent.agent_type)
        setResearchAgent(researcherAgent)
      } else {
        setError('No suitable AI agent found for research tasks.')
      }
      
    } catch (error) {
      console.warn('Failed to initialize research agent:', error)
      // Create fallback agent even on API error
      console.log('Creating fallback agent due to API error')
      const fallbackAgent = {
        id: 'research-fallback',
        name: 'AI Research Assistant',
        agent_type: 'intelligent', 
        description: 'Intelligent agent configured for research tasks',
        created_at: new Date().toISOString()
      }
      setResearchAgent(fallbackAgent)
    }
  }

  const startResearch = async (researchTopic: string) => {
    if (!researchTopic.trim() || !researchAgent) return

    setIsGenerating(true)
    setError(null)
    setSteps(initialSteps.map(step => ({ ...step, status: 'pending' })))
    setCurrentPaper(null)

    try {
      // Use streaming API for real-time updates
      const streamGenerator = apiClient.chatWithAgentStream(
        researchAgent.id, 
        `conduct research on ${researchTopic}`
      )

      let currentStepIndex = 0
      let researchResult: any = null

      for await (const chunk of streamGenerator) {
        const typedChunk = chunk as StreamingChatChunk

        switch (typedChunk.type) {
          case 'start':
            break

          case 'progress':
            // Update step progress based on content
            const stepMapping: { [key: string]: number } = {
              'searching_papers': 0,
              'analyzing_papers': 1,
              'identifying_gaps': 2,
              'generating_proposal': 3,
              'creating_pdf': 4,
            }

            const stepIndex = stepMapping[typedChunk.step || '']
            if (stepIndex !== undefined) {
              currentStepIndex = stepIndex

              setSteps(prev => prev.map((step, index) => {
                if (index < currentStepIndex) return { ...step, status: 'completed', progress: 100 }
                if (index === currentStepIndex) return { ...step, status: 'in_progress', progress: 50 }
                return { ...step, status: 'pending' }
              }))
            }
            break

          case 'success':
            // Complete all steps
            setSteps(prev => prev.map(step => ({ ...step, status: 'completed', progress: 100 })))
            researchResult = typedChunk.result

            // Create paper from result
            if (researchResult) {
              const generatedPaper: GeneratedPaper = {
                id: Date.now().toString(),
                title: `Research Analysis: ${researchTopic}`,
                authors: ['AI Research Agent'],
                abstract: `This paper provides a comprehensive analysis of ${researchTopic}, examining current methodologies, identifying key research gaps, and proposing future research directions. Generated through systematic review of academic literature and advanced AI analysis techniques.`,
                sections: [
                  'Abstract',
                  'Introduction', 
                  'Literature Review',
                  'Gap Analysis',
                  'Methodology',
                  'Research Proposal',
                  'Expected Results',
                  'Discussion',
                  'Conclusion',
                  'References'
                ],
                generatedAt: new Date().toISOString(),
                status: 'ready',
                downloadUrl: researchResult.pdf_path || '#'
              }

              setCurrentPaper(generatedPaper)

              // Save to recent papers
              const updatedRecent = [generatedPaper, ...recentPapers.slice(0, 4)]
              setRecentPapers(updatedRecent)
              localStorage.setItem('recent_research_papers', JSON.stringify(updatedRecent))
            }
            break

          case 'partial_success':
            // Mark as partially completed
            setSteps(prev => prev.map((step, index) => {
              if (index <= currentStepIndex) return { ...step, status: 'completed', progress: 100 }
              return { ...step, status: 'pending' }
            }))
            
            setError(`Research partially completed: ${typedChunk.content?.replace(/\*\*/g, '').replace(/❌|⚠️|💡/g, '')}`)
            break

          case 'error':
            setError(typedChunk.content || 'Research failed. Please try again.')
            setSteps(prev => prev.map(step => ({ ...step, status: 'error' })))
            break
        }
      }

    } catch (err: any) {
      console.error('Research failed:', err)
      setError(err.message || 'Failed to generate research paper. Please try again.')
      setSteps(prev => prev.map(step => ({ ...step, status: 'error' })))
    } finally {
      setIsGenerating(false)
    }
  }

  const getStepIcon = (status: ResearchStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'in_progress':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />
    }
  }

  const handleDownload = () => {
    if (currentPaper && currentPaper.downloadUrl && currentPaper.downloadUrl !== '#') {
      // Download the actual generated PDF
      const link = document.createElement('a')
      link.href = currentPaper.downloadUrl
      link.download = `${currentPaper.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`
      link.target = '_blank'
      link.click()
    } else {
      // Show message if no PDF is available
      alert('PDF is not yet available. Please wait for research to complete.')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/5">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/[0.02] via-purple-500/[0.02] to-pink-500/[0.02]" />
      </div>
      
      <div className="relative container py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-xl shadow-purple-500/30">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-purple-700 to-pink-700 dark:from-white dark:via-purple-300 dark:to-pink-300 bg-clip-text text-transparent">
                AI Research Assistant
              </h1>
            </div>
          </div>
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 px-4 py-2 rounded-full">
              <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-800 dark:text-purple-300">Academic Research Automation</span>
            </div>
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Generate comprehensive research papers instantly. Enter a topic and get a fully analyzed research PDF with citations, methodology, and professional formatting.
            </p>
          </div>
        </div>

        {/* Topic Input */}
        <Card className="group p-10 mb-12 bg-gradient-to-br from-white via-purple-50/30 to-pink-50/50 dark:from-gray-900 dark:via-purple-950/20 dark:to-pink-950/20 border-0 shadow-2xl shadow-purple-500/10 hover:shadow-purple-500/20 transition-all duration-500 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/3 to-pink-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="max-w-3xl mx-auto relative">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">What would you like to research?</h2>
              <p className="text-muted-foreground text-lg">Enter any topic and watch our AI create a comprehensive research paper with citations and analysis.</p>
            </div>
            <div className="space-y-6">
              <div>
                <label htmlFor="topic" className="block text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Research Topic
                </label>
                <div className="relative">
                  <Input
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Machine Learning in Healthcare, Quantum Computing Applications, Climate Change Mitigation..."
                    className="text-lg p-6 h-16 border-2 border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm"
                    disabled={isGenerating}
                  />
                  <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => startResearch(topic)}
                  disabled={!topic.trim() || isGenerating || !researchAgent}
                  size="lg"
                  className="flex-1 h-16 px-8 text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-0.5"
                >
                  {isGenerating ? (
                    <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                  ) : (
                    <Brain className="h-6 w-6 mr-3" />
                  )}
                  {isGenerating ? 'Generating Research...' : researchAgent ? 'Generate Research Paper' : 'Connecting to AI Agents...'}
                </Button>
                <Button
                  variant="outline"
                  size="lg" 
                  className="h-16 px-6 border-2 border-purple-200 hover:border-purple-300 dark:border-purple-800 dark:hover:border-purple-700 bg-white/50 dark:bg-gray-900/50"
                  disabled={isGenerating}
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Examples
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Progress Timeline */}
        {(isGenerating || steps.some(step => step.status !== 'pending')) && (
          <Card className="p-10 mb-12 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/50 dark:from-gray-900 dark:via-blue-950/20 dark:to-purple-950/20 border-0 shadow-xl backdrop-blur-sm">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-3 flex items-center justify-center gap-3 text-gray-900 dark:text-white">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                Research Progress
              </h2>
              <p className="text-muted-foreground text-lg">Our AI is working through the research process step by step</p>
            </div>
            <div className="space-y-6 max-w-4xl mx-auto">
              {steps.map((step, index) => (
                <div key={step.id} className="group relative">
                  <div className="flex items-center gap-6 p-6 rounded-2xl border-2 border-border/30 bg-gradient-to-r from-white/80 to-white/60 dark:from-gray-800/80 dark:to-gray-800/60 backdrop-blur-sm hover:border-purple-200 dark:hover:border-purple-700 transition-all duration-300">
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        step.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' :
                        step.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        step.status === 'error' ? 'bg-red-100 dark:bg-red-900/30' :
                        'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        {getStepIcon(step.status)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white">{step.title}</h3>
                        <Badge 
                          variant={
                            step.status === 'completed' ? 'default' :
                            step.status === 'in_progress' ? 'secondary' :
                            step.status === 'error' ? 'destructive' : 'outline'
                          }
                          className="px-3 py-1"
                        >
                          {step.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                      {step.status === 'in_progress' && step.progress && (
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium text-blue-600 dark:text-blue-400">{Math.round(step.progress)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${step.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex justify-center my-2">
                      <div className={`w-px h-6 ${
                        step.status === 'completed' ? 'bg-green-300' : 'bg-gray-200 dark:bg-gray-700'
                      }`} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Generated Paper Preview */}
        {currentPaper && currentPaper.status === 'ready' && (
          <Card className="p-8 mb-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <h2 className="text-2xl font-bold text-green-700 dark:text-green-300">Paper Generated Successfully!</h2>
                </div>
                <p className="text-green-600 dark:text-green-400">
                  Your research paper is ready for download and review.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleDownload}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(window.location.href)}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Paper Info */}
              <div>
                <h3 className="text-xl font-bold mb-4">{currentPaper.title}</h3>
                <div className="space-y-3 mb-6">
                  <div>
                    <span className="font-medium text-muted-foreground">Authors:</span>
                    <p>{currentPaper.authors.join(', ')}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Generated:</span>
                    <p>{new Date(currentPaper.generatedAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Sections:</span>
                    <p className="text-sm">{currentPaper.sections.length} sections included</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Abstract</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {currentPaper.abstract}
                  </p>
                </div>
              </div>

              {/* PDF Preview Mock */}
              <div>
                <div className="bg-white rounded-lg border-2 border-border shadow-lg p-6 h-96 overflow-hidden">
                  <div className="text-center mb-4">
                    <h4 className="font-bold text-lg text-gray-800">{currentPaper.title}</h4>
                    <p className="text-sm text-gray-600">{currentPaper.authors.join(', ')}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-semibold text-gray-800">Abstract</h5>
                      <div className="h-2 bg-gray-200 rounded mt-1" />
                      <div className="h-2 bg-gray-200 rounded mt-1 w-4/5" />
                      <div className="h-2 bg-gray-200 rounded mt-1 w-3/5" />
                    </div>
                    
                    {currentPaper.sections.slice(1, 6).map((section, index) => (
                      <div key={index}>
                        <h5 className="font-medium text-gray-700 text-sm">{section}</h5>
                        <div className="h-1 bg-gray-100 rounded mt-1" />
                        <div className="h-1 bg-gray-100 rounded mt-1 w-3/4" />
                      </div>
                    ))}
                  </div>
                  
                  <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                    Page 1 of 12
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    <BookOpen className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Full View
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="p-6 mb-8 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <div>
                <h3 className="font-semibold text-red-700 dark:text-red-300">Generation Error</h3>
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
              <Button
                onClick={() => setError(null)}
                variant="outline"
                size="sm"
                className="ml-auto"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry
              </Button>
            </div>
          </Card>
        )}

        {/* Recent Papers */}
        {recentPapers.length > 0 && (
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Recent Research Papers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentPapers.map((paper) => (
                <Card key={paper.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg line-clamp-2 mb-2">{paper.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        By {paper.authors.join(', ')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(paper.generatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {paper.status}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {paper.abstract}
                  </p>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        )}

        {/* Features Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
              Powerful Research Capabilities
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Advanced AI technology combined with comprehensive academic databases
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="group p-8 text-center hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 border-0 bg-gradient-to-br from-white via-blue-50/50 to-cyan-50/80 dark:from-gray-900 dark:via-blue-950/30 dark:to-cyan-950/30 backdrop-blur-sm relative overflow-hidden hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-300">
                  <Search className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Comprehensive Research</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Searches multiple academic databases including arXiv, PubMed, IEEE Xplore, and Google Scholar for the most relevant papers
                </p>
              </div>
            </Card>
            
            <Card className="group p-8 text-center hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 border-0 bg-gradient-to-br from-white via-purple-50/50 to-pink-50/80 dark:from-gray-900 dark:via-purple-950/30 dark:to-pink-950/30 backdrop-blur-sm relative overflow-hidden hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">AI-Powered Analysis</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Advanced NLP models analyze papers and identify research gaps automatically using state-of-the-art language understanding
                </p>
              </div>
            </Card>
            
            <Card className="group p-8 text-center hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-500 border-0 bg-gradient-to-br from-white via-green-50/50 to-emerald-50/80 dark:from-gray-900 dark:via-green-950/30 dark:to-emerald-950/30 backdrop-blur-sm relative overflow-hidden hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/25 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Publication Ready</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Generates properly formatted academic papers with citations, references, and professional LaTeX-quality formatting
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20 py-12 px-4 bg-gradient-to-r from-blue-500/[0.02] via-purple-500/[0.02] to-pink-500/[0.02] rounded-3xl">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Ready to explore more AI capabilities?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Try our other specialized AI agents for mathematics, web research, and autonomous problem solving.
          </p>
          <Link href="/chat">
            <Button size="lg" className="px-10 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5">
              <ArrowRight className="h-6 w-6 mr-3" />
              Try Other AI Agents
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}