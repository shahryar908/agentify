'use client'

import { memo, useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, ArrowRight, BookOpen, Sparkles } from "lucide-react"
import { apiClient, type Blog } from "@/lib/api"

export const BlogHighlights = memo(function BlogHighlights() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchBlogs()
  }, [])

  const fetchBlogs = async () => {
    try {
      const data = await apiClient.getBlogs()
      setBlogs(data.blogs.slice(0, 3)) // Show only first 3 for highlights
    } catch (error) {
      console.error('Error fetching blogs:', error)
      // Use fallback data for demonstration
      setBlogs([
        {
          id: 1,
          title: "Building Autonomous AI Agents: A Complete Guide",
          slug: "building-autonomous-ai-agents-guide",
          excerpt: "Learn how to create intelligent agents that can reason, plan, and execute tasks autonomously using modern AI techniques and frameworks.",
          tags: "AI,Autonomous Agents,Machine Learning,Tutorial",
          readTime: 8,
          createdAt: new Date().toISOString(),
          agent: { name: "Autonomous Agent", type: "autonomous" }
        },
        {
          id: 2,
          title: "The Future of Multi-Agent Systems",
          slug: "future-of-multi-agent-systems",
          excerpt: "Exploring how multiple AI agents can collaborate to solve complex problems and create more intelligent solutions for businesses.",
          tags: "Multi-Agent,Collaboration,AI Systems,Innovation",
          readTime: 12,
          createdAt: new Date().toISOString(),
          agent: { name: "Intelligent Agent", type: "intelligent" }
        },
        {
          id: 3,
          title: "Integrating LLMs with Tool-Using Agents",
          slug: "integrating-llms-with-tools",
          excerpt: "A deep dive into how large language models can be enhanced with external tools to create more capable and practical AI agents.",
          tags: "LLM,Tools,Integration,APIs,Enhancement",
          readTime: 15,
          createdAt: new Date().toISOString(),
          agent: { name: "Math Agent", type: "math" }
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getAgentColor = (type: string) => {
    switch (type) {
      case 'math':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'intelligent':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'autonomous':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="container">
          <div className="text-center mb-16">
            <div className="h-10 bg-muted rounded w-1/3 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-muted rounded w-2/3 mx-auto animate-pulse"></div>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 bg-muted rounded-2xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      
      <div className="container relative">
        <div className="text-center mb-16">
          {/* Section Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            My Development Journey
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Behind the Scenes:
            <span className="bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent"> My Building Process</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Step-by-step tutorials showing exactly how I built each agent. Learn from my process, 
            see the code, understand the challenges, and discover the solutions I found.
          </p>
        </div>

        {blogs.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-card/50 backdrop-blur-sm rounded-3xl p-12 border border-border/50 max-w-md mx-auto">
              <BookOpen className="h-16 w-16 mx-auto mb-6 text-primary" />
              <h3 className="text-2xl font-bold mb-4">Tutorials Coming Soon</h3>
              <p className="text-muted-foreground mb-6">
                I'm currently writing detailed tutorials about how I built each agent. 
                Check back soon for step-by-step guides and code walkthroughs!
              </p>
              <Link href="/blogs/new">
                <Button size="lg">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Follow My Progress
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog, index) => (
                <Link key={blog.id} href={`/blogs/${blog.slug}`}>
                  <article 
                    className="group relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Glow Effect */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 via-purple-500/50 to-cyan-500/50 rounded-2xl blur opacity-0 group-hover:opacity-25 transition-opacity duration-300" />
                    
                    {/* Content */}
                    <div className="relative p-8">
                      {/* Header */}
                      <div className="mb-6">
                        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                          {blog.title}
                        </h3>
                        <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                          {blog.excerpt}
                        </p>
                      </div>

                      {/* Tags */}
                      {blog.tags && (
                        <div className="mb-6">
                          <div className="flex flex-wrap gap-2">
                            {blog.tags.split(',').slice(0, 3).map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md font-medium"
                              >
                                {tag.trim()}
                              </span>
                            ))}
                            {blog.tags.split(',').length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{blog.tags.split(',').length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-6 border-t border-border/30">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(blog.createdAt)}
                          </div>
                          {blog.readTime && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {blog.readTime} min
                            </div>
                          )}
                        </div>
                        {blog.agent && (
                          <Badge className={`text-xs ${getAgentColor(blog.agent.type)}`}>
                            {blog.agent.type}
                          </Badge>
                        )}
                      </div>

                      {/* Read More Indicator */}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-primary text-primary-foreground p-2 rounded-full shadow-lg">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {/* CTA Section */}
            <div className="text-center mt-16">
              <div className="bg-gradient-to-r from-primary/5 via-purple-500/5 to-cyan-500/5 rounded-3xl p-8 border border-primary/10">
                <h3 className="text-2xl font-bold mb-4">Want the Full Story?</h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Explore my complete collection of tutorials, development insights, and behind-the-scenes looks at building AI agents.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/blogs">
                    <Button size="lg" className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90">
                      Read My Tutorials
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/blogs/new">
                    <Button variant="outline" size="lg">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Follow My Journey
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
})
