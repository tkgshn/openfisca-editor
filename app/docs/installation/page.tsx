.
"use client"

import { MarkdownFileView } from "@/components/markdown-view"

export default function InstallationPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">インストールガイド</h1>
      <MarkdownFileView filePath="/docs/installation.md" />
    </div>
  )
}
