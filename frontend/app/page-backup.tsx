'use client'

import { HeroSection } from "@/components/hero-section"
import { ValueProposition } from "@/components/value-proposition"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import dynamic from "next/dynamic"

const FeaturedAgents = dynamic(
  () => import("@/components/featured-agents").then((mod) => ({ default: mod.FeaturedAgents })),
  {
    ssr: false,
    loading: () => (
      <div className="py-20 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
)

const HowItWorks = dynamic(() => import("@/components/how-it-works").then((mod) => ({ default: mod.HowItWorks })), {
  ssr: false,
  loading: () => (
    <div className="py-20">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 animate-pulse bg-muted rounded-full"></div>
              <div className="h-4 animate-pulse bg-muted rounded mb-2"></div>
              <div className="h-3 animate-pulse bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
})

const BlogHighlights = dynamic(
  () => import("@/components/blog-highlights").then((mod) => ({ default: mod.BlogHighlights })),
  {
    ssr: false,
    loading: () => (
      <div className="py-20 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
)

const CTASection = dynamic(() => import("@/components/cta-section").then((mod) => ({ default: mod.CTASection })), {
  ssr: false,
  loading: () => (
    <div className="py-20">
      <div className="container text-center">
        <div className="h-8 animate-pulse bg-muted rounded mb-4 max-w-md mx-auto"></div>
        <div className="h-4 animate-pulse bg-muted rounded mb-8 max-w-lg mx-auto"></div>
        <div className="h-12 animate-pulse bg-muted rounded-xl max-w-xs mx-auto"></div>
      </div>
    </div>
  ),
})

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <ValueProposition />
        <FeaturedAgents />
        <HowItWorks />
        <BlogHighlights />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}