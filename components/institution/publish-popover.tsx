"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Check, Globe, Lock, Users, ArrowRight, X } from "lucide-react"
import type { Institution } from "@/lib/types"

interface PublishPopoverProps {
  isOpen: boolean
  onClose: () => void
  institution: Institution
  onPublish: (institution: Institution, visibility: string) => Promise<void>
  anchorRect?: DOMRect | null
}

/**
 * 制度の公開設定を行うポップオーバーコンポーネント
 */
export function PublishPopover({ isOpen, onClose, institution, onPublish, anchorRect }: PublishPopoverProps) {
  const [visibility, setVisibility] = useState<string>("private")
  const [copied, setCopied] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("settings")
  const popoverRef = useRef<HTMLDivElement>(null)

  // 共有URLの生成（実際の実装ではAPIから取得するなど）
  const shareUrl = `https://openfisca-editor.example.com/share/${institution.id}`

  // ポップオーバーの位置を計算
  const getPopoverStyle = () => {
    if (!anchorRect) return {}

    return {
      position: "fixed" as const,
      top: `${anchorRect.bottom + window.scrollY + 10}px`,
      left: `${anchorRect.left + window.scrollX}px`,
      zIndex: 50,
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    try {
      await onPublish(institution, visibility)
      setActiveTab("link")
    } catch (error) {
      console.error("Failed to publish institution:", error)
      alert("公開に失敗しました。")
    } finally {
      setIsPublishing(false)
    }
  }

  // クリックイベントのハンドラ
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={popoverRef}
      style={getPopoverStyle()}
      className="bg-background border rounded-lg shadow-lg w-[400px] animate-in fade-in-0 zoom-in-95"
    >
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-semibold text-lg">制度を公開</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-4 pt-4">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="settings">公開設定</TabsTrigger>
            <TabsTrigger value="link" disabled={activeTab !== "link"}>
              共有リンク
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="settings" className="p-4 space-y-4">
          <div className="space-y-4">
            <h4 className="font-medium">公開範囲</h4>
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

          <div className="flex justify-end pt-4">
            <Button onClick={handlePublish} disabled={isPublishing} className="gap-2">
              {isPublishing ? "公開中..." : "公開する"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="link" className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="share-link">共有リンク</Label>
            <div className="flex items-center space-x-2">
              <Input id="share-link" value={shareUrl} readOnly className="font-mono text-sm" />
              <Button type="button" size="icon" variant="outline" onClick={handleCopyLink} className="flex-shrink-0">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              このリンクを共有して、他のユーザーにこの制度へのアクセスを許可します。
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={onClose}>完了</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

