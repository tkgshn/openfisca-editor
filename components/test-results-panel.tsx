"use client"
import { useTest } from "@/contexts/test-context"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"

export function TestResultsPanel() {
  const { isRunning, results, error, clearResults } = useTest()

  if (isRunning) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-lg font-medium">テスト実行中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>エラー</AlertTitle>
        <AlertDescription className="whitespace-pre-wrap">{error}</AlertDescription>
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={clearResults}>
            閉じる
          </Button>
        </div>
      </Alert>
    )
  }

  if (!results) {
    return null
  }

  const isPassing = results.returncode === 0
  const isMock = results.isMock === true

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isPassing ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500" />
          )}
          <h3 className="text-lg font-medium">
            テスト結果 {isMock && <span className="text-xs text-muted-foreground">(モックデータ)</span>}
          </h3>
        </div>
        <Button variant="ghost" size="sm" onClick={clearResults}>
          閉じる
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-muted p-3 rounded-md text-center">
          <div className="text-2xl font-bold">{results.total || 0}</div>
          <div className="text-sm text-muted-foreground">合計</div>
        </div>
        <div className="bg-green-100 p-3 rounded-md text-center">
          <div className="text-2xl font-bold text-green-700">{results.passed || 0}</div>
          <div className="text-sm text-green-700">成功</div>
        </div>
        <div className="bg-red-100 p-3 rounded-md text-center">
          <div className="text-2xl font-bold text-red-700">{results.failed || 0}</div>
          <div className="text-sm text-red-700">失敗</div>
        </div>
      </div>

      {results.stdout && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">標準出力:</h4>
          <pre className="bg-muted p-3 rounded-md text-sm whitespace-pre-wrap">{results.stdout}</pre>
        </div>
      )}

      {results.stderr && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">エラー出力:</h4>
          <pre className="bg-red-100 p-3 rounded-md text-sm text-red-700 whitespace-pre-wrap">{results.stderr}</pre>
        </div>
      )}

      {isMock && (
        <Alert className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>注意</AlertTitle>
          <AlertDescription>
            バックエンドサーバーに接続できないため、モックデータを表示しています。実際のテスト結果を確認するには、OpenFiscaバックエンドサービスを起動してください。
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

