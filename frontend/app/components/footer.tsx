import Link from "next/link"
import { Bot, Github, Linkedin, Twitter, MessageCircle, Search, Home } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/20 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950/30 relative overflow-hidden">
      {/* Enhanced background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/[0.02] via-purple-500/[0.02] to-pink-500/[0.02]" />
      
      <div className="container mx-auto px-4 py-16 relative">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl shadow-blue-500/30">
                <Bot className="h-7 w-7 text-white" />
              </div>
              <div>
                <span className="font-bold text-2xl bg-gradient-to-r from-gray-900 via-blue-700 to-purple-700 dark:from-white dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent">
                  AI Agents Platform
                </span>
                <div className="text-sm text-muted-foreground">Next-Generation AI Assistance</div>
              </div>
            </div>
            <p className="text-muted-foreground max-w-lg mb-8 text-lg leading-relaxed">
              Experience the next generation of AI assistance with specialized agents for mathematical calculations, 
              web research, and autonomous reasoning. Powered by cutting-edge AI models and professional-grade tools.
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://github.com"
                className="w-12 h-12 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-muted-foreground hover:text-foreground hover:shadow-lg hover:shadow-gray-500/20 transition-all duration-300 hover:-translate-y-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-6 w-6" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link
                href="https://linkedin.com"
                className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="h-6 w-6" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link
                href="https://twitter.com"
                className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="h-6 w-6" />
                <span className="sr-only">Twitter</span>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-6 text-gray-900 dark:text-white">Platform</h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-foreground transition-all duration-300 flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Home className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-medium">Home</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/chat"
                  className="text-muted-foreground hover:text-foreground transition-all duration-300 flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <MessageCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="font-medium">Chat with Agents</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/research"
                  className="text-muted-foreground hover:text-foreground transition-all duration-300 flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Search className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="font-medium">AI Research</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-6 text-gray-900 dark:text-white">AI Agents</h3>
            <ul className="space-y-5">
              <li className="group">
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-100 dark:border-blue-900/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
                  <div className="font-semibold text-blue-700 dark:text-blue-300 mb-1">Math Agent</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Mathematical calculations & operations</div>
                </div>
              </li>
              <li className="group">
                <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-100 dark:border-green-900/30 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300">
                  <div className="font-semibold text-green-700 dark:text-green-300 mb-1">Web Agent</div>
                  <div className="text-sm text-green-600 dark:text-green-400">Search, weather & news capabilities</div>
                </div>
              </li>
              <li className="group">
                <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-100 dark:border-purple-900/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
                  <div className="font-semibold text-purple-700 dark:text-purple-300 mb-1">Autonomous Agent</div>
                  <div className="text-sm text-purple-600 dark:text-purple-400">Advanced reasoning & research</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/20 mt-12 pt-8 bg-gradient-to-r from-gray-50/50 to-blue-50/50 dark:from-gray-800/50 dark:to-blue-950/50 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-muted-foreground text-base font-medium">
              © 2025 AI Agents Platform. Built with Next.js, FastAPI, and advanced AI models.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <span className="font-medium text-muted-foreground">Groq API</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-gradient-to-r from-blue-400 to-blue-500 flex items-center justify-center">
                  <Search className="h-3 w-3 text-white" />
                </div>
                <span className="font-medium text-muted-foreground">Google Search</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-gradient-to-r from-purple-400 to-purple-500 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <span className="font-medium text-muted-foreground">LangGraph</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
