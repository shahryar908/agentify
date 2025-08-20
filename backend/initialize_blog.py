"""
Blog system initialization script
This script sets up the blog system and populates it with sample data
"""

import sys
import os
sys.path.append(os.path.dirname(__file__))

from api.blog_routes import blogs_store, categories_store, tags_store
from api.blog_routes import next_blog_id, next_category_id, next_tag_id
from database.seed_data import seed_database

def initialize_blog_system():
    """Initialize the blog system without sample data"""
    print("Initializing blog system...")
    
    # Get seed data for categories and tags only (no sample blogs)
    seed_data = seed_database()
    
    # Populate store with categories and tags only
    global next_blog_id, next_category_id, next_tag_id
    
    # Initialize empty blog store (no sample blogs)
    next_blog_id = 1
    
    # Add categories
    for i, category in enumerate(seed_data['categories'], 1):
        category['id'] = i
        categories_store[i] = category
        next_category_id = i + 1
    
    # Add tags
    for i, tag in enumerate(seed_data['tags'], 1):
        tag['id'] = i
        tags_store[i] = tag
        next_tag_id = i + 1
    
    print(f"[SUCCESS] Initialized blog system with:")
    print(f"   - {len(blogs_store)} blog posts")
    print(f"   - {len(categories_store)} categories") 
    print(f"   - {len(tags_store)} tags")
    print("[INFO] Ready for user-generated content")
    
    return {
        "blogs": len(blogs_store),
        "categories": len(categories_store),
        "tags": len(tags_store)
    }

if __name__ == "__main__":
    initialize_blog_system()