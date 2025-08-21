from langchain_core.tools import tool
from datetime import datetime
from pathlib import Path
import subprocess
import shutil
import tempfile
import os

@tool
def render_latex_pdf(latex_content: str) -> str:
    """Render a LaTeX document to PDF using Tectonic.

    Args:
        latex_content: The LaTeX document content as a string

    Returns:
        Path to the generated PDF document
    """
    try:
        # Create timestamp for unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Create output directory if it doesn't exist
        output_dir = Path(__file__).parent / "output"
        output_dir.mkdir(exist_ok=True)
        
        # Create LaTeX file
        tex_file = output_dir / f"paper_{timestamp}.tex"
        pdf_file = output_dir / f"paper_{timestamp}.pdf"
        
        # Write LaTeX content to file
        with open(tex_file, 'w', encoding='utf-8') as f:
            f.write(latex_content)
        
        # Try Tectonic first (modern LaTeX engine)
        if shutil.which("tectonic"):
            print("Using Tectonic for PDF generation...")
            cmd = ['tectonic', str(tex_file)]
            result = subprocess.run(cmd, capture_output=True, text=True, cwd=str(output_dir))
            
            # Check if PDF was generated successfully (ignore warnings)
            if pdf_file.exists():
                final_pdf = pdf_file.resolve()
                print(f"Successfully generated PDF with Tectonic at {final_pdf}")
                return str(final_pdf)
            else:
                print(f"Tectonic failed: {result.stderr}")
                print(f"Tectonic stdout: {result.stdout}")
        
        # Fallback to pdflatex
        if shutil.which("pdflatex"):
            print("Falling back to pdflatex...")
            cmd = ['pdflatex', '-output-directory', str(output_dir), str(tex_file)]
            result = subprocess.run(cmd, capture_output=True, text=True, cwd=str(output_dir))
            
            if result.returncode == 0 and pdf_file.exists():
                final_pdf = pdf_file.resolve()
                print(f"Successfully generated PDF with pdflatex at {final_pdf}")
                return str(final_pdf)
            else:
                print(f"pdflatex failed: {result.stderr}")
        
        # If both fail, save LaTeX source as fallback
        print("No LaTeX engine available - saving LaTeX source instead")
        print(f"LaTeX source saved to: {tex_file}")
        print("To generate PDF, install Tectonic: https://tectonic-typesetting.github.io/")
        return str(tex_file)
        
    except Exception as e:
        print(f"Error rendering LaTeX: {str(e)}")
        # Save LaTeX source as fallback
        print(f"LaTeX source saved to: {tex_file} (PDF compilation failed)")
        return str(tex_file)

# Test function - only runs when script is executed directly
if __name__ == "__main__":
    test_latex = r"""
\documentclass{article}
\usepackage[utf8]{inputenc}
\title{Test Document}
\author{AI Research Agent}
\date{\today}

\begin{document}
\maketitle

\section{Introduction}
This is a test document to verify LaTeX compilation with the new Tectonic-based renderer.

\section{Features}
\begin{itemize}
\item Tectonic LaTeX engine support
\item Fallback to pdflatex
\item Graceful error handling
\item Automatic LaTeX source preservation
\end{itemize}

\section{Conclusion}
The LaTeX to PDF conversion system is working correctly.

\end{document}
"""
    try:
        print("Testing LaTeX to PDF conversion...")
        pdf_path = render_latex_pdf.invoke({"latex_content": test_latex})
        print(f"Test successful! Output at: {pdf_path}")
        
        # Check if it's a PDF or LaTeX file
        if pdf_path.endswith('.pdf'):
            print("[SUCCESS] PDF generation successful!")
        else:
            print("[WARNING] LaTeX source saved (install Tectonic for PDF generation)")
            
    except Exception as e:
        print(f"[ERROR] Test failed: {e}")