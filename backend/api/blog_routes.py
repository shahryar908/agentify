from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import Response
from typing import List, Optional, Dict, Any
from datetime import datetime
import math

from database.models import (
    BlogCreate, BlogUpdate, BlogResponse, BlogListResponse,
    BlogSearchParams, BlogStats, CommentCreate, CommentResponse,
    CategoryCreate, CategoryResponse, TagCreate, TagResponse
)
from database.database import DatabaseManager, BlogRepository, generate_slug

# Create router
blog_router = APIRouter(prefix="/api/blog", tags=["blog"])

# In-memory storage for demo (replace with actual database operations)
blogs_store: Dict[int, Dict[str, Any]] = {}
comments_store: Dict[int, List[Dict[str, Any]]] = {}
categories_store: Dict[int, Dict[str, Any]] = {}
tags_store: Dict[int, Dict[str, Any]] = {}
next_blog_id = 1
next_comment_id = 1
next_category_id = 1
next_tag_id = 1

# Dependency for database manager
async def get_db_manager():
    return DatabaseManager()

# Dependency for blog repository
async def get_blog_repository(db_manager: DatabaseManager = Depends(get_db_manager)):
    return BlogRepository(db_manager)

# Blog CRUD Endpoints
@blog_router.post("/posts", response_model=BlogResponse)
async def create_blog_post(
    blog_data: BlogCreate,
    repo: BlogRepository = Depends(get_blog_repository)
):
    """Create a new blog post"""
    global next_blog_id
    
    try:
        # Process blog data
        processed_data = await repo.create_blog(blog_data.dict())
        
        # Generate unique slug
        existing_slugs = [blog.get('slug', '') for blog in blogs_store.values()]
        if not processed_data.get('slug'):
            processed_data['slug'] = generate_slug(processed_data['title'])
        
        # Ensure slug uniqueness
        original_slug = processed_data['slug']
        counter = 1
        while processed_data['slug'] in existing_slugs:
            processed_data['slug'] = f"{original_slug}-{counter}"
            counter += 1
        
        # Add to store
        blog_id = next_blog_id
        processed_data['id'] = blog_id
        processed_data['views'] = 0
        processed_data['likes'] = 0
        processed_data['author'] = "Developer"
        processed_data['authorEmail'] = "developer@example.com"
        
        blogs_store[blog_id] = processed_data
        next_blog_id += 1
        
        return BlogResponse(**processed_data)
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error creating blog post: {str(e)}")

@blog_router.get("/posts", response_model=BlogListResponse)
async def get_blog_posts(
    q: Optional[str] = Query(None, description="Search query"),
    category: Optional[str] = Query(None, description="Filter by category"),
    tags: Optional[str] = Query(None, description="Filter by tags"),
    agentType: Optional[str] = Query(None, description="Filter by agent type"),
    published: Optional[bool] = Query(True, description="Filter by published status"),
    featured: Optional[bool] = Query(None, description="Filter by featured status"),
    page: int = Query(1, ge=1, description="Page number"),
    pageSize: int = Query(10, ge=1, le=100, description="Page size"),
    sortBy: str = Query("createdAt", description="Sort field"),
    sortOrder: str = Query("desc", description="Sort order (asc/desc)")
):
    """Get blog posts with search, filtering, and pagination"""
    
    # Filter blogs
    filtered_blogs = []
    for blog in blogs_store.values():
        # Published filter
        if published is not None and blog.get('published') != published:
            continue
            
        # Featured filter
        if featured is not None and blog.get('featured') != featured:
            continue
            
        # Search query
        if q:
            search_text = f"{blog.get('title', '')} {blog.get('excerpt', '')} {blog.get('content', '')}".lower()
            if q.lower() not in search_text:
                continue
        
        # Category filter
        if category and blog.get('category') != category:
            continue
            
        # Tags filter
        if tags:
            blog_tags = blog.get('tags', '').lower()
            if tags.lower() not in blog_tags:
                continue
                
        # Agent type filter (need to implement agent relationship)
        if agentType and blog.get('agentType') != agentType:
            continue
            
        filtered_blogs.append(blog)
    
    # Sort blogs
    reverse = sortOrder == "desc"
    if sortBy == "title":
        filtered_blogs.sort(key=lambda x: x.get('title', ''), reverse=reverse)
    elif sortBy == "views":
        filtered_blogs.sort(key=lambda x: x.get('views', 0), reverse=reverse)
    elif sortBy == "likes":
        filtered_blogs.sort(key=lambda x: x.get('likes', 0), reverse=reverse)
    else:
        # Default to createdAt or other datetime fields
        filtered_blogs.sort(key=lambda x: x.get(sortBy, datetime.min), reverse=reverse)
    
    # Pagination
    total = len(filtered_blogs)
    total_pages = math.ceil(total / pageSize)
    start_idx = (page - 1) * pageSize
    end_idx = start_idx + pageSize
    paginated_blogs = filtered_blogs[start_idx:end_idx]
    
    # Convert to response format
    blog_responses = []
    for blog in paginated_blogs:
        blog_response = BlogResponse(**blog)
        blog_responses.append(blog_response)
    
    return BlogListResponse(
        blogs=blog_responses,
        total=total,
        page=page,
        pageSize=pageSize,
        totalPages=total_pages
    )

@blog_router.get("/posts/{slug}", response_model=BlogResponse)
async def get_blog_post(slug: str):
    """Get a specific blog post by slug"""
    
    # Find blog by slug
    blog = None
    for blog_data in blogs_store.values():
        if blog_data.get('slug') == slug:
            blog = blog_data
            break
    
    if not blog:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    # Increment view count
    blog['views'] = blog.get('views', 0) + 1
    
    return BlogResponse(**blog)

@blog_router.put("/posts/{blog_id}", response_model=BlogResponse)
async def update_blog_post(
    blog_id: int,
    update_data: BlogUpdate,
    repo: BlogRepository = Depends(get_blog_repository)
):
    """Update a blog post"""
    
    if blog_id not in blogs_store:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    try:
        # Process update data
        processed_update = await repo.update_blog(blog_id, update_data.dict(exclude_unset=True))
        
        # Update store
        blogs_store[blog_id].update(processed_update)
        
        return BlogResponse(**blogs_store[blog_id])
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error updating blog post: {str(e)}")

@blog_router.delete("/posts/{blog_id}")
async def delete_blog_post(blog_id: int):
    """Delete a blog post"""
    
    if blog_id not in blogs_store:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    # Delete blog and its comments
    del blogs_store[blog_id]
    if blog_id in comments_store:
        del comments_store[blog_id]
    
    return {"message": "Blog post deleted successfully"}

@blog_router.post("/posts/{blog_id}/like")
async def like_blog_post(blog_id: int):
    """Like a blog post"""
    
    if blog_id not in blogs_store:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    blogs_store[blog_id]['likes'] = blogs_store[blog_id].get('likes', 0) + 1
    
    return {
        "message": "Blog post liked successfully",
        "likes": blogs_store[blog_id]['likes']
    }

# Categories Endpoints
@blog_router.get("/categories", response_model=List[CategoryResponse])
async def get_categories():
    """Get all blog categories"""
    return [CategoryResponse(**cat) for cat in categories_store.values()]

@blog_router.post("/categories", response_model=CategoryResponse)
async def create_category(category_data: CategoryCreate):
    """Create a new blog category"""
    global next_category_id
    
    # Generate slug
    slug = generate_slug(category_data.name)
    
    category = {
        "id": next_category_id,
        "name": category_data.name,
        "slug": slug,
        "description": category_data.description,
        "color": category_data.color,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    
    categories_store[next_category_id] = category
    next_category_id += 1
    
    return CategoryResponse(**category)

# Tags Endpoints
@blog_router.get("/tags", response_model=List[TagResponse])
async def get_tags():
    """Get all blog tags"""
    return [TagResponse(**tag) for tag in tags_store.values()]

@blog_router.post("/tags", response_model=TagResponse)
async def create_tag(tag_data: TagCreate):
    """Create a new blog tag"""
    global next_tag_id
    
    # Generate slug
    slug = generate_slug(tag_data.name)
    
    tag = {
        "id": next_tag_id,
        "name": tag_data.name,
        "slug": slug,
        "color": tag_data.color,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    
    tags_store[next_tag_id] = tag
    next_tag_id += 1
    
    return TagResponse(**tag)

# Comments Endpoints
@blog_router.get("/posts/{blog_id}/comments", response_model=List[CommentResponse])
async def get_blog_comments(blog_id: int):
    """Get comments for a blog post"""
    
    if blog_id not in blogs_store:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    blog_comments = comments_store.get(blog_id, [])
    return [CommentResponse(**comment) for comment in blog_comments if comment.get('approved', False)]

@blog_router.post("/posts/{blog_id}/comments", response_model=CommentResponse)
async def create_comment(blog_id: int, comment_data: CommentCreate):
    """Create a new comment on a blog post"""
    global next_comment_id
    
    if blog_id not in blogs_store:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    comment = {
        "id": next_comment_id,
        "content": comment_data.content,
        "author": comment_data.author,
        "email": comment_data.email,
        "approved": False,  # Comments need approval
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
        "blogId": blog_id
    }
    
    if blog_id not in comments_store:
        comments_store[blog_id] = []
    
    comments_store[blog_id].append(comment)
    next_comment_id += 1
    
    return CommentResponse(**comment)

# Statistics Endpoint
@blog_router.get("/stats", response_model=BlogStats)
async def get_blog_stats():
    """Get blog statistics"""
    
    total_blogs = len(blogs_store)
    published_blogs = len([b for b in blogs_store.values() if b.get('published', False)])
    draft_blogs = total_blogs - published_blogs
    featured_blogs = len([b for b in blogs_store.values() if b.get('featured', False)])
    total_views = sum(b.get('views', 0) for b in blogs_store.values())
    total_likes = sum(b.get('likes', 0) for b in blogs_store.values())
    
    return BlogStats(
        totalBlogs=total_blogs,
        publishedBlogs=published_blogs,
        draftBlogs=draft_blogs,
        featuredBlogs=featured_blogs,
        totalViews=total_views,
        totalLikes=total_likes,
        categoriesCount=len(categories_store),
        tagsCount=len(tags_store)
    )

# Search endpoint
@blog_router.get("/search", response_model=BlogListResponse)
async def search_blogs(
    q: str = Query(..., min_length=1, description="Search query"),
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=50)
):
    """Search blog posts"""
    return await get_blog_posts(q=q, page=page, pageSize=pageSize)

# RSS Feed endpoint (returns XML)
@blog_router.get("/rss", response_class=Response)
async def get_rss_feed():
    """Get RSS feed for published blog posts"""
    
    published_blogs = [b for b in blogs_store.values() if b.get('published', False)]
    published_blogs.sort(key=lambda x: x.get('publishedAt', datetime.min), reverse=True)
    
    # Generate RSS XML (simplified)
    rss_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
    <title>AI Agents Blog</title>
    <description>Tutorials and insights on building AI agents</description>
    <link>http://localhost:3002/blogs</link>
    <language>en-us</language>
    <lastBuildDate>{datetime.utcnow().strftime('%a, %d %b %Y %H:%M:%S GMT')}</lastBuildDate>
"""
    
    for blog in published_blogs[:20]:  # Limit to 20 most recent
        rss_xml += f"""
    <item>
        <title>{blog.get('title', '')}</title>
        <description>{blog.get('excerpt', '')}</description>
        <link>http://localhost:3002/blogs/{blog.get('slug', '')}</link>
        <guid>http://localhost:3002/blogs/{blog.get('slug', '')}</guid>
        <pubDate>{blog.get('publishedAt', datetime.utcnow()).strftime('%a, %d %b %Y %H:%M:%S GMT')}</pubDate>
    </item>"""
    
    rss_xml += """
</channel>
</rss>"""
    
    return Response(content=rss_xml, media_type="application/rss+xml")