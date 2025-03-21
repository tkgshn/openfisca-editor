"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Share2, Download, Link2, Trash2, History, RotateCcw, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import type { Institution, Version } from "@/lib/types"
import { TestResultsModal } from "@/components/test/test-results-modal"

interface InstitutionHeaderProps {
  institution: Institution
  onRevertVersion: (versionId: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onExport: () => Promise<void>
  onShare: () => void
  onCopyUrl: () => void
  testResults?: {
    stdout: string
    stderr: string
    returncode: number
    passed?: number
    failed?: number
    total?: number
  } | null
}

/**
 * 制度のヘッダーコンポーネント
 * 制度名、バージョン履歴、テスト結果などを表示する
 */
export function InstitutionHeader({
  institution,
  onRevertVersion,
  onDelete,
  onExport,
  onShare,
  onCopyUrl,
  testResults,
}: InstitutionHeaderProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isRevertDialogOpen, setIsRevertDialogOpen] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null)
  const [isTestResultsModalOpen, setIsTestResultsModalOpen] = useState(false)

  // Make sure versions exists, with a fallback to an empty array
  const versions = institution.versions || []
  // Find the current version safely
  const currentVersion = institution.currentVersion
    ? versions.find((v) => v.id === institution.currentVersion)
    : undefined
  const lastTest = institution.lastTestResults

  // Determine which test results to display
  const displayTestResults =
    testResults ||
    (lastTest
      ? {
        stdout: lastTest.details.passed + " tests passed",
        stderr: lastTest.details.errors?.join("\n") || "",
        returncode: lastTest.success ? 0 : 1,
        passed: lastTest.details.passed,
        failed: lastTest.details.failed,
        total: lastTest.details.total,
      }
      : null)

  const handleRevert = async (version: Version) => {
    setSelectedVersion(version)
    setIsRevertDialogOpen(true)
  }

  const confirmRevert = async () => {
    if (selectedVersion) {
      await onRevertVersion(selectedVersion.id)
      setIsRevertDialogOpen(false)
    }
  }

  // Check if the error is related to backend connection
  const isBackendError =
    displayTestResults?.stderr && displayTestResults.stderr.includes("backend service may not be running")

  return (
    <div className="fixed top-0 left-0 right-0 md:left-64 lg:left-80 z-50 bg-background/95 backdrop-blur-sm py-2 border-b shadow-sm">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-primary">{institution.name}</h1>

          <div className="flex items-center gap-1.5">
            {/* Version Count */}
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <History className="h-3 w-3" />
              {versions.length} Commits
            </Badge>

            {/* Test Status Badge */}
            {displayTestResults && (
              <Badge
                variant={displayTestResults.returncode === 0 ? "outline" : "destructive"}
                className={`flex items-center gap-1 cursor-pointer hover:opacity-80 text-xs ${displayTestResults.returncode === 0
                    ? "bg-green-50 text-green-700 hover:bg-green-100 border-green-300"
                    : ""
                  }`}
                onClick={() => setIsTestResultsModalOpen(true)}
              >
                {displayTestResults.returncode === 0 ? (
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                {displayTestResults.returncode === 0
                  ? `${displayTestResults.passed || 0}/${displayTestResults.total || institution.testCases?.length || 0}`
                  : isBackendError
                    ? "バックエンド未接続"
                    : "テスト失敗"}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Version History Dropdown */}
          {versions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5" />
                  履歴
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[300px]">
                {versions.map((version) => (
                  <DropdownMenuItem
                    key={version.id}
                    className="flex items-center justify-between py-1.5"
                    onClick={() => handleRevert(version)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{version.message}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(version.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {version.testResults && (
                      <Badge variant={version.testResults.success ? "default" : "destructive"} className="ml-2 text-xs">
                        {version.testResults.success ? (
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}
                        {version.testResults.details.passed}/{version.testResults.details.total}
                      </Badge>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button variant="outline" size="sm" onClick={onShare} className="flex items-center gap-1.5">
            <Share2 className="h-3.5 w-3.5" />
            公開
          </Button>

          <Button variant="outline" size="sm" onClick={onExport} className="flex items-center gap-1.5">
            <Download className="h-3.5 w-3.5" />
            エクスポート
          </Button>

          <Button variant="outline" size="sm" onClick={onCopyUrl} className="flex items-center gap-1.5">
            <Link2 className="h-3.5 w-3.5" />
            URLをコピー
          </Button>

          {institution.source === "user" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="flex items-center gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              削除
            </Button>
          )}
        </div>
      </div>

      {/* Backend Connection Error Alert */}
      {isBackendError && (
        <div className="bg-amber-500/10 p-2 mt-2 max-w-7xl mx-auto px-3 rounded-md">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-amber-600 text-sm">OpenFiscaバックエンドに接続できません</p>
              <div className="mt-1 text-xs text-amber-600/90">
                <p>
                  バックエンドサービスが実行されていないようです。実際のテスト結果を表示するには、OpenFiscaバックエンドを起動してください。
                </p>
                <code className="text-xs bg-amber-500/10 p-1 rounded mt-1 block">uvicorn server:app --reload</code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sample Institution Warning */}
      {institution.source === "sample" && (
        <div className="bg-muted/50 p-2 rounded-md text-xs text-muted-foreground mt-2 max-w-7xl mx-auto px-3">
          <p>
            これはサンプル制度です。編集内容は保存されません。独自の制度を作成するには、サイドバーの「+」ボタンをクリックしてください。
          </p>
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>制度を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は元に戻せません。制度とそのすべてのデータが完全に削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                onDelete(institution.id)
                setIsDeleteDialogOpen(false)
              }}
            >
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revert Dialog */}
      <AlertDialog open={isRevertDialogOpen} onOpenChange={setIsRevertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>このバージョンに戻しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedVersion && (
                <>
                  <p className="font-medium">{selectedVersion.message}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(selectedVersion.timestamp).toLocaleString()}
                  </p>
                </>
              )}
              <p className="mt-4">現在の変更内容は失われます。この操作は元に戻せません。</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRevert}>このバージョンに戻す</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Test Results Modal */}
      <TestResultsModal
        isOpen={isTestResultsModalOpen}
        onClose={() => setIsTestResultsModalOpen(false)}
        results={displayTestResults}
        testCasesCount={institution.testCases?.length || 0}
      />
    </div>
  )
}

