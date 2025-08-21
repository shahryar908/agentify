// Static data for frontend components
import { Plus, Settings, MessageSquare, Rocket, Calculator, Globe, Brain, Code, PenTool, BarChart, Users, Zap, Server, MessageCircle } from 'lucide-react'

export const agents = [
  {
    id: 1,
    name: "Math Calculator Agent",
    description: "A powerful agent that can perform mathematical calculations, solve equations, and handle complex arithmetic operations.",
    icon: Calculator,
    category: "Mathematics",
    tools: ["add_numbers", "multiply_numbers", "divide_numbers", "subtract_numbers", "calculate_power", "calculate_square_root"],
    featured: true
  },
  {
    id: 2,
    name: "Intelligent Web Agent", 
    description: "An intelligent agent that can search the web, get weather information, fetch news, and access current information from the internet.",
    icon: Globe,
    category: "Web & Research",
    tools: ["search_web", "get_weather", "get_latest_news", "fetch_web_content", "get_current_datetime"],
    featured: true
  },
  {
    id: 3,
    name: "Autonomous Planning Agent",
    description: "An autonomous agent that can break down goals into steps, think through problems, and make decisions using advanced reasoning capabilities.",
    icon: Brain,
    category: "AI & Planning",
    tools: ["search_web", "get_weather", "analyze_weather", "check_air_quality", "get_time", "search_news"],
    featured: true
  },
  {
    id: 4,
    name: "Code Assistant Agent",
    description: "A specialized agent for code review, debugging, and programming assistance across multiple languages.",
    icon: Code,
    category: "Development",
    tools: ["analyze_code", "debug_issues", "suggest_improvements", "format_code"],
    featured: false
  },
  {
    id: 5,
    name: "Content Writer Agent",
    description: "A creative agent for content creation, copywriting, and text generation across various formats and styles.",
    icon: PenTool,
    category: "Content",
    tools: ["generate_content", "edit_text", "check_grammar", "optimize_seo"],
    featured: false
  },
  {
    id: 6,
    name: "Data Analysis Agent",
    description: "An analytical agent for processing data, generating insights, and creating visualizations from complex datasets.",
    icon: BarChart,
    category: "Analytics",
    tools: ["process_data", "generate_charts", "statistical_analysis", "data_cleaning"],
    featured: false
  }
]

export const blogPosts = [
  {
    id: 1,
    title: "Building Autonomous AI Agents: A Complete Guide",
    excerpt: "Learn how to create intelligent agents that can reason, plan, and execute tasks autonomously using modern AI techniques.",
    author: "AI Research Team",
    publishDate: "2024-12-15",
    readTime: "8 min read",
    category: "AI Development",
    tags: ["AI", "Autonomous Agents", "Machine Learning", "Tutorial"],
    featured: true,
    imageUrl: "/api/placeholder/600/300"
  },
  {
    id: 2,
    title: "The Future of Multi-Agent Systems",
    excerpt: "Exploring how multiple AI agents can collaborate to solve complex problems and create more intelligent solutions.",
    author: "Dr. Sarah Chen",
    publishDate: "2024-12-10",
    readTime: "12 min read",
    category: "Research",
    tags: ["Multi-Agent", "Collaboration", "AI Systems"],
    featured: true,
    imageUrl: "/api/placeholder/600/300"
  },
  {
    id: 3,
    title: "Integrating LLMs with Tool-Using Agents",
    excerpt: "A deep dive into how large language models can be enhanced with external tools to create more capable AI agents.",
    author: "Michael Torres",
    publishDate: "2024-12-05",
    readTime: "15 min read",
    category: "Technical",
    tags: ["LLM", "Tools", "Integration", "APIs"],
    featured: true,
    imageUrl: "/api/placeholder/600/300"
  },
  {
    id: 4,
    title: "Best Practices for Agent Security",
    excerpt: "Essential security considerations when building and deploying AI agents in production environments.",
    author: "Security Team",
    publishDate: "2024-11-28",
    readTime: "10 min read",
    category: "Security",
    tags: ["Security", "Best Practices", "Production"],
    featured: false,
    imageUrl: "/api/placeholder/600/300"
  },
  {
    id: 5,
    title: "Scaling AI Agents for Enterprise",
    excerpt: "How to design and deploy AI agent systems that can handle enterprise-scale workloads and requirements.",
    author: "Enterprise Solutions",
    publishDate: "2024-11-20",
    readTime: "14 min read",
    category: "Enterprise",
    tags: ["Scaling", "Enterprise", "Architecture"],
    featured: false,
    imageUrl: "/api/placeholder/600/300"
  },
  {
    id: 6,
    title: "Real-time Agent Communication Protocols",
    excerpt: "Understanding the communication patterns and protocols that enable effective real-time agent interactions.",
    author: "Protocol Team",
    publishDate: "2024-11-15",
    readTime: "11 min read",
    category: "Technical",
    tags: ["Protocols", "Real-time", "Communication"],
    featured: false,
    imageUrl: "/api/placeholder/600/300"
  }
]

export const steps = [
  {
    id: 1,
    title: "Create Your Agent",
    description: "Choose from our pre-built agent templates or create a custom agent tailored to your specific needs.",
    icon: Plus,
    details: [
      "Select from Math, Web Research, or Autonomous Planning agents",
      "Customize agent capabilities and tools",
      "Configure API keys and external integrations",
      "Set up agent personality and behavior patterns"
    ]
  },
  {
    id: 2,
    title: "Configure Tools & APIs",
    description: "Connect your agent to external services, APIs, and tools to enhance its capabilities.",
    icon: Settings,
    details: [
      "Integrate with web search APIs for real-time information",
      "Connect to weather services for location-based data",
      "Add news APIs for current event awareness",
      "Enable mathematical computation tools"
    ]
  },
  {
    id: 3,
    title: "Test & Interact",
    description: "Chat with your agent, test its responses, and fine-tune its behavior through natural conversation.",
    icon: MessageSquare,
    details: [
      "Use the interactive chat interface",
      "Test agent responses with various queries",
      "Monitor tool usage and decision-making",
      "Adjust agent settings based on performance"
    ]
  },
  {
    id: 4,
    title: "Deploy & Scale",
    description: "Deploy your agent to production and scale it to handle multiple conversations and complex workflows.",
    icon: Rocket,
    details: [
      "Deploy agents via REST API endpoints",
      "Scale horizontally with load balancing",
      "Monitor agent performance and analytics",
      "Integrate with existing business systems"
    ]
  }
]

export const testimonials = [
  {
    id: 1,
    name: "Alex Rodriguez",
    role: "AI Developer",
    company: "TechFlow Inc",
    content: "The AI agents platform has revolutionized how we handle customer queries. The autonomous planning agent is particularly impressive.",
    avatar: "/api/placeholder/60/60",
    rating: 5
  },
  {
    id: 2,
    name: "Sarah Kim",
    role: "Data Scientist",
    company: "DataLabs",
    content: "I love how easy it is to create custom agents. The math agent saved us countless hours on complex calculations.",
    avatar: "/api/placeholder/60/60",
    rating: 5
  },
  {
    id: 3,
    name: "Mark Johnson",
    role: "Product Manager",
    company: "InnovateCorp",
    content: "The web research capabilities are outstanding. Our agents can now provide real-time information to users.",
    avatar: "/api/placeholder/60/60",
    rating: 5
  }
]

export const features = [
  {
    id: 1,
    title: "Multi-Agent Architecture",
    description: "Support for multiple specialized agents working together",
    icon: Users
  },
  {
    id: 2,
    title: "Real-time Tool Integration",
    description: "Connect to live APIs and external services seamlessly",
    icon: Zap
  },
  {
    id: 3,
    title: "Advanced Reasoning",
    description: "Autonomous planning and decision-making capabilities",
    icon: Brain
  },
  {
    id: 4,
    title: "Scalable Deployment",
    description: "Deploy and scale agents across multiple environments",
    icon: Server
  },
  {
    id: 5,
    title: "Interactive Chat Interface",
    description: "Natural conversation interface with rich responses",
    icon: MessageCircle
  },
  {
    id: 6,
    title: "Analytics & Monitoring",
    description: "Track agent performance and usage analytics",
    icon: BarChart
  }
]