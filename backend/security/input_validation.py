"""
Input validation and sanitization utilities
"""
import re
import html
import bleach
from typing import Any, Dict, Optional, List
from pydantic import BaseModel, Field, validator
import logging

logger = logging.getLogger(__name__)

class InputValidator:
    """Validates and sanitizes user inputs"""
    
    # Allowed HTML tags for rich content
    ALLOWED_TAGS = [
        'p', 'br', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'
    ]
    
    # Allowed HTML attributes
    ALLOWED_ATTRIBUTES = {
        'a': ['href', 'title'],
        'img': ['src', 'alt', 'title'],
        '*': ['class']
    }
    
    @staticmethod
    def sanitize_html(content: str, strip_tags: bool = False) -> str:
        """Sanitize HTML content to prevent XSS"""
        if strip_tags:
            # Remove all HTML tags
            return bleach.clean(content, tags=[], attributes={}, strip=True)
        else:
            # Allow safe HTML tags only
            return bleach.clean(
                content,
                tags=InputValidator.ALLOWED_TAGS,
                attributes=InputValidator.ALLOWED_ATTRIBUTES,
                strip=True
            )
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    @staticmethod
    def validate_username(username: str) -> bool:
        """Validate username format"""
        pattern = r'^[a-zA-Z0-9_-]{3,50}$'
        return bool(re.match(pattern, username))
    
    @staticmethod
    def validate_slug(slug: str) -> bool:
        """Validate URL slug format"""
        pattern = r'^[a-z0-9-]+$'
        return bool(re.match(pattern, slug))
    
    @staticmethod
    def sanitize_filename(filename: str) -> str:
        """Sanitize filename to prevent path traversal"""
        # Remove directory traversal attempts
        filename = re.sub(r'\.\.', '', filename)
        filename = re.sub(r'[/\\:]', '', filename)
        
        # Keep only alphanumeric, dots, hyphens, underscores
        filename = re.sub(r'[^a-zA-Z0-9._-]', '', filename)
        
        return filename[:255]  # Limit length
    
    @staticmethod
    def validate_json_schema(data: Dict[str, Any]) -> bool:
        """Basic JSON schema validation"""
        try:
            # Check for required fields in a basic schema structure
            if not isinstance(data, dict):
                return False
            
            if "type" not in data:
                return False
            
            valid_types = ["object", "array", "string", "number", "integer", "boolean"]
            if data["type"] not in valid_types:
                return False
            
            return True
        except Exception:
            return False
    
    @staticmethod
    def rate_limit_key(identifier: str) -> str:
        """Generate rate limiting key"""
        # Sanitize identifier for use as cache key
        return re.sub(r'[^a-zA-Z0-9_-]', '_', identifier)

def sanitize_input(content: str, max_length: int = 10000, strip_html: bool = True) -> str:
    """
    General purpose input sanitization
    
    Args:
        content: Input content to sanitize
        max_length: Maximum allowed length
        strip_html: Whether to strip HTML tags
    
    Returns:
        Sanitized content
    """
    if not isinstance(content, str):
        content = str(content)
    
    # Limit length
    content = content[:max_length]
    
    # HTML sanitization
    content = InputValidator.sanitize_html(content, strip_tags=strip_html)
    
    # Remove null bytes
    content = content.replace('\x00', '')
    
    return content.strip()

class MessageValidation(BaseModel):
    """Validation model for chat messages"""
    content: str = Field(..., min_length=1, max_length=4000)
    
    @validator('content')
    def validate_content(cls, v):
        """Validate and sanitize message content"""
        return sanitize_input(v, max_length=4000, strip_html=True)

class BlogValidation(BaseModel):
    """Validation model for blog content"""
    title: str = Field(..., min_length=1, max_length=255)
    content: str = Field(..., min_length=1, max_length=100000)
    excerpt: Optional[str] = Field(None, max_length=500)
    
    @validator('title')
    def validate_title(cls, v):
        """Validate and sanitize title"""
        return sanitize_input(v, max_length=255, strip_html=True)
    
    @validator('content')
    def validate_content(cls, v):
        """Validate and sanitize content (allow safe HTML)"""
        return sanitize_input(v, max_length=100000, strip_html=False)
    
    @validator('excerpt')
    def validate_excerpt(cls, v):
        """Validate and sanitize excerpt"""
        if v:
            return sanitize_input(v, max_length=500, strip_html=True)
        return v