import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { AuthProvider } from './contexts/auth-context'
import { ThemeProvider } from './components/theme-provider'
import { Header } from './components/header'
import { Footer } from './components/footer'

const geist = Geist({
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "AI Agents Platform - Advanced AI Assistant Technology",
  description: "Experience the next generation of AI assistance with specialized agents for mathematical calculations, web research, and autonomous reasoning. Powered by advanced AI models and professional tools.",
  keywords: "AI agents, artificial intelligence, chatbot, web search, mathematics, autonomous reasoning, AI assistant",
  authors: [{ name: "AI Agents Platform" }],
  openGraph: {
    title: "AI Agents Platform - Advanced AI Assistant Technology",
    description: "Experience specialized AI agents for different tasks - from calculations to research and autonomous problem-solving.",
    type: "website",
    siteName: "AI Agents Platform",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Agents Platform - Advanced AI Assistant Technology",
    description: "Experience specialized AI agents for different tasks - from calculations to research and autonomous problem-solving.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={geist.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}