#!/usr/bin/env python3
"""
Test script for the AI Researcher Agent

This script tests the complete workflow with a sample research topic.
Make sure you have all dependencies installed and API keys configured.
"""

import os
import sys
import importlib.util
from pathlib import Path

# Add the current directory to Python path for imports
current_dir = Path(__file__).parent.absolute()
sys.path.append(str(current_dir))

spec = importlib.util.spec_from_file_location("ai_researcher", "ai-researcher.py")
ai_researcher = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ai_researcher)
AIResearcherAgent = ai_researcher.AIResearcherAgent


def test_individual_tools():
    """Test each tool individually before running the full workflow"""
    print("🧪 Testing individual tools...")
    
    try:
        # Test 1: ArXiv Search
        print("\n1️⃣ Testing ArXiv search...")
        import importlib.util
        spec = importlib.util.spec_from_file_location("arxiv_tool", "arxiv-tool.py")
        arxiv_tool = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(arxiv_tool)
        arxiv_search = arxiv_tool.arxiv_search
        result = arxiv_search.invoke({"topic": "machine learning"})
        print(f"✅ ArXiv search returned {len(result.get('entries', []))} papers")
        
        # Test 2: PDF Reading (use first paper if available)
        if result.get('entries') and len(result['entries']) > 0:
            print("\n2️⃣ Testing PDF reading...")
            first_paper = result['entries'][0]
            pdf_url = first_paper.get('pdf')
            
            if pdf_url:
                from read_pdf import read_pdf
                pdf_content = read_pdf.invoke({"url": pdf_url})
                print(f"✅ PDF reading extracted {len(pdf_content)} characters")
            else:
                print("⚠️  No PDF URL available for testing")
        
        # Test 3: LaTeX PDF Generation
        print("\n3️⃣ Testing LaTeX PDF generation...")
        spec = importlib.util.spec_from_file_location("write_pdf", "write-pdf.py")
        write_pdf = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(write_pdf)
        render_latex_pdf = write_pdf.render_latex_pdf
        
        sample_latex = r"""
\documentclass{article}
\usepackage[utf8]{inputenc}
\title{Test Document}
\author{AI Researcher Agent}
\date{\today}

\begin{document}
\maketitle

\section{Introduction}
This is a test document to verify that the LaTeX PDF generation works correctly.

\section{Conclusion}
If you can see this PDF, the tool is working properly.

\end{document}
"""
        
        pdf_path = render_latex_pdf.invoke({"latex_content": sample_latex})
        print(f"✅ PDF generated at: {pdf_path}")
        
        print("\n🎉 All individual tools are working!")
        return True
        
    except Exception as e:
        print(f"❌ Tool testing failed: {e}")
        return False


def test_full_workflow():
    """Test the complete AI Researcher workflow"""
    print("\n🚀 Testing full AI Researcher workflow...")
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Check for Google API key
    if not os.getenv("GOOGLE_API_KEY"):
        print("⚠️  Warning: GOOGLE_API_KEY not set. The workflow may fail at LLM steps.")
        print("   Make sure the .env file exists with your API key")
        
        # Ask user if they want to continue
        response = input("Continue anyway? (y/n): ").lower()
        if response != 'y':
            return False
    
    try:
        # Initialize the agent
        agent = AIResearcherAgent()
        
        # Test with a simple topic
        test_topic = "neural networks"
        print(f"📝 Testing with topic: '{test_topic}'")
        
        # Run the workflow
        results = agent.research(test_topic)
        
        # Validate results
        print("\n📊 Results Summary:")
        print(f"  - Topic: {results.get('topic')}")
        print(f"  - Papers found: {results.get('papers_found', 0)}")
        print(f"  - Papers analyzed: {results.get('papers_analyzed', 0)}")
        print(f"  - Steps completed: {results.get('steps_completed', 0)}")
        print(f"  - Workflow completed: {results.get('workflow_completed', False)}")
        print(f"  - Final PDF: {results.get('final_pdf_path', 'None')}")
        
        if results.get('workflow_completed') and results.get('final_pdf_path'):
            print("\n✅ Full workflow test PASSED!")
            return True
        else:
            print("\n Full workflow test FAILED!")
            if results.get('error'):
                print(f"Error: {results['error']}")
            return False
            
    except Exception as e:
        print(f" Workflow test failed with exception: {e}")
        return False


def main():
    """Run all tests"""
    print(" AI Researcher Agent - Test Suite")
    print("=" * 50)
    
    # Check dependencies
    print("\n Checking dependencies...")
    required_packages = [
        'langgraph', 'langchain_core', 'langchain_google_genai', 
        'PyPDF2', 'requests', 'xml', 'dotenv'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            if package == 'xml':
                import xml.etree.ElementTree
            elif package == 'dotenv':
                import dotenv
            else:
                __import__(package)
            print(f"   {package}")
        except ImportError:
            print(f"   {package} - MISSING")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n Missing packages: {', '.join(missing_packages)}")
        print("Install them with: pip install " + " ".join(missing_packages))
        return False
    
    print("\n All dependencies available!")
    
    # Test individual tools
    tools_ok = test_individual_tools()
    if not tools_ok:
        print("\n Individual tools test failed. Fix tools before testing workflow.")
        return False
    
    # Test full workflow
    workflow_ok = test_full_workflow()
    
    if workflow_ok:
        print("\n All tests PASSED! The AI Researcher Agent is ready to use.")
    else:
        print("\n Some tests FAILED. Check the errors above.")
    
    return workflow_ok


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)