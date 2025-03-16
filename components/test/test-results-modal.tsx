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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge variant={results.returncode === 0 ? "default" : "destructive"} className="px-2 py-0.5 text-sm">
              {results.returncode === 0 ? (
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" />
                  成功
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <XCircle className="h-3.5 w-3.5" />
                  失敗
                </span>
              )}
            </Badge>
            <span className="text-lg">
              テスト結果
              {results.returncode === 0 && ` - ${passed}/${total}件のテストケースが成功しました`}
              {results.returncode !== 0 && ` - テストが失敗しました`}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-muted/50 p-2 rounded-md text-center">
              <div className="text-lg font-semibold">{total}</div>
              <div className="text-xs text-muted-foreground">合計</div>
            </div>
            <div className="bg-green-50 p-2 rounded-md text-center">
              <div className="text-lg font-semibold text-green-700">{passed}</div>
              <div className="text-xs text-green-600">成功</div>
            </div>
            <div className="bg-red-50 p-2 rounded-md text-center">
              <div className="text-lg font-semibold text-red-700">{failed}</div>
              <div className="text-xs text-red-600">失敗</div>
            </div>
          </div>

          {results.stdout && (
            <div className="bg-muted/50 p-2 rounded-md">
              <h4 className="text-xs font-medium mb-1.5 flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                実行結果:
              </h4>
              <pre className="text-xs overflow-auto max-h-48 p-2 bg-background rounded border">{results.stdout}</pre>
            </div>
          )}

          {results.stderr && (
            <div className="bg-destructive/10 p-2 rounded-md">
              <h4 className="text-xs font-medium mb-1.5 text-destructive flex items-center gap-1.5">
                <XCircle className="h-3.5 w-3.5" />
                エラー:
              </h4>
              <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-all max-h-48 p-2 bg-background rounded border border-destructive/20 text-destructive">
                {results.stderr.split('/').join('/\n')}
              </pre>
            </div>
          )}

          <div className="text-xs text-muted-foreground mt-3 bg-accent/30 p-2 rounded-md flex items-start gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
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

