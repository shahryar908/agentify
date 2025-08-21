'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { 
  Search, 
  Calendar, 
  Clock, 
  User, 
  Filter, 
  ArrowRight,
  Sparkles,
  Eye,
  Heart,
  BookOpen,
  TrendingUp,
  Tag,
  Grid3X3,
  List,
  Settings
} from 'lucide-react'
import { apiClient, BlogListResponse, BlogResponse } from '@/lib/api'

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<BlogResponse[]>([])
  const [filteredBlogs, setFilteredBlogs] = useState<BlogResponse[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [selectedAgentType, setSelectedAgentType] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')

  useEffect(() => {
    fetchBlogs()
  }, [currentPage, sortBy, sortOrder])

  useEffect(() => {
    if (searchTerm || selectedCategory || selectedTag || selectedAgentType) {
      handleSearch()
    } else {
      setFilteredBlogs(blogs)
    }
  }, [blogs, searchTerm, selectedCategory, selectedTag, selectedAgentType])

  const fetchBlogs = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getBlogs({
        page: currentPage,
        pageSize: 12,
        published: true,
        sortBy,
        sortOrder: sortOrder as 'asc' | 'desc'
      })
      setBlogs(response.blogs)
      setTotalPages(response.totalPages)
    } catch (error) {
      console.error('Error fetching blogs:', error)
      // Fallback to empty state
      setBlogs([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getBlogs({
        q: searchTerm,
        category: selectedCategory,
        tags: selectedTag,
        agentType: selectedAgentType,
        page: currentPage,
        pageSize: 12,
        published: true,
        sortBy,
        sortOrder: sortOrder as 'asc' | 'desc'
      })
      setFilteredBlogs(response.blogs)
      setTotalPages(response.totalPages)
    } catch (error) {
      console.error('Error searching blogs:', error)
      setFilteredBlogs([])
    } finally {
      setIsLoading(false)
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setSelectedTag('')
    setSelectedAgentType('')
    setCurrentPage(1)
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
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
      case 'intelligent':
        return 'bg-green-500/10 text-green-600 border-green-500/20'
      case 'autonomous':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20'
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20'
    }
  }

  const extractTags = (tagsString: string) => {
    return tagsString ? tagsString.split(',').map(tag => tag.trim()) : []
  }

  if (isLoading && blogs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        
        <div className="container relative py-12">
          {/* Header Skeleton */}
          <div className="text-center mb-16">
            <div className="h-8 bg-muted rounded-lg w-1/3 mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 bg-muted rounded-lg w-2/3 mx-auto animate-pulse"></div>
          </div>
          
          {/* Content Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-96 bg-muted/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const displayBlogs = filteredBlogs.length > 0 ? filteredBlogs : blogs

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/5">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/[0.02] via-purple-500/[0.02] to-pink-500/[0.02]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-r from-blue-500/[0.08] via-purple-500/[0.08] to-pink-500/[0.08] rounded-full blur-3xl opacity-40" />
      </div>
      
      <div className="container relative py-16">
        {/* Enhanced Header */}
        <div className="text-center mb-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 px-6 py-3 rounded-full text-sm font-medium mb-8 border border-blue-200/50 dark:border-blue-800/30">
            <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-blue-800 dark:text-blue-300">Development Tutorials & Insights</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 leading-[0.9]">
            <span className="bg-gradient-to-r from-gray-900 via-blue-700 to-purple-700 dark:from-white dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent">
              AI Agent Building
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Journey & Tutorials
            </span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-8">
            Step-by-step guides showing exactly how I built each AI agent. Learn from my process, 
            see the code, understand the challenges, and discover the solutions I found along the way.
          </p>

          {/* Additional info badges */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Updated Weekly</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-500" />
              <span>Complete Source Code</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span>Real-World Examples</span>
            </div>
          </div>
        </div>

        {/* Enhanced Search and Filters */}
        <div className="mb-16">
          <Card className="p-8 bg-gradient-to-br from-white via-white to-gray-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/50 backdrop-blur-sm border-0 shadow-2xl shadow-black/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/[0.02] via-purple-500/[0.02] to-pink-500/[0.02]" />
            <div className="relative">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Find Your Perfect Tutorial</h2>
                <p className="text-muted-foreground">Search through detailed guides and filter by complexity or agent type</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search tutorials..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-900/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
                  />
                </div>

                {/* Category Filter */}
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-900/50 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-medium"
                  >
                    <option value="">All Categories</option>
                    <option value="Tutorial">Tutorial</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Case Study">Case Study</option>
                    <option value="Tips & Tricks">Tips & Tricks</option>
                  </select>
                </div>

                {/* Agent Type Filter */}
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <select
                    value={selectedAgentType}
                    onChange={(e) => setSelectedAgentType(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-900/50 text-foreground focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all font-medium"
                  >
                    <option value="">All Agent Types</option>
                    <option value="math">Math Agent</option>
                    <option value="intelligent">Web Agent</option>
                    <option value="autonomous">Autonomous Agent</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  disabled={!searchTerm && !selectedCategory && !selectedTag && !selectedAgentType}
                  className="h-16 px-6 border-2 border-red-200 hover:border-red-300 dark:border-red-800 dark:hover:border-red-700 bg-white/50 dark:bg-gray-900/50 font-semibold text-red-600 dark:text-red-400 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300"
                >
                  Clear Filters
                </Button>
              </div>

              {/* View Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {displayBlogs.length} tutorial{displayBlogs.length !== 1 ? 's' : ''} found
                  </span>
                  
                  {/* Sort Controls */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="text-sm bg-background/50 border border-border rounded-lg px-2 py-1"
                    >
                      <option value="createdAt">Date</option>
                      <option value="views">Views</option>
                      <option value="likes">Likes</option>
                      <option value="title">Title</option>
                    </select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="h-8 w-8 p-0"
                    >
                      <TrendingUp className={`h-4 w-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Admin Controls */}
                  <div className="flex items-center gap-2">
                    <Link href="/blogs/manage">
                      <Button variant="outline" className="border-2">
                        <Settings className="h-4 w-4 mr-2" />
                        Manage
                      </Button>
                    </Link>
                    <Link href="/blogs/new">
                      <Button className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Create Blog
                      </Button>
                    </Link>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="h-8 w-8 p-0"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="h-8 w-8 p-0"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Blog Grid/List */}
        {displayBlogs.length === 0 ? (
          <Card className="p-16 text-center bg-card/50 backdrop-blur-sm border border-border/50">
            <BookOpen className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
            <h3 className="text-2xl font-bold mb-4">No tutorials found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchTerm || selectedCategory || selectedTag || selectedAgentType
                ? "Try adjusting your search or filter criteria."
                : "I'm currently writing detailed tutorials about how I built each agent. Check back soon!"}
            </p>
            {(searchTerm || selectedCategory || selectedTag || selectedAgentType) && (
              <Button onClick={clearFilters} className="bg-gradient-to-r from-primary to-purple-500">
                Clear All Filters
              </Button>
            )}
          </Card>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
            : "space-y-6"
          }>
            {displayBlogs.map((blog, index) => (
              <Link key={blog.id} href={`/blogs/${blog.slug}`}>
                <Card className={`group relative overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer bg-card/50 backdrop-blur-sm border border-border/50 animate-fade-in-up ${
                  viewMode === 'list' ? 'flex p-6' : 'p-6 h-full'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Glow Effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 via-purple-500/50 to-cyan-500/50 rounded-2xl blur opacity-0 group-hover:opacity-25 transition-opacity duration-300" />
                  
                  {/* Content */}
                  <div className={`relative ${viewMode === 'list' ? 'flex-1' : 'flex flex-col h-full'}`}>
                    {/* Header */}
                    <div className={`${viewMode === 'list' ? 'flex-1 mr-6' : 'mb-6'}`}>
                      <div className="flex items-center gap-2 mb-3">
                        {blog.featured && (
                          <Badge className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-600 border-yellow-500/30">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        {blog.category && (
                          <Badge variant="secondary" className="text-xs">
                            {blog.category}
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                        {blog.title}
                      </h3>
                      
                      <p className="text-muted-foreground line-clamp-3 leading-relaxed mb-4">
                        {blog.excerpt}
                      </p>

                      {/* Tags */}
                      {blog.tags && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {extractTags(blog.tags).slice(0, 3).map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-md font-medium"
                              >
                                <Tag className="h-3 w-3" />
                                {tag}
                              </span>
                            ))}
                            {extractTags(blog.tags).length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{extractTags(blog.tags).length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Stats and Meta */}
                    <div className={`${viewMode === 'list' ? 'flex flex-col justify-between min-w-[200px]' : 'mt-auto'}`}>
                      {/* Stats */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Eye className="h-3 w-3" />
                          {blog.views}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Heart className="h-3 w-3" />
                          {blog.likes}
                        </div>
                        {blog.readTime && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {blog.readTime} min
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-border/30">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(blog.createdAt)}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {blog.agent && (
                            <Badge className={`text-xs ${getAgentColor(blog.agent.type)} border`}>
                              {blog.agent.type}
                            </Badge>
                          )}
                          
                          {/* Read More Indicator */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-primary text-primary-foreground p-2 rounded-full shadow-lg">
                              <ArrowRight className="h-4 w-4" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="border-2"
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages, currentPage - 2 + i))
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-10 h-10 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="border-2"
            >
              Next
            </Button>
          </div>
        )}

        {/* Enhanced Call to Action */}
        <div className="text-center mt-24 mb-12">
          <div className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/50 dark:from-gray-900 dark:via-blue-950/20 dark:to-purple-950/20 rounded-3xl p-12 border-0 shadow-2xl shadow-blue-500/10 max-w-5xl mx-auto relative overflow-hidden backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/[0.03] via-purple-500/[0.03] to-pink-500/[0.03]" />
            <div className="relative">
              <div className="mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/25">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                  Ready to Build Your Own Agents?
                </h3>
                <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                  Try out my live agents to see what's possible, then follow my comprehensive tutorials to build your own. 
                  Each guide includes complete source code, detailed explanations, and real-world examples.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
                <Link href="/chat">
                  <Button size="lg" className="px-10 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5">
                    <ArrowRight className="h-6 w-6 mr-3" />
                    Try My Live Agents
                  </Button>
                </Link>
                <Link href="/blogs/building-first-math-agent-tutorial">
                  <Button variant="outline" size="lg" className="px-10 py-4 text-lg font-semibold border-2 border-purple-200 hover:border-purple-300 dark:border-purple-800 dark:hover:border-purple-700 bg-white/50 dark:bg-gray-900/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-0.5">
                    <BookOpen className="h-6 w-6 mr-3 text-purple-600 dark:text-purple-400" />
                    Start Learning
                  </Button>
                </Link>
              </div>

              {/* Feature highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="p-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Complete Guides</h4>
                  <p className="text-sm text-muted-foreground">Step-by-step tutorials with full code</p>
                </div>
                <div className="p-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-3">
                    <Eye className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Live Examples</h4>
                  <p className="text-sm text-muted-foreground">Interactive agents you can test</p>
                </div>
                <div className="p-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
                    <Heart className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Free & Open</h4>
                  <p className="text-sm text-muted-foreground">All content is completely free</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}