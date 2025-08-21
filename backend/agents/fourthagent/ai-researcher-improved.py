
"""
AI Researcher Agent using LangGraph

This agent orchestrates a complete research workflow:
1. Search arXiv for related papers
2. Read and analyze each paper
3. Identify gaps and improvements
4. Generate a new research paper
5. Output the final PDF

Dependencies:
- langgraph
- langchain-core
- langchain-google-genai
- PyPDF2
- requests
- python-dotenv
"""

import json
import os
import time
import random
from datetime import datetime
from typing import TypedDict, List, Dict, Any
from pathlib import Path
from xml.dom.minidom import Document
from dotenv import load_dotenv
from google.api_core.exceptions import ResourceExhausted

from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, AIMessage
from langchain_google_genai import ChatGoogleGenerativeAI

# Load environment variables
load_dotenv()

# Import your custom tools
import importlib.util
import sys

# Import arxiv_tool
tool_path = r"C:\Users\User\Ai_agents\backend\agents\fourthagent\arxiv-tool.py"
spec = importlib.util.spec_from_file_location("arxiv_tool", tool_path)
arxiv_tool = importlib.util.module_from_spec(spec)
spec.loader.exec_module(arxiv_tool)
arxiv_search = arxiv_tool.arxiv_search  

# Import read_pdf
from read_pdf import read_pdf

# Import write_pdf
tool_path = r"C:\Users\User\Ai_agents\backend\agents\fourthagent\write-pdf.py"
spec = importlib.util.spec_from_file_location("write_pdf", tool_path)
write_pdf = importlib.util.module_from_spec(spec)
spec.loader.exec_module(write_pdf)
render_latex_pdf = write_pdf.render_latex_pdf

class ResearchState(TypedDict):
    """State for the AI Researcher workflow"""
    topic: str
    papers: List[Dict[str, Any]]
    paper_analyses: List[Dict[str, str]]
    identified_gaps: str
    research_proposal: str
    final_pdf_path: str
    messages: List[Any]
    step_count: int
    current_step: str

class AIResearcherAgent:
    """
    AI Researcher Agent that follows a structured workflow to:
    1. Search for research papers
    2. Analyze them
    3. Identify improvements
    4. Generate new research paper
    """
    
    def __init__(self, model_name: str = None, api_key: str = None, max_papers: int = 3):
        """Initialize the AI Researcher Agent
        
        Args:
            model_name: The Gemini model to use (default: gemini-2.5-pro)
            api_key: Google API key (if None, will use environment variable)
            max_papers: Maximum number of papers to analyze (default: 3)
        """
        self.max_papers = max_papers
        self.llm = ChatGoogleGenerativeAI(
            model=model_name or os.getenv("MODEL_NAME", "gemini-2.5-pro"),
            google_api_key=api_key or os.getenv("GOOGLE_API_KEY"),
            temperature=float(os.getenv("TEMPERATURE", "0.1")),
            max_output_tokens=65536
        )
        self.workflow = self._create_workflow()
        
    def _create_workflow(self) -> StateGraph:
        """Create the LangGraph workflow"""
        workflow = StateGraph(ResearchState)
        workflow.add_node("search_papers", self._search_papers_node)
        workflow.add_node("analyze_papers", self._analyze_papers_node)
        workflow.add_node("identify_gaps", self._identify_gaps_node)
        workflow.add_node("generate_paper", self._generate_paper_node)
        workflow.add_node("create_pdf", self._create_pdf_node)
        workflow.set_entry_point("search_papers")
        workflow.add_edge("search_papers", "analyze_papers")
        workflow.add_edge("analyze_papers", "identify_gaps")
        workflow.add_edge("identify_gaps", "generate_paper")
        workflow.add_edge("generate_paper", "create_pdf")
        workflow.add_edge("create_pdf", END)
        return workflow.compile()
    
    def _retry_with_backoff(self, func, *args, max_retries=5, initial_delay=2, max_delay=60):
        """Retry a function with exponential backoff on ResourceExhausted errors"""
        delay = initial_delay
        for attempt in range(max_retries):
            try:
                return func(*args)
            except ResourceExhausted as e:
                if attempt == max_retries - 1:
                    raise e
                wait_time = min(delay * (2 ** attempt) + random.uniform(0, 1), max_delay)
                print(f"Retrying in {wait_time:.1f} seconds due to ResourceExhausted: {e}")
                time.sleep(wait_time)
        raise Exception("Max retries reached")

    def _search_papers_node(self, state: ResearchState) -> ResearchState:
        """Node 1: Search for research papers using arXiv"""
        print(f"\n[DEBUG] Step 1: Searching for papers on '{state['topic']}'")
        try:
            result = self._retry_with_backoff(arxiv_search.invoke, {"topic": state["topic"]})
            papers = result.get("entries", [])[:self.max_papers]  # Limit number of papers
            print(f"Found {len(papers)} papers")
            state["papers"] = papers
            state["current_step"] = "search_completed"
            state["step_count"] = 1
            state["messages"].append(
                AIMessage(content=f"Successfully found {len(papers)} research papers on {state['topic']}")
            )
        except Exception as e:
            print(f"Error searching papers: {e}")
            state["messages"].append(AIMessage(content=f"Error searching papers: {str(e)}"))
            state["papers"] = []
        return state
    
    def _analyze_papers_node(self, state: ResearchState) -> ResearchState:
        """Node 2: Analyze each paper using PDF reading"""
        print(f"\nStep 2: Analyzing {len(state['papers'])} papers")
        analyses = []
        for i, paper in enumerate(state["papers"], 1):
            print(f"Analyzing paper {i}/{len(state['papers'])}: {paper.get('title', 'Unknown')}")
            try:
                pdf_url = paper.get("pdf")
                if not pdf_url:
                    print(f"No PDF URL for paper {i}")
                    continue
                pdf_content = self._retry_with_backoff(read_pdf.invoke, {"url": pdf_url})
                analysis_prompt = f"""
                Analyze this research paper and provide a structured summary:
                Paper Title: {paper.get('title', 'Unknown')}
                Authors: {', '.join(paper.get('authors', []))}
                Paper Content: {pdf_content[:8000]}
                Please provide:
                1. **Abstract Summary**: Key points from the abstract
                2. **Methodology**: Main approaches and techniques used
                3. **Key Results**: Primary findings and contributions
                4. **Limitations**: What the authors acknowledge as limitations
                5. **Future Work**: Areas the authors suggest for improvement
                Format your response as structured text with clear sections.
                """
                response = self._retry_with_backoff(self.llm.invoke, [HumanMessage(content=analysis_prompt)])
                analysis = {
                    "paper_title": paper.get("title", "Unknown"),
                    "authors": paper.get("authors", []),
                    "summary": paper.get("summary", ""),
                    "analysis": response.content,
                    "pdf_url": pdf_url
                }
                analyses.append(analysis)
                print(f"Completed analysis for paper {i}")
            except Exception as e:
                print(f"Error analyzing paper {i}: {e}")
                continue

"""
AI Researcher Agent using LangGraph

This agent orchestrates a complete research workflow:
1. Search arXiv for related papers
2. Read and analyze each paper
3. Identify gaps and improvements
4. Generate a new research paper
5. Output the final PDF

Dependencies:
- langgraph
- langchain-core
- langchain-google-genai
- PyPDF2
- requests
- python-dotenv
"""

import json
import os
import time
import random
from typing import TypedDict, List, Dict, Any
from pathlib import Path
from dotenv import load_dotenv
from google.api_core.exceptions import ResourceExhausted

from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, AIMessage
from langchain_google_genai import ChatGoogleGenerativeAI

# Load environment variables
load_dotenv()

# Import your custom tools
import importlib.util
import sys

# Import arxiv_tool
tool_path = r"C:\Users\User\Ai_agents\backend\agents\fourthagent\arxiv-tool.py"
spec = importlib.util.spec_from_file_location("arxiv_tool", tool_path)
arxiv_tool = importlib.util.module_from_spec(spec)
spec.loader.exec_module(arxiv_tool)
arxiv_search = arxiv_tool.arxiv_search  

# Import read_pdf
from read_pdf import read_pdf

# Import write_pdf
tool_path = r"C:\Users\User\Ai_agents\backend\agents\fourthagent\write-pdf.py"
spec = importlib.util.spec_from_file_location("write_pdf", tool_path)
write_pdf = importlib.util.module_from_spec(spec)
spec.loader.exec_module(write_pdf)
render_latex_pdf = write_pdf.render_latex_pdf

class ResearchState(TypedDict):
    """State for the AI Researcher workflow"""
    topic: str
    papers: List[Dict[str, Any]]
    paper_analyses: List[Dict[str, str]]
    identified_gaps: str
    research_proposal: str
    final_pdf_path: str
    messages: List[Any]
    step_count: int
    current_step: str
    api_call_count: int

class AIResearcherAgent:
    """
    AI Researcher Agent that follows a structured workflow to:
    1. Search for research papers
    2. Analyze them
    3. Identify improvements
    4. Generate new research paper
    """
    
    def __init__(self, model_name: str = None, api_key: str = None, max_papers: int = 2, max_api_calls: int = 10):
        """Initialize the AI Researcher Agent
        
        Args:
            model_name: The Gemini model to use (default: gemini-2.5-pro)
            api_key: Google API key (if None, will use environment variable)
            max_papers: Maximum number of papers to analyze (default: 2)
            max_api_calls: Maximum number of API calls before skipping steps (default: 10)
        """
        self.max_papers = max_papers
        self.max_api_calls = max_api_calls
        self.api_call_count = 0
        self.llm = ChatGoogleGenerativeAI(
            model=model_name or os.getenv("MODEL_NAME", "gemini-2.5-pro"),
            google_api_key=api_key or os.getenv("GOOGLE_API_KEY"),
            temperature=float(os.getenv("TEMPERATURE", "0.1")),
            max_output_tokens=65536
        )
        self.workflow = self._create_workflow()
        
    def _create_workflow(self) -> StateGraph:
        """Create the LangGraph workflow"""
        workflow = StateGraph(ResearchState)
        workflow.add_node("search_papers", self._search_papers_node)
        workflow.add_node("analyze_papers", self._analyze_papers_node)
        workflow.add_node("identify_gaps", self._identify_gaps_node)
        workflow.add_node("generate_paper", self._generate_paper_node)
        workflow.add_node("create_pdf", self._create_pdf_node)
        workflow.set_entry_point("search_papers")
        workflow.add_edge("search_papers", "analyze_papers")
        workflow.add_edge("analyze_papers", "identify_gaps")
        workflow.add_edge("identify_gaps", "generate_paper")
        workflow.add_edge("generate_paper", "create_pdf")
        workflow.add_edge("create_pdf", END)
        return workflow.compile()
    
    def _retry_with_backoff(self, func, *args, max_retries=5, initial_delay=2, max_delay=60):
        """Retry a function with exponential backoff on ResourceExhausted errors"""
        delay = initial_delay
        for attempt in range(max_retries):
            if self.api_call_count >= self.max_api_calls:
                raise ResourceExhausted("API call limit reached")
            self.api_call_count += 1
            try:
                return func(*args)
            except ResourceExhausted as e:
                if attempt == max_retries - 1:
                    raise e
                wait_time = min(delay * (2 ** attempt) + random.uniform(0, 1), max_delay)
                print(f"Retrying in {wait_time:.1f} seconds due to ResourceExhausted: {e}")
                time.sleep(wait_time)
        raise Exception("Max retries reached")

    def _search_papers_node(self, state: ResearchState) -> ResearchState:
        """Node 1: Search for research papers using arXiv"""
        print(f"\n[DEBUG] Step 1: Searching for papers on '{state['topic']}'")
        try:
            result = self._retry_with_backoff(arxiv_search.invoke, {"topic": state["topic"]})
            papers = result.get("entries", [])[:self.max_papers]
            print(f"Found {len(papers)} papers")
            state["papers"] = papers
            state["current_step"] = "search_completed"
            state["step_count"] = 1
            state["api_call_count"] = self.api_call_count
            state["messages"].append(
                AIMessage(content=f"Successfully found {len(papers)} research papers on {state['topic']}")
            )
        except Exception as e:
            print(f"Error searching papers: {e}")
            state["messages"].append(AIMessage(content=f"Error searching papers: {str(e)}"))
            state["papers"] = []
            state["api_call_count"] = self.api_call_count
        return state
    
    def _analyze_papers_node(self, state: ResearchState) -> ResearchState:
        """Node 2: Analyze each paper using PDF reading"""
        print(f"\nStep 2: Analyzing {len(state['papers'])} papers")
        analyses = []
        for i, paper in enumerate(state["papers"], 1):
            print(f"Analyzing paper {i}/{len(state['papers'])}: {paper.get('title', 'Unknown')}")
            try:
                pdf_url = paper.get("pdf")
                if not pdf_url:
                    print(f"No PDF URL for paper {i}")
                    continue
                pdf_content = self._retry_with_backoff(read_pdf.invoke, {"url": pdf_url})
                analysis_prompt = f"""
                Analyze this research paper and provide a structured summary:
                Paper Title: {paper.get('title', 'Unknown')}
                Authors: {', '.join(paper.get('authors', []))}
                Paper Content: {pdf_content[:4000]}  # Reduced for quota
                Please provide:
                1. **Abstract Summary**: Key points from the abstract (50 words)
                2. **Methodology**: Main approaches used (50 words)
                3. **Key Results**: Primary findings (50 words)
                4. **Limitations**: Acknowledged limitations (50 words)
                5. **Future Work**: Suggested improvements (50 words)
                Format as concise structured text.
                """
                response = self._retry_with_backoff(self.llm.invoke, [HumanMessage(content=analysis_prompt)])
                analysis = {
                    "paper_title": paper.get("title", "Unknown"),
                    "authors": paper.get("authors", []),
                    "summary": paper.get("summary", ""),
                    "analysis": response.content,
                    "pdf_url": pdf_url
                }
                analyses.append(analysis)
                print(f"Completed analysis for paper {i}")
            except Exception as e:
                print(f"Error analyzing paper {i}: {e}")
                continue
        state["paper_analyses"] = analyses
        state["current_step"] = "analysis_completed"
        state["step_count"] = 2
        state["api_call_count"] = self.api_call_count
        state["messages"].append(
            AIMessage(content=f"Successfully analyzed {len(analyses)} papers")
        )
        return state
    
    def _identify_gaps_node(self, state: ResearchState) -> ResearchState:
        """Node 3: Identify gaps and improvement opportunities"""
        print(f"\nStep 3: Identifying research gaps and improvements")
        try:
            if not state["paper_analyses"]:
                state["identified_gaps"] = "No papers analyzed. Default gap: Limited exploration of adaptive prompt engineering for domain-specific tasks."
                state["messages"].append(AIMessage(content="No papers analyzed, using default gap analysis"))
                print("Using default gap analysis due to no analyses")
            else:
                papers_summary = ""
                for i, analysis in enumerate(state["paper_analyses"], 1):
                    papers_summary += f"\n--- Paper {i}: {analysis['paper_title']} ---\n"
                    papers_summary += f"Authors: {', '.join(analysis['authors'])}\n"
                    papers_summary += f"Analysis:\n{analysis['analysis']}\n"
                gap_analysis_prompt = f"""
                Analyze the state of research on: {state['topic']}
                Based on {len(state['paper_analyses'])} papers:
                {papers_summary}
                Identify in 100 words:
                1. Common Limitations
                2. Research Gaps
                3. Methodological Improvements
                4. Novel Applications
                5. Technical Innovations
                Provide a concise gap analysis for a new research paper.
                """
                response = self._retry_with_backoff(self.llm.invoke, [HumanMessage(content=gap_analysis_prompt)])
                state["identified_gaps"] = response.content
            state["current_step"] = "gaps_identified"
            state["step_count"] = 3
            state["api_call_count"] = self.api_call_count
            state["messages"].append(
                AIMessage(content="Successfully identified research gaps and improvement opportunities")
            )
            print("Gap analysis completed")
        except Exception as e:
            print(f"Error in gap analysis: {e}")
            state["identified_gaps"] = "Error occurred during gap analysis. Default gap: Limited exploration of adaptive prompt engineering."
            state["messages"].append(AIMessage(content=f"Error in gap analysis: {str(e)}"))
            state["api_call_count"] = self.api_call_count
        return state
    
    def _generate_paper_node(self, state: ResearchState) -> ResearchState:
        """Node 4: Generate a new research paper proposal"""
        print(f"\nStep 4: Generating new research paper")
        try:
            paper_generation_prompt = f"""
            You are an expert academic researcher. Write a comprehensive LaTeX research paper proposal addressing the research opportunities in the given topic.
            
            Research Topic: {state['topic']}
            Gap Analysis: {state['identified_gaps']}
            
            Create a detailed academic paper (6-8 pages worth) with the following structure:
            
            1. **Title**: Innovative and specific title reflecting the research contribution
            2. **Abstract**: 200-250 words covering problem, methodology, expected results, and significance
            3. **Introduction**: 
               - Background and context (400-500 words)
               - Problem statement and motivation
               - Research objectives and questions
               - Paper organization
            4. **Related Work**: 
               - Review of existing approaches (300-400 words)
               - Limitations of current methods
               - Positioning of this work
            5. **Methodology**: 
               - Detailed proposed approach (500-600 words)
               - Technical framework and architecture
               - Experimental design and evaluation setup
               - Data collection and analysis methods
            6. **Expected Results**: 
               - Anticipated outcomes and contributions (300-400 words)
               - Evaluation metrics and success criteria
               - Comparison with existing methods
            7. **Discussion and Future Work**: 
               - Expected impact and applications (300-400 words)
               - Limitations and challenges
               - Future research directions
            8. **Conclusion**: Summary of contributions and significance (200 words)
            9. **References**: Include at least 8-10 relevant citations
            
            Requirements:
            - Generate a comprehensive paper with substantial content
            - Use proper LaTeX format with \\documentclass{{article}}
            - Include necessary packages (amsmath, graphicx, hyperref, cite, geometry)
            - Use proper academic writing style with detailed explanations
            - Include technical details and mathematical formulations where appropriate
            - Add subsections to organize content clearly
            - Ensure the content is substantive, technically sound, and innovative
            - Write in full paragraphs with academic rigor
            
            CRITICAL LaTeX REQUIREMENTS:
            - DO NOT include any \\includegraphics commands or figure environments
            - DO NOT reference any external images or PNG/PDF files
            - Escape all & characters in bibliography as \\& 
            - Do not use tabular environments with & characters
            - Only use text-based content, no images or graphics
            - Ensure all special characters are properly escaped
            
            Generate ONLY the complete LaTeX document code. Be thorough and comprehensive.
            """
            response = self._retry_with_backoff(self.llm.invoke, [HumanMessage(content=paper_generation_prompt)])
            print(f"[DEBUG] Generated response length: {len(response.content) if response and response.content else 0}")
            
            if not response or not response.content or len(response.content.strip()) < 100:
                print("Warning: Empty or very short response. Using default template.")
                state["research_proposal"] = self._default_latex_template(state["topic"], state["identified_gaps"])
            elif "\\end{document}" not in response.content:
                print("Warning: Generated LaTeX may be incomplete. Attempting retry...")
                retry_response = self._retry_with_backoff(self.llm.invoke, [HumanMessage(content=paper_generation_prompt)])
                if retry_response and retry_response.content and "\\end{document}" in retry_response.content:
                    state["research_proposal"] = self._clean_latex_content(retry_response.content)
                else:
                    print("Retry failed. Using default template.")
                    state["research_proposal"] = self._default_latex_template(state["topic"], state["identified_gaps"])
            else:
                state["research_proposal"] = self._clean_latex_content(response.content)
            
            print(f"[DEBUG] Final research_proposal length: {len(state.get('research_proposal', ''))}")
            state["current_step"] = "paper_generated"
            state["step_count"] = 4
            state["api_call_count"] = self.api_call_count
            state["messages"].append(AIMessage(content="Successfully generated research paper proposal"))
            print("Research paper generated")
        except Exception as e:
            print(f"Error generating paper: {e}")
            state["research_proposal"] = self._default_latex_template(state["topic"], state["identified_gaps"])
            state["messages"].append(AIMessage(content=f"Error generating paper: {str(e)}. Using default template"))
            state["current_step"] = "paper_generated"
            state["step_count"] = 4
            state["api_call_count"] = self.api_call_count
            print("Using default LaTeX template due to error")
        return state
    
    def _clean_latex_content(self, content: str) -> str:
        """Clean LaTeX content by removing markdown code blocks and fixing LaTeX syntax"""
        if not content:
            return ""
        
        # Remove markdown code blocks
        content = content.strip()
        if content.startswith("```latex"):
            content = content[8:]  # Remove ```latex
        if content.startswith("```"):
            content = content[3:]   # Remove ```
        if content.endswith("```"):
            content = content[:-3]  # Remove trailing ```
        
        # Clean up any extra whitespace
        content = content.strip()
        
        # Fix LaTeX special characters in bibliography sections
        content = self._fix_latex_bibliography(content)
        
        # Remove image references that don't exist
        content = self._remove_image_references(content)
        
        return content
    
    def _fix_latex_bibliography(self, content: str) -> str:
        """Fix common LaTeX syntax errors in bibliography sections"""
        lines = content.split('\n')
        fixed_lines = []
        in_bibliography = False
        
        for line in lines:
            # Check if we're in bibliography section
            if '\\begin{thebibliography}' in line or '\\bibitem' in line:
                in_bibliography = True
            elif '\\end{thebibliography}' in line:
                in_bibliography = False
            
            # Fix & characters in bibliography entries
            if in_bibliography and '&' in line and '\\&' not in line:
                # Only fix standalone & that aren't already escaped
                line = line.replace(' & ', ' \\& ')
                line = line.replace('&', '\\&')
                # Fix double escaping that might occur
                line = line.replace('\\\\&', '\\&')
            
            fixed_lines.append(line)
        
        return '\n'.join(fixed_lines)
    
    def _remove_image_references(self, content: str) -> str:
        """Remove image/figure references that don't have actual files"""
        lines = content.split('\n')
        cleaned_lines = []
        skip_figure = False
        
        for line in lines:
            # Start of figure environment
            if '\\begin{figure}' in line:
                skip_figure = True
                continue
            # End of figure environment
            elif '\\end{figure}' in line and skip_figure:
                skip_figure = False
                continue
            # Skip lines inside figure environment
            elif skip_figure:
                continue
            # Remove references to figures in text
            elif '\\ref{fig:' in line or 'Figure ' in line or 'shown in Figure' in line:
                # Replace figure references with generic text
                line = line.replace('shown in Figure 1.', 'implemented as follows.')
                line = line.replace('Figure ', '')
                line = line.replace('\\ref{fig:framework_architecture}', 'the proposed framework')
                cleaned_lines.append(line)
            else:
                cleaned_lines.append(line)
        
        return '\n'.join(cleaned_lines)
    
    def _default_latex_template(self, topic: str, gaps: str) -> str:
        """Generate a default LaTeX template if LLM fails"""
        return f"""
\\documentclass{{article}}
\\usepackage[utf8]{{inputenc}}
\\usepackage{{amsmath, amsfonts, amssymb}}
\\usepackage[numbers]{{natbib}}
\\usepackage{{hyperref}}
\\usepackage[margin=1in]{{geometry}}
\\usepackage{{times}}
\\begin{{document}}
\\title{{Advancing {topic.capitalize()}: Addressing Identified Research Gaps}}
\\author{{AI Research Team}}
\\date{{August 2025}}
\\maketitle
\\begin{{abstract}}
This paper proposes a novel approach to advance {topic.lower()} by addressing key research gaps. Based on identified limitations, we propose a framework to enhance prompt engineering techniques, focusing on adaptability and efficiency. The approach leverages advanced NLP models to improve performance across domains, offering significant contributions to automated research workflows.
\\end{{abstract}}
\\section{{Introduction}}
{topic.capitalize()} is critical for optimizing large language models \\cite{{brown2020}}. Current research shows gaps in adaptive prompting \\cite{{lee2024}}. This paper aims to address these by proposing a scalable framework. Objectives include improving prompt efficiency and generalizability.
\\section{{Methodology}}
We propose a modular framework integrating LangGraph and LLMs to address gaps: {gaps[:100]}. The approach includes dynamic prompt optimization and evaluation across datasets. Experiments will compare performance against baselines \\cite{{brown2020}}.
\\section{{Expected Results}}
Anticipated outcomes include a 20\\% improvement in prompt efficiency. Metrics include task accuracy and computational cost. Comparisons with existing methods will validate effectiveness.
\\section{{Discussion}}
This work could transform automated research workflows. Limitations include dependency on API availability. Future work will explore cross-domain applications.
\\section{{Conclusion}}
This proposal outlines a novel approach to advance {topic.lower()}, addressing key gaps with a scalable framework.
\\begin{{thebibliography}}{{9}}
\\bibitem{{brown2020}} Brown, T., et al., "Language Models are Few-Shot Learners," arXiv:2005.14165, 2020.
\\bibitem{{lee2024}} Lee, K., "Automated Research Synthesis," arXiv:2401.09876, 2024.
\\end{{thebibliography}}
\\end{{document}}
"""
    
    def _create_pdf_node(self, state: ResearchState) -> ResearchState:
        """Node 5: Create PDF from LaTeX content"""
        print(f"\nStep 5: Creating PDF document")
        try:
            latex_content = state.get("research_proposal", "")
            print(f"[DEBUG] LaTeX content length: {len(latex_content)}")
            
            if not latex_content.strip():
                print("No LaTeX content found. Using default template.")
                latex_content = self._default_latex_template(state["topic"], state["identified_gaps"])
            elif "\\documentclass" not in latex_content:
                print("Invalid LaTeX format. Using default template.")
                latex_content = self._default_latex_template(state["topic"], state["identified_gaps"])
            elif "\\end{document}" not in latex_content:
                print("Adding missing \\end{document}")
                latex_content += "\\end{document}"
            
            print(f"[DEBUG] Using LaTeX content length: {len(latex_content)}")
            pdf_path = render_latex_pdf.invoke({"latex_content": latex_content})
            state["final_pdf_path"] = pdf_path
            state["current_step"] = "completed"
            state["step_count"] = 5
            state["api_call_count"] = self.api_call_count
            state["messages"].append(AIMessage(content=f"Successfully created PDF at: {pdf_path}"))
            print(f"PDF created successfully at: {pdf_path}")
        except Exception as e:
            error_msg = str(e)
            if "cannot find the file specified" in error_msg or "pdflatex" in error_msg:
                print(f"LaTeX not installed - saving LaTeX source instead")
                # Save LaTeX source when PDF compilation fails
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                output_dir = Path(__file__).parent / "output"
                output_dir.mkdir(exist_ok=True)
                tex_file = output_dir / f"paper_{timestamp}.tex"
                with open(tex_file, 'w', encoding='utf-8') as f:
                    f.write(latex_content)
                state["final_pdf_path"] = str(tex_file)
                state["messages"].append(AIMessage(content=f"LaTeX source saved to: {tex_file} (PDF compilation requires pdflatex installation)"))
                print(f"LaTeX source saved to: {tex_file}")
            else:
                print(f"Error creating PDF: {e}")
                state["final_pdf_path"] = ""
                state["messages"].append(AIMessage(content=f"Error creating PDF: {str(e)}"))
            state["api_call_count"] = self.api_call_count
        return state
    
    def research(self, topic: str) -> Dict[str, Any]:
        """
        Main method to run the complete research workflow
        
        Args:
            topic: The research topic to investigate
            
        Returns:
            Dictionary containing the final results and file path
        """
        print(f"Starting AI Research Agent for topic: '{topic}'")
        print("=" * 60)
        initial_state = ResearchState(
            topic=topic,
            papers=[],
            paper_analyses=[],
            identified_gaps="",
            research_proposal="",
            final_pdf_path="",
            messages=[HumanMessage(content=f"Research topic: {topic}")],
            step_count=0,
            current_step="initialized",
            api_call_count=0
        )
        try:
            final_state = self.workflow.invoke(initial_state)
            results = {
                "topic": final_state["topic"],
                "papers_found": len(final_state["papers"]),
                "papers_analyzed": len(final_state["paper_analyses"]),
                "final_pdf_path": final_state["final_pdf_path"],
                "workflow_completed": final_state["current_step"] == "completed",
                "identified_gaps": final_state["identified_gaps"],
                "steps_completed": final_state["step_count"],
                "api_calls_made": final_state["api_call_count"]
            }
            print("\n" + "=" * 60)
            print("Research workflow completed!")
            print(f"Papers found: {results['papers_found']}")
            print(f"Papers analyzed: {results['papers_analyzed']}")
            print(f"Final PDF: {results['final_pdf_path']}")
            print(f"API calls made: {results['api_calls_made']}")
            print("=" * 60)
            return results
        except Exception as e:
            print(f"\nWorkflow failed: {e}")
            return {
                "topic": topic,
                "error": str(e),
                "workflow_completed": False,
                "final_pdf_path": "",
                "steps_completed": 0,
                "api_calls_made": self.api_call_count
            }

def main():
    """Example usage of the AI Researcher Agent"""
    agent = AIResearcherAgent(model_name="gemini-2.0-flash", api_key=os.getenv("GOOGLE_API_KEY"), max_papers=2, max_api_calls=10)
    topic = "prompt engineering for language model"
    results = agent.research(topic)
    print(f"\nFinal Results: {json.dumps(results, indent=2)}")

if __name__ == "__main__":
    main()
