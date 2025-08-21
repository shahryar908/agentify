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
from typing import TypedDict, List, Dict, Any
from pathlib import Path
from xml.dom.minidom import Document
from dotenv import load_dotenv

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

# Load spec from file location
spec = importlib.util.spec_from_file_location("arxiv_tool", tool_path)
arxiv_tool = importlib.util.module_from_spec(spec)

# Execute module (this actually loads the file into Python memory)
spec.loader.exec_module(arxiv_tool)

# Now you can use functions/classes from arxiv_tool
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
    
    def __init__(self, model_name: str = None, api_key: str = None):
        """Initialize the AI Researcher Agent
        
        Args:
            model_name: The Gemini model to use (default: gemini-1.5-flash)
            api_key: Google API key (if None, will use environment variable)
        """
        self.llm = ChatGoogleGenerativeAI(
            model=model_name or os.getenv("MODEL_NAME", "gemini-2.5-pro"),
            google_api_key=api_key or os.getenv("GOOGLE_API_KEY"),
            temperature=float(os.getenv("TEMPERATURE", "0.1"))
        )
        
        # Create the workflow graph
        self.workflow = self._create_workflow()
        
    def _create_workflow(self) -> StateGraph:
        """Create the LangGraph workflow"""
        
        # Define the graph
        workflow = StateGraph(ResearchState)
        
        # Add nodes
        workflow.add_node("search_papers", self._search_papers_node)
        workflow.add_node("analyze_papers", self._analyze_papers_node)
        workflow.add_node("identify_gaps", self._identify_gaps_node)
        workflow.add_node("generate_paper", self._generate_paper_node)
        workflow.add_node("create_pdf", self._create_pdf_node)
        
        # Define the flow
        workflow.set_entry_point("search_papers")
        workflow.add_edge("search_papers", "analyze_papers")
        workflow.add_edge("analyze_papers", "identify_gaps")
        workflow.add_edge("identify_gaps", "generate_paper")
        workflow.add_edge("generate_paper", "create_pdf")
        workflow.add_edge("create_pdf", END)
        
        return workflow.compile()
    
    def _search_papers_node(self, state: ResearchState) -> ResearchState:
        """Node 1: Search for research papers using arXiv"""
        print(f"\n[DEBUG] Step 1: Searching for papers on '{state['topic']}'")
        
        try:
            # Use the arxiv_search tool
            result = arxiv_search.invoke({"topic": state["topic"]})
            papers = result.get("entries", [])
            
            print(f" Found {len(papers)} papers")
            
            # Update state
            state["papers"] = papers
            state["current_step"] = "search_completed"
            state["step_count"] = 1
            state["messages"].append(
                AIMessage(content=f"Successfully found {len(papers)} research papers on {state['topic']}")
            )
            
        except Exception as e:
            print(f"L Error searching papers: {e}")
            state["messages"].append(
                AIMessage(content=f"Error searching papers: {str(e)}")
            )
            state["papers"] = []
            
        return state
    
    def _analyze_papers_node(self, state: ResearchState) -> ResearchState:
        """Node 2: Analyze each paper using PDF reading"""
        print(f"\n= Step 2: Analyzing {len(state['papers'])} papers")
        
        analyses = []
        
        for i, paper in enumerate(state["papers"], 1):
            print(f"= Analyzing paper {i}/{len(state['papers'])}: {paper.get('title', 'Unknown')}")
            
            try:
                # Extract PDF content
                pdf_url = paper.get("pdf")
                if not pdf_url:
                    print(f"  No PDF URL for paper {i}")
                    continue
                    
                pdf_content = read_pdf.invoke({"url": pdf_url})
                
                # Use LLM to analyze the paper
                analysis_prompt = f"""
                Analyze this research paper and provide a structured summary:
                
                Paper Title: {paper.get('title', 'Unknown')}
                Authors: {', '.join(paper.get('authors', []))}
                
                Paper Content:
                {pdf_content[:8000]}  # Truncate for token limits
                
                Please provide:
                1. **Abstract Summary**: Key points from the abstract
                2. **Methodology**: Main approaches and techniques used
                3. **Key Results**: Primary findings and contributions
                4. **Limitations**: What the authors acknowledge as limitations
                5. **Future Work**: Areas the authors suggest for improvement
                
                Format your response as structured text with clear sections.
                """
                
                response = self.llm.invoke([HumanMessage(content=analysis_prompt)])
                
                analysis = {
                    "paper_title": paper.get("title", "Unknown"),
                    "authors": paper.get("authors", []),
                    "summary": paper.get("summary", ""),
                    "analysis": response.content,
                    "pdf_url": pdf_url
                }
                
                analyses.append(analysis)
                print(f" Completed analysis for paper {i}")
                
            except Exception as e:
                print(f"L Error analyzing paper {i}: {e}")
                continue
        
        state["paper_analyses"] = analyses
        state["current_step"] = "analysis_completed"
        state["step_count"] = 2
        state["messages"].append(
            AIMessage(content=f"Successfully analyzed {len(analyses)} papers")
        )
        
        return state
    
    def _identify_gaps_node(self, state: ResearchState) -> ResearchState:
        """Node 3: Identify gaps and improvement opportunities"""
        print(f"\n[SEARCH] Step 3: Identifying research gaps and improvements")
        
        try:
            # Prepare comprehensive analysis for LLM
            papers_summary = ""
            for i, analysis in enumerate(state["paper_analyses"], 1):
                papers_summary += f"\n--- Paper {i}: {analysis['paper_title']} ---\n"
                papers_summary += f"Authors: {', '.join(analysis['authors'])}\n"
                papers_summary += f"Analysis:\n{analysis['analysis']}\n"
            
            gap_analysis_prompt = f"""
            You are an expert AI researcher analyzing the current state of research on: {state['topic']}
            
            Based on the analysis of {len(state['paper_analyses'])} recent research papers, identify:
            
            1. **Common Limitations**: What limitations appear across multiple papers?
            2. **Research Gaps**: What important aspects are not adequately addressed?
            3. **Methodological Improvements**: How could the approaches be enhanced?
            4. **Novel Applications**: What new applications or use cases are unexplored?
            5. **Technical Innovations**: What technical improvements could advance the field?
            
            Here are the paper analyses:
            {papers_summary}
            
            Please provide a comprehensive gap analysis that will inform the development of a new research paper.
            Focus on actionable improvements that could realistically be implemented.
            """
            
            response = self.llm.invoke([HumanMessage(content=gap_analysis_prompt)])
            
            state["identified_gaps"] = response.content
            state["current_step"] = "gaps_identified"
            state["step_count"] = 3
            state["messages"].append(
                AIMessage(content="Successfully identified research gaps and improvement opportunities")
            )
            
            print(" Gap analysis completed")
            
        except Exception as e:
            print(f"L Error in gap analysis: {e}")
            state["identified_gaps"] = "Error occurred during gap analysis"
            state["messages"].append(
                AIMessage(content=f"Error in gap analysis: {str(e)}")
            )
            
        return state
    
    def _generate_paper_node(self, state: ResearchState) -> ResearchState:
        """Node 4: Generate a new research paper proposal"""
        print(f"\n= Step 4: Generating new research paper")
        
        try:
            # Create comprehensive prompt for paper generation
            paper_generation_prompt = f"""
            You are an expert academic researcher. Based on the gap analysis below, write a comprehensive research paper proposal that addresses the identified opportunities.
            
            Research Topic: {state['topic']}
            
            Gap Analysis:
            {state['identified_gaps']}
            
            Generate a complete LaTeX document for a research paper with the following structure:
            
            1. **Title**: Create an innovative title that clearly indicates the improvement/contribution
            2. **Abstract**: 150-200 words summarizing the problem, approach, and expected contributions
            3. **Introduction**: 
               - Problem statement
               - Related work (reference the analyzed papers appropriately)
               - Research objectives and contributions
            4. **Methodology**: 
               - Proposed approach to address the identified gaps
               - Technical details and innovations
               - Experimental design
            5. **Expected Results**: 
               - Anticipated outcomes
               - Evaluation metrics
               - Comparison with existing approaches
            6. **Discussion**: 
               - Implications of the proposed work
               - Limitations and future work
            7. **Conclusion**: Summary of contributions and impact
            8. **References**: Include the analyzed papers as references
            
            IMPORTANT: 
            - Generate complete LaTeX code that can be compiled directly
            - Use proper academic formatting with \\documentclass{{article}}
            - Include proper citations in LaTeX format
            - Ensure the content is original and builds upon the gap analysis
            - Make it a realistic, implementable research proposal
            
            Generate ONLY the LaTeX code, no additional explanations.
            """
            
            response = self.llm.invoke([HumanMessage(content=paper_generation_prompt)])
            
            state["research_proposal"] = response.content
            state["current_step"] = "paper_generated"
            state["step_count"] = 4
            state["messages"].append(
                AIMessage(content="Successfully generated research paper proposal")
            )
            
            print(" Research paper generated")
            
        except Exception as e:
            print(f"L Error generating paper: {e}")
            state["research_proposal"] = "Error occurred during paper generation"
            state["messages"].append(
                AIMessage(content=f"Error generating paper: {str(e)}")
            )
            
        return state
    
    
    def _create_pdf_node(self, state: ResearchState) -> ResearchState:
        """Node 5: Create PDF from LaTeX content"""
        print(f"\n= Step 5: Creating PDF document")
        
        print(state["research_proposal"])
        
        try:
            latex_content = state.get("research_proposal", "")

            if not latex_content.strip():
              raise ValueError("No LaTeX content found in state['research_proposal']")
            # Use the render_latex_pdf tool
            if "\\documentclass" not in latex_content:
              latex_content = f"""
            \\documentclass{{article}}
            \\usepackage[utf8]{{inputenc}}
            \\usepackage{{amsmath, amsfonts, amssymb}}
            \\usepackage{{graphicx}}
            \\usepackage[numbers]{{natbib}}
            \\usepackage{{hyperref}}
            \\usepackage[margin=1in]{{geometry}}
            \\begin{{document}}
            {latex_content}
            \\end{{document}}
            """
            pdf_path = render_latex_pdf.invoke({"latex_content": state["research_proposal"]})
            
            state["final_pdf_path"] = pdf_path
            state["current_step"] = "completed"
            state["step_count"] = 5
            state["messages"].append(
                AIMessage(content=f"Successfully created PDF at: {pdf_path}")
            )
            
            print(f"PDF created successfully at: {pdf_path}")
            
        except Exception as e:
            print(f"L Error creating PDF: {e}")
            state["final_pdf_path"] = ""
            state["messages"].append(
                AIMessage(content=f"Error creating PDF: {str(e)}")
            )
            
        return state
    
    def research(self, topic: str) -> Dict[str, Any]:
        """
        Main method to run the complete research workflow
        
        Args:
            topic: The research topic to investigate
            
        Returns:
            Dictionary containing the final results and file path
        """
        print(f"= Starting AI Research Agent for topic: '{topic}'")
        print("=" * 60)
        
        # Initialize state
        initial_state = ResearchState(
            topic=topic,
            papers=[],
            paper_analyses=[],
            identified_gaps="",
            research_proposal="",
            final_pdf_path="",
            messages=[HumanMessage(content=f"Research topic: {topic}")],
            step_count=0,
            current_step="initialized"
        )
        
        try:
            # Run the workflow
            final_state = self.workflow.invoke(initial_state)
            
            # Prepare results
            results = {
                "topic": final_state["topic"],
                "papers_found": len(final_state["papers"]),
                "papers_analyzed": len(final_state["paper_analyses"]),
                "final_pdf_path": final_state["final_pdf_path"],
                "workflow_completed": final_state["current_step"] == "completed",
                "identified_gaps": final_state["identified_gaps"],
                "steps_completed": final_state["step_count"]
            }
            
            print("\n" + "=" * 60)
            print("< Research workflow completed!")
            print(f"= Papers found: {results['papers_found']}")
            print(f"= Papers analyzed: {results['papers_analyzed']}")
            print(f"= Final PDF: {results['final_pdf_path']}")
            print("=" * 60)
            
            return results
            
        except Exception as e:
            print(f"\nL Workflow failed: {e}")
            return {
                "topic": topic,
                "error": str(e),
                "workflow_completed": False,
                "final_pdf_path": "",
                "steps_completed": 0
            }


def main():
    """Example usage of the AI Researcher Agent"""
    
    # Initialize the agent
    # Note: Make sure to set your GOOGLE_API_KEY environment variable
    agent = AIResearcherAgent()
    
    # Example research topic
    topic = "prompt engineering "
    
    # Run the research workflow
    results = agent.research(topic)
    
    # Print results
    print(f"\nFinal Results: {json.dumps(results, indent=2)}")


if __name__ == "__main__":
    main()