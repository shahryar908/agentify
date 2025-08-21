import Link from 'next/link'
import { Button } from './components/ui/button'
import { Card } from './components/ui/card'
import { Badge } from './components/ui/badge'
import { ArrowRight, Bot, Calculator, Globe, Brain, Sparkles, Zap, MessageCircle, Star, Search, Code, Plus, Users, TrendingUp, Shield, Clock, CheckCircle, Play, BarChart3 } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Clean Background with Subtle Patterns */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950/30" />
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.15)_1px,transparent_0)] [background-size:16px_16px]" />
      </div>
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex mb-6">
              <Badge className="px-4 py-2 text-sm font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-full">
                <Sparkles className="h-4 w-4 mr-2" />
                The Future of AI Assistance
              </Badge>
            </div>
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight tracking-tight">
              <span className="text-gray-900 dark:text-white">
                Transform Your Workflow with
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Intelligent AI Agents
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed mb-10">
              Deploy specialized AI agents that excel in mathematics, web research, and autonomous problem-solving. 
              <span className="text-gray-900 dark:text-white font-semibold">Get instant, accurate results</span> for complex tasks 
              while you focus on what matters most.
            </p>
          </div>
          
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/chat">
                <Button size="lg" className="group px-8 py-4 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-200">
                  <MessageCircle className="h-5 w-5 mr-3" />
                  Start Free Chat
                  <ArrowRight className="h-4 w-4 ml-3 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/research">
                <Button variant="outline" size="lg" className="group px-8 py-4 text-lg font-semibold border-2 border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
                  <Play className="h-5 w-5 mr-3" />
                  Watch Demo
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="font-medium">10,000+ Active Users</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">4.9/5 User Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="font-medium">Enterprise Secure</span>
              </div>
            </div>
          </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">99.9%</div>
              <div className="text-gray-600 dark:text-gray-300 font-medium">Uptime</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">{"<200ms"}</div>
              <div className="text-gray-600 dark:text-gray-300 font-medium">Response Time</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">3</div>
              <div className="text-gray-600 dark:text-gray-300 font-medium">Specialized Agents</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">24/7</div>
              <div className="text-gray-600 dark:text-gray-300 font-medium">Always Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Specialized AI Agents for Every Task
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Choose from three powerful agents, each optimized for specific domains with professional-grade capabilities.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Math Agent */}
            <Card className="group p-8 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-600">
              <div className="mb-6">
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                  <Calculator className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Math Agent</h3>
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-medium px-2 py-1">6 Tools</Badge>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                Advanced mathematical computation with precision tools for calculations, algebraic operations, and problem solving.
              </p>
              <ul className="space-y-3 mb-6 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span>Basic arithmetic operations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span>Advanced mathematical functions</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span>Instant precise calculations</span>
                </li>
              </ul>
              <Link href="/chat">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-semibold transition-colors">
                  Try Math Agent
                  <ArrowRight className="h-4 w-4 ml-2 inline" />
                </Button>
              </Link>
            </Card>

            {/* Intelligent Agent */}
            <Card className="group p-8 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 hover:border-green-300 dark:hover:border-green-600">
              <div className="mb-6">
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Web Agent</h3>
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs font-medium px-2 py-1">4 Tools</Badge>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                Intelligent web research with real-time search, weather forecasting, news aggregation, and information synthesis.
              </p>
              <ul className="space-y-3 mb-6 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Web search & information retrieval</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Weather & news updates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Context-aware responses</span>
                </li>
              </ul>
                <Link href="/chat">
                  <Button className="w-full bg-gradient-to-r from-green-500 via-emerald-600 to-teal-500 hover:from-green-400 hover:via-teal-500 hover:to-blue-500 shadow-xl shadow-green-500/30 hover:shadow-2xl hover:shadow-green-500/50 transition-all duration-500 py-4 font-bold text-lg rounded-2xl group-hover:scale-105">
                    <Globe className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                    Launch Explorer
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
            </Card>

            {/* Autonomous Agent */}
            <Card className="group p-8 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-600">
              <div className="mb-6">
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Autonomous Agent</h3>
                <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-xs font-medium px-2 py-1">6 Tools</Badge>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                Advanced autonomous AI with sophisticated reasoning, Google Custom Search integration, and multi-step problem solving.
              </p>
              <ul className="space-y-3 mb-6 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                  <span>Advanced autonomous reasoning</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                  <span>Multi-step problem solving</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                  <span>Google Custom Search integration</span>
                </li>
              </ul>
              <Link href="/chat">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-3 font-semibold transition-colors">
                  Try Autonomous Agent
                  <ArrowRight className="h-4 w-4 ml-2 inline" />
                </Button>
              </Link>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to boost your productivity?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who use our AI agents to streamline their workflows and get instant, accurate results.
            </p>
            <Link href="/chat">
              <Button size="lg" className="px-8 py-4 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg shadow-blue-600/25 transition-all duration-200">
                Get Started Free
                <ArrowRight className="h-5 w-5 ml-3" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Get started with AI agents in three simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="group text-center">
              <div className="relative mb-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/30 group-hover:shadow-3xl group-hover:shadow-blue-500/40 group-hover:scale-110 transition-all duration-300">
                  <span className="text-3xl font-bold text-white">1</span>
                </div>
                <div className="hidden md:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-blue-300 to-transparent -z-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Choose Your Agent</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Select from specialized AI agents designed for mathematics, web research, or autonomous problem-solving.
              </p>
            </div>
            
            <div className="group text-center">
              <div className="relative mb-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/30 group-hover:shadow-3xl group-hover:shadow-green-500/40 group-hover:scale-110 transition-all duration-300">
                  <span className="text-3xl font-bold text-white">2</span>
                </div>
                <div className="hidden md:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-green-300 to-transparent -z-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Start Conversation</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Chat naturally with your chosen agent. Each agent understands your intent and automatically uses appropriate tools.
              </p>
            </div>
            
            <div className="group text-center">
              <div className="relative mb-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/30 group-hover:shadow-3xl group-hover:shadow-purple-500/40 group-hover:scale-110 transition-all duration-300">
                  <span className="text-3xl font-bold text-white">3</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Get Results</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Receive intelligent, tool-enhanced responses tailored to your specific queries and requirements with professional accuracy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Research Section */}
      <section className="py-24 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 px-4 py-2 rounded-full mb-6">
              <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Research Capabilities</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
              AI Research & Insights
            </h2>
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Explore cutting-edge AI research, papers, and insights powered by our advanced research agents.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="group p-10 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 border-0 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-blue-950/20 dark:to-indigo-950/20 backdrop-blur-sm relative overflow-hidden hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/3 to-indigo-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <Bot className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Research Agent</h3>
                </div>
                <p className="text-muted-foreground mb-8 leading-relaxed text-lg">
                  Our advanced research agent can automatically search arXiv, analyze papers, 
                  identify research gaps, and generate comprehensive research proposals.
                </p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="font-medium">Automated research paper discovery</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="font-medium">Intelligent gap analysis</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Star className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="font-medium">Research proposal generation</span>
                  </div>
                </div>
                <Link href="/research">
                  <Button variant="outline" className="w-full py-3 font-semibold border-2 border-blue-200 hover:border-blue-300 dark:border-blue-800 dark:hover:border-blue-700 bg-gradient-to-r from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-950/20 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
                    Generate Research
                  </Button>
                </Link>
              </div>
            </Card>
            
            <Card className="group p-10 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 border-0 bg-gradient-to-br from-white via-purple-50/30 to-pink-50/50 dark:from-gray-900 dark:via-purple-950/20 dark:to-pink-950/20 backdrop-blur-sm relative overflow-hidden hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/3 to-pink-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Featured Papers</h3>
                </div>
                <p className="text-muted-foreground mb-8 leading-relaxed text-lg">
                  Browse through AI research papers, analyses, and generated content created by our research agents.
                </p>
                <div className="space-y-4 mb-8">
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl border border-purple-100 dark:border-purple-900/30">
                    <h4 className="font-semibold text-base mb-1">Latest in Prompt Engineering</h4>
                    <p className="text-sm text-muted-foreground">Advanced techniques and methodologies</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl border border-purple-100 dark:border-purple-900/30">
                    <h4 className="font-semibold text-base mb-1">AI Agent Architectures</h4>
                    <p className="text-sm text-muted-foreground">Multi-agent system design patterns</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl border border-purple-100 dark:border-purple-900/30">
                    <h4 className="font-semibold text-base mb-1">Tool-Enhanced AI Systems</h4>
                    <p className="text-sm text-muted-foreground">Integration patterns and best practices</p>
                  </div>
                </div>
                <Link href="/blogs">
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 py-3 font-semibold">
                    View All Papers
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 text-center bg-gradient-to-b from-background to-muted/20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/[0.05] via-purple-500/[0.05] to-pink-500/[0.05]" />
        </div>
        <div className="max-w-5xl mx-auto relative">
          <div className="mb-12">
            <h2 className="text-5xl lg:text-7xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-gray-900 via-blue-700 to-purple-700 dark:from-white dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent">
                Ready to Experience
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI Agents?
              </span>
            </h2>
            <p className="text-xl lg:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of users who are already leveraging the power of specialized AI agents 
              for their daily tasks and complex problem-solving needs.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Link href="/chat">
              <Button size="lg" className="group px-12 py-6 text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-1">
                <MessageCircle className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform" />
                Start Free Chat
              </Button>
            </Link>
            <Link href="/research">
              <Button variant="outline" size="lg" className="group px-12 py-6 text-xl font-semibold border-2 border-purple-200 hover:border-purple-300 dark:border-purple-800 dark:hover:border-purple-700 bg-gradient-to-r from-white to-purple-50/50 dark:from-gray-900 dark:to-purple-950/20 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1">
                <Brain className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform text-purple-600 dark:text-purple-400" />
                Generate Research
              </Button>
            </Link>
          </div>

          {/* Final trust indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="font-medium">Always Available</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span className="font-medium">Instant Responses</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Enterprise Ready</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}