"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import ReactMarkdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"
import remarkToc from "remark-toc"
// import remarkMermaid from "remark-mermaidjs"
import "highlight.js/styles/github-dark.css"

interface MarkdownViewProps {
  content: string
}

export function MarkdownView({ content }: MarkdownViewProps) {
  return (
    <div className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[
          remarkGfm,
          [remarkToc, { heading: '目次', tight: true }],
        ]}
        rehypePlugins={[rehypeHighlight, rehypeSlug]}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

interface MarkdownFileViewProps {
  filePath: string
}

export function MarkdownFileView({ filePath }: MarkdownFileViewProps) {
  const [content, setContent] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMarkdown = async () => {
      try {
        const response = await fetch(filePath)

        if (!response.ok) {
          throw new Error(`ドキュメントの読み込みに失敗しました (${response.status})`)
        }

        const text = await response.text()
        setContent(text)
      } catch (err) {
        console.error("Markdown fetch error:", err)
        setError(err instanceof Error ? err.message : "ドキュメントの読み込みに失敗しました")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMarkdown()
  }, [filePath])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded-md">
        <h2 className="text-lg font-semibold mb-2">エラーが発生しました</h2>
        <p>{error}</p>
      </div>
    )
  }

  return content ? <MarkdownView content={content} /> : null
}
