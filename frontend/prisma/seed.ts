import { PrismaClient } from '../app/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  // Create agents
  const mathAgent = await prisma.agent.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Math Agent',
      type: 'math',
      description: 'A specialized agent for mathematical calculations and operations',
      capabilities: JSON.stringify([
        'Addition and subtraction',
        'Multiplication and division',
        'Power calculations',
        'Square root operations',
        'Factorial calculations',
        'Number sequences'
      ])
    }
  })

  const intelligentAgent = await prisma.agent.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Intelligent Web Agent',
      type: 'intelligent',
      description: 'A versatile agent with web search, weather, and news capabilities',
      capabilities: JSON.stringify([
        'Web search and information retrieval',
        'Weather forecasts and current conditions',
        'Latest news and current events',
        'Date and time utilities',
        'General conversation'
      ])
    }
  })

  const autonomousAgent = await prisma.agent.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: 'Autonomous Agent',
      type: 'autonomous',
      description: 'An advanced agent with autonomous decision-making capabilities',
      capabilities: JSON.stringify([
        'Complex problem solving',
        'Multi-step task execution',
        'Autonomous decision making',
        'Advanced reasoning',
        'Context-aware responses'
      ])
    }
  })

  // Create blog posts
  const blog1 = await prisma.blog.upsert({
    where: { slug: 'building-math-agent-groq-api' },
    update: {},
    create: {
      title: 'Building a Math Agent with Groq API',
      slug: 'building-math-agent-groq-api',
      excerpt: 'Learn how to create a specialized mathematical agent using the Groq API with six core mathematical operations.',
      content: `# Building a Math Agent with Groq API

## Introduction

In this tutorial, we'll explore how to build a specialized mathematical agent using the Groq API. This agent can perform various mathematical operations including basic arithmetic, power calculations, and more complex operations like factorials.

## Key Features

Our Math Agent includes six core mathematical tools:

1. **Addition and Subtraction**
2. **Multiplication and Division** 
3. **Power Calculations**
4. **Square Root Operations**
5. **Factorial Calculations**
6. **Number Sequences**

## Implementation Details

The agent uses intelligent tool selection to determine when mathematical calculations are needed versus when to provide conversational responses.

\`\`\`python
def register_tool(self, name: str, func: Callable, description: str, params_schema: Dict):
    self.tools[name] = {
        "func": func,
        "schema": {"type": "function", "function": {...}}
    }
\`\`\`

## Tool Usage Decision Logic

The agent analyzes input to determine whether tools are needed:

- Mathematical keywords trigger tool usage
- Conversational inputs use LLM-only responses
- Complex queries may combine both approaches

## Conclusion

This mathematical agent demonstrates the power of combining AI with specialized tools for domain-specific tasks.`,
      published: true,
      tags: 'math,groq,api,agent,tutorial',
      readTime: 8,
      agentId: mathAgent.id
    }
  })

  const blog2 = await prisma.blog.upsert({
    where: { slug: 'intelligent-web-agent-comprehensive-guide' },
    update: {},
    create: {
      title: 'Intelligent Web Agent: A Comprehensive Guide',
      slug: 'intelligent-web-agent-comprehensive-guide',
      excerpt: 'Discover how to build an intelligent agent with web search, weather forecasting, and news retrieval capabilities.',
      content: `# Intelligent Web Agent: A Comprehensive Guide

## Overview

The Intelligent Web Agent represents a significant advancement in AI agent capabilities, combining web search, weather data, and news retrieval in a single, cohesive system.

## Core Capabilities

### 1. Web Search Integration
- Real-time web search using search engines
- Content extraction and summarization
- Relevant result filtering

### 2. Weather Forecasting
- Current weather conditions
- Multi-day forecasts
- Location-based weather data

### 3. News Retrieval
- Latest news across categories
- Real-time news updates
- Source credibility verification

## Architecture Design

\`\`\`python
class IntelligentToolAgent:
    def __init__(self, groq_api_key: str):
        self.client = Groq(api_key=groq_api_key)
        self.tools = {}
        self.conversation_history = []
        self._register_default_tools()
\`\`\`

## Tool Selection Algorithm

The agent uses sophisticated intent analysis:

1. **Keyword Analysis**: Scanning for domain-specific terms
2. **Context Scoring**: Evaluating conversation context
3. **Special Handling**: Price queries and location-based requests

## Implementation Highlights

### Error Handling
Robust error handling ensures graceful degradation when external services are unavailable.

### Performance Optimization
- Efficient API calls
- Response caching where appropriate
- Minimal latency design

## Future Enhancements

Planned improvements include:
- Enhanced natural language understanding
- Additional data sources
- Improved caching mechanisms

## Conclusion

The Intelligent Web Agent showcases the potential of multi-tool AI systems for real-world applications.`,
      published: true,
      tags: 'intelligent,web,search,weather,news,agent',
      readTime: 12,
      agentId: intelligentAgent.id
    }
  })

  const blog3 = await prisma.blog.upsert({
    where: { slug: 'autonomous-agent-architecture-patterns' },
    update: {},
    create: {
      title: 'Autonomous Agent Architecture Patterns',
      slug: 'autonomous-agent-architecture-patterns',
      excerpt: 'Explore advanced architectural patterns for building autonomous AI agents with decision-making capabilities.',
      content: `# Autonomous Agent Architecture Patterns

## Introduction

Autonomous agents represent the cutting edge of AI development, capable of independent decision-making and complex problem-solving without constant human intervention.

## Design Principles

### 1. Autonomy
Agents must be capable of independent operation with minimal human oversight.

### 2. Adaptability  
The ability to learn and adapt to new situations and environments.

### 3. Goal-Oriented Behavior
Clear objective setting and pursuit mechanisms.

## Core Components

### Decision Engine
The heart of autonomous behavior:

\`\`\`python
class DecisionEngine:
    def evaluate_options(self, context, available_actions):
        # Complex decision logic
        return best_action
\`\`\`

### Learning System
Continuous improvement through experience:

- Pattern recognition
- Performance feedback loops
- Strategy optimization

### Communication Interface
Seamless interaction with users and other systems.

## Implementation Strategies

### 1. Hierarchical Planning
Breaking complex tasks into manageable subtasks.

### 2. Real-time Adaptation
Dynamic strategy adjustment based on environmental changes.

### 3. Multi-modal Integration
Combining different types of inputs and outputs.

## Challenges and Solutions

### Challenge: Unpredictable Environments
**Solution**: Robust error handling and fallback strategies.

### Challenge: Complex Decision Making
**Solution**: Multi-criteria decision analysis frameworks.

### Challenge: Resource Management
**Solution**: Efficient resource allocation algorithms.

## Best Practices

1. **Fail Gracefully**: Always have fallback options
2. **Log Everything**: Comprehensive logging for debugging
3. **Test Extensively**: Rigorous testing in various scenarios
4. **Monitor Performance**: Continuous performance monitoring

## Future Directions

The field is moving toward:
- Enhanced learning capabilities
- Better human-AI collaboration
- Improved safety mechanisms

## Conclusion

Autonomous agents are transforming how we approach complex problem-solving in AI systems.`,
      published: true,
      tags: 'autonomous,architecture,patterns,decision-making,ai',
      readTime: 15,
      agentId: autonomousAgent.id
    }
  })

  console.log('Database seeded successfully!')
  console.log(`Created agents: ${mathAgent.name}, ${intelligentAgent.name}, ${autonomousAgent.name}`)
  console.log(`Created blogs: ${blog1.title}, ${blog2.title}, ${blog3.title}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })