import { memo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, BookOpen, type LucideIcon } from "lucide-react"

interface AgentCardProps {
  name: string
  icon: LucideIcon
  tools: readonly string[]
  description: string
  chatLink: string
  blogLink: string
}

export const AgentCard = memo(function AgentCard({
  name,
  icon: Icon,
  tools,
  description,
  chatLink,
  blogLink,
}: AgentCardProps) {
  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-xl">{name}</CardTitle>
        </div>
        <div className="flex flex-wrap gap-2">
          {tools.map((tool) => (
            <Badge key={tool} variant="secondary" className="text-xs">
              {tool}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <CardDescription className="text-base leading-relaxed">{description}</CardDescription>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button size="sm" asChild className="flex-1">
          <Link href={chatLink} className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat Now
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
          <Link href={blogLink} className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Read Blog
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
})
