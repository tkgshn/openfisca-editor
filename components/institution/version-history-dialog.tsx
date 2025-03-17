"use client"

import { useState, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    History,
    Tag,
    BookmarkPlus,
    CheckCircle2,
    XCircle,
    ArrowRight,
    GitBranch,
    GitCommit
} from "lucide-react"
import type { Institution, Version } from "@/lib/types"
import { useI18n } from "@/lib/i18n/index"

// バージョン履歴ダイアログのプロパティ
interface VersionHistoryDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    institution: Institution
    onRevertVersion: (versionId: string) => Promise<void>
    onViewDiff?: (version: Version) => void
    onAddNamedVersion?: (name: string, description: string) => Promise<void>
    onCompareVersions?: (version: Version) => void
}

/**
 * バージョン履歴ダイアログコンポーネント
 * 変更履歴と名前付きバージョンを表示・管理する
 */
export function VersionHistoryDialog({
    open,
    onOpenChange,
    institution,
    onRevertVersion,
    onViewDiff,
    onAddNamedVersion,
    onCompareVersions
}: VersionHistoryDialogProps) {
    // 多言語対応のためのフック
    const { t, locale } = useI18n()
    const { t: t2 } = useTranslation('institution')

    // タブの状態
    const [activeTab, setActiveTab] = useState<string>("history")

    // 名前付きバージョン作成フォームの状態
    const [versionName, setVersionName] = useState("")
    const [versionDescription, setVersionDescription] = useState("")

    // フィルター状態
    const [filter, setFilter] = useState<"all" | "named" | "unnamed">("all")

    // バージョン情報
    const versions = institution.versions || []

    // 名前付きバージョン（タグ）のリスト
    const namedVersions = useMemo(() => {
        return versions.filter(version => version.tag)
    }, [versions])

    // フィルターされたバージョンリスト
    const filteredVersions = useMemo(() => {
        switch (filter) {
            case "named":
                return versions.filter(v => v.tag)
            case "unnamed":
                return versions.filter(v => !v.tag)
            case "all":
            default:
                return versions
        }
    }, [versions, filter])

    // 名前付きバージョンの保存処理
    const handleAddNamedVersion = async () => {
        if (onAddNamedVersion && versionName.trim()) {
            await onAddNamedVersion(versionName, versionDescription)
            setVersionName("")
            setVersionDescription("")
            setActiveTab("history") // 履歴タブに戻る
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        {t2('versionManagement')}
                    </DialogTitle>
                </DialogHeader>

                <Tabs
                    defaultValue="history"
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="mt-2"
                >
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="history" className="flex items-center gap-1.5">
                            <GitCommit className="h-4 w-4" />
                            <span>{t2('history')}</span>
                        </TabsTrigger>
                        <TabsTrigger value="add-version" className="flex items-center gap-1.5">
                            <BookmarkPlus className="h-4 w-4" />
                            <span>{t2('addNamedVersion')}</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* 変更履歴タブ */}
                    <TabsContent value="history" className="space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <div className="text-sm text-muted-foreground">
                                {versions.length === 0
                                    ? t2('noVersionsFound')
                                    : `${versions.length}${t2('commits')}`}
                            </div>

                            {/* フィルター切替ボタン */}
                            <div className="flex items-center gap-1 text-xs bg-muted rounded-md p-0.5">
                                <button
                                    className={`px-2 py-1 rounded ${filter === 'all' ? 'bg-background shadow-sm' : 'hover:bg-muted-foreground/10'}`}
                                    onClick={() => setFilter('all')}
                                >
                                    {t2('allVersions')}
                                </button>
                                <button
                                    className={`px-2 py-1 rounded flex items-center gap-1 ${filter === 'named' ? 'bg-background shadow-sm' : 'hover:bg-muted-foreground/10'}`}
                                    onClick={() => setFilter('named')}
                                >
                                    <Tag className="h-3 w-3" />
                                    {t2('namedVersions')}
                                </button>
                                <button
                                    className={`px-2 py-1 rounded ${filter === 'unnamed' ? 'bg-background shadow-sm' : 'hover:bg-muted-foreground/10'}`}
                                    onClick={() => setFilter('unnamed')}
                                >
                                    {t2('unnamedVersions')}
                                </button>
                            </div>
                        </div>

                        {filteredVersions.length > 0 ? (
                            <ScrollArea className="h-[400px] pr-4">
                                <div className="space-y-3">
                                    {filteredVersions.map((version, index) => {
                                        const isCurrentVersion = version.id === institution.currentVersion
                                        const isNamedVersion = Boolean(version.tag)

                                        return (
                                            <div
                                                key={version.id}
                                                className={`p-3 rounded-md border ${isCurrentVersion ? 'bg-primary/5 border-primary/20' : 'bg-card hover:bg-accent/50'} ${isNamedVersion ? 'border-primary/30' : ''}`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1.5">
                                                            {isNamedVersion ? (
                                                                <Tag className="h-4 w-4 text-primary" />
                                                            ) : (
                                                                <GitCommit className="h-4 w-4 text-muted-foreground" />
                                                            )}

                                                            <span className="font-medium">
                                                                {isNamedVersion
                                                                    ? version.tag?.name
                                                                    : version.message?.split('\n')[0]}
                                                            </span>

                                                            {/* 現在のバージョンバッジ */}
                                                            {isCurrentVersion && (
                                                                <Badge variant="outline" className="ml-2 text-xs bg-primary/10 text-primary border-primary/20">
                                                                    {t2('currentVersion')}
                                                                </Badge>
                                                            )}

                                                            {/* 名前付きバージョンバッジ */}
                                                            {isNamedVersion && (
                                                                <Badge variant="outline" className="ml-2 text-xs bg-primary-foreground">
                                                                    {t2('namedVersion')}
                                                                </Badge>
                                                            )}
                                                        </div>

                                                        {/* メッセージや説明 */}
                                                        {isNamedVersion && version.tag?.description && (
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                {version.tag.description}
                                                            </p>
                                                        )}

                                                        {/* タイムスタンプとコミットハッシュ */}
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                            <span>{new Date(version.timestamp).toLocaleString(locale === 'en' ? 'en-US' : locale === 'fr' ? 'fr-FR' : 'ja-JP')}</span>
                                                            {version.commitHash && (
                                                                <code className="px-1 py-0.5 rounded bg-muted font-mono text-xs">
                                                                    {version.commitHash.substring(0, 7)}
                                                                </code>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* テスト結果バッジ */}
                                                    {version.testResults && (
                                                        <Badge
                                                            variant={version.testResults.success ? "outline" : "destructive"}
                                                            className={`text-xs ${version.testResults.success ? 'bg-green-50 text-green-700 border-green-200' : ''}`}
                                                        >
                                                            {version.testResults.success ? (
                                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                            ) : (
                                                                <XCircle className="h-3 w-3 mr-1" />
                                                            )}
                                                            {version.testResults.details.passed}/{version.testResults.details.total}
                                                        </Badge>
                                                    )}
                                                </div>

                                                {/* アクションボタン */}
                                                <div className="flex gap-2 mt-3">
                                                    {!isCurrentVersion && onRevertVersion && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-xs h-7"
                                                            onClick={() => onRevertVersion(version.id)}
                                                        >
                                                            {t2('revertToVersion')}
                                                        </Button>
                                                    )}

                                                    {onViewDiff && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-xs h-7"
                                                            onClick={() => onViewDiff(version)}
                                                        >
                                                            {t2('viewChanges')}
                                                        </Button>
                                                    )}

                                                    {onCompareVersions && !isCurrentVersion && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-xs h-7"
                                                            onClick={() => onCompareVersions(version)}
                                                        >
                                                            <span>{t2('compareWithCurrent')}</span>
                                                            <ArrowRight className="h-3 w-3 ml-1" />
                                                        </Button>
                                                    )}

                                                    {/* 名前を付けるボタン（名前なしバージョンの場合） */}
                                                    {!isNamedVersion && onAddNamedVersion && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-xs h-7 ml-auto"
                                                            onClick={() => {
                                                                setVersionName(version.message?.split('\n')[0] || "")
                                                                setVersionDescription("")
                                                                setActiveTab("add-version")
                                                            }}
                                                        >
                                                            <BookmarkPlus className="h-3 w-3 mr-1" />
                                                            {t2('addName')}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </ScrollArea>
                        ) : (
                            <div className="py-8 text-center text-muted-foreground">
                                <GitBranch className="h-10 w-10 mx-auto opacity-20 mb-2" />
                                <p>{t2('noVersionsFound')}</p>
                            </div>
                        )}
                    </TabsContent>

                    {/* 名前付きバージョン作成タブ */}
                    <TabsContent value="add-version" className="space-y-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="versionName">{t2('versionName')}</Label>
                                <Input
                                    id="versionName"
                                    value={versionName}
                                    onChange={(e) => setVersionName(e.target.value)}
                                    placeholder="例: v1.0.0 / 市民税シミュレーター完成"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="versionDescription">{t2('versionDescription')}</Label>
                                <Textarea
                                    id="versionDescription"
                                    value={versionDescription}
                                    onChange={(e) => setVersionDescription(e.target.value)}
                                    placeholder="このバージョンでの変更内容について記述してください"
                                    rows={4}
                                />
                            </div>

                            <Button
                                onClick={handleAddNamedVersion}
                                disabled={!versionName.trim()}
                                className="w-full"
                            >
                                <BookmarkPlus className="h-4 w-4 mr-2" />
                                {t2('saveWithName')}
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
