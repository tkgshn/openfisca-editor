"use client"

import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, ArrowRight, Code, FileText, GitCompare, AlertCircle, CheckCircle2, XCircle } from "lucide-react"
import type { Institution, Version } from "@/lib/types"
import { getCommitDiff } from "@/lib/git-api"

// バージョン比較ダイアログのプロパティ
interface VersionComparisonDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    institution: Institution
    selectedVersion: Version
    currentVersion: Version | null
    onGoBack?: () => void
}

/**
 * バージョン比較ダイアログコンポーネント
 * 選択したバージョンと現在のバージョンの差分を比較する
 */
export function VersionComparisonDialog({
    open,
    onOpenChange,
    institution,
    selectedVersion,
    currentVersion,
    onGoBack
}: VersionComparisonDialogProps) {
    // タブの状態
    const [activeTab, setActiveTab] = useState<string>("variables")

    // 差分の読み込み状態
    const [isLoading, setIsLoading] = useState(false)
    const [diffContent, setDiffContent] = useState<{
        variables: string | null;
        tests: string | null;
        parameters: string | null;
    }>({
        variables: null,
        tests: null,
        parameters: null
    })

    // バージョン情報
    const fromVersion = useMemo(() => {
        return selectedVersion || {} as Version
    }, [selectedVersion])

    const toVersion = useMemo(() => {
        return currentVersion || {} as Version
    }, [currentVersion])

    // 差分を取得
    const fetchDiff = async () => {
        if (!fromVersion.commitHash || isLoading) return

        setIsLoading(true)
        try {
            // 選択したバージョンと現在のバージョンの差分を取得
            // 実際の実装では、ファイルタイプ別に差分を取得する必要があります
            const diff = await getCommitDiff(fromVersion.commitHash)

            // ファイルタイプ別に差分をグループ化（簡易的な実装）
            const diffs = {
                variables: diff, // Python変数ファイルの差分
                tests: diff,     // テストファイルの差分
                parameters: diff // パラメータファイルの差分
            }

            setDiffContent(diffs)
        } catch (error) {
            console.error("差分の取得に失敗しました:", error)
        } finally {
            setIsLoading(false)
        }
    }

    // ダイアログが開かれたときに差分を取得
    if (open && !diffContent.variables && !isLoading && fromVersion.commitHash) {
        fetchDiff()
    }

    // 差分表示のシンタックスハイライト用のクラス名を生成
    const getDiffLineClassName = (line: string) => {
        if (line.startsWith('+')) return "text-green-600 bg-green-50 block"
        if (line.startsWith('-')) return "text-red-600 bg-red-50 block"
        if (line.startsWith('@@')) return "text-blue-500 bg-blue-50 block"
        return "block"
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="flex items-center gap-2">
                            <GitCompare className="h-5 w-5" />
                            バージョン比較
                            {onGoBack && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="ml-2"
                                    onClick={onGoBack}
                                >
                                    <ArrowLeft className="h-4 w-4 mr-1" />
                                    履歴に戻る
                                </Button>
                            )}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                {/* 比較対象のバージョン情報 */}
                <div className="flex items-stretch gap-3 flex-shrink-0">
                    {/* 選択したバージョン */}
                    <div className="flex-1 border rounded-md p-3 bg-muted/20">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <h3 className="font-medium text-sm">
                                    {fromVersion.tag?.name || fromVersion.message?.split('\n')[0] || "不明なバージョン"}
                                </h3>

                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{fromVersion.timestamp ? new Date(fromVersion.timestamp).toLocaleString() : "不明な日時"}</span>
                                    {fromVersion.commitHash && (
                                        <code className="px-1 py-0.5 rounded bg-muted font-mono text-xs">
                                            {fromVersion.commitHash.substring(0, 7)}
                                        </code>
                                    )}
                                </div>
                            </div>

                            {fromVersion.testResults && (
                                <Badge
                                    variant={fromVersion.testResults.success ? "outline" : "destructive"}
                                    className={`text-xs ${fromVersion.testResults.success ? 'bg-green-50 text-green-700 border-green-200' : ''}`}
                                >
                                    {fromVersion.testResults.success ? (
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                    ) : (
                                        <XCircle className="h-3 w-3 mr-1" />
                                    )}
                                    {fromVersion.testResults.details.passed}/{fromVersion.testResults.details.total}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* 矢印 */}
                    <div className="flex items-center">
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>

                    {/* 現在のバージョン */}
                    <div className="flex-1 border rounded-md p-3 bg-primary/5 border-primary/20">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <h3 className="font-medium text-sm">
                                    {toVersion.tag?.name || toVersion.message?.split('\n')[0] || "現在のバージョン"}
                                    <Badge variant="outline" className="ml-2 text-xs bg-primary/10 text-primary border-primary/20">
                                        現在
                                    </Badge>
                                </h3>

                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{toVersion.timestamp ? new Date(toVersion.timestamp).toLocaleString() : "不明な日時"}</span>
                                    {toVersion.commitHash && (
                                        <code className="px-1 py-0.5 rounded bg-muted font-mono text-xs">
                                            {toVersion.commitHash.substring(0, 7)}
                                        </code>
                                    )}
                                </div>
                            </div>

                            {toVersion.testResults && (
                                <Badge
                                    variant={toVersion.testResults.success ? "outline" : "destructive"}
                                    className={`text-xs ${toVersion.testResults.success ? 'bg-green-50 text-green-700 border-green-200' : ''}`}
                                >
                                    {toVersion.testResults.success ? (
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                    ) : (
                                        <XCircle className="h-3 w-3 mr-1" />
                                    )}
                                    {toVersion.testResults.details.passed}/{toVersion.testResults.details.total}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {/* ファイルタイプ別の差分表示タブ */}
                <Tabs
                    defaultValue="variables"
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="mt-4 flex-grow flex flex-col"
                >
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="variables" className="flex items-center gap-1.5">
                            <Code className="h-4 w-4" />
                            <span>変数ファイル (.py)</span>
                        </TabsTrigger>
                        <TabsTrigger value="tests" className="flex items-center gap-1.5">
                            <FileText className="h-4 w-4" />
                            <span>テストファイル (.yaml)</span>
                        </TabsTrigger>
                        <TabsTrigger value="parameters" className="flex items-center gap-1.5">
                            <FileText className="h-4 w-4" />
                            <span>パラメータファイル (.yaml)</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* 変数ファイルの差分 */}
                    <TabsContent value="variables" className="flex-grow flex flex-col">
                        <ScrollArea className="flex-grow border rounded-md mt-2">
                            {isLoading ? (
                                <div className="p-4 text-center text-muted-foreground">
                                    <p>差分を読み込み中...</p>
                                </div>
                            ) : diffContent.variables ? (
                                <pre className="p-4 text-xs font-mono">
                                    {diffContent.variables.split('\n').map((line, index) => (
                                        <span key={index} className={getDiffLineClassName(line)}>
                                            {line}
                                        </span>
                                    ))}
                                </pre>
                            ) : (
                                <div className="p-4 flex items-center justify-center text-muted-foreground">
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    <span>変数ファイルの差分情報がありません</span>
                                </div>
                            )}
                        </ScrollArea>
                    </TabsContent>

                    {/* テストファイルの差分 */}
                    <TabsContent value="tests" className="flex-grow flex flex-col">
                        <ScrollArea className="flex-grow border rounded-md mt-2">
                            {isLoading ? (
                                <div className="p-4 text-center text-muted-foreground">
                                    <p>差分を読み込み中...</p>
                                </div>
                            ) : diffContent.tests ? (
                                <pre className="p-4 text-xs font-mono">
                                    {diffContent.tests.split('\n').map((line, index) => (
                                        <span key={index} className={getDiffLineClassName(line)}>
                                            {line}
                                        </span>
                                    ))}
                                </pre>
                            ) : (
                                <div className="p-4 flex items-center justify-center text-muted-foreground">
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    <span>テストファイルの差分情報がありません</span>
                                </div>
                            )}
                        </ScrollArea>
                    </TabsContent>

                    {/* パラメータファイルの差分 */}
                    <TabsContent value="parameters" className="flex-grow flex flex-col">
                        <ScrollArea className="flex-grow border rounded-md mt-2">
                            {isLoading ? (
                                <div className="p-4 text-center text-muted-foreground">
                                    <p>差分を読み込み中...</p>
                                </div>
                            ) : diffContent.parameters ? (
                                <pre className="p-4 text-xs font-mono">
                                    {diffContent.parameters.split('\n').map((line, index) => (
                                        <span key={index} className={getDiffLineClassName(line)}>
                                            {line}
                                        </span>
                                    ))}
                                </pre>
                            ) : (
                                <div className="p-4 flex items-center justify-center text-muted-foreground">
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    <span>パラメータファイルの差分情報がありません</span>
                                </div>
                            )}
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
