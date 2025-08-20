'use client'

import { memo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  ArrowRight, 
  CheckCircle,
  Zap,
  Target
} from "lucide-react"

export const ValueProposition = memo(function ValueProposition() {
  const benefits = [
    {
      icon: Target,
      title: "Math Agent",
      description: "Specialized in calculations, equations, and mathematical operations",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20"
    },
    {
      icon: Zap,
      title: "Web Research Agent", 
      description: "Searches the web, gets weather data, and fetches current information",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20"
    },
    {
      icon: TrendingUp,
      title: "Autonomous Agent",
      description: "Advanced planning and decision-making with multi-step reasoning",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20"
    },
    {
      icon: Shield,
      title: "Always Learning",
      description: "Continuously improving and adding new agents to the collection",
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/20"
    }
  ]

  const features = [
    "Interactive chat interface",
    "Live agent demonstrations",
    "Step-by-step tutorials",
    "Open source code examples",
    "Real-time tool execution",
    "Personal development insights"
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-background via-muted/30 to-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      
      <div className="container relative">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-6 px-4 py-2 bg-gradient-to-r from-primary/10 to-purple-500/10 text-primary border-primary/20">
            <Target className="h-4 w-4 mr-2" />
            My Agent Collection
          </Badge>
          
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Meet the Agents I've
            <span className="block bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent">
              Built & Deployed
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Each agent solves real-world problems and demonstrates different AI capabilities. 
            Try them out, see how they work, and learn from the tutorials I've written about building them.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {benefits.map((benefit, index) => (
            <div 
              key={benefit.title}
              className="group relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Glow Effect */}
              <div className={`absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-purple-500/50 rounded-2xl blur opacity-0 group-hover:opacity-25 transition-opacity`} />
              
              <div className="relative">
                <div className={`${benefit.bgColor} ${benefit.borderColor} border p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform`}>
                  <benefit.icon className={`h-6 w-6 ${benefit.color}`} />
                </div>
                
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {benefit.title}
                </h3>
                
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Checklist & CTA */}
        <div className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-border/50 shadow-2xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Features List */}
            <div>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Zap className="h-6 w-6 text-primary" />
                What You'll Find Here
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {features.map((feature, index) => (
                  <div 
                    key={feature}
                    className="flex items-center gap-3 group animate-slide-in-left"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CheckCircle className="h-5 w-5 text-green-500 group-hover:scale-110 transition-transform" />
                    <span className="text-foreground font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="text-center md:text-left">
              <h3 className="text-3xl font-bold mb-4">
                Ready to Explore?
              </h3>
              
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Start with any agent that interests you, or dive into the tutorials 
                to see how I built them from scratch.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  size="lg" 
                  className="px-8 py-4 h-auto text-lg font-semibold group relative overflow-hidden" 
                  asChild
                >
                  <Link href="/chat" className="flex items-center gap-2">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative z-10">Try My Agents</span>
                    <ArrowRight className="relative z-10 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="px-8 py-4 h-auto text-lg font-semibold border-2 hover:border-primary/50" 
                  asChild
                >
                  <Link href="/blogs">
                    Read My Tutorials
                  </Link>
                </Button>
              </div>

              {/* Personal Badge */}
              <div className="flex items-center justify-center md:justify-start gap-2 mt-6 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Personal project • Built with passion for learning</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
})