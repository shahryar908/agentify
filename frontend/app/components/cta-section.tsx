import { memo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Zap, Clock, Shield } from "lucide-react"

export const CTASection = memo(function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-purple-500/5 to-cyan-500/5 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      
      {/* Floating Orbs */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full blur-xl animate-float opacity-60" />
      <div className="absolute bottom-10 right-10 w-24 h-24 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-full blur-xl animate-float delay-1000 opacity-60" />
      
      <div className="container relative">
        <div className="mx-auto max-w-5xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 px-6 py-3 text-sm font-medium text-primary mb-8 animate-fade-in-up">
            <Sparkles className="h-4 w-4" />
            Ready to Experience AI?
          </div>

          {/* Main Heading */}
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8 animate-fade-in-up">
            <span className="bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent">
              Try My Agents
            </span>
            <span className="block text-foreground">Right Now</span>
          </h2>

          {/* Compelling Description */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in-up">
            Don't just read about AI agents—<span className="text-primary font-semibold">interact with them</span>. 
            Each agent is live and ready to show you what modern AI automation looks like in action.
          </p>

          {/* Quick Benefits */}
          <div className="flex flex-wrap justify-center gap-6 mb-12 animate-fade-in-up">
            <div className="flex items-center gap-2 text-sm bg-card/50 backdrop-blur-sm px-4 py-2 rounded-full border border-border/30">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="font-medium">No signup required</span>
            </div>
            <div className="flex items-center gap-2 text-sm bg-card/50 backdrop-blur-sm px-4 py-2 rounded-full border border-border/30">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="font-medium">Live demonstrations</span>
            </div>
            <div className="flex items-center gap-2 text-sm bg-card/50 backdrop-blur-sm px-4 py-2 rounded-full border border-border/30">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="font-medium">Real-time responses</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up">
            <Button 
              size="lg" 
              className="text-xl px-12 py-6 h-auto group relative overflow-hidden bg-gradient-to-r from-primary via-purple-500 to-cyan-500 hover:scale-105 transition-all duration-300 shadow-2xl" 
              asChild
            >
              <Link href="/chat" className="flex items-center gap-3">
                <span className="relative z-10 font-bold">Chat with My Agents</span>
                <ArrowRight className="relative z-10 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="font-medium">Free to try • No account needed</span>
            </div>
          </div>

          {/* Personal Touch */}
          <div className="mt-12 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl max-w-2xl mx-auto animate-fade-in-up">
            <p className="text-blue-700 dark:text-blue-300 font-semibold mb-2">
              💡 Developer's Note
            </p>
            <p className="text-sm text-muted-foreground">
              This is my personal showcase of AI agents I've built and deployed. Each one demonstrates different capabilities 
              and approaches to <span className="font-semibold text-foreground">solving real problems with AI</span>.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
})
