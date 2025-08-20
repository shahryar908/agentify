from groq import Groq
import json
import re
import requests
import asyncio
import aiohttp
from typing import Dict, Any, Callable, List, Optional
from datetime import datetime
import urllib.parse
from bs4 import BeautifulSoup
import feedparser

class IntelligentToolAgent:
    """
    Advanced AI Agent with intelligent tool selection capabilities.
    
    This agent can:
    - Search the web for current information
    - Get weather updates  
    - Fetch news and RSS feeds
    - Retrieve web content
    - Make intelligent decisions about which tools to use
    """
    
    def __init__(self, api_key: str):
        self.client = Groq(api_key=api_key)
        self.tools = {}
        self.history = []
        self.tool_usage_patterns = {}
        self._register_intelligent_tools()
    
    def register_tool(self, name: str, func: Callable, description: str, params_schema: Dict, keywords: List[str] = None):
        """Register a tool with intelligent selection keywords"""
        self.tools[name] = {
            "func": func,
            "schema": {
                "type": "function", 
                "function": {
                    "name": name,
                    "description": description,
                    "parameters": params_schema
                }
            },
            "keywords": keywords or [],
            "usage_count": 0,
            "success_rate": 1.0
        }
    
    def _register_intelligent_tools(self):
        """Register all available tools with intelligent selection capabilities"""
        
        # Enhanced Web Search Tool with MCP-style search
        def search_web(query: str, max_results: int = 5) -> str:
            """Google Custom Search API implementation for reliable web search results"""
            try:
                print(f"[DEBUG] Searching web using Google Custom Search: {query}")
                
                # Google Custom Search API configuration
                api_key = "AIzaSyA7_QFSogrL7TgG9SAhMFyWU4jZOTBY56M"
                cse_id = "80c64e0d4b6ed4545"
                
                # Build the API request URL
                base_url = "https://www.googleapis.com/customsearch/v1"
                params = {
                    'key': api_key,
                    'cx': cse_id,
                    'q': query,
                    'num': min(max_results, 10),  # Google API allows max 10 results per request
                    'safe': 'active',  # Safe search enabled
                    'fields': 'items(title,link,snippet,displayLink)'
                }
                
                # Make the API request
                response = requests.get(base_url, params=params, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Check if we have search results
                    if 'items' in data and data['items']:
                        results = []
                        
                        for i, item in enumerate(data['items'][:max_results], 1):
                            title = item.get('title', 'No title')
                            link = item.get('link', 'No link')
                            snippet = item.get('snippet', 'No description available')
                            display_link = item.get('displayLink', 'No domain')
                            
                            # Format each result
                            result_text = f"**Result {i}: {title}**\n"
                            result_text += f"Source: {display_link}\n"
                            result_text += f"Description: {snippet}\n"
                            result_text += f"URL: {link}\n"
                            
                            results.append(result_text)
                        
                        print(f"[SUCCESS] Google Search returned {len(results)} results")
                        return "\n".join(results)
                    
                    else:
                        print(f"[DEBUG] No search results found for query: {query}")
                        return f"No search results found for '{query}'. This might be a very specific or recent topic. Try using different keywords or rephrasing your query."
                
                elif response.status_code == 403:
                    print(f"[ERROR] Google API quota exceeded or access denied")
                    return "Google Search API quota exceeded or access denied. Please try again later or contact administrator."
                
                elif response.status_code == 400:
                    print(f"[ERROR] Bad request to Google API: {response.text}")
                    return f"Invalid search query. Please rephrase your search terms and try again."
                
                else:
                    print(f"[ERROR] Google API error {response.status_code}: {response.text}")
                    return f"Search service temporarily unavailable (Error {response.status_code}). Please try again later."
                    
            except requests.exceptions.Timeout:
                print(f"[ERROR] Google Search API timeout")
                return "Search request timed out. Please try again with a shorter query."
                
            except requests.exceptions.RequestException as e:
                print(f"[ERROR] Network error during Google Search: {e}")
                return "Network error occurred during search. Please check your internet connection and try again."
                
            except Exception as e:
                print(f"[ERROR] Unexpected error in Google Search: {e}")
                return f"An unexpected error occurred during search. Please try again later."
        
        # Weather Tool with validation
        def validate_location(location: str) -> str:
            """Validate and clean location input"""
            if not location or not isinstance(location, str):
                return None
            
            # Clean the location string
            location = location.strip()
            
            # Remove invalid characters
            import re
            location = re.sub(r'[^a-zA-Z\s,.-]', '', location)
            
            # Check minimum length
            if len(location) < 2:
                return None
            
            # Check if it's just numbers or common invalid strings
            if location.isdigit() or location.lower() in ['n/a', 'na', 'none', 'null', 'undefined']:
                return None
            
            return location

        def get_weather(location: str) -> str:
            """Get current weather information for a location using free Open-Meteo API"""
            try:
                # Validate location input
                validated_location = validate_location(location)
                if not validated_location:
                    return f"Invalid location '{location}'. Please provide a valid city or location name."
                
                print(f"[DEBUG] Getting weather for: {validated_location}")
                
                # First, get coordinates using OpenStreetMap Nominatim (free)
                geocode_url = f"https://nominatim.openstreetmap.org/search?format=json&q={urllib.parse.quote(validated_location)}"
                headers = {'User-Agent': 'AI-Agent/1.0'}
                
                geo_response = requests.get(geocode_url, headers=headers, timeout=10)
                geo_data = geo_response.json()
                
                if not geo_data:
                    return f"Location '{location}' not found. Please try a more specific location."
                
                lat = float(geo_data[0]['lat'])
                lon = float(geo_data[0]['lon'])
                display_name = geo_data[0]['display_name']
                
                # Get weather from Open-Meteo (free, no API key required)
                weather_url = f"https://api.open-meteo.com/v1/forecast"
                params = {
                    'latitude': lat,
                    'longitude': lon,
                    'current_weather': 'true',
                    'hourly': 'temperature_2m,relative_humidity_2m,wind_speed_10m',
                    'timezone': 'auto',
                    'forecast_days': 1
                }
                
                weather_response = requests.get(weather_url, params=params, timeout=10)
                weather_data = weather_response.json()
                
                current = weather_data['current_weather']
                
                # Weather code interpretation
                weather_codes = {
                    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
                    45: "Fog", 48: "Depositing rime fog", 51: "Light drizzle", 53: "Moderate drizzle",
                    55: "Dense drizzle", 56: "Light freezing drizzle", 57: "Dense freezing drizzle",
                    61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain", 66: "Light freezing rain",
                    67: "Heavy freezing rain", 71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow",
                    77: "Snow grains", 80: "Slight rain showers", 81: "Moderate rain showers",
                    82: "Violent rain showers", 85: "Slight snow showers", 86: "Heavy snow showers",
                    95: "Thunderstorm", 96: "Thunderstorm with slight hail", 99: "Thunderstorm with heavy hail"
                }
                
                condition = weather_codes.get(current['weathercode'], f"Weather code {current['weathercode']}")
                
                result = f"""Weather for {display_name}:
Temperature: {current['temperature']}C
Condition: {condition}
Wind Speed: {current['windspeed']} km/h
Wind Direction: {current['winddirection']} degrees
Time: {current['time']}"""
                
                # Sanitize unicode characters for Windows console
                result = result.encode('ascii', 'ignore').decode('ascii')
                return result
                
            except Exception as e:
                print(f"[ERROR] Weather lookup failed: {e}")
                return f"Weather information temporarily unavailable for '{location}'. Error: {str(e)}"
        
        # News/RSS Tool
        def get_latest_news(topic: str = "general", max_items: int = 5) -> str:
            """Get latest news from RSS feeds"""
            try:
                print(f"[DEBUG] Getting news for topic: {topic}")
                
                # Free RSS feeds that don't require API keys
                news_feeds = {
                    "general": "http://feeds.bbci.co.uk/news/rss.xml",
                    "technology": "https://feeds.feedburner.com/oreilly/radar/atom",
                    "science": "https://www.sciencedaily.com/rss/all.xml",
                    "world": "http://feeds.bbci.co.uk/news/world/rss.xml",
                    "business": "http://feeds.bbci.co.uk/news/business/rss.xml"
                }
                
                feed_url = news_feeds.get(topic.lower(), news_feeds["general"])
                
                # Parse RSS feed
                feed = feedparser.parse(feed_url)
                
                if not feed.entries:
                    return f"No news found for topic '{topic}'. Please try: general, technology, science, world, business"
                
                news_items = []
                for entry in feed.entries[:max_items]:
                    published = getattr(entry, 'published', 'Unknown time')
                    title = entry.title
                    summary = getattr(entry, 'summary', 'No summary available')
                    
                    # Clean HTML from summary
                    if summary:
                        soup = BeautifulSoup(summary, 'html.parser')
                        summary = soup.get_text().strip()[:200] + "..." if len(soup.get_text()) > 200 else soup.get_text().strip()
                    
                    news_items.append(f"[NEWS] {title}\nPublished: {published}\nSummary: {summary}\n")
                
                return f"Latest {topic} news:\n\n" + "\n".join(news_items)
                
            except Exception as e:
                print(f"[ERROR] News fetch failed: {e}")
                return f"News service temporarily unavailable. Error: {str(e)}"
        
        # Web Content Fetcher
        def fetch_web_content(url: str) -> str:
            """Fetch and parse content from a web page"""
            try:
                print(f"[DEBUG] Fetching content from: {url}")
                
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
                
                response = requests.get(url, headers=headers, timeout=15)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Remove script and style elements
                for script in soup(["script", "style"]):
                    script.decompose()
                
                # Get text content
                text = soup.get_text()
                
                # Clean up whitespace
                lines = (line.strip() for line in text.splitlines())
                chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
                text = ' '.join(chunk for chunk in chunks if chunk)
                
                # Limit content length
                if len(text) > 3000:
                    text = text[:3000] + "... [Content truncated]"
                
                return f"Content from {url}:\n\n{text}"
                
            except Exception as e:
                print(f"[ERROR] Content fetch failed: {e}")
                return f"Could not fetch content from {url}. Error: {str(e)}"
        
        # Current Time/Date Tool  
        def get_current_datetime() -> str:
            """Get current date and time"""
            now = datetime.now()
            return f"Current date and time: {now.strftime('%Y-%m-%d %H:%M:%S %Z')}"
        
        # Register all tools with keywords for intelligent selection
        self.register_tool(
            "search_web",
            search_web,
            "Search the web for current information, recent events, or topics not in my training data",
            {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search query"},
                    "max_results": {"type": "integer", "description": "Maximum number of results (default 5)"}
                },
                "required": ["query"]
            },
            keywords=["search", "find", "look up", "google", "internet", "web", "current", "recent", "latest", "news", "what is", "who is", "where is", "when did", "how to", "price", "cost", "today", "current price"]
        )
        
        self.register_tool(
            "get_weather",
            get_weather,
            "Get current weather information for any location worldwide",
            {
                "type": "object",
                "properties": {
                    "location": {"type": "string", "description": "City, country, or location name"}
                },
                "required": ["location"]
            },
            keywords=["weather", "temperature", "climate", "rain", "snow", "sunny", "cloudy", "forecast", "conditions"]
        )
        
        self.register_tool(
            "get_latest_news",
            get_latest_news,
            "Get latest news headlines from various topics",
            {
                "type": "object",
                "properties": {
                    "topic": {"type": "string", "description": "News topic: general, technology, science, world, business"},
                    "max_items": {"type": "integer", "description": "Maximum number of news items (default 5)"}
                },
                "required": []
            },
            keywords=["news", "headlines", "breaking", "latest", "current events", "happening", "today", "recent"]
        )
        
        self.register_tool(
            "fetch_web_content",
            fetch_web_content,
            "Fetch and read content from a specific web page or URL",
            {
                "type": "object",
                "properties": {
                    "url": {"type": "string", "description": "URL of the web page to fetch"}
                },
                "required": ["url"]
            },
            keywords=["fetch", "read", "get content", "webpage", "url", "link", "article", "page"]
        )
        
        self.register_tool(
            "get_current_datetime",
            get_current_datetime,
            "Get the current date and time",
            {
                "type": "object",
                "properties": {},
                "required": []
            },
            keywords=["time", "date", "now", "current", "today", "when", "what time"]
        )
    
    def _analyze_intent(self, user_input: str) -> List[str]:
        """Analyze user input to determine which tools might be needed"""
        user_input_lower = user_input.lower()
        potential_tools = []
        
        # Score each tool based on keyword matches and context
        for tool_name, tool_data in self.tools.items():
            score = 0
            
            # Check for direct keyword matches
            for keyword in tool_data["keywords"]:
                if keyword in user_input_lower:
                    score += 2
            
            # Check for contextual indicators
            if tool_name == "search_web":
                # Web search indicators
                if any(phrase in user_input_lower for phrase in [
                    "what is", "who is", "where is", "when did", "how to", 
                    "tell me about", "information about", "recent", "latest",
                    "current", "update", "happening", "price", "cost", "rate"
                ]):
                    score += 1
                
                # Price/cost specific indicators
                if any(word in user_input_lower for word in [
                    "price", "cost", "rate", "petrol", "gas", "fuel", "today", "current"
                ]):
                    score += 3
                
                # Check if asking about something that might be recent
                current_year = datetime.now().year
                if str(current_year) in user_input or str(current_year-1) in user_input:
                    score += 2
            
            elif tool_name == "get_weather":
                if any(word in user_input_lower for word in [
                    "weather", "temperature", "rain", "snow", "sunny", "cold", "hot", "climate"
                ]):
                    score += 3
            
            elif tool_name == "get_latest_news":
                if any(word in user_input_lower for word in [
                    "news", "headlines", "breaking", "happening", "events", "today"
                ]):
                    score += 3
            
            elif tool_name == "get_current_datetime":
                if any(phrase in user_input_lower for phrase in [
                    "what time", "current time", "what date", "today", "now"
                ]):
                    score += 3
            
            # Add tool to potential list if score is high enough
            if score >= 1:
                potential_tools.append((tool_name, score))
        
        # Sort by score and return tool names
        potential_tools.sort(key=lambda x: x[1], reverse=True)
        return [tool[0] for tool in potential_tools[:3]]  # Return top 3 tools
    
    def _should_use_tools(self, user_input: str) -> bool:
        """Determine if the input requires external tools"""
        user_input_lower = user_input.lower()
        
        # First check for conversational/personal queries that should NOT use tools
        conversational_patterns = [
            "how are you", "how do you feel", "tell me a joke", "hello", "hi", "good morning",
            "good evening", "goodbye", "bye", "thank you", "thanks", "please", "sorry",
            "what are your hobbies", "do you like", "can you help me", "who are you",
            "what can you do", "how can you help", "nice to meet you", "how's your day"
        ]
        
        # If it's a conversational query, don't use tools
        if any(pattern in user_input_lower for pattern in conversational_patterns):
            return False
        
        # Information request indicators that DO need tools
        tool_indicators = [
            # Factual information requests
            "what is the", "who is the", "where is the", "when did", "how to",
            "tell me about the", "information about", "facts about",
            
            # Current/recent information (but not conversational)
            "latest news", "recent developments", "current price", "today's weather", "weather today",
            "what happened today", "recent updates", "breaking news",
            
            # Price/cost queries
            "price of", "cost of", "how much does", "rate of", "petrol price", "gas price",
            
            # Weather queries - comprehensive patterns
            "weather in", "weather of", "weather at", "weather for", "weather today",
            "temperature in", "temperature of", "climate in", "forecast for",
            "current weather", "today weather", "tomorrow weather",
            
            # Time-sensitive factual queries
            str(datetime.now().year) + " developments", "this year's updates",
            "recently discovered", "just announced"
        ]
        
        # Check if it matches tool indicators
        if any(indicator in user_input_lower for indicator in tool_indicators):
            return True
            
        # Additional context-based checks
        # If asking about specific topics that typically need current info
        topic_keywords = ["ai developments", "technology updates", "stock market", "cryptocurrency", 
                         "political news", "scientific discoveries", "medical breakthroughs"]
        
        if any(keyword in user_input_lower for keyword in topic_keywords):
            return True
            
        # If contains "latest", "recent", "current" with substantive topics
        if any(word in user_input_lower for word in ["latest", "recent", "current"]):
            # But exclude personal/conversational contexts
            if not any(personal in user_input_lower for personal in ["you", "feeling", "doing", "day"]):
                return True
        
        # Weather-specific detection (single words with location context)
        if any(word in user_input_lower for word in ["weather", "temperature", "climate", "forecast"]):
            # Check if there's a location mentioned (city names or location indicators)
            location_indicators = ["in", "at", "for", "of", "today", "tomorrow", "now"]
            if any(loc in user_input_lower for loc in location_indicators):
                return True
        
        return False
    
    def list_tools(self) -> list:
        """List all available tools"""
        return list(self.tools.keys())
    
    def chat(self, user_input: str) -> str:
        """Main chat function with intelligent tool selection"""
        print(f"\n[DEBUG] Input: '{user_input}'")
        
        # Add user message to history
        self.history.append({"role": "user", "content": user_input})
        
        # Analyze if tools are needed
        if self._should_use_tools(user_input):
            print("[DEBUG] Tools might be needed - analyzing intent")
            potential_tools = self._analyze_intent(user_input)
            print(f"[DEBUG] Potential tools identified: {potential_tools}")
            return self._handle_with_tools(user_input, potential_tools)
        else:
            print("[DEBUG] No tools needed - using LLM only")
            return self._llm_only(user_input)
    
    def _handle_with_tools(self, user_input: str, suggested_tools: List[str]) -> str:
        """Handle requests that might need tools with intelligent selection"""
        
        # Enhanced direct tool execution for specific query types
        user_lower = user_input.lower()
        
        # Weather queries - CHECK FIRST (highest priority for specific tools)
        if any(word in user_lower for word in ["weather", "temperature", "climate", "forecast", "humidity", "wind"]) or \
           any(phrase in user_lower for phrase in ["weather in", "temperature in", "climate in", "weather today", "weather tomorrow"]):
            print("[DEBUG] Weather query detected - forcing weather tool")
            return self._execute_weather_query(user_input)
        
        # Price and cost queries
        elif any(word in user_lower for word in ["price", "cost", "rate", "petrol", "gas", "fuel"]):
            print("[DEBUG] Price/cost query detected - forcing enhanced search")
            return self._execute_enhanced_search(user_input, "price")
        
        # Time/DateTime queries
        elif any(phrase in user_lower for phrase in ["what time is it", "current time", "what date", "today's date"]) or \
             any(word in user_lower for word in ["time", "date", "datetime", "timestamp"]) and not any(word in user_lower for word in ["weather", "news"]):
            print("[DEBUG] DateTime query detected - forcing datetime tool")
            return self._execute_datetime_query(user_input)
        
        # Current events and news queries (but exclude weather)
        elif any(word in user_lower for word in ["latest", "recent", "happening", "news", "breaking"]) and not any(word in user_lower for word in ["weather", "temperature", "climate"]) or \
             (any(word in user_lower for word in ["today", "current"]) and not any(word in user_lower for word in ["weather", "temperature", "climate", "time", "date"])):
            print("[DEBUG] Current events query detected - forcing enhanced search")
            return self._execute_enhanced_search(user_input, "news")
        
        # Information lookup queries
        elif any(phrase in user_lower for phrase in ["what is", "who is", "where is", "tell me about"]):
            print("[DEBUG] Information query detected - forcing enhanced search")
            return self._execute_enhanced_search(user_input, "information")
        
        system_message = {
            "role": "system", 
            "content": f"""You are an intelligent AI assistant with access to real-time tools. You MUST use tools when the user asks for current information.

Available tools: {', '.join(self.list_tools())}

Based on the user's request, you should intelligently decide which tools to use:

1. **Web Search (search_web)**: REQUIRED for current events, prices, recent information, facts not in your training data, "what is X", "who is Y", etc.
2. **Weather (get_weather)**: REQUIRED for weather-related queries about any location
3. **News (get_latest_news)**: REQUIRED for current news, headlines, recent events
4. **Web Content (fetch_web_content)**: Use when user provides a specific URL to read
5. **Date/Time (get_current_datetime)**: Use when user asks about current time or date

The user is asking: {user_input}

Suggested tools for this query: {suggested_tools}

CRITICAL RULES:
- ALWAYS use search_web for prices, costs, current events, recent information
- If user asks about prices (petrol, gas, etc.), MUST use search_web
- If user asks about current events, MUST use search_web or get_latest_news
- If asking about weather, MUST use get_weather
- Use specific, relevant search terms
- NEVER answer without using tools for current information
- Provide comprehensive responses based on tool results

You MUST call the appropriate tools. Do not provide answers without using tools when current information is requested."""
        }
        
        try:
            # Create messages with system prompt
            messages = [system_message] + self.history
            
            # Call Groq with tools available
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages,
                tools=[tool["schema"] for tool in self.tools.values()],
                tool_choice="auto"
            )
            
            message = response.choices[0].message
            
            # Check if tools were called
            if hasattr(message, "tool_calls") and message.tool_calls:
                print("[DEBUG] Tools were called by LLM")
                return self._process_tool_calls(message.tool_calls)
            else:
                # No tools used, return LLM response
                assistant_reply = message.content
                self.history.append({"role": "assistant", "content": assistant_reply})
                print("[DEBUG] LLM responded without tools")
                return assistant_reply
                
        except Exception as e:
            error_msg = f"Error with tools: {str(e)}"
            print(f"[ERROR] {error_msg}")
            # Fallback to LLM only
            return self._llm_only(user_input)
    
    def _execute_enhanced_search(self, user_input: str, query_type: str) -> str:
        """Execute enhanced search with intelligent LLM processing"""
        try:
            # Execute search tool
            search_tool = self.tools["search_web"]["func"]
            search_results = search_tool(user_input)
            
            # Create context-aware prompt based on query type
            if query_type == "price":
                context_prompt = f"""You are a helpful assistant analyzing search results for a price inquiry. 

User Query: "{user_input}"

Search Results:
{search_results}

Instructions:
- Extract specific price information if available
- Look for currency amounts, rates, or costs
- If multiple sources show different prices, mention the range
- Include the source/timeframe if mentioned
- If no specific price is found, mention what related information is available
- Be precise about what the price refers to (per liter, per gallon, etc.)
- Include any context about recent changes or trends if mentioned"""

            elif query_type == "news":
                context_prompt = f"""You are a helpful assistant analyzing search results for a current events inquiry.

User Query: "{user_input}"

Search Results:
{search_results}

Instructions:
- Summarize the most recent and relevant information
- Include dates/timeframes when available
- Mention multiple sources if they provide different perspectives
- Focus on factual information from the search results
- If results are about different topics, organize them clearly"""

            elif query_type == "information":
                context_prompt = f"""You are a helpful assistant analyzing search results for an information inquiry.

User Query: "{user_input}"

Search Results:
{search_results}

Instructions:
- Provide a comprehensive answer based on the search results
- Include key facts and details found in the results
- Organize information logically
- Cite different sources when they provide complementary information
- Be accurate and don't add information not in the search results"""

            else:
                context_prompt = f"""Based on the following search results, provide a helpful answer to the user's query.

User Query: "{user_input}"

Search Results:
{search_results}

Please provide a comprehensive, accurate response based on the information found."""

            # Generate response using LLM
            final_response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=self.history + [{"role": "user", "content": context_prompt}]
            )
            
            final_answer = final_response.choices[0].message.content
            self.history.append({"role": "assistant", "content": final_answer})
            self.tools["search_web"]["usage_count"] += 1
            
            print(f"[SUCCESS] Enhanced search completed for {query_type} query")
            return final_answer
            
        except Exception as e:
            print(f"[ERROR] Enhanced search failed: {e}")
            return f"I apologize, but I encountered an error while searching for information about '{user_input}'. Please try rephrasing your query."

    def _extract_location_from_query(self, query: str) -> str:
        """Enhanced location extraction from user query"""
        import re
        
        # Common location patterns
        location_patterns = [
            r'\bin\s+([A-Za-z\s]+?)(?:\s+today|\s+now|\?|$)',  # "in Paris", "in New York today"
            r'\bat\s+([A-Za-z\s]+?)(?:\s+today|\s+now|\?|$)',  # "at Tokyo"
            r'\bfor\s+([A-Za-z\s]+?)(?:\s+today|\s+now|\?|$)', # "for London"
            r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:weather|temperature|forecast)', # "Paris weather"
            r'(?:weather|temperature|forecast)\s+(?:in|at|for)\s+([A-Za-z\s]+?)(?:\s+today|\s+now|\?|$)',
            r"what'?s\s+the\s+weather\s+(?:like\s+)?(?:in|at|for)\s+([A-Za-z\s]+?)(?:\s+today|\s+now|\?|$)",
        ]
        
        # Try each pattern
        for pattern in location_patterns:
            match = re.search(pattern, query, re.IGNORECASE)
            if match:
                location = match.group(1).strip()
                # Clean up common words
                location = re.sub(r'\b(today|now|weather|temperature|forecast|like)\b', '', location, flags=re.IGNORECASE).strip()
                if location and len(location) > 1:
                    return location
        
        # Look for common city names if no pattern matches
        known_cities = [
            'karachi', 'lahore', 'islamabad', 'rawalpindi', 'faisalabad',
            'paris', 'london', 'tokyo', 'sydney', 'dubai', 'mumbai', 'delhi', 
            'bangkok', 'singapore', 'berlin', 'madrid', 'rome', 'amsterdam', 
            'moscow', 'beijing', 'seoul', 'cairo', 'istanbul', 'new york', 
            'los angeles', 'chicago', 'houston', 'toronto', 'vancouver'
        ]
        
        query_lower = query.lower()
        for city in known_cities:
            if city in query_lower:
                # Handle multi-word cities
                if ' ' in city:
                    return city.title()
                else:
                    return city.title()
        
        return None

    def _execute_weather_query(self, user_input: str) -> str:
        """Execute weather query with enhanced location extraction"""
        try:
            # Try to extract location from the query
            weather_tool = self.tools["get_weather"]["func"]
            
            # Enhanced location extraction
            location = self._extract_location_from_query(user_input)
            
            # If no location specified, ask for it
            if not location:
                return "Please specify a location for the weather query (e.g., 'weather in Tokyo' or 'temperature in New York')."
            
            print(f"[DEBUG] Extracted location from '{user_input}': {location}")
            weather_result = weather_tool(location)
            
            # Generate contextual response
            context_prompt = f"""The user asked: "{user_input}"

Weather Information:
{weather_result}

Please provide a natural, conversational response about the weather based on this information."""

            final_response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile", 
                messages=self.history + [{"role": "user", "content": context_prompt}]
            )
            
            final_answer = final_response.choices[0].message.content
            self.history.append({"role": "assistant", "content": final_answer})
            self.tools["get_weather"]["usage_count"] += 1
            
            return final_answer
            
        except Exception as e:
            print(f"[ERROR] Weather query failed: {e}")
            return f"I apologize, but I encountered an error while getting weather information. Please try again with a specific location."
    
    def _execute_datetime_query(self, user_input: str) -> str:
        """Execute datetime query using the datetime tool"""
        try:
            datetime_tool = self.tools["get_current_datetime"]["func"]
            datetime_result = datetime_tool()
            
            # Generate contextual response
            context_prompt = f"""The user asked: "{user_input}"

Current Date and Time:
{datetime_result}

Please provide a natural, conversational response about the current date/time based on this information."""

            final_response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile", 
                messages=self.history + [{"role": "user", "content": context_prompt}]
            )
            
            final_answer = final_response.choices[0].message.content
            self.history.append({"role": "assistant", "content": final_answer})
            self.tools["get_current_datetime"]["usage_count"] += 1
            
            return final_answer
            
        except Exception as e:
            print(f"[ERROR] DateTime query failed: {e}")
            return f"I apologize, but I encountered an error while getting the current date/time. Please try again."

    def _process_tool_calls(self, tool_calls) -> str:
        """Process tool calls and generate final response"""
        results = []
        tools_used = []
        
        for tool_call in tool_calls:
            tool_name = tool_call.function.name
            
            try:
                # Parse arguments
                raw_args = tool_call.function.arguments
                if isinstance(raw_args, str):
                    args = json.loads(raw_args)
                else:
                    args = raw_args
                
                print(f"[DEBUG] Executing {tool_name} with args: {args}")
                
                # Execute the tool
                if tool_name in self.tools:
                    func = self.tools[tool_name]["func"]
                    # Handle tools that don't take arguments
                    if args is None:
                        args = {}
                    result = func(**args)
                    results.append(f"{tool_name}: {result}")
                    tools_used.append(tool_name)
                    
                    # Update tool usage statistics
                    self.tools[tool_name]["usage_count"] += 1
                    print(f"[SUCCESS] Tool {tool_name} executed successfully")
                else:
                    error_msg = f"Unknown tool: {tool_name}"
                    results.append(error_msg)
                    print(f"[ERROR] {error_msg}")
                    
            except Exception as e:
                error_msg = f"Error executing {tool_name}: {str(e)}"
                results.append(error_msg)
                print(f"[ERROR] {error_msg}")
        
        # Generate final response using LLM with tool results
        tool_results = "\n\n".join(results)
        
        try:
            # Create a comprehensive prompt for the final response
            final_prompt = {
                "role": "user",
                "content": f"""Based on the following tool results, please provide a comprehensive, natural response to the user's original question.

Tool Results:
{tool_results}

Instructions:
- Synthesize the information into a coherent, helpful response
- Present the information in a natural, conversational way
- If multiple tools were used, integrate all relevant information
- Include specific details from the tool results
- Be accurate and don't add information not provided by the tools
- If any tool failed, mention limitations appropriately

Tools used: {', '.join(tools_used)}"""
            }
            
            # Get LLM to format the final response
            final_response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=self.history + [final_prompt]
            )
            
            final_answer = final_response.choices[0].message.content
            self.history.append({"role": "assistant", "content": final_answer})
            return final_answer
            
        except Exception as e:
            # Fallback to just showing tool results
            fallback_response = f"Here's what I found:\n\n{tool_results}"
            self.history.append({"role": "assistant", "content": fallback_response})
            return fallback_response
    
    def _llm_only(self, user_input: str) -> str:
        """Handle non-tool requests"""
        try:
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=self.history
            )
            
            assistant_reply = response.choices[0].message.content
            self.history.append({"role": "assistant", "content": assistant_reply})
            return assistant_reply
            
        except Exception as e:
            error_msg = f"Error: {str(e)}"
            self.history.append({"role": "assistant", "content": error_msg})
            return error_msg
    
    def clear_history(self):
        """Clear conversation history"""
        self.history = []
        print("[INFO] Conversation history cleared")
    
    def show_tools(self) -> str:
        """Show all available tools with usage statistics"""
        tool_list = []
        for name, tool in self.tools.items():
            description = tool["schema"]["function"]["description"]
            usage_count = tool["usage_count"]
            keywords = ", ".join(tool["keywords"][:5])  # Show first 5 keywords
            
            tool_list.append(f"• {name}: {description}")
            tool_list.append(f"  Keywords: {keywords}")
            tool_list.append(f"  Used: {usage_count} times")
            tool_list.append("")
        
        return "Available tools:\n" + "\n".join(tool_list)
    
    def get_tool_usage_stats(self) -> Dict[str, Any]:
        """Get statistics about tool usage"""
        stats = {}
        for name, tool in self.tools.items():
            stats[name] = {
                "usage_count": tool["usage_count"],
                "success_rate": tool["success_rate"],
                "keywords": tool["keywords"]
            }
        return stats


# Example usage and demo functions
def demo_intelligent_agent():
    """Demo the intelligent tool agent"""
    print("=== Intelligent Tool Agent Demo ===")
    print("This agent can intelligently select and use tools based on your queries.")
    print("\nExample capabilities:")
    print("- Web search for current information")
    print("- Weather updates for any location")
    print("- Latest news and headlines")
    print("- Web content fetching")
    print("- Current date and time")
    
    test_queries = [
        "What's the weather like in Tokyo?",
        "What are the latest technology news?", 
        "What is artificial intelligence?",
        "Search for recent developments in AI",
        "What time is it now?",
        "Tell me about the current situation in Ukraine",
        "What's the temperature in New York?",
        "Get me the latest science news"
    ]
    
    print("\n=== Test Queries ===")
    for i, query in enumerate(test_queries, 1):
        print(f"{i}. '{query}'")
    
    print("\nTo use this agent:")
    print("1. Get a Groq API key from https://console.groq.com/")
    print("2. Install required packages: pip install groq requests beautifulsoup4 feedparser")
    print("3. Initialize the agent with your API key")
    print("4. Start chatting!")


if __name__ == "__main__":
    demo_intelligent_agent()