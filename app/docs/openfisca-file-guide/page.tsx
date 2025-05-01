"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MarkdownFileView } from "@/components/markdown-view"
import { useI18n } from "@/lib/i18n"

export default function OpenFiscaFileGuidePage() {
  const { t } = useI18n()
  
  return (
    <div className="container mx-auto py-10 max-w-5xl">
      <div className="flex items-center gap-2 mb-8">
        <Link href="/docs">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{t.documents.fileGuide}</h1>
      </div>
      
      <MarkdownFileView filePath="/docs/openfisca-file-guide.md" />
    </div>
  )
}
