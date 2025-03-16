"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface TestResultsModalProps {
  isOpen: boolean
  onClose: () => void
  results: {
    stdout: string
    stderr: string
    returncode: number
    passed?: number
    failed?: number
    total?: number
  } | null
  testCasesCount: number
}

/**
 * テスト結果を表示するモーダルコンポーネント
 */
export function TestResultsModal({ isOpen, onClose, results, testCasesCount }: TestResultsModalProps) {
  if (!results) return null

  const passed = results.passed !== undefined ? results.passed : results.returncode === 0 ? testCasesCount : 0
  const failed = results.failed !== undefined ? results.failed : results.returncode !== 0 ? testCasesCount : 0
  const total = results.total !== undefined ? results.total : testCasesCount

  const isBackendError = results.stderr && results.stderr.includes("backend service may not be running")

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Badge variant={results.returncode === 0 ? "default" : "destructive"} className="px-2 py-1">
              {results.returncode === 0 ? (
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  成功
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  失敗
                </span>
              )}
            </Badge>
            <span>
              テスト結果
              {results.returncode === 0 && ` - ${passed}/${total}件のテストケースが成功しました`}
              {results.returncode !== 0 && ` - テストが失敗しました`}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {results.stdout && (
            <div className="bg-muted/50 p-4 rounded-md">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                実行結果:
              </h4>
              <pre className="text-xs overflow-auto max-h-96 p-3 bg-background rounded border">{results.stdout}</pre>
            </div>
          )}

          {results.stderr && (
            <div className="bg-destructive/10 p-4 rounded-md">
              <h4 className="text-sm font-medium mb-2 text-destructive flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                エラー:
              </h4>
              <pre className="text-xs overflow-auto max-h-96 p-3 bg-background rounded border border-destructive/20 text-destructive">
                {results.stderr}
              </pre>
            </div>
          )}

          <div className="text-sm text-muted-foreground mt-4 bg-accent/30 p-4 rounded-md flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p>テスト実行はローカルのOpenFiscaエンジンで行われます。</p>
              {isBackendError ? (
                <p className="mt-1 font-medium">
                  バックエンドサービスが実行されていないようです。実際のテスト結果を表示するには、OpenFiscaバックエンドを起動してください。
                  <br />
                  <code className="text-xs bg-muted p-1 rounded mt-1 block">uvicorn server:app --reload</code>
                </p>
              ) : (
                <p className="mt-1">実際のテスト結果はOpenFiscaエンジンの設定や環境によって異なる場合があります。</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

