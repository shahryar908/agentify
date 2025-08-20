import { memo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, ArrowRight } from "lucide-react"

interface BlogCardProps {
  title: string
  readTime: string
  summary: string
  slug: string
  category: string
}

export const BlogCard = memo(function BlogCard({ title, readTime, summary, slug, category }: BlogCardProps) {
  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline">{category}</Badge>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {readTime}
          </div>
        </div>
        <CardTitle className="text-xl leading-tight">{title}</CardTitle>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-muted-foreground leading-relaxed">{summary}</p>
      </CardContent>

      <CardFooter>
        <Button variant="ghost" asChild className="w-full justify-between">
          <Link href={`/blog/${slug}`}>
            Read More
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
})
