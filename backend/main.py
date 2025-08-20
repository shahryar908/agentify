from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uuid
import json
from agents.first_agent import GroqToolAgent
from agents.second_agent import IntelligentToolAgent
from agents.third_agent import AutonomousAgent

# Import blog routes
from api.blog_routes import blog_router

app = FastAPI(
    title="AI Agents API",
    description="Backend API for managing and executing AI agents",
    version="1.0.0"
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include blog routes
app.include_router(blog_router)

# Initialize blog system with sample data
try:
    from initialize_blog import initialize_blog_system
    initialize_blog_system()
    print("[SUCCESS] Blog system initialized successfully")
except Exception as e:
    print(f"[WARNING] Blog system initialization failed: {e}")

# In-memory storage for agents (in production, use a database)
agents_store: Dict[str, Any] = {}  # Can store both GroqToolAgent and IntelligentToolAgent
agent_metadata: Dict[str, Dict[str, Any]] = {}

# Pydantic models for request/response
class CreateAgentRequest(BaseModel):
    name: str
    description: str
    api_key: str
    agent_type: str = "math"  # "math", "intelligent", or "autonomous"

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    agent_id: str
    tools_used: bool = False

class AgentInfo(BaseModel):
    id: str
    name: str
    description: str
    agent_type: str
    tools: List[str]
    created_at: str

class RegisterToolRequest(BaseModel):
    name: str
    description: str
    function_code: str  # Python function as string
    params_schema: Dict[str, Any]

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "AI Agents API",
        "version": "1.0.0",
        "endpoints": {
            "agents": "/agents",
            "chat": "/agents/{agent_id}/chat",
            "tools": "/agents/{agent_id}/tools"
        }
    }

# Agent management endpoints
@app.post("/agents", response_model=AgentInfo)
async def create_agent(request: CreateAgentRequest):
    """Create a new AI agent"""
    try:
        agent_id = str(uuid.uuid4())
        
        # Create agent based on type
        if request.agent_type.lower() == "intelligent":
            agent = IntelligentToolAgent(api_key=request.api_key)
        elif request.agent_type.lower() == "autonomous":
            agent = AutonomousAgent(api_key=request.api_key)
        else:
            agent = GroqToolAgent(api_key=request.api_key)
        
        agents_store[agent_id] = agent
        agent_metadata[agent_id] = {
            "id": agent_id,
            "name": request.name,
            "description": request.description,
            "agent_type": request.agent_type,
            "created_at": "2025-08-17T00:00:00Z",  # In production, use actual timestamp
            "tools": agent.list_tools()
        }
        
        return AgentInfo(**agent_metadata[agent_id])
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create agent: {str(e)}")

@app.get("/agents", response_model=List[AgentInfo])
async def list_agents():
    """List all available agents"""
    return [AgentInfo(**metadata) for metadata in agent_metadata.values()]

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
        response = agent.chat(request.message)
        
        # Determine if tools were used based on the agent's internal logic
        if hasattr(agent, '_should_use_tool'):
            tools_used = agent._should_use_tool(request.message)
        elif hasattr(agent, '_should_use_tools'):
            tools_used = agent._should_use_tools(request.message)
        else:
            tools_used = False
        
        return ChatResponse(
            response=response,
            agent_id=agent_id,
            tools_used=tools_used
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error chatting with agent: {str(e)}")

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
async def register_tool(agent_id: str, request: RegisterToolRequest):
    """Register a new tool with an agent"""
    if agent_id not in agents_store:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    try:
        agent = agents_store[agent_id]
        
        # Create a function from the provided code
        # NOTE: In production, this should be more secure
        exec_globals = {}
        exec(request.function_code, exec_globals)
        
        # Find the function in the executed code
        func = None
        for name, obj in exec_globals.items():
            if callable(obj) and name == request.name:
                func = obj
                break
        
        if func is None:
            raise HTTPException(status_code=400, detail=f"Function '{request.name}' not found in provided code")
        
        # Register the tool
        agent.register_tool(
            name=request.name,
            func=func,
            description=request.description,
            params_schema=request.params_schema
        )
        
        # Update metadata
        agent_metadata[agent_id]["tools"] = agent.list_tools()
        
        return {"message": f"Tool '{request.name}' registered successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error registering tool: {str(e)}")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "agents_count": len(agents_store),
        "version": "1.0.0"
    }

# Demo endpoints to create sample agents
@app.post("/demo/create-sample-agent")
async def create_sample_agent():
    """Create a sample math agent for demonstration"""
    sample_request = CreateAgentRequest(
        name="Math Calculator Agent",
        description="A sample agent that can perform mathematical calculations",
        api_key="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",
        agent_type="math"
    )
    
    return await create_agent(sample_request)

@app.post("/demo/create-intelligent-agent")
async def create_intelligent_agent():
    """Create a sample intelligent agent for demonstration"""
    sample_request = CreateAgentRequest(
        name="Intelligent Web Agent",
        description="An intelligent agent that can search the web, get weather, fetch news, and access current information",
        api_key="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",
        agent_type="intelligent"
    )
    
    return await create_agent(sample_request)

@app.post("/demo/create-autonomous-agent")
async def create_autonomous_agent():
    """Create a sample autonomous agent for demonstration"""
    sample_request = CreateAgentRequest(
        name="Autonomous Planning Agent",
        description="An autonomous agent that can break down goals into steps, think through problems, and make decisions using simulated tools",
        api_key="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",
        agent_type="autonomous"
    )
    
    return await create_agent(sample_request)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)