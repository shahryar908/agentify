"""
SQLAlchemy database models for persistent storage
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from typing import Optional

Base = declarative_base()

class User(Base):
    """User model for authentication"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    last_login = Column(DateTime, nullable=True)
    
    # Relationships
    agents = relationship("Agent", back_populates="owner", cascade="all, delete-orphan")
    chat_sessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")
    blogs = relationship("Blog", back_populates="author", cascade="all, delete-orphan")

class Agent(Base):
    """Agent model for persistent agent storage"""
    __tablename__ = "agents"
    
    id = Column(String(36), primary_key=True, index=True)  # UUID
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    agent_type = Column(String(20), nullable=False)
    tools = Column(Text, nullable=True)  # JSON string of tool names
    config = Column(Text, nullable=True)  # JSON string of agent configuration
    is_public = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner = relationship("User", back_populates="agents")
    chat_sessions = relationship("ChatSession", back_populates="agent", cascade="all, delete-orphan")

class ChatSession(Base):
    """Chat session model for conversation persistence"""
    __tablename__ = "chat_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(36), unique=True, index=True, nullable=False)  # UUID
    messages = Column(Text, nullable=False)  # JSON string of messages
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    agent_id = Column(String(36), ForeignKey("agents.id"), nullable=False)
    user = relationship("User", back_populates="chat_sessions")
    agent = relationship("Agent", back_populates="chat_sessions")

class Blog(Base):
    """Blog model for content management"""
    __tablename__ = "blogs"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    excerpt = Column(Text, nullable=True)
    content = Column(Text, nullable=False)
    published = Column(Boolean, default=False, nullable=False)
    featured = Column(Boolean, default=False, nullable=False)
    tags = Column(String(500), nullable=True)  # Comma-separated tags
    category = Column(String(100), nullable=True)
    read_time = Column(Integer, nullable=True)
    views = Column(Integer, default=0, nullable=False)
    likes = Column(Integer, default=0, nullable=False)
    meta_title = Column(String(255), nullable=True)
    meta_description = Column(String(500), nullable=True)
    meta_keywords = Column(String(500), nullable=True)
    published_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    author = relationship("User", back_populates="blogs")
    comments = relationship("Comment", back_populates="blog", cascade="all, delete-orphan")

class Comment(Base):
    """Comment model for blog interactions"""
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    author = Column(String(100), nullable=False)
    email = Column(String(255), nullable=True)
    approved = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    blog_id = Column(Integer, ForeignKey("blogs.id"), nullable=False)
    blog = relationship("Blog", back_populates="comments")

class Category(Base):
    """Category model for blog organization"""
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    color = Column(String(7), nullable=True)  # Hex color code
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

class Tag(Base):
    """Tag model for blog categorization"""
    __tablename__ = "tags"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    slug = Column(String(50), unique=True, nullable=False)
    color = Column(String(7), nullable=True)  # Hex color code
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)