import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl px-4 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">AI</span>
          </div>
          <span className="font-bold text-xl">Agents</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/chat" className="text-sm font-medium hover:text-primary transition-colors">
            Chat
          </Link>
          <Link href="/blogs" className="text-sm font-medium hover:text-primary transition-colors">
            Tutorials
          </Link>
          <Link href="/blogs/new" className="text-sm font-medium hover:text-primary transition-colors">
            Write
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/chat">Try Demo</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/chat">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
