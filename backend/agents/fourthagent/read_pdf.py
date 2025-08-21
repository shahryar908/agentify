from langchain_core.tools import tool
import io
import PyPDF2
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

@tool
def read_pdf(url: str) -> str:
    """Read and extract text from a PDF file given its URL.

    Args:
        url: The URL of the PDF file to read

    Returns:
        The extracted text content from the PDF
    """
    try:
        print(f"[DEBUG] Starting PDF download from: {url}")
        
        # Create session with timeout and retry strategy
        session = requests.Session()
        retry_strategy = Retry(
            total=3,
            status_forcelist=[429, 500, 502, 503, 504],
            backoff_factor=1
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        session.mount("http://", adapter)
        session.mount("https://", adapter)
        
        # Download with timeout and size limit (10MB max)
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = session.get(
            url, 
            headers=headers,
            timeout=(30, 120),  # Connect timeout, read timeout
            stream=True
        )
        response.raise_for_status()
        
        # Check content length
        content_length = response.headers.get('content-length')
        if content_length and int(content_length) > 10 * 1024 * 1024:  # 10MB limit
            raise Exception(f"PDF too large: {int(content_length)/1024/1024:.1f}MB (max 10MB)")
        
        # Download content with size tracking
        content = b""
        max_size = 10 * 1024 * 1024  # 10MB
        
        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                content += chunk
                if len(content) > max_size:
                    raise Exception("PDF download exceeded 10MB limit")
        
        print(f"[DEBUG] Downloaded {len(content)/1024:.1f}KB PDF content")
        
        # Parse PDF
        pdf_file = io.BytesIO(content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        num_pages = len(pdf_reader.pages)
        
        # Limit pages to prevent excessive processing
        max_pages = 50
        if num_pages > max_pages:
            print(f"[WARNING] PDF has {num_pages} pages, limiting to first {max_pages}")
            num_pages = max_pages
        
        text = ""
        for i in range(min(num_pages, len(pdf_reader.pages))):
            page = pdf_reader.pages[i]
            print(f"Extracting text from page {i+1}/{num_pages}")
            try:
                page_text = page.extract_text()
                text += page_text + "\n"
                
                # Limit total text size to prevent memory issues
                if len(text) > 500_000:  # 500KB text limit
                    print(f"[WARNING] Text extraction stopped at 500KB limit")
                    break
                    
            except Exception as page_error:
                print(f"[WARNING] Failed to extract page {i+1}: {page_error}")
                continue

        print(f"Successfully extracted {len(text)} characters of text from PDF")
        
        if len(text.strip()) < 100:
            raise Exception("PDF appears to contain no readable text or is corrupted")
            
        return text.strip()
        
    except requests.exceptions.Timeout:
        error_msg = "PDF download timed out (network issue or large file)"
        print(f"[ERROR] {error_msg}")
        raise Exception(error_msg)
    except requests.exceptions.RequestException as e:
        error_msg = f"Network error downloading PDF: {str(e)}"
        print(f"[ERROR] {error_msg}")
        raise Exception(error_msg)
    except Exception as e:
        error_msg = f"Error reading PDF: {str(e)}"
        print(f"[ERROR] {error_msg}")
        raise Exception(error_msg)