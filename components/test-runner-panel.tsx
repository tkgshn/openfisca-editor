"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PlayCircle, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import type { Institution } from "@/lib/types"
import { runTest } from "@/lib/api"

interface TestRunnerPanelProps {
  institution: Institution
  onTestComplete?: (results: any) => void
}

export function TestRunnerPanel({ institution, onTestComplete }: TestRunnerPanelProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState<{
    stdout: string
    stderr: string
    returncode: number
    passed: number
    failed: number
    total: number
  } | null>(null)

  const runButtonRef = useRef<HTMLButtonElement>(null)

  const handleRunTests = async () => {
    if (!institution.testYamlRaw) {
      alert("テストケースが設定されていません。")
      return
    }

    setIsRunning(true)
    setTestResults(null)

    try {
      // テスト実行APIを呼び出す - ローカルのOpenFiscaバックエンドにリクエスト
      const results = await runTest(institution.id, institution.testYamlRaw)

      // Parse the results to extract more information
      const parsedResults = {
        ...results,
        passed: results.passed || 0,
        failed: results.failed || 0,
        total: results.total || institution.testCases?.length || 0,
      }

      // Try to extract test counts from stdout if available
      if (results.stdout && !results.passed) {
        const passedMatch = results.stdout.match(/(\d+) tests passed/i)
        if (passedMatch && passedMatch[1]) {
          parsedResults.passed = Number.parseInt(passedMatch[1], 10)
        }
      }

      // Calculate failed tests if not provided
      if (!results.failed) {
        parsedResults.failed = parsedResults.total - parsedResults.passed
      }

      setTestResults(parsedResults)

      // 親コンポーネントにテスト結果を通知
      if (onTestComplete) {
        onTestComplete(parsedResults)
      }
    } catch (error) {
      console.error("Failed to run tests:", error)
      // Create a fallback error result
      const errorResults = {
        stdout: "",
        stderr: error instanceof Error ? error.message : "テスト実行中にエラーが発生しました。",
        returncode: 1,
        passed: 0,
        failed: institution.testCases?.length || 0,
        total: institution.testCases?.length || 0,
      }
      setTestResults(errorResults)

      if (onTestComplete) {
        onTestComplete(errorResults)
      }
    } finally {
      setIsRunning(false)
    }
  }

  useEffect(() => {
    // Make the run function available to parent components
    if (runButtonRef.current) {
      runButtonRef.current.onclick = handleRunTests
    }
  }, [institution])

  return (
    <Card className="shadow-sm hover:shadow transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2">
          <PlayCircle className="h-5 w-5 text-foreground" />
          テスト実行
        </CardTitle>
        <Button
          ref={runButtonRef}
          onClick={handleRunTests}
          disabled={isRunning || !institution.testCases || institution.testCases.length === 0}
          className="flex items-center gap-2"
          id="test-runner-btn"
        >
          {isRunning ? "実行中..." : "テストを実行"}
        </Button>
      </CardHeader>
      <CardContent>
        {!institution.testCases || institution.testCases.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>テストケースが設定されていません。テストケースを追加してください。</p>
          </div>
        ) : !testResults ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>「テストを実行」ボタンをクリックして、テストケースを実行します。</p>
            <p className="text-sm mt-2">テスト対象: {institution.testCases.length}件のテストケース</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={testResults.returncode === 0 ? "default" : "destructive"} className="px-2 py-1">
                {testResults.returncode === 0 ? (
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
              <span className="text-sm">
                {testResults.returncode === 0
                  ? `${testResults.passed}/${testResults.total}件のテストケースが成功しました。`
                  : "テスト実行中にエラーが発生しました。"}
              </span>
            </div>

            {testResults.stdout && (
              <div className="bg-muted/50 p-3 rounded-md">
                <h4 className="text-sm font-medium mb-2">実行結果:</h4>
                <pre className="text-xs overflow-auto max-h-40 p-2 bg-background rounded">{testResults.stdout}</pre>
              </div>
            )}

            {testResults.stderr && (
              <div className="bg-destructive/10 p-3 rounded-md">
                <h4 className="text-sm font-medium mb-2 text-destructive">エラー:</h4>
                <pre className="text-xs overflow-auto max-h-40 p-2 bg-background rounded text-destructive">
                  {testResults.stderr}
                </pre>
              </div>
            )}

            <div className="bg-accent/50 p-3 rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p>テスト実行はローカルのOpenFiscaエンジンで行われます。</p>
                <p className="mt-1">
                  {testResults.stderr && testResults.stderr.includes("backend service may not be running")
                    ? "バックエンドサービスが実行されていないようです。実際のテスト結果を表示するには、OpenFiscaバックエンドを起動してください。"
                    : "実際のテスト結果はOpenFiscaエンジンの設定や環境によって異なる場合があります。"}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

