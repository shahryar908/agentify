"""
Secure configuration management for the AI Agents platform
"""
import os
import secrets
from typing import List, Optional
try:
    from pydantic_settings import BaseSettings
    from pydantic import Field
    from pydantic import field_validator
except ImportError:
    from pydantic import BaseSettings, Field
    from pydantic import validator as field_validator
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    """Application settings with validation and security best practices"""
    
    # API Keys (required)
    GROQ_API_KEY: str = Field(..., min_length=32, description="Groq API key for LLM")
    GOOGLE_API_KEY: Optional[str] = Field(None, description="Google Gemini API key for research agent")
    GOOGLE_CUSTOM_SEARCH_API_KEY: Optional[str] = Field(None, description="Google Custom Search API key")
    GOOGLE_CUSTOM_SEARCH_ENGINE_ID: Optional[str] = Field(None, description="Google Custom Search Engine ID")
    
    # Database
    DATABASE_URL: str = Field(default="sqlite:///./database/dev.db", description="Database URL")
    
    # Security
    SECRET_KEY: str = Field(default_factory=lambda: secrets.token_urlsafe(32), min_length=32)
    JWT_ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, gt=0, le=60*24*7)  # Max 7 days
    
    # CORS Settings
    ALLOWED_ORIGINS: str = Field(
        default="http://localhost:3000,http://127.0.0.1:3000",
        description="Allowed CORS origins (comma-separated)"
    )
    ALLOWED_METHODS: str = Field(
        default="GET,POST,PUT,DELETE,OPTIONS",
        description="Allowed HTTP methods (comma-separated)"
    )
    ALLOWED_HEADERS: str = Field(
        default="*",
        description="Allowed HTTP headers (comma-separated)"
    )
    
    # Server Settings
    HOST: str = Field(default="0.0.0.0")
    PORT: int = Field(default=8002, gt=1000, lt=65535)
    DEBUG: bool = Field(default=False)
    
    # Logging
    LOG_LEVEL: str = Field(default="INFO", pattern=r"^(DEBUG|INFO|WARNING|ERROR|CRITICAL)$")
    LOG_FILE: Optional[str] = Field(default="logs/app.log")
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = Field(default=100, gt=0)
    RATE_LIMIT_WINDOW: int = Field(default=60, gt=0)
    
    # Content Security
    MAX_BLOG_CONTENT_LENGTH: int = Field(default=100000, gt=0)  # 100KB
    MAX_CHAT_MESSAGE_LENGTH: int = Field(default=4000, gt=0)    # 4KB
    MAX_UPLOAD_SIZE: int = Field(default=10*1024*1024, gt=0)    # 10MB
    
    def get_origins_list(self) -> List[str]:
        """Parse ALLOWED_ORIGINS string into list"""
        if isinstance(self.ALLOWED_ORIGINS, str):
            origins = [origin.strip() for origin in self.ALLOWED_ORIGINS.split(',') if origin.strip()]
        else:
            origins = self.ALLOWED_ORIGINS
        
        # Validate
        for origin in origins:
            if origin == "*" and len(origins) > 1:
                raise ValueError("Wildcard origin '*' cannot be combined with specific origins")
        return origins
    
    def get_methods_list(self) -> List[str]:
        """Parse ALLOWED_METHODS string into list"""
        return [method.strip().upper() for method in self.ALLOWED_METHODS.split(',') if method.strip()]
    
    def get_headers_list(self) -> List[str]:
        """Parse ALLOWED_HEADERS string into list"""
        if self.ALLOWED_HEADERS == "*":
            return ["*"]
        return [header.strip() for header in self.ALLOWED_HEADERS.split(',') if header.strip()]
    
    @field_validator('GROQ_API_KEY')
    def validate_groq_key(cls, v):
        """Validate Groq API key format"""
        if not v.startswith('gsk_'):
            raise ValueError("Groq API key must start with 'gsk_'")
        return v
    
    @property
    def is_production(self) -> bool:
        """Check if running in production"""
        return not self.DEBUG
    
    @property
    def cors_allow_wildcard(self) -> bool:
        """Check if CORS allows wildcard origins"""
        return "*" in self.get_origins_list()
    
    model_config = {
        "env_file": ".env",
        "case_sensitive": True,
        "validate_assignment": True
    }

# Global settings instance
settings = Settings()

# Validation checks
def validate_settings():
    """Validate critical settings for production"""
    errors = []
    
    if settings.is_production:
        if settings.cors_allow_wildcard:
            errors.append("CORS wildcard origins not allowed in production")
        
        if settings.SECRET_KEY == "dev-secret-key":
            errors.append("Default secret key not allowed in production")
        
        if not settings.GOOGLE_CUSTOM_SEARCH_API_KEY:
            errors.append("Google Custom Search API key required for full functionality")
    
    if errors:
        raise ValueError(f"Configuration errors: {'; '.join(errors)}")

# Validate on import
validate_settings()