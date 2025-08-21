// API configuration for backend integration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9001'

// Custom error classes for better error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: any,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network connection failed') {
    super(message)
    this.name = 'NetworkError'
  }
}

export class TimeoutError extends Error {
  constructor(message: string = 'Request timed out') {
    super(message)
    this.name = 'TimeoutError'
  }
}

// API client with comprehensive error handling
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
      ...options,
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`
        let errorData
        
        try {
          errorData = await response.json()
          errorMessage = errorData.detail || errorData.message || errorMessage
        } catch {
          // If we can't parse error response, use default message
        }
        
        throw new ApiError(errorMessage, response.status, errorData, errorData)
      }
      
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      } else {
        // Handle non-JSON responses
        return await response.text() as unknown as T
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new TimeoutError('Request timed out - please check your connection and try again')
      }
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new NetworkError('Failed to connect to server - please check your connection')
      }
      
      if (error instanceof ApiError) {
        throw error
      }
      
      console.error(`API request failed: ${endpoint}`, error)
      throw new NetworkError(error instanceof Error ? error.message : 'Unknown network error')
    }
  }

  // Agent endpoints
  async getAgents(): Promise<AgentInfo[]> {
    return this.request<AgentInfo[]>('/agents')
  }

  async createAgent(data: CreateAgentRequest): Promise<AgentInfo> {
    return this.request<AgentInfo>('/agents', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getAgent(id: string): Promise<AgentInfo> {
    return this.request<AgentInfo>(`/agents/${id}`)
  }

  async deleteAgent(id: string): Promise<void> {
    return this.request(`/agents/${id}`, {
      method: 'DELETE',
    })
  }

  async chatWithAgent(id: string, message: string): Promise<ChatResponse> {
    return this.request<ChatResponse>(`/agents/${id}/chat`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    })
  }

  // Streaming chat method for real-time responses
  async *chatWithAgentStream(id: string, message: string): AsyncGenerator<StreamingChatChunk, void, unknown> {
    const url = `${this.baseUrl}/agents/${id}/chat/stream`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    })

    if (!response.ok) {
      throw new ApiError(`HTTP error! status: ${response.status}`, response.status)
    }

    if (!response.body) {
      throw new Error('Response body is null')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.trim() === '') continue
          
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            
            if (data.trim() === '') continue

            try {
              const parsed = JSON.parse(data) as StreamingChatChunk
              
              if (parsed.type === 'end') {
                return
              }
              
              yield parsed
            } catch (e) {
              console.warn('Failed to parse streaming data:', data)
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  async clearChatHistory(id: string): Promise<void> {
    return this.request(`/agents/${id}/clear-history`, {
      method: 'POST',
    })
  }

  async getAgentTools(id: string): Promise<{ tools: string[] }> {
    return this.request<{ tools: string[] }>(`/agents/${id}/tools`)
  }

  // Demo endpoints
  async createSampleAgent(): Promise<AgentInfo> {
    return this.request<AgentInfo>('/demo/create-sample-agent', {
      method: 'POST',
    })
  }

  async createIntelligentAgent(): Promise<AgentInfo> {
    return this.request<AgentInfo>('/demo/create-intelligent-agent', {
      method: 'POST',
    })
  }

  async createAutonomousAgent(): Promise<AgentInfo> {
    return this.request<AgentInfo>('/demo/create-autonomous-agent', {
      method: 'POST',
    })
  }

  async createResearcherAgent(): Promise<AgentInfo> {
    return this.request<AgentInfo>('/demo/create-researcher-agent', {
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
  }): Promise<BlogListResponse> {
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

  async getBlogBySlug(slug: string): Promise<BlogResponse> {
    return this.request<BlogResponse>(`/api/blog/posts/${slug}`)
  }

  async createBlog(data: BlogCreate): Promise<BlogResponse> {
    return this.request<BlogResponse>('/api/blog/posts', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateBlog(id: number, data: BlogUpdate): Promise<BlogResponse> {
    return this.request<BlogResponse>(`/api/blog/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteBlog(id: number): Promise<void> {
    return this.request(`/api/blog/posts/${id}`, {
      method: 'DELETE'
    })
  }

  async likeBlog(id: number): Promise<void> {
    return this.request(`/api/blog/posts/${id}/like`, {
      method: 'POST'
    })
  }

  async getCategories(): Promise<CategoryResponse[]> {
    return this.request<CategoryResponse[]>('/api/blog/categories')
  }

  async getTags(): Promise<TagResponse[]> {
    return this.request<TagResponse[]>('/api/blog/tags')
  }

  async getBlogStats(): Promise<BlogStats> {
    return this.request<BlogStats>('/api/blog/stats')
  }

  async searchBlogs(query: string, page = 1, pageSize = 10): Promise<BlogListResponse> {
    return this.request<BlogListResponse>(`/api/blog/search?q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`)
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/')
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
  created_at?: string
  is_public?: boolean
}

export interface CreateAgentRequest {
  name: string
  description: string
  agent_type: 'math' | 'intelligent' | 'autonomous' | 'researcher'
}

export interface ChatResponse {
  response: string
  agent_id: string
  tools_used?: boolean
  timestamp: string
  user_id?: number
}

// Streaming chat types
export interface StreamingChatChunk {
  type: 'start' | 'content' | 'progress' | 'success' | 'partial_success' | 'error' | 'paper' | 'end'
  content?: string
  agent_id?: string
  tools_used?: boolean
  timestamp: string
  step?: string
  result?: any
  paper_data?: any
  paper_index?: number
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