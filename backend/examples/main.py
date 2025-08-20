# How to use the GroqToolAgent:

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from agents.first_agent import GroqToolAgent,demo_groq_agent

api_key="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";
# 1. Initialize with your API key
agent = GroqToolAgent(api_key=api_key)

# 2. Use it for math
response = agent.chat("What is 42 + 28?")
print(response)  # Will use add_numbers tool

# 3. Use it for conversation  
response = agent.chat("Hi, how are you?")
print(response)  # Will use LLM only

# 4. Add custom tools
def calculate_area(length, width):
    return length * width

agent.register_tool(
    "calculate_area",
    calculate_area, 
    "Calculate area of rectangle",
    {
        "type": "object",
        "properties": {
            "length": {"type": "number", "description": "Length"},
            "width": {"type": "number", "description": "Width"}
        },
        "required": ["length", "width"]
    }
)

# 5. Show all tools
print(agent.show_tools())



if __name__ == "__main__":
    demo_groq_agent()