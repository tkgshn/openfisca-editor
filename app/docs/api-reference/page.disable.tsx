"use client"

import { MarkdownFileView } from "@/components/markdown-view"

export const dynamic = 'force-dynamic';

export default function ApiReferencePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">API リファレンス</h1>
      <MarkdownFileView filePath="/docs/api-reference.md" />
    </div>
  )
}
