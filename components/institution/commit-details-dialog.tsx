"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { GitCommit, RotateCcw, AlertCircle, ArrowLeft } from "lucide-react"
import type { Version } from "@/lib/types"
import { getCommitDiff } from "@/lib/git-api"

// コミット詳細ダイアログのプロパティ
interface CommitDetailsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    version: Version
    onRevertVersion: (versionId: string) => Promise<void>
    onGoBack?: () => void
}

/**
 * コミット詳細ダイアログコンポーネント
 * 特定のコミットバージョンの詳細と差分を表示する
 */
export function CommitDetailsDialog({
    open,
    onOpenChange,
    version,
    onRevertVersion,
    onGoBack
}: CommitDetailsDialogProps) {
    const [isRevertDialogOpen, setIsRevertDialogOpen] = useState(false)
    const [diffContent, setDiffContent] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    // コミット差分の取得
    const fetchDiff = async () => {
        if (!version.commitHash || diffContent) return

        setIsLoading(true)
        try {
            const diff = await getCommitDiff(version.commitHash)
            setDiffContent(diff)
        } catch (error) {
            console.error("差分の取得に失敗しました:", error)
        } finally {
            setIsLoading(false)
        }
    }

    // ダイアログが開かれたときに差分を取得
    if (open && !diffContent && !isLoading && version.commitHash) {
        fetchDiff()
    }

    // このバージョンに戻す処理
    const handleRevert = async () => {
        await onRevertVersion(version.id)
        setIsRevertDialogOpen(false)
        onOpenChange(false)
    }

    // 差分表示のシンタックスハイライト用のクラス名を生成
    const getDiffLineClassName = (line: string) => {
        if (line.startsWith('+')) return "text-green-600 bg-green-50 block"
        if (line.startsWith('-')) return "text-red-600 bg-red-50 block"
        if (line.startsWith('@@')) return "text-blue-500 bg-blue-50 block"
        return "block"
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader className="flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="flex items-center gap-2">
                                <GitCommit className="h-5 w-5" />
                                コミット詳細
                                {onGoBack && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="ml-2"
                                        onClick={onGoBack}
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-1" />
                                        戻る
                                    </Button>
                                )}
                            </DialogTitle>

                            <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1.5 text-xs"
                                onClick={() => setIsRevertDialogOpen(true)}
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                                このバージョンに戻す
                            </Button>
                        </div>
                    </DialogHeader>

                    {/* コミット情報 */}
                    <div className="border rounded-md p-3 bg-muted/20 flex-shrink-0">
                        <div className="space-y-1">
                            <h3 className="font-medium">
                                {version.tag?.name || version.message}
                            </h3>

                            {version.tag?.description && (
                                <p className="text-sm text-muted-foreground">
                                    {version.tag.description}
                                </p>
                            )}

                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <span>{new Date(version.timestamp).toLocaleString()}</span>
                                {version.commitHash && (
                                    <code className="px-1 py-0.5 rounded bg-muted font-mono text-xs">
                                        {version.commitHash.substring(0, 7)}
                                    </code>
                                )}

                                {version.testResults && (
                                    <Badge
                                        variant={version.testResults.success ? "outline" : "destructive"}
                                        className={`text-xs ml-2 ${version.testResults.success ? 'bg-green-50 text-green-700 border-green-200' : ''}`}
                                    >
                                        テスト: {version.testResults.success ? '成功' : '失敗'}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    <Separator className="my-2 flex-shrink-0" />

                    {/* 差分表示 */}
                    <h3 className="font-medium text-sm mb-2 flex-shrink-0">変更内容</h3>

                    <ScrollArea className="flex-grow border rounded-md">
                        {isLoading ? (
                            <div className="p-4 text-center text-muted-foreground">
                                <p>差分を読み込み中...</p>
                            </div>
                        ) : diffContent ? (
                            <pre className="p-4 text-xs font-mono">
                                {diffContent.split('\n').map((line, index) => (
                                    <span key={index} className={getDiffLineClassName(line)}>
                                        {line}
                                    </span>
                                ))}
                            </pre>
                        ) : (
                            <div className="p-4 flex items-center justify-center text-muted-foreground">
                                <AlertCircle className="h-4 w-4 mr-2" />
                                <span>差分情報がありません</span>
                            </div>
                        )}
                    </ScrollArea>
                </DialogContent>
            </Dialog>

            {/* 復元確認ダイアログ */}
            <AlertDialog open={isRevertDialogOpen} onOpenChange={setIsRevertDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>このバージョンに戻しますか？</AlertDialogTitle>
                        <AlertDialogDescription>
                            現在の変更内容は失われ、選択したバージョンの状態に戻ります。
                            この操作は元に戻せません。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>キャンセル</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRevert}>
                            このバージョンに戻す
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
