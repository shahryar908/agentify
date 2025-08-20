from groq import Groq
import json
import re
from typing import Dict, Any, Callable

class GroqToolAgent:
    def __init__(self, api_key: str):
        self.client = Groq(api_key=api_key)
        self.tools = {}
        self.history = []
        self._register_default_tools()
    
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
    
    def _register_default_tools(self):
        """Register basic math tools"""
        
        def add_numbers(a: float, b: float) -> float:
            """Add two numbers together"""
            return a + b
        
        def multiply_numbers(a: float, b: float) -> float:
            """Multiply two numbers together"""
            return a * b
        
        def divide_numbers(a: float, b: float) -> float:
            """Divide two numbers"""
            if b == 0:
                raise ValueError("Cannot divide by zero")
            return a / b
        
        def subtract_numbers(a: float, b: float) -> float:
            """Subtract second number from first"""
            return a - b
        
        def calculate_power(base: float, exponent: float) -> float:
            """Calculate base raised to the power of exponent"""
            return base ** exponent
        
        def calculate_square_root(number: float) -> float:
            """Calculate square root of a number"""
            if number < 0:
                raise ValueError("Cannot calculate square root of negative number")
            return number ** 0.5
        
        # Register all tools
        self.register_tool(
            "add_numbers",
            add_numbers,
            "Add two numbers together",
            {
                "type": "object",
                "properties": {
                    "a": {"type": "number", "description": "First number"},
                    "b": {"type": "number", "description": "Second number"}
                },
                "required": ["a", "b"]
            }
        )
        
        self.register_tool(
            "multiply_numbers", 
            multiply_numbers,
            "Multiply two numbers together",
            {
                "type": "object",
                "properties": {
                    "a": {"type": "number", "description": "First number"},
                    "b": {"type": "number", "description": "Second number"}
                },
                "required": ["a", "b"]
            }
        )
        
        self.register_tool(
            "divide_numbers",
            divide_numbers,
            "Divide first number by second number",
            {
                "type": "object", 
                "properties": {
                    "a": {"type": "number", "description": "Dividend"},
                    "b": {"type": "number", "description": "Divisor"}
                },
                "required": ["a", "b"]
            }
        )
        
        self.register_tool(
            "subtract_numbers",
            subtract_numbers,
            "Subtract second number from first",
            {
                "type": "object",
                "properties": {
                    "a": {"type": "number", "description": "Number to subtract from"},
                    "b": {"type": "number", "description": "Number to subtract"}
                },
                "required": ["a", "b"]
            }
        )
        
        self.register_tool(
            "calculate_power",
            calculate_power,
            "Calculate base raised to the power of exponent",
            {
                "type": "object",
                "properties": {
                    "base": {"type": "number", "description": "Base number"},
                    "exponent": {"type": "number", "description": "Exponent"}
                },
                "required": ["base", "exponent"]
            }
        )
        
        self.register_tool(
            "calculate_square_root",
            calculate_square_root,
            "Calculate square root of a number",
            {
                "type": "object",
                "properties": {
                    "number": {"type": "number", "description": "Number to find square root of"}
                },
                "required": ["number"]
            }
        )
    
    def list_tools(self) -> list:
        """List all available tools"""
        return list(self.tools.keys())
    
    def _extract_numbers(self, text: str) -> list:
        """Extract numbers from text"""
        numbers = re.findall(r'-?\d+\.?\d*', text)
        return [float(n) for n in numbers if n]
    
    def _should_use_tool(self, text: str) -> bool:
        """
        Decide if input might require mathematical tools.
        Instead of relying on regex to find digits, we check only for math keywords.
        This allows things like 'twenty plus one' to be passed to the LLM with tools available.
        """
        math_keywords = [
            'add', 'plus', 'sum', 'addition', '+',
            'multiply', 'times', 'product', '*', 'x',
            'divide', 'division', '/', '÷',
            'subtract', 'minus', 'difference', '-',
            'power', 'exponent', '^', '**',
            'square root', 'sqrt', 'root',
            'calculate', 'compute', 'math'
        ]

        # If any math keyword is found, we send to tool mode
        return any(keyword in text.lower() for keyword in math_keywords)
    
    def chat(self, user_input: str) -> str:
        """Main chat function"""
        print(f"\n[DEBUG] Input: '{user_input}'")
        
        # Add user message to history
        self.history.append({"role": "user", "content": user_input})
        
        # Decide whether to use tools or just LLM
        if self._should_use_tool(user_input):
            print("[DEBUG] Math detected - using tools")
            return self._handle_with_tools(user_input)
        else:
            print("[DEBUG] No math detected - using LLM only")
            return self._llm_only(user_input)
    
    def _handle_with_tools(self, user_input: str) -> str:
        """Handle requests that might need tools"""
        system_message = {
            "role": "system", 
            "content": """You are a helpful assistant with access to mathematical tools.

When users ask for calculations, always use the appropriate tool rather than doing the math yourself.

You must detect math operations whether they are:
- Written using digits (e.g., "8 + 9", "25 divided by 5")
- Written in words (e.g., "eight plus nine", "twenty-five divided by five")
- Mixed forms (e.g., "8 plus nine", "twenty minus 4")

Always convert number words into their numerical values before passing them to the tool.

Examples:
- "Add eight and nine" → tool(input="8 + 9")
- "What is twenty times four?" → tool(input="20 × 4")
- "7 plus six" → tool(input="7 + 6")

If a request involves a mathematical operation, call the right tool via tool_choice="auto".
Do not calculate in your own reasoning — always delegate to tools.

Be concise and clear in your final responses."""
        }
        
        try:
            # Create messages with system prompt
            messages = [system_message] + self.history
            
            # Call Groq with tools available
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",  # Tool-enabled model
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
    
    def _process_tool_calls(self, tool_calls) -> str:
        """Process tool calls and generate final response"""
        results = []
        
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
                    result = func(**args)
                    results.append(f"{tool_name}: {result}")
                    print(f"[SUCCESS] Tool result: {result}")
                else:
                    error_msg = f"Unknown tool: {tool_name}"
                    results.append(error_msg)
                    print(f"[ERROR] {error_msg}")
                    
            except Exception as e:
                error_msg = f"Error executing {tool_name}: {str(e)}"
                results.append(error_msg)
                print(f"❌ {error_msg}")
        
        # Add tool results to history
        tool_results = "; ".join(results)
        
        # Generate final response using LLM
        try:
            # Add tool results to conversation
            self.history.append({
                "role": "assistant", 
                "content": f"Tool results: {tool_results}"
            })
            
            # Get LLM to format the final response
            final_response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=self.history + [{
                    "role": "user", 
                    "content": "Please provide a clear, concise answer based on the tool results."
                }]
            )
            
            final_answer = final_response.choices[0].message.content
            self.history.append({"role": "assistant", "content": final_answer})
            return final_answer
            
        except Exception as e:
            # Fallback to just showing tool results
            fallback_response = f"Calculation complete: {tool_results}"
            self.history.append({"role": "assistant", "content": fallback_response})
            return fallback_response
    
    def _llm_only(self, user_input: str) -> str:
        """Handle non-mathematical requests"""
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
        """Show all available tools"""
        tool_list = []
        for name, tool in self.tools.items():
            description = tool["schema"]["function"]["description"]
            tool_list.append(f"• {name}: {description}")
        
        return "Available tools:\n" + "\n".join(tool_list)


# Example usage and demo
def demo_groq_agent():
    """Demo the Groq tool agent"""
    print("=== Groq Tool Agent Demo ===")
    print("Note: You need a valid Groq API key to run this")
    print("\nExample usage:")
    
    # Simulated examples (you'll need real API key)
    
    example_code = '''
# Initialize agent
agent = GroqToolAgent(api_key="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")

# Test both numeric and word-based math:
print("\n=== Testing Numeric Math ===")
print(agent.chat("What is 8 + 9?"))                    # Should use add_numbers tool
print(agent.chat("Multiply 6 by 7"))                   # Should use multiply_numbers tool
print(agent.chat("What's 100 divided by 4?"))          # Should use divide_numbers tool

print("\n=== Testing Word-based Math ===")
print(agent.chat("What is eight plus nine?"))          # Should use add_numbers tool  
print(agent.chat("twenty times four"))                 # Should use multiply_numbers tool
print(agent.chat("fifteen divided by three"))          # Should use divide_numbers tool

print("\n=== Testing Mixed Math ===")
print(agent.chat("8 plus nine"))                       # Should use add_numbers tool
print(agent.chat("twenty minus 4"))                    # Should use subtract_numbers tool
print(agent.chat("What is seven times 3?"))            # Should use multiply_numbers tool

print("\n=== Testing Non-Math Queries ===")
print(agent.chat("Hello, how are you?"))               # Should use LLM only
print(agent.chat("What's the weather like?"))          # Should use LLM only
print(agent.chat("Tell me a joke"))                    # Should use LLM only

# Show available tools
print(agent.show_tools())

# Clear conversation history if needed
agent.clear_history()
'''
    
    print(example_code)
    
    # Test cases that would work
    test_cases = [
        ("What is 15 + 27?", "Should use add_numbers tool"),
        ("Multiply 6 by 9", "Should use multiply_numbers tool"),
        ("Divide 100 by 4", "Should use divide_numbers tool"),
        ("What's 5 minus 3?", "Should use subtract_numbers tool"),
        ("Calculate 3 to the power of 4", "Should use calculate_power tool"),
        ("What's the square root of 16?", "Should use calculate_square_root tool"),
        ("Hello there!", "Should use LLM only - no tools"),
        ("Tell me a joke", "Should use LLM only - no tools"),
        ("What's the capital of France?", "Should use LLM only - no tools")
    ]
    
    print("\n=== Test Cases ===")
    for i, (question, expected) in enumerate(test_cases, 1):
        print(f"{i}. '{question}'")
        print(f"   Expected: {expected}")
    
    print("\n=== To use this agent ===")
    print("1. Get a Groq API key from https://console.groq.com/")
    print("2. Install groq: pip install groq")
    print("3. Replace 'your-groq-api-key' with your actual key")
    print("4. Run the code!")


# Ready-to-use example with your API key
def create_agent_example():
    """Example of how to create and use the agent"""
    return """
# How to use the GroqToolAgent:

from agents.first_agent import GroqToolAgent

# 1. Initialize with your API key
agent = GroqToolAgent(api_key="your-groq-api-key")

# 2. Use it for math
response = agent.chat("What is 42 + 28?")
print(response)  # Will use add_numbers tool

# 3. Use it for conversation  
response = agent.chat("Hi, how are you?")
print(response)  # Will use LLM only

# 4. Show all tools
print(agent.show_tools())
"""
