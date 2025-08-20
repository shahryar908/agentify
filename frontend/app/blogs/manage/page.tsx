'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff,
  Star,
  StarOff,
  Search,
  Filter,
  MoreVertical,
  Calendar,
  TrendingUp,
  FileText,
  Users,
  BarChart3,
  Settings,
  Loader2,
  AlertTriangle
} from 'lucide-react'
import { apiClient, BlogResponse, BlogStats } from '@/lib/api'

export default function BlogManagePage() {
  const [blogs, setBlogs] = useState<BlogResponse[]>([])
  const [stats, setStats] = useState<BlogStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all')
  const [selectedBlogs, setSelectedBlogs] = useState<Set<number>>(new Set())
  const [isDeleting, setIsDeleting] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchBlogs()
    fetchStats()
  }, [filterStatus])

  const fetchBlogs = async () => {
    try {
      setIsLoading(true)
      const published = filterStatus === 'published' ? true : filterStatus === 'draft' ? false : undefined
      const response = await apiClient.getBlogs({
        published,
        pageSize: 100,
        sortBy: 'updatedAt',
        sortOrder: 'desc'
      })
      setBlogs(response.blogs)
    } catch (error) {
      console.error('Error fetching blogs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const statsResponse = await apiClient.getBlogStats()
      setStats(statsResponse)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleDeleteBlog = async (blogId: number) => {
    if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      return
    }

    try {
      setIsDeleting(prev => new Set(prev).add(blogId))
      await apiClient.deleteBlog(blogId)
      setBlogs(prev => prev.filter(blog => blog.id !== blogId))
      fetchStats() // Refresh stats
    } catch (error) {
      console.error('Error deleting blog:', error)
      alert('Error deleting blog. Please try again.')
    } finally {
      setIsDeleting(prev => {
        const newSet = new Set(prev)
        newSet.delete(blogId)
        return newSet
      })
    }
  }

  const handleTogglePublished = async (blog: BlogResponse) => {
    try {
      await apiClient.updateBlog(blog.id, {
        published: !blog.published,
        publishedAt: !blog.published ? new Date().toISOString() : undefined
      })
      setBlogs(prev => prev.map(b => 
        b.id === blog.id 
          ? { ...b, published: !b.published, publishedAt: !b.published ? new Date().toISOString() : undefined }
          : b
      ))
      fetchStats()
    } catch (error) {
      console.error('Error updating blog:', error)
      alert('Error updating blog status. Please try again.')
    }
  }

  const handleToggleFeatured = async (blog: BlogResponse) => {
    try {
      await apiClient.updateBlog(blog.id, {
        featured: !blog.featured
      })
      setBlogs(prev => prev.map(b => 
        b.id === blog.id 
          ? { ...b, featured: !b.featured }
          : b
      ))
      fetchStats()
    } catch (error) {
      console.error('Error updating blog:', error)
      alert('Error updating featured status. Please try again.')
    }
  }

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.tags?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (published: boolean) => {
    return published 
      ? 'bg-green-500/10 text-green-600 border-green-500/20' 
      : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-primary/10 via-purple-500/10 to-cyan-500/10 rounded-full blur-3xl opacity-30" />
      
      <div className="container relative py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Blog Management</h1>
              <p className="text-muted-foreground">Manage your blog posts, categories, and content</p>
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/blogs">
                <Button variant="outline" className="border-2">
                  <Eye className="h-4 w-4 mr-2" />
                  View Blog
                </Button>
              </Link>
              <Link href="/blogs/new">
                <Button className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90">
                  <Plus className="h-4 w-4 mr-2" />
                  New Post
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="p-6 bg-card/50 backdrop-blur-sm border border-border/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-xl">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Posts</p>
                    <p className="text-2xl font-bold">{stats.totalBlogs}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 bg-card/50 backdrop-blur-sm border border-border/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 rounded-xl">
                    <Eye className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Published</p>
                    <p className="text-2xl font-bold">{stats.publishedBlogs}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 bg-card/50 backdrop-blur-sm border border-border/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/10 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Views</p>
                    <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 bg-card/50 backdrop-blur-sm border border-border/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-500/10 rounded-xl">
                    <Star className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Featured</p>
                    <p className="text-2xl font-bold">{stats.featuredBlogs}</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Filters and Search */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm border border-border/50">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-xl bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as 'all' | 'published' | 'draft')}
                    className="px-3 py-2 border border-border rounded-lg bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="all">All Posts</option>
                    <option value="published">Published</option>
                    <option value="draft">Drafts</option>
                  </select>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {filteredBlogs.length} post{filteredBlogs.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </Card>
        </div>

        {/* Blog Posts Table */}
        <Card className="bg-card/50 backdrop-blur-sm border border-border/50">
          {isLoading ? (
            <div className="p-16 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading blog posts...</p>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="p-16 text-center">
              <FileText className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
              <h3 className="text-xl font-bold mb-2">No blog posts found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || filterStatus !== 'all' 
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by creating your first blog post."}
              </p>
              <Link href="/blogs/new">
                <Button className="bg-gradient-to-r from-primary to-purple-500">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Post
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border/50">
                  <tr className="text-left">
                    <th className="p-4 font-medium text-muted-foreground">Title</th>
                    <th className="p-4 font-medium text-muted-foreground">Status</th>
                    <th className="p-4 font-medium text-muted-foreground">Category</th>
                    <th className="p-4 font-medium text-muted-foreground">Views</th>
                    <th className="p-4 font-medium text-muted-foreground">Updated</th>
                    <th className="p-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBlogs.map((blog, index) => (
                    <tr 
                      key={blog.id} 
                      className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-foreground line-clamp-1">
                                {blog.title}
                              </h3>
                              {blog.featured && (
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              )}
                            </div>
                            {blog.excerpt && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {blog.excerpt}
                              </p>
                            )}
                            {blog.tags && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {blog.tags.split(',').slice(0, 3).map((tag, tagIndex) => (
                                  <span
                                    key={tagIndex}
                                    className="inline-block text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                                  >
                                    {tag.trim()}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex flex-col gap-2">
                          <Badge className={`w-fit ${getStatusColor(blog.published)}`}>
                            {blog.published ? 'Published' : 'Draft'}
                          </Badge>
                          {blog.readTime && (
                            <span className="text-xs text-muted-foreground">
                              {blog.readTime} min read
                            </span>
                          )}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        {blog.category ? (
                          <Badge variant="secondary" className="text-xs">
                            {blog.category}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{blog.views}</span>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {formatDate(blog.updatedAt)}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {/* Quick Actions */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTogglePublished(blog)}
                            className="h-8 w-8 p-0"
                            title={blog.published ? 'Unpublish' : 'Publish'}
                          >
                            {blog.published ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleFeatured(blog)}
                            className="h-8 w-8 p-0"
                            title={blog.featured ? 'Remove from featured' : 'Mark as featured'}
                          >
                            {blog.featured ? (
                              <StarOff className="h-4 w-4" />
                            ) : (
                              <Star className="h-4 w-4" />
                            )}
                          </Button>
                          
                          {/* Edit */}
                          <Link href={`/blogs/${blog.slug}/edit`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          </Link>
                          
                          {/* View */}
                          <Link href={`/blogs/${blog.slug}`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          
                          {/* Delete */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteBlog(blog.id)}
                            disabled={isDeleting.has(blog.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            {isDeleting.has(blog.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}