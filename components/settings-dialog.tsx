"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Globe,
  User,
  Database,
  Cloud,
  Moon,
  Sun,
  Monitor,
  FileUp,
  FileDown,
  AlertTriangle,
  Copy,
  RefreshCw,
  FileText,
  Book,
  HelpCircle,
  Code,
  Layers,
  Settings,
  Compass,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useI18n, type Locale } from "@/lib/i18n"
import Link from "next/link"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { locale, t, changeLocale } = useI18n()
  const { theme, setTheme } = useTheme()
  const [localStorageUsage, setLocalStorageUsage] = useState<string>("0 KB")
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isClearDataDialogOpen, setIsClearDataDialogOpen] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)

  // ダミーデータ
  const userData = {
    name: "ユーザー名",
    email: "user@example.com",
    accountType: "free",
    apiKey: "opf_" + Math.random().toString(36).substring(2, 15),
    lastSynced: null,
  }

  // ドキュメント一覧
  const documents = [
    { id: "user-guide", name: "ユーザーガイド", icon: <Book className="h-4 w-4" />, path: "/docs/user-guide" },
    { id: "openfisca-concepts", name: "OpenFisca概念", icon: <Compass className="h-4 w-4" />, path: "/docs/openfisca-concepts" },
    { id: "openfisca-file-guide", name: "ファイル作成ガイド", icon: <FileText className="h-4 w-4" />, path: "/docs/openfisca-file-guide" },
    { id: "installation", name: "インストールガイド", icon: <Settings className="h-4 w-4" />, path: "/docs/installation" },
    { id: "architecture", name: "アーキテクチャ", icon: <Layers className="h-4 w-4" />, path: "/docs/architecture" },
    { id: "api-reference", name: "APIリファレンス", icon: <Code className="h-4 w-4" />, path: "/docs/api-reference" },
  ]

  // ローカルストレージの使用量を計算
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        let total = 0
        for (const key in localStorage) {
          if (localStorage.hasOwnProperty(key)) {
            total += localStorage[key].length * 2 // UTF-16 文字列は 2 バイト/文字
          }
        }

        // バイト -> キロバイト -> メガバイト
        if (total > 1024 * 1024) {
          setLocalStorageUsage(`${(total / (1024 * 1024)).toFixed(2)} MB`)
        } else if (total > 1024) {
          setLocalStorageUsage(`${(total / 1024).toFixed(2)} KB`)
        } else {
          setLocalStorageUsage(`${total} B`)
        }
      } catch (e) {
        setLocalStorageUsage("計算できません")
      }
    }
  }, [])

  const handleLanguageChange = (value: string) => {
    changeLocale(value as Locale)
  }

  const handleThemeChange = (value: string) => {
    setTheme(value)
  }

  const handleCopyApiKey = () => {
    navigator.clipboard
      .writeText(userData.apiKey)
      .then(() => alert("APIキーをコピーしました"))
      .catch(() => alert("APIキーのコピーに失敗しました"))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // ファイルの読み込み処理（実際の実装では、ファイルを読み込んでデータをインポートする）
    alert(`${file.name} を選択しました。実際のインポート処理はまだ実装されていません。`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.settings.title}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="language" className="w-full">
          <TabsList className="grid grid-cols-6 mb-4">
            <TabsTrigger value="language" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>{t.settings.language}</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{t.settings.account}</span>
            </TabsTrigger>
            <TabsTrigger value="storage" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span>{t.settings.dataStorage}</span>
            </TabsTrigger>
            <TabsTrigger value="theme" className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              <span>{t.settings.theme}</span>
            </TabsTrigger>
            <TabsTrigger value="docs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>ドキュメント</span>
            </TabsTrigger>
            <TabsTrigger value="danger" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span>{t.settings.dangerZone}</span>
            </TabsTrigger>
          </TabsList>

          {/* 言語設定 */}
          <TabsContent value="language" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t.settings.language}</CardTitle>
                <CardDescription>アプリケーションの表示言語を選択してください。</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={locale} onValueChange={handleLanguageChange} className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ja" id="ja" />
                    <Label htmlFor="ja">{t.settings.japanese}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="en" id="en" />
                    <Label htmlFor="en">{t.settings.english}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fr" id="fr" />
                    <Label htmlFor="fr">{t.settings.french}</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </TabsContent>

          {/* アカウント設定 */}
          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t.settings.profile}</CardTitle>
                <CardDescription>アカウント情報を管理します。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t.settings.name}</Label>
                  <Input id="name" value={userData.name} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t.settings.email}</Label>
                  <Input id="email" value={userData.email} disabled />
                </div>
                <div className="space-y-2">
                  <Label>{t.settings.accountType}</Label>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {userData.accountType === "free" ? t.settings.free : t.settings.premium}
                      </span>
                      {userData.accountType === "free" && (
                        <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                          {t.settings.free}
                        </span>
                      )}
                      {userData.accountType === "premium" && (
                        <span className="bg-yellow-500/10 text-yellow-500 text-xs px-2 py-0.5 rounded-full">
                          {t.settings.premium}
                        </span>
                      )}
                    </div>
                    {userData.accountType === "free" && (
                      <Button size="sm" disabled>
                        {t.settings.upgrade}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t.settings.apiSettings}</CardTitle>
                <CardDescription>OpenFisca APIとの連携に使用するAPIキーを管理します。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">{t.settings.apiKey}</Label>
                  <div className="flex gap-2">
                    <Input id="apiKey" value={userData.apiKey} readOnly className="font-mono" />
                    <Button variant="outline" size="icon" onClick={handleCopyApiKey} title="コピー">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" disabled title="再生成">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* データストレージ設定 */}
          <TabsContent value="storage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t.settings.dataStorage}</CardTitle>
                <CardDescription>データの保存方法と同期設定を管理します。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-medium">{t.settings.localStorageUsed}</h4>
                    <p className="text-sm text-muted-foreground">{localStorageUsage}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div>
                    <h4 className="text-sm font-medium">{t.settings.cloudSync}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t.settings.lastSynced}:{" "}
                      {userData.lastSynced ? new Date(userData.lastSynced).toLocaleString() : t.settings.never}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={cloudSyncEnabled} onCheckedChange={setCloudSyncEnabled} disabled />
                    <Button size="sm" disabled className="gap-1">
                      <Cloud className="h-4 w-4" />
                      {t.settings.syncNow}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t.settings.exportImport}</CardTitle>
                <CardDescription>データのエクスポートとインポートを行います。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button variant="outline" className="gap-1" disabled>
                    <FileDown className="h-4 w-4" />
                    {t.settings.exportAllData}
                  </Button>

                  <div className="relative">
                    <Button variant="outline" className="gap-1" disabled>
                      <FileUp className="h-4 w-4" />
                      {t.settings.importData}
                    </Button>
                    <Input
                      type="file"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleFileUpload}
                      disabled
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* テーマ設定 */}
          <TabsContent value="theme" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t.settings.theme}</CardTitle>
                <CardDescription>アプリケーションの表示テーマを選択してください。</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={theme || "system"} onValueChange={handleThemeChange} className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light" className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      {t.settings.light}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="dark" />
                    <Label htmlFor="dark" className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      {t.settings.dark}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="system" />
                    <Label htmlFor="system" className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      {t.settings.system}
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ドキュメント */}
          <TabsContent value="docs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>ドキュメント</CardTitle>
                <CardDescription>OpenFisca Editorのドキュメントを確認できます。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {documents.map((doc) => (
                    <Link href={doc.path} key={doc.id} target="_blank" rel="noopener noreferrer">
                      <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                        <CardHeader className="py-4">
                          <CardTitle className="text-base flex items-center gap-2">
                            {doc.icon}
                            {doc.name}
                          </CardTitle>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 危険ゾーン */}
          <TabsContent value="danger" className="space-y-4">
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">{t.settings.dangerZone}</CardTitle>
                <CardDescription>これらの操作は元に戻せません。慎重に行ってください。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-medium">{t.settings.clearAllData}</h4>
                    <p className="text-sm text-muted-foreground">{t.settings.clearAllDataDescription}</p>
                  </div>
                  <AlertDialog open={isClearDataDialogOpen} onOpenChange={setIsClearDataDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="text-destructive border-destructive/30 hover:bg-destructive/10"
                      >
                        {t.settings.clearAllData}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t.settings.clearAllData}</AlertDialogTitle>
                        <AlertDialogDescription>{t.settings.clearAllDataDescription}</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          {t.settings.clearAllData}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div>
                    <h4 className="text-sm font-medium">{t.settings.deleteAccount}</h4>
                    <p className="text-sm text-muted-foreground">{t.settings.deleteAccountDescription}</p>
                  </div>
                  <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">{t.settings.deleteAccount}</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t.settings.deleteAccount}</AlertDialogTitle>
                        <AlertDialogDescription>{t.settings.deleteAccountDescription}</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          {t.settings.deleteAccount}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
