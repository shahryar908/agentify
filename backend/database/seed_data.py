"""
Database seeding script for blog content
This script populates the database with sample blog posts about AI agent development
"""

from datetime import datetime, timedelta
from typing import List, Dict, Any
import json

# Sample blog posts data
SAMPLE_BLOGS = [
    {
        "title": "Building Your First Math Agent: A Complete Tutorial",
        "slug": "building-first-math-agent-tutorial",
        "excerpt": "Learn how to create a powerful math-solving AI agent from scratch using Groq API and custom tool integration. This step-by-step guide covers everything from basic setup to advanced mathematical operations.",
        "content": """# Building Your First Math Agent: A Complete Tutorial

## Introduction

Creating an AI agent that can perform mathematical operations is an excellent starting point for understanding how AI agents work. In this comprehensive tutorial, I'll walk you through building a math agent that can handle various mathematical calculations.

## What You'll Learn

- Setting up the Groq API for your agent
- Creating mathematical tools and functions
- Implementing tool registration and execution
- Handling different types of mathematical operations
- Error handling and validation

## Prerequisites

Before we start, make sure you have:
- Python 3.8 or higher installed
- A Groq API key
- Basic understanding of Python programming

## Step 1: Setting Up the Environment

First, let's create our project structure:

```bash
mkdir math_agent
cd math_agent
pip install groq fastapi uvicorn
```

## Step 2: Creating the Base Agent Class

```python
import groq
from typing import Dict, Any, Callable

class MathAgent:
    def __init__(self, api_key: str):
        self.client = groq.Groq(api_key=api_key)
        self.tools = {}
        self.register_default_tools()
    
    def register_tool(self, name: str, func: Callable, description: str, params_schema: Dict):
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
```

## Step 3: Implementing Mathematical Tools

Now let's add some mathematical operations:

```python
def add_numbers(self, a: float, b: float) -> float:
    \"\"\"Add two numbers together\"\"\"
    return a + b

def multiply_numbers(self, a: float, b: float) -> float:
    \"\"\"Multiply two numbers\"\"\"
    return a * b

def calculate_percentage(self, value: float, percentage: float) -> float:
    \"\"\"Calculate percentage of a value\"\"\"
    return (percentage / 100) * value
```

## Step 4: Tool Registration

```python
def register_default_tools(self):
    self.register_tool(
        "add_numbers",
        self.add_numbers,
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
    # Register other tools...
```

## Step 5: Chat Implementation

```python
def chat(self, user_input: str) -> str:
    try:
        if self._should_use_tool(user_input):
            return self._handle_with_tools(user_input)
        else:
            return self._llm_only(user_input)
    except Exception as e:
        return f"I encountered an error: {str(e)}"
```

## Testing Your Agent

Once you've implemented the agent, test it with various mathematical queries:

```python
agent = MathAgent("your-api-key-here")
print(agent.chat("What is 25 + 17?"))
print(agent.chat("Calculate 15% of 200"))
print(agent.chat("What is 8 multiplied by 7?"))
```

## Next Steps

In the next tutorial, we'll explore how to add more advanced mathematical operations and integrate with external mathematical libraries.

## Conclusion

You've now built a functional math agent! This agent can handle basic mathematical operations and can be extended with more complex calculations as needed.

The complete source code for this tutorial is available on my GitHub repository.
""",
        "published": True,
        "featured": True,
        "tags": "AI,Math Agent,Tutorial,Groq,Python,Getting Started",
        "category": "Tutorial",
        "readTime": 12,
        "metaTitle": "Building Your First Math Agent - AI Tutorial",
        "metaDescription": "Complete step-by-step tutorial on building a math-solving AI agent using Groq API. Learn tool registration, mathematical operations, and agent architecture.",
        "metaKeywords": "AI agent, math agent, Groq API, Python tutorial, artificial intelligence",
        "agentId": 1,
        "publishedAt": datetime.utcnow() - timedelta(days=7),
        "views": 156,
        "likes": 23,
        "author": "Developer",
        "authorEmail": "developer@example.com",
        "createdAt": datetime.utcnow() - timedelta(days=7),
        "updatedAt": datetime.utcnow() - timedelta(days=7)
    },
    {
        "title": "Advanced Web Research Agent: Integrating Multiple APIs",
        "slug": "advanced-web-research-agent-apis",
        "excerpt": "Take your AI agents to the next level by integrating web search, weather data, and news APIs. Learn how to build an intelligent research agent that can gather real-time information from multiple sources.",
        "content": """# Advanced Web Research Agent: Integrating Multiple APIs

## Introduction

Building on our basic agent foundation, let's create a sophisticated web research agent that can interact with multiple APIs to gather real-time information. This agent will demonstrate advanced capabilities like web searching, weather data retrieval, and news gathering.

## Architecture Overview

Our web research agent will integrate:
- Web search capabilities
- Weather API integration  
- News API access
- Information synthesis and presentation

## Setting Up API Keys

You'll need API keys for:
- Groq (for the LLM)
- Weather service (OpenWeatherMap)
- News service (NewsAPI)
- Search service (SerpAPI or similar)

## Core Agent Implementation

```python
import requests
import json
from datetime import datetime
from typing import Dict, Any, List

class WebResearchAgent:
    def __init__(self, api_key: str, weather_key: str, news_key: str):
        self.groq_client = groq.Groq(api_key=api_key)
        self.weather_key = weather_key
        self.news_key = news_key
        self.tools = {}
        self.register_research_tools()
```

## Web Search Implementation

```python
def search_web(self, query: str, num_results: int = 5) -> str:
    \"\"\"Search the web for information\"\"\"
    try:
        # Implement your preferred search API
        headers = {"User-Agent": "Research Agent 1.0"}
        search_url = f"https://api.search.com/search?q={query}&num={num_results}"
        
        response = requests.get(search_url, headers=headers, timeout=10)
        results = response.json()
        
        formatted_results = []
        for result in results.get('results', [])[:num_results]:
            formatted_results.append(f"- {result['title']}: {result['snippet']}")
        
        return "\\n".join(formatted_results)
    except Exception as e:
        return f"Search error: {str(e)}"
```

## Weather Integration

```python
def get_weather(self, location: str) -> str:
    \"\"\"Get current weather for a location\"\"\"
    try:
        url = f"https://api.openweathermap.org/data/2.5/weather"
        params = {
            "q": location,
            "appid": self.weather_key,
            "units": "metric"
        }
        
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        
        if response.status_code == 200:
            weather = data['weather'][0]
            temp = data['main']['temp']
            feels_like = data['main']['feels_like']
            humidity = data['main']['humidity']
            
            return f"Weather in {location}: {weather['description']}, {temp}°C (feels like {feels_like}°C), humidity {humidity}%"
        else:
            return f"Weather data not found for {location}"
    except Exception as e:
        return f"Weather error: {str(e)}"
```

## News Gathering

```python
def get_latest_news(self, topic: str = "technology", num_articles: int = 5) -> str:
    \"\"\"Get latest news on a topic\"\"\"
    try:
        url = "https://newsapi.org/v2/everything"
        params = {
            "q": topic,
            "sortBy": "publishedAt",
            "pageSize": num_articles,
            "apiKey": self.news_key
        }
        
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        
        if data['status'] == 'ok':
            articles = []
            for article in data['articles'][:num_articles]:
                articles.append(f"- {article['title']} ({article['source']['name']})")
            
            return "\\n".join(articles)
        else:
            return f"News error: {data.get('message', 'Unknown error')}"
    except Exception as e:
        return f"News error: {str(e)}"
```

## Intelligent Tool Selection

```python
def _should_use_tools(self, user_input: str) -> bool:
    \"\"\"Determine if tools are needed for the query\"\"\"
    user_lower = user_input.lower()
    
    # Define keyword patterns for different tools
    search_keywords = ["search", "find", "look up", "research", "what is", "tell me about"]
    weather_keywords = ["weather", "temperature", "forecast", "climate", "rain", "sunny"]
    news_keywords = ["news", "latest", "recent", "current events", "headlines"]
    
    return any(keyword in user_lower for keyword in search_keywords + weather_keywords + news_keywords)
```

## Advanced Query Processing

```python
def _analyze_query_intent(self, user_input: str) -> Dict[str, Any]:
    \"\"\"Analyze user query to determine appropriate tools\"\"\"
    user_lower = user_input.lower()
    
    intent = {
        "tools_needed": [],
        "primary_intent": "general",
        "entities": []
    }
    
    if any(word in user_lower for word in ["weather", "temperature", "forecast"]):
        intent["tools_needed"].append("get_weather")
        intent["primary_intent"] = "weather"
    
    if any(word in user_lower for word in ["news", "latest", "headlines"]):
        intent["tools_needed"].append("get_latest_news")
        intent["primary_intent"] = "news"
    
    if any(word in user_lower for word in ["search", "find", "research"]):
        intent["tools_needed"].append("search_web")
        intent["primary_intent"] = "search"
    
    return intent
```

## Error Handling and Resilience

```python
def _execute_tools_with_fallback(self, tools_needed: List[str], user_input: str) -> str:
    \"\"\"Execute tools with proper error handling\"\"\"
    results = []
    
    for tool_name in tools_needed:
        try:
            tool_func = self.tools[tool_name]["func"]
            result = tool_func(user_input)
            results.append(f"{tool_name}: {result}")
        except Exception as e:
            results.append(f"{tool_name}: Error - {str(e)}")
            # Continue with other tools instead of failing completely
    
    return "\\n\\n".join(results)
```

## Testing the Research Agent

```python
# Example usage
agent = WebResearchAgent(groq_key, weather_key, news_key)

# Test different query types
print(agent.chat("What's the weather in Tokyo?"))
print(agent.chat("Find latest news about artificial intelligence"))
print(agent.chat("Search for information about quantum computing"))
```

## Performance Optimization

- Implement caching for repeated queries
- Use async requests for concurrent API calls
- Add request timeouts and retry logic
- Monitor API rate limits

## Next Steps

In future tutorials, we'll explore:
- Adding more specialized research tools
- Implementing result ranking and relevance scoring
- Building a knowledge graph from gathered information
- Creating automated research workflows

## Conclusion

You now have a powerful web research agent that can gather information from multiple sources. This agent demonstrates advanced AI capabilities and can be further extended with additional APIs and data sources.

The complete implementation is available in my GitHub repository with detailed setup instructions.
""",
        "published": True,
        "featured": False,
        "tags": "AI,Web Agent,APIs,Research,Tutorial,Advanced",
        "category": "Tutorial",
        "readTime": 15,
        "metaTitle": "Advanced Web Research Agent with Multiple APIs",
        "metaDescription": "Build a sophisticated AI agent that integrates web search, weather, and news APIs for comprehensive research capabilities.",
        "metaKeywords": "web research agent, API integration, AI agent, web search, weather API, news API",
        "agentId": 2,
        "publishedAt": datetime.utcnow() - timedelta(days=3),
        "views": 89,
        "likes": 12,
        "author": "Developer",
        "authorEmail": "developer@example.com",
        "createdAt": datetime.utcnow() - timedelta(days=3),
        "updatedAt": datetime.utcnow() - timedelta(days=3)
    },
    {
        "title": "Autonomous Agent Architecture: Planning and Decision Making",
        "slug": "autonomous-agent-architecture-planning",
        "excerpt": "Dive deep into autonomous agent design patterns. Learn how to build agents that can break down complex goals, create execution plans, and make intelligent decisions without constant human guidance.",
        "content": """# Autonomous Agent Architecture: Planning and Decision Making

## Introduction

Autonomous agents represent the cutting edge of AI development. Unlike simple tool-using agents, autonomous agents can break down complex goals into manageable steps, adapt their plans based on results, and make intelligent decisions with minimal human intervention.

## Core Concepts

### What Makes an Agent Autonomous?

1. **Goal Decomposition**: Breaking complex objectives into smaller, manageable tasks
2. **Dynamic Planning**: Creating and adjusting execution plans based on current state
3. **Self-Monitoring**: Evaluating progress and adapting strategies
4. **Decision Making**: Choosing optimal actions from multiple possibilities

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Goal Input    │───▶│  Goal Analyzer   │───▶│ Task Decomposer │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                        │
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Action Executor │◀───│  Plan Optimizer  │◀───│  Plan Generator │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                       ▲
        ▼                       │
┌─────────────────┐    ┌──────────────────┐
│ Result Monitor  │───▶│ Feedback Loop    │
└─────────────────┘    └──────────────────┘
```

## Implementation: Core Agent Class

```python
from typing import List, Dict, Any, Optional
from enum import Enum
import json
from datetime import datetime

class TaskStatus(Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    BLOCKED = "blocked"

class Task:
    def __init__(self, id: str, description: str, dependencies: List[str] = None):
        self.id = id
        self.description = description
        self.dependencies = dependencies or []
        self.status = TaskStatus.PENDING
        self.result = None
        self.error = None
        self.created_at = datetime.utcnow()
        self.completed_at = None

class AutonomousAgent:
    def __init__(self, api_key: str):
        self.groq_client = groq.Groq(api_key=api_key)
        self.task_queue = []
        self.completed_tasks = []
        self.knowledge_base = {}
        self.execution_context = {}
```

## Goal Analysis and Decomposition

```python
def analyze_goal(self, goal: str) -> Dict[str, Any]:
    \"\"\"Analyze a high-level goal and determine complexity\"\"\"
    analysis_prompt = f\"\"\"
    Analyze this goal and determine:
    1. Complexity level (simple/moderate/complex)
    2. Required capabilities
    3. Potential sub-goals
    4. Success criteria
    
    Goal: {goal}
    
    Respond in JSON format.
    \"\"\"
    
    try:
        response = self.groq_client.chat.completions.create(
            model="mixtral-8x7b-32768",
            messages=[{"role": "user", "content": analysis_prompt}],
            temperature=0.3
        )
        
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        return {"error": f"Goal analysis failed: {str(e)}"}

def decompose_goal(self, goal: str, analysis: Dict[str, Any]) -> List[Task]:
    \"\"\"Break down a complex goal into executable tasks\"\"\"
    decomposition_prompt = f\"\"\"
    Break down this goal into specific, executable tasks:
    
    Goal: {goal}
    Analysis: {json.dumps(analysis, indent=2)}
    
    Create a list of tasks with:
    - Unique ID
    - Clear description
    - Dependencies (if any)
    - Success criteria
    
    Respond in JSON format with a 'tasks' array.
    \"\"\"
    
    try:
        response = self.groq_client.chat.completions.create(
            model="mixtral-8x7b-32768",
            messages=[{"role": "user", "content": decomposition_prompt}],
            temperature=0.3
        )
        
        task_data = json.loads(response.choices[0].message.content)
        tasks = []
        
        for task_info in task_data.get('tasks', []):
            task = Task(
                id=task_info['id'],
                description=task_info['description'],
                dependencies=task_info.get('dependencies', [])
            )
            tasks.append(task)
        
        return tasks
    except Exception as e:
        print(f"Goal decomposition failed: {str(e)}")
        return []
```

## Dynamic Planning System

```python
def create_execution_plan(self, tasks: List[Task]) -> List[List[Task]]:
    \"\"\"Create an optimized execution plan considering dependencies\"\"\"
    # Topological sort to handle dependencies
    plan_phases = []
    remaining_tasks = tasks.copy()
    
    while remaining_tasks:
        # Find tasks with no unmet dependencies
        ready_tasks = []
        for task in remaining_tasks:
            dependencies_met = all(
                dep in [t.id for t in self.completed_tasks]
                for dep in task.dependencies
            )
            if dependencies_met:
                ready_tasks.append(task)
        
        if not ready_tasks:
            # Circular dependency or missing prerequisite
            print("Warning: Circular dependency detected or missing prerequisite")
            break
        
        plan_phases.append(ready_tasks)
        for task in ready_tasks:
            remaining_tasks.remove(task)
    
    return plan_phases

def optimize_plan(self, plan_phases: List[List[Task]]) -> List[List[Task]]:
    \"\"\"Optimize execution plan for efficiency\"\"\"
    optimized_phases = []
    
    for phase in plan_phases:
        # Sort tasks by estimated complexity/importance
        sorted_tasks = sorted(phase, key=lambda t: self._estimate_task_complexity(t))
        optimized_phases.append(sorted_tasks)
    
    return optimized_phases

def _estimate_task_complexity(self, task: Task) -> int:
    \"\"\"Estimate task complexity for prioritization\"\"\"
    complexity_keywords = {
        'research': 3,
        'analyze': 2,
        'create': 4,
        'implement': 5,
        'test': 2,
        'deploy': 3,
        'simple': 1,
        'complex': 5
    }
    
    description_lower = task.description.lower()
    complexity = 1
    
    for keyword, weight in complexity_keywords.items():
        if keyword in description_lower:
            complexity = max(complexity, weight)
    
    return complexity
```

## Execution Engine

```python
def execute_plan(self, plan_phases: List[List[Task]]) -> Dict[str, Any]:
    \"\"\"Execute the planned tasks phase by phase\"\"\"
    execution_results = {
        'phases_completed': 0,
        'tasks_completed': 0,
        'tasks_failed': 0,
        'execution_log': []
    }
    
    for phase_index, phase_tasks in enumerate(plan_phases):
        print(f"\\nExecuting Phase {phase_index + 1}: {len(phase_tasks)} tasks")
        
        phase_results = []
        for task in phase_tasks:
            result = self.execute_task(task)
            phase_results.append(result)
            
            if result['status'] == 'completed':
                execution_results['tasks_completed'] += 1
                self.completed_tasks.append(task)
            else:
                execution_results['tasks_failed'] += 1
        
        execution_results['phases_completed'] += 1
        execution_results['execution_log'].append({
            'phase': phase_index + 1,
            'results': phase_results
        })
    
    return execution_results

def execute_task(self, task: Task) -> Dict[str, Any]:
    \"\"\"Execute a single task with monitoring\"\"\"
    print(f"Executing task: {task.description}")
    task.status = TaskStatus.IN_PROGRESS
    
    try:
        # Determine execution strategy based on task description
        execution_strategy = self._determine_execution_strategy(task)
        
        if execution_strategy == "research":
            result = self._execute_research_task(task)
        elif execution_strategy == "analysis":
            result = self._execute_analysis_task(task)
        elif execution_strategy == "creation":
            result = self._execute_creation_task(task)
        else:
            result = self._execute_general_task(task)
        
        task.status = TaskStatus.COMPLETED
        task.result = result
        task.completed_at = datetime.utcnow()
        
        return {
            'task_id': task.id,
            'status': 'completed',
            'result': result,
            'execution_time': (task.completed_at - task.created_at).total_seconds()
        }
        
    except Exception as e:
        task.status = TaskStatus.FAILED
        task.error = str(e)
        
        return {
            'task_id': task.id,
            'status': 'failed',
            'error': str(e)
        }
```

## Self-Monitoring and Adaptation

```python
def monitor_progress(self, execution_results: Dict[str, Any]) -> Dict[str, Any]:
    \"\"\"Monitor execution progress and suggest adaptations\"\"\"
    total_tasks = execution_results['tasks_completed'] + execution_results['tasks_failed']
    success_rate = execution_results['tasks_completed'] / total_tasks if total_tasks > 0 else 0
    
    monitoring_report = {
        'success_rate': success_rate,
        'total_tasks': total_tasks,
        'adaptation_suggestions': []
    }
    
    # Analyze patterns in failures
    if execution_results['tasks_failed'] > 0:
        monitoring_report['adaptation_suggestions'].append(
            "Consider breaking down failed tasks into smaller steps"
        )
    
    if success_rate < 0.7:
        monitoring_report['adaptation_suggestions'].append(
            "Review task complexity estimation and planning algorithm"
        )
    
    return monitoring_report

def adapt_strategy(self, monitoring_report: Dict[str, Any]) -> None:
    \"\"\"Adapt agent strategy based on performance\"\"\"
    if monitoring_report['success_rate'] < 0.5:
        # Increase task granularity
        self.execution_context['max_task_complexity'] = 2
        print("Adapted: Reducing maximum task complexity")
    
    if 'timeout' in str(monitoring_report):
        # Increase timeout for future tasks
        self.execution_context['task_timeout'] = 120
        print("Adapted: Increasing task timeout")
```

## Decision Making Framework

```python
def make_decision(self, options: List[Dict[str, Any]], criteria: Dict[str, float]) -> Dict[str, Any]:
    \"\"\"Make intelligent decisions based on multiple criteria\"\"\"
    scored_options = []
    
    for option in options:
        score = 0
        for criterion, weight in criteria.items():
            if criterion in option:
                score += option[criterion] * weight
        
        scored_options.append({
            'option': option,
            'score': score
        })
    
    # Sort by score and return best option
    best_option = max(scored_options, key=lambda x: x['score'])
    
    decision_log = {
        'selected_option': best_option['option'],
        'score': best_option['score'],
        'alternatives': [opt for opt in scored_options if opt != best_option],
        'criteria_used': criteria,
        'timestamp': datetime.utcnow()
    }
    
    return decision_log
```

## Advanced Features

### Learning from Experience

```python
def learn_from_execution(self, execution_results: Dict[str, Any]) -> None:
    \"\"\"Learn from execution patterns to improve future performance\"\"\"
    # Store successful patterns
    for log_entry in execution_results['execution_log']:
        if log_entry.get('success_rate', 0) > 0.8:
            self.knowledge_base['successful_patterns'] = self.knowledge_base.get('successful_patterns', [])
            self.knowledge_base['successful_patterns'].append(log_entry)
    
    # Analyze failure patterns
    failures = [result for log in execution_results['execution_log'] 
                for result in log['results'] if result['status'] == 'failed']
    
    if failures:
        self.knowledge_base['failure_patterns'] = failures
```

## Testing the Autonomous Agent

```python
# Example usage
agent = AutonomousAgent("your-groq-api-key")

# Complex goal
goal = "Create a comprehensive market analysis report for AI agent platforms"

# Execute autonomous workflow
analysis = agent.analyze_goal(goal)
tasks = agent.decompose_goal(goal, analysis)
plan = agent.create_execution_plan(tasks)
optimized_plan = agent.optimize_plan(plan)
results = agent.execute_plan(optimized_plan)

# Monitor and adapt
monitoring = agent.monitor_progress(results)
agent.adapt_strategy(monitoring)
agent.learn_from_execution(results)
```

## Best Practices

1. **Start Simple**: Begin with straightforward goals before tackling complex objectives
2. **Monitor Continuously**: Implement robust monitoring and logging
3. **Plan for Failures**: Build resilience and recovery mechanisms
4. **Learn Iteratively**: Use experience to improve future performance
5. **Validate Results**: Implement quality checks for task outputs

## Conclusion

Autonomous agents represent a significant advancement in AI capabilities. By implementing proper planning, execution, and adaptation mechanisms, these agents can handle complex, multi-step objectives with minimal human intervention.

The architecture presented here provides a solid foundation for building more sophisticated autonomous systems. Future enhancements could include advanced reasoning capabilities, multi-agent coordination, and integration with external systems.

Complete implementation details and advanced examples are available in my GitHub repository.
""",
        "published": True,
        "featured": True,
        "tags": "AI,Autonomous Agent,Planning,Decision Making,Advanced,Architecture",
        "category": "Advanced",
        "readTime": 20,
        "metaTitle": "Autonomous Agent Architecture - Planning and Decision Making",
        "metaDescription": "Deep dive into autonomous agent design patterns, goal decomposition, dynamic planning, and intelligent decision making for AI systems.",
        "metaKeywords": "autonomous agent, AI planning, decision making, agent architecture, goal decomposition",
        "agentId": 3,
        "publishedAt": datetime.utcnow() - timedelta(days=1),
        "views": 234,
        "likes": 31,
        "author": "Developer",
        "authorEmail": "developer@example.com",
        "createdAt": datetime.utcnow() - timedelta(days=1),
        "updatedAt": datetime.utcnow() - timedelta(days=1)
    }
]

# Sample categories
SAMPLE_CATEGORIES = [
    {
        "name": "Tutorial",
        "slug": "tutorial",
        "description": "Step-by-step guides for building AI agents",
        "color": "#3B82F6",
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    },
    {
        "name": "Advanced",
        "slug": "advanced",
        "description": "Advanced concepts and techniques",
        "color": "#8B5CF6",
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    },
    {
        "name": "Case Study",
        "slug": "case-study",
        "description": "Real-world implementation examples",
        "color": "#10B981",
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    },
    {
        "name": "Tips & Tricks",
        "slug": "tips-tricks",
        "description": "Quick tips and best practices",
        "color": "#F59E0B",
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
]

# Sample tags
SAMPLE_TAGS = [
    {"name": "AI", "slug": "ai", "color": "#3B82F6", "createdAt": datetime.utcnow(), "updatedAt": datetime.utcnow()},
    {"name": "Tutorial", "slug": "tutorial", "color": "#10B981", "createdAt": datetime.utcnow(), "updatedAt": datetime.utcnow()},
    {"name": "Python", "slug": "python", "color": "#F59E0B", "createdAt": datetime.utcnow(), "updatedAt": datetime.utcnow()},
    {"name": "Groq", "slug": "groq", "color": "#8B5CF6", "createdAt": datetime.utcnow(), "updatedAt": datetime.utcnow()},
    {"name": "APIs", "slug": "apis", "color": "#EC4899", "createdAt": datetime.utcnow(), "updatedAt": datetime.utcnow()},
    {"name": "Advanced", "slug": "advanced", "color": "#6B7280", "createdAt": datetime.utcnow(), "updatedAt": datetime.utcnow()},
    {"name": "Getting Started", "slug": "getting-started", "color": "#14B8A6", "createdAt": datetime.utcnow(), "updatedAt": datetime.utcnow()},
    {"name": "Architecture", "slug": "architecture", "color": "#EF4444", "createdAt": datetime.utcnow(), "updatedAt": datetime.utcnow()},
    {"name": "Planning", "slug": "planning", "color": "#8B5CF6", "createdAt": datetime.utcnow(), "updatedAt": datetime.utcnow()},
    {"name": "Decision Making", "slug": "decision-making", "color": "#F97316", "createdAt": datetime.utcnow(), "updatedAt": datetime.utcnow()}
]

def seed_database():
    """
    Seed the database with sample blog content
    This would typically interact with your actual database
    """
    print("Seeding database with sample blog content...")
    
    # In a real implementation, this would insert into the actual database
    # For now, we'll return the sample data for use in the in-memory store
    
    return {
        "blogs": SAMPLE_BLOGS,
        "categories": SAMPLE_CATEGORIES,
        "tags": SAMPLE_TAGS
    }

if __name__ == "__main__":
    seed_data = seed_database()
    print(f"Created {len(seed_data['blogs'])} blog posts")
    print(f"Created {len(seed_data['categories'])} categories")
    print(f"Created {len(seed_data['tags'])} tags")