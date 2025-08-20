'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Sparkles,
  BookOpen,
  User,
  Calendar,
  Clock,
  Tag,
  FileText,
  Globe,
  Loader2
} from 'lucide-react'
import { apiClient, BlogCreate } from '@/lib/api'

export default function NewBlogPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [blogData, setBlogData] = useState<BlogCreate>({
    title: '',
    excerpt: '',
    content: '',
    tags: '',
    category: '',
    readTime: 5,
    published: false,
    featured: false,
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    slug: ''
  })
  const [previewMode, setPreviewMode] = useState(false)

  const handleInputChange = (field: keyof BlogCreate, value: string | number | boolean) => {
    setBlogData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Auto-generate slug from title
    if (field === 'title' && typeof value === 'string') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      
      setBlogData(prev => ({
        ...prev,
        slug: slug
      }))
    }
  }

  const handleSubmit = async (publish: boolean = false) => {
    if (!blogData.title || !blogData.content) {
      alert('Please fill in title and content')
      return
    }

    try {
      setIsLoading(true)
      
      const submitData = {
        ...blogData,
        published: publish,
        metaTitle: blogData.metaTitle || blogData.title,
        metaDescription: blogData.metaDescription || blogData.excerpt
      }

      const response = await apiClient.createBlog(submitData)
      
      if (publish) {
        router.push(`/blogs/${response.slug}`)
      } else {
        router.push('/blogs/manage')
      }
      
    } catch (error) {
      console.error('Error creating blog:', error)
      alert('Error creating blog. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const estimateReadTime = (content: string) => {
    const wordsPerMinute = 200
    const wordCount = content.split(/\s+/).length
    return Math.ceil(wordCount / wordsPerMinute)
  }

  const handleContentChange = (content: string) => {
    handleInputChange('content', content)
    handleInputChange('readTime', estimateReadTime(content))
  }

  const extractTags = (tagsString: string) => {
    return tagsString ? tagsString.split(',').map(tag => tag.trim()).filter(tag => tag) : []
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-primary/10 via-purple-500/10 to-cyan-500/10 rounded-full blur-3xl opacity-30" />
      
      <div className="container relative py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link href="/blogs">
              <Button variant="ghost" className="mb-6 hover:bg-muted/50">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blogs
              </Button>
            </Link>
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Create New Blog Post</h1>
                <p className="text-muted-foreground">Share your AI agent knowledge with the community</p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPreviewMode(!previewMode)}
                  className="border-2"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {previewMode ? 'Edit' : 'Preview'}
                </Button>
              </div>
            </div>
          </div>

          {previewMode ? (
            // Preview Mode
            <div className="space-y-8">
              <Card className="p-8 bg-card/50 backdrop-blur-sm border border-border/50 shadow-xl">
                {/* Preview Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    {blogData.featured && (
                      <Badge className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-600 border-yellow-500/30">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {blogData.category && (
                      <Badge variant="secondary">
                        {blogData.category}
                      </Badge>
                    )}
                    <Badge variant={blogData.published ? "default" : "secondary"}>
                      {blogData.published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  
                  <h1 className="text-4xl font-bold tracking-tight mb-4">
                    {blogData.title || "Your Blog Title"}
                  </h1>
                  
                  {blogData.excerpt && (
                    <p className="text-xl text-muted-foreground mb-6">
                      {blogData.excerpt}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>You</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{blogData.readTime} min read</span>
                    </div>
                  </div>
                  
                  {blogData.tags && extractTags(blogData.tags).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {extractTags(blogData.tags).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-3 py-1 rounded-full"
                        >
                          <Tag className="h-3 w-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Preview Content */}
                <div className="prose prose-lg max-w-none">
                  {blogData.content ? (
                    blogData.content.split('\n').map((line, index) => {
                      if (line.startsWith('# ')) {
                        return <h1 key={index} className="text-3xl font-bold mt-8 mb-4 first:mt-0">{line.substring(2)}</h1>
                      }
                      if (line.startsWith('## ')) {
                        return <h2 key={index} className="text-2xl font-bold mt-6 mb-3">{line.substring(3)}</h2>
                      }
                      if (line.startsWith('### ')) {
                        return <h3 key={index} className="text-xl font-bold mt-4 mb-2">{line.substring(4)}</h3>
                      }
                      if (line.startsWith('```')) {
                        return <div key={index} className="bg-muted p-4 rounded-lg my-4 font-mono text-sm overflow-x-auto">{line}</div>
                      }
                      if (line.trim() === '') {
                        return <br key={index} />
                      }
                      return <p key={index} className="mb-4">{line}</p>
                    })
                  ) : (
                    <p className="text-muted-foreground italic">Start writing your blog content to see preview...</p>
                  )}
                </div>
              </Card>
            </div>
          ) : (
            // Edit Mode
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <Card className="p-6 bg-card/50 backdrop-blur-sm border border-border/50">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Blog Content
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Title *</label>
                      <input
                        type="text"
                        value={blogData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Enter your blog title..."
                        className="w-full px-4 py-3 border border-border rounded-xl bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Excerpt</label>
                      <textarea
                        value={blogData.excerpt}
                        onChange={(e) => handleInputChange('excerpt', e.target.value)}
                        placeholder="Brief description of your blog post..."
                        rows={3}
                        className="w-full px-4 py-3 border border-border rounded-xl bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all resize-vertical"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Content * (Markdown supported)</label>
                      <textarea
                        value={blogData.content}
                        onChange={(e) => handleContentChange(e.target.value)}
                        placeholder="Write your blog content here... Use # for headers, ```code``` for code blocks..."
                        rows={20}
                        className="w-full px-4 py-3 border border-border rounded-xl bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all resize-vertical font-mono text-sm"
                      />
                    </div>
                  </div>
                </Card>
              </div>
              
              {/* Sidebar */}
              <div className="space-y-6">
                {/* Publishing Options */}
                <Card className="p-6 bg-card/50 backdrop-blur-sm border border-border/50">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Publishing
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={blogData.featured}
                          onChange={(e) => handleInputChange('featured', e.target.checked)}
                          className="rounded border-border text-primary focus:ring-primary/50"
                        />
                        <span className="text-sm">Featured Post</span>
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Category</label>
                      <select
                        value={blogData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="">Select Category</option>
                        <option value="Tutorial">Tutorial</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Case Study">Case Study</option>
                        <option value="Tips & Tricks">Tips & Tricks</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                      <input
                        type="text"
                        value={blogData.tags}
                        onChange={(e) => handleInputChange('tags', e.target.value)}
                        placeholder="AI, Tutorial, Python..."
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Estimated Read Time (minutes)</label>
                      <input
                        type="number"
                        value={blogData.readTime}
                        onChange={(e) => handleInputChange('readTime', parseInt(e.target.value))}
                        min="1"
                        max="60"
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>
                </Card>
                
                {/* SEO Settings */}
                <Card className="p-6 bg-card/50 backdrop-blur-sm border border-border/50">
                  <h3 className="text-lg font-bold mb-4">SEO Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">URL Slug</label>
                      <input
                        type="text"
                        value={blogData.slug}
                        onChange={(e) => handleInputChange('slug', e.target.value)}
                        placeholder="url-friendly-slug"
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Meta Title</label>
                      <input
                        type="text"
                        value={blogData.metaTitle}
                        onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                        placeholder="SEO optimized title..."
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Meta Description</label>
                      <textarea
                        value={blogData.metaDescription}
                        onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                        placeholder="SEO meta description..."
                        rows={3}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-vertical"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Keywords</label>
                      <input
                        type="text"
                        value={blogData.metaKeywords}
                        onChange={(e) => handleInputChange('metaKeywords', e.target.value)}
                        placeholder="keyword1, keyword2, keyword3..."
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                      />
                    </div>
                  </div>
                </Card>
                
                {/* Action Buttons */}
                <Card className="p-6 bg-card/50 backdrop-blur-sm border border-border/50">
                  <div className="space-y-3">
                    <Button
                      onClick={() => handleSubmit(true)}
                      disabled={isLoading || !blogData.title || !blogData.content}
                      className="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {isLoading ? 'Publishing...' : 'Publish Post'}
                    </Button>
                    
                    <Button
                      onClick={() => handleSubmit(false)}
                      disabled={isLoading || !blogData.title || !blogData.content}
                      variant="outline"
                      className="w-full border-2"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      {isLoading ? 'Saving...' : 'Save as Draft'}
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}