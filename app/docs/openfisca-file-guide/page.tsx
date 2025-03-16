いた"use client"

import { MarkdownFileView } from "@/components/markdown-view"

export default function OpenFiscaFileGuidePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">OpenFisca ファイル作成ガイド</h1>
      <MarkdownFileView filePath="/docs/openfisca-file-guide.md" />
    </div>
  )
}
