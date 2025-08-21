// API configuration for backend integration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ' https://4c55c88b52f4.ngrok-free.app'

// API client with error handling
class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      timeout: 30000, // 30 second timeout
      ...options,
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorData.message || errorMessage
        } catch {
          // If we can't parse error response, use default message
        }
        throw new Error(errorMessage)
      }
      
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      } else {
        // Handle non-JSON responses
        return await response.text() as unknown as T
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout - please check your connection and try again')
      }
      console.error(`API request failed: ${endpoint}`, error)
      throw error
    }
  }

  // Agent endpoints
  async getAgents() {
    return this.request<AgentInfo[]>('/agents')
  }

  async createAgent(data: CreateAgentRequest) {
    return this.request<AgentInfo>('/agents', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getAgent(id: string) {
    return this.request<AgentInfo>(`/agents/${id}`)
  }

  async deleteAgent(id: string) {
    return this.request(`/agents/${id}`, {
      method: 'DELETE',
    })
  }

  async chatWithAgent(id: string, message: string) {
    return this.request<ChatResponse>(`/agents/${id}/chat`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    })
  }

  async clearChatHistory(id: string) {
    return this.request(`/agents/${id}/clear-history`, {
      method: 'POST',
    })
  }

  async getAgentTools(id: string) {
    return this.request<{ tools: string[] }>(`/agents/${id}/tools`)
  }

  // Demo endpoints
  async createSampleAgent() {
    return this.request<AgentInfo>('/demo/create-sample-agent', {
      method: 'POST',
    })
  }

  async createIntelligentAgent() {
    return this.request<AgentInfo>('/demo/create-intelligent-agent', {
      method: 'POST',
    })
  }

  async createAutonomousAgent() {
    return this.request<AgentInfo>('/demo/create-autonomous-agent', {
      method: 'POST',
    })
  }

  // Blog endpoints
  async getBlogs(params?: {
    q?: string
    category?: string
    tags?: string
    agentType?: string
    published?: boolean
    featured?: boolean
    page?: number
    pageSize?: number
    sortBy?: string
    sortOrder?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
    }
    
    const query = searchParams.toString()
    return this.request<BlogListResponse>(`/api/blog/posts${query ? `?${query}` : ''}`)
  }

  async getBlogBySlug(slug: string) {
    return this.request<BlogResponse>(`/api/blog/posts/${slug}`)
  }

  async createBlog(data: BlogCreate) {
    return this.request<BlogResponse>('/api/blog/posts', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateBlog(id: number, data: BlogUpdate) {
    return this.request<BlogResponse>(`/api/blog/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteBlog(id: number) {
    return this.request(`/api/blog/posts/${id}`, {
      method: 'DELETE'
    })
  }

  async likeBlog(id: number) {
    return this.request(`/api/blog/posts/${id}/like`, {
      method: 'POST'
    })
  }

  async getCategories() {
    return this.request<CategoryResponse[]>('/api/blog/categories')
  }

  async getTags() {
    return this.request<TagResponse[]>('/api/blog/tags')
  }

  async getBlogStats() {
    return this.request<BlogStats>('/api/blog/stats')
  }

  async searchBlogs(query: string, page = 1, pageSize = 10) {
    return this.request<BlogListResponse>(`/api/blog/search?q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`)
  }
}

// Authentication types
export interface UserResponse {
  id: number
  email: string
  username: string
  full_name?: string
  is_active: boolean
  created_at: string
  last_login?: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

// Enhanced types for API responses
export interface AgentInfo {
  id: string
  name: string
  description: string
  agent_type: string
  tools: string[]
  owner_id?: number
  created_at: string
  is_public: boolean
}

export interface CreateAgentRequest {
  name: string
  description: string
  agent_type: 'math' | 'intelligent' | 'autonomous'
}

export interface ChatResponse {
  response: string
  agent_id: string
  tools_used?: boolean
  timestamp: string
  user_id?: number
}

// Blog types
export interface BlogResponse {
  id: number
  title: string
  slug: string
  excerpt?: string
  content: string
  published: boolean
  featured: boolean
  tags?: string
  category?: string
  readTime?: number
  views: number
  likes: number
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
  author: string
  authorEmail?: string
  publishedAt?: string
  createdAt: string
  updatedAt: string
  agentId?: number
  agent?: {
    id: number
    name: string
    type: string
  }
}

export interface BlogListResponse {
  blogs: BlogResponse[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface BlogCreate {
  title: string
  excerpt?: string
  content: string
  tags?: string
  category?: string
  readTime?: number
  published?: boolean
  featured?: boolean
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
  agentId?: number
  slug?: string
}

export interface BlogUpdate {
  title?: string
  excerpt?: string
  content?: string
  tags?: string
  category?: string
  readTime?: number
  published?: boolean
  featured?: boolean
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
  agentId?: number
}

export interface CategoryResponse {
  id: number
  name: string
  slug: string
  description?: string
  color?: string
  createdAt: string
  updatedAt: string
}

export interface TagResponse {
  id: number
  name: string
  slug: string
  color?: string
  createdAt: string
  updatedAt: string
}

export interface BlogStats {
  totalBlogs: number
  publishedBlogs: number
  draftBlogs: number
  featuredBlogs: number
  totalViews: number
  totalLikes: number
  categoriesCount: number
  tagsCount: number
}

// Legacy Blog interface for backward compatibility
export interface Blog {
  id: number
  title: string
  slug: string
  excerpt: string
  tags: string
  readTime: number
  createdAt: string
  agent?: {
    name: string
    type: string
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
export default apiClient