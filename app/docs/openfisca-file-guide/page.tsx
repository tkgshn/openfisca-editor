import fs from 'fs'
import path from 'path'
import { MarkdownView } from "@/components/markdown-view"

export default function OpenFiscaFileGuidePage() {
  // サーバーサイドでマークダウンファイルを読み込む
  const filePath = path.join(process.cwd(), 'public', 'docs', 'openfisca-file-guide.md')
  const content = fs.existsSync(filePath)
    ? fs.readFileSync(filePath, 'utf8')
    : '# OpenFisca ファイル作成ガイド\n\nドキュメントが見つかりませんでした。'

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">OpenFisca ファイル作成ガイド</h1>
      <MarkdownView content={content} />
    </div>
  )
}
