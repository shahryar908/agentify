"""
AI Researcher Agent using LangGraph - IMPROVED VERSION

This agent orchestrates a complete research workflow with section-by-section paper generation:
1. Search arXiv for related papers
2. Read and analyze each paper
3. Identify gaps and improvements
4. Generate a new research paper (section by section to avoid token limits)
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
    4. Generate new research paper (section by section)
    """
    
    def __init__(self, model_name: str = None, api_key: str = None):
        """Initialize the AI Researcher Agent
        
        Args:
            model_name: The Gemini model to use (default: gemini-1.5-flash)
            api_key: Google API key (if None, will use environment variable)
        """
        self.llm = ChatGoogleGenerativeAI(
            model=model_name or os.getenv("MODEL_NAME", "gemini-1.5-flash"),
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
            
            print(f"✅ Found {len(papers)} papers")
            
            # Update state
            state["papers"] = papers
            state["current_step"] = "search_completed"
            state["step_count"] = 1
            state["messages"].append(
                AIMessage(content=f"Successfully found {len(papers)} research papers on {state['topic']}")
            )
            
        except Exception as e:
            print(f"❌ Error searching papers: {e}")
            state["messages"].append(
                AIMessage(content=f"Error searching papers: {str(e)}")
            )
            state["papers"] = []
            
        return state
    
    def _analyze_papers_node(self, state: ResearchState) -> ResearchState:
        """Node 2: Analyze each paper using PDF reading"""
        print(f"\n🔍 Step 2: Analyzing {len(state['papers'])} papers")
        
        analyses = []
        
        for i, paper in enumerate(state["papers"], 1):
            print(f"📄 Analyzing paper {i}/{len(state['papers'])}: {paper.get('title', 'Unknown')}")
            
            try:
                # Extract PDF content
                pdf_url = paper.get("pdf")
                if not pdf_url:
                    print(f"  ⚠️ No PDF URL for paper {i}")
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
                print(f"✅ Completed analysis for paper {i}")
                
            except Exception as e:
                print(f"❌ Error analyzing paper {i}: {e}")
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
        print(f"\n🔍 Step 3: Identifying research gaps and improvements")
        
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
            
            print("✅ Gap analysis completed")
            
        except Exception as e:
            print(f"❌ Error in gap analysis: {e}")
            state["identified_gaps"] = "Error occurred during gap analysis"
            state["messages"].append(
                AIMessage(content=f"Error in gap analysis: {str(e)}")
            )
            
        return state
    
    def _generate_paper_node(self, state: ResearchState) -> ResearchState:
        """Node 4: Generate a new research paper proposal section by section"""
        print(f"\n📝 Step 4: Generating new research paper (section by section)")
        
        try:
            paper_sections = {}
            
            # Section 1: Title and Abstract
            print("  📋 Generating title and abstract...")
            title_abstract_prompt = f"""
            You are an expert academic researcher. Based on the gap analysis below, create:
            
            Research Topic: {state['topic']}
            Gap Analysis: {state['identified_gaps'][:1000]}...
            
            Generate ONLY:
            1. An innovative research paper title that addresses the identified gaps
            2. A comprehensive abstract (150-200 words) that includes:
               - Problem statement
               - Proposed approach
               - Expected contributions
               - Significance
            
            Format as LaTeX (no \\documentclass or \\begin{{document}}):
            \\title{{Your Title Here}}
            \\author{{Research Team}}
            \\date{{\\today}}
            
            \\begin{{abstract}}
            Your abstract content here...
            \\end{{abstract}}
            """
            
            response = self.llm.invoke([HumanMessage(content=title_abstract_prompt)])
            paper_sections["title_abstract"] = response.content
            
            # Section 2: Introduction
            print("  📖 Generating introduction...")
            intro_prompt = f"""
            Based on the research topic "{state['topic']}" and gap analysis, write a comprehensive Introduction section.
            
            Gap Analysis: {state['identified_gaps'][:1500]}...
            
            The introduction should include:
            1. Problem statement and motivation
            2. Brief overview of related work
            3. Research objectives and contributions
            4. Paper organization
            
            Generate ONLY the LaTeX content for the Introduction section:
            \\section{{Introduction}}
            Your introduction content here...
            
            Keep it focused and around 500-800 words.
            """
            
            response = self.llm.invoke([HumanMessage(content=intro_prompt)])
            paper_sections["introduction"] = response.content
            
            # Section 3: Methodology
            print("  🔬 Generating methodology...")
            methodology_prompt = f"""
            Based on the research topic "{state['topic']}" and identified gaps, design a comprehensive methodology.
            
            Gap Analysis: {state['identified_gaps'][:1500]}...
            
            Create a methodology section that addresses the identified gaps with:
            1. Proposed approach overview
            2. Technical innovations and improvements
            3. Experimental design
            4. Implementation details
            5. Evaluation metrics
            
            Generate ONLY the LaTeX content for the Methodology section:
            \\section{{Methodology}}
            Your methodology content here...
            
            Include subsections as needed (\\subsection{{}}).
            """
            
            response = self.llm.invoke([HumanMessage(content=methodology_prompt)])
            paper_sections["methodology"] = response.content
            
            # Section 4: Expected Results and Discussion
            print("  📊 Generating results and discussion...")
            results_prompt = f"""
            For the research topic "{state['topic']}", write Expected Results and Discussion sections.
            
            Create realistic expected outcomes based on the proposed methodology.
            
            Generate ONLY the LaTeX content:
            \\section{{Expected Results}}
            Your expected results content here...
            
            \\section{{Discussion}}
            Your discussion content here including limitations and future work...
            
            \\section{{Conclusion}}
            Brief conclusion summarizing contributions and impact...
            """
            
            response = self.llm.invoke([HumanMessage(content=results_prompt)])
            paper_sections["results_discussion"] = response.content
            
            # Section 5: References
            print("  📚 Generating references...")
            references_prompt = f"""
            Create a references section in LaTeX format for a research paper on "{state['topic']}".
            
            Include references to:
            1. The analyzed papers from our research
            2. Standard references for this research area
            3. Key foundational works
            
            Generate ONLY:
            \\section{{References}}
            \\begin{{thebibliography}}{{99}}
            \\bibitem{{ref1}} Author, A. et al. (2024). Title of paper. Journal Name.
            \\bibitem{{ref2}} Author, B. et al. (2023). Another relevant paper. Conference Name.
            ... (add 8-12 realistic references)
            \\end{{thebibliography}}
            """
            
            response = self.llm.invoke([HumanMessage(content=references_prompt)])
            paper_sections["references"] = response.content
            
            # Combine all sections into complete LaTeX document
            print("  🔧 Assembling complete document...")
            complete_paper = f"""\\documentclass{{article}}
\\usepackage[utf8]{{inputenc}}
\\usepackage{{amsmath, amsfonts, amssymb}}
\\usepackage{{graphicx}}
\\usepackage[numbers]{{natbib}}
\\usepackage{{hyperref}}
\\usepackage[margin=1in]{{geometry}}

\\begin{{document}}

{paper_sections.get("title_abstract", "")}

\\maketitle

{paper_sections.get("introduction", "")}

{paper_sections.get("methodology", "")}

{paper_sections.get("results_discussion", "")}

{paper_sections.get("references", "")}

\\end{{document}}"""
            
            state["research_proposal"] = complete_paper
            state["current_step"] = "paper_generated"
            state["step_count"] = 4
            state["messages"].append(
                AIMessage(content="Successfully generated research paper proposal in sections")
            )
            
            print("✅ Research paper generated successfully (section-by-section approach)")
            print(f"📄 Total document length: {len(complete_paper)} characters")
            
        except Exception as e:
            print(f"❌ Error generating paper: {e}")
            state["research_proposal"] = "Error occurred during paper generation"
            state["messages"].append(
                AIMessage(content=f"Error generating paper: {str(e)}")
            )
            
        return state
    
    
    def _create_pdf_node(self, state: ResearchState) -> ResearchState:
        """Node 5: Create PDF from LaTeX content with improved validation"""
        print(f"\n📄 Step 5: Creating PDF document")
        
        try:
            print(state["research_proposal"])
            latex_content = state.get("research_proposal", "")

            if not latex_content.strip():
                raise ValueError("No LaTeX content found in state['research_proposal']")
            
            # Validate LaTeX content structure
            required_elements = ["\\documentclass", "\\begin{document}", "\\end{document}"]
            missing_elements = [elem for elem in required_elements if elem not in latex_content]
            
            if missing_elements:
                print(f"⚠️ Missing LaTeX elements: {missing_elements}")
                print("🔧 Adding missing LaTeX document structure...")
                
                # Ensure proper document structure
                if "\\documentclass" not in latex_content:
                    latex_content = f"""\\documentclass{{article}}
\\usepackage[utf8]{{inputenc}}
\\usepackage{{amsmath, amsfonts, amssymb}}
\\usepackage{{graphicx}}
\\usepackage[numbers]{{natbib}}
\\usepackage{{hyperref}}
\\usepackage[margin=1in]{{geometry}}

\\begin{{document}}

{latex_content}

\\end{{document}}"""
            
            # Additional validation - check for common LaTeX issues
            print("🔍 Validating LaTeX content...")
            
            # Count braces to check for balance
            open_braces = latex_content.count('{')
            close_braces = latex_content.count('}')
            if open_braces != close_braces:
                print(f"⚠️ Unbalanced braces: {open_braces} open, {close_braces} close")
            
            # Check for essential sections
            essential_sections = ["\\title", "\\begin{abstract}", "\\section"]
            found_sections = [sec for sec in essential_sections if sec in latex_content]
            print(f"✅ Found essential sections: {found_sections}")
            
            # Use the render_latex_pdf tool
            print("🔄 Rendering PDF...")
            pdf_path = render_latex_pdf.invoke({"latex_content": latex_content})
            
            state["final_pdf_path"] = pdf_path
            state["current_step"] = "completed"
            state["step_count"] = 5
            state["messages"].append(
                AIMessage(content=f"Successfully created PDF at: {pdf_path}")
            )
            
            print(f"✅ PDF created successfully at: {pdf_path}")
            
        except Exception as e:
            print(f"❌ Error creating PDF: {e}")
            print("📋 LaTeX content preview (first 500 chars):")
            print(latex_content[:500] + "..." if len(latex_content) > 500 else latex_content)
            
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
        print(f"🚀 Starting AI Research Agent for topic: '{topic}'")
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
            print("🎉 Research workflow completed!")
            print(f"📄 Papers found: {results['papers_found']}")
            print(f"📊 Papers analyzed: {results['papers_analyzed']}")
            print(f"📋 Final PDF: {results['final_pdf_path']}")
            print("=" * 60)
            
            return results
            
        except Exception as e:
            print(f"\n❌ Workflow failed: {e}")
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
    topic = "prompt engineering techniques for large language models"
    
    # Run the research workflow
    results = agent.research(topic)
    
    # Print results
    print(f"\n📋 Final Results: {json.dumps(results, indent=2)}")


if __name__ == "__main__":
    main()