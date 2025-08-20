'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Eye,
  Heart,
  Share2,
  BookOpen,
  User,
  Tag,
  Sparkles,
  MoreHorizontal,
  Bookmark,
  MessageCircle,
  ChevronUp
} from 'lucide-react'
import { apiClient, BlogResponse } from '@/lib/api'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface BlogDetailPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
  const [blog, setBlog] = useState<BlogResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLiking, setIsLiking] = useState(false)
  const [slug, setSlug] = useState<string>('')
  const [readingProgress, setReadingProgress] = useState(0)
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setSlug(resolvedParams.slug)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (slug) {
      fetchBlog()
    }
  }, [slug])

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (window.scrollY / totalHeight) * 100
      setReadingProgress(progress)
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fetchBlog = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getBlogBySlug(slug)
      setBlog(response)
    } catch (error) {
      console.error('Error fetching blog:', error)
      setBlog(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async () => {
    if (!blog || isLiking) return
    
    try {
      setIsLiking(true)
      await apiClient.likeBlog(blog.id)
      setBlog({ ...blog, likes: blog.likes + 1 })
    } catch (error) {
      console.error('Error liking blog:', error)
    } finally {
      setIsLiking(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const extractTags = (tagsString: string) => {
    return tagsString ? tagsString.split(',').map(tag => tag.trim()) : []
  }

  const handleShare = async () => {
    if (navigator.share && blog) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.excerpt || 'Check out this AI agent tutorial',
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href)
        alert('Link copied to clipboard!')
      } catch (error) {
        console.log('Could not copy to clipboard')
      }
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const CustomMarkdown = ({ children }: { children: string }) => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            return !inline && match ? (
              <SyntaxHighlighter
                style={oneDark}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code {...props}>
                {children}
              </code>
            )
          },
        }}
      >
        {children}
      </ReactMarkdown>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 mx-auto mb-6 text-gray-400" />
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Article Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/blogs">
            <Button className="bg-primary hover:bg-primary/90">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Articles
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200 dark:bg-gray-700">
        <div 
          className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/blogs">
              <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                All Articles
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                disabled={isLiking}
                className="text-gray-600 dark:text-gray-400 hover:text-red-500"
              >
                <Heart className={`h-4 w-4 mr-1 ${isLiking ? 'animate-pulse' : ''}`} />
                {blog.likes}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShare} className="text-gray-600 dark:text-gray-400">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Article Content */}
      <article className="max-w-3xl mx-auto px-6 py-12">
        {/* Article Header */}
        <header className="mb-12">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {blog.featured && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 px-3 py-1">
                <Sparkles className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
            {blog.category && (
              <Badge variant="secondary" className="px-3 py-1 text-sm">
                {blog.category}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight text-gray-900 dark:text-white">
            {blog.title}
          </h1>

          {/* Subtitle/Excerpt */}
          {blog.excerpt && (
            <p className="text-2xl leading-relaxed text-gray-600 dark:text-gray-400 mb-8 font-light max-w-3xl">
              {blog.excerpt}
            </p>
          )}

          {/* Author and Meta */}
          <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 pb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-purple-500 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{blog.author}</div>
                <div className="text-sm">AI Developer</div>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{blog.readTime} min read</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>{blog.views.toLocaleString()} views</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {blog.tags && (
            <div className="flex flex-wrap gap-2 mt-6">
              {extractTags(blog.tags).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Article Body */}
        <div className="max-w-none">
          <div className="prose-blog reading-font">
            <CustomMarkdown>{blog.content}</CustomMarkdown>
          </div>
        </div>

        {/* Article Footer */}
        <footer className="mt-16 pt-12 border-t border-gray-200 dark:border-gray-700">
          {/* Tags Section */}
          {blog.tags && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Topics</h3>
              <div className="flex flex-wrap gap-3">
                {extractTags(blog.tags).map((tag, index) => (
                  <Link key={index} href={`/blogs?tags=${encodeURIComponent(tag)}`}>
                    <Badge 
                      variant="secondary" 
                      className="px-4 py-2 text-sm hover:bg-primary hover:text-white transition-colors cursor-pointer"
                    >
                      {tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Engagement Actions */}
          <div className="flex items-center justify-between py-6 border-y border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleLike}
                disabled={isLiking}
                variant="outline"
                className="flex items-center gap-2 px-6 py-3"
              >
                <Heart className={`h-5 w-5 ${isLiking ? 'animate-pulse text-red-500' : ''}`} />
                <span className="font-medium">{blog.likes}</span>
                <span className="hidden sm:inline">likes</span>
              </Button>
              
              <Button variant="outline" className="flex items-center gap-2 px-6 py-3">
                <MessageCircle className="h-5 w-5" />
                <span className="font-medium">0</span>
                <span className="hidden sm:inline">comments</span>
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Bookmark className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-12 text-center">
            <Card className="p-8 bg-gradient-to-r from-primary/5 via-purple-500/5 to-cyan-500/5 border border-primary/20">
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Ready to Build Your Own Agents?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                Try out my live agents to see what's possible, then follow my tutorials to build your own. 
                Each guide includes complete source code and detailed explanations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/chat">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90">
                    Try My Agents
                  </Button>
                </Link>
                <Link href="/blogs">
                  <Button variant="outline" size="lg" className="border-2">
                    <BookOpen className="h-4 w-4 mr-2" />
                    More Tutorials
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </footer>
      </article>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 rounded-full w-12 h-12 p-0 bg-primary hover:bg-primary/90 shadow-lg"
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
      )}

    </div>
  )
}