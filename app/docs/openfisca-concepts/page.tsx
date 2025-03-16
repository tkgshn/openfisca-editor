"use client"

import { MarkdownFileView } from "@/components/markdown-view"

export default function OpenFiscaConceptsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">OpenFisca 概念ガイド</h1>
      <MarkdownFileView filePath="/docs/openfisca-concepts.md" />
      {/* publicディレクトリのマークダウンファイルを読み込み */}
    </div>
  )
}
