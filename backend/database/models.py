from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# Blog Models
class BlogBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    excerpt: Optional[str] = Field(None, max_length=500)
    content: str = Field(..., min_length=1)
    tags: Optional[str] = None
    category: Optional[str] = None
    readTime: Optional[int] = Field(None, ge=1)
    published: bool = False
    featured: bool = False
    metaTitle: Optional[str] = Field(None, max_length=255)
    metaDescription: Optional[str] = Field(None, max_length=500)
    metaKeywords: Optional[str] = None
    agentId: Optional[int] = None

class BlogCreate(BlogBase):
    slug: Optional[str] = None  # Will be auto-generated if not provided

class BlogUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    excerpt: Optional[str] = Field(None, max_length=500)
    content: Optional[str] = None
    tags: Optional[str] = None
    category: Optional[str] = None
    readTime: Optional[int] = Field(None, ge=1)
    published: Optional[bool] = None
    featured: Optional[bool] = None
    metaTitle: Optional[str] = Field(None, max_length=255)
    metaDescription: Optional[str] = Field(None, max_length=500)
    metaKeywords: Optional[str] = None
    agentId: Optional[int] = None

class BlogResponse(BaseModel):
    id: int
    title: str
    slug: str
    excerpt: Optional[str]
    content: str
    published: bool
    featured: bool
    tags: Optional[str]
    category: Optional[str]
    readTime: Optional[int]
    views: int
    likes: int
    metaTitle: Optional[str]
    metaDescription: Optional[str]
    metaKeywords: Optional[str]
    author: str
    authorEmail: Optional[str]
    publishedAt: Optional[datetime]
    createdAt: datetime
    updatedAt: datetime
    agentId: Optional[int]
    agent: Optional[Dict[str, Any]] = None

class BlogListResponse(BaseModel):
    blogs: List[BlogResponse]
    total: int
    page: int
    pageSize: int
    totalPages: int

# Comment Models
class CommentBase(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)
    author: str = Field(..., min_length=1, max_length=100)
    email: Optional[str] = Field(None, max_length=255)

class CommentCreate(CommentBase):
    blogId: int

class CommentResponse(BaseModel):
    id: int
    content: str
    author: str
    email: Optional[str]
    approved: bool
    createdAt: datetime
    updatedAt: datetime
    blogId: int

# Category Models
class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    color: Optional[str] = Field(None, pattern=r'^#[0-9A-Fa-f]{6}$')

class CategoryCreate(CategoryBase):
    slug: Optional[str] = None

class CategoryResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str]
    color: Optional[str]
    createdAt: datetime
    updatedAt: datetime

# Tag Models
class TagBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    color: Optional[str] = Field(None, pattern=r'^#[0-9A-Fa-f]{6}$')

class TagCreate(TagBase):
    slug: Optional[str] = None

class TagResponse(BaseModel):
    id: int
    name: str
    slug: str
    color: Optional[str]
    createdAt: datetime
    updatedAt: datetime

# Search and Filter Models
class BlogSearchParams(BaseModel):
    q: Optional[str] = None  # Search query
    category: Optional[str] = None
    tags: Optional[str] = None
    agentType: Optional[str] = None
    published: Optional[bool] = True
    featured: Optional[bool] = None
    page: int = Field(1, ge=1)
    pageSize: int = Field(10, ge=1, le=100)
    sortBy: str = Field("createdAt", pattern=r'^(createdAt|updatedAt|publishedAt|views|likes|title)$')
    sortOrder: str = Field("desc", pattern=r'^(asc|desc)$')

# Blog Statistics
class BlogStats(BaseModel):
    totalBlogs: int
    publishedBlogs: int
    draftBlogs: int
    featuredBlogs: int
    totalViews: int
    totalLikes: int
    categoriesCount: int
    tagsCount: int