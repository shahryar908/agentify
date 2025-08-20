'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
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
  Loader2,
  Trash2,
  AlertTriangle
} from 'lucide-react'
import { apiClient, BlogResponse, BlogUpdate } from '@/lib/api'

interface BlogEditPageProps {
  params: Promise<{
    slug: string
  }>
}

export default function BlogEditPage({ params }: BlogEditPageProps) {
  const router = useRouter()
  const [blog, setBlog] = useState<BlogResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [slug, setSlug] = useState<string>('')

  const [blogData, setBlogData] = useState<BlogUpdate & { slug?: string }>({
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

  const fetchBlog = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getBlogBySlug(slug)
      setBlog(response)
      
      // Populate form data
      setBlogData({
        title: response.title,
        slug: response.slug,
        excerpt: response.excerpt || '',
        content: response.content,
        tags: response.tags || '',
        category: response.category || '',
        readTime: response.readTime || 5,
        published: response.published,
        featured: response.featured,
        metaTitle: response.metaTitle || '',
        metaDescription: response.metaDescription || '',
        metaKeywords: response.metaKeywords || ''
      })
    } catch (error) {
      console.error('Error fetching blog:', error)
      router.push('/blogs')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof BlogUpdate | 'slug', value: string | number | boolean) => {
    setBlogData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (publish: boolean = false) => {
    if (!blog || !blogData.title || !blogData.content) {
      alert('Please fill in title and content')
      return
    }

    try {
      setIsSaving(true)
      
      const submitData: BlogUpdate = {
        title: blogData.title,
        excerpt: blogData.excerpt,
        content: blogData.content,
        tags: blogData.tags,
        category: blogData.category,
        readTime: blogData.readTime,
        published: publish,
        featured: blogData.featured,
        metaTitle: blogData.metaTitle || blogData.title,
        metaDescription: blogData.metaDescription || blogData.excerpt
      }

      const response = await apiClient.updateBlog(blog.id, submitData)
      
      if (publish) {
        router.push(`/blogs/${response.slug}`)
      } else {
        router.push('/blogs/manage')
      }
      
    } catch (error) {
      console.error('Error updating blog:', error)
      alert('Error updating blog. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!blog) return

    if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      return
    }

    try {
      setIsDeleting(true)
      await apiClient.deleteBlog(blog.id)
      router.push('/blogs/manage')
    } catch (error) {
      console.error('Error deleting blog:', error)
      alert('Error deleting blog. Please try again.')
    } finally {
      setIsDeleting(false)
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        
        <div className="container relative py-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Loading blog post...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        
        <div className="container relative py-12">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="p-16 bg-card/50 backdrop-blur-sm border border-border/50">
              <AlertTriangle className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
              <h1 className="text-2xl font-bold mb-4">Blog Post Not Found</h1>
              <p className="text-muted-foreground mb-6">
                The blog post you're trying to edit doesn't exist or has been removed.
              </p>
              <Link href="/blogs/manage">
                <Button className="bg-gradient-to-r from-primary to-purple-500">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Management
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    )
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
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Link href="/blogs/manage">
                  <Button variant="ghost" className="hover:bg-muted/50">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Management
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Edit Blog Post</h1>
                  <p className="text-muted-foreground">Update your blog content and settings</p>
                </div>
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
                
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="border-2"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete
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
                      <span>{blog.author}</span>
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
                <div className="prose prose-lg max-w-none dark:prose-invert">
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
                        value={blogData.title || ''}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Enter your blog title..."
                        className="w-full px-4 py-3 border border-border rounded-xl bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Excerpt</label>
                      <textarea
                        value={blogData.excerpt || ''}
                        onChange={(e) => handleInputChange('excerpt', e.target.value)}
                        placeholder="Brief description of your blog post..."
                        rows={3}
                        className="w-full px-4 py-3 border border-border rounded-xl bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all resize-vertical"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Content * (Markdown supported)</label>
                      <textarea
                        value={blogData.content || ''}
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
                          checked={blogData.featured || false}
                          onChange={(e) => handleInputChange('featured', e.target.checked)}
                          className="rounded border-border text-primary focus:ring-primary/50"
                        />
                        <span className="text-sm">Featured Post</span>
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Category</label>
                      <select
                        value={blogData.category || ''}
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
                        value={blogData.tags || ''}
                        onChange={(e) => handleInputChange('tags', e.target.value)}
                        placeholder="AI, Tutorial, Python..."
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Estimated Read Time (minutes)</label>
                      <input
                        type="number"
                        value={blogData.readTime || 5}
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
                      <label className="block text-sm font-medium mb-2">Meta Title</label>
                      <input
                        type="text"
                        value={blogData.metaTitle || ''}
                        onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                        placeholder="SEO optimized title..."
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Meta Description</label>
                      <textarea
                        value={blogData.metaDescription || ''}
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
                        value={blogData.metaKeywords || ''}
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
                      disabled={isSaving || !blogData.title || !blogData.content}
                      className="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {isSaving ? 'Updating...' : 'Update & Publish'}
                    </Button>
                    
                    <Button
                      onClick={() => handleSubmit(false)}
                      disabled={isSaving || !blogData.title || !blogData.content}
                      variant="outline"
                      className="w-full border-2"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      {isSaving ? 'Saving...' : 'Save as Draft'}
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