# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This repository contains a full-stack AI agents platform with FastAPI backend and Next.js frontend. The platform supports multiple types of AI agents that can use different tools and capabilities through the Groq API, Google Custom Search, and Google Gemini. Key features include ChatGPT-style chat interface, Medium-style blog typography, advanced response formatting, and an AI Research Agent that can search academic papers and generate research proposals with PDF output.

## Architecture

### Core Components

1. **FastAPI Backend** (`backend/main.py`) - REST API server with CORS, authentication, and security middleware
2. **Agent Classes** - Four main agent types in `/agents/` directory:
   - `GroqToolAgent` (`first_agent.py`) - Math-focused agent with 6 mathematical tools
   - `IntelligentToolAgent` (`second_agent.py`) - Web-capable agent with search, weather, news tools
   - `AutonomousAgent` (`third_agent.py`) - Advanced autonomous agent with Google Custom Search
   - `ResearcherToolAgent` (`fourth_agent.py`) - AI Research Agent for academic paper analysis and generation
3. **Next.js Frontend** (`frontend/`) - Modern React-based web interface with Prisma database and research page
4. **AI Research System** (`backend/agents/fourthagent/`) - Complete academic research workflow with arXiv integration
5. **Security & Configuration** (`backend/config/`, `backend/auth/`) - JWT authentication, input validation, secure settings

### Agent Architecture Patterns

Both agent types follow a consistent pattern:
- `__init__()` - Initialize with Groq API key, register default tools
- `register_tool()` - Add new tools with schema definitions
- `chat()` - Main interaction method with intelligent routing
- `_should_use_tool(s)()` - Decision logic for tool usage
- `_handle_with_tools()` - Process requests requiring external tools
- `_llm_only()` - Handle conversational requests without tools

## Development Commands

### Backend Development

```bash
# Install Python dependencies
pip install -r requirements.txt

# Start the FastAPI backend server (Port 8002)
cd backend
python main.py
# Server runs on http://localhost:8002

# Kill processes on ports 8000-8010 if needed
netstat -ano | findstr :800  # Windows
# Or use task manager to end processes

# Run Python tests
python comprehensive_agent_test.py
python final_verification_test.py
python test_enhanced_autonomous.py

# Test AI Research Agent (requires Google API key)
cd backend/agents/fourthagent
python ai-researcher-improved.py  # Complete research workflow
python ai-researcher.py           # Simplified research workflow
python test_ai_researcher.py      # Unit tests
```

### Frontend Development (Next.js)

```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Start development server with Turbopack
npm run dev
# Server runs on http://localhost:3000

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Seed the database
npm run seed
```

### Legacy Frontend

```bash
# Access legacy frontend
# Open index.html in browser or serve via the backend at http://localhost:8000
```

## Key Architecture Details

### Next.js Frontend Structure

The modern frontend is built with:
- **Next.js 15.4.6** with App Router and React 19
- **TypeScript** for type safety
- **Tailwind CSS** for styling with custom CSS variables
- **Prisma** for database management
- **React components** in `frontend/app/components/`
- **Database schema** in `frontend/prisma/schema.prisma`
- **ChatGPT-style chat interface** with advanced response formatting
- **Medium-style typography** for blog reading pages

### Agent Types and Capabilities

**Math Agent (GroqToolAgent):**
- 6 mathematical tools: add, subtract, multiply, divide, power, sqrt
- Best for computational tasks

**Intelligent Agent (IntelligentToolAgent):**
- Web search, weather, news, datetime tools
- Context-aware tool selection
- Priority-based tool routing

**Autonomous Agent (AutonomousAgent):**
- Google Custom Search API integration
- Advanced multi-step reasoning
- Simulated and real tool execution
- Located in `backend/agents/third_agent.py`

**Research Agent (ResearcherToolAgent):**
- Academic paper search via arXiv API
- PDF content extraction and analysis
- Research gap identification
- LaTeX paper generation with PDF compilation
- Google Gemini API integration for AI analysis
- Located in `backend/agents/fourth_agent.py` with core logic in `backend/agents/fourthagent/`

### Modern Chat Interface

The chat interface (`frontend/app/chat/page.tsx`) features:
- **ChatGPT-style layout**: Full-screen design optimized for extended conversations
- **Agent deduplication**: Ensures exactly 4 unique agents (Math, Intelligent, Autonomous, Research)
- **Smart response formatting**: Automatically formats search results as interactive cards
- **Medium typography**: Professional typography for blog reading pages
- **FormattedAgentResponse component**: Handles markdown, search results, and rich content
- **Streaming support**: Real-time progress updates for research workflows

### AI Research Interface

The research interface (`frontend/app/research/page.tsx`) features:
- **Real-time progress tracking**: Live updates through each research step
- **Academic paper search**: Direct integration with arXiv database
- **PDF generation**: Download professionally formatted research papers
- **Step-by-step workflow**: Visual progress indicators for 5-step research process
- **Error handling**: Graceful fallbacks and user-friendly error messages

### Database Integration

The Next.js frontend uses Prisma with SQLite:
- Schema: `frontend/prisma/schema.prisma`
- Database: `frontend/prisma/dev.db`
- Seed script: `frontend/prisma/seed.ts`

### 3. Testing Agent Functionality

**Key test scenarios:**
- Math queries: "What is 25 + 17?" (should use tools)
- Web search: "Pakistan petrol price today" (should use search_web)
- Weather: "What's the weather in Tokyo?" (should use get_weather)
- News: "Latest technology news" (should use get_latest_news)
- Conversation: "Hello, how are you?" (should use LLM only)

### 4. Debugging Tool Usage

Both agents include extensive debug logging:
```
[DEBUG] Input: 'pakistan petrol price today'
[DEBUG] Tools might be needed - analyzing intent
[DEBUG] Potential tools identified: ['search_web']
[DEBUG] Price query detected - forcing search tool
[DEBUG] Searching web for: pakistan petrol price today
```

## Key Files and Locations

### Core Implementation Files

**Backend:**
- **`main.py`** - FastAPI application with all endpoints
- **`agents/first_agent.py`** - Math agent implementation
- **`agents/second_agent.py`** - Intelligent web agent implementation  
- **`agents/third_agent.py`** - Autonomous agent with Google Search
- **`requirements.txt`** - Python dependencies

**Frontend (Next.js):**
- **`frontend/app/page.tsx`** - Main landing page
- **`frontend/app/chat/page.tsx`** - Chat interface
- **`frontend/app/components/`** - Reusable React components
- **`frontend/app/lib/`** - API utilities and data fetching
- **`frontend/package.json`** - Node.js dependencies and scripts

**Legacy Frontend:**
- **`index.html`** - Original single-file web interface

### Important Code Sections

**Agent Management (main.py):**
- Agent creation with type selection: "math", "intelligent", "autonomous"
- In-memory storage with metadata tracking
- Support for all three agent types

**Tool Registration Pattern (first_agent.py:13-25):**
```python
def register_tool(self, name: str, func: Callable, description: str, params_schema: Dict):
    self.tools[name] = {
        "func": func,
        "schema": {"type": "function", "function": {...}}
    }
```

**Intelligent Tool Selection (second_agent.py):**
- Keyword-based intent analysis
- Context scoring system
- Price query special handling with forced tool execution

**Google Custom Search Integration (third_agent.py):**
- Real-time web search using Google Custom Search API
- Multi-step autonomous reasoning
- Error handling for API limits and timeouts

**AI Research Agent Integration (fourth_agent.py):**
- Wrapper class that integrates with the LangGraph-based research system
- Academic paper search using arXiv API (`backend/agents/fourthagent/arxiv-tool.py`)
- PDF content extraction and analysis (`backend/agents/fourthagent/read_pdf.py`)
- Research proposal generation using Google Gemini
- LaTeX to PDF compilation (`backend/agents/fourthagent/write-pdf.py`)
- Complete research workflow with 5 steps: search, analyze, identify gaps, generate paper, create PDF

## Critical Fixes and Solutions

### 1. Web Search Tool Not Working (Fixed)

**Problem:** LLM wasn't consistently calling tools for price queries
**Location:** `second_agent.py:443-481`
**Solution:** Implemented direct tool execution bypass for price/cost queries

```python
# Force direct tool execution for price queries
if any(word in user_lower for word in ["price", "cost", "rate", "petrol", "gas", "fuel"]):
    print("[DEBUG] Price query detected - forcing search tool")
    search_tool = self.tools["search_web"]["func"]
    result = search_tool(user_input)
```

### 2. Emoji Encoding Issues (Fixed)

**Problem:** UnicodeEncodeError with emoji characters
**Location:** Throughout debug output
**Solution:** Replaced emojis with text equivalents like "[DEBUG]", "[SUCCESS]"

### 3. DateTime Tool Error (Fixed)

**Problem:** "argument after ** must be a mapping, not NoneType"
**Location:** `second_agent.py:565-567`
**Solution:** Added null check for arguments

```python
if args is None:
    args = {}
result = func(**args)
```

## Development Patterns

### Adding New Agent Types

1. Create new agent class in `/agents/` directory
2. Follow the established pattern with `chat()`, `register_tool()`, etc.
3. Update `main.py:78-82` to handle the new agent type
4. Add frontend dropdown option in `index.html`

### Adding New Tools

Follow the registration pattern:
```python
def tool_function(param1: type, param2: type) -> return_type:
    """Tool description for LLM"""
    return result

self.register_tool(
    "tool_name",
    tool_function,
    "Description for LLM understanding",
    {
        "type": "object",
        "properties": {
            "param1": {"type": "number", "description": "Parameter description"},
            "param2": {"type": "string", "description": "Parameter description"}
        },
        "required": ["param1", "param2"]
    }
)
```

### Error Handling Pattern

All major functions include try-catch blocks with fallback responses:
```python
try:
    # Main logic
    return successful_response
except Exception as e:
    print(f"[ERROR] {error_description}: {e}")
    return fallback_response
```

## API Endpoints

### Agent Management
- `GET /` - API information
- `POST /agents` - Create new agent
- `GET /agents` - List all agents
- `GET /agents/{id}` - Get specific agent
- `DELETE /agents/{id}` - Delete agent

### Agent Interaction
- `POST /agents/{id}/chat` - Send message to agent
- `POST /agents/{id}/clear-history` - Clear conversation history
- `GET /agents/{id}/tools` - List agent tools

### Demo Endpoints
- `POST /demo/create-sample-agent` - Create math agent
- `POST /demo/create-intelligent-agent` - Create web agent
- `POST /demo/create-autonomous-agent` - Create autonomous agent
- `POST /create-research-agent` - Create research agent (public endpoint)

### Streaming Endpoints
- `POST /agents/{id}/chat/stream` - Real-time streaming chat responses
- Special handling for research agent with step-by-step progress updates

## Configuration

### Environment Variables
Configuration managed via `backend/config/settings.py` using Pydantic BaseSettings:
- `GROQ_API_KEY` - Required for all agents using Groq LLMs
- `GOOGLE_API_KEY` - Required for research agent (Gemini API)
- `GOOGLE_CUSTOM_SEARCH_API_KEY` - Optional for enhanced web search
- `GOOGLE_CUSTOM_SEARCH_ENGINE_ID` - Optional for enhanced web search
- `DATABASE_URL` - Database connection string (defaults to SQLite)
- `JWT_SECRET_KEY` - Authentication secret key
- `DEBUG` - Development mode toggle
- Environment variables can be set in `.env` file

### Port Configuration
- **Backend**: Runs on port 8001 (configurable in settings)
- **Frontend**: Runs on port 3000
- **API Configuration**: `frontend/app/lib/api.ts` configures base URL to match backend port
- **Important**: Backend port may change between 8001-8002 depending on configuration

### API Keys
- **Groq API**: Used by all agents for LLM functionality
- **Google Gemini API**: Used by research agent for paper analysis and generation
- **Google Custom Search API**: Used by intelligent and autonomous agents for web search
- **Configuration**: Set via environment variables in `.env` file or `backend/config/settings.py`

### Typography Systems

**Chat Typography** (`prose-chat` class):
- ChatGPT-style font stack (-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto)
- 15px font size with 1.7 line height
- Search result cards with hover effects
- Proper markdown rendering for headers, lists, code blocks

**Blog Typography** (`prose-blog` class):
- Medium-style typography with Charter serif and Sohne sans-serif fonts
- Authentic Medium spacing and sizing
- 21px body text with 1.58 line height
- Professional article reading experience

### Dependencies
All dependencies listed in `requirements.txt` and `frontend/package.json` with specific versions.

## Testing

### Manual Testing Scenarios

1. **Math Agent Tests:**
   - "What is 42 + 28?" → Should use add_numbers tool
   - "twenty times four" → Should use multiply_numbers tool
   - "Hello" → Should use LLM only

2. **Intelligent Agent Tests:**
   - "Pakistan petrol price today" → Should use search_web tool
   - "Weather in Tokyo" → Should use get_weather tool
   - "Latest news" → Should use get_latest_news tool

3. **Research Agent Tests:**
   - "Research machine learning" → Should trigger full research workflow
   - "Find papers on quantum computing" → Should search arXiv and return papers
   - "Conduct research on prompt engineering" → Should generate complete research paper with PDF

### Debug Output Interpretation

Look for these debug patterns:
- `[DEBUG]` - General debugging information
- `[ERROR]` - Error conditions
- `[SUCCESS]` - Successful tool execution
- Tool usage indicators in agent responses

## Troubleshooting

### Common Issues

1. **Port conflicts:** Use port 8001 for backend (configurable), frontend on 3000
2. **Agent duplication:** Frontend shows more agents than expected - check deduplication logic in `getOrderedUniqueAgents()`
3. **Routes manifest error:** Ensure Next.js uses standard `.next` build directory, not custom paths
4. **Search results formatting:** Raw search results display - verify `FormattedAgentResponse` component is working
5. **Typography issues:** Check that `prose-chat` and `prose-blog` classes are applied correctly
6. **API connection errors:** Verify backend is running on correct port and frontend API configuration matches
7. **Research agent failures:** Ensure Google API key is configured in `.env` file for research functionality
8. **PDF generation errors:** Verify LaTeX installation and write permissions for output directory

### Performance Considerations

- In-memory storage for agents (consider database for production)
- No rate limiting implemented
- Single-threaded FastAPI (use workers for production)

## Extension Points

### Ready for Extension

1. **Database Integration:** Replace in-memory storage with persistent database
2. **Authentication:** Add user management and API key authentication
3. **More Agent Types:** Follow established patterns to add specialized agents
4. **Tool Marketplace:** Dynamic tool loading and sharing
5. **Real-time Features:** WebSocket support for live agent interactions

### File Locations for Common Modifications

**Backend:**
- **Add new endpoints:** `main.py` (follow existing patterns)
- **Modify agent behavior:** Respective agent files in `/agents/`
- **Add Python dependencies:** `requirements.txt`

**Frontend (Next.js):**
- **Add new pages:** `frontend/app/` directory
- **Modify components:** `frontend/app/components/`
- **Update database schema:** `frontend/prisma/schema.prisma`
- **Add Node.js dependencies:** `frontend/package.json`

**Legacy Frontend:**
- **Update UI:** `index.html` (single file contains all frontend code)

## Testing and Quality

### Available Test Files

- `comprehensive_agent_test.py` - End-to-end agent testing
- `final_verification_test.py` - Final system verification
- `test_enhanced_autonomous.py` - Autonomous agent specific tests

### Frontend Testing

```bash
cd frontend
npm run lint  # ESLint for code quality
```

### Manual Testing Scenarios

**Backend API Testing:**
```bash
# Test endpoints using curl or frontend interface
curl -X POST http://localhost:8000/demo/create-sample-agent
```

## Recent Updates and Key Fixes

### ChatGPT-Style Interface Implementation
- **Complete redesign** of chat page from sidebar to full-screen layout
- **Agent deduplication** ensuring exactly 3 unique agents display
- **Advanced response formatting** with `FormattedAgentResponse` component
- **Search result cards** with interactive hover effects and proper structure
- **Typography consistency** with ChatGPT-style fonts and spacing

### Typography Systems Integration
- **Medium-style blog typography** for article reading pages
- **ChatGPT-style chat typography** for agent responses
- **CSS custom properties** for theme consistency
- **Dark/light mode support** across all typography

### Critical Configuration Updates
- **Port standardization**: Backend runs on 8002, frontend on 3000
- **Build directory fix**: Next.js uses standard `.next` directory
- **API endpoint corrections**: All endpoints updated to match port 8002
- **Agent type validation**: Ensures only math, intelligent, autonomous types

### Response Formatting Enhancements
- **Automatic search result parsing** into structured cards
- **Markdown support** for headers, lists, bold/italic text
- **Sources section formatting** with visual separation
- **Code block styling** with proper syntax highlighting

## AI Research Agent Architecture

### Research Workflow Components

The AI Research Agent follows a 5-step LangGraph workflow:

1. **Paper Search** (`_search_papers_node`) - Query arXiv API for relevant papers
2. **Paper Analysis** (`_analyze_papers_node`) - Extract and analyze PDF content 
3. **Gap Identification** (`_identify_gaps_node`) - Use Gemini to identify research opportunities
4. **Paper Generation** (`_generate_paper_node`) - Create LaTeX research proposal
5. **PDF Creation** (`_create_pdf_node`) - Compile LaTeX to PDF using pdflatex

### Key Dependencies

**Research Agent Specific:**
- `langgraph` - Workflow orchestration
- `langchain-google-genai` - Google Gemini integration
- `PyPDF2` - PDF content extraction
- `requests` - arXiv API calls
- `pdflatex` - LaTeX compilation (system dependency)

**Core Platform:**
- `fastapi` - Backend API framework
- `groq` - LLM API client
- `next.js` - Frontend framework
- `prisma` - Database ORM
- `tailwindcss` - Styling framework

### File Structure for Research Agent

```
backend/agents/fourthagent/
├── ai-researcher-improved.py    # Main LangGraph workflow
├── ai-researcher.py             # Simplified version
├── arxiv-tool.py                # arXiv API integration
├── read_pdf.py                  # PDF content extraction
├── write-pdf.py                 # LaTeX to PDF compilation
├── test_ai_researcher.py        # Unit tests
├── requirements.txt             # Research agent dependencies
├── .env                         # API keys (Google)
└── output/                      # Generated PDFs and LaTeX files
```

This documentation provides comprehensive guidance for future development and maintenance of the AI agents platform.