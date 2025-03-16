"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SimulationPanel } from "@/components/simulation-panel"
import { Copy, Check, Globe, Lock, Users, ArrowRight } from "lucide-react"
import type { Institution } from "@/lib/types"

interface PublishDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  institution: Institution
  onPublish: (institution: Institution, visibility: string) => Promise<void>
}

export function PublishDialog({ open, onOpenChange, institution, onPublish }: PublishDialogProps) {
  const [visibility, setVisibility] = useState<string>("private")
  const [copied, setCopied] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("simulation")

  // 共有URLの生成（実際の実装ではAPIから取得するなど）
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const shareUrl = `${baseUrl}/institutions/${institution.id}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    try {
      await onPublish(institution, visibility)
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to publish institution:", error)
      alert("公開に失敗しました。")
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>制度を公開</DialogTitle>
          <DialogDescription>シミュレーション結果を確認し、公開設定を行ってください。</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="simulation">シミュレーション</TabsTrigger>
            <TabsTrigger value="settings">公開設定</TabsTrigger>
          </TabsList>

          <TabsContent value="simulation" className="space-y-4">
            <SimulationPanel institution={institution} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4">
              <h3 className="font-medium">公開範囲</h3>
              <RadioGroup value={visibility} onValueChange={setVisibility} className="space-y-3">
                <div className="flex items-start space-x-3 rounded-md border p-3">
                  <RadioGroupItem value="private" id="private" className="mt-1" />
                  <div className="space-y-1">
                    <Label htmlFor="private" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      非公開
                    </Label>
                    <p className="text-sm text-muted-foreground">あなただけがアクセスできます。</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 rounded-md border p-3">
                  <RadioGroupItem value="restricted" id="restricted" className="mt-1" />
                  <div className="space-y-1">
                    <Label htmlFor="restricted" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      限定公開
                    </Label>
                    <p className="text-sm text-muted-foreground">リンクを知っている人だけがアクセスできます。</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 rounded-md border p-3">
                  <RadioGroupItem value="public" id="public" className="mt-1" />
                  <div className="space-y-1">
                    <Label htmlFor="public" className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      公開
                    </Label>
                    <p className="text-sm text-muted-foreground">誰でもアクセスできます。検索結果にも表示されます。</p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2 mt-6">
              <Label>共有リンク</Label>
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly className="font-mono text-sm" />
                <Button variant="outline" className="shrink-0 gap-2" onClick={handleCopyLink}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "コピー済み" : "コピー"}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                公開後、このリンクを共有して他のユーザーに制度へのアクセスを許可できます。
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handlePublish} disabled={isPublishing} className="gap-2">
                {isPublishing ? "公開中..." : "公開する"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

