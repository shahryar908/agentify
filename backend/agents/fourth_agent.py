"""
Fourth Agent: AI Researcher Agent
Wrapper for the AI Researcher Agent to integrate with the existing agent architecture
"""

import json
import sys
import os
from typing import Dict, Any, List, Callable
from pathlib import Path

# Add the fourthagent directory to the path
fourthagent_path = Path(__file__).parent / "fourthagent"
sys.path.insert(0, str(fourthagent_path))

try:
    # Import using the actual filename (with hyphens)
    import importlib.util
    spec = importlib.util.spec_from_file_location("ai_researcher_improved", fourthagent_path / "ai-researcher-improved.py")
    ai_researcher_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(ai_researcher_module)
    AIResearcherAgent = ai_researcher_module.AIResearcherAgent
except Exception as e:
    print(f"Warning: AI Researcher Agent dependencies not available: {e}")
    AIResearcherAgent = None

class ResearcherToolAgent:
    """
    Wrapper for the AI Researcher Agent to integrate with the existing agent architecture.
    This agent specializes in academic research by searching papers, analyzing them,
    and generating new research proposals with PDF output.
    """
    
    def __init__(self, api_key: str = None, google_api_key: str = None):
        """
        Initialize the Research Tool Agent
        
        Args:
            api_key: Groq API key (not used by this agent, but kept for compatibility)
            google_api_key: Google API key for Gemini and Custom Search
        """
        self.conversation_history = []
        self.tools = {}
        self.google_api_key = google_api_key or os.getenv("GOOGLE_API_KEY")
        
        # Initialize the core AI researcher if available
        if AIResearcherAgent:
            try:
                self.researcher = AIResearcherAgent(
                    model_name="gemini-2.5-pro",
                    api_key=self.google_api_key,
                    max_papers=2,
                    max_api_calls=10
                )
                self._setup_tools()
            except Exception as e:
                print(f"Warning: Could not initialize AI Researcher: {e}")
                self.researcher = None
        else:
            self.researcher = None
            
    def _setup_tools(self):
        """Set up the research tools"""
        self.register_tool(
            "research_topic",
            self._research_topic,
            "Conduct comprehensive research on a given topic by searching papers, analyzing them, and generating a research proposal with PDF output",
            {
                "type": "object",
                "properties": {
                    "topic": {
                        "type": "string",
                        "description": "The research topic to investigate (e.g., 'machine learning', 'prompt engineering', 'neural networks')"
                    }
                },
                "required": ["topic"]
            }
        )
        
        self.register_tool(
            "search_papers",
            self._search_papers,
            "Search for academic papers on arXiv related to a specific topic",
            {
                "type": "object",
                "properties": {
                    "topic": {
                        "type": "string",
                        "description": "The research topic to search for papers"
                    },
                    "max_papers": {
                        "type": "integer",
                        "description": "Maximum number of papers to return (default: 5)",
                        "default": 5
                    }
                },
                "required": ["topic"]
            }
        )
    
    def register_tool(self, name: str, func: Callable, description: str, params_schema: Dict):
        """Register a tool with the agent"""
        self.tools[name] = {
            "func": func,
            "schema": {
                "type": "function",
                "function": {
                    "name": name,
                    "description": description,
                    "parameters": params_schema
                }
            }
        }
    
    def _research_topic(self, topic: str) -> str:
        """
        Conduct comprehensive research on a topic
        
        Args:
            topic: The research topic to investigate
            
        Returns:
            JSON string containing research results and PDF path
        """
        if not self.researcher:
            return json.dumps({
                "error": "AI Researcher not available. Please ensure Google API key is configured.",
                "topic": topic,
                "status": "failed"
            })
        
        try:
            print(f"[DEBUG] Starting research for topic: {topic}")
            results = self.researcher.research(topic)
            
            # Format results for better presentation
            formatted_results = {
                "topic": results.get("topic", topic),
                "status": "completed" if results.get("workflow_completed") else "partial",
                "papers_found": results.get("papers_found", 0),
                "papers_analyzed": results.get("papers_analyzed", 0),
                "steps_completed": results.get("steps_completed", 0),
                "api_calls_made": results.get("api_calls_made", 0),
                "pdf_path": results.get("final_pdf_path", ""),
                "identified_gaps": results.get("identified_gaps", ""),
                "error": results.get("error", None)
            }
            
            print(f"[DEBUG] Research completed: {formatted_results}")
            return json.dumps(formatted_results, indent=2)
            
        except Exception as e:
            error_result = {
                "error": f"Research failed: {str(e)}",
                "topic": topic,
                "status": "failed"
            }
            print(f"[ERROR] Research failed: {e}")
            return json.dumps(error_result)
    
    def _search_papers(self, topic: str, max_papers: int = 5) -> str:
        """
        Search for academic papers on a topic
        
        Args:
            topic: The research topic to search for
            max_papers: Maximum number of papers to return
            
        Returns:
            JSON string containing paper search results
        """
        try:
            # Import arxiv search tool
            fourthagent_path = Path(__file__).parent / "fourthagent"
            sys.path.insert(0, str(fourthagent_path))
            
            import importlib.util
            tool_path = fourthagent_path / "arxiv-tool.py"
            spec = importlib.util.spec_from_file_location("arxiv_tool", str(tool_path))
            arxiv_tool = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(arxiv_tool)
            
            result = arxiv_tool.arxiv_search.invoke({"topic": topic})
            papers = result.get("entries", [])[:max_papers]
            
            formatted_papers = []
            for paper in papers:
                formatted_papers.append({
                    "title": paper.get("title", "Unknown"),
                    "authors": paper.get("authors", []),
                    "summary": paper.get("summary", "")[:300] + "..." if len(paper.get("summary", "")) > 300 else paper.get("summary", ""),
                    "published": paper.get("published", ""),
                    "pdf_url": paper.get("pdf", ""),
                    "arxiv_url": paper.get("link", "")
                })
            
            search_results = {
                "topic": topic,
                "papers_found": len(formatted_papers),
                "papers": formatted_papers,
                "status": "success"
            }
            
            return json.dumps(search_results, indent=2)
            
        except Exception as e:
            error_result = {
                "error": f"Paper search failed: {str(e)}",
                "topic": topic,
                "status": "failed"
            }
            return json.dumps(error_result)
    
    def _should_use_tools(self, user_input: str) -> bool:
        """
        Determine if the input requires using research tools
        
        Args:
            user_input: The user's message
            
        Returns:
            True if tools should be used, False otherwise
        """
        user_lower = user_input.lower()
        
        # Research keywords
        research_keywords = [
            "research", "paper", "study", "analyze", "investigation", "academic",
            "literature", "survey", "review", "arxiv", "publication", "scholar",
            "thesis", "dissertation", "journal", "conference", "methodology",
            "experiment", "findings", "results", "conclusion", "hypothesis",
            "gap analysis", "state of the art", "related work", "bibliography"
        ]
        
        # Action keywords that suggest research activity
        action_keywords = [
            "find papers", "search literature", "conduct research", "analyze papers",
            "write paper", "generate pdf", "create proposal", "identify gaps",
            "literature review", "research proposal", "academic writing"
        ]
        
        # Check for research-related terms
        has_research_keywords = any(keyword in user_lower for keyword in research_keywords)
        has_action_keywords = any(keyword in user_lower for keyword in action_keywords)
        
        # Also check for question patterns that suggest research
        research_patterns = [
            "what is the current state of",
            "what are the latest developments in",
            "what research has been done on",
            "help me research",
            "find information about",
            "write a paper on",
            "generate a research proposal"
        ]
        
        has_research_patterns = any(pattern in user_lower for pattern in research_patterns)
        
        return has_research_keywords or has_action_keywords or has_research_patterns
    
    def _handle_with_tools(self, user_input: str) -> str:
        """
        Handle user input that requires research tools
        
        Args:
            user_input: The user's message
            
        Returns:
            Response from the appropriate tool
        """
        user_lower = user_input.lower()
        
        # Determine which tool to use based on intent
        if any(phrase in user_lower for phrase in ["full research", "conduct research", "complete analysis", "write paper", "generate pdf", "research proposal"]):
            # Extract topic for full research
            topic = self._extract_topic(user_input)
            if topic:
                return self._research_topic(topic)
            else:
                return "Please specify a research topic. For example: 'Conduct research on machine learning'"
        
        elif any(phrase in user_lower for phrase in ["search papers", "find papers", "literature search", "arxiv search"]):
            # Extract topic for paper search
            topic = self._extract_topic(user_input)
            if topic:
                return self._search_papers(topic)
            else:
                return "Please specify a topic to search for papers. For example: 'Search papers on neural networks'"
        
        else:
            # Default to full research for general research queries
            topic = self._extract_topic(user_input)
            if topic:
                return self._research_topic(topic)
            else:
                return "I can help you with academic research! Please specify a topic. For example: 'Research machine learning algorithms' or 'Find papers on quantum computing'"
    
    def _extract_topic(self, user_input: str) -> str:
        """
        Extract research topic from user input
        
        Args:
            user_input: The user's message
            
        Returns:
            Extracted topic or None
        """
        user_input = user_input.strip()
        
        # Common patterns to remove
        patterns_to_remove = [
            "conduct research on", "research", "find papers on", "search papers", 
            "write paper on", "analyze", "study", "investigate", "help me research",
            "full research on", "complete analysis of", "literature review on",
            "research proposal on", "papers about", "information about"
        ]
        
        topic = user_input.lower()
        
        # Remove common patterns
        for pattern in patterns_to_remove:
            if pattern in topic:
                topic = topic.replace(pattern, "").strip()
        
        # Remove extra words
        stop_words = ["the", "a", "an", "of", "in", "on", "at", "to", "for", "with", "about"]
        words = topic.split()
        filtered_words = [word for word in words if word not in stop_words or len(words) <= 2]
        
        topic = " ".join(filtered_words).strip()
        
        # Ensure topic is not empty and has reasonable length
        if len(topic) >= 2 and len(topic) <= 100:
            return topic
        
        return None
    
    def _llm_only(self, user_input: str) -> str:
        """
        Handle conversational queries without tools using built-in knowledge
        
        Args:
            user_input: The user's message
            
        Returns:
            Conversational response
        """
        user_lower = user_input.lower()
        
        # Greetings and basic interaction
        if any(greeting in user_lower for greeting in ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"]):
            return "Hello! I'm an AI Research Agent specializing in academic research. I can help you:\n\n• Conduct comprehensive research on any topic\n• Search for academic papers on arXiv\n• Analyze papers and identify research gaps\n• Generate research proposals with PDF output\n\nWhat would you like to research today?"
        
        # Capability questions
        if any(phrase in user_lower for phrase in ["what can you do", "your capabilities", "help me", "how do you work"]):
            return """I'm an AI Research Agent with the following capabilities:

🔬 **Full Research Workflow**:
   • Search arXiv for relevant papers
   • Download and analyze paper content
   • Identify research gaps and opportunities
   • Generate new research proposals
   • Create PDF documents with LaTeX

📚 **Paper Search**:
   • Find academic papers on any topic
   • Extract key information and summaries
   • Provide direct links to papers

🎯 **Research Tools**:
   • `research_topic`: Complete research workflow with PDF output
   • `search_papers`: Quick paper search and summary

**Example Usage**:
• "Conduct research on machine learning"
• "Search papers on quantum computing"
• "Write a research proposal on neural networks"

How can I assist with your research today?"""
        
        # Questions about research process
        if any(phrase in user_lower for phrase in ["how does research work", "research process", "workflow"]):
            return """My research workflow follows these steps:

1. **Paper Search** 📄
   • Search arXiv for relevant papers
   • Filter and select most relevant results

2. **Paper Analysis** 🔍
   • Download and read paper content
   • Extract key findings and methodologies
   • Summarize contributions and limitations

3. **Gap Identification** 🎯
   • Compare findings across papers
   • Identify research gaps and opportunities
   • Suggest improvements and innovations

4. **Proposal Generation** ✍️
   • Create original research proposal
   • Include methodology and expected results
   • Format as academic paper

5. **PDF Creation** 📋
   • Generate LaTeX document
   • Compile to professional PDF
   • Provide downloadable output

Ready to start researching a topic?"""
        
        # Error guidance
        if "error" in user_lower or "not working" in user_lower:
            return """If you're experiencing issues, here are some tips:

• **API Access**: Ensure Google API key is configured for Gemini and arXiv access
• **Topic Clarity**: Be specific about your research topic
• **Patience**: Research workflows can take 1-2 minutes to complete
• **Format**: Try phrases like "Research [topic]" or "Find papers on [topic]"

**Common Issues**:
• "API call limit reached" → Wait a few minutes and try again
• "No papers found" → Try broader or different keywords
• "PDF generation failed" → Check LaTeX syntax and content

Need help with a specific research topic?"""
        
        # Default response for unclear input
        return """I specialize in academic research and can help you:

• **Research Topics**: "Conduct research on artificial intelligence"
• **Find Papers**: "Search papers on blockchain technology"  
• **Generate Proposals**: "Write a research proposal on climate change"

What research topic interests you? Just tell me what you'd like to investigate!"""
    
    def chat(self, user_input: str) -> str:
        """
        Main chat interface for the Research Agent
        
        Args:
            user_input: The user's message
            
        Returns:
            Agent's response
        """
        # Add to conversation history
        self.conversation_history.append({"role": "user", "content": user_input})
        
        try:
            # Determine if we should use tools
            if self._should_use_tools(user_input):
                response = self._handle_with_tools(user_input)
            else:
                response = self._llm_only(user_input)
            
            # Add response to history
            self.conversation_history.append({"role": "assistant", "content": response})
            
            return response
            
        except Exception as e:
            error_response = f"I encountered an error while processing your request: {str(e)}\n\nPlease try rephrasing your question or ask for help with research capabilities."
            self.conversation_history.append({"role": "assistant", "content": error_response})
            return error_response
    
    def clear_history(self):
        """Clear the conversation history"""
        self.conversation_history = []
    
    def list_tools(self) -> List[str]:
        """Return a list of available tool names"""
        return list(self.tools.keys())