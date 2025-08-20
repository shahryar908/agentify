'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, MessageSquare, Sparkles, Zap, Brain, Code2 } from "lucide-react"
import { useState, useEffect } from "react"

export function HeroSection() {
  const [typedText, setTypedText] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  
  const messages = [
    "Calculate compound interest for my investment portfolio",
    "What's the current weather in Tokyo and should I pack a jacket?",
    "Search for the latest AI research papers on autonomous agents",
    "Help me plan my next coding project step by step",
    "Find news about developments in machine learning this week",
    "Analyze this mathematical equation and show the solution"
  ]
  
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)

  useEffect(() => {
    const currentMessage = messages[currentMessageIndex]
    const timeouts: NodeJS.Timeout[] = []
    
    if (isTyping) {
      // Typing animation
      currentMessage.split('').forEach((char, index) => {
        const timeout = setTimeout(() => {
          setTypedText(currentMessage.slice(0, index + 1))
          if (index === currentMessage.length - 1) {
            // Pause at end, then start erasing
            const pauseTimeout = setTimeout(() => {
              setIsTyping(false)
            }, 2000)
            timeouts.push(pauseTimeout)
          }
        }, index * 50)
        timeouts.push(timeout)
      })
    } else {
      // Erasing animation
      for (let i = currentMessage.length; i >= 0; i--) {
        const timeout = setTimeout(() => {
          setTypedText(currentMessage.slice(0, i))
          if (i === 0) {
            setCurrentMessageIndex((prev) => (prev + 1) % messages.length)
            setIsTyping(true)
          }
        }, (currentMessage.length - i) * 30)
        timeouts.push(timeout)
      }
    }

    return () => {
      timeouts.forEach(clearTimeout)
    }
  }, [currentMessageIndex, isTyping, messages])

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/20 via-purple-500/20 to-cyan-500/20 rounded-full blur-3xl opacity-30" />
      
      <div className="relative container py-24 lg:py-32">
        <div className="mx-auto max-w-5xl text-center">
          {/* Interactive Floating Icons */}
          <div className="absolute -top-4 left-1/4 animate-float cursor-pointer group">
            <div className="bg-primary/10 p-4 rounded-2xl shadow-lg group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110">
              <Brain className="h-7 w-7 text-primary group-hover:rotate-12 transition-transform" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-primary to-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg">
              AI
            </div>
          </div>
          <div className="absolute top-8 right-1/4 animate-float delay-500 cursor-pointer group">
            <div className="bg-purple-500/10 p-4 rounded-2xl shadow-lg group-hover:bg-purple-500/20 transition-all duration-300 group-hover:scale-110">
              <Zap className="h-7 w-7 text-purple-500 group-hover:rotate-12 transition-transform" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg">
              ⚡
            </div>
          </div>
          <div className="absolute -top-2 right-1/3 animate-float delay-1000 cursor-pointer group">
            <div className="bg-cyan-500/10 p-4 rounded-2xl shadow-lg group-hover:bg-cyan-500/20 transition-all duration-300 group-hover:scale-110">
              <Code2 className="h-7 w-7 text-cyan-500 group-hover:rotate-12 transition-transform" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg">
              🚀
            </div>
          </div>

          {/* Additional floating elements for more dynamic feel */}
          <div className="absolute top-4 left-1/3 animate-float delay-700 opacity-60">
            <div className="w-3 h-3 bg-gradient-to-r from-primary to-purple-500 rounded-full shadow-lg"></div>
          </div>
          <div className="absolute bottom-4 right-1/4 animate-float delay-1200 opacity-60">
            <div className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-lg"></div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8 animate-fade-in-up">
            <Sparkles className="h-4 w-4" />
            Personal AI Agent Portfolio
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up">
            <span className="bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent animate-gradient">
              Explore My Custom
            </span>
            <span className="block text-foreground">AI Agent Collection</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-10 animate-fade-in-up leading-relaxed">
            Welcome to my showcase of <span className="text-foreground font-medium">handcrafted AI agents</span>. 
            Try out the agents I've built, read my tutorials on how I created them, 
            and see <span className="text-foreground font-medium">real AI automation in action</span>.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up">
            <Button size="lg" variant="gradient" className="text-lg px-10 py-5 h-auto group relative overflow-hidden" asChild>
              <Link href="/chat" className="flex items-center gap-3">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10">Try My Agents</span>
                <ArrowRight className="relative z-10 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-5 h-auto group border-2 hover:border-primary/50" asChild>
              <Link href="/blogs" className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Read My Tutorials
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>
            </Button>
          </div>

          {/* Portfolio Stats */}
          <div className="mb-16 animate-fade-in-up">
            <p className="text-sm text-muted-foreground mb-4 font-medium">Current portfolio status</p>
            <div className="flex items-center justify-center gap-8 opacity-60 hover:opacity-100 transition-opacity">
              <div className="text-2xl font-bold text-primary">3</div>
              <div className="h-8 w-px bg-border"></div>
              <div className="text-2xl font-bold text-purple-500">15+</div>
              <div className="h-8 w-px bg-border"></div>
              <div className="text-2xl font-bold text-cyan-500">Live</div>
            </div>
            <div className="flex items-center justify-center gap-8 text-xs text-muted-foreground mt-2">
              <span>Custom Agents</span>
              <span>Built-in Tools</span>
              <span>Demo Available</span>
            </div>
          </div>

          {/* Interactive Demo */}
          <div className="relative max-w-4xl mx-auto animate-fade-in-up">
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 via-purple-500/50 to-cyan-500/50 rounded-2xl blur opacity-25" />
              
              {/* Main Demo Container */}
              <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl">
                {/* Window Controls */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-3 w-3 rounded-full bg-red-500 shadow-lg"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500 shadow-lg"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500 shadow-lg"></div>
                  <div className="ml-4 text-sm text-muted-foreground font-medium">
                    AI Agent Terminal
                  </div>
                </div>

                {/* Chat Interface */}
                <div className="space-y-6 text-left">
                  {/* User Message */}
                  <div className="flex items-start gap-4 animate-slide-in-left">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-xl">
                      <span className="text-sm font-bold text-primary-foreground">You</span>
                    </div>
                    <div className="flex-1 bg-card/80 backdrop-blur-sm rounded-2xl rounded-tl-sm p-5 border border-border/50 shadow-lg">
                      <p className="text-foreground min-h-[28px] text-lg leading-relaxed">
                        {typedText}
                        <span className="animate-pulse ml-1 text-primary font-bold">|</span>
                      </p>
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex items-start gap-4 animate-slide-in-right">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-xl">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/30 rounded-2xl rounded-tl-sm p-5 shadow-lg backdrop-blur-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex gap-1">
                          <div className="h-2.5 w-2.5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full animate-bounce"></div>
                          <div className="h-2.5 w-2.5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full animate-bounce delay-100"></div>
                          <div className="h-2.5 w-2.5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full animate-bounce delay-200"></div>
                        </div>
                        <span className="text-sm text-muted-foreground font-medium">AI Agent Processing...</span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-foreground font-medium">
                          🚀 <span className="text-primary">Analyzing requirements...</span> ✅
                        </p>
                        <p className="text-foreground font-medium">
                          🔧 <span className="text-purple-500">Deploying specialized tools...</span> ✅  
                        </p>
                        <p className="text-foreground font-medium">
                          ⚡ <span className="text-cyan-500">Generating intelligent response...</span> ✅
                        </p>
                        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-3 mt-3">
                          <p className="text-green-700 dark:text-green-300 font-semibold text-sm">
                            ✨ Task completed successfully! Ready for your next challenge.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-6 border-t border-border/30">
                  <div className="text-center group">
                    <div className="text-3xl font-bold text-primary mb-1 group-hover:scale-110 transition-transform">3</div>
                    <div className="text-sm text-muted-foreground">Agent Types</div>
                  </div>
                  <div className="text-center group">
                    <div className="text-3xl font-bold text-purple-500 mb-1 group-hover:scale-110 transition-transform">15+</div>
                    <div className="text-sm text-muted-foreground">AI Tools</div>
                  </div>
                  <div className="text-center group">
                    <div className="text-3xl font-bold text-emerald-500 mb-1 group-hover:scale-110 transition-transform">24/7</div>
                    <div className="text-sm text-muted-foreground">Availability</div>
                  </div>
                  <div className="text-center group">
                    <div className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent mb-1 group-hover:scale-110 transition-transform">∞</div>
                    <div className="text-sm text-muted-foreground">Scalability</div>
                  </div>
                </div>

                {/* Performance Badges */}
                <div className="flex flex-wrap justify-center gap-3 mt-6">
                  <div className="bg-green-500/10 text-green-600 px-3 py-1 rounded-full text-xs font-medium border border-green-500/20">
                    ⚡ Sub-second Response
                  </div>
                  <div className="bg-blue-500/10 text-blue-600 px-3 py-1 rounded-full text-xs font-medium border border-blue-500/20">
                    🔒 Enterprise Security
                  </div>
                  <div className="bg-purple-500/10 text-purple-600 px-3 py-1 rounded-full text-xs font-medium border border-purple-500/20">
                    🚀 Auto-scaling
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
