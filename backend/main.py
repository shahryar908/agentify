from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse
from fastapi.security import HTTPBearer
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, AsyncGenerator
import uuid
import json
import logging
import asyncio
from datetime import datetime
from contextlib import asynccontextmanager

from agents.first_agent import GroqToolAgent
from agents.second_agent import IntelligentToolAgent
from agents.third_agent import AutonomousAgent
from agents.fourth_agent import ResearcherToolAgent

# Import security and config
from config.settings import settings, validate_settings
from auth.auth_handler import get_current_user, get_current_user_optional, AuthHandler
from auth.models import User, UserCreate, UserResponse, Token, LoginRequest
from security.tool_registry import SecureToolRegistry
from security.input_validation import sanitize_input, MessageValidation

# Import blog routes
from api.blog_routes import blog_router
from database.connection import get_db
from sqlalchemy.orm import Session

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(settings.LOG_FILE) if settings.LOG_FILE else logging.NullHandler()
    ]
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Starting AI Agents API")
    validate_settings()
    
    # Initialize secure tool registry
    global secure_tool_registry
    secure_tool_registry = SecureToolRegistry()
    
    # Initialize blog system
    try:
        from initialize_blog import initialize_blog_system
        initialize_blog_system()
        logger.info("Blog system initialized successfully")
    except Exception as e:
        logger.warning(f"Blog system initialization failed: {e}")
    
    # Create default agents on startup
    try:
        create_default_agents()
        logger.info("Default agents created successfully")
    except Exception as e:
        logger.warning(f"Default agent creation failed: {e}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down AI Agents API")

app = FastAPI(
    title="AI Agents API",
    description="Secure backend API for managing and executing AI agents",
    version="2.0.0",
    lifespan=lifespan
)

# CORS middleware with secure configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=settings.ALLOWED_METHODS,
    allow_headers=settings.ALLOWED_HEADERS,
)

# Security headers middleware
@app.middleware("http")
async def security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    if settings.is_production:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# Include blog routes
app.include_router(blog_router)

# Global secure tool registry
secure_tool_registry: SecureToolRegistry = None

# In-memory storage for agents (in production, use a database)
agents_store: Dict[str, Any] = {}  # Can store both GroqToolAgent and IntelligentToolAgent
agent_metadata: Dict[str, Dict[str, Any]] = {}

def create_default_agents():
    """Create default agents on server startup"""
    try:
        # Create math agent
        agent_id = str(uuid.uuid4())
        agent = GroqToolAgent(api_key=settings.GROQ_API_KEY)
        agents_store[agent_id] = agent
        agent_metadata[agent_id] = {
            "id": agent_id,
            "name": "Math Calculator Agent",
            "description": "A sample agent that can perform mathematical calculations",
            "agent_type": "math",
            "owner_id": None,
            "is_public": True,
            "created_at": "2025-08-21T00:00:00Z",
            "tools": agent.list_tools()
        }
        
        # Create intelligent agent
        agent_id = str(uuid.uuid4())
        agent = IntelligentToolAgent(api_key=settings.GROQ_API_KEY)
        agents_store[agent_id] = agent
        agent_metadata[agent_id] = {
            "id": agent_id,
            "name": "Intelligent Web Agent",
            "description": "An intelligent agent that can search the web, get weather, fetch news, and access current information",
            "agent_type": "intelligent",
            "owner_id": None,
            "is_public": True,
            "created_at": "2025-08-21T00:00:00Z",
            "tools": agent.list_tools()
        }
        
        # Create autonomous agent
        agent_id = str(uuid.uuid4())
        agent = AutonomousAgent(api_key=settings.GROQ_API_KEY)
        agents_store[agent_id] = agent
        agent_metadata[agent_id] = {
            "id": agent_id,
            "name": "Autonomous Planning Agent",
            "description": "An autonomous agent that can break down goals into steps, think through problems, and make decisions using simulated tools",
            "agent_type": "autonomous",
            "owner_id": None,
            "is_public": True,
            "created_at": "2025-08-21T00:00:00Z",
            "tools": agent.list_tools()
        }
        
        # Try to create research agent (may fail due to dependencies)
        try:
            agent_id = str(uuid.uuid4())
            agent = ResearcherToolAgent(
                api_key=settings.GROQ_API_KEY,
                google_api_key=settings.GOOGLE_API_KEY or ""
            )
            agents_store[agent_id] = agent
            agent_metadata[agent_id] = {
                "id": agent_id,
                "name": "AI Research Agent",
                "description": "An academic research agent that can search papers, analyze literature, identify research gaps, and generate research proposals with PDF output",
                "agent_type": "researcher",
                "owner_id": None,
                "is_public": True,
                "created_at": "2025-08-21T00:00:00Z",
                "tools": agent.list_tools()
            }
            logger.info("Research agent created successfully")
        except Exception as e:
            logger.warning(f"Failed to create research agent: {e}")
        
        logger.info(f"Created {len(agents_store)} agents total")
        
    except Exception as e:
        logger.error(f"Failed to create default agents: {e}")
        raise

# Enhanced Pydantic models for request/response
class CreateAgentRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=500)
    agent_type: str = Field(default="math", pattern=r'^(math|intelligent|autonomous|researcher)$')
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "name": "My Math Agent",
                "description": "An agent for mathematical calculations",
                "agent_type": "math"
            }
        }
    }

class ChatRequest(MessageValidation):
    """Enhanced chat request with validation"""
    pass

class ChatResponse(BaseModel):
    response: str = Field(..., description="Agent response")
    agent_id: str = Field(..., description="Agent identifier")
    tools_used: bool = Field(default=False, description="Whether tools were used")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    user_id: Optional[int] = Field(None, description="User identifier")

class AgentInfo(BaseModel):
    id: str = Field(..., description="Agent identifier")
    name: str = Field(..., description="Agent name")
    description: str = Field(..., description="Agent description")
    agent_type: str = Field(..., description="Agent type")
    tools: List[str] = Field(default_factory=list, description="Available tools")
    owner_id: Optional[int] = Field(None, description="Owner user ID")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_public: bool = Field(default=True, description="Whether agent is publicly accessible")

class RegisterToolRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=50, pattern=r'^[a-zA-Z_][a-zA-Z0-9_]*$')
    description: str = Field(..., min_length=1, max_length=500)
    function_code: str = Field(..., min_length=1, max_length=10000)
    params_schema: Dict[str, Any] = Field(..., description="JSON schema for parameters")
    allowed_imports: List[str] = Field(default_factory=list, max_items=5)
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "name": "calculate_sum",
                "description": "Calculate sum of two numbers",
                "function_code": "def calculate_sum(a: int, b: int) -> int:\n    return a + b",
                "params_schema": {
                    "type": "object",
                    "properties": {
                        "a": {"type": "integer", "description": "First number"},
                        "b": {"type": "integer", "description": "Second number"}
                    },
                    "required": ["a", "b"]
                },
                "allowed_imports": []
            }
        }
    }

# Authentication endpoints
@app.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
) -> UserResponse:
    """Register a new user"""
    try:
        user = AuthHandler.create_user(db, user_data)
        logger.info(f"New user registered: {user.username}")
        return UserResponse.from_orm(user)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed. Please try again."
        )

@app.post("/auth/login", response_model=Token)
async def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
) -> Token:
    """Authenticate user and return JWT token"""
    try:
        user = AuthHandler.authenticate_user(db, login_data.username, login_data.password)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        access_token = AuthHandler.create_access_token(
            data={"sub": user.id, "username": user.username}
        )
        
        logger.info(f"User logged in: {user.username}")
        return Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed. Please try again."
        )

@app.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
) -> UserResponse:
    """Get current user information"""
    return UserResponse.from_orm(current_user)

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Secure AI Agents API",
        "version": "2.0.0",
        "security": "Enabled" if settings.is_production else "Development Mode",
        "endpoints": {
            "auth": "/auth/login",
            "agents": "/agents",
            "chat": "/agents/{agent_id}/chat",
            "tools": "/agents/{agent_id}/tools",
            "docs": "/docs"
        }
    }

# Agent management endpoints
@app.post("/agents", response_model=AgentInfo)
async def create_agent(
    request: CreateAgentRequest,
    current_user: User = Depends(get_current_user)
):
    """Create a new AI agent (secured with authentication)"""
    try:
        # Sanitize inputs
        request.name = sanitize_input(request.name, max_length=100, strip_html=True)
        request.description = sanitize_input(request.description, max_length=500, strip_html=True)
        
        agent_id = str(uuid.uuid4())
        
        # Use secure API key from settings instead of user input
        secure_api_key = settings.GROQ_API_KEY
        
        # Create agent based on type using secure configuration
        if request.agent_type.lower() == "intelligent":
            agent = IntelligentToolAgent(api_key=secure_api_key)
        elif request.agent_type.lower() == "autonomous":
            agent = AutonomousAgent(
                api_key=secure_api_key,
                google_api_key=settings.GOOGLE_CUSTOM_SEARCH_API_KEY or "",
                search_engine_id=settings.GOOGLE_CUSTOM_SEARCH_ENGINE_ID or ""
            )
        elif request.agent_type.lower() == "researcher":
            agent = ResearcherToolAgent(
                api_key=secure_api_key,
                google_api_key=settings.GOOGLE_API_KEY or ""
            )
        else:
            agent = GroqToolAgent(api_key=secure_api_key)
        
        agents_store[agent_id] = agent
        agent_metadata[agent_id] = {
            "id": agent_id,
            "name": request.name,
            "description": request.description,
            "agent_type": request.agent_type,
            "owner_id": current_user.id,
            "is_public": True,
            "created_at": "2025-08-17T00:00:00Z",  # In production, use actual timestamp
            "tools": agent.list_tools()
        }
        
        return AgentInfo(**agent_metadata[agent_id])
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create agent: {str(e)}")

@app.get("/agents", response_model=List[AgentInfo])
async def list_agents(current_user: User = Depends(get_current_user_optional)):
    """List all available agents"""
    return [AgentInfo(**metadata) for metadata in agent_metadata.values()]

@app.get("/test-debug")
async def test_debug():
    """Simple test endpoint"""
    return {"message": "Debug endpoint works", "timestamp": "2025-08-21"}

@app.get("/debug/agents")
async def debug_agents():
    """Debug endpoint to see agent stores"""
    return {
        "agents_store_count": len(agents_store),
        "agent_metadata_count": len(agent_metadata),
        "agents_store_keys": list(agents_store.keys()),
        "agent_metadata_keys": list(agent_metadata.keys()),
        "agent_metadata": dict(agent_metadata)
    }

@app.get("/agents/{agent_id}", response_model=AgentInfo)
async def get_agent(agent_id: str):
    """Get specific agent information"""
    if agent_id not in agent_metadata:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    return AgentInfo(**agent_metadata[agent_id])

@app.delete("/agents/{agent_id}")
async def delete_agent(agent_id: str):
    """Delete an agent"""
    if agent_id not in agents_store:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    del agents_store[agent_id]
    del agent_metadata[agent_id]
    
    return {"message": "Agent deleted successfully"}

# Agent execution endpoints
@app.post("/agents/{agent_id}/chat", response_model=ChatResponse)
async def chat_with_agent(agent_id: str, request: ChatRequest):
    """Send a message to an agent and get response"""
    if agent_id not in agents_store:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    try:
        agent = agents_store[agent_id]
        response = agent.chat(request.content)
        
        # Determine if tools were used based on the agent's internal logic
        if hasattr(agent, '_should_use_tool'):
            tools_used = agent._should_use_tool(request.content)
        elif hasattr(agent, '_should_use_tools'):
            tools_used = agent._should_use_tools(request.content)
        else:
            tools_used = False
        
        return ChatResponse(
            response=response,
            agent_id=agent_id,
            tools_used=tools_used
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error chatting with agent: {str(e)}")

@app.post("/agents/{agent_id}/chat/stream")
async def chat_with_agent_stream(agent_id: str, request: ChatRequest):
    """Send a message to an agent and get streaming response"""
    if agent_id not in agents_store:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    async def generate_response():
        try:
            agent = agents_store[agent_id]
            
            # Check if this is a research agent with streaming capabilities
            if isinstance(agent, ResearcherToolAgent) and agent._should_use_tools(request.content):
                # Stream research progress for research agent
                async for chunk in stream_research_response(agent, request.content):
                    yield f"data: {json.dumps(chunk)}\n\n"
            else:
                # For other agents, simulate streaming by chunking the response
                response = agent.chat(request.content)
                
                # Determine if tools were used
                tools_used = False
                if hasattr(agent, '_should_use_tool'):
                    tools_used = agent._should_use_tool(request.content)
                elif hasattr(agent, '_should_use_tools'):
                    tools_used = agent._should_use_tools(request.content)
                
                # Stream the response in chunks
                async for chunk in stream_text_response(response, agent_id, tools_used):
                    yield f"data: {json.dumps(chunk)}\n\n"
                
        except Exception as e:
            error_chunk = {
                "type": "error",
                "content": f"Error: {str(e)}",
                "agent_id": agent_id,
                "timestamp": datetime.utcnow().isoformat()
            }
            yield f"data: {json.dumps(error_chunk)}\n\n"
        
        # Send end-of-stream marker
        yield f"data: {json.dumps({'type': 'end'})}\n\n"
    
    return StreamingResponse(
        generate_response(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )

async def stream_text_response(response: str, agent_id: str, tools_used: bool) -> AsyncGenerator[Dict[str, Any], None]:
    """Stream a text response in chunks for better UX"""
    words = response.split()
    chunk_size = 5  # Number of words per chunk
    
    # Send initial metadata
    yield {
        "type": "start",
        "agent_id": agent_id,
        "tools_used": tools_used,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    # Stream content in chunks
    for i in range(0, len(words), chunk_size):
        chunk_words = words[i:i + chunk_size]
        chunk_content = " " + " ".join(chunk_words) if i > 0 else " ".join(chunk_words)
        
        yield {
            "type": "content",
            "content": chunk_content,
            "agent_id": agent_id,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Small delay for streaming effect
        await asyncio.sleep(0.1)

async def stream_research_response(agent: ResearcherToolAgent, user_input: str) -> AsyncGenerator[Dict[str, Any], None]:
    """Stream research progress for the research agent"""
    
    # Send start message
    yield {
        "type": "start",
        "content": "🔬 Starting AI Research Agent workflow...",
        "agent_id": "research",
        "timestamp": datetime.utcnow().isoformat()
    }
    
    await asyncio.sleep(0.5)
    
    # Extract topic
    topic = agent._extract_topic(user_input)
    if not topic:
        yield {
            "type": "error",
            "content": "❌ Please specify a research topic. For example: 'Research machine learning'",
            "timestamp": datetime.utcnow().isoformat()
        }
        return
    
    yield {
        "type": "progress",
        "content": f"📋 Research Topic: **{topic}**",
        "step": "topic_identified",
        "timestamp": datetime.utcnow().isoformat()
    }
    
    await asyncio.sleep(0.5)
    
    # Check if full research or just paper search
    user_lower = user_input.lower()
    is_full_research = any(phrase in user_lower for phrase in ["full research", "conduct research", "complete analysis", "write paper", "generate pdf", "research proposal"])
    
    try:
        if is_full_research:
            # Stream full research workflow
            async for chunk in stream_full_research(agent, topic):
                yield chunk
        else:
            # Stream paper search only
            async for chunk in stream_paper_search(agent, topic):
                yield chunk
                
    except Exception as e:
        yield {
            "type": "error",
            "content": f"❌ Research failed: {str(e)}",
            "timestamp": datetime.utcnow().isoformat()
        }

async def stream_full_research(agent: ResearcherToolAgent, topic: str) -> AsyncGenerator[Dict[str, Any], None]:
    """Stream the full research workflow with progress updates"""
    
    yield {
        "type": "progress",
        "content": "🔍 **Step 1**: Searching arXiv for relevant papers...",
        "step": "searching_papers",
        "timestamp": datetime.utcnow().isoformat()
    }
    
    await asyncio.sleep(1)
    
    yield {
        "type": "progress", 
        "content": "📄 **Step 2**: Downloading and analyzing paper content...",
        "step": "analyzing_papers",
        "timestamp": datetime.utcnow().isoformat()
    }
    
    await asyncio.sleep(2)
    
    yield {
        "type": "progress",
        "content": "🎯 **Step 3**: Identifying research gaps and opportunities...",
        "step": "identifying_gaps", 
        "timestamp": datetime.utcnow().isoformat()
    }
    
    await asyncio.sleep(1)
    
    yield {
        "type": "progress",
        "content": "✍️ **Step 4**: Generating research proposal...",
        "step": "generating_proposal",
        "timestamp": datetime.utcnow().isoformat()
    }
    
    await asyncio.sleep(2)
    
    yield {
        "type": "progress",
        "content": "📋 **Step 5**: Creating PDF document...",
        "step": "creating_pdf",
        "timestamp": datetime.utcnow().isoformat()
    }
    
    await asyncio.sleep(1)
    
    # Execute the actual research (this runs in background)
    try:
        result = agent._research_topic(topic)
        result_data = json.loads(result)
        
        if result_data.get("status") == "completed":
            yield {
                "type": "success",
                "content": f"✅ **Research Complete!**\n\n📊 **Results Summary:**\n• Papers Found: {result_data.get('papers_found', 0)}\n• Papers Analyzed: {result_data.get('papers_analyzed', 0)}\n• Steps Completed: {result_data.get('steps_completed', 0)}\n• API Calls Made: {result_data.get('api_calls_made', 0)}\n\n📄 **PDF Generated**: {result_data.get('pdf_path', 'Not available')}\n\n🔬 **Research Topic**: {result_data.get('topic', topic)}",
                "result": result_data,
                "timestamp": datetime.utcnow().isoformat()
            }
        else:
            yield {
                "type": "partial_success",
                "content": f"⚠️ **Partial Research Complete**\n\n📊 **Results:**\n• Papers Found: {result_data.get('papers_found', 0)}\n• Steps Completed: {result_data.get('steps_completed', 0)}\n\n❌ **Issue**: {result_data.get('error', 'Unknown error')}\n\n💡 **Note**: You can try again or ask for paper search only.",
                "result": result_data,
                "timestamp": datetime.utcnow().isoformat()
            }
            
    except Exception as e:
        yield {
            "type": "error",
            "content": f"❌ **Research Failed**: {str(e)}\n\n💡 **Try**: Ask for 'search papers on {topic}' instead",
            "timestamp": datetime.utcnow().isoformat()
        }

async def stream_paper_search(agent: ResearcherToolAgent, topic: str) -> AsyncGenerator[Dict[str, Any], None]:
    """Stream paper search results"""
    
    yield {
        "type": "progress",
        "content": "🔍 Searching arXiv database for papers...",
        "step": "searching",
        "timestamp": datetime.utcnow().isoformat()
    }
    
    await asyncio.sleep(1)
    
    try:
        result = agent._search_papers(topic)
        result_data = json.loads(result)
        
        if result_data.get("status") == "success":
            papers = result_data.get("papers", [])
            
            yield {
                "type": "success",
                "content": f"✅ **Found {len(papers)} papers on '{topic}'**",
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Stream each paper as a separate chunk
            for i, paper in enumerate(papers, 1):
                await asyncio.sleep(0.3)
                paper_content = f"📄 **Paper {i}**: {paper.get('title', 'Unknown Title')}\n\n👥 **Authors**: {', '.join(paper.get('authors', []))}\n\n📅 **Published**: {paper.get('published', 'Unknown')}\n\n📖 **Summary**: {paper.get('summary', 'No summary available')}\n\n🔗 **Links**: [PDF]({paper.get('pdf_url', '#')}) | [arXiv]({paper.get('arxiv_url', '#')})"
                
                yield {
                    "type": "paper",
                    "content": paper_content,
                    "paper_data": paper,
                    "paper_index": i,
                    "timestamp": datetime.utcnow().isoformat()
                }
        else:
            yield {
                "type": "error",
                "content": f"❌ **Paper search failed**: {result_data.get('error', 'Unknown error')}",
                "timestamp": datetime.utcnow().isoformat()
            }
            
    except Exception as e:
        yield {
            "type": "error",
            "content": f"❌ **Search failed**: {str(e)}",
            "timestamp": datetime.utcnow().isoformat()
        }

@app.post("/agents/{agent_id}/clear-history")
async def clear_agent_history(agent_id: str):
    """Clear agent's conversation history"""
    if agent_id not in agents_store:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    try:
        agent = agents_store[agent_id]
        agent.clear_history()
        return {"message": "Agent history cleared successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing history: {str(e)}")

# Tool management endpoints
@app.get("/agents/{agent_id}/tools")
async def get_agent_tools(agent_id: str):
    """Get all tools available to an agent"""
    if agent_id not in agents_store:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    agent = agents_store[agent_id]
    tools_info = []
    
    for tool_name, tool_data in agent.tools.items():
        tools_info.append({
            "name": tool_name,
            "description": tool_data["schema"]["function"]["description"],
            "parameters": tool_data["schema"]["function"]["parameters"]
        })
    
    return {"tools": tools_info}

@app.post("/agents/{agent_id}/tools")
async def register_tool(
    agent_id: str, 
    request: RegisterToolRequest,
    current_user: User = Depends(get_current_user)
):
    """Securely register a new tool with an agent"""
    if agent_id not in agents_store:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Check ownership
    agent_meta = agent_metadata.get(agent_id, {})
    if agent_meta.get("owner_id") != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied: You don't own this agent")
    
    try:
        # Use secure tool registry instead of dangerous exec()
        success = secure_tool_registry.register_tool(
            name=request.name,
            description=request.description,
            function_code=request.function_code,
            params_schema=request.params_schema,
            allowed_imports=request.allowed_imports
        )
        
        if success:
            # Get the securely registered tool
            tool_data = secure_tool_registry.get_tool(request.name)
            if tool_data:
                # Add to agent (assuming agent has a method to add external tools)
                agent = agents_store[agent_id]
                if hasattr(agent, 'add_external_tool'):
                    agent.add_external_tool(request.name, tool_data)
                
                # Update metadata
                agent_metadata[agent_id]["tools"] = agent.list_tools()
                
                logger.info(f"Tool '{request.name}' securely registered for agent {agent_id} by user {current_user.username}")
                return {
                    "message": f"Tool '{request.name}' registered successfully",
                    "security": "Validated and sandboxed"
                }
        
        raise HTTPException(status_code=400, detail="Tool registration failed")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Tool registration error: {e}")
        raise HTTPException(
            status_code=500, 
            detail="Tool registration failed due to security validation"
        )

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "agents_count": len(agents_store),
        "version": "1.0.0"
    }

# Demo endpoints to create sample agents (secured)
@app.post("/demo/create-sample-agent")
async def create_sample_agent(current_user: User = Depends(get_current_user)):
    """Create a sample math agent for demonstration (requires authentication)"""
    sample_request = CreateAgentRequest(
        name="Math Calculator Agent",
        description="A sample agent that can perform mathematical calculations",
        agent_type="math"
    )
    
    return await create_agent(sample_request, current_user)

@app.post("/demo/create-intelligent-agent")
async def create_intelligent_agent(current_user: User = Depends(get_current_user)):
    """Create a sample intelligent agent for demonstration (requires authentication)"""
    sample_request = CreateAgentRequest(
        name="Intelligent Web Agent",
        description="An intelligent agent that can search the web, get weather, fetch news, and access current information",
        agent_type="intelligent"
    )
    
    return await create_agent(sample_request, current_user)

@app.post("/demo/create-autonomous-agent")
async def create_autonomous_agent(current_user: User = Depends(get_current_user)):
    """Create a sample autonomous agent for demonstration (requires authentication)"""
    sample_request = CreateAgentRequest(
        name="Autonomous Planning Agent",
        description="An autonomous agent that can break down goals into steps, think through problems, and make decisions using simulated tools",
        agent_type="autonomous"
    )
    
    return await create_agent(sample_request, current_user)

@app.post("/demo/create-researcher-agent", response_model=AgentInfo)
async def create_researcher_agent_endpoint(current_user: User = Depends(get_current_user)):
    """Create a researcher agent for demonstration (requires authentication)"""
    researcher_request = CreateAgentRequest(
        name="AI Research Agent",
        description="An academic research agent that can search papers, analyze literature, identify research gaps, and generate research proposals with PDF output",
        agent_type="researcher"
    )
    
    return await create_agent(researcher_request, current_user)


@app.post("/create-research-agent")
async def create_research_agent():
    """Create a research agent (public endpoint)"""
    try:
        agent_id = str(uuid.uuid4())
        
        # Create research agent with simple fallback
        try:
            agent = ResearcherToolAgent(
                api_key=settings.GROQ_API_KEY or "",
                google_api_key="AIzaSyCBXjv8WCvKyZuv7HuTmKI1R8cbcjDDcLE"
            )
        except:
            # Fallback to intelligent agent if research agent fails
            agent = IntelligentToolAgent(api_key=settings.GROQ_API_KEY or "")
        
        agents_store[agent_id] = agent
        agent_metadata[agent_id] = {
            "id": agent_id,
            "name": "AI Research Agent",
            "description": "An academic research agent that can search papers, analyze literature, identify research gaps, and generate research proposals with PDF output",
            "agent_type": "researcher",
            "owner_id": None,
            "is_public": True,
            "created_at": "2025-08-21T00:00:00Z",
            "tools": agent.list_tools()
        }
        
        return AgentInfo(**agent_metadata[agent_id])
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create research agent: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    if settings.DEBUG:
        uvicorn.run(
            "main:app",
            host=settings.HOST, 
            port=settings.PORT,
            log_level=settings.LOG_LEVEL.lower(),
            reload=True
        )
    else:
        uvicorn.run(
            app,
            host=settings.HOST, 
            port=settings.PORT,
            log_level=settings.LOG_LEVEL.lower(),
        )