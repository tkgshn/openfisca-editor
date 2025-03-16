"use client"

import Link from "next/link"
import { ArrowLeft, Book, Compass, FileText, Settings, Layers, Code, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"

export default function DocsPage() {
  const documents = [
    { id: "user-guide", name: "ユーザーガイド", icon: <Book className="h-5 w-5" />, path: "/docs/user-guide", description: "OpenFisca Editorの基本的な使い方" },
    { id: "openfisca-concepts", name: "OpenFisca概念", icon: <Compass className="h-5 w-5" />, path: "/docs/openfisca-concepts", description: "OpenFiscaの主要概念の解説" },
    { id: "openfisca-file-guide", name: "ファイル作成ガイド", icon: <FileText className="h-5 w-5" />, path: "/docs/openfisca-file-guide", description: "OpenFiscaファイルの作成方法" },
    { id: "installation", name: "インストールガイド", icon: <Settings className="h-5 w-5" />, path: "/docs/installation", description: "インストール手順と設定方法" },
    { id: "architecture", name: "アーキテクチャ", icon: <Layers className="h-5 w-5" />, path: "/docs/architecture", description: "アプリケーションの構造と設計" },
    { id: "api-reference", name: "APIリファレンス", icon: <Code className="h-5 w-5" />, path: "/docs/api-reference", description: "API関数と型定義の詳細" },
  ]

  return (
    <div className="container mx-auto py-10 max-w-5xl">
      <div className="flex items-center gap-2 mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">OpenFisca Editor ドキュメント</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documents.map((doc) => (
          <Link href={doc.path} key={doc.id}>
            <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  {doc.icon}
                  {doc.name}
                </CardTitle>
                <CardDescription>{doc.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
