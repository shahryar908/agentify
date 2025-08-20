import os
import asyncio
from pathlib import Path
from typing import List, Optional, Dict, Any
from datetime import datetime
import re
import uuid

# Database connection utilities
class DatabaseManager:
    def __init__(self, db_path: str = None):
        self.db_path = db_path or os.path.join(os.path.dirname(__file__), "dev.db")
        self.db_dir = os.path.dirname(self.db_path)
        
        # Ensure database directory exists
        Path(self.db_dir).mkdir(parents=True, exist_ok=True)
        
    def get_connection_string(self) -> str:
        """Get SQLite connection string"""
        return f"file:{self.db_path}"

# Utility functions
def generate_slug(title: str) -> str:
    """Generate URL-friendly slug from title"""
    # Convert to lowercase and replace spaces with hyphens
    slug = re.sub(r'[^\w\s-]', '', title.lower())
    slug = re.sub(r'[-\s]+', '-', slug)
    slug = slug.strip('-')
    
    # Add random suffix to ensure uniqueness
    unique_suffix = str(uuid.uuid4())[:8]
    return f"{slug}-{unique_suffix}"

def calculate_read_time(content: str) -> int:
    """Calculate estimated read time in minutes"""
    words_per_minute = 200
    word_count = len(content.split())
    read_time = max(1, round(word_count / words_per_minute))
    return read_time

def extract_excerpt(content: str, max_length: int = 300) -> str:
    """Extract excerpt from content"""
    # Remove markdown syntax for excerpt
    clean_content = re.sub(r'[#*`\[\]()]', '', content)
    
    if len(clean_content) <= max_length:
        return clean_content.strip()
    
    # Find the last complete sentence within the limit
    excerpt = clean_content[:max_length]
    last_sentence_end = max(
        excerpt.rfind('.'),
        excerpt.rfind('!'),
        excerpt.rfind('?')
    )
    
    if last_sentence_end > max_length * 0.5:  # If we found a sentence end in the latter half
        excerpt = excerpt[:last_sentence_end + 1]
    else:
        excerpt = excerpt.rsplit(' ', 1)[0] + '...'
    
    return excerpt.strip()

def validate_slug_uniqueness(slug: str, existing_slugs: List[str]) -> str:
    """Ensure slug is unique by appending number if needed"""
    original_slug = slug
    counter = 1
    
    while slug in existing_slugs:
        slug = f"{original_slug}-{counter}"
        counter += 1
    
    return slug

def parse_tags(tags_string: str) -> List[str]:
    """Parse comma-separated tags string into list"""
    if not tags_string:
        return []
    
    return [tag.strip() for tag in tags_string.split(',') if tag.strip()]

def format_tags(tags_list: List[str]) -> str:
    """Format list of tags into comma-separated string"""
    return ', '.join(tags_list) if tags_list else ''

def sanitize_html(content: str) -> str:
    """Basic HTML sanitization for security"""
    # In production, use a proper HTML sanitization library like bleach
    dangerous_tags = ['<script', '<iframe', '<object', '<embed', '<link', '<meta']
    
    for tag in dangerous_tags:
        content = re.sub(f'{tag}.*?>', '', content, flags=re.IGNORECASE | re.DOTALL)
    
    return content

class BlogRepository:
    """Repository pattern for blog operations"""
    
    def __init__(self, db_manager: DatabaseManager):
        self.db_manager = db_manager
    
    async def create_blog(self, blog_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new blog post"""
        # Auto-generate slug if not provided
        if not blog_data.get('slug'):
            blog_data['slug'] = generate_slug(blog_data['title'])
        
        # Auto-generate excerpt if not provided
        if not blog_data.get('excerpt'):
            blog_data['excerpt'] = extract_excerpt(blog_data['content'])
        
        # Auto-calculate read time if not provided
        if not blog_data.get('readTime'):
            blog_data['readTime'] = calculate_read_time(blog_data['content'])
        
        # Sanitize content
        blog_data['content'] = sanitize_html(blog_data['content'])
        
        # Set timestamps
        now = datetime.utcnow()
        blog_data['createdAt'] = now
        blog_data['updatedAt'] = now
        
        if blog_data.get('published') and not blog_data.get('publishedAt'):
            blog_data['publishedAt'] = now
        
        return blog_data
    
    async def update_blog(self, blog_id: int, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update an existing blog post"""
        # Update timestamp
        update_data['updatedAt'] = datetime.utcnow()
        
        # Handle publishing
        if update_data.get('published') and not update_data.get('publishedAt'):
            update_data['publishedAt'] = datetime.utcnow()
        elif not update_data.get('published'):
            update_data['publishedAt'] = None
        
        # Sanitize content if provided
        if 'content' in update_data:
            update_data['content'] = sanitize_html(update_data['content'])
        
        # Auto-generate excerpt if content changed and no excerpt provided
        if 'content' in update_data and 'excerpt' not in update_data:
            update_data['excerpt'] = extract_excerpt(update_data['content'])
        
        # Auto-calculate read time if content changed and no read time provided
        if 'content' in update_data and 'readTime' not in update_data:
            update_data['readTime'] = calculate_read_time(update_data['content'])
        
        return update_data
    
    async def increment_views(self, blog_id: int) -> None:
        """Increment blog view count"""
        # This would typically update the database directly
        pass
    
    async def increment_likes(self, blog_id: int) -> None:
        """Increment blog like count"""
        # This would typically update the database directly
        pass

# Database initialization
async def init_database():
    """Initialize the database with required tables"""
    db_manager = DatabaseManager()
    
    # This would typically run Prisma migrations
    # For now, we'll create the database file if it doesn't exist
    if not os.path.exists(db_manager.db_path):
        Path(db_manager.db_path).touch()
    
    return db_manager